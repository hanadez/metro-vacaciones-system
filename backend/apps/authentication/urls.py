from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'usuarios', views.UsuarioViewSet, basename='usuario')

urlpatterns = [
    # Autenticación
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile_view, name='profile'),
    path('change-password/', views.change_password_view, name='change_password'),
    path('update-access/', views.update_last_access_view, name='update_access'),
    
    # JWT tokens
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # ViewSets
    path('', include(router.urls)),
]
