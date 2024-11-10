# views.py
import os
from agent import get_openai_datasets
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
