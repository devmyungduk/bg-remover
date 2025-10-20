<template>
  <div class="app-container">
    <header class="app-header">
      <h1>🎨 Background Removal</h1>
      <p>Powered by ComfyUI RMBG-2.0</p>
    </header>

    <main class="app-main">
      <!-- Upload Section -->
      <section class="upload-section" v-if="!uploadedImage">
        <div class="upload-area" 
             @click="triggerFileInput"
             @dragover.prevent="handleDragOver"
             @dragleave.prevent="handleDragLeave"
             @drop.prevent="handleDrop"
             :class="{ 'drag-over': isDragging }">
          <div class="upload-content">
            <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <h2>Click or Drag to Upload</h2>
            <p>Support: JPG, PNG, WebP</p>
          </div>
        </div>
        <input 
          ref="fileInput" 
          type="file" 
          accept="image/*" 
          @change="handleFileSelect"
          style="display: none;"
        />
      </section>

      <!-- Processing Section -->
      <section class="processing-section" v-if="uploadedImage && !resultImage">
        <div class="preview-container">
          <img :src="uploadedImage" alt="Uploaded" class="preview-image" />
        </div>
        
        <div class="action-buttons">
          <button class="btn btn-primary" @click="startProcessing" :disabled="isProcessing">
            <span v-if="!isProcessing">🚀 Start Background Removal</span>
            <span v-else>⏳ Processing...</span>
          </button>
          <button class="btn btn-secondary" @click="resetApp">
            🔄 Upload New Image
          </button>
        </div>

        <!-- Progress Bar -->
        <div v-if="isProcessing" class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <p class="progress-text">{{ progress }}% Complete</p>
        </div>
      </section>

      <!-- Result Section -->
      <section class="result-section" v-if="resultImage">
        <ImageComparisonSlider 
          :originalImage="uploadedImage"
          :processedImage="resultImage"
        />
        
        <div class="action-buttons">
          <button class="btn btn-primary" @click="downloadResult">
            💾 Download Result
          </button>
          <button class="btn btn-secondary" @click="resetApp">
            🔄 Upload New Image
          </button>
        </div>
      </section>

      <!-- Error Message -->
      <div v-if="errorMessage" class="error-message">
        <p>❌ {{ errorMessage }}</p>
        <button class="btn btn-secondary" @click="errorMessage = ''">Close</button>
      </div>
    </main>

    <footer class="app-footer">
      <p>Built with Vue.js & ComfyUI | RMBG-2.0 AI Model</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageComparisonSlider from './components/ImageComparisonSlider.vue'

// Reactive state
const uploadedImage = ref(null)
const resultImage = ref(null)
const isProcessing = ref(false)
const progress = ref(0)
const errorMessage = ref('')
const isDragging = ref(false)
const fileInput = ref(null)

// ComfyUI API Configuration
const COMFYUI_BASE_URL = window.location.origin
const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// File handling
function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

function handleDragOver() {
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

function handleDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    processFile(file)
  }
}

function processFile(file) {
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Please upload an image file'
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedImage.value = e.target.result
  }
  reader.readAsDataURL(file)
}

// ComfyUI Processing
async function startProcessing() {
  if (!uploadedImage.value) return

  isProcessing.value = true
  progress.value = 0
  errorMessage.value = ''

  try {
    // Step 1: Upload image to ComfyUI
    progress.value = 10
    const imageBlob = await fetch(uploadedImage.value).then(r => r.blob())
    const formData = new FormData()
    formData.append('image', imageBlob, 'upload.png')
    formData.append('type', 'input')
    formData.append('subfolder', '')

    const uploadResponse = await fetch(`${COMFYUI_BASE_URL}/upload/image`, {
      method: 'POST',
      body: formData
    })

    if (!uploadResponse.ok) throw new Error('Image upload failed')
    const uploadData = await uploadResponse.json()
    const uploadedFileName = uploadData.name
    progress.value = 30

    // Step 2: Create workflow
    const workflow = createWorkflow(uploadedFileName)
    
    // Step 3: Queue prompt
    const promptResponse = await fetch(`${COMFYUI_BASE_URL}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: workflow, client_id: clientId })
    })

    if (!promptResponse.ok) throw new Error('Failed to queue workflow')
    const promptData = await promptResponse.json()
    const promptId = promptData.prompt_id
    progress.value = 50

    // Step 4: Wait for completion
    await waitForCompletion(promptId)
    progress.value = 90

    // Step 5: Get result image
    const resultFileName = await getResultImage(promptId)
    resultImage.value = `${COMFYUI_BASE_URL}/view?filename=${resultFileName}&type=output`
    progress.value = 100

    isProcessing.value = false
  } catch (error) {
    console.error('Processing error:', error)
    errorMessage.value = `Processing failed: ${error.message}`
    isProcessing.value = false
    progress.value = 0
  }
}

function createWorkflow(imageName) {
  return {
    "1": {
      "class_type": "LoadImage",
      "inputs": {
        "image": imageName
      }
    },
    "2": {
      "class_type": "RMBG",
      "inputs": {
        "image": ["1", 0]
      }
    },
    "3": {
      "class_type": "SaveImage",
      "inputs": {
        "images": ["2", 0],
        "filename_prefix": "rmbg_output"
      }
    }
  }
}

async function waitForCompletion(promptId) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${COMFYUI_BASE_URL.replace('http', 'ws')}/ws?clientId=${clientId}`)
    
    const timeout = setTimeout(() => {
      ws.close()
      reject(new Error('Processing timeout'))
    }, 120000) // 2 minutes timeout

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'executing' && data.data.node === null && data.data.prompt_id === promptId) {
        clearTimeout(timeout)
        ws.close()
        resolve()
      }
      
      if (data.type === 'execution_error') {
        clearTimeout(timeout)
        ws.close()
        reject(new Error('Execution error in ComfyUI'))
      }
    }

    ws.onerror = () => {
      clearTimeout(timeout)
      reject(new Error('WebSocket connection failed'))
    }
  })
}

async function getResultImage(promptId) {
  const historyResponse = await fetch(`${COMFYUI_BASE_URL}/history/${promptId}`)
  const historyData = await historyResponse.json()
  
  const outputs = historyData[promptId]?.outputs
  if (!outputs) throw new Error('No outputs found')
  
  // Find SaveImage node output
  for (const nodeId in outputs) {
    const output = outputs[nodeId]
    if (output.images && output.images.length > 0) {
      return output.images[0].filename
    }
  }
  
  throw new Error('Result image not found')
}

// Download result
function downloadResult() {
  if (!resultImage.value) return
  
  const link = document.createElement('a')
  link.href = resultImage.value
  link.download = 'background_removed.png'
  link.click()
}

// Reset app
function resetApp() {
  uploadedImage.value = null
  resultImage.value = null
  isProcessing.value = false
  progress.value = 0
  errorMessage.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-header {
  text-align: center;
  padding: 2rem;
  color: white;
}

.app-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.app-header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.app-main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

section {
  width: 100%;
  max-width: 800px;
}

/* Upload Section */
.upload-area {
  background: white;
  border-radius: 12px;
  padding: 4rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px dashed #cbd5e0;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: #667eea;
  background: #f7fafc;
  transform: scale(1.02);
}

.upload-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  color: #667eea;
}

.upload-content h2 {
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.upload-content p {
  color: #718096;
}

/* Processing Section */
.preview-container {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.preview-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  display: block;
}

/* Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.btn {
  flex: 1;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #f7fafc;
  transform: translateY(-2px);
}

/* Progress Bar */
.progress-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
  border-radius: 6px;
}

.progress-text {
  text-align: center;
  color: #4a5568;
  font-weight: 600;
}

/* Result Section */
.result-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
}

/* Error Message */
.error-message {
  background: #fff5f5;
  border: 2px solid #fc8181;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
}

.error-message p {
  color: #c53030;
  font-weight: 600;
  margin-bottom: 1rem;
}

/* Footer */
.app-footer {
  text-align: center;
  padding: 1.5rem;
  color: white;
  opacity: 0.9;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .app-header h1 {
    font-size: 2rem;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
