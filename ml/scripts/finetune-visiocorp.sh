#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# VisioCorp AI — Complete Fine-Tuning Pipeline
# ═══════════════════════════════════════════════════════════════════════════════
#
# Trains a local Llama model on ALL VisioCorp knowledge:
#   - 36K health claims Q&A pairs (ICD-10, NAPPI, schemes, law)
#   - 3K+ VisioCorp business Q&A pairs (products, strategy, outreach, people)
#   - Total: ~40K training examples
#
# Base model: Med42-MLX (Llama 8B fine-tuned for medicine, converted to MLX)
# Method: LoRA (Low-Rank Adaptation) — efficient, fast, preserves base knowledge
#
# Usage:
#   ./finetune-visiocorp.sh              # Full pipeline (generate data → train → test → export)
#   ./finetune-visiocorp.sh train        # Train only (skip data generation)
#   ./finetune-visiocorp.sh test         # Test existing adapter
#   ./finetune-visiocorp.sh export       # Export fused model for LM Studio
#   ./finetune-visiocorp.sh chat         # Interactive chat with the trained model
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# ─── Paths ───────────────────────────────────────────────────────────────────

ML_DIR="$HOME/netcare-healthos/ml"
SCRIPTS_DIR="$ML_DIR/scripts"
DATA_DIR="$ML_DIR/training-data"
COMBINED_DIR="$DATA_DIR/combined"
MODEL_DIR="$ML_DIR/models/med42-mlx"
ADAPTER_DIR="$ML_DIR/models/visiocorp-adapter"
FUSED_DIR="$ML_DIR/models/visiocorp-fused"

# ─── Training Hyperparameters ────────────────────────────────────────────────

ITERS=1000           # Training iterations (was 500 for health-only, 1000 for combined)
BATCH_SIZE=2         # Batch size (2 for 8B model on M-series Mac)
LEARNING_RATE=1e-5   # Conservative LR to preserve base knowledge
NUM_LAYERS=16        # Fine-tune top 16 of 32 layers (balance: new knowledge + base retention)
MAX_SEQ_LENGTH=2048  # Max sequence length
SAVE_EVERY=200       # Checkpoint every 200 steps
LORA_RANK=8          # LoRA rank (8 = good balance of capacity vs efficiency)
GRAD_ACCUM=4         # Gradient accumulation (effective batch = 2 × 4 = 8)

# ─── Colors ──────────────────────────────────────────────────────────────────

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${BLUE}[VisioCorp AI]${NC} $1"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }

# ─── Step 1: Generate Training Data ─────────────────────────────────────────

generate_data() {
    log "Step 1: Generating VisioCorp training data..."

    # Generate VisioCorp Q&A pairs from all sources
    python3 "$SCRIPTS_DIR/generate-visiocorp-training-data.py"

    # Create combined directory
    mkdir -p "$COMBINED_DIR"

    # Combine health + VisioCorp training data
    log "Combining health (36K) + VisioCorp (3K+) training data..."
    cat "$DATA_DIR/train.jsonl" "$DATA_DIR/visiocorp/train.jsonl" > "$COMBINED_DIR/train.jsonl"
    cat "$DATA_DIR/valid.jsonl" "$DATA_DIR/visiocorp/valid.jsonl" > "$COMBINED_DIR/valid.jsonl"
    cat "$DATA_DIR/test.jsonl" "$DATA_DIR/visiocorp/test.jsonl" > "$COMBINED_DIR/test.jsonl"

    # Shuffle training data for better learning
    python3 -c "
import random
with open('$COMBINED_DIR/train.jsonl') as f:
    lines = f.readlines()
random.seed(42)
random.shuffle(lines)
with open('$COMBINED_DIR/train.jsonl', 'w') as f:
    f.writelines(lines)
print(f'Shuffled {len(lines)} training examples')
"

    TRAIN_COUNT=$(wc -l < "$COMBINED_DIR/train.jsonl")
    VALID_COUNT=$(wc -l < "$COMBINED_DIR/valid.jsonl")
    TEST_COUNT=$(wc -l < "$COMBINED_DIR/test.jsonl")

    success "Combined dataset: ${TRAIN_COUNT} train / ${VALID_COUNT} valid / ${TEST_COUNT} test"
}

# ─── Step 2: Train ───────────────────────────────────────────────────────────

train() {
    log "Step 2: Starting LoRA fine-tuning..."
    log "  Base model: $MODEL_DIR"
    log "  Data: $COMBINED_DIR"
    log "  Adapter output: $ADAPTER_DIR"
    log "  Iterations: $ITERS | Batch: $BATCH_SIZE | LR: $LEARNING_RATE"
    log "  Layers: $NUM_LAYERS | LoRA rank: $LORA_RANK | Grad accum: $GRAD_ACCUM"
    echo ""

    # Check base model exists
    if [ ! -f "$MODEL_DIR/model.safetensors" ] && [ ! -f "$MODEL_DIR/model.safetensors.index.json" ]; then
        error "Base model not found at $MODEL_DIR"
    fi

    # Check training data exists
    if [ ! -f "$COMBINED_DIR/train.jsonl" ]; then
        warn "Combined data not found. Running data generation first..."
        generate_data
    fi

    mkdir -p "$ADAPTER_DIR"

    # Check if resuming from checkpoint
    RESUME_FLAG=""
    if [ -f "$ADAPTER_DIR/adapters.safetensors" ]; then
        warn "Existing adapter found. Resuming training..."
        RESUME_FLAG="--resume-adapter-file $ADAPTER_DIR/adapters.safetensors"
    fi

    # Run LoRA training
    python3 -m mlx_lm lora \
        --model "$MODEL_DIR" \
        --data "$COMBINED_DIR" \
        --adapter-path "$ADAPTER_DIR" \
        --train \
        --iters $ITERS \
        --batch-size $BATCH_SIZE \
        --learning-rate $LEARNING_RATE \
        --num-layers $NUM_LAYERS \
        --max-seq-length $MAX_SEQ_LENGTH \
        --save-every $SAVE_EVERY \
        --steps-per-report 50 \
        --steps-per-eval 200 \
        --val-batches 25 \
        --grad-accumulation-steps $GRAD_ACCUM \
        --mask-prompt \
        $RESUME_FLAG

    success "Training complete! Adapter saved to $ADAPTER_DIR"
}

# ─── Step 3: Test ────────────────────────────────────────────────────────────

test_model() {
    log "Step 3: Testing fine-tuned model..."

    if [ ! -f "$ADAPTER_DIR/adapters.safetensors" ]; then
        error "No adapter found at $ADAPTER_DIR. Run training first."
    fi

    python3 -m mlx_lm lora \
        --model "$MODEL_DIR" \
        --data "$COMBINED_DIR" \
        --adapter-path "$ADAPTER_DIR" \
        --test \
        --test-batches 100

    success "Test evaluation complete!"
}

# ─── Step 4: Export Fused Model ──────────────────────────────────────────────

export_model() {
    log "Step 4: Fusing adapter into base model for LM Studio..."

    if [ ! -f "$ADAPTER_DIR/adapters.safetensors" ]; then
        error "No adapter found at $ADAPTER_DIR. Run training first."
    fi

    mkdir -p "$FUSED_DIR"

    python3 -m mlx_lm fuse \
        --model "$MODEL_DIR" \
        --adapter-path "$ADAPTER_DIR" \
        --save-path "$FUSED_DIR"

    # Copy tokenizer files
    for f in tokenizer.json tokenizer_config.json special_tokens_map.json chat_template.jinja; do
        if [ -f "$MODEL_DIR/$f" ]; then
            cp "$MODEL_DIR/$f" "$FUSED_DIR/" 2>/dev/null || true
        fi
    done

    FUSED_SIZE=$(du -sh "$FUSED_DIR" | cut -f1)
    success "Fused model saved to $FUSED_DIR ($FUSED_SIZE)"
    log ""
    log "To use in LM Studio:"
    log "  1. Open LM Studio → My Models → Import"
    log "  2. Point to: $FUSED_DIR"
    log "  3. Select model → Chat"
    log ""
    log "Or convert to GGUF for wider compatibility:"
    log "  python3 -m mlx_lm convert --model $FUSED_DIR --to-gguf -q q4_k_m"
}

# ─── Step 5: Interactive Chat ────────────────────────────────────────────────

chat() {
    log "Starting interactive chat with VisioCorp AI..."

    if [ -d "$FUSED_DIR" ] && [ -f "$FUSED_DIR/model.safetensors" ]; then
        log "Using fused model: $FUSED_DIR"
        MODEL_PATH="$FUSED_DIR"
        ADAPTER_FLAG=""
    elif [ -f "$ADAPTER_DIR/adapters.safetensors" ]; then
        log "Using base + adapter: $MODEL_DIR + $ADAPTER_DIR"
        MODEL_PATH="$MODEL_DIR"
        ADAPTER_FLAG="--adapter-path $ADAPTER_DIR"
    else
        error "No trained model found. Run training first."
    fi

    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "  VisioCorp AI — Local Intelligence Engine"
    echo "  Type your question. Ctrl+C to exit."
    echo "═══════════════════════════════════════════════════════════"
    echo ""

    while true; do
        read -p "You: " USER_INPUT
        if [ -z "$USER_INPUT" ]; then continue; fi

        # Check RAG server for context
        RAG_CONTEXT=""
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:8765 2>/dev/null | grep -q "200"; then
            RAG_CONTEXT=$(curl -s -X POST http://localhost:8765 \
                -H "Content-Type: application/json" \
                -d "{\"query\": \"$USER_INPUT\", \"top_k\": 3}" 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('context',''))" 2>/dev/null || echo "")
        fi

        # Build prompt with RAG context
        if [ -n "$RAG_CONTEXT" ]; then
            FULL_PROMPT="Context from VisioCorp knowledge base:\n${RAG_CONTEXT}\n\nQuestion: ${USER_INPUT}"
        else
            FULL_PROMPT="$USER_INPUT"
        fi

        echo ""
        python3 -m mlx_lm generate \
            --model "$MODEL_PATH" \
            $ADAPTER_FLAG \
            --prompt "$FULL_PROMPT" \
            --max-tokens 512 \
            --temp 0.7 \
            --top-p 0.9 \
            2>/dev/null
        echo ""
    done
}

# ─── Step 6: Update RAG Index ────────────────────────────────────────────────

update_rag() {
    log "Updating RAG vector index..."
    python3 "$SCRIPTS_DIR/build-rag-index.py"
    success "RAG index updated!"
}

# ─── Full Pipeline ───────────────────────────────────────────────────────────

full_pipeline() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  VisioCorp AI — Full Training Pipeline"
    echo "  Base: Med42-MLX (Llama 8B medical)"
    echo "  Target: VisioCorp + Healthcare intelligence"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""

    generate_data
    echo ""
    update_rag
    echo ""
    train
    echo ""
    test_model
    echo ""
    export_model

    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    success "VisioCorp AI is ready!"
    echo ""
    log "Quick start:"
    log "  Chat:     ./finetune-visiocorp.sh chat"
    log "  RAG:      python3 ml/scripts/rag-query.py --serve --port 8765"
    log "  LM Studio: Import from $FUSED_DIR"
    echo "═══════════════════════════════════════════════════════════════"
}

# ─── Main ────────────────────────────────────────────────────────────────────

cd "$HOME/netcare-healthos"

case "${1:-full}" in
    generate)  generate_data ;;
    train)     train ;;
    test)      test_model ;;
    export)    export_model ;;
    chat)      chat ;;
    rag)       update_rag ;;
    full)      full_pipeline ;;
    *)
        echo "Usage: $0 {full|generate|train|test|export|chat|rag}"
        echo ""
        echo "  full      Run complete pipeline (generate → rag → train → test → export)"
        echo "  generate  Generate/refresh training data from all sources"
        echo "  train     Run LoRA fine-tuning"
        echo "  test      Evaluate on test set"
        echo "  export    Fuse adapter into base model for LM Studio"
        echo "  chat      Interactive chat with trained model (+ RAG)"
        echo "  rag       Update the RAG vector index"
        ;;
esac
