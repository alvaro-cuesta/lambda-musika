import React, { useRef } from 'react';
import { toMinsSecs } from '../../utils/time.js';
import styles from './TimeSlider.module.scss';

type TimeSliderProps = {
  length: number;
  value: number;
  onChange?: (value: number) => void;
} & Omit<
  React.HTMLAttributes<HTMLInputElement>,
  | 'type'
  | 'min'
  | 'max'
  | 'value'
  | 'onChange'
  | 'onMouseDown'
  | 'onMouseUp'
  | 'onMouseMove'
  | 'children'
>;

// A slider component to seek time
export function TimeSlider({
  length = 0,
  value = 0,
  onChange,
  ...other
}: TimeSliderProps) {
  const isSliding = useRef(false);

  // Regular change event
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(Number(e.currentTarget.value));
  };

  // Also allow changing value by sliding
  const handleMouseDown = () => {
    isSliding.current = true;
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    isSliding.current = false;
    onChange?.(Number(e.currentTarget.value));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLInputElement>) => {
    if (isSliding.current && onChange) {
      onChange(Number(e.currentTarget.value));
    }
  };

  return (
    <div className={styles.container}>
      {toMinsSecs(Math.floor(value))}

      <input
        {...other}
        type="range"
        min={0}
        max={length}
        value={value}
        onChange={handleChange}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      />

      {toMinsSecs(length)}
    </div>
  );
}
