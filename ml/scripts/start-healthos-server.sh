#!/bin/bash
# HealthOS-Med Server — start/stop/status
# Fine-tuned model + RAG + exact database lookup
# Must be running for Claims Analyzer AI suggestions

PIDFILE="/tmp/healthos-server.pid"
LOGFILE="/tmp/healthos-server.log"
PORT=8800
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER="$SCRIPT_DIR/healthos-server.py"

case "${1:-start}" in
    start)
        if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
            echo "HealthOS-Med already running (PID $(cat "$PIDFILE")), port $PORT"
            exit 0
        fi

        echo "Starting HealthOS-Med server on port $PORT..."
        cd "$(dirname "$SCRIPT_DIR")/.."
        nohup python3 "$SERVER" --port "$PORT" > "$LOGFILE" 2>&1 &
        echo $! > "$PIDFILE"
        echo "PID: $(cat "$PIDFILE")"

        # Wait for ready
        for i in $(seq 1 60); do
            if curl -s "http://localhost:$PORT/health" > /dev/null 2>&1; then
                echo "Ready — http://localhost:$PORT"
                curl -s "http://localhost:$PORT/stats" | python3 -m json.tool 2>/dev/null
                exit 0
            fi
            sleep 1
        done
        echo "Timeout waiting for server. Check $LOGFILE"
        ;;

    stop)
        if [ -f "$PIDFILE" ]; then
            kill "$(cat "$PIDFILE")" 2>/dev/null
            rm -f "$PIDFILE"
            echo "Stopped."
        else
            echo "Not running."
        fi
        ;;

    restart)
        $0 stop
        sleep 2
        $0 start
        ;;

    status)
        if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
            echo "Running (PID $(cat "$PIDFILE"))"
            curl -s "http://localhost:$PORT/stats" | python3 -m json.tool 2>/dev/null
        else
            echo "Not running."
        fi
        ;;

    logs)
        tail -50 "$LOGFILE"
        ;;

    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        ;;
esac
