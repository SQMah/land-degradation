import React, { useEffect, useState } from "react";
import { CircularCheckmark } from "./Checkmark";
import { useDatasetContext } from "../app/context/DatasetContext";

interface DatasetProps {
  name: string;
  id: string;
  thumbnail_url: string;
  description: string;
  reason?: string;
  url: string;
  wasSelected?: boolean;
}

const Dataset = ({
  name,
  id,
  thumbnail_url,
  description,
  reason,
  url,
  wasSelected = false,
}: DatasetProps) => {
  const { datasetState, updateDataset } = useDatasetContext();
  useEffect(() => {
    updateDataset(id, wasSelected);
  }, []); // Empty dependency array ensures this runs only on the first render
  const [selected, setSelected] = useState(wasSelected);
  const handleClick = () => {
    updateDataset(id, !selected);
    setSelected(!selected);
    console.log(datasetState);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        w-[275px]
        relative p-6 rounded-xl border-2 cursor-pointer
        transition-all duration-100 ease-in-out
        bg-gray-950 border-transparent
        ${selected ? "border-white" : ""}
        hover:shadow-[0_4px_10px_rgba(155,155,155,0.1)]
        pt-12
      `}
    >
      <div className="absolute right-2 top-2">
        <CircularCheckmark
          size="sm"
          isChecked={selected}
          setIsChecked={setSelected}
        />
      </div>
      {/* Content */}
      <div className="space-y-4 pl-2">
        <h3 className="text-xl font-semibold">{name}</h3>
        <p className="text-sm italic break-words">{id}</p>
        <div className="relative h-48 overflow-hidden rounded-lg">
          <img
            src={thumbnail_url}
            alt={name}
            className="object-cover w-full h-full"
          />
        </div>

        <p className="text-sm italic">{description}</p>
        {reason && (
          <div className="pt-2 mb-4 border-t border-gray-100">
            <div className="bg-slate-900 p-2 rounded-lg">
              <p className="text-sm font-bold inline-block">Reason:</p>
              <p className="text-sm inline-block">{reason}</p>
            </div>
          </div>
        )}
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
