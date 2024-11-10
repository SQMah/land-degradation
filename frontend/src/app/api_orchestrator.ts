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
  messages: Message[]
): Promise<Message> {
  if (messages.length === 1) {
    // Get request from http://127.0.0.1:8000/
    const res = await fetch(
      `http://127.0.0.1:8000/api/search-datasets/?q=${messages[0].content}`
    );
    if (!res.ok) {
      throw new Error(`Error: ${res.statusText}`);
    }

    const data = await res.json();
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
  }
  if (messages.length == 3) {
    const res = await fetch(`http://127.0.0.1:8000/api/viz-dataset`);
    if (!res.ok) {
      throw new Error(`Error: ${res.statusText}`);
    }
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
