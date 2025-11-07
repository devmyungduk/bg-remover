# AI 배경 제거 앱 - 워크숍

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![ComfyUI](https://img.shields.io/badge/ComfyUI-Latest-blue.svg)](https://github.com/comfyanonymous/ComfyUI)

ComfyUI와 Next.js를 활용한 실시간 AI 이미지 처리 앱입니다.

## 주요 기능

- **브라우저에서 즉시 배경 제거**: 별도 프로그램 설치 없이 웹에서 바로 실행
- **Before/After 비교**: 드래그 슬라이더로 원본과 결과를 쉽게 비교
- **다양한 워크플로 지원**: 배경 제거 외 다른 AI 기능으로 확장 가능
- **반응형 UI**: 모바일과 데스크톱 모두 최적화

## 장점

- **코드 없이 시작**: 프로젝트 다운로드 후 즉시 실행 가능
- **실전 학습**: 실제 동작하는 앱으로 AI 통합 방법 학습
- **확장 가능**: 배경 제거 외 다른 AI 기능으로 쉽게 변경
- **초보자 친화적**: 기술 용어 최소화, 단계별 설명 제공

---

## 빠른 시작

### 설치하기

운영체제를 선택하여 설치 가이드를 확인하세요:

- **[Windows 사용자](docs/INSTALL-WINDOWS.md)**
- **[macOS 사용자](docs/INSTALL-MACOS.md)**

각 가이드에는 ComfyUI 설치부터 프로젝트 실행까지 전 과정이 포함되어 있습니다.

---

## 프로젝트 구조

```
bg-remover/
├── docs/                          # 설치 가이드 및 워크숍 튜토리얼
│   ├── INSTALL-WINDOWS.md         # Windows 설치 가이드
│   ├── INSTALL-MACOS.md           # macOS 설치 가이드
│   ├── part-01-overview.md
│   ├── part-02-core-logic.md
│   └── part-03-customization.md
├── frontend/
│   ├── app/
│   │   ├── api/comfy/            # ComfyUI 연결 부분
│   │   ├── page.tsx              # 메인 컴포넌트
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── public/
│   │   └── workflows/
│   │       └── bg_remove.json    # ComfyUI 워크플로
│   └── package.json
└── README.md
```

---

## 워크숍 튜토리얼

| 파트 | 주제 | 시간 | 문서 |
|------|------|------|------|
| Part 1 | 이미지 처리 파이프라인 | 30분 | [시작하기 →](docs/part-01-overview.md) |
| Part 2 | 핵심 로직 실습 | 120분 | [시작하기 →](docs/part-02-core-logic.md) |
| Part 3 | 커스터마이징 | 120분 | [시작하기 →](docs/part-03-customization.md) |

<sub>설치가 완료되면 Part 1부터 순서대로 진행하세요.</sub>

---

## 학습 목표

이 워크숍을 통해 다음을 배울 수 있습니다:

- **AI 앱의 전체 흐름**: 이미지 업로드부터 결과 출력까지
- **ComfyUI와 웹 앱 연결**: AI 엔진과 프론트엔드 통신 구조
- **이미지 처리 워크플로**: ComfyUI 워크플로 실행 과정
- **파일 업로드/다운로드**: 이미지 파일을 주고받는 전체 흐름

---

## 사용된 기술

**프론트엔드**
- Next.js 14 (React 프레임워크)
- TypeScript
- Tailwind CSS
- react-compare-slider

**AI 엔진**
- ComfyUI

---

## 코드 확인 방법

튜토리얼에서 "Code Line 119-136" 형태의 라인 번호를 볼 수 있습니다.

**VSCode에서 특정 라인으로 이동:**

```
1. frontend/app/page.tsx 파일 열기
2. 단축키 사용
- Windows: Ctrl + G
- Mac: Cmd + G
3. 라인 번호 입력 (예: 119)
4. Enter 키를 눌러 해당 라인으로 이동
```

---

## 문제 해결

설치 또는 실행 중 문제가 발생하면:

1. 해당 설치 가이드의 "문제 해결" 섹션 확인
2. ComfyUI가 실행 중인지 확인 (`http://localhost:8188`)
3. 프론트엔드 서버가 실행 중인지 확인 (`http://localhost:3000`)
4. 브라우저 콘솔에서 오류 메시지 확인

---

## 라이선스

MIT License

<div align="right">
  <sub>created by <a href="https://github.com/devmyungduk">@neuemuziek</a></sub>
</div>