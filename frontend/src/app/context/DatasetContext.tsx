"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the interface for dataset state
interface DatasetRecord {
  isSelected: boolean;
}

// Define the interface for the context value
interface DatasetContextType {
  datasetState: Record<string, DatasetRecord>;
  updateDataset: (id: string, selected: boolean) => void;
}

// Create the context
const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

// Create a provider component
interface DatasetProviderProps {
  children: ReactNode;
}

export const DatasetProvider: React.FC<DatasetProviderProps> = ({
  children,
}) => {
  // State to store multiple dataset_ids and their selection status
  const [datasetState, setDatasetState] = useState<
    Record<string, DatasetRecord>
  >({});

  // Function to update the dataset state
  const updateDataset = (id: string, selected: boolean) => {
    setDatasetState((prevState) => ({
      ...prevState,
      [id]: { isSelected: selected },
    }));
  };

  return (
    <DatasetContext.Provider value={{ datasetState, updateDataset }}>
      {children}
    </DatasetContext.Provider>
  );
};

// Custom hook to use the DatasetContext
export const useDatasetContext = (): DatasetContextType => {
  const context = useContext(DatasetContext);
  if (!context) {
    throw new Error("useDatasetContext must be used within a DatasetProvider");
  }
  return context;
};
