# ComfyUI Custom Node - Background Removal WebUI

> Custom node that integrates Vue.js web app into ComfyUI as a subpath route

## 🎯 Purpose

Serve the Vue.js background removal app as part of ComfyUI's web interface at `/bg_remove` path.

## 🏗️ Structure
```
comfyui-custom-node/
├── __init__.py          # Route configuration
└── web/                 # Vue.js build files (deployed here)
    ├── index.html
    ├── vite.svg
    └── assets/
        ├── index-*.js
        └── index-*.css
```

## 📦 Installation

### Manual Installation
```bash
# Navigate to ComfyUI custom_nodes directory
cd /workspace/ComfyUI/custom_nodes

# Create directory
mkdir -p rmbg_web/web

# Copy __init__.py
cp /path/to/__init__.py rmbg_web/

# Deploy Vue.js build files
cp -r /path/to/vue-app/dist/* rmbg_web/web/
```

### Automated Installation
```bash
# Use deployment script
/workspace/scripts/build-and-deploy.sh
```

## 🔧 Configuration (__init__.py)

### Core Implementation
```python
import os
import server
from aiohttp import web

# Web resource root directory
WEBROOT = os.path.join(os.path.dirname(os.path.realpath(__file__)), "web")

# Route: /bg_remove (main page)
@server.PromptServer.instance.routes.get("/bg_remove")
async def bg_remove_page(request):
    return web.FileResponse(os.path.join(WEBROOT, "index.html"))

# Route: /bg_remove/assets/ (static files)
server.PromptServer.instance.routes.static(
    "/bg_remove/assets/",
    path=os.path.join(WEBROOT, "assets")
)

# Route: /bg_remove/vite.svg (favicon)
vite_svg_path = os.path.join(WEBROOT, "vite.svg")
if os.path.exists(vite_svg_path):
    @server.PromptServer.instance.routes.get("/bg_remove/vite.svg")
    async def vite_svg(request):
        return web.FileResponse(vite_svg_path)

print(f"[rmbg_web] ✅ Background Removal WebUI loaded from: {WEBROOT}")
```

## 🚀 Usage

### Access the App
```
http://[RUNPOD-IP]:[PORT]/bg_remove
```

### Access ComfyUI Main UI
```
http://[RUNPOD-IP]:[PORT]/
```

Both routes work independently! ✨

## ⚙️ Key Design Principles

### 1. Namespace Isolation ⭐

**✅ Correct:**
```python
@server.routes.get("/bg_remove")          # Namespaced
server.routes.static("/bg_remove/assets/") # Namespaced
```

**❌ Incorrect:**
```python
@server.routes.get("/")        # Conflicts with ComfyUI main UI!
server.routes.static("/assets/") # Conflicts with ComfyUI assets!
```

### 2. Relative Path Support

All Vue.js assets use absolute paths with `/bg_remove/` prefix:
```html



```

### 3. aiohttp Integration

ComfyUI uses `aiohttp` web framework. Custom nodes can add routes via:
```python
server.PromptServer.instance.routes  # aiohttp.web.RouteTableDef
```

## 🔄 Update Process

### 1. Rebuild Vue.js App
```bash
cd /workspace/bg_removal_vue_app
npm run build
```

### 2. Deploy to Custom Node
```bash
cp -r dist/* /workspace/ComfyUI/custom_nodes/rmbg_web/web/
```

### 3. Restart ComfyUI
```bash
pkill -f "python.*main.py"
cd /workspace/ComfyUI
python main.py --listen --port 8188 --enable-cors-header
```

## 🐛 Troubleshooting

### Issue: `/bg_remove` returns 404

**Cause:** `__init__.py` not loaded

**Solution:**
```bash
# Verify file exists
ls -la /workspace/ComfyUI/custom_nodes/rmbg_web/__init__.py

# Delete cache
rm -rf /workspace/ComfyUI/custom_nodes/rmbg_web/__pycache__

# Restart ComfyUI
```

### Issue: Assets return 404

**Cause:** Missing `base` configuration in `vite.config.js`

**Solution:**
```javascript
// vite.config.js
export default defineConfig({
  base: '/bg_remove/',  // ⭐ Required!
})
```

### Issue: Main ComfyUI UI broken

**Cause:** Root path (`/`) routing conflict

**Solution:**
```python
# Remove root path routing from __init__.py
# Only use namespaced routes: /bg_remove, /bg_remove/assets/, etc.
```

## 📖 Documentation

See [03. ComfyUI Integration](../docs/03-comfyui-integration.md)

## 🔗 Related Files

- **Deployment Script:** `../scripts/build-and-deploy.sh`
- **Vue.js App:** `../vue-app/`
- **Integration Guide:** `../docs/03-comfyui-integration.md`

## 📝 License

MIT
