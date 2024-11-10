import React from "react";
import { Check } from "lucide-react";

interface CircularCheckmarkProps {
  initialState?: boolean;
  size?: "sm" | "md" | "lg";
  isChecked: boolean;
  setIsChecked: (state: boolean) => void;
}

export const CircularCheckmark = ({
  size = "md",
  isChecked,
  setIsChecked,
}: CircularCheckmarkProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  const handleClick = () => {
    const newState = !isChecked;
    setIsChecked(newState);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]}
        rounded-full
        flex items-center justify-center
        transition-all duration-100 ease-in-out
        transform hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2
        ${
          isChecked
            ? "bg-green-500 text-white rotate-0"
            : "bg-gray-200 text-transparent rotate-180"
        }
        ${!isChecked && "hover:bg-gray-300"}
      `}
      aria-checked={isChecked}
      role="checkbox"
    >
      <Check
        size={iconSizes[size]}
        className={`
          transition-all duration-100
          ${isChecked ? "scale-100 opacity-100" : "scale-0 opacity-0"}
        `}
      />
    </button>
  );
};
