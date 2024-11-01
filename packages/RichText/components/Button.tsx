import clsx from 'clsx';
import React, { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick: () => void;
  small?: boolean;
  title?: string;
}

const Button: React.FC<ButtonProps> = (props) => {
  const { children, className, onClick, disabled, small, title } = props;
  return (
    <button
      disabled={disabled}
      className={clsx(
        'border-none bg-[#eee] rounded cursor-pointer hover:bg-[#ddd] disabled:cursor-not-allowed disabled:hover:bg-[#eee]',
        small ? 'py-1 px-2.5 text-xs' : 'py-2.5 px-4 text-[14px]',
        className
      )}
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
};

export default Button;
