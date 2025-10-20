# 02. Vue.js App Development Guide

> **Goal:** Develop background removal web app with Vue 3 + Vite and integrate ComfyUI API

**Estimated Time:** 1-2 hours

---

## 📋 Overview

### Development Environment
- **Framework:** Vue 3.5.22 (Composition API)
- **Build Tool:** Vite 7.1.7
- **Styling:** Vanilla CSS (Scoped)
- **State Management:** Vue Reactivity API (ref, computed)

### Key Features
1. Image upload
2. ComfyUI API communication
3. Real-time progress tracking
4. Before/After comparison slider
5. Image download

---

## 🚀 Step 1: Project Initialization

### 1-1. Create Vite Project

```bash
cd /workspace

# Create Vue project with Vite
npm create vite@latest bg_removal_vue_app -- --template vue

cd bg_removal_vue_app

# Install dependencies
npm install
```

### 1-2. Project Structure

```
bg_removal_vue_app/
├── public/
│   └── vite.svg                # Favicon
├── src/
│   ├── App.vue                 # Main component
│   ├── main.js                 # Entry point
│   ├── style.css               # Global styles
│   └── components/
│       └── ImageComparisonSlider.vue  # Comparison slider
├── index.html
├── package.json
└── vite.config.js
```

### 1-3. Initial Test

```bash
npm run dev
```

**Output:**
```
VITE v7.1.7  ready in 123 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🎨 Step 2: Develop App.vue

### 2-1. Template Structure

```vue
<template>
  <div class="container">
    <h1>🎨 Background Removal App (RMBG-2.0)</h1>

    <!-- File Upload Section -->
    <div class="upload-section">
      <div class="file-input-wrapper">
        <input 
          type="file" 
          id="imageInput" 
          accept="image/*" 
          @change="displayFileName"
        >
        <label for="imageInput" class="file-label">
          📁 Select Image
        </label>
      </div>
      <span class="file-name">{{ fileName }}</span>
      <br>
      <button 
        @click="removeBackground" 
        :disabled="isProcessing"
      >
        <span v-if="!isProcessing">🚀 Start Background Removal</span>
        <span v-else>Processing...</span>
      </button>
    </div>

    <!-- Loading Bar -->
    <div v-if="isProcessing" class="loading-bar-container">
      <div class="loading-bar" :style="{ width: loadingProgress + '%' }"></div>
      <div class="loading-text">{{ statusMessage }}</div>
    </div>

    <!-- Status Message -->
    <div 
      v-if="statusMessage && !isProcessing" 
      :class="['status', statusType]"
    >
      {{ statusMessage }}
    </div>

    <!-- Result Display -->
    <div class="result-section">
      <h2>Result</h2>
      <ImageComparisonSlider
        v-if="beforeImageUrl && previewImageUrl"
        :beforeImage="beforeImageUrl"
        :afterImage="previewImageUrl"
      />
      <button 
        v-if="beforeImageUrl && previewImageUrl" 
        @click="downloadImage"
      >
        💾 Download Image
      </button>
    </div>
  </div>
</template>
```

### 2-2. Script (Composition API)

```vue
<script setup>
import { ref } from 'vue';
import ImageComparisonSlider from './components/ImageComparisonSlider.vue';

// Reactive state
const selectedFile = ref(null);
const fileName = ref('');
const isProcessing = ref(false);
const statusMessage = ref('');
const statusType = ref('');
const previewImageUrl = ref('');
const loadingProgress = ref(0);
const beforeImageUrl = ref('');

// File selection handler
const displayFileName = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    fileName.value = 'Selected file: ' + file.name;

    // Preview original image
    const reader = new FileReader();
    reader.onload = (e) => {
      beforeImageUrl.value = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    selectedFile.value = null;
    fileName.value = '';
    beforeImageUrl.value = '';
  }
};

// Show status message
const showStatus = (message, type) => {
  statusMessage.value = message;
  statusType.value = type;
};

// Download image
const downloadImage = () => {
  if (!previewImageUrl.value) return;
  const a = document.createElement('a');
  a.href = previewImageUrl.value;
  a.download = 'bg_removed_' + Date.now() + '.png';
  a.click();
};

// Main background removal function (detailed in next section)
const removeBackground = async () => {
  // ... (see Step 3)
};
</script>
```

---

## 🔗 Step 3: ComfyUI API Integration

### 3-1. API Endpoints

ComfyUI provides the following REST API:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/upload/image` | POST | Upload image |
| `/prompt` | POST | Execute workflow |
| `/history/{prompt_id}` | GET | Get result |
| `/view` | GET | Download image |

### 3-2. Workflow JSON Structure

```javascript
const workflow = {
  "10": {  // RMBG Node
    "inputs": {
      "model": "RMBG-2.0",
      "sensitivity": 1,
      "process_res": 1024,
      "mask_blur": 0,
      "mask_offset": 0,
      "invert_output": false,
      "refine_foreground": false,
      "background": "Alpha",
      "background_color": "#222222",
      "image": ["12", 0]  // Connected to LoadImage node
    },
    "class_type": "RMBG"
  },
  "11": {  // SaveImage Node
    "inputs": {
      "filename_prefix": "bg_removed",
      "images": ["10", 0]  // Connected to RMBG node
    },
    "class_type": "SaveImage"
  },
  "12": {  // LoadImage Node
    "inputs": {
      "image": uploadedFileName,  // Uploaded filename
      "upload": "image"
    },
    "class_type": "LoadImage"
  }
};
```

**Node Connection Flow:**
```
LoadImage(12) → RMBG(10) → SaveImage(11)
```

### 3-3. removeBackground Function Implementation

```javascript
const removeBackground = async () => {
  if (!selectedFile.value) {
    showStatus('❌ Please select an image first!', 'error');
    return;
  }

  isProcessing.value = true;
  statusMessage.value = '📤 Uploading image...';
  loadingProgress.value = 10;
  previewImageUrl.value = '';

  try {
    // ========================================
    // Step 1: Upload Image
    // ========================================
    const formData = new FormData();
    formData.append('image', selectedFile.value);
    formData.append('overwrite', 'true');

    const uploadResponse = await fetch('/upload/image', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Upload failed: HTTP ' + uploadResponse.status);
    }

    const uploadData = await uploadResponse.json();
    const uploadedFileName = uploadData.name;

    loadingProgress.value = 40;
    statusMessage.value = '✅ Upload complete!\nProcessing background removal...';

    // ========================================
    // Step 2: Execute Workflow
    // ========================================
    const workflow = {
      "10": {
        "inputs": {
          "model": "RMBG-2.0",
          "sensitivity": 1,
          "process_res": 1024,
          "mask_blur": 0,
          "mask_offset": 0,
          "invert_output": false,
          "refine_foreground": false,
          "background": "Alpha",
          "background_color": "#222222",
          "image": ["12", 0]
        },
        "class_type": "RMBG"
      },
      "11": {
        "inputs": {
          "filename_prefix": "bg_removed",
          "images": ["10", 0]
        },
        "class_type": "SaveImage"
      },
      "12": {
        "inputs": {
          "image": uploadedFileName,
          "upload": "image"
        },
        "class_type": "LoadImage"
      }
    };

    const promptResponse = await fetch('/prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: workflow }),
    });

    if (!promptResponse.ok) {
      throw new Error('Workflow execution failed: HTTP ' + promptResponse.status);
    }

    const promptData = await promptResponse.json();
    const promptId = promptData.prompt_id;

    loadingProgress.value = 70;
    statusMessage.value = '⏳ Processing background removal...';

    // ========================================
    // Step 3: Wait for Completion (Polling)
    // ========================================
    let historyData = null;
    let attempts = 0;
    const maxAttempts = 30;  // Maximum 30 seconds wait

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));  // Wait 1 second
      attempts++;

      const historyResponse = await fetch('/history/' + promptId);

      if (historyResponse.ok) {
        const data = await historyResponse.json();
        if (data[promptId] && data[promptId].outputs) {
          historyData = data;
          break;
        }
      }

      // Update progress (70% → 90%)
      loadingProgress.value = 70 + (attempts / maxAttempts) * 20;
    }

    if (!historyData) {
      throw new Error('Processing timeout (30 seconds)');
    }

    // ========================================
    // Step 4: Generate Result Image URL
    // ========================================
    const outputs = historyData[promptId]?.outputs;
    if (!outputs || !outputs["11"] || !outputs["11"].images || outputs["11"].images.length === 0) {
      throw new Error('Processing result not found');
    }

    const resultImage = outputs["11"].images[0];
    const resultUrl = '/view?filename=' + encodeURIComponent(resultImage.filename) +
                      '&subfolder=' + encodeURIComponent(resultImage.subfolder || '') +
                      '&type=' + encodeURIComponent(resultImage.type || 'output');

    // ========================================
    // Step 5: Display Result
    // ========================================
    previewImageUrl.value = resultUrl;
    loadingProgress.value = 100;
    showStatus('✅ Background removal complete!\n\nClick image to download.', 'success');

  } catch (error) {
    console.error('Error details:', error);
    showStatus('❌ Error occurred: ' + error.message + '\n\nCheck F12 console for details.', 'error');
    loadingProgress.value = 0;
  } finally {
    isProcessing.value = false;
  }
};
```

**Key Points:**

1. **Use Relative Paths** (`/upload/image`, `/prompt` etc.)
   - No absolute paths or hardcoded IPs
   - Works on any domain/port

2. **Polling Method**
   - ComfyUI also supports WebSocket, but HTTP polling is simpler
   - Check `/history/{prompt_id}` every 1 second

3. **Error Handling**
   - Try-catch for each step
   - Clear error messages for users

---

## 🎨 Step 4: ImageComparisonSlider Component

### 4-1. Create Component

```bash
mkdir -p src/components
touch src/components/ImageComparisonSlider.vue
```

### 4-2. Component Code

```vue
<!-- src/components/ImageComparisonSlider.vue -->
<template>
  <div 
    class="comparison-slider" 
    ref="sliderContainer" 
    v-if="beforeImage && afterImage"
  >
    <!-- Original image (background) -->
    <div class="image-wrapper original">
      <img :src="beforeImage" alt="Original image">
    </div>

    <!-- Processed image (foreground, width adjustable) -->
    <div 
      class="image-wrapper modified" 
      :style="{ width: sliderPosition + '%' }"
    >
      <img :src="afterImage" alt="Background removed image">
    </div>

    <!-- Slider handle -->
    <div 
      class="slider-handle" 
      :style="{ left: sliderPosition + '%' }" 
      @mousedown="startDrag"
    >
      <div class="slider-arrow left"></div>
      <div class="slider-line"></div>
      <div class="slider-arrow right"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';

const props = defineProps({
  beforeImage: String,
  afterImage: String
});

const sliderContainer = ref(null);
const sliderPosition = ref(50);  // Initial 50%
const isDragging = ref(false);

// Start drag
const startDrag = (event) => {
  isDragging.value = true;
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDrag);
};

// During drag
const drag = (event) => {
  if (!isDragging.value || !sliderContainer.value) return;

  const containerRect = sliderContainer.value.getBoundingClientRect();
  const mouseX = event.clientX - containerRect.left;
  
  // Limit to 0-100% range
  sliderPosition.value = Math.max(0, Math.min(100, (mouseX / containerRect.width) * 100));
};

// End drag
const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', stopDrag);
};

// Cleanup on component unmount
onUnmounted(() => {
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', stopDrag);
});
</script>

<style scoped>
.comparison-slider {
  position: relative;
  width: 100%;
  max-width: 600px;
  height: auto;
  aspect-ratio: 16/9;
  overflow: hidden;
  margin: 15px auto;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  cursor: ew-resize;
  user-select: none;
}

.image-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.image-wrapper.modified {
  width: 50%;
  overflow: hidden;
}

.slider-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 40px;
  background-color: rgba(255, 255, 255, 0.7);
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: ew-resize;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.slider-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #fff;
  left: 50%;
  transform: translateX(-50%);
}

.slider-arrow {
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  position: absolute;
}

.slider-arrow.left {
  border-right: 8px solid #333;
  left: 5px;
}

.slider-arrow.right {
  border-left: 8px solid #333;
  right: 5px;
}
</style>
```

**⚠️ Future Improvements Needed:**
- Touch event support (mobile)
- Accessibility improvements (keyboard control)
- Loading state display
- Automatic aspect ratio adjustment

---

## 🎨 Step 5: Styling (App.vue)

```vue
<style>
/* Global styles in App.vue */
* { 
  margin: 0; 
  padding: 0; 
  box-sizing: border-box; 
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}

.container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  padding: 30px;
  max-width: 800px;
  width: 100%;
}

h1 { 
  color: #333; 
  text-align: center; 
  margin-bottom: 20px; 
  font-size: 1.8em; 
}

/* File upload */
.upload-section { 
  text-align: center; 
  margin: 20px 0; 
}

.file-label {
  background: #667eea;
  color: white;
  padding: 12px 25px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-block;
  font-weight: bold;
}

.file-label:hover { 
  background: #5568d3; 
  transform: translateY(-2px); 
}

input[type="file"] { 
  display: none; 
}

/* Button */
button {
  background: #764ba2;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s;
  margin: 5px;
}

button:hover:not(:disabled) { 
  background: #653a8e; 
  transform: translateY(-2px); 
}

button:disabled { 
  background: #ccc; 
  cursor: not-allowed; 
}

/* Loading bar */
.loading-bar-container {
  width: 100%;
  background-color: #f3f3f3;
  border-radius: 10px;
  margin: 20px 0;
  overflow: hidden;
  position: relative;
  height: 25px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
}

.loading-bar {
  height: 100%;
  background-color: #667eea;
  width: 0%;
  border-radius: 10px;
  transition: width 0.4s ease-in-out;
  position: absolute;
  top: 0;
  left: 0;
}

.loading-text {
  position: absolute;
  width: 100%;
  text-align: center;
  line-height: 25px;
  color: #333;
  font-weight: bold;
  font-size: 0.9em;
  z-index: 1;
}

/* Status message */
.status {
  text-align: center;
  margin-top: 15px;
  padding: 12px;
  border-radius: 10px;
  font-weight: bold;
  white-space: pre-line;
}

.status.success { 
  background: #d4edda; 
  color: #155724; 
}

.status.error { 
  background: #f8d7da; 
  color: #721c24; 
}

/* Responsive */
@media (max-width: 600px) {
  .container { padding: 20px; }
  h1 { font-size: 1.5em; }
  button { width: 100%; margin: 5px 0; }
}
</style>
```

---

## 🧪 Step 6: Local Testing

### 6-1. Start Development Server

```bash
npm run dev
```

### 6-2. Proxy Configuration (Optional)

To call ComfyUI API, proxy configuration may be needed.

**Modify vite.config.js:**

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
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

### 6-3. Test Checklist

- [ ] File selection button works
- [ ] Image upload progress displays
- [ ] Background removal progress displays
- [ ] Before/After slider works
- [ ] Image download button works
- [ ] Error messages display

---

## 📦 Step 7: Production Build

### 7-1. Final vite.config.js Configuration

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/bg_remove/',  // ⭐ Matches ComfyUI subpath
  plugins: [vue()],
})
```

### 7-2. Run Build

```bash
npm run build
```

**Output:**
```
vite v7.1.7 building for production...
✓ 45 modules transformed.
dist/index.html                   0.49 kB │ gzip:  0.32 kB
dist/assets/index-DooTOS1Z.js    64.61 kB │ gzip: 25.89 kB
dist/assets/index-D_2nttju.css    4.62 kB │ gzip:  1.89 kB
✓ built in 453ms
```

### 7-3. Verify Build Results

```bash
ls -la dist/

# Output:
# index.html
# vite.svg
# assets/
#   ├── index-DooTOS1Z.js
#   └── index-D_2nttju.css
```

---

## ✅ Development Complete!

### Checklist

- [x] Vue 3 project created
- [x] App.vue main component developed
- [x] ComfyUI API integrated
- [x] ImageComparisonSlider component
- [x] Styling and responsive design
- [x] Local testing
- [x] Production build

### Next Steps

👉 **[03. ComfyUI Integration](./03-comfyui-integration.md)**

---

## 💡 Key Learning Points

### Vue 3 Composition API
- Usage of `ref`, `computed`
- `v-if`, `v-for`, `:style` directives
- Event handling (`@click`, `@change`)

### API Integration
- Using `fetch` API
- FormData upload
- Polling-based status checking

### Vite Build
- Subpath deployment with `base` option
- Development server proxy configuration
- Production optimization

**Development Complete! Now integrate with ComfyUI!** 🚀
