import React, { useState } from "react";
import { CircularCheckmark } from "./Checkmark";

interface DatasetProps {
  name: string;
  id: string;
  img?: string;
  description: string;
  reason: string;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

const Dataset = ({ name, id, img, description, reason }: DatasetProps) => {
  const [selected, setSelected] = useState(false);
  const handleClick = () => {
    setSelected(!selected);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        w-[200px]
        relative p-6 rounded-xl border-2 cursor-pointer
        transition-all duration-200 ease-in-out
        bg-gray-950 border-transparent
        ${selected ? "border-white" : ""}
        hover:shadow-2xl
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
    </div>
  );
};

export default Dataset;
