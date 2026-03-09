import React from 'react';

interface NumberTickerProps {
  value: number;
  className?: string;
}

const NumberTicker: React.FC<NumberTickerProps> = ({ value, className }) => {
  return <span className={className}>{value?.toLocaleString('is-IS') ?? '0'}</span>;
};

export default NumberTicker;
