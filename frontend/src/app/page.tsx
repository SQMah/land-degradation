"use client";

import { useChat } from "ai/react";
import Dataset from "../components/Dataset";
import { FormEventHandler, ChangeEventHandler } from "react";
import { Message } from "@ai-sdk/ui-utils";

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

function TopBar() {
  return (
    <div>
      <h1 className="text-4xl font-semibold text-center p-8">Landnalyze</h1>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="bg-blue-500 rounded-xl p-4 mb-4">{children}</div>
    </div>
  );
}

function ModelBubble({ children }: { children: React.ReactNode }) {
  return <div className="p-4 mb-4">{children}</div>;
}

function ChatScroll(messages: Message[]) {
  return (
    <div className="flex-grow overflow-y-auto overflow-x-hidden w-full">
      <div className="mx-auto w-[850px] flex flex-col">
        {messages.map((message) => (
          <div key={message.id}>
            {message.role === "user" ? (
              <UserBubble>{message.content}</UserBubble>
            ) : (
              <ModelBubble>{message.content}</ModelBubble>
            )}
          </div>
        ))}
        <ModelBubble>
          <div className="grid grid-cols-3 gap-4 mx-auto">
            {datasets.map((dataset) => (
              <Dataset key={dataset.id} {...dataset} />
            ))}
          </div>
        </ModelBubble>
        <ModelBubble>bye</ModelBubble>
      </div>
      {/* {isLoading && (
          <div>
            <CircularProgress />
            <button type="button" onClick={() => stop()}>
              Stop
            </button>
          </div>
        )} */}
      {/* {error && (
        <>
          <div>An error occurred.</div>
          <button type="button" onClick={() => reload()}>
            Retry
          </button>
        </>
      } */}
    </div>
  );
}

function BottomChat(
  handleSubmit: FormEventHandler<HTMLFormElement> | undefined,
  handleInputChange: ChangeEventHandler<HTMLInputElement> | undefined,
  input: string | number | readonly string[] | undefined,
  isLoading: boolean | undefined
) {
  return (
    <div className="flex items-center w-full p-4 bg-slate-850 relative shadow-[0_-4px_8px_rgba(0,0,0,0.1)]">
      <div className="mx-auto w-[1050px]">
        <form onSubmit={handleSubmit} className="flex w-full m-4">
          <input
            name="prompt"
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
            className="flex-grow p-2 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-800 mr-2"
            placeholder="Ask me to find relationships between land degradation, drought, and people..."
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Analyze
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      keepLastMessageOnError: true,
    });

  return (
    <div className="flex flex-col justify-center w-screen h-screen">
      {TopBar()}
      {ChatScroll(messages)}
      {BottomChat(handleSubmit, handleInputChange, input, isLoading)}
    </div>
  );
}
