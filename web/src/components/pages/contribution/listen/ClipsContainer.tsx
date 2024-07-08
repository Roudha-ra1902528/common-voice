import { Sentence } from 'common/js/clips';
import React, { useEffect } from 'react';

interface Clip {
  id: string;
  glob: string;
  sentence: Sentence;
  audioSrc: string;
  isValid?: boolean;
}

interface ClipsContainerProps {
  clips: Clip[];
}

const ClipsContainer: React.FC<ClipsContainerProps> = ({ clips }) => {
  useEffect(() => {
    console.log('Component did mount');

    return () => {
      console.log('Component will unmount');
    };
  }, []);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    overflowX: 'auto',
    padding: '10px',
  };

  const cardStyle: React.CSSProperties = {
    minWidth: '200px',
    maxHeight: '200px', // Set a max height for the card
    margin: '10px',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
    overflowY: 'auto', // Allow vertical scrolling within the card
  };

  return (
    <div style={containerStyle}>
      {clips.map(clip => (
        <div key={clip.id} style={cardStyle}>
          <p><strong>id:</strong> {clip.id}</p>
          <p><strong>glob:</strong> {clip.glob}</p>
          <p><strong>sentence:</strong> {JSON.stringify(clip.sentence)}</p>
          <p><strong>audioSrc:</strong> {clip.audioSrc}</p>
          <p><strong>isValid:</strong> {clip.isValid ?? 'noIsValid'}</p>
        </div>
      ))}
    </div>
  );
};

export default ClipsContainer;
