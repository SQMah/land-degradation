"use client";

import { useChat } from "ai/react";
import CircularProgress from "@mui/material/CircularProgress";
import Dataset from "../components/Dataset";

const datasets = [
  {
    name: "Sentinel Hub Library",
    id: "sentinel-hub",
    description:
      "Complete library of Sentinel satellite data, including optical images, thermal and vegetation data, and land cover classifications.",
    reason:
      "Provides extensive satellite imagery and various environmental data for research and monitoring.",
    url: "https://www.sentinel-hub.com",
  },
  {
    name: "Microsoft Planetary Computer",
    id: "planetary-computer",
    description:
      "Search engine for earth observation datasets with visualization and export capabilities.",
    reason:
      "Diverse datasets suitable for environmental analysis and geospatial research.",
    url: "https://planetarycomputer.microsoft.com/catalog",
  },
  {
    name: "NASA Worldview",
    id: "nasa-worldview",
    description:
      "Open access library of 1,000+ historic and daily earth observation satellite images.",
    reason: "Ideal for historical and current satellite imagery access.",
    url: "https://worldview.earthdata.nasa.gov",
  },
  {
    name: "Google Earth Engine",
    id: "earth-engine",
    description:
      "Extensive satellite imagery and geospatial datasets with timelapse photo capabilities.",
    reason:
      "Comprehensive platform for geospatial data analysis and environmental studies.",
    url: "https://earthengine.google.com",
  },
  {
    name: "Nimbo Earth Online",
    id: "nimbo-earth-online",
    description: "Global-scale, cloud-free basemaps updated monthly.",
    reason:
      "Provides consistently updated basemaps for large-scale environmental monitoring.",
    url: "https://nimbo.earth/products/earth-basemaps/",
  },
  {
    name: "Earth Engine Data Catalog",
    id: "earth-engine-catalog",
    description:
      "40+ years of open-access satellite imagery and geospatial datasets.",
    reason:
      "Extensive archive for long-term environmental and climate research.",
    url: "https://developers.google.com/earth-engine/datasets",
  },
  {
    name: "ESRI Wayback",
    id: "esri-wayback",
    description: "Historical satellite imagery for temporal comparison.",
    reason:
      "Enables users to track landscape changes over time for comparative analysis.",
    url: "https://livingatlas.arcgis.com/wayback/",
  },
];

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } =
    useChat({
      keepLastMessageOnError: true,
    });

  return (
    <div className="flex flex-col justify-center w-screen">
      <div className="grid grid-cols-3 gap-4 mx-auto">
        {datasets.map((dataset) => (
          <Dataset key={dataset.id} {...dataset} />
        ))}
      </div>

      {messages.map((message) => (
        <div key={message.id}>
          {message.role === "user" ? "User: " : "AI: "}
          {message.content}
        </div>
      ))}

      {isLoading && (
        <div>
          <CircularProgress />
          <button type="button" onClick={() => stop()}>
            Stop
          </button>
        </div>
      )}
      {/* {error && (
        <>
          <div>An error occurred.</div>
          <button type="button" onClick={() => reload()}>
            Retry
          </button>
        </>
      } */}

      <form onSubmit={handleSubmit}>
        <input
          name="prompt"
          value={input}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
