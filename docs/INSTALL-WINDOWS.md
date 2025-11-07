# Windows 설치 가이드

ComfyUI Portable 버전과 프로젝트를 설치하는 방법입니다.

## 필수 요구사항

- **운영체제**: Windows 10 이상
- **GPU**: Nvidia GPU (권장) 또는 CPU
- **저장 공간**: 최소 5GB 이상

---

## 1단계: ComfyUI Portable 다운로드 및 설치

### 1-1. 7-Zip 설치 (압축 해제 도구)

ComfyUI는 `.7z` 형식으로 압축되어 있어 7-Zip이 필요합니다.

1. [7-Zip 다운로드 페이지](https://www.7-zip.org/)에서 설치 파일 다운로드
2. 다운로드한 파일 실행하여 설치

### 1-2. ComfyUI Portable 다운로드

1. [ComfyUI 공식 웹사이트](https://www.comfy.org/)에서 Windows Portable 버전 다운로드
2. 다운로드 완료 후 파일 이름 확인: `ComfyUI_windows_portable_nvidia_xxx.7z`

### 1-3. 압축 해제

1. 다운로드한 `.7z` 파일에서 **우클릭**
2. **7-Zip** → **Extract Here** 선택
3. 압축 해제 완료되면 `ComfyUI_windows_portable` 폴더 생성됨

### 1-4. 폴더 이동 (선택사항)

원하는 위치로 폴더를 이동할 수 있습니다.

**권장 경로**: `C:\ComfyUI_windows_portable`

---

## 2단계: ComfyUI 실행

1. `ComfyUI_windows_portable` 폴더 열기
2. **Nvidia GPU 사용자**: `run_nvidia_gpu.bat` 파일 더블클릭
3. **CPU만 사용**: `run_cpu.bat` 파일 더블클릭

### 실행 확인

- 검은색 명령 프롬프트 창이 열리며 텍스트가 표시됨
- 약 20초 후 브라우저가 자동으로 열림
- 주소: `http://localhost:8188`
- ComfyUI 작업 화면이 나타나면 설치 성공

> **주의**: 브라우저가 자동으로 열리지 않으면 수동으로 `http://localhost:8188`을 입력하세요.

> **중요**: 앱 사용 중에는 명령 프롬프트 창을 닫지 마세요. 창을 닫으면 ComfyUI가 종료됩니다.

---

## 3단계: 프로젝트 설치

### 3-1. 프로젝트 다운로드

```bash
# Git이 설치되어 있다면
git clone [repository-url]
cd bg-remover

# Git이 없다면 ZIP 파일 다운로드 후 압축 해제
```

### 3-2. 프로젝트 의존성 설치

```bash
# 프로젝트 폴더에서
cd frontend
npm install
```

> **참고**: Node.js 18 이상이 필요합니다. [Node.js 다운로드](https://nodejs.org/)

### 3-3. 개발 서버 실행

```bash
npm run dev
```

### 실행 확인

- 브라우저에서 `http://localhost:3000` 열기
- 앱 화면이 나타나면 설치 완료

---

## 체크리스트

설치가 제대로 되었는지 확인하세요:

- [ ] 7-Zip 설치 완료
- [ ] ComfyUI Portable 압축 해제 완료
- [ ] `run_nvidia_gpu.bat` 실행 시 브라우저에서 ComfyUI 화면 확인
- [ ] 프로젝트 파일 다운로드 완료
- [ ] `npm install` 완료
- [ ] `http://localhost:3000`에서 앱 실행 확인

---

## 문제 해결

### ComfyUI가 실행되지 않는 경우

1. **Nvidia 드라이버 업데이트**: GPU를 사용하는 경우 최신 드라이버 설치
2. **방화벽 확인**: Windows Defender가 실행을 차단하는지 확인
3. **CPU 모드로 시도**: `run_cpu.bat` 파일 실행

### 브라우저가 자동으로 열리지 않는 경우

- 명령 프롬프트 창에 표시된 주소를 수동으로 입력
- 일반적으로 `http://127.0.0.1:8188` 또는 `http://localhost:8188`

### 포트 충돌 문제

다른 프로그램이 8188 포트를 사용 중일 수 있습니다:
- 다른 프로그램 종료 후 재시도
- 또는 ComfyUI 설정에서 포트 변경

### npm install 오류

- Node.js 버전 확인: `node --version` (18 이상 필요)
- npm 캐시 삭제 후 재시도: `npm cache clean --force`

---

## 다음 단계

설치가 완료되었다면 [part-01-overview.md](part-01-overview.md)에서 앱의 동작 원리를 학습하세요.
