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
  query: string;
  datasets: DatasetEntry[];
}

export interface PlotToolData {
  data: JSON;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  toolData?: ToolData;
}

export default async function orchestrator(
  messages: Message[],
  state: { [key: string]: any }
): Promise<Message> {
  console.log("Messages:", messages);
  const res = await fetch(
    `http://127.0.0.1:8000/api/query/?q=${
      messages[messages.length - 1].content
    }`
  );
  if (!res.ok) {
    throw new Error(`Error: ${res.statusText}`);
  }
  let data = await res.json();
  data = JSON.parse(data) as AgentResponse;
  if (data.mode === "dataset" || data.mode === "init") {
    data.datasets = JSON.parse(data.datasets);
    data.datasets = data.datasets.datasets;
    console.log("Got data");
    console.log("Data:", data);

    return {
      role: "assistant",
      content:
        "Of course! Here are some datasets that might help you, and reasons why they might be relevant or not relevant:",
      toolData: {
        tooltype: "dataset",
        data: data as DatasetToolData,
      },
    };
  } else if (data.mode === "visualize") {
    return {
      role: "assistant",
      content: "Here are some visualizations of the dataset you selected:",
      toolData: {
        tooltype: "plot",
        data: data as PlotToolData,
      },
    };
  } else {
  }
  // const openai = createOpenAI({
  //   apiKey: process.env.OpenAI_API_KEY,
  //   compatibility: "strict", // strict mode, enable when using the OpenAI API
  // });

  // const result = await streamText({
  //   model: openai("gpt-4o"),
  //   system: "You are a helpful assistant.",
  //   messages,
  // });

  // return result.toDataStreamResponse();
}
