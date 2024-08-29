import React from "react";

interface ButtonProps {
  type: "button" | "submit" | "reset";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}


const Button: React.FC<ButtonProps> = ({ type, children, onClick, className }) => {
  return (
    <button
      type={type}
      className={className ? (className) :("w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500")}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;