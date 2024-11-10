"use client";
import { useState } from "react";
import Dataset from "../components/Dataset";
import { DATASET_MAP } from "../data/raw_datasets";
import orchestrator, { Message, DatasetToolData } from "./api_orchestrator";

function TopBar() {
  return (
    <div>
      <h1 className="text-4xl font-semibold text-center p-8">Landnalyze</h1>
    </div>
  );
}

function UserBubble(message: Message) {
  return (
    <div className="flex justify-end">
      <div className="bg-blue-500 rounded-xl p-4 mb-4">{message.content}</div>
    </div>
  );
}

function parseToolData(message: Message) {
  if (message.toolData?.tooltype === "dataset") {
    const data = message.toolData.data as DatasetToolData;
    return (
      <div className="grid grid-cols-3 gap-4 mx-auto">
        {data.datasets.map((dataset, idx) => (
          <Dataset
            key={idx}
            name={dataset.dataset_name}
            description={DATASET_MAP[dataset.dataset_name].description}
            reason={dataset.reason}
            id={dataset.dataset_name}
            thumbnail_url={DATASET_MAP[dataset.dataset_name].thumbnail_url}
            url={DATASET_MAP[dataset.dataset_name].url}
          />
        ))}
      </div>
    );
  }
  return null;
}

function ModelBubble(message: Message) {
  return (
    <div className="p-4 mb-4">
      {message.content}
      {message.toolData && parseToolData(message)}
    </div>
  );
}

function ChatScroll(messages: Message[], isLoading: boolean) {
  return (
    <div className="flex-grow overflow-y-auto overflow-x-hidden w-full">
      <div className="mx-auto w-[900px] flex flex-col">
        {messages.map((message, idx) => (
          <div key={message.role + idx.toString()}>
            {message.role == "user"
              ? UserBubble(message)
              : ModelBubble(message)}
          </div>
        ))}
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

type BottomChatProps = {
  messages: Message[];
  setMessages: (prevMessages: Message[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
};

function BottomChat({
  messages,
  setMessages,
  isLoading,
  setIsLoading,
}: BottomChatProps) {
  const [input, setInput] = useState<string>("");

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInput(event.target.value);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const newMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]); // Update with the current input

    try {
      const data = await orchestrator([...messages, newMessage]); // Pass updated messages if needed

      if (data) {
        setMessages((prevMessages) => [...prevMessages, data]);
      }

      setInput(""); // Clear the input after submission
      setIsLoading(false);
    } catch (error) {
      console.error("Error sending messages:", error);
      setIsLoading(false);
    }
  }

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
            {isLoading ? "Loading..." : "Analyze"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <div className="flex flex-col justify-center w-screen h-screen">
      {TopBar()}
      {ChatScroll(messages, isLoading)}
      {BottomChat({ messages, setMessages, isLoading, setIsLoading })}
    </div>
  );
}
