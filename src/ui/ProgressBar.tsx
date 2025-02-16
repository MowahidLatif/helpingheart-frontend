import React from 'react';

interface ProgressBarProps {
  current: number;
  goal: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, goal }) => {
  const percentage = (current / goal) * 100;

  return (
    <div style={{ width: '100%', background: '#ccc', borderRadius: '5px' }}>
      <div
        style={{
          width: `${percentage}%`,
          background: 'green',
          height: '20px',
          borderRadius: '5px',
        }}
      />
    </div>
  );
};

export default ProgressBar;
