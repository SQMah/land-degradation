import { Agent } from "http";

interface AgentResponse {
  mode: string;
  payload: any;
}

export interface ToolData {
  tooltype: "dataset" | "plot";
  data: DatasetToolData | PlotToolData;
}

interface DatasetEntry {
  dataset_name: string;
  selected: boolean;
  reason: string;
}

export interface DatasetToolData {
  datasets: DatasetEntry[];
}

export interface PlotToolData {}

export interface Message {
  role: "user" | "assistant";
  content: string;
  toolData?: ToolData;
}

export default async function orchestrator(
  messages: Message[],
  state: { [key: string]: any }
): Promise<Message> {
  console.log(`State in orchestrator:`);
  console.log(state);
  const messageStringList = messages.map((message) => message.content);
  const res = await fetch(
    `http://127.0.0.1:8000/api/query/?q=${JSON.stringify(
      messageStringList
    )}&state=${JSON.stringify(state)}`
  );

  if (!res.ok) {
    throw new Error(`Error: ${res.statusText}`);
  }

  let data;
  try {
    data = (await res.json()) as AgentResponse;
  } catch (error) {
    // If response is not JSON, handle as raw text
    const rawText = await res.text();
    return { role: "assistant", content: rawText };
  }

  if (data.mode === "other"){
    return {
      role: "assistant",
      content: data.payload,
    }
  }
  const payload = JSON.parse(data.payload);
  data.payload = payload;

  if (data.mode === "dataset" || data.mode === "init") {
    return {
      role: "assistant",
      content:
        "Of course! Here are some datasets that might help you, and reasons why they might be relevant or not relevant:",
      toolData: {
        tooltype: "dataset",
        data: payload as DatasetToolData,
      },
    };
  } else if (data.mode === "visualize") {
    return {
      role: "assistant",
      content: "Here's a plot for you!",
      toolData: {
        tooltype: "plot",
        data: {} as PlotToolData,
      },
    };
  } else {
    return { role: "assistant", content: data.payload };
  }
}
