# macOS 설치 가이드

ComfyUI와 프로젝트를 macOS에 설치하는 방법입니다.

## 필수 요구사항

- **프로세서**: Apple Silicon (M1, M2, M3, M4)
- **운영체제**: macOS 12.3 이상
- **저장 공간**: 최소 5GB 이상

---

## 1단계: ComfyUI Desktop 설치 (권장)

ComfyUI Desktop은 일반 앱처럼 설치할 수 있는 버전입니다.

### 1-1. ComfyUI Desktop 다운로드

1. [ComfyUI 공식 웹사이트](https://www.comfy.org/)에서 macOS Desktop 버전 다운로드
2. `.dmg` 파일 다운로드 완료 대기

### 1-2. 설치

1. 다운로드한 `.dmg` 파일 더블클릭
2. ComfyUI 아이콘을 Applications 폴더로 드래그
3. 설치 완료

### 1-3. 실행

1. **Finder** → **응용 프로그램**에서 ComfyUI 실행
2. 처음 실행 시 보안 경고가 나타날 수 있음:
   - **시스템 설정** → **개인 정보 보호 및 보안**에서 "확인 없이 열기" 선택

### 1-4. 환경 설정

설치 과정에서 다음을 선택하세요:
- **실행 모드**: **MPS (권장)** 선택
  - MPS는 Apple GPU를 사용하여 성능 향상
- **설치 위치**: 기본 경로 사용 권장

### 실행 확인

- 브라우저가 자동으로 열림
- 주소: `http://localhost:8188`
- ComfyUI 작업 화면이 나타나면 설치 성공

> **참고**: 브라우저가 자동으로 열리지 않으면 수동으로 `http://localhost:8188`을 입력하세요.

---

## 2단계: 프로젝트 설치

### 2-1. Xcode Command Line Tools 설치

터미널을 열고 다음 명령 실행:

```bash
xcode-select --install
```

팝업 창이 나타나면 **설치** 클릭

### 2-2. 프로젝트 다운로드

```bash
# Git으로 다운로드
git clone [repository-url]
cd bg-remover

# 또는 ZIP 파일 다운로드 후 압축 해제
```

### 2-3. 프로젝트 의존성 설치

```bash
# 프로젝트 폴더에서
cd frontend
npm install
```

> **참고**: Node.js 18 이상이 필요합니다. [Node.js 다운로드](https://nodejs.org/)

### 2-4. 개발 서버 실행

```bash
npm run dev
```

### 실행 확인

- 브라우저에서 `http://localhost:3000` 열기
- 앱 화면이 나타나면 설치 완료

---

## 체크리스트

설치가 제대로 되었는지 확인하세요:

- [ ] ComfyUI Desktop 설치 완료
- [ ] 브라우저에서 `http://localhost:8188` 접속하여 ComfyUI 화면 확인
- [ ] Xcode Command Line Tools 설치 완료
- [ ] 프로젝트 파일 다운로드 완료
- [ ] `npm install` 완료
- [ ] `http://localhost:3000`에서 앱 실행 확인

---

## 문제 해결

### ComfyUI Desktop이 실행되지 않는 경우

1. **macOS 버전 확인**: 12.3 이상인지 확인
2. **보안 설정 확인**: 시스템 설정 → 개인 정보 보호 및 보안에서 앱 실행 허용
3. **완전 재설치**: 앱 삭제 후 다시 설치

### "MPS device not found" 오류

- Apple Silicon Mac이 아닌 경우 발생
- Intel Mac은 수동 설치 필요 (고급 사용자용)

### 브라우저가 자동으로 열리지 않는 경우

- 수동으로 `http://localhost:8188` 입력

### npm install 오류

- Node.js 버전 확인: `node --version` (18 이상 필요)
- Xcode Command Line Tools 설치 확인
- npm 캐시 삭제 후 재시도: `npm cache clean --force`

### 포트 충돌 문제

다른 프로그램이 8188 포트를 사용 중일 수 있습니다:
- 다른 프로그램 종료 후 재시도
- 또는 ComfyUI 설정에서 포트 변경

---

## 수동 설치 (고급)

Desktop 버전 대신 수동 설치를 원하는 경우:

### 준비 사항

1. Homebrew 설치:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. Git 설치:
```bash
brew install git
```

### ComfyUI 설치

1. Python 환경 설정:
```bash
# Miniconda 다운로드 및 설치
curl -O https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-arm64.sh
sh Miniconda3-latest-MacOSX-arm64.sh
```

2. ComfyUI 다운로드:
```bash
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI
```

3. PyTorch 설치:
```bash
pip3 install --pre torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/nightly/cpu
```

4. 의존성 설치:
```bash
pip3 install -r requirements.txt
```

5. 실행:
```bash
python3 main.py
```

---

## 다음 단계

설치가 완료되었다면 [part-01-overview.md](part-01-overview.md)에서 앱의 동작 원리를 학습하세요.
