import { Localized } from '@fluent/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import NavigationPrompt from 'react-router-navigation-prompt';

import { Clip as ClipType } from 'common';
import { trackListening, getTrackClass } from '../../../../services/tracker';
import { Clips } from '../../../../stores/clips';
import { Locale } from '../../../../stores/locale';
import { User } from '../../../../stores/user';
import {
  AbortContributionModalActions,
  AbortContributionModalStatus,
} from '../../../../stores/abort-contribution-modal'
import StateTree from '../../../../stores/tree'
import API from '../../../../services/api'
import URLS from '../../../../urls'
import {
  CheckIcon,
  CrossIcon,
  OldPlayIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  VolumeIcon,
} from '../../../ui/icons'
import { Button, Spinner } from '../../../ui/ui'
import ContributionPage, {
  ContributionPillProps,
  SET_COUNT,
} from '../contribution'
import { Notifications } from '../../../../stores/notifications'
import { PlayButton } from '../../../primary-buttons/primary-buttons'
import Pill from '../pill'
import ListenErrorContent from './listen-error-content'
import Modal, { ModalButtons } from '../../../modal/modal'

import './listen.css'
import ClipsContainer from './ClipsContainer';
import LanguageSelect from './LanguageSelect';

const VOTE_NO_PLAY_MS = 3000 // Threshold when to allow voting no

export const VoteButton = ({
  kind,
  ...props
}: { kind: 'yes' | 'no' } & React.ButtonHTMLAttributes<any>) => (
  <button
    type="button"
    className={['vote-button', kind, getTrackClass('fs', `vote-${kind}`)].join(
      ' '
    )}
    {...props}>
    {kind === 'yes' && <ThumbsUpIcon />}
    {kind === 'no' && <ThumbsDownIcon />}
    <Localized id={'vote-' + kind}>
      <span />
    </Localized>
  </button>
)

interface PropsFromState {
  api: API;
  clips: ClipType[];
  isLoading: boolean;
  hasLoadingError: boolean;
  locale: Locale.State;
  user: User.State;
  showFirstContributionToast: boolean;
  hasEarnedSessionToast: boolean;
  showFirstStreakToast: boolean;
  challengeEnded: boolean;
}

interface PropsFromDispatch {
  loadClips: typeof Clips.actions.refillCache
  removeClip: typeof Clips.actions.remove
  vote: typeof Clips.actions.vote
  addAchievement: typeof Notifications.actions.addAchievement
  setAbortContributionModalVisible: typeof AbortContributionModalActions.setAbortContributionModalVisible
  setAbortStatus: typeof AbortContributionModalActions.setAbortStatus
}

interface Props
  extends PropsFromState,
  PropsFromDispatch,
  RouteComponentProps { }

interface State {
  clips: (ClipType & { isValid?: boolean })[]
  hasPlayed: boolean
  hasPlayedSome: boolean
  isPlaying: boolean
  isSubmitted: boolean
  votedNo: boolean
  errorMessage: boolean
}

const initialState: State = {
  clips: [],
  hasPlayed: false,
  hasPlayedSome: false,
  isPlaying: false,
  isSubmitted: false,
  votedNo: false,
  errorMessage: false
}

interface Language {
  id: number;
  code: string; // The two-letter language code
}

const languages: Language[] = [
  { id: 0, code: 'en' },
  { id: 1, code: 'ar' },
  // Add more languages
];

class ListenPage extends React.Component<Props, State> {
  audioRef = React.createRef<HTMLAudioElement>()
  playedSomeInterval: any

  state: State = initialState
  demoMode = this.props.location.pathname.includes(URLS.DEMO)

  static getDerivedStateFromProps(props: Props, state: State) {
    if (JSON.stringify(props.clips) != JSON.stringify(state.clips)) {
      return {
        clips: props.clips
          .slice(0, SET_COUNT)
          .map(clip => ({ ...clip, isValid: null })),
      }
    }

    if (state.clips.length > 0) return null // if there are clips, dont update state

    if (props.clips && props.clips.length > 0) {
      return {
        clips: props.clips
          .slice(0, SET_COUNT)
          .map(clip => ({ ...clip, isValid: null })),
      }
    }

    return null
  }

  componentDidMount() {
    const { loadClips } = this.props

    const lang = sessionStorage.getItem('language') ?? 'en'
    loadClips(lang)

  }

  componentWillUnmount() {
    clearInterval(this.playedSomeInterval)
    // this.audioPlayer.close();
  }

  private getClipIndex() {
    return this.state.clips.findIndex(clip => clip.isValid === null) //voted
  }

  private play = () => {
    if (this.state.isPlaying) {
      this.stop()
      return
    }

    this.audioRef.current.play()
    this.setState({ isPlaying: true })
    clearInterval(this.playedSomeInterval)

    this.playedSomeInterval = setInterval(
      () => this.setState({ hasPlayedSome: true }),
      VOTE_NO_PLAY_MS
    )
  }

  private stop = () => {
    if (this.state.isPlaying) {
      const audio = this.audioRef.current
      audio.pause()
      audio.currentTime = 0
      clearInterval(this.playedSomeInterval)
      this.setState({ isPlaying: false })
    }
  }

  private hasPlayed = () => {
    this.setState({ hasPlayed: true, isPlaying: false })
    trackListening('listen', this.props.locale)
  }

  private vote = (isValid: boolean, transcription?: string) => {
    const { clips } = this.state
    const clipIndex = this.getClipIndex() // voted

    this.stop()
    this.props.vote(isValid, this.state.clips[this.getClipIndex()].id, transcription ?? this.state.clips[this.getClipIndex()].sentence.text) //used to call db operation on votes table

    //setting the state changes the UI to move on to the next clip
    this.setState({
      votedNo: false,
      hasPlayed: false,
      hasPlayedSome: false,
      isPlaying: false,
      isSubmitted: clipIndex === SET_COUNT - 1,
      clips: clips.map((clip, i) =>
        i === clipIndex ? { ...clip, isValid } : clip,
      ),
    })
  }

  private voteYes = () => {
    if (!this.state.hasPlayed) {
      return
    }

    this.vote(true)
    trackListening('vote-yes', this.props.locale)
  }

  private voteNo = () => {
    const { hasPlayed, hasPlayedSome } = this.state
    if (!hasPlayed && !hasPlayedSome) {
      return
    }

    this.setState({ votedNo: true })
    trackListening('vote-no', this.props.locale)
  }

  private handleSkip = () => {
    const { removeClip, api } = this.props
    const { clips } = this.state
    this.stop()
    api.skipClip(clips[this.getClipIndex()].id)
    removeClip(clips[this.getClipIndex()].id)

    let replacementSet = [...clips]

    // If there's more in the cache, replace current clip with the next one from cache
    if (this.props.clips.length > SET_COUNT) {
      replacementSet[this.getClipIndex()] = {
        ...this.props.clips.slice(SET_COUNT)[0],
        isValid: null,
      }
    } else {
      // else, remove current clip and shift the remainder up
      replacementSet = [
        ...replacementSet.slice(0, this.getClipIndex()),
        ...replacementSet.slice(this.getClipIndex() + 1),
      ]
    }

    this.setState({
      clips: replacementSet,
      hasPlayed: false,
      hasPlayedSome: false,
    })
  }

  private reset = () => this.setState(initialState)

  private setAbortContributionModalVisiblity = (
    abortContributionModalVisibilty: boolean
  ) => {
    const { setAbortContributionModalVisible } = this.props
    setAbortContributionModalVisible(abortContributionModalVisibilty)
  }

  private handleAbortCancel = (onCancel: () => void) => {
    onCancel()
    this.props.setAbortStatus(AbortContributionModalStatus.REJECTED)
    this.setAbortContributionModalVisiblity(false)
  }

  private handleAbortConfirm = (onConfirm: () => void) => {
    onConfirm()
    this.props.setAbortStatus(AbortContributionModalStatus.CONFIRMED)
    this.setAbortContributionModalVisiblity(false)
  }

  private handleSubmit = (text: string) => {
    if (text.trim() === '') {
      this.setState({ errorMessage: true });
    } else {
      this.vote(false, text)
      this.setState({ votedNo: false })
    }
  };

  private handleResetVote = () => { this.setState({ votedNo: false }) }

  private handleLanguageSelect = (language: string) => {
    const { loadClips } = this.props
    loadClips(language)
  };

  render() {
    const { isLoading, hasLoadingError, user, locale, api } = this.props;
    const { clips, hasPlayed, hasPlayedSome, isPlaying, isSubmitted, votedNo, errorMessage } = this.state;
    const clipIndex = this.getClipIndex();
    const activeClip = clipIndex >= 0 ? clips[clipIndex] : null
    const noClips = clips.length === 0;
    const isMissingClips = !isLoading && (noClips || !activeClip);
    const currentLocale = user?.account?.languages.find(
      lang => lang.locale === locale
    );
    const isVariantPreferredOption = currentLocale?.variant?.is_preferred_option;


    return (
      <>
        <div id="listen-page">
          {/* clip length is {clips.length} */}
          {/* userId is {user.userId}*/}
          {/* <ClipsContainer clips={clips} /> */}
          {/* 
          <div style={{width: '100%', height: "20px"}}></div>
          {JSON.stringify(this.props.clips)}
          <div style={{width: '100%', height: "20px"}}></div>
          {JSON.stringify(clips)} */}

          {/* {JSON.stringify(user.userId)} */}

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '45.7rem', display: 'flex', justifyContent: 'end' }}>
              <LanguageSelect onSelectLanguage={this.handleLanguageSelect} api={api} />
            </div>
          </div>

          {noClips && isLoading && <Spinner delayMs={500} />}
          {!isSubmitted && (
            <NavigationPrompt
              when={() => {

                const isUnvalidatedClips = clips.some(
                  clip => clip.isValid !== null
                )

                if (isUnvalidatedClips) {
                  this.setAbortContributionModalVisiblity(true)
                }
                return isUnvalidatedClips
              }}>
              {({ onCancel, onConfirm }) => {

                return (
                  <Modal
                    innerClassName="listen-abort"
                    onRequestClose={() => this.handleAbortCancel(onCancel)}>
                    <Localized id="listen-abort-title">
                      <h1 className="title" />
                    </Localized>
                    <Localized id="record-abort-text">
                      <p className="text" />
                    </Localized>
                    <ModalButtons>
                      <Localized id="listen-abort-cancel">
                        <Button
                          outline
                          rounded
                          onClick={() => this.handleAbortCancel(onCancel)}
                        />
                      </Localized>
                      <Localized id="listen-abort-confirm">
                        <Button
                          outline
                          rounded
                          onClick={() => this.handleAbortConfirm(onConfirm)}
                        />
                      </Localized>
                    </ModalButtons>
                  </Modal>
                )
              }}
            </NavigationPrompt>
          )}
          <audio
            {...(activeClip && { src: activeClip.audioSrc })}
            preload="auto"
            onEnded={this.hasPlayed}
            ref={this.audioRef}
          />
          <ContributionPage
            errorMessage={errorMessage}
            handleSubmit={text => this.handleSubmit(text)}
            handleResetVote={this.handleResetVote}
            votedNo={votedNo}
            activeIndex={clipIndex}
            demoMode={this.demoMode}
            hasErrors={!isLoading && (isMissingClips || hasLoadingError)}
            errorContent={
              <ListenErrorContent
                isLoading={isLoading}
                hasLoadingError={hasLoadingError}
                isMissingClips={isMissingClips}
                isDemoMode={this.demoMode}
                isMissingClipsForVariant={
                  isMissingClips && isVariantPreferredOption
                }
              />
            }
            instruction={props =>
              activeClip &&
              !isPlaying &&
              !hasPlayedSome &&
              !hasPlayed && (
                <Localized
                  id={
                    clipIndex === SET_COUNT - 1
                      ? 'listen-last-time-instruction'
                      : [
                        'listen-instruction',
                        'listen-again-instruction',
                        'listen-3rd-time-instruction',
                      ][clipIndex] || 'listen-again-instruction'
                  }
                  elems={{ playIcon: <OldPlayIcon /> }}
                  {...props}
                />
              )
            }
            isPlaying={isPlaying}
            isSubmitted={isSubmitted}
            onReset={this.reset}
            onSkip={this.handleSkip}
            primaryButtons={
              <>
                <VoteButton
                  kind="yes"
                  onClick={this.voteYes}
                  disabled={!hasPlayed}
                  data-testid="vote-yes-button"
                />
                <PlayButton
                  isPlaying={isPlaying}
                  onClick={this.play}
                  trackClass="play-clip"
                  data-testid="play-button"
                />
                <VoteButton
                  kind="no"
                  onClick={this.voteNo}
                  disabled={!hasPlayed && !hasPlayedSome}
                  data-testid="vote-no-button"
                />
              </>
            }
            playButton={
              <PlayButton
                isPlaying={isPlaying}
                onClick={this.play}
                trackClass="play-clip"
                data-testid="play-button"
                style={{ width: "10px", height: '10px' }}
              />
            }
            pills={clips.map(
              ({ isValid }, i) =>
                (props: ContributionPillProps) => {
                  const isVoted = isValid !== null
                  const isActive = clipIndex === i
                  return (
                    <Pill
                      className={isVoted ? (isValid ? 'valid' : 'invalid') : ''}
                      onClick={null}
                      status={
                        isActive ? 'active' : isVoted ? 'done' : 'pending'
                      }
                      {...props}>
                      {isActive ? (
                        <VolumeIcon />
                      ) : isVoted ? (
                        isValid ? (
                          <CheckIcon />
                        ) : (
                          <CrossIcon />
                        )
                      ) : null}
                    </Pill>
                  )
                }
            )}
            reportModalProps={{
              reasons: [
                'offensive-speech',
                'grammar-or-spelling',
                'different-language',
              ],
              kind: 'clip',
              id: activeClip ? activeClip.id : null,
            }}
            sentences={clips.map(clip => clip.sentence)}
            shortcuts={[

            ]}
            type="listen"
            clips={clips}
          />
        </div>
      </>
    )
  }
}

const mapStateToProps = (state: StateTree) => {
  const {
    clips,
    isLoading,
    hasLoadingError,
    showFirstContributionToast,
    hasEarnedSessionToast,
    showFirstStreakToast,
    challengeEnded,
  } = Clips.selectors.localeClips(state)
  const { api } = state
  return {
    clips,
    isLoading,
    hasLoadingError,
    showFirstContributionToast,
    hasEarnedSessionToast,
    showFirstStreakToast,
    challengeEnded,
    api,
    locale: state.locale,
    user: state.user,
  };
};

const mapDispatchToProps = {
  loadClips: Clips.actions.refillCache,
  removeClip: Clips.actions.remove,
  vote: Clips.actions.vote,
  addAchievement: Notifications.actions.addAchievement,
  setAbortContributionModalVisible: AbortContributionModalActions.setAbortContributionModalVisible,
  setAbortStatus: AbortContributionModalActions.setAbortStatus,
}

export default connect<PropsFromState, any>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ListenPage))




// {
//   key: 'shortcut-play-toggle',
//   label: 'shortcut-play-toggle-label',
//   action: this.play,
// },
// {
//   key: 'shortcut-vote-yes',
//   label: 'vote-yes',
//   action: this.voteYes,
// },
// {
//   key: 'shortcut-vote-no',
//   label: 'vote-no',
//   action: this.voteNo,
// },