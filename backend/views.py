# views.py
import os
from .agent import openai_select_datasets, plot_google_earth_engine_dataset, query_router
from django.http import JsonResponse, HttpResponse
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
        datasets = openai_select_datasets(query)

        return Response({
            'query': query,
            'datasets': datasets
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def vizualize_dataset(request):
    dataset_id = request.GET.get('dataset_id', '')
    if not dataset_id:
        return JsonResponse({'error': 'Dataset ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        responses = plot_google_earth_engine_dataset(dataset_id)
        return JsonResponse({
            "type": "html",
            "content": responses,
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def query(request):
    context = request.GET.get('context', '')
    if 'query' in request.GET:
        result =  query_router([request.GET['query']], context)
    elif 'q' in request.GET:
        result = query_router([request.GET['q']], context)
    elif 'queries' in request.GET:
        result = query_router(request.GET['queries'], context)
    elif 'qs' in request.GET:
        result = query_router(request.GET['qs'], context)
    else:
        return JsonResponse({'error': 'Query is required'}, status=status.HTTP_400_BAD_REQUEST)

    return JsonResponse(result, status=status.HTTP_200_OK)