# 01. Environment Setup Guide

> **Goal:** Set up ComfyUI + Node.js environment on RunPod and configure RMBG-2.0 model

**Estimated Time:** 30-40 minutes

---

## 📋 Prerequisites

### Required Items
- [ ] RunPod account (https://runpod.io/)
- [ ] Credit card or credits (for GPU Pod usage)
- [ ] Hugging Face account (optional, for manual model download)

### Recommended Specifications
- **GPU:** NVIDIA RTX 4000 Ada or higher
- **VRAM:** 20GB or more
- **Storage:** 50GB or more (Network Volume recommended)

---

## 🚀 Step 1: Create RunPod Pod

### 1-1. Select Pod Template

1. Access RunPod Dashboard
2. Click **"Deploy"**
3. Select **"KN ComfyUI Network Disk - pytorch 2.4"** template

**Template Features:**
```yaml
Image: runpod/pytorch:2.4.0-py3.11-cuda12.4.1-devel-ubuntu22.04 
Pre-installed:
  - ComfyUI (ready to use)
  - ComfyUI Manager (pre-installed) ✅
  - Python 3.11 + PyTorch 2.4
  - CUDA 12.4
  - Jupyter Lab
```

**✨ Important:** This template includes ComfyUI Manager by default, so you don't need to install it separately!

### 1-2. Select GPU

**Recommended GPUs:**
```
✅ NVIDIA RTX 4000 Ada Generation (20GB VRAM) - $0.32/hr
✅ NVIDIA A4000 (16GB VRAM) - $0.34/hr
⚠️ NVIDIA RTX 3090 (24GB VRAM) - $0.24/hr (low availability)
```

**Selection Criteria:**
- RMBG-2.0 uses approximately 4-6GB VRAM for 1024x1024 images
- ComfyUI itself uses 2-3GB
- **Minimum 16GB VRAM recommended**

### 1-3. Storage Configuration

**Create Network Volume (Highly Recommended!):**

```bash
Name: comfyui-workspace
Size: 50GB
Type: Network Volume
```

**Benefits:**
- Data persists across Pod restarts
- Shareable between multiple Pods
- Fast redeployment

**Mount Path:**
```
/workspace
```

### 1-4. Port Configuration

**Expose HTTP Ports:**
```
8188
```

**Explanation:**
- ComfyUI uses port 8188 by default
- RunPod automatically assigns External Port

---

## 🛠️ Step 2: Initial Environment Setup

### 2-1. Access Jupyter Lab

1. After Pod starts, click **"Connect"**
2. Select **"HTTP Service [8888]"**
3. Jupyter Lab opens in browser

### 2-2. Open Terminal

In Jupyter Lab:
1. Click **"+"** button (top left)
2. Select **"Terminal"**

### 2-3. Verify ComfyUI

```bash
# Navigate to ComfyUI directory
cd /workspace/ComfyUI

# Check directory structure
ls -la

# Expected output:
# custom_nodes/  (includes ComfyUI-Manager)
# models/
# output/
# main.py
# ...
```

### 2-4. Verify ComfyUI Manager (Pre-installed)

```bash
# Check if ComfyUI Manager is installed
ls /workspace/ComfyUI/custom_nodes/ | grep Manager

# Expected output:
# ComfyUI-Manager
```

**✅ ComfyUI Manager is already installed!** No need to install manually.

---

## 📦 Step 3: Install Node.js (Using NVM)

### 3-1. Install NVM

```bash
# Run NVM installation script
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Load NVM environment variables
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

### 3-2. Install Node.js 20 LTS

```bash
# Install Node.js 20
nvm install 20

# Set as default version
nvm use 20
nvm alias default 20

# Verify
node --version  # v20.x.x
npm --version   # 10.x.x
```

**Why Node.js 20?**
- Recommended version for Vue 3 + Vite 7
- Stable LTS version
- Latest ECMAScript features support

### 3-3. Permanent Configuration

**Add to `~/.bashrc`:**

```bash
cat >> ~/.bashrc << 'EOF'

# NVM Configuration
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
EOF

# Apply changes
source ~/.bashrc
```

---

## 🤖 Step 4: Install RMBG-2.0 Custom Node

### 4-1. Start ComfyUI

```bash
cd /workspace/ComfyUI
python main.py --listen --port 8188
```

**Expected Output:**
```
Total VRAM 20147 MB, total RAM 257588 MB
Device: cuda:0 NVIDIA RTX 4000 Ada Generation
Starting server...
To see the GUI go to: http://0.0.0.0:8188
```

### 4-2. Access ComfyUI in Browser

1. In RunPod Dashboard, click **"Connect"**
2. Select **"HTTP Service [8188]"**
3. ComfyUI UI opens in browser

### 4-3. Install RMBG Node via ComfyUI Manager

**Using Pre-installed ComfyUI Manager:**

1. In ComfyUI UI, click **"Manager"** button (bottom right or side panel)

2. Click **"Install Custom Nodes"**

3. In the search box, type: `RMBG`

4. Find **"ComfyUI-RMBG"** or **"ComfyUI-BRIA_AI-RMBG"**

5. Click **"Install"** button

6. Wait for installation (30 seconds - 1 minute)

7. Click **"Restart"** button when prompted

**⚠️ Important:** ComfyUI will restart automatically. Wait 10-20 seconds, then refresh your browser.

### 4-4. Verify RMBG Node Installation

After restart:

1. Right-click on the canvas → **"Add Node"**

2. Navigate to: **"image"** → **"postprocessing"**

3. Look for: **"RMBG Remove Background"** or similar node

**✅ Success if you see the RMBG node!**

### 4-5. Model Download (Automatic)

**The RMBG model will download automatically on first use!**

- Model: RMBG-2.0 (approximately 176MB)
- Location: `/workspace/ComfyUI/models/rmbg/`
- Download happens when you first run a workflow with the RMBG node

**Manual Download (Optional):**

```bash
# Install Hugging Face CLI
pip install huggingface_hub

# Download model
huggingface-cli download briaai/RMBG-2.0 \
  --local-dir /workspace/ComfyUI/models/rmbg \
  --local-dir-use-symlinks False
```

---

## 🔧 Step 5: Create Startup Script

### 5-1. Create run_gpu.sh

```bash
cat > /workspace/run_gpu.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting ComfyUI Background Removal WebApp..."

# Load NVM (if installed)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Verify Node.js
if ! command -v node &> /dev/null; then
  echo "⚠️  Node.js not found! Please install Node.js first."
  echo "Run: nvm install 20 && nvm use 20"
  exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Start ComfyUI
cd /workspace/ComfyUI
source venv/bin/activate

echo "🎨 Starting ComfyUI on port 8188..."
python main.py --preview-method auto --listen --port 8188 --enable-cors-header
EOF

# Grant execute permission
chmod +x /workspace/run_gpu.sh
```

### 5-2. Run Startup Script

```bash
/workspace/run_gpu.sh
```

**Expected Output:**
```
🚀 Starting ComfyUI Background Removal WebApp...
✅ Node.js version: v20.11.1
✅ npm version: 10.5.0
🎨 Starting ComfyUI on port 8188...
Total VRAM 20147 MB, total RAM 257588 MB
Device: cuda:0 NVIDIA RTX 4000 Ada Generation
Starting server...
To see the GUI go to: http://0.0.0.0:8188
```

---

## ✅ Step 6: Verify Environment

### 6-1. Test ComfyUI Access

```bash
# Local access test
curl http://127.0.0.1:8188/system_stats

# Expected output:
# {"system": {"os": "posix", ...}, "devices": [...]}
```

### 6-2. Test External Access

**In RunPod Dashboard:**
1. Select Pod
2. Click **"Connect"** → **"HTTP Service [8188]"**
3. Success if ComfyUI UI opens!

### 6-3. Verify Node.js

```bash
node --version  # v20.x.x
npm --version   # 10.x.x
```

### 6-4. Verify RMBG Node

In ComfyUI:
1. Right-click → **"Add Node"**
2. Go to **"image/postprocessing"** or search `RMBG`
3. Success if **"RMBG Remove Background"** node appears!

---

## 🎯 Environment Setup Complete!

### Checklist

- [x] RunPod GPU Pod created
- [x] Network Volume mounted
- [x] ComfyUI running properly
- [x] ComfyUI Manager verified (pre-installed)
- [x] Node.js 20 LTS installed
- [x] RMBG-2.0 custom node installed
- [x] Startup script created

### Next Steps

👉 **[02. Vue.js App Development](./02-vue-app-development.md)**

---

## 💡 Tips & Notes

### On Pod Restart

```bash
# Simply run the startup script
/workspace/run_gpu.sh
```

**Benefits of Network Volume:**
- No need to reinstall Node.js
- ComfyUI settings preserved
- Models don't need re-downloading
- Custom nodes remain installed

### Cost Optimization Tips

1. **Stop Pod When Not in Use**
   ```
   Stop Pod → Only storage costs apply (~$0.10/GB/month)
   ```

2. **Use Spot Instances**
   ```
   70% cost reduction (lower availability)
   ```

3. **Configure Auto-stop**
   ```
   Auto-stop after 60 minutes of inactivity
   ```

### Troubleshooting

**ComfyUI Won't Start:**
```bash
# Check processes
ps aux | grep python

# Check port (using ss command)
ss -tlnp | grep 8188

# Check logs
tail -f /workspace/ComfyUI/comfyui.log
```

**Node.js Installation Failed:**
```bash
# Reinstall NVM
rm -rf ~/.nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
```

**RMBG Node Not Showing:**
```bash
# Restart ComfyUI
# In ComfyUI Manager, click "Restart"
# Or manually:
pkill -f 'python.*main.py'
/workspace/run_gpu.sh
```

**Model Download Failed:**
```bash
# Check models directory
ls -lh /workspace/ComfyUI/models/rmbg/

# Manual download
pip install huggingface_hub
huggingface-cli download briaai/RMBG-2.0 \
  --local-dir /workspace/ComfyUI/models/rmbg
```

---

## 📚 Additional Resources

### Official Documentation
- [ComfyUI GitHub](https://github.com/comfyanonymous/ComfyUI)
- [ComfyUI Manager](https://github.com/ltdrdata/ComfyUI-Manager)
- [RMBG-2.0 Model](https://huggingface.co/briaai/RMBG-2.0)
- [RunPod Documentation](https://docs.runpod.io/)

### Useful Commands
```bash
# Stop ComfyUI
pkill -f 'python.*main.py'

# View ComfyUI logs in real-time
tail -f /workspace/ComfyUI/comfyui.log

# Check GPU usage
nvidia-smi

# Check disk usage
df -h /workspace
```

---

**Environment Setup Complete!** Ready for Vue.js app development! 🚀
