from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),

    # API endpoints from your app
    path("api/", include("app.urls")),      # OCR + Auth
    path("api/", include("notes.urls")),    # Notes app

    # JWT token refresh
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

# Serve uploaded media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
