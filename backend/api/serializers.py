from rest_framework import serializers
from .models import Prescription, PrescriptionItem

class PrescriptionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescriptionItem
        fields = ['id', 'drug_name', 'dosage']

class PrescriptionSerializer(serializers.ModelSerializer):
    items = PrescriptionItemSerializer(many=True)

    class Meta:
        model = Prescription
        fields = [
            'id', 
            'patient_name', 
            'doctor_name', 
            'date', 
            'created_at', 
            'severity', 
            'interaction_result', 
            'items'
        ]
        read_only_fields = ['id', 'created_at', 'severity', 'interaction_result']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        prescription = Prescription.objects.create(**validated_data)
        for item_data in items_data:
            PrescriptionItem.objects.create(prescription=prescription, **item_data)
        return prescription
