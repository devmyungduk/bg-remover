# 04. Troubleshooting Guide

> **Goal:** Solutions for all issues encountered during development

---

## 📋 Table of Contents

1. [Environment Setup Issues](#1-environment-setup-issues)
2. [Vue.js Development Issues](#2-vuejs-development-issues)
3. [ComfyUI Integration Issues](#3-comfyui-integration-issues)
4. [Network and Port Issues](#4-network-and-port-issues)
5. [Build and Deployment Issues](#5-build-and-deployment-issues)

---

## 1. Environment Setup Issues

### Issue 1-1: `node: command not found` After Node.js Installation

**Symptoms:**
```bash
node --version
# bash: node: command not found
```

**Cause:**
- NVM environment variables not loaded
- NVM path not set in new terminal session

**Solution:**

```bash
# 1. Manually load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 2. Verify
node --version  # v20.x.x

# 3. Permanent setup (optional)
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
source ~/.bashrc
```

---

### Issue 1-2: RMBG-2.0 Model Not Auto-Downloading

**Symptoms:**
```
Error: Model RMBG-2.0 not found
```

**Cause:**
- Hugging Face token not set
- Network connection issue
- Insufficient disk space

**Solution:**

```bash
# 1. Manual download
pip install huggingface_hub

# 2. Set token (optional)
export HF_TOKEN="your_token_here"

# 3. Download model
huggingface-cli download briaai/RMBG-2.0 \
  --local-dir /workspace/ComfyUI/models/rmbg \
  --local-dir-use-symlinks False

# 4. Verify
ls -lh /workspace/ComfyUI/models/rmbg/
# model.pth (approximately 176MB)
```

---

### Issue 1-3: `ModuleNotFoundError` When Starting ComfyUI

**Symptoms:**
```
ModuleNotFoundError: No module named 'torch'
```

**Cause:**
- Python virtual environment not activated

**Solution:**

```bash
# 1. Activate virtual environment
cd /workspace/ComfyUI
source venv/bin/activate

# 2. Verify Python path
which python
# /workspace/ComfyUI/venv/bin/python

# 3. Restart ComfyUI
python main.py --listen --port 8188 --enable-cors-header
```

---

## 2. Vue.js Development Issues

### Issue 2-1: `npm install` Fails

**Symptoms:**
```
npm ERR! code EACCES
npm ERR! permission denied
```

**Cause:**
- Permission issue
- Corrupted npm cache

**Solution:**

```bash
# 1. Clean npm cache
npm cache clean --force

# 2. Delete and reinstall
rm -rf node_modules package-lock.json
npm install

# 3. If permission issue
sudo chown -R $USER:$USER ~/.npm
npm install
```

---

### Issue 2-2: Vite Dev Server Not Accessible on RunPod

**Symptoms:**
```
npm run dev
# ➜  Local:   http://localhost:5173/
# Not accessible externally
```

**Cause:**
- Vite binds to localhost only by default
- RunPod requires binding to all interfaces (0.0.0.0)

**Solution:**

```bash
# 1. Add --host flag
npm run dev -- --host

# Or modify package.json
{
  "scripts": {
    "dev": "vite --host"
  }
}

# 2. External access
http://[RUNPOD-IP]:[PORT]/
```

---

### Issue 2-3: CORS Error When Calling ComfyUI API

**Symptoms:**
```
Access to fetch at 'http://localhost:8188/upload/image' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Cause:**
- ComfyUI not allowing CORS

**Solution:**

```bash
# 1. Add --enable-cors-header flag when starting ComfyUI
python main.py --listen --port 8188 --enable-cors-header

# 2. Vite proxy setup (development environment)
# vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/upload': 'http://127.0.0.1:8188',
      '/prompt': 'http://127.0.0.1:8188',
      '/history': 'http://127.0.0.1:8188',
      '/view': 'http://127.0.0.1:8188',
    }
  }
})
```

---

## 3. ComfyUI Integration Issues

### Issue 3-1: `/bg_remove` Works But `/` (Main UI) Doesn't Load ⚠️

**Symptoms:**
```
http://IP:PORT/          → 404 or blank page
http://IP:PORT/bg_remove → Works normally
```

**Cause:**
- `__init__.py` occupies root path (`/`) causing conflict with ComfyUI main UI

**Incorrect Code:**
```python
# ❌ This breaks main UI!
@server.PromptServer.instance.routes.get("/")
async def index(request):
    return web.FileResponse(os.path.join(WEBROOT, "index.html"))
```

**Correct Code:**
```python
# ✅ Use namespace only!
@server.PromptServer.instance.routes.get("/bg_remove")
async def bg_remove_page(request):
    return web.FileResponse(os.path.join(WEBROOT, "index.html"))
```

**Solution:**

```bash
# 1. Edit __init__.py
cd /workspace/ComfyUI/custom_nodes/rmbg_web
nano __init__.py

# 2. Remove root path routing
# Delete: @server.routes.get("/")

# 3. Restart ComfyUI
pkill -f "python.*main.py"
cd /workspace/ComfyUI
python main.py --listen --port 8188 --enable-cors-header

# 4. Verify
curl -I http://127.0.0.1:8188/          # 200 OK
curl -I http://127.0.0.1:8188/bg_remove # 200 OK
```

---

### Issue 3-2: Assets Files Return 404

**Symptoms:**
```
GET http://IP:PORT/assets/index-XXX.js 404 (Not Found)
GET http://IP:PORT/assets/index-XXX.css 404 (Not Found)
```

**Cause 1:** Missing Vite `base` configuration

**Solution:**
```javascript
// vite.config.js
export default defineConfig({
  base: '/bg_remove/',  // ⭐ Required!
  plugins: [vue()],
})
```

**Cause 2:** Paths in `index.html` not absolute

**Incorrect Code:**
```html
<!-- ❌ Relative paths -->
<script src="./assets/index-XXX.js"></script>
<link rel="stylesheet" href="assets/index-XXX.css">
```

**Correct Code:**
```html
<!-- ✅ Absolute paths + namespace -->
<script type="module" crossorigin src="/bg_remove/assets/index-XXX.js"></script>
<link rel="stylesheet" crossorigin href="/bg_remove/assets/index-XXX.css">
```

---

### Issue 3-3: Changes Not Reflected After Editing `__init__.py`

**Symptoms:**
- Modified `__init__.py`
- Restarted ComfyUI
- Still running old code

**Cause:**
- Python bytecode cache (`.pyc` files)

**Solution:**

```bash
# 1. Delete cache
rm -rf /workspace/ComfyUI/custom_nodes/rmbg_web/__pycache__

# 2. Restart ComfyUI
pkill -f "python.*main.py"
cd /workspace/ComfyUI
python main.py --listen --port 8188 --enable-cors-header

# 3. Verify
tail -f /tmp/comfyui.log | grep rmbg_web
```

---

## 4. Network and Port Issues

### Issue 4-1: Flask (5000) / Node.js (3000) Ports Not Accessible Externally

**Symptoms:**
```bash
# Works locally
curl http://127.0.0.1:5000/  # 200 OK

# Not accessible externally
curl http://EXTERNAL-IP:5000/  # Connection refused
```

**Cause:**
- RunPod only exposes ports set in **Direct TCP Ports**
- By default, only 8188, 8888 are exposed

**Solution:**

**Option 1: Use ComfyUI Port (8188) (Recommended)**
```bash
# Abandon Flask/Node.js server
# Serve everything through ComfyUI port 8188
# → Use custom node approach!
```

**Option 2: Add Port in RunPod (Not Recommended)**
```yaml
RunPod Dashboard → Edit Pod → Expose HTTP Ports
8188,5000,3000  # Add additional ports
```

---

### Issue 4-2: `Connection refused` Error

**Symptoms:**
```bash
curl http://127.0.0.1:8188/
# curl: (7) Failed to connect to 127.0.0.1 port 8188: Connection refused
```

**Cause:**
- ComfyUI not running
- Port occupied by another process

**Solution:**

```bash
# 1. Check ComfyUI process
ps aux | grep "python main.py"

# 2. Check port
netstat -tlnp | grep 8188
# or
lsof -i :8188

# 3. Stop other process if in use
kill <PID>

# 4. Restart ComfyUI
cd /workspace/ComfyUI
source venv/bin/activate
python main.py --listen --port 8188 --enable-cors-header
```

---

### Issue 4-3: IP/Port Changes After RunPod Pod Restart

**Symptoms:**
```
Before: http://213.173.107.103:35702/
Now:    http://213.173.108.10:12991/
```

**Cause:**
- RunPod assigns new IP/Port on Pod restart

**Solution:**

**✅ Use Relative Paths (Recommended)**
```javascript
// ✅ Good
fetch('/upload/image', { ... })

// ❌ Bad
fetch('http://213.173.107.103:35702/upload/image', { ... })
```

**✅ Use Network Volume**
```bash
# /workspace data preserved on Pod restart
# Only IP/Port changes, no need to redeploy
```

---

## 5. Build and Deployment Issues

### Issue 5-1: `npm run build` Fails

**Symptoms:**
```
ERROR: Failed to parse source map
```

**Cause:**
- Dependency version conflict
- Cache issue

**Solution:**

```bash
# 1. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# 2. Clean cache
npm cache clean --force

# 3. Retry build
npm run build
```

---

### Issue 5-2: Blank Page After Build

**Symptoms:**
- Build successful
- Deployment complete
- Browser shows blank page only

**Cause:**
- `base` path configuration error
- JavaScript file loading failed

**Solution:**

```bash
# 1. Check browser developer tools (F12)
# Check Console tab for errors

# 2. Check Network tab for 404 errors
# /assets/index-XXX.js → 404?

# 3. Verify vite.config.js
cat vite.config.js
# Check if base: '/bg_remove/' exists

# 4. Rebuild
npm run build

# 5. Redeploy
cp -r dist/* /workspace/ComfyUI/custom_nodes/rmbg_web/web/
```

---

### Issue 5-3: Image Comparison Slider Not Working

**Symptoms:**
- Images display but slider won't drag

**Cause:**
- Event listeners not registered
- CSS `z-index` issue

**Solution:**

```vue
<!-- ImageComparisonSlider.vue -->
<script setup>
import { ref, onUnmounted } from 'vue';

// ⚠️ Register directly in event handler, not onMounted
const startDrag = (event) => {
  isDragging.value = true;
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDrag);
};

// ⚠️ Cleanup on component unmount essential!
onUnmounted(() => {
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', stopDrag);
});
</script>

<style scoped>
.slider-handle {
  z-index: 10;  /* ⚠️ High enough z-index */
  cursor: ew-resize;
}
</style>
```

---

## 🔍 Debugging Tools and Commands

### Check ComfyUI Logs

```bash
# Real-time log
tail -f /tmp/comfyui.log

# Search for specific keywords
grep -i "error" /tmp/comfyui.log
grep -i "rmbg_web" /tmp/comfyui.log

# Last 50 lines
tail -50 /tmp/comfyui.log
```

### Network Testing

```bash
# Check ComfyUI status
curl http://127.0.0.1:8188/system_stats

# Check HTTP status code for specific page
curl -I http://127.0.0.1:8188/bg_remove
# HTTP/1.1 200 OK → Success
# HTTP/1.1 404 Not Found → Failed

# Check response body
curl http://127.0.0.1:8188/bg_remove
```

### Check Processes and Ports

```bash
# Python processes
ps aux | grep python

# Check specific port usage
netstat -tlnp | grep 8188
lsof -i :8188

# All open ports
netstat -tlnp
```

### Check File Structure

```bash
# View full tree
tree /workspace/ComfyUI/custom_nodes/rmbg_web/

# Specific depth only
tree -L 2 /workspace/ComfyUI/custom_nodes/

# Include file sizes
ls -lhR /workspace/ComfyUI/custom_nodes/rmbg_web/
```

---

## ✅ Troubleshooting Checklist

### Environment Issues
- [ ] Node.js installed and path set?
- [ ] ComfyUI running normally?
- [ ] RMBG-2.0 model downloaded?

### Vue.js App
- [ ] `npm install` successful?
- [ ] `npm run build` successful?
- [ ] `dist/` folder created?

### ComfyUI Integration
- [ ] `__init__.py` in correct location?
- [ ] Using namespace routing?
- [ ] Not using root path (`/`) routing?

### File Deployment
- [ ] Files copied to `web/` folder?
- [ ] index.html paths are `/bg_remove/assets/`?
- [ ] `vite.config.js` has `base: '/bg_remove/'`?

### Network
- [ ] ComfyUI running on port 8188?
- [ ] `/bg_remove` accessible in browser?
- [ ] Assets files loading? (Check F12 Network tab)

---

## 🆘 Still Having Issues?

### 1. Complete Reset

```bash
# Stop ComfyUI
pkill -f "python.*main.py"

# Delete custom node
rm -rf /workspace/ComfyUI/custom_nodes/rmbg_web

# Rebuild Vue.js app
cd /workspace/bg_removal_vue_app
rm -rf node_modules dist
npm install
npm run build

# Redeploy
mkdir -p /workspace/ComfyUI/custom_nodes/rmbg_web/web
cp -r dist/* /workspace/ComfyUI/custom_nodes/rmbg_web/web/
# Recreate __init__.py (see 03-comfyui-integration.md)

# Restart ComfyUI
cd /workspace/ComfyUI
source venv/bin/activate
python main.py --listen --port 8188 --enable-cors-header
```

### 2. Collect Logs

```bash
# System information
uname -a
python --version
node --version

# ComfyUI log
tail -100 /tmp/comfyui.log > ~/debug_log.txt

# File structure
tree /workspace/ComfyUI/custom_nodes/rmbg_web/ >> ~/debug_log.txt

# Process information
ps aux | grep python >> ~/debug_log.txt
netstat -tlnp >> ~/debug_log.txt
```

### 3. GitHub Issues

If all methods fail:

1. Prepare log files above
2. Create [GitHub Issue](https://github.com/YOUR-USERNAME/runpod-comfyui-rmbg-webapp/issues)
3. Include:
   - Problem description
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Log files

---

## 💡 Prevention Tips

### 1. Use Network Volume
```
Data preserved on Pod restart
Saves redeployment time
```

### 2. Use Relative Paths
```javascript
// ✅ Good
fetch('/upload/image')

// ❌ Bad
fetch('http://hardcoded-ip:port/upload/image')
```

### 3. Regular Backups
```bash
# Backup __init__.py
cp __init__.py __init__backup_$(date +%Y%m%d).py

# Backup web folder
tar -czf web_backup_$(date +%Y%m%d).tar.gz web/
```

### 4. Pin Versions
```json
// package.json
{
  "dependencies": {
    "vue": "3.5.22"  // ✅ Exact version specified
  }
}
```

---

**Troubleshooting Complete!** Now you can operate stably! 
