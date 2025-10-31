'use client';
import React, { useState, useRef, useEffect } from 'react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  placeholder?: string;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false,
  autoFocus = false,
  className = '',
  placeholder = '○',
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update internal state when value prop changes
  useEffect(() => {
    if (value !== otp.join('')) {
      const newOtp = value.split('').slice(0, length);
      while (newOtp.length < length) newOtp.push('');
      setOtp(newOtp);
    }
  }, [value, length, otp]);

  // Auto-focus first input
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, digit: string) => {
    // Only allow numeric input
    if (digit && !/^\d$/.test(digit)) return;

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Call parent onChange
    onChange(newOtp.join(''));

    // Move to next input if digit is entered
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        onChange(newOtp.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Delete') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      onChange(newOtp.join(''));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    const digits = pastedData.split('').slice(0, length);

    const newOtp = Array(length).fill('');
    digits.forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);
    onChange(newOtp.join(''));

    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex((digit) => !digit);
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1;
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className={`flex justify-center space-x-2 ${className}`}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`
            h-12 w-12 rounded-lg border-2 text-center text-lg font-semibold 
            focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500
            ${digit ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
            ${disabled ? 'cursor-not-allowed bg-gray-100' : 'hover:border-blue-400'}
            transition-colors duration-200
          `}
          placeholder={digit ? '' : placeholder}
          autoComplete="off"
        />
      ))}
    </div>
  );
};

export default OtpInput;
