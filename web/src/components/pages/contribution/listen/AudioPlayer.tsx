import React, { useRef, useState } from 'react';

interface AudioPlayerProps {
  src: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div>
      <audio src={src} ref={audioRef} onEnded={handleEnded} preload="auto" />
      <div>
        <button onClick={playAudio} disabled={isPlaying}>
          Play
        </button>
        <button onClick={pauseAudio} disabled={!isPlaying}>
          Pause
        </button>
        <button onClick={stopAudio}>
          Stop
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;
