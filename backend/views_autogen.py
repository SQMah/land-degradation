"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

# views.py
import os
from agent import openai_select_datasets
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

