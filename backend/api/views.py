from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Prescription, PrescriptionItem, InteractionCache
from .serializers import PrescriptionSerializer
from .utils import check_prescription_interactions, normalize_drug_key
import json

class PrescriptionListCreateView(APIView):
    """
    Handles listing saved prescriptions (GET) and creating new prescriptions (POST).
    """
    def get(self, request):
        prescriptions = Prescription.objects.all().order_by('-created_at')
        serializer = PrescriptionSerializer(prescriptions, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PrescriptionSerializer(data=request.data)
        if serializer.is_valid():
            # Get the list of drugs entered in the request
            items_data = request.data.get('items', [])
            
            # Check for interactions (handles single-drug bypass & Claude caching/errors)
            interaction_data = check_prescription_interactions(items_data)
            
            # Save the prescription with the overall severity & summary from Claude
            prescription = serializer.save(
                severity=interaction_data.get('severity', 'None'),
                interaction_result=interaction_data.get('summary', 'No interactions checked.')
            )
            
            # Prepare the response. We inject the full detailed interaction JSON 
            # so the frontend form can display it inline immediately.
            response_data = PrescriptionSerializer(prescription).data
            response_data['interaction_details'] = interaction_data
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PrescriptionDetailView(APIView):
    """
    Handles retrieving a single prescription's complete details (GET).
    """
    def get(self, request, pk):
        try:
            prescription = Prescription.objects.get(pk=pk)
        except Prescription.DoesNotExist:
            return Response({"error": "Prescription not found"}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = PrescriptionSerializer(prescription)
        response_data = serializer.data
        
        # Retrieve the saved drug list to generate the cache key
        valid_items = [{"drug_name": item.drug_name, "dosage": item.dosage} for item in prescription.items.all()]
        
        # If there's more than 1 drug, pull the detailed interaction explanation from the cache
        if len(valid_items) > 1:
            cache_key = normalize_drug_key(valid_items)
            cached_entry = InteractionCache.objects.filter(combination_key=cache_key).first()
            if cached_entry:
                response_data['interaction_details'] = json.loads(cached_entry.result_json)
            else:
                # Fallback if cache was cleared/missing
                response_data['interaction_details'] = {
                    "severity": prescription.severity,
                    "has_interactions": prescription.severity not in ["None", "Error"],
                    "summary": prescription.interaction_result,
                    "details": []
                }
        else:
            # Single drug prescription details
            response_data['interaction_details'] = {
                "severity": "None",
                "has_interactions": False,
                "summary": "Interaction check not required for a single drug.",
                "details": []
            }
            
        return Response(response_data)

