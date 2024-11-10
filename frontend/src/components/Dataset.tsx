import React, { useState } from "react";
import { CircularCheckmark } from "./Checkmark";

interface DatasetProps {
  name: string;
  id: string;
  img?: string;
  description: string;
  reason: string;
  url: string;
}

const Dataset = ({ name, id, img, description, reason, url }: DatasetProps) => {
  const [selected, setSelected] = useState(false);
  const handleClick = () => {
    setSelected(!selected);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        w-[300px]
        relative p-6 rounded-xl border-2 cursor-pointer
        transition-all duration-200 ease-in-out
        bg-gray-950 border-transparent
        ${selected ? "border-white" : ""}
        hover:shadow-[0_4px_10px_rgba(155,155,155,0.1)]
        pt-12
      `}
    >
      <div className="absolute left-2 top-2">
        <CircularCheckmark
          size="sm"
          isChecked={selected}
          setIsChecked={setSelected}
        />
      </div>
      {/* Content */}
      <div className="space-y-4 pl-2">
        <h3 className="text-xl font-semibold">{name}</h3>

        {img && (
          <div className="relative h-48 overflow-hidden rounded-lg">
            <img src={img} alt={name} className="object-cover w-full h-full" />
          </div>
        )}

        <p className="leading-relaxed">{description}</p>

        <div className="pt-2 border-t border-gray-100">
          <p className="text-sm italic">{reason}</p>
        </div>
      </div>
      <div className="absolute bottom-1 right-1">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevents the parent div click event from triggering
            window.open(url, "_blank");
          }}
          className="text-sm p-2 hover:text-blue-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 3h7m0 0v7m0-7L10 14M5 10v11a1 1 0 001 1h11a1 1 0 001-1v-5"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Dataset;
