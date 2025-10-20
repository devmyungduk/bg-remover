#!/bin/bash

echo "🚀 Setting up RunPod environment for ComfyUI Background Removal..."

# ==========================================
# 1. Install NVM (Node Version Manager)
# ==========================================
echo "📦 Installing NVM..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# ==========================================
# 2. Install Node.js 20 LTS
# ==========================================
echo "📦 Installing Node.js 20 LTS..."
nvm install 20
nvm use 20
nvm alias default 20

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# ==========================================
# 3. Add NVM to bashrc
# ==========================================
echo "📝 Adding NVM to ~/.bashrc..."
cat >> ~/.bashrc << 'EOF'

# NVM Configuration
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
EOF

# ==========================================
# 4. Install ComfyUI Manager
# ==========================================
echo "📦 Installing ComfyUI Manager..."
cd /workspace/ComfyUI/custom_nodes

if [ ! -d "ComfyUI-Manager" ]; then
  git clone https://github.com/ltdrdata/ComfyUI-Manager.git
  echo "✅ ComfyUI Manager installed"
else
  echo "⏭️  ComfyUI Manager already exists"
fi

# ==========================================
# 5. Install RMBG Node (CORRECTED URL!)
# ==========================================
echo "📦 Installing RMBG-2.0 Node..."

# ⭐ CORRECTED: Using 1038lab/ComfyUI-RMBG (supports RMBG-2.0)
if [ ! -d "ComfyUI-RMBG" ]; then
  git clone https://github.com/1038lab/ComfyUI-RMBG.git
  cd ComfyUI-RMBG
  pip install -r requirements.txt --break-system-packages
  echo "✅ ComfyUI-RMBG installed"
else
  echo "⏭️  ComfyUI-RMBG already exists"
fi

# ==========================================
# 6. Download RMBG-2.0 Model (Optional)
# ==========================================
echo "📥 Model will download automatically on first use"
echo "   Or manually download:"
echo "   pip install huggingface_hub"
echo "   huggingface-cli download briaai/RMBG-2.0 --local-dir /workspace/ComfyUI/models/rmbg"

# ==========================================
# 7. Create startup script
# ==========================================
echo "📝 Creating startup script..."
cat > /workspace/run_gpu.sh << 'SCRIPT'
#!/bin/bash

echo "🚀 Starting ComfyUI Background Removal WebApp..."

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Verify Node.js
if ! command -v node &> /dev/null; then
  echo "⚠️  Node.js not found! Running setup..."
  /workspace/scripts/setup-runpod.sh
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Start ComfyUI
cd /workspace/ComfyUI
source venv/bin/activate

echo "🎨 Starting ComfyUI on port 8188..."
python main.py --preview-method auto --listen --port 8188 --enable-cors-header
SCRIPT

chmod +x /workspace/run_gpu.sh

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start ComfyUI:"
echo "   /workspace/run_gpu.sh"
echo ""
echo "2. Develop Vue.js app:"
echo "   cd /workspace/bg_removal_vue_app"
echo "   npm install"
echo "   npm run dev"
echo ""
echo "3. Access:"
echo "   ComfyUI: http://[POD-IP]:[PORT]/"
echo "   Vue App: http://[POD-IP]:5173/"
