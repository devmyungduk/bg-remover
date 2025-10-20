#!/bin/bash

echo "🚀 Building and Deploying Vue.js App to ComfyUI..."

# ==========================================
# Configuration
# ==========================================
VUE_APP_DIR="/workspace/bg_removal_vue_app"
COMFYUI_WEB_DIR="/workspace/ComfyUI/custom_nodes/rmbg_web/web"

# ==========================================
# 1. Build Vue.js App
# ==========================================
echo "📦 Building Vue.js app..."
cd $VUE_APP_DIR

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📥 Installing dependencies..."
  npm install
fi

# Build
npm run build

# Verify build
if [ ! -d "dist" ]; then
  echo "❌ Build failed! dist/ directory not found."
  exit 1
fi

echo "✅ Build completed!"

# ==========================================
# 2. Backup existing deployment
# ==========================================
if [ -d "$COMFYUI_WEB_DIR" ]; then
  BACKUP_DIR="${COMFYUI_WEB_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
  echo "💾 Backing up to: $BACKUP_DIR"
  mv $COMFYUI_WEB_DIR $BACKUP_DIR
fi

# ==========================================
# 3. Deploy to ComfyUI
# ==========================================
echo "📂 Deploying to ComfyUI custom node..."
mkdir -p $COMFYUI_WEB_DIR
cp -r dist/* $COMFYUI_WEB_DIR/

# ==========================================
# 4. Fix asset paths in index.html
# ==========================================
echo "🔧 Fixing asset paths in index.html..."
cd $COMFYUI_WEB_DIR

# Get actual filenames
JS_FILE=$(ls assets/index-*.js 2>/dev/null | head -1 | xargs basename)
CSS_FILE=$(ls assets/index-*.css 2>/dev/null | head -1 | xargs basename)

if [ -z "$JS_FILE" ] || [ -z "$CSS_FILE" ]; then
  echo "❌ Asset files not found!"
  exit 1
fi

# Generate corrected index.html
cat > index.html << HTML
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/bg_remove/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Background Removal App</title>
    <script type="module" crossorigin src="/bg_remove/assets/${JS_FILE}"></script>
    <link rel="stylesheet" crossorigin href="/bg_remove/assets/${CSS_FILE}">
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
HTML

echo "✅ Deployment completed!"
echo ""
echo "📋 Files deployed to:"
echo "   $COMFYUI_WEB_DIR"
echo ""
echo "🔄 Next steps:"
echo "1. Restart ComfyUI:"
echo "   pkill -f 'python.*main.py'"
echo "   /workspace/run_gpu.sh"
echo ""
echo "2. Access the app:"
echo "   http://[POD-IP]:[PORT]/bg_remove"
