# 03. ComfyUI Integration Guide

> **Goal:** Integrate Vue.js build files as ComfyUI custom node and deploy

**Estimated Time:** 30-40 minutes

---

## 📋 Overview

### Integration Method
- Utilize ComfyUI's **aiohttp web server**
- Add routing as **custom node**
- Serve Vue.js build files as **static files**

### Core Concept
```
ComfyUI (Port 8188)
├── / (Main UI)
└── /bg_remove (Our App) ✨
    ├── /bg_remove/assets/
    └── /bg_remove/vite.svg
```

---

## 🚀 Step 1: Create Custom Node Directory

### 1-1. Directory Structure

```bash
cd /workspace/ComfyUI/custom_nodes
mkdir -p rmbg_web/web
cd rmbg_web
```

**Final Structure:**
```
/workspace/ComfyUI/custom_nodes/rmbg_web/
├── __init__.py          # Routing configuration (Core!)
└── web/                 # Vue.js build files
    ├── index.html
    ├── vite.svg
    └── assets/
        ├── index-DooTOS1Z.js
        └── index-D_2nttju.css
```

---

## 📝 Step 2: Create __init__.py

### 2-1. Understanding Basic Structure

ComfyUI automatically loads `__init__.py` in each custom node.

**Core Object:**
```python
import server

# ComfyUI's aiohttp server instance
server.PromptServer.instance.routes  # aiohttp.web.RouteTableDef
```

### 2-2. Complete __init__.py Code

```python
import os
import server
from aiohttp import web

# Web resource root (web folder)
WEBROOT = os.path.join(os.path.dirname(os.path.realpath(__file__)), "web")

# ==========================================
# 1. Main Page Route (/bg_remove)
# ==========================================
@server.PromptServer.instance.routes.get("/bg_remove")
async def bg_remove_page(request):
    """
    Returns index.html when accessing /bg_remove path
    """
    return web.FileResponse(os.path.join(WEBROOT, "index.html"))

# ==========================================
# 2. Assets Static Files Route
# ==========================================
server.PromptServer.instance.routes.static(
    "/bg_remove/assets/",  # URL path
    path=os.path.join(WEBROOT, "assets")  # Actual file path
)

# ==========================================
# 3. vite.svg Favicon Route
# ==========================================
vite_svg_path = os.path.join(WEBROOT, "vite.svg")
if os.path.exists(vite_svg_path):
    @server.PromptServer.instance.routes.get("/bg_remove/vite.svg")
    async def vite_svg(request):
        return web.FileResponse(vite_svg_path)

# ==========================================
# 4. Loading Confirmation Message
# ==========================================
print(f"[rmbg_web] ✅ Background Removal WebUI loaded from: {WEBROOT}")
```

### 2-3. Key Points

#### ❌ Never Do This

```python
# ❌ Root path (/) routing forbidden! Conflicts with ComfyUI main UI!
@server.routes.get("/")
async def index(request):
    return web.FileResponse(...)

# ❌ /assets/ root path forbidden!
server.routes.static("/assets/", ...)
```

#### ✅ Correct Method

```python
# ✅ Use namespace (/bg_remove)
@server.routes.get("/bg_remove")
async def bg_remove_page(request):
    return web.FileResponse(...)

# ✅ Namespaced assets (/bg_remove/assets/)
server.routes.static("/bg_remove/assets/", ...)
```

---

## 📦 Step 3: Deploy Vue.js Build Files

### 3-1. Run Build

```bash
cd /workspace/bg_removal_vue_app

# Vite build
npm run build
```

**Output:**
```
dist/
├── index.html
├── vite.svg
└── assets/
    ├── index-DooTOS1Z.js
    └── index-D_2nttju.css
```

### 3-2. Copy Files

```bash
# Copy dist contents to web folder
cp -r dist/* /workspace/ComfyUI/custom_nodes/rmbg_web/web/

# Verify
ls -la /workspace/ComfyUI/custom_nodes/rmbg_web/web/
```

### 3-3. Verify index.html Paths

**Important:** Verify assets paths in `index.html` are correct!

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/bg_remove/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>bg_removal_vue_app</title>
    <!-- ⭐ Absolute paths with /bg_remove/ namespace -->
    <script type="module" crossorigin src="/bg_remove/assets/index-DooTOS1Z.js"></script>
    <link rel="stylesheet" crossorigin href="/bg_remove/assets/index-D_2nttju.css">
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

**If paths are incorrect:**

```bash
cd /workspace/ComfyUI/custom_nodes/rmbg_web/web

# Get filenames
JS_FILE=$(ls assets/index-*.js | head -1 | xargs basename)
CSS_FILE=$(ls assets/index-*.css | head -1 | xargs basename)

# Generate index.html
cat > index.html << EOF
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/bg_remove/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>bg_removal_vue_app</title>
    <script type="module" crossorigin src="/bg_remove/assets/${JS_FILE}"></script>
    <link rel="stylesheet" crossorigin href="/bg_remove/assets/${CSS_FILE}">
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
EOF

echo "✅ index.html created"
```

---

## 🔄 Step 4: Restart ComfyUI

### 4-1. Stop Existing Process

```bash
# Find running ComfyUI process
ps aux | grep "python main.py" | grep -v grep

# Stop by PID
kill <PID>

# Or force stop
pkill -9 -f "python.*main.py"
```

### 4-2. Start ComfyUI

```bash
cd /workspace/ComfyUI
source venv/bin/activate

# Redirect to log file (background execution)
nohup python main.py --listen --port 8188 --enable-cors-header > /tmp/comfyui.log 2>&1 &

# Monitor log in real-time
tail -f /tmp/comfyui.log
```

### 4-3. Verify Startup

**Check for this message in log:**

```
[rmbg_web] ✅ Background Removal WebUI loaded from: /workspace/ComfyUI/custom_nodes/rmbg_web/web
...
Starting server...
To see the GUI go to: http://0.0.0.0:8188
```

---

## 🌐 Step 5: Access Test

### 5-1. Local Test

```bash
# Main UI check
curl -I http://127.0.0.1:8188/

# bg_remove page check
curl -I http://127.0.0.1:8188/bg_remove

# Assets check
curl -I http://127.0.0.1:8188/bg_remove/assets/index-DooTOS1Z.js
```

**Expected output:**
```
HTTP/1.1 200 OK
Content-Type: text/html
...
```

### 5-2. External Access

**Check External Port in RunPod Dashboard:**

```
http://[EXTERNAL-IP]:[EXTERNAL-PORT]/bg_remove
```

**Example:**
```
http://213.173.107.103:35702/bg_remove
```

### 5-3. Functionality Test

1. **Image Upload** - Verify file selection button works
2. **Background Removal** - Verify progress bar displays
3. **Result Display** - Verify Before/After slider works
4. **Download** - Verify image download button works

---

## 🔧 Step 6: Create Automation Script

### 6-1. build-and-deploy.sh

```bash
cat > /workspace/scripts/build-and-deploy.sh << 'EOF'
#!/bin/bash

echo "🚀 Building and Deploying Vue.js App to ComfyUI..."

# Variable configuration
VUE_APP_DIR="/workspace/bg_removal_vue_app"
COMFYUI_WEB_DIR="/workspace/ComfyUI/custom_nodes/rmbg_web/web"

# 1. Build Vue.js
echo "📦 Building Vue.js app..."
cd $VUE_APP_DIR

if [ ! -d "node_modules" ]; then
  echo "📥 Installing dependencies..."
  npm install
fi

npm run build

if [ ! -d "dist" ]; then
  echo "❌ Build failed! dist/ directory not found."
  exit 1
fi

echo "✅ Build completed!"

# 2. Backup existing files
if [ -d "$COMFYUI_WEB_DIR" ]; then
  echo "💾 Backing up existing files..."
  mv $COMFYUI_WEB_DIR ${COMFYUI_WEB_DIR}_backup_$(date +%Y%m%d_%H%M%S)
fi

# 3. Deploy new files
echo "📂 Deploying to ComfyUI..."
mkdir -p $COMFYUI_WEB_DIR
cp -r dist/* $COMFYUI_WEB_DIR/

# 4. Fix paths in index.html
echo "🔧 Fixing asset paths in index.html..."
cd $COMFYUI_WEB_DIR

JS_FILE=$(ls assets/index-*.js | head -1 | xargs basename)
CSS_FILE=$(ls assets/index-*.css | head -1 | xargs basename)

cat > index.html << HTML
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/bg_remove/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>bg_removal_vue_app</title>
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
echo "📋 Next steps:"
echo "1. Restart ComfyUI:"
echo "   cd /workspace/ComfyUI"
echo "   python main.py --listen --port 8188 --enable-cors-header"
echo ""
echo "2. Access the app:"
echo "   http://[YOUR-RUNPOD-IP]:[PORT]/bg_remove"
EOF

chmod +x /workspace/scripts/build-and-deploy.sh
```

### 6-2. Using Script

```bash
/workspace/scripts/build-and-deploy.sh
```

---

## 🐛 Step 7: Troubleshooting

### 7-1. "/bg_remove page returns 404"

**Cause:** `__init__.py` not loaded

**Solution:**
```bash
# Verify rmbg_web folder is in custom_nodes
ls -la /workspace/ComfyUI/custom_nodes/rmbg_web/

# Verify __init__.py file exists
cat /workspace/ComfyUI/custom_nodes/rmbg_web/__init__.py

# Restart ComfyUI
pkill -f "python.*main.py"
cd /workspace/ComfyUI
python main.py --listen --port 8188 --enable-cors-header
```

### 7-2. "Assets files return 404"

**Cause 1:** Missing Vite `base` configuration

**Solution:**
```javascript
// vite.config.js
export default defineConfig({
  base: '/bg_remove/',  // ⭐ Required for ComfyUI integration
  plugins: [vue()],
})
```

**Cause 2:** Incorrect paths in index.html

**Solution:**
```bash
cd /workspace/ComfyUI/custom_nodes/rmbg_web/web
cat index.html  # Verify paths

# Verify /bg_remove/assets/ path is correct
# Run automation script if needed
```

### 7-3. "ComfyUI Main UI Won't Load"

**Cause:** Root path (/) routing conflict

**Solution:**
```bash
# Remove root path routing from __init__.py
cat /workspace/ComfyUI/custom_nodes/rmbg_web/__init__.py

# If this code exists, delete it:
# @server.routes.get("/")
# server.routes.static("/assets/", ...)
```

---

## ✅ Integration Complete!

### Checklist

- [x] Custom node directory created
- [x] __init__.py created (namespace isolation)
- [x] Vue.js built and deployed
- [x] ComfyUI restarted
- [x] Access test successful
- [x] Automation script created

### Final Verification

```bash
# 1. ComfyUI Main UI
http://[IP]:[PORT]/

# 2. Background Removal App
http://[IP]:[PORT]/bg_remove

# Both should work! ✨
```

### Next Steps

👉 **[04. Troubleshooting](./04-troubleshooting.md)**

---

## 💡 Key Learning Points

### ComfyUI Custom Nodes
- Can add aiohttp routes via `__init__.py`
- **Namespace isolation** essential (prevent conflicts)
- Use `server.PromptServer.instance.routes`

### Static File Serving
- `web.FileResponse` - Single file
- `routes.static` - Entire directory

### Vite Build Optimization
- `base: '/bg_remove/'` configuration essential
- Use absolute paths instead of relative paths
- Cache management with hash filenames

**Integration Complete! Check troubleshooting guide now!** 🎉
