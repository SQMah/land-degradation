# views.py
import os
from openai import OpenAI
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import json

@api_view(['GET'])
def search_datasets(request):
    """
    Endpoint to search for datasets using OpenAI API based on query string.
    Expected query parameter: ?q=your_search_query
    """
    query = request.GET.get('q', '')
    
    if not query:
        return Response(
            {'error': 'Query parameter "q" is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        datasets = get_openai_datasets(query)  
        
        return Response({
            'query': query,
            'datasets': datasets
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def get_openai_datasets(query):
    api_key = os.getenv('OPENAI_API_KEY')
    openai = OpenAI(api_key=api_key)

    # TODO (BW): We should add constraints--require a location or similar.
    system_prompt = (
        "Here is a list of datasets, along with short descriptions for each. You are a dataset router. "
        "When the user provides a query, you will provide a list of datasets that are relevant to the query. "
        "Return the list of datasets in JSON format."
    )
    with open("datasets/dataset_info.json", "r") as json_file:
        datasets = json.load(json_file)
    dataset_str = "\n".join([f"{d['name']}: {d['description']}" for d in datasets])

    completion = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "The user will provide a "},
            {
                "role": "user",
                "content": "query",
            }
        ]
    )