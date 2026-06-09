from django.db import models

class Prescription(models.Model):
    patient_name = models.CharField(max_length=255)
    doctor_name = models.CharField(max_length=255)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Store the AI result directly on the prescription for Screen 2 details
    severity = models.CharField(max_length=50, default="None") # None, Mild, Moderate, Severe, Error
    interaction_result = models.TextField(blank=True, null=True) # Formatted text analysis from Claude

    def __str__(self):
        return f"Prescription for {self.patient_name} by {self.doctor_name}"


class PrescriptionItem(models.Model):
    prescription = models.ForeignKey(Prescription, related_name='items', on_delete=models.CASCADE)
    drug_name = models.CharField(max_length=255)
    dosage = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.drug_name} {self.dosage}"


class InteractionCache(models.Model):
    """Saves API calls for the same drug combinations."""
    combination_key = models.CharField(max_length=500, unique=True) # e.g. "lisinopril+metformin"
    severity = models.CharField(max_length=50)
    result_json = models.TextField() # Cached JSON response
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cache: {self.combination_key} ({self.severity})"

