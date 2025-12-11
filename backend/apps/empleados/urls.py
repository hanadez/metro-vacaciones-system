from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
# ViewSets se registrarán en views.py

urlpatterns = [
    path('', include(router.urls)),
]