#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# VisioCorp AI — Company Knowledge Fine-Tuning
# ═══════════════════════════════════════════════════════════════════════════════
#
# Trains on VisioCorp COMPANY knowledge ONLY:
#   - Products (25+), strategy, people, outreach, business model
#   - Session conversations, memory files, Steinberg KB
#   - NOT the health claims data (that's for the HealthOS agent)
#
# Base: Med42-MLX (Llama 8B)
# Output: visiocorp-company-adapter (separate from healthos-adapter)
# ═══════════════════════════════════════════════════════════════════════════════

set -e

ML_DIR="$HOME/netcare-healthos/ml"
DATA_DIR="$ML_DIR/training-data/visiocorp"
MODEL_DIR="$ML_DIR/models/med42-mlx"
ADAPTER_DIR="$ML_DIR/models/visiocorp-company-adapter"
FUSED_DIR="$ML_DIR/models/visiocorp-company-fused"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'
log() { echo -e "${BLUE}[VisioCorp]${NC} $1"; }

cd "$HOME/netcare-healthos"

case "${1:-train}" in
    train)
        log "Fine-tuning on VisioCorp company knowledge (3,422 examples)..."
        log "Base: $MODEL_DIR"
        log "Data: $DATA_DIR"
        log "Output: $ADAPTER_DIR"
        echo ""

        mkdir -p "$ADAPTER_DIR"

        python3 -m mlx_lm lora \
            --model "$MODEL_DIR" \
            --data "$DATA_DIR" \
            --adapter-path "$ADAPTER_DIR" \
            --train \
            --iters 600 \
            --batch-size 2 \
            --learning-rate 2e-5 \
            --num-layers 16 \
            --max-seq-length 2048 \
            --save-every 100 \
            --steps-per-report 25 \
            --steps-per-eval 100 \
            --val-batches 25 \
            --grad-accumulation-steps 4 \
            --mask-prompt

        echo -e "${GREEN}✅ VisioCorp company adapter saved to $ADAPTER_DIR${NC}"
        ;;

    test)
        log "Testing VisioCorp company model..."
        python3 -m mlx_lm lora \
            --model "$MODEL_DIR" \
            --data "$DATA_DIR" \
            --adapter-path "$ADAPTER_DIR" \
            --test \
            --test-batches 50
        ;;

    export)
        log "Fusing VisioCorp company adapter..."
        mkdir -p "$FUSED_DIR"
        python3 -m mlx_lm fuse \
            --model "$MODEL_DIR" \
            --adapter-path "$ADAPTER_DIR" \
            --save-path "$FUSED_DIR"

        for f in tokenizer.json tokenizer_config.json special_tokens_map.json chat_template.jinja; do
            [ -f "$MODEL_DIR/$f" ] && cp "$MODEL_DIR/$f" "$FUSED_DIR/" 2>/dev/null || true
        done
        echo -e "${GREEN}✅ Fused model at $FUSED_DIR — import into LM Studio${NC}"
        ;;

    chat)
        log "Chat with VisioCorp AI..."
        if [ -d "$FUSED_DIR" ]; then
            python3 -m mlx_lm generate --model "$FUSED_DIR" --prompt "${2:-What products does VisioCorp build?}" --max-tokens 512 --temp 0.7
        else
            python3 -m mlx_lm generate --model "$MODEL_DIR" --adapter-path "$ADAPTER_DIR" --prompt "${2:-What products does VisioCorp build?}" --max-tokens 512 --temp 0.7
        fi
        ;;

    *)
        echo "Usage: $0 {train|test|export|chat}"
        ;;
esac
