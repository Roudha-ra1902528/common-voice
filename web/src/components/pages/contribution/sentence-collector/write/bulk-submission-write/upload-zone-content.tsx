import React, { useState } from 'react'
import { Localized } from '@fluent/react'
import { filesize } from 'filesize'

import { CloseIcon, FileIcon, UploadIconLarge } from '../../../../../ui/icons'
import { Button, LabeledCheckbox, Spinner } from '../../../../../ui/ui'
import { FileInfo } from '../../../../../../hooks/use-bulk-submission-upload'
import { PrimaryButton } from '../../../../../primary-buttons/primary-buttons'
import BulkUploadInstruction from './bulk-upload-instruction'
import { BulkUploadStatus } from 'common'

type Props = {
  isDragActive: boolean
  uploadStatus: BulkUploadStatus
  fileInfo: FileInfo
  abortBulkSubmissionRequest: () => void
  removeBulkSubmission: () => void
  startUpload: () => void
}

const UploadZoneContent: React.FC<Props> = ({
  isDragActive,
  uploadStatus,
  fileInfo,
  abortBulkSubmissionRequest,
  removeBulkSubmission,
  startUpload,
}) => {
  const [confirmPublicDomain, setConfirmPublicDomain] = useState(false)

  const handleConfirmPublicDomainChange = () => {
    setConfirmPublicDomain(!confirmPublicDomain)
  }

  if (uploadStatus === 'waiting' && fileInfo) {
    return (
      <div className="waiting-container">
        <CloseIcon onClick={removeBulkSubmission} black className="icon" />
        <div className="file-icon-container">
          <FileIcon />
        </div>
        <p className="file-name">{fileInfo?.name}</p>
        <p className="file-size">
          {filesize(fileInfo?.size)} • {fileInfo?.lastModified}
        </p>
        <LabeledCheckbox
          label={
            <Localized
              id="sc-bulk-submit-confirm"
              elems={{
                wikipediaLink: (
                  <a
                    href="https://en.wikipedia.org/wiki/Public_domain"
                    target="_blank"
                    rel="noreferrer"
                  />
                ),
              }}>
              <span />
            </Localized>
          }
          checked={confirmPublicDomain}
          onChange={handleConfirmPublicDomainChange}
        />
        <Localized id="submit-form-action">
          <PrimaryButton
            className="submit"
            onClick={startUpload}
            disabled={!confirmPublicDomain}
            data-testid="submit-button"
          />
        </Localized>
      </div>
    )
  }

  if (uploadStatus === 'uploading' && fileInfo) {
    return (
      <div className="uploading-container">
        <CloseIcon
          onClick={abortBulkSubmissionRequest}
          black
          className="icon"
        />
        <Spinner isFloating={false} />
        <Localized id="upload-progress-text">
          <p className="upload-progress-text" />
        </Localized>
        <p className="file-name">{fileInfo?.name}</p>
        <p className="file-size">
          {filesize(fileInfo?.size)} • {fileInfo?.lastModified}
        </p>
      </div>
    )
  }

  if (uploadStatus === 'done') {
    return <h1>Done...</h1>
  }

  return (
    <>
      <UploadIconLarge />
      <BulkUploadInstruction
        isDragActive={isDragActive}
        isUploadError={uploadStatus === 'error'}
      />
      <Localized id="or-conjuction">
        <p className="or-conjunction hidden-md-down" />
      </Localized>
      <Button className="hidden-md-down">
        <Localized id="select-file" />
      </Button>
      <Button className="hidden-lg-up">
        <Localized id="select-file-mobile" />
      </Button>
      <div className="file-restrictions">
        <Localized id="accepted-files">
          <p />
        </Localized>
        <Localized id="maximum-file-size">
          <p />
        </Localized>
      </div>
    </>
  )
}
export default UploadZoneContent
