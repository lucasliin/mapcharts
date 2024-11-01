import clsx from 'clsx';
import React, { HTMLInputTypeAttribute } from 'react';

interface TextInputProps {
  label?: string;
  value: string;
  className?: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  onChange: (val: string) => void;
}

const TextInput: React.FC<TextInputProps> = (props) => {
  const {
    label,
    value,
    onChange,
    className,
    type = 'text',
    placeholder = '',
  } = props;

  return (
    <>
      {label ? (
        <label
          className={clsx(
            'flex flex-1 text-[#666] whitespace-nowrap items-center',
            'after:content-[":"] ms-0.5 me-2'
          )}
        >
          {label}
        </label>
      ) : null}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(
          'border border-solid border-[#d9d9d9] outline-none py-1 px-3 rounded-md placeholder:text-gray-300 w-full min-w-[250px]',
          'hover:border-primary',
          'focus:border-primary focus:shadow-[0_0_0_2px_rgba(5,145,255,0.1)]',
          className
        )}
      />
    </>
  );
};

export default TextInput;
