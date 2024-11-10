# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('api/search-datasets/', views.search_datasets, name='search_datasets'),
    path('api/viz-data/', views.vizualize_dataset, name='vizualize_dataset'),
    # path('api/query/', views.query, name='general_query'),
]

# settings.py additions
INSTALLED_APPS = [
    # ... other apps ...
    'rest_framework',
]

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
    ],
}