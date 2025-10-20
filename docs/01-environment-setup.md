# 01. Environment Setup Guide

> **Goal:** Set up ComfyUI + Node.js environment on RunPod and configure RMBG-2.0 model

**Estimated Time:** 30-40 minutes

---

## 📋 Prerequisites

### Required Items
- [ ] RunPod account (https://runpod.io/)
- [ ] Credit card or credits (for GPU Pod usage)
- [ ] Hugging Face account (for RMBG model download)

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
Includes:
  - ComfyUI (pre-installed)
  - Python 3.10 + PyTorch
  - CUDA 11.8
  - Jupyter Lab
```

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
# custom_nodes/
# models/
# output/
# main.py
# ...
```

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

## 🤖 Step 4: Install RMBG-2.0 Model

### 4-1. Install ComfyUI Manager

```bash
cd /workspace/ComfyUI/custom_nodes

# Clone ComfyUI Manager
git clone https://github.com/ltdrdata/ComfyUI-Manager.git
```

### 4-2. Install RMBG Node

**Option 1: Via ComfyUI Manager (Recommended)**

1. Start ComfyUI:
   ```bash
   cd /workspace/ComfyUI
   python main.py --listen --port 8188
   ```

2. Access in browser:
   ```
   http://[POD-IP]:[EXTERNAL-PORT]/
   ```

3. Click **Manager** button

4. Select **"Install Custom Nodes"**

5. Search: `RMBG`

6. Install **"ComfyUI-RMBG"**

**Option 2: Manual Installation**

```bash
cd /workspace/ComfyUI/custom_nodes
git clone https://github.com/ZHO-ZHO-ZHO/ComfyUI-RMBG.git
cd ComfyUI-RMBG
pip install -r requirements.txt
```

### 4-3. Download RMBG-2.0 Model

**Automatic Download (Recommended):**

Model downloads automatically on first use when running ComfyUI.

**Manual Download:**

```bash
# Install Hugging Face CLI
pip install huggingface_hub

# Download model
huggingface-cli download briaai/RMBG-2.0 \
  --local-dir /workspace/ComfyUI/models/rmbg \
  --local-dir-use-symlinks False
```

**Verify Model Location:**
```bash
ls -lh /workspace/ComfyUI/models/rmbg/
# Output: model.pth (approximately 176MB)
```

---

## 🔧 Step 5: Create Startup Script

### 5-1. Create run_gpu.sh

```bash
cat > /workspace/run_gpu.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting ComfyUI Background Removal WebApp Setup..."

# Install NVM (if not exists)
if [ ! -d "$HOME/.nvm" ]; then
  echo "📦 Installing NVM..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js 20 (if not exists)
if ! command -v node &> /dev/null; then
  echo "📦 Installing Node.js 20 LTS..."
  nvm install 20
  nvm use 20
  nvm alias default 20
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
🚀 Starting ComfyUI Background Removal WebApp Setup...
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
3. Success if **"RMBG-2.0"** node appears!

---

## 🎯 Environment Setup Complete!

### Checklist

- [x] RunPod GPU Pod created
- [x] Network Volume mounted
- [x] ComfyUI running properly
- [x] Node.js 20 LTS installed
- [x] RMBG-2.0 model installed
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

### Cost Optimization Tips

1. **Stop Pod When Not in Use**
   ```
   Stop Pod → Only storage costs apply
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

# Check port
netstat -tlnp | grep 8188

# Check logs
tail -f /workspace/ComfyUI/comfyui.log
```

**Node.js Installation Failed:**
```bash
# Reinstall NVM
rm -rf ~/.nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

---

**Environment Setup Complete!** Ready for Vue.js app development! 🚀
