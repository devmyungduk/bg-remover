#!/bin/bash

echo "🎨 Starting ComfyUI..."

# ==========================================
# Stop existing ComfyUI process
# ==========================================
EXISTING_PID=$(ps aux | grep "python.*main.py" | grep -v grep | awk '{print $2}')

if [ ! -z "$EXISTING_PID" ]; then
  echo "⏹️  Stopping existing ComfyUI (PID: $EXISTING_PID)..."
  kill $EXISTING_PID
  sleep 2
fi

# ==========================================
# Start ComfyUI
# ==========================================
cd /workspace/ComfyUI
source venv/bin/activate

echo "✅ Starting ComfyUI on port 8188..."
echo "📍 Access at: http://[POD-IP]:[PORT]/"
echo "📍 Background Removal App: http://[POD-IP]:[PORT]/bg_remove"
echo ""
echo "🔍 Logs saved to: /tmp/comfyui.log"
echo ""

# Run in background with log output
nohup python main.py --preview-method auto --listen --port 8188 --enable-cors-header > /tmp/comfyui.log 2>&1 &

echo "✅ ComfyUI started (PID: $!)"
echo ""
echo "📋 Useful commands:"
echo "   View logs:  tail -f /tmp/comfyui.log"
echo "   Stop:       pkill -f 'python.*main.py'"
echo "   Restart:    $0"
