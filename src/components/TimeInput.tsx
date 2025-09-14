import cx from 'classnames';
import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import styles from './TimeInput.module.scss';

function parseInput(str: string) {
  const n = parseInt(str, 10);
  return isNaN(n) ? 0 : n;
}

type TimeInputProps = {
  value: number;
  onChange?: ((value: number) => void) | undefined;
  isTicking?: boolean | undefined;
};

export const TimeInput = ({
  value,
  onChange,
  isTicking = false,
}: TimeInputProps) => {
  const minRef = useRef<HTMLInputElement>(null);
  const secRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (newMin: number, newSec: number) => {
      const totalSeconds = Math.max(0, newMin * 60 + newSec);
      const m = Math.floor(totalSeconds / 60);
      const s = ((totalSeconds % 60) + 60) % 60; // ensures 0–59
      onChange?.(m * 60 + s);
    },
    [onChange],
  );

  const handleInputChange = useCallback(() => {
    const m = parseInput(minRef.current?.value ?? '00');
    const s = parseInput(secRef.current?.value ?? '00');
    handleChange(m, s);
  }, [handleChange]);

  const makeHandleKeyDown = useCallback(
    (
      field: 'min' | 'sec',
    ): ((e: React.KeyboardEvent<HTMLInputElement>) => void) => {
      return (e) => {
        const m = parseInput(minRef.current?.value ?? '00');
        const s = parseInput(secRef.current?.value ?? '00');

        switch (e.key) {
          // Arrow up/down increases/decreses value (simulates <input type="time" /> behavior)
          case 'ArrowUp': {
            e.preventDefault();
            if (field === 'min') {
              handleChange(m + 1, s);
            } else {
              handleChange(m, s + 1);
            }
            break;
          }
          case 'ArrowDown': {
            e.preventDefault();
            if (field === 'min') {
              handleChange(m - 1, s);
            } else {
              handleChange(m, s - 1);
            }
            break;
          }
          // Arrow left/right allows switching between fields (simulates <input type="time" /> behavior)
          case 'ArrowLeft': {
            e.preventDefault();
            if (field === 'sec') minRef.current?.focus();
            break;
          }
          case 'ArrowRight': {
            e.preventDefault();
            if (field === 'min') secRef.current?.focus();
            break;
          }
          default: {
            return;
          }
        }
      };
    },
    [handleChange],
  );

  const handleMinKeyDown = useMemo(
    () => makeHandleKeyDown('min'),
    [makeHandleKeyDown],
  );

  const handleSecKeyDown = useMemo(
    () => makeHandleKeyDown('sec'),
    [makeHandleKeyDown],
  );

  // Copy/paste in MM:SS format
  const handleCopy = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const min = minRef.current?.value ?? '00';
      const sec = secRef.current?.value ?? '00';
      e.clipboardData.setData('text/plain', `${min}:${sec}`);
    },
    [],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const text = e.clipboardData.getData('text');
      const match = /^(?<min>\d+):(?<sec>[0-5][0-9])$/.exec(text);
      if (match) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- regex ensures groups exist
        let m = parseInt(match.groups!['min']!, 10);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- regex ensures groups exist
        let s = parseInt(match.groups!['sec']!, 10);
        if (s >= 60) {
          m += Math.floor(s / 60);
          s = s % 60;
        }
        handleChange(m, s);
        e.preventDefault();
      }
    },
    [handleChange],
  );

  // When clicking the separator, focus the minutes input -- simulates <input type="time" /> behavior
  const handleSeparatorMouseDown = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      e.preventDefault();
      minRef.current?.focus();
    },
    [],
  );

  const inputProps = {
    onFocus: handleFocus,
    onMouseDown: handleFocus,
    onMouseUp: handleFocus,
  };

  const isEven = Math.floor(value) % 2 === 0;

  return (
    <div
      role="group"
      aria-label="Time input"
      className={cx(styles['container'], {
        [`${styles['container-ticking']}`]: isTicking,
        [`${styles['container-even']}`]: isEven,
        [`${styles['container-odd']}`]: !isEven,
      })}
      onCopy={handleCopy}
      onPaste={handlePaste}
    >
      <TimeInputSegment
        ref={minRef}
        className={styles['minutes']}
        aria-label="Minutes"
        value={Math.floor(value / 60)}
        onChange={handleInputChange}
        onKeyDown={handleMinKeyDown}
        {...inputProps}
      />
      <span
        className={cx(styles['separator'])}
        onMouseDown={handleSeparatorMouseDown}
      >
        :
      </span>
      <TimeInputSegment
        ref={secRef}
        mode="seconds"
        className={styles['seconds']}
        aria-label="Seconds"
        value={value % 60}
        onChange={handleInputChange}
        onKeyDown={handleSecKeyDown}
        {...inputProps}
      />
    </div>
  );
};

/**/

function handleFocus(
  e: React.FocusEvent<HTMLInputElement> | React.MouseEvent<HTMLInputElement>,
) {
  e.preventDefault();
  e.currentTarget.select();
}

type TimeInputSegmentProps = {
  ref: React.Ref<HTMLInputElement>;
  value: number;
  onChange?: (value: number) => void;
  mode?: 'seconds' | undefined;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  | 'ref'
  | 'type'
  | 'inputMode'
  | 'pattern'
  | 'value'
  | 'defaultValue'
  | 'onChange'
>;

function TimeInputSegment({
  ref,
  value,
  mode,
  onChange,
  onKeyDown,
  ...rest
}: TimeInputSegmentProps) {
  const valueStr = Math.floor(value).toString().padStart(2, '0');
  const { style, ...restProps } = rest;

  const inputRef = useRef<HTMLInputElement>(null);
  const handleRef = useCallback(
    (el: HTMLInputElement) => {
      if (typeof ref === 'function') ref(el);
      else if (ref) ref.current = el;
      inputRef.current = el;

      return () => {
        if (typeof ref === 'function') ref(null);
        else if (ref) ref.current = null;
        inputRef.current = null;
      };
    },
    [ref],
  );

  // If input is selected, keep it selected when value changes (simulates <input type="time" /> behavior)
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.value = valueStr;
    if (document.activeElement === input) {
      input.select();
    }
  }, [valueStr]);

  // Simulate <input type="time" /> behavior when typing numbers
  const writingValueRef = useRef('');

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9': {
          e.preventDefault();
          writingValueRef.current += e.key;

          let value = parseInput(writingValueRef.current);
          if (mode === 'seconds' && value >= 60) {
            writingValueRef.current = e.key;
            value = parseInput(writingValueRef.current);
          }
          e.currentTarget.value = writingValueRef.current.padStart(2, '0');
          onChange?.(value);
          break;
        }
        case 'Backspace':
        case 'Delete': {
          e.preventDefault();
          e.currentTarget.value = '00';
          onChange?.(0);
          break;
        }
        default: {
          onKeyDown?.(e);
        }
      }
    },
    [mode, onChange, onKeyDown],
  );

  const handleBlur = useCallback(() => {
    writingValueRef.current = '';
  }, []);

  const handleOnChange = useCallback(() => {
    // Do nothing on onChange since we handle everything in onKeyDown
    // We cannot do it on onChange because it breaks select-all behavior
    // This is here to silence React warning about controlled input without onChange
  }, []);

  return (
    <input
      ref={handleRef}
      type="number"
      inputMode="numeric"
      pattern="[0-9]*"
      value={valueStr}
      onKeyDown={handleKeyDown}
      onChange={handleOnChange}
      onBlur={handleBlur}
      style={
        {
          '--width': Math.max(2, valueStr.length),
          ...style,
        } as React.CSSProperties
      }
      {...restProps}
    />
  );
}
