from openai import OpenAI
import os, json
from pydantic import BaseModel

class DatasetOutput(BaseModel):
    dataset_name: str
    reason: str

class DatasetsOutput(BaseModel):
    datasets: list[DatasetOutput]

def get_openai_datasets(query):
    api_key = os.getenv('OPENAI_API_KEY')
    openai = OpenAI(api_key=api_key)

    # TODO (BW): We should add constraints--require a location or similar.
    system_prompt = (
        "Here is a list of datasets, along with short descriptions for each. You are a dataset router. "
        "When the user provides a query, you will provide a list of datasets that are relevant to the query, "
        "along with an explanation of why this dataset may be relevant."
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

if __name__ == "__main__":
    for dataset in get_openai_datasets("How does temperature and rainfall affect crops?"):
        # print(f"{dataset.dataset_name}: {dataset.reason}")
        print(f"{dataset.dataset_name}: {dataset.reason}")