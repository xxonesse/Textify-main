# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .ocr import run_ocr_from_file
from .models import OCRResult
from .serializers import OCRResultSerializer, RegisterSerializer
import logging
import traceback

logger = logging.getLogger(__name__)

# --- OCR Upload ---
class OCRUploadView(APIView):
    """
    Upload an image, run OCR, and store the result.
    Handles errors gracefully so server never crashes.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        file_obj = request.FILES.get("image")
        if not file_obj:
            return Response({"error": "No image uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Run OCR (safe)
            text_result = run_ocr_from_file(file_obj)
        except Exception as e:
            logger.error("OCR processing failed", exc_info=True)
            traceback.print_exc()
            text_result = "[OCR failed]"

        try:
            # Save OCR result (even if OCR failed)
            ocr_instance = OCRResult.objects.create(
                user=request.user,
                image=file_obj,
                text=text_result
            )
            serializer = OCRResultSerializer(ocr_instance)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error("Failed to save OCR result", exc_info=True)
            traceback.print_exc()
            return Response({"error": "Could not save OCR result"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- OCR Results List ---
class OCRResultListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        results = OCRResult.objects.filter(user=request.user).order_by("-created_at")
        serializer = OCRResultSerializer(results, many=True)
        return Response(serializer.data)


# --- OCR Result Detail ---
class OCRResultDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return OCRResult.objects.get(pk=pk, user=user)
        except OCRResult.DoesNotExist:
            return None

    def get(self, request, pk):
        result = self.get_object(pk, request.user)
        if not result:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = OCRResultSerializer(result)
        return Response(serializer.data)

    def delete(self, request, pk):
        result = self.get_object(pk, request.user)
        if not result:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        result.delete()
        return Response({"message": "Deleted"}, status=status.HTTP_204_NO_CONTENT)


# --- Auth: Register ---
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


# --- Auth: Login ---
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"detail": "Username and password required"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(username=username).first()
        if user and user.check_password(password):
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }, status=status.HTTP_200_OK)

        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
