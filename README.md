# RunPod ComfyUI Background Removal WebApp

> Background removal web application using Vue.js and ComfyUI RMBG-2.0 on RunPod GPU

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.5.22-brightgreen.svg)](https://vuejs.org/)
[![ComfyUI](https://img.shields.io/badge/ComfyUI-Latest-blue.svg)](https://github.com/comfyanonymous/ComfyUI)

## 🎯 Features

- 📤 **Image Upload** - Easy drag-and-drop or file selection
- 🎨 **Background Removal** - Powered by RMBG-2.0 AI model
- 🔄 **Real-time Progress** - Visual progress tracking
- 📊 **Before/After Comparison** - Interactive slider comparison
- 💾 **Download Result** - One-click download
- 🚀 **GPU Acceleration** - Fast processing on RunPod

## 🛠️ Tech Stack

### Frontend
- **Framework:** Vue 3.5.22 (Composition API)
- **Build Tool:** Vite 7.1.7
- **Styling:** Vanilla CSS (Scoped)

### Backend
- **ComfyUI:** Custom node integration
- **Model:** RMBG-2.0
- **Server:** aiohttp (ComfyUI built-in)

### Infrastructure
- **GPU:** RunPod (NVIDIA RTX 4000 Ada / A4000)
- **Environment:** Ubuntu 22.04 + CUDA 11.8
- **Runtime:** Node.js 20 LTS + Python 3.10

## 📦 Installation

### Prerequisites
- RunPod account with GPU pod
- Basic knowledge of terminal/bash
- Git (pre-installed on RunPod)

### Quick Start
```bash
# 1. Clone repository
git clone https://github.com/devmyungduk/bg-remover.git
cd bg-remover

# 2. Run setup script
bash scripts/setup-runpod.sh

# 3. Start ComfyUI
bash scripts/start-comfyui.sh

# 4. Develop Vue.js app (in another terminal)
cd vue-app
npm install
npm run dev
```

## 🚀 Usage

### 1. Access ComfyUI
```
http://[RUNPOD-IP]:[PORT]/
```

### 2. Access Background Removal App
```
http://[RUNPOD-IP]:[PORT]/bg_remove
```

### 3. Upload and Process
1. Click "Select Image" button
2. Choose an image file
3. Click "Start Background Removal"
4. Wait for processing (10-30 seconds)
5. Compare results with slider
6. Download processed image

## 📖 Documentation

Comprehensive guides available in the `docs/` directory:

- **[01. Environment Setup](docs/01-environment-setup.md)**  
  Setting up RunPod, installing ComfyUI, Node.js, and RMBG-2.0 model

- **[02. Vue.js App Development](docs/02-vue-app-development.md)**  
  Building the frontend with Vue 3 + Vite and integrating ComfyUI API

- **[03. ComfyUI Integration](docs/03-comfyui-integration.md)**  
  Creating custom node and deploying Vue.js build as subpath

- **[04. Troubleshooting](docs/04-troubleshooting.md)**  
  Common issues and solutions

## 🏗️ Project Structure
```
bg-remover/
├── docs/                           # Documentation
│   ├── 01-environment-setup.md
│   ├── 02-vue-app-development.md
│   ├── 03-comfyui-integration.md
│   └── 04-troubleshooting.md
│
├── vue-app/                        # Vue.js application
│   ├── src/
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── components/
│   ├── package.json
│   └── vite.config.js
│
├── comfyui-custom-node/            # ComfyUI integration
│   ├── __init__.py                 # Route configuration
│   └── web/                        # Deployed Vue.js build
│
├── scripts/                        # Automation scripts
│   ├── setup-runpod.sh            # Environment setup
│   ├── build-and-deploy.sh        # Build & deploy
│   └── start-comfyui.sh           # Start ComfyUI
│
├── .gitignore
├── LICENSE
└── README.md
```

## 🔧 Development

### Build Vue.js App
```bash
cd vue-app
npm run build
```

### Deploy to ComfyUI
```bash
bash scripts/build-and-deploy.sh
```

### Restart ComfyUI
```bash
bash scripts/start-comfyui.sh
```

## 🧪 Testing

### Local Development
```bash
# Terminal 1: Start ComfyUI
cd /workspace/ComfyUI
python main.py --listen --port 8188 --enable-cors-header

# Terminal 2: Start Vue dev server
cd vue-app
npm run dev -- --host
```

Access at: `http://localhost:5173/`

## 📸 Screenshots

*(Add screenshots here after deployment)*

## 🎯 Roadmap

- [ ] Multi-image batch processing
- [ ] Mobile responsive design improvements
- [ ] Touch support for comparison slider
- [ ] History of processed images
- [ ] Settings persistence
- [ ] Docker containerization

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [ComfyUI](https://github.com/comfyanonymous/ComfyUI) - Powerful node-based UI for Stable Diffusion
- [RMBG-2.0](https://huggingface.co/briaai/RMBG-2.0) - State-of-the-art background removal model
- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [RunPod](https://runpod.io/) - GPU cloud computing platform

## 📧 Contact

- **Author:** Neuemuziek
- **GitHub:** [@devmyungduk](https://github.com/devmyungduk)
- **Email:** neuemdkim@gmail.com

---

**Built with ❤️ using Vue.js and ComfyUI**

