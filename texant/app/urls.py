from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    OCRUploadView,
    OCRResultListView,
    OCRResultDetailView,
)

urlpatterns = [
    # 🔑 Authentication
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),

    # 📝 OCR Endpoints
    path("ocr/upload/", OCRUploadView.as_view(), name="ocr-upload"),  # Upload an image and run OCR
    path("ocr/results/", OCRResultListView.as_view(), name="ocr-results"),  # List all OCR results for the user
    path("ocr/results/<int:pk>/", OCRResultDetailView.as_view(), name="ocr-result-detail"),  # Retrieve or delete a single result
]
