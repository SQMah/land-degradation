"use client";

import { useChat } from "ai/react";
import CircularProgress from "@mui/material/CircularProgress";
import Dataset from "../components/Dataset";

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } =
    useChat({
      keepLastMessageOnError: true,
    });

  return (
    <>
      {Dataset({
        name: "GPT-4o Mini",
        id: "gpt-4o-mini",
        description: "A smaller version of GPT-4o.",
        reason: "Useful for small-scale applications.",
      })}
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
    </>
  );
}
