#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# HealthOS-Med Fine-Tuning Script
# Runs LoRA fine-tuning on Med42 8B using MLX on Apple M1 Max
#
# Training data: 40,854 examples from VisioCorp health intelligence
# Base model: m42-health/Llama3-Med42-8B
# Method: LoRA (Low-Rank Adaptation) — trains adapter weights only
# Hardware: Apple M1 Max 32GB — uses Metal GPU acceleration
#
# Usage: bash scripts/finetune-healthos.sh
# Time: ~2-4 hours on M1 Max with 40K examples
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e
# Use ml-toolkit venv with Python 3.13 + MLX 0.31.1
VENV="/Users/hga/ml-toolkit/.venv"
export PATH="$VENV/bin:$PATH"
PYTHON="$VENV/bin/python3"

BASE="/Users/hga/netcare-healthos"
MODEL_DIR="$BASE/ml/models/med42-mlx"
DATA_DIR="$BASE/ml/training-data"
ADAPTER_DIR="$BASE/ml/models/healthos-adapter-v3"
FUSED_DIR="$BASE/ml/models/healthos-fused-v3"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  HealthOS-Med — LoRA Fine-Tuning on Apple M1 Max"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Base model:    Med42 8B (Llama3-Med42-8B)"
echo "Training data: 36,768 train / 2,043 valid / 2,043 test"
echo "Method:        LoRA (rank=8, alpha=16)"
echo "Hardware:      M1 Max 32GB (Metal GPU)"
echo ""

# Step 1: Verify model exists
if [ ! -d "$MODEL_DIR" ]; then
    echo "❌ Base model not found at $MODEL_DIR"
    echo "   Run: python3 -c \"from huggingface_hub import snapshot_download; snapshot_download('m42-health/Llama3-Med42-8B', local_dir='$MODEL_DIR')\""
    exit 1
fi
echo "✓ Base model found"

# Step 2: Verify training data
if [ ! -f "$DATA_DIR/train.jsonl" ]; then
    echo "❌ Training data not found. Run: npx tsx scripts/generate-training-data.ts"
    exit 1
fi
TRAIN_COUNT=$(wc -l < "$DATA_DIR/train.jsonl" | tr -d ' ')
echo "✓ Training data: $TRAIN_COUNT examples"

# Step 3: Run LoRA fine-tuning
echo ""
echo "Starting LoRA fine-tuning..."
echo "This will take 2-4 hours on M1 Max."
echo ""

mkdir -p "$ADAPTER_DIR"

$PYTHON -m mlx_lm lora \
    --model "$MODEL_DIR" \
    --data "$DATA_DIR" \
    --train \
    --adapter-path "$ADAPTER_DIR" \
    --iters 1000 \
    --batch-size 4 \
    --num-layers 16 \
    --learning-rate 1e-5 \
    --steps-per-report 50 \
    --steps-per-eval 200 \
    --val-batches 25 \
    --save-every 200 \
    --max-seq-length 2048 \
    --grad-checkpoint

echo ""
echo "✓ LoRA training complete"
echo "  Adapter saved to: $ADAPTER_DIR"

# Step 4: Fuse adapter with base model
echo ""
echo "Fusing LoRA adapter with base model..."

$PYTHON -m mlx_lm fuse \
    --model "$MODEL_DIR" \
    --adapter-path "$ADAPTER_DIR" \
    --save-path "$FUSED_DIR"

echo "✓ Fused model saved to: $FUSED_DIR"

# Step 5: Test the fused model
echo ""
echo "Testing fine-tuned model..."

$PYTHON -c "
from mlx_lm import load, generate

model, tokenizer = load('$FUSED_DIR')

prompts = [
    'What ICD-10-ZA code should I use for Type 2 diabetes?',
    'Is S72.0 valid without an external cause code in South Africa?',
    'What switch routes GEMS claims?',
]

for prompt in prompts:
    print(f'Q: {prompt}')
    response = generate(model, tokenizer, prompt=prompt, max_tokens=200)
    print(f'A: {response[:300]}')
    print('---')
"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  FINE-TUNING COMPLETE"
echo ""
echo "  Next steps:"
echo "  1. Convert to Ollama: see scripts/convert-to-ollama.sh"
echo "  2. Test: ollama run healthos-med-v2"
echo "  3. Update src/lib/ml/ollama.ts model references"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
