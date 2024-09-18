import React from 'react';

interface ButtonProps {
  type: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  type,
  children,
  onClick,
  className,
  disabled,
}) => {
  return (
    <button
      type={type}
      className={
        className
          ? `${className} ${disabled ? 'bg-gray-400 cursor-not-allowed' : ''}`
          : `w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 ${
              disabled
                ? 'bg-blue-300 text-white cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500'
            }`
      }
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
