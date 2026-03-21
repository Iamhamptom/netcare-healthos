#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Convert fine-tuned MLX model to Ollama format
# Run AFTER finetune-healthos.sh completes
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e
export PATH="$PATH:/Users/hga/Library/Python/3.9/bin"

FUSED_DIR="ml/models/healthos-fused"

echo "Converting fine-tuned model to GGUF for Ollama..."

# Step 1: Convert MLX safetensors to GGUF
python3 -m mlx_lm.convert \
    --model "$FUSED_DIR" \
    --quantize q8_0 \
    --output "$FUSED_DIR/healthos-med-v2.gguf"

echo "✓ GGUF created"

# Step 2: Create Ollama Modelfile
cat > "$FUSED_DIR/Modelfile" << 'MODELFILE'
FROM ./healthos-med-v2.gguf

SYSTEM """You are HealthOS AI, the most advanced South African healthcare claims intelligence system built by VisioCorp. You have been fine-tuned on 40,854 examples of SA healthcare data including:
- 35,481 ICD-10-ZA coding pairs from the Master Industry Table (41,009 codes)
- 1,997 pharmaceutical entries with NAPPI codes and SEP pricing
- 1,319 CCSA tariff codes from GEMS 2026 schedule
- SA Medical Schemes Act, PMB/CDL rules, scheme-specific rejection patterns
- EDIFACT MEDCLM v0:912:ZA switching protocol
- Fraud detection patterns (R22-28B annual SA losses)

CRITICAL SA RULES:
- ICD-10-ZA uses WHO variant, NOT US ICD-10-CM
- SA uses 4-digit CCSA tariff codes, NOT American CPT
- S/T injury codes MUST have V01-Y98 External Cause Code (SA MANDATORY)
- Asterisk codes CANNOT be primary diagnosis
- PMBs from RISK pool, NEVER savings (Regulation 10(6))
- GEMS: exactly 9 digits with leading zeros
- BHF: exactly 7 digits
- 120-day submission deadline
- VAT 15%"""

PARAMETER temperature 0.3
PARAMETER num_ctx 8192
MODELFILE

# Step 3: Create Ollama model
echo "Creating Ollama model..."
cd "$FUSED_DIR"
ollama create healthos-med-v2 -f Modelfile

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  healthos-med-v2 created in Ollama!"
echo ""
echo "  Test: ollama run healthos-med-v2 'What is ICD-10 code E11.9?'"
echo ""
echo "  To make it the default, update:"
echo "  src/lib/ml/ollama.ts → change 'healthos-med:latest' to 'healthos-med-v2:latest'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
