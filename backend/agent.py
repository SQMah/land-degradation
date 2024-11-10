from openai import OpenAI
import os, json
from pydantic import BaseModel
import ee, geemap
from matplotlib import pyplot as plt
from PIL import Image
import requests
from io import BytesIO



class DatasetOutput(BaseModel):
    dataset_name: str
    dataset_id: str
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
        "along with an explanation of why. Keep dataset name and "
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
    images = ee.ImageCollection(dataset_name)
    # info = images.limit(5).getInfo()
    
    # For now, visualize the first image only
    image = images.first()
    earth_map = geemap.Map()

    earth_map.add_basemap('ROADMAP')
    earth_map.addLayer(image, name=dataset_name)
    earth_map.save('mymap.html')

    # # Define visualization parameters
    # breakpoint()
    # bands = image.bandNames().getInfo()
    # vis_params = {
    #     # 'bands': bands,
    #     'bands': bands[0:3],
    #     'min': 0,
    #     'max': 3000,
    # }

    # region = image.geometry().bounds().getInfo()['coordinates']

    # # Get the image URL with visualization
    # url = image.getThumbURL({
    #     'region': region,
    #     'dimensions': '1024x1024',  # Adjust resolution as needed
    #     'format': 'jpg',
    #     **vis_params
    # })
    # # Fetch the image and convert to JPEG
    # response = requests.get(url)
    # img = Image.open(BytesIO(response.content))
    # img.show()  # For local testing, or save if needed

    # # Save to file (optional)
    # img.save("output.jpg", "JPEG")

    # viz_params, center_lon, center_lat = get_visualization_params(image.getInfo())
    # export_geometry = get_export_geometry(image.getInfo())

    # earth_map = geemap.Map()

    # earth_map.addLayer(image, viz_params, name=dataset_name)
    # earth_map.setCenter(center_lon, center_lat, 10)

    # dataset_name_no_slashes = dataset_name.replace("/", "_")
    
    # breakpoint()


    # # save the map image 
    # image_path = f"tmp/{dataset_name_no_slashes}.tif"
    # breakpoint()
    # use_np = False
    # if use_np:
    #     # Raw pixels of the map as numpy image
    #     np_image = geemap.ee_to_numpy(image, scale=1000).mean(-1)
    #     plt.imsave(image_path, np_image)
    # else:
    #     # image = image.clip(roi).unmask()
    #     # geemap.ee_export_image( image, filename=image_path, scale=90, file_per_band=False, region=export_geometry)
    #     export_task = ee.batch.Export.image.toAsset
    #         image=image,
    #         description="Exported_Image",
    #         region=export_geometry,
    #         scale=500,  # Set the export scale in meters (e.g., 500m per pixel)
    #         maxPixels=1e13  # Optional: adjust if the image is very large
    #     )
    #     export_task.start()
    # breakpoint()

    
def get_export_geometry(image_info):
    band_info = image_info['bands'][0]  # Use the first band for spatial extent details
    
    # Extract spatial transform and dimensions
    crs_transform = band_info['crs_transform']
    width, height = band_info['dimensions']
    
    # Calculate bounds based on the affine transform and image dimensions
    west = crs_transform[2]
    north = crs_transform[5]
    east = west + crs_transform[0] * width
    south = north + crs_transform[4] * height
    
    # Create a bounding box geometry in Earth Engine
    export_geometry = ee.Geometry.Rectangle([west, south, east, north], band_info['crs'])
    
    return export_geometry

def get_visualization_params(image_info):
    bands = image_info['bands']
    
    # Choose the first available band
    first_band = bands[0]['id']
    band_info = bands[0]
    
    # Dimensions and CRS Transform to compute bounds
    dimensions = band_info['dimensions']
    crs_transform = band_info['crs_transform']
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
        'bands': [first_band],
        'min': 0,        # Adjust these as necessary if more info is available
        'max': 1,
        'palette': ['blue', 'green', 'yellow', 'red']  # Example palette
    }
    
    return viz_params, center_lon, center_lat

if __name__ == "__main__":
    # for dataset in openai_select_datasets("How does temperature and rainfall affect crops?", return_json=False):
    #     # print(f"{dataset.dataset_name}: {dataset.reason}")
    #     selected_str = "selected" if dataset.selected else "not selected"
    #     print(dataset.dataset_id)
    #     print(f"{dataset.dataset_name}: {selected_str.upper()} {dataset.reason}")

    test_dataset = "CSIC/SPEI/2_9"
    ee.Initialize()
    img = plot_google_earth_engine_dataset(test_dataset)