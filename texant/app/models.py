from django.db import models
from django.contrib.auth.models import User

class OCRResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ocr_results")
    image = models.ImageField(upload_to="ocr_uploads/")
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]  # newest first

    def __str__(self):
        return f"OCR Result {self.id} - {self.user.username}"
