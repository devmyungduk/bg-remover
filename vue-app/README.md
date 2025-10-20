# Vue.js Background Removal App

> Vue 3 + Vite web application for background removal using ComfyUI API

## 🎯 Features

- 📤 Image upload
- 🎨 Background removal using RMBG-2.0
- 🔄 Real-time progress tracking
- 📊 Before/After comparison slider
- 💾 Image download

## 🛠️ Tech Stack

- **Framework:** Vue 3.5.22
- **Build Tool:** Vite 7.1.7
- **State Management:** Vue Composition API
- **Styling:** Vanilla CSS (Scoped)

## 📦 Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🚀 Development
```bash
# Start dev server with host binding (for RunPod)
npm run dev -- --host

# Access at
http://localhost:5173/
```

## 🏗️ Project Structure
```
vue-app/
├── public/
│   └── vite.svg              # Favicon
├── src/
│   ├── App.vue               # Main component
│   ├── main.js               # Entry point
│   ├── style.css             # Global styles
│   └── components/
│       └── ImageComparisonSlider.vue  # Comparison slider
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## ⚙️ Configuration

### vite.config.js
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/bg_remove/',  // ⭐ Required for ComfyUI integration
  plugins: [vue()],
  server: {
    host: true,  // Bind to 0.0.0.0 for external access
    proxy: {
      '/upload': 'http://127.0.0.1:8188',
      '/prompt': 'http://127.0.0.1:8188',
      '/history': 'http://127.0.0.1:8188',
      '/view': 'http://127.0.0.1:8188',
    }
  }
})
```

## 🔗 API Integration

### ComfyUI API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/upload/image` | POST | Upload image |
| `/prompt` | POST | Execute workflow |
| `/history/{prompt_id}` | GET | Get result |
| `/view` | GET | Download image |

### Workflow Structure
```javascript
const workflow = {
  "10": {  // RMBG Node
    "inputs": {
      "model": "RMBG-2.0",
      "image": ["12", 0]
    },
    "class_type": "RMBG"
  },
  "11": {  // SaveImage Node
    "inputs": {
      "images": ["10", 0]
    },
    "class_type": "SaveImage"
  },
  "12": {  // LoadImage Node
    "inputs": {
      "image": uploadedFileName
    },
    "class_type": "LoadImage"
  }
};
```

## 🧪 Testing
```bash
# Local test (with ComfyUI running on port 8188)
npm run dev

# Open browser
http://localhost:5173/
```

## 📦 Build
```bash
# Production build
npm run build

# Output: dist/
```

## 🚀 Deployment

Deploy to ComfyUI:
```bash
# Copy build files to ComfyUI custom node
cp -r dist/* /workspace/ComfyUI/custom_nodes/rmbg_web/web/
```

## 📖 Documentation

See [02. Vue.js App Development](../docs/02-vue-app-development.md)

## 🐛 Troubleshooting

### CORS Error

**Solution:** Start ComfyUI with CORS enabled
```bash
python main.py --listen --port 8188 --enable-cors-header
```

### Assets 404 Error

**Solution:** Check `base` configuration in `vite.config.js`
```javascript
base: '/bg_remove/',  // ✅ Must match ComfyUI route
```

## 📝 License

MIT
