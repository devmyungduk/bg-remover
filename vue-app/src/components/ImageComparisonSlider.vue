<template>
  <div class="comparison-container" ref="container">
    <div class="comparison-wrapper">
      <!-- Original Image (Bottom Layer) -->
      <div class="image-layer original-layer">
        <img :src="originalImage" alt="Original" />
        <div class="image-label">Original</div>
      </div>

      <!-- Processed Image (Top Layer with Clip) -->
      <div 
        class="image-layer processed-layer" 
        :style="{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }"
      >
        <img :src="processedImage" alt="Processed" />
        <div class="image-label">Processed</div>
      </div>

      <!-- Slider Handle -->
      <div 
        class="slider-handle"
        :style="{ left: `${sliderPosition}%` }"
        @mousedown="startDrag"
        @touchstart="startDrag"
      >
        <div class="handle-line"></div>
        <div class="handle-circle">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  originalImage: {
    type: String,
    required: true
  },
  processedImage: {
    type: String,
    required: true
  }
})

const container = ref(null)
const sliderPosition = ref(50)
const isDragging = ref(false)

function startDrag(event) {
  isDragging.value = true
  event.preventDefault()
}

function onDrag(event) {
  if (!isDragging.value || !container.value) return

  const rect = container.value.getBoundingClientRect()
  const x = (event.type.includes('touch') ? event.touches[0].clientX : event.clientX) - rect.left
  const percentage = (x / rect.width) * 100

  sliderPosition.value = Math.max(0, Math.min(100, percentage))
}

function stopDrag() {
  isDragging.value = false
}

onMounted(() => {
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('touchend', stopDrag)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
})
</script>

<style scoped>
.comparison-container {
  position: relative;
  width: 100%;
  user-select: none;
  -webkit-user-select: none;
}

.comparison-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
  background: #000;
}

.image-layer {
  position: relative;
  width: 100%;
}

.image-layer img {
  display: block;
  width: 100%;
  height: auto;
  pointer-events: none;
}

.processed-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.image-label {
  position: absolute;
  top: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 4px;
  pointer-events: none;
}

.original-layer .image-label {
  left: 1rem;
}

.processed-layer .image-label {
  right: 1rem;
}

.slider-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4px;
  transform: translateX(-50%);
  cursor: ew-resize;
  z-index: 10;
}

.handle-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  background: white;
  transform: translateX(-50%);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
}

.handle-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.slider-handle:hover .handle-circle,
.slider-handle:active .handle-circle {
  transform: translate(-50%, -50%) scale(1.1);
}

.handle-circle svg {
  width: 24px;
  height: 24px;
  color: #667eea;
}

/* Touch devices */
@media (hover: none) {
  .handle-circle {
    width: 56px;
    height: 56px;
  }
  
  .handle-circle svg {
    width: 28px;
    height: 28px;
  }
}
</style>
