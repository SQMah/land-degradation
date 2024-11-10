from openai import OpenAI
import os, json
from pydantic import BaseModel

class DatasetOutput(BaseModel):
    dataset_name: str
    selected: bool
    reason: str

class DatasetsOutput(BaseModel):
    datasets: list[DatasetOutput]

def openai_select_datasets(query, return_json=True):
    api_key = os.getenv('OPENAI_API_KEY')
    openai = OpenAI(api_key=api_key)

    # TODO (BW): We should add constraints--require a location or similar.
    system_prompt = (
        "Here is a list of datasets, along with short descriptions "
        "for each. You are a dataset router. When the user provides "
        "a query, decide whether each dataset is relevant to the query, "
        "along with an explanation of why"
    )
    with open("datasets/dataset_info.json", "r") as json_file:
        datasets = json.load(json_file)
    dataset_str = "\n".join([f"{d['name']}: {d['description']}" for d in datasets])

    system_prompt += f"\nDatasets:\n{dataset_str}"

    completion = openai.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            { "role": "user", "content": query, }
        ],
        response_format=DatasetsOutput,
    )
    # datasets_list = completion.choices[0].message.content

    # can also get parsed version
    datasets_list = completion.choices[0].message.parsed.datasets

    return datasets_list

def plot_google_earth_engine_dataset(dataset_name):
    """
    Given the dataset name (e.g. "COPERNICUS/S2"), visualize the dataset as a large
    image and send that back
    """
    pass
    

if __name__ == "__main__":
    for dataset in openai_select_datasets("How does temperature and rainfall affect crops?", return_json=False):
        # print(f"{dataset.dataset_name}: {dataset.reason}")
        selected_str = "selected" if dataset.selected else "not selected"
        print(f"{dataset.dataset_name}: {selected_str.upper()} {dataset.reason}")

    # test_dataset = "CSIC/SPEI/2_9"
    # img = plot_google_earth_engine_dataset(test_dataset)