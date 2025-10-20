# RunPod ComfyUI 배경 제거 웹앱

> Vue.js와 ComfyUI RMBG-2.0을 사용한 RunPod GPU 기반 배경 제거 웹 애플리케이션

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.5.22-brightgreen.svg)](https://vuejs.org/)
[![ComfyUI](https://img.shields.io/badge/ComfyUI-Latest-blue.svg)](https://github.com/comfyanonymous/ComfyUI)

[English](README.md) | **한국어**

## 🎯 주요 기능

- 📤 **이미지 업로드** - 드래그 앤 드롭 또는 파일 선택
- 🎨 **배경 제거** - RMBG-2.0 AI 모델 기반
- 🔄 **실시간 진행상황** - 시각적 진행률 표시
- 📊 **전후 비교** - 인터랙티브 슬라이더 비교
- 💾 **결과 다운로드** - 원클릭 다운로드
- 🚀 **GPU 가속** - RunPod에서 빠른 처리

## 🛠️ 기술 스택

### 프론트엔드
- **프레임워크:** Vue 3.5.22 (Composition API)
- **빌드 도구:** Vite 7.1.7
- **스타일링:** Vanilla CSS (Scoped)

### 백엔드
- **ComfyUI:** 커스텀 노드 통합
- **모델:** RMBG-2.0
- **서버:** aiohttp (ComfyUI 내장)

### 인프라
- **GPU:** RunPod (NVIDIA RTX 4000 Ada / A4000)
- **환경:** Ubuntu 22.04 + CUDA 11.8
- **런타임:** Node.js 20 LTS + Python 3.10

## 📦 설치 방법

### 사전 요구사항
- RunPod 계정 및 GPU Pod
- 터미널/bash 기본 지식
- Git (RunPod에 기본 설치됨)

### 빠른 시작
```bash
# 1. 저장소 클론
git clone https://github.com/devmyungduk/bg-remover.git
cd bg-remover

# 2. 설치 스크립트 실행
bash scripts/setup-runpod.sh

# 3. ComfyUI 시작
bash scripts/start-comfyui.sh

# 4. Vue.js 앱 개발 (다른 터미널에서)
cd vue-app
npm install
npm run dev
```

## 🚀 사용 방법

### 1. ComfyUI 접속
```
http://[RUNPOD-IP]:[PORT]/
```

### 2. 배경 제거 앱 접속
```
http://[RUNPOD-IP]:[PORT]/bg_remove
```

### 3. 이미지 업로드 및 처리
1. "이미지 선택" 버튼 클릭
2. 이미지 파일 선택
3. "배경 제거 시작" 클릭
4. 처리 대기 (10-30초)
5. 슬라이더로 결과 비교
6. 처리된 이미지 다운로드

## 📖 문서

`docs/` 디렉토리에 상세한 가이드가 있습니다:

- **[01. 환경 설정](docs/01-environment-setup.md)**  
  RunPod 설정, ComfyUI 설치, Node.js 및 RMBG-2.0 모델 설치

- **[02. Vue.js 앱 개발](docs/02-vue-app-development.md)**  
  Vue 3 + Vite로 프론트엔드 구축 및 ComfyUI API 통합

- **[03. ComfyUI 통합](docs/03-comfyui-integration.md)**  
  커스텀 노드 생성 및 Vue.js 빌드 배포

- **[04. 문제 해결](docs/04-troubleshooting.md)**  
  자주 발생하는 문제와 해결 방법

## 🏗️ 프로젝트 구조
```
bg-remover/
├── docs/                           # 문서
│   ├── 01-environment-setup.md
│   ├── 02-vue-app-development.md
│   ├── 03-comfyui-integration.md
│   └── 04-troubleshooting.md
│
├── vue-app/                        # Vue.js 애플리케이션
│   ├── src/
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── components/
│   ├── package.json
│   └── vite.config.js
│
├── comfyui-custom-node/            # ComfyUI 통합
│   ├── __init__.py                 # 라우트 설정
│   └── web/                        # 배포된 Vue.js 빌드
│
├── scripts/                        # 자동화 스크립트
│   ├── setup-runpod.sh            # 환경 설정
│   ├── build-and-deploy.sh        # 빌드 & 배포
│   └── start-comfyui.sh           # ComfyUI 시작
│
├── .gitignore
├── LICENSE
├── README.md                       # 영문 README
└── README.ko.md                    # 한글 README (이 파일)
```

## 🔧 개발

### Vue.js 앱 빌드
```bash
cd vue-app
npm run build
```

### ComfyUI에 배포
```bash
bash scripts/build-and-deploy.sh
```

### ComfyUI 재시작
```bash
bash scripts/start-comfyui.sh
```

## 🧪 테스트

### 로컬 개발
```bash
# 터미널 1: ComfyUI 시작
cd /workspace/ComfyUI
python main.py --listen --port 8188 --enable-cors-header

# 터미널 2: Vue 개발 서버 시작
cd vue-app
npm run dev -- --host
```

접속: `http://localhost:5173/`

## 📸 스크린샷

*(배포 후 스크린샷 추가 예정)*

## 🎯 로드맵

- [ ] 다중 이미지 배치 처리
- [ ] 모바일 반응형 디자인 개선
- [ ] 비교 슬라이더 터치 지원
- [ ] 처리 이미지 히스토리
- [ ] 설정 영구 저장
- [ ] Docker 컨테이너화

## 📝 라이선스

이 프로젝트는 MIT 라이선스에 따라 라이선스가 부여됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- [ComfyUI](https://github.com/comfyanonymous/ComfyUI) - 강력한 노드 기반 Stable Diffusion UI
- [RMBG-2.0](https://huggingface.co/briaai/RMBG-2.0) - 최첨단 배경 제거 모델
- [Vue.js](https://vuejs.org/) - 프로그레시브 JavaScript 프레임워크
- [RunPod](https://runpod.io/) - GPU 클라우드 컴퓨팅 플랫폼

## 📧 연락처

- **작성자:** Neuemuziek
- **GitHub:** [@devmyungduk](https://github.com/devmyungduk)
- **이메일:** neuemdkim@gmail.com

---

**Vue.js와 ComfyUI로 ❤️를 담아 제작**
