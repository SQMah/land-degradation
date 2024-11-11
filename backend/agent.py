from openai import OpenAI
import os, json
from pydantic import BaseModel
import ee, geemap
from matplotlib import pyplot as plt
from PIL import Image
import requests
from io import BytesIO
from enum import Enum


class DatasetOutput(BaseModel):
    dataset_name: str
    dataset_id: str
    selected: bool
    reason: str


class DatasetsOutput(BaseModel):
    datasets: list[DatasetOutput]


class QueryMode(Enum):
    DATASET = "dataset"
    INIT = "init"
    VIZUALIZE = "vizualize"
    ANALYZE = "analyze"
    OTHER = "other"


class QueryModeOutput(BaseModel):
    mode: QueryMode


def get_query_mode(query):
    system_prompt = (
        "For the following user query, determine whether the using is asking to: "
        "1. DATASET: looking for relevant data to a problem. Does NOT count if they already seem to have data and are asking more about it. \n"
        "2. VIZUALIZE: looking to vizualize existing data\n"
        "3. ANALYZE: looking to analyze existing data\n"
        "4. OTHER: other\n"
    )
    api_key = os.getenv("OPENAI_API_KEY")
    openai = OpenAI(api_key=api_key)

    completion = openai.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query},
        ],
        response_format=QueryModeOutput,
    )
    route = completion.choices[0].message.parsed.mode
    return route


def general_query(query, context):
    with open("datasets/dataset_info.json", "r") as json_file:
        datasets = json.load(json_file)
    # context looks like "{dataset_name: {selected:bool}}"
    context = json.loads(context) if context else {}
    relevant_datasets = {
        d["name"]: d["description"]
        for d in datasets
        if d["name"] in context and context[d["name"]]["isSelected"]
    }
    dataset_str = "\n".join(
        [f"{name}: {description}" for name, description in relevant_datasets.items()]
    )
    for i in range(len(query)):
        if "Of course! Here are some datasets that might help you" in query[i]:
            query[i] = query[i] + "\n" + dataset_str

    # dataset_str = "\n".join([f"{d['name']}: {d['description']}" for d in datasets])

    api_key = os.getenv("OPENAI_API_KEY")
    openai = OpenAI(api_key=api_key)
    system_prompt = (
        "You are a expert data scientist. Be concise, precise, and factual in "
        "your responses. If you do not know the answer to a question, "
        "say that you do not know. Do not make up an answer."
    )
    cur_speaker = "user"  # assistant
    messages = [
        {"role": "system", "content": system_prompt},
    ]
    for q in query:
        messages.append({"role": cur_speaker, "content": q})
        if cur_speaker == "user":
            cur_speaker = "assistant"
        else:
            cur_speaker = "user"

    completion = openai.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=messages,
    )
    route = completion.choices[0].message.content
    return route


def query_router(q, context):
    assert q
    last_query = q[-1]
    query_mode = get_query_mode(last_query)
    if query_mode == QueryMode.DATASET:
        payload = openai_select_datasets(last_query)
    elif query_mode == QueryMode.INIT:
        payload = openai_select_datasets(last_query)
    elif query_mode == QueryMode.VIZUALIZE and context:
        context = json.loads(context)
        first_dataset = list(context.keys())[0]
        payload = plot_google_earth_engine_dataset(first_dataset)
    else:
        # general chat has all conversations from the past
        payload = general_query(q, context)
    return {
        "mode": query_mode.value,
        "payload": payload,
    }


def openai_select_datasets(query, return_json=True):
    api_key = os.getenv("OPENAI_API_KEY")
    openai = OpenAI(api_key=api_key)

    # TODO (BW): We should add constraints--require a location or similar.
    system_prompt = (
        "Here is a list of datasets, along with short descriptions "
        "for each. You are a dataset router. When the user provides "
        "a query, decide whether each dataset is relevant to the query, "
        "along with an explanation of why. Datasets can also be relevant to the query if they are knock on effects of the initial query. For example, if the user asks about drought, GPP or population might also be a relevant dataset as drought has downstream effects on GPP. Keep dataset name and "
        "dataset id the same."
    )
    with open("datasets/dataset_info.json", "r") as json_file:
        datasets = json.load(json_file)
    dataset_str = "\n".join([f"{d['name']}: {d['description']}" for d in datasets])

    system_prompt += f"\nDatasets:\n{dataset_str}"

    completion = openai.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": query,
            },
        ],
        response_format=DatasetsOutput,
    )
    # datasets_list = completion.choices[0].message.content
    if return_json:
        return completion.choices[0].message.content
    else:

        # can also get parsed version
        datasets_list = completion.choices[0].message.parsed.datasets

        return datasets_list


def plot_google_earth_engine_dataset(dataset_name):
    """
    Given the dataset name (e.g. "COPERNICUS/S2"), visualize the dataset as a large
    image and send back the HTML for iframing
    """
    if os.environ.get("USER") == "sqmah":
        ee.Initialize(project="ai-blocks-education")
    else:
        ee.Initialize()

    images = ee.ImageCollection(dataset_name)
    images = images.limit(1000).mosaic()
    # info = images.limit(5).getInfo()

    # For now, visualize the first image only
    # image = images.first()

    dataset_name_no_slashes = dataset_name.replace("/", "_")
    image_path = f"tmp/{dataset_name_no_slashes}.tif"
    # TODO: make thi not just mongolia lol
    roi = (
        ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017")
        .filter(ee.Filter.eq("country_na", "Mongolia"))
        .geometry()
    )
    # geemap.ee_export_image( image, filename=image_path, scale=90, region=roi, file_per_band=True)

    vis_params = {
        "min": -2.33,
        "max": 2.33,
        "palette": [
            "8b1a1a",
            "de2929",
            "f3641d",
            "fdc404",
            "9afa94",
            "03f2fd",
            "12adf3",
            "1771de",
            "00008b",
        ],
    }
    earth_map = geemap.Map()

    earth_map.add_basemap("ROADMAP")
    earth_map.centerObject((roi), 4)
    earth_map.addLayer(images.clip(roi), None, "SPEI")

    # Directory where the .html files are saved
    directory = "frontend/public"

    # List all files in the directory that have a .html extension
    existing_files = [f for f in os.listdir(directory) if f.endswith(".html")]

    # Extract numbers from existing .html filenames and find the highest number
    existing_numbers = [
        int(f.split(".html")[0])
        for f in existing_files
        if f.split(".html")[0].isdigit()
    ]

    # Determine the next file number
    next_number = max(existing_numbers) + 1 if existing_numbers else 0

    # Construct the filename
    new_filename = f"{next_number}.html"

    # Save the file with the new filename
    earth_map.save(os.path.join(directory, new_filename))

    return ""


def get_export_geometry(image_info):
    band_info = image_info["bands"][0]  # Use the first band for spatial extent details

    # Extract spatial transform and dimensions
    crs_transform = band_info["crs_transform"]
    width, height = band_info["dimensions"]

    # Calculate bounds based on the affine transform and image dimensions
    west = crs_transform[2]
    north = crs_transform[5]
    east = west + crs_transform[0] * width
    south = north + crs_transform[4] * height

    # Create a bounding box geometry in Earth Engine
    export_geometry = ee.Geometry.Rectangle(
        [west, south, east, north], band_info["crs"]
    )

    return export_geometry


def get_visualization_params(image_info):
    bands = image_info["bands"]

    # Choose the first available band
    first_band = bands[0]["id"]
    band_info = bands[0]

    # Dimensions and CRS Transform to compute bounds
    dimensions = band_info["dimensions"]
    crs_transform = band_info["crs_transform"]
    pixel_width, pixel_height = dimensions[0], dimensions[1]

    # Get bounds from CRS transform and dimensions
    west = crs_transform[2]
    north = crs_transform[5]
    east = west + crs_transform[0] * pixel_width
    south = north + crs_transform[4] * pixel_height

    # Center coordinates (midpoint of the bounds)
    center_lon = (west + east) / 2
    center_lat = (north + south) / 2

    # Define visualization parameters
    viz_params = {
        "bands": [first_band],
        "min": 0,  # Adjust these as necessary if more info is available
        "max": 1,
        "palette": ["blue", "green", "yellow", "red"],  # Example palette
    }

    return viz_params, center_lon, center_lat


if __name__ == "__main__":
    # Testing the query routing
    # query = "How does storm surge affect human health and migration patterns?"
    # response = query_router(query)

    # query = "How does storm surge affect human health and migration patterns?"
    # mode = get_query_mode(query)

    # for dataset in openai_select_datasets("How does temperature and rainfall affect crops?", return_json=False):
    #     # print(f"{dataset.dataset_name}: {dataset.reason}")
    #     selected_str = "selected" if dataset.selected else "not selected"
    #     print(dataset.dataset_id)
    #     print(f"{dataset.dataset_name}: {selected_str.upper()} {dataset.reason}")

    test_dataset = "CSIC/SPEI/2_9"
    ee.Initialize()
    img = plot_google_earth_engine_dataset(test_dataset)
