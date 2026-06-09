import json
import logging
from anthropic import Anthropic
from django.conf import settings
from .models import InteractionCache
import os

logger = logging.getLogger(__name__)

def normalize_drug_key(drugs_list):
    """
    Normalizes drug names and dosages and sorts them alphabetically by drug name to create a unique cache key.
    E.g., [{"drug_name": " Metformin ", "dosage": "500mg"}, {"drug_name": "Lisinopril", "dosage": "10mg"}]
    -> "lisinopril(10mg)+metformin(500mg)"
    """
    items = []
    for item in drugs_list:
        name = item.get('drug_name', '').strip().lower()
        dosage = item.get('dosage', '').strip().lower()
        if name:
            items.append((name, dosage))
            
    # Sort alphabetically by drug name to ensure order consistency
    items.sort(key=lambda x: x[0])
    
    # Format as drugname(dosage) to capture dosage variations
    formatted_items = [f"{name}({dosage})" if dosage else f"{name}(none)" for name, dosage in items]
    return "+".join(formatted_items)



def call_claude_for_interactions(drugs_list):
    """
    Invokes Claude via the official Anthropic SDK with a pharmacy-specific prompt,
    enforcing clinical guidelines and strict JSON output.
    """
    api_key = getattr(settings, 'ANTHROPIC_API_KEY', '')
    if not api_key:
        api_key = os.getenv('ANTHROPIC_API_KEY', '')
        
    if not api_key:
        raise ValueError("Anthropic API key is not configured.")

    client = Anthropic(api_key=api_key)
    
    # Format drug list for the prompt
    drugs_str = "\n".join([f"- {d['drug_name']} ({d.get('dosage', 'Dosage not specified')})" for d in drugs_list])

    system_instruction = (
        "You are an expert clinical pharmacist. Your task is to analyze prescriptions for potential drug-drug interactions. "
        "You must respond ONLY with a raw, valid JSON object matching the requested schema. "
        "Do not include any conversational filler, intro, outro, or markdown code blocks (e.g. do not wrap the response in ```json)."
    )

    user_prompt = f"""Analyze this list of drugs and their dosages for potential drug-drug interactions:

{drugs_str}

Please categorize the overall prescription severity as one of the following:
- "Severe": Direct contraindication, high risk of life-threatening adverse event. Immediate intervention required.
- "Moderate": Significant interaction. Avoid combination if possible, monitor patient closely, or adjust therapy.
- "Mild": Minor interaction. Minimal risk, monitor for minor side effects.
- "None": No known clinical interaction between these drugs.

Your output must be a single JSON object structured exactly like this:
{{
  "severity": "None" | "Mild" | "Moderate" | "Severe",
  "has_interactions": true | false,
  "summary": "A clear, 1-2 sentence clinical summary of the findings.",
  "details": [
    {{
      "drugs": ["Drug A", "Drug B"],
      "severity": "Mild" | "Moderate" | "Severe",
      "mechanism": "Clinical mechanism of this interaction.",
      "recommendation": "Specific action the pharmacist should take."
    }}
  ]
}}
If no interactions exist, set "severity" to "None", "has_interactions" to false, and "details" to an empty list []."""

    model = os.getenv('CLAUDE_MODEL', 'claude-sonnet-4-6')
    
    response = client.messages.create(
        model=model,
        max_tokens=1500,
        temperature=0.0,
        system=system_instruction,
        messages=[
            {"role": "user", "content": user_prompt}
        ]
    )

    content_text = response.content[0].text.strip()
    
    # Clean up markdown code blocks if the model ignored system instructions
    if content_text.startswith("```json"):
        content_text = content_text[len("```json"):].strip()
    if content_text.endswith("```"):
        content_text = content_text[:-3].strip()

    return json.loads(content_text)


def check_prescription_interactions(drugs_list):
    """
    Core checker logic wrapping caching, single-drug bypass, and API error safety.
    """
    valid_drugs = [d for d in drugs_list if d.get('drug_name', '').strip()]
    
    # Handle single drug edge case (skip API)
    if len(valid_drugs) <= 1:
        return {
            "severity": "None",
            "has_interactions": False,
            "summary": "Interaction check not required for a single drug.",
            "details": []
        }

    # Generate cache key
    cache_key = normalize_drug_key(valid_drugs)
    
    # Try looking up database cache
    try:
        cached_entry = InteractionCache.objects.filter(combination_key=cache_key).first()
        if cached_entry:
            return json.loads(cached_entry.result_json)
    except Exception as e:
        logger.error(f"Error reading cache: {e}")

    # Call Claude API
    try:
        result = call_claude_for_interactions(valid_drugs)
        
        # Save response in database cache
        try:
            InteractionCache.objects.update_or_create(
                combination_key=cache_key,
                defaults={
                    "severity": result.get("severity", "None"),
                    "result_json": json.dumps(result)
                }
            )
        except Exception as e:
            logger.error(f"Error writing cache: {e}")
            
        return result
    except Exception as e:
        logger.error(f"Claude API failed: {e}")
        # Graceful fallback: return a friendly error dictionary instead of crashing
        return {
            "severity": "Error",
            "has_interactions": False,
            "summary": f"Interaction check temporarily unavailable: {str(e)}",
            "details": []
        }
