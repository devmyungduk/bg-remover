// ===================================================================                                      // 🧩 이미지 배경 제거 React 클라이언트 (원본 주석·정렬 유지 + 보완 적용)
'use client';                                                                                               // Next.js 클라이언트 지시자

import { useState, useEffect, useRef } from 'react';                                                        // React 훅 임포트
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';                         // 비교 슬라이더

// -------------------------------------------------------------------                                      // 데이터 인터페이스 정의
interface UploadResponse { name: string; }                                                                   // 업로드 API 응답 형식
interface PromptResponse { prompt_id: string; }                                                              // 프롬프트 실행 응답 형식

// ===================================================================                                      // 메인 컴포넌트 시작
export default function Home() {                                                                             // 기본 내보내기 컴포넌트
  // ---------------------------------------------------------------                                        // 상태 변수 선언 섹션
  const [file, setFile]                     = useState<File | null>(null);                                   // 업로드된 파일
  const [preview, setPreview]               = useState('');                                                  // 원본 미리보기 URL
  const [result, setResult]                 = useState('');                                                  // 결과 이미지 URL
  const [progress, setProgress]             = useState(0);                                                   // 처리 진행률(%)
  const [processing, setProcessing]         = useState(false);                                               // 처리 중 여부
  const [error, setError]                   = useState<string | null>(null);                                 // 오류 메시지 상태
  const [clientId]                          = useState(() => Math.random().toString(36).substring(7));       // WebSocket용 클라이언트 ID
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null);                               // 현재 프롬프트 ID

  // ---------------------------------------------------------------                                        // 진행률 최적화용 참조(🔧 throttle/skip)
  const wsRef                               = useRef<WebSocket | null>(null);                                // WebSocket 인스턴스 참조
  const lastUpdateRef                       = useRef(0);                                                     // 마지막 업데이트 시각(ms)
  const lastProgressRef                     = useRef(0);                                                     // 마지막 진행률(%)

  // ===================================================================                                      // 🎨 이미지 정사각형 리사이즈 유틸
  const resizeToSquare = (file: File): Promise<File> => {                                                    // 정사각형 PNG로 변환
    return new Promise((resolve, reject) => {
      const reader  = new FileReader();                                                                      // 파일 리더
      const image   = new Image();                                                                           // 이미지 객체
      const canvas  = document.createElement('canvas');                                                      // 캔버스 생성

      reader.onload = (e) => {
        image.onload = () => {
          const size = Math.max(image.width, image.height);                                                  // 긴 변 기준 사이즈
          canvas.width = size; canvas.height = size;                                                         // 정사각형 캔버스
          const ctx = canvas.getContext('2d');                                                               // 2D 컨텍스트
          if (!ctx) { reject(new Error('Canvas context error')); return; }                                   // 컨텍스트 확인
          ctx.fillStyle = 'white'; ctx.fillRect(0, 0, size, size);                                           // 배경 흰색 채우기
          const x = (size - image.width) / 2;                                                                // 중앙정렬 X
          const y = (size - image.height) / 2;                                                               // 중앙정렬 Y
          ctx.drawImage(image, x, y);                                                                        // 이미지 그리기
          canvas.toBlob((blob) => {                                                                          // PNG Blob 생성
            if (!blob) { reject(new Error('Blob conversion error')); return; }                               // Blob 확인
            const newFile = new File([blob], file.name, { type: 'image/png' });                              // 새 파일 생성
            resolve(newFile);                                                                                // 해결
          }, 'image/png');
        };
        image.onerror = reject;                                                                              // 이미지 로드 오류
        image.src = e.target?.result as string;                                                              // DataURL 로드
      };

      reader.onerror = reject;                                                                               // 리더 오류
      reader.readAsDataURL(file);                                                                            // 파일 읽기 시작
    });
  };

  // ===================================================================                                      // ♻️ result URL 정리 (메모리 해제)
  useEffect(() => {                                                                                          // 컴포넌트 unmount 시 정리
    return () => { if (result) URL.revokeObjectURL(result); };                                               // ObjectURL 해제
  }, [result]);                                                                                              // 의존성: result

  // ===================================================================                                      // ♻️ WebSocket 정리 (리소스 해제)
  useEffect(() => {                                                                                          // 컴포넌트 unmount 시 정리
    return () => { if (wsRef.current) { try { wsRef.current.close(); } catch {} wsRef.current = null; } };  // WS 연결 해제
  }, []);                                                                                                    // 의존성: 없음 (mount/unmount만)

  // ===================================================================                                      // 📜 처리 이력 폴링 (ComfyUI history)
  useEffect(() => {
    if (!currentPromptId || !processing) return;                                                             // 실행 중일 때만 폴링
    const abortController = new AbortController();                                                           // 취소 컨트롤러 생성
    const interval = setInterval(async () => {                                                               // 2초 주기 폴링
      try {
        const res = await fetch(`/api/comfy/history/${currentPromptId}`, {                                   // 히스토리 조회
          signal: abortController.signal                                                                     // 취소 시그널 전달
        });
        if (!res.ok) return;                                                                                 // 응답 확인
        const history = await res.json();                                                                    // JSON 파싱
        const outputs = history[currentPromptId]?.outputs;                                                   // 출력 노드 모음
        if (outputs) {
          for (const nodeId in outputs) {                                                                    // 각 노드 순회
            const node = outputs[nodeId];                                                                     // 노드 핸들
            if (node.images && node.images.length > 0) {                                                     // 이미지 존재
              const img = node.images[0];                                                                     // 첫 이미지
              const url = `/api/comfy/view?filename=${encodeURIComponent(img.filename)}&subfolder=${encodeURIComponent(img.subfolder || '')}&type=${encodeURIComponent(img.type || 'output')}`; // 프록시 URL
              setResult(url);                                                                                // 결과 URL 설정
              setProcessing(false);                                                                          // 처리 종료
              setCurrentPromptId(null);                                                                      // 프롬프트 ID 해제
              // ↓ 처리 종료 시 WebSocket 정리                                                                 // 정리
              if (wsRef.current) { try { wsRef.current.close(); } catch {} wsRef.current = null; }           // WS 종료
              return;                                                                                        // 루프 탈출
            }
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;                                                               // 취소된 요청 무시
        console.error('폴링 오류:', err);                                                                    // 폴링 예외 로그
      }
    }, 2000);
    return () => {                                                                                           // 언마운트/조건변경 시 해제
      clearInterval(interval);                                                                               // interval 해제
      abortController.abort();                                                                               // 진행 중 fetch 취소
    };
  }, [currentPromptId, processing]);                                                                          // 의존성

  // ===================================================================                                      // 📁 파일 선택 처리
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {                                // 파일 선택 핸들러
    const selected = e.target.files?.[0];                                                                     // 첫 파일
    if (!selected) return;                                                                                    // 없으면 종료
    const valid = ['image/jpeg', 'image/png', 'image/webp'];                                                  // 허용 MIME
    if (!valid.includes(selected.type)) { setError('JPG/PNG/WEBP 파일만 가능합니다'); return; }               // 타입 검증
    if (selected.size > 10 * 1024 * 1024) { setError('10MB 이하 파일만 가능합니다'); return; }               // 크기 제한
    setError(null);                                                                                           // 에러 초기화
    try {
      if (preview) URL.revokeObjectURL(preview);                                                              // 기존 미리보기 해제
      const squareFile = await resizeToSquare(selected);                                                      // 정사각 변환
      const newPreview = URL.createObjectURL(squareFile);                                                     // 미리보기 URL
      setFile(squareFile); setPreview(newPreview); setResult(''); setProgress(0);                             // 상태 초기화
    } catch (err) {
      console.error('이미지 처리 실패:', err);                                                                // 변환 실패 로그
      setError('이미지 처리 중 오류가 발생했습니다');                                                          // 사용자 메시지
    }
  };

  // ===================================================================                                      // ⬆️ 업로드 함수 (ComfyUI 프록시)
  const uploadImage = async (file: File): Promise<string> => {                                                // 파일 업로드
    const form = new FormData(); form.append('image', file);                                                  // 폼 구성
    const res = await fetch('/api/comfy/upload', { method: 'POST', body: form });                             // 업로드 요청
    if (!res.ok) throw new Error('업로드 실패');                                                              // 응답 검증
    const data: UploadResponse = await res.json();                                                            // JSON
    if (!data.name) throw new Error('Invalid upload response');                                               // 필드 검증
    return data.name;                                                                                         // 서버 저장 파일명 반환
  };

  // ===================================================================                                      // ▶️ 프롬프트 큐잉 (워크플로 실행)
  const queuePrompt = async (wf: Record<string, any>): Promise<string> => {                                   // 프롬프트 큐요청
    const res = await fetch('/api/comfy/prompt', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ prompt: wf, client_id: clientId }),                                          // 클라 ID 포함
    });
    if (!res.ok) throw new Error('프롬프트 실행 실패');                                                       // 응답 검증
    const data: PromptResponse = await res.json();                                                            // JSON
    if (!data.prompt_id) throw new Error('Invalid prompt response');                                          // 필드 검증
    return data.prompt_id;                                                                                    // 프롬프트 ID
  };

  // ===================================================================                                      // 🛠️ 이미지 처리(핵심) — WS 실행 시점 이동 + throttle
  const processImage = async () => {                                                                          // 처리 시작
    if (!file || processing) return;                                                                          // 재진입 방지
    setProcessing(true); setError(null);                                                                      // 상태 갱신

    // 1) WebSocket을 "실행 시점"에만 연결 (요청 사항) + throttling/skip 적용                             // WS 연결 정책
    try {
      wsRef.current = new WebSocket(`ws://127.0.0.1:8188/ws?clientId=${clientId}`);                           // WS 생성
      wsRef.current.onerror = (err) => { console.warn('WebSocket 연결 실패:', err); };                        // 에러 로깅
      wsRef.current.onmessage = (e) => {                                                                       // 서버 메시지
        try {
          const now  = Date.now();                                                                            // 현재 시각(ms)
          const data = JSON.parse(e.data);                                                                     // JSON 파싱
          if (data.type === 'progress') {                                                                      // 진행률 이벤트
            const percent = Math.round((data.data.value / data.data.max) * 100);                               // 퍼센트
            if (Math.abs(percent - lastProgressRef.current) < 1) return;                                       // 1% 미만 변화 skip
            if (now - lastUpdateRef.current < 200) return;                                                     // 200ms 내 중복 skip
            lastUpdateRef.current = now;                                                                       // 시각 갱신
            lastProgressRef.current = percent;                                                                 // 진행률 저장
            setProgress(percent);                                                                              // 상태 갱신
          }
        } catch (err) { console.error('WS 메시지 파싱 오류:', err); }                                           // 파싱 오류
      };
    } catch (err) {
      console.error('WebSocket 초기화 실패:', err);                                                            // 초기화 예외
    }

    // 2) 업로드 → 워크플로 로드/치환 → 프롬프트 큐잉                                                       // 실행 파이프라인
    try {
      const filename = await uploadImage(file);                                                                // 업로드
      const wfRes = await fetch('/workflows/bg_remove.json');                                                  // 워크플로 로드
      if (!wfRes.ok) throw new Error('워크플로 로드 실패');                                                    // 검증
      const wf = await wfRes.json();                                                                           // JSON 파싱
      for (const id in wf) {                                                                                   // 노드 순회
        if (wf[id].class_type === 'LoadImage') wf[id].inputs.image = filename;                                 // 입력 치환
      }
      const pid = await queuePrompt(wf);                                                                       // 큐잉
      setCurrentPromptId(pid);                                                                                 // ID 설정
    } catch (err: any) {
      console.error('배경 제거 실패:', err);                                                                   // 실행 예외
      setError(err?.message || '처리 중 오류가 발생했습니다');                                                 // 사용자 메시지
      setProcessing(false);                                                                                    // 상태 복구
      // 실패 시 WS 정리                                                                                      // 정리
      if (wsRef.current) { try { wsRef.current.close(); } catch {} wsRef.current = null; }                     // WS 종료
    }
  };

  // ===================================================================                                      // ⬇️ 결과 다운로드
  const downloadImage = async () => {                                                                          // 다운로드 핸들러
    if (!result) return;                                                                                       // 결과 확인
    const res = await fetch(result); if (!res.ok) return;                                                      // 요청/응답
    const blob = await res.blob();                                                                             // Blob 획득
    const url  = URL.createObjectURL(blob);                                                                    // 임시 URL
    const a    = document.createElement('a'); a.href = url; a.download = 'removed-background.png';            // 앵커 준비
    document.body.appendChild(a); a.click(); document.body.removeChild(a);                                     // 클릭/해제
    URL.revokeObjectURL(url);                                                                                  // URL 해제
  };

  // ===================================================================                                      // 🖥️ JSX 렌더링
  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-4">       {/* 메인 컨테이너 */}
      <style jsx>{`
        .checker-bg {
          background-image:
            linear-gradient(45deg, #cfcfcf 25%, transparent 25%),
            linear-gradient(-45deg, #cfcfcf 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #cfcfcf 75%),
            linear-gradient(-45deg, transparent 75%, #cfcfcf 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
          background-color: white;
        }
      `}</style>

      <div className="text-center mb-4">                                                                       {/* 헤더 */}
        <h1 className="text-3xl font-bold text-white mb-2">배경 제거 앱</h1>                                   {/* 타이틀 */}
      </div>

      <div className="flex flex-col md:grid md:grid-cols-12 gap-4 w-full">                                     {/* 레이아웃 그리드 */}
        <div className="md:col-span-2 bg-teal-700 rounded-lg p-4 flex flex-col gap-3">                          {/* 좌측 패널 */}
          <input type="file" accept="image/*" onChange={handleFileChange} className="text-white text-sm" />     {/* 파일 입력 */}
          {error && <div className="bg-red-500 text-white text-sm p-2 rounded">{error}</div>}                   {/* 에러 표시 */}
          <button onClick={processImage} disabled={!file || processing} className="bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50 text-sm">
            {processing ? '처리 중...' : '배경 제거'}                                                            {/* 실행 버튼 */}
          </button>
          {progress > 0 && (                                                                                    // 진행률 바
            <div>
              <div className="w-full bg-gray-700 rounded h-3">
                <div className="bg-blue-500 h-3 rounded transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-center text-sm text-white mt-1">{progress}%</p>
            </div>
          )}
          {result && (                                                                                          // 결과 버튼들
            <>
              <button onClick={downloadImage} className="bg-green-600 text-white py-2 px-4 rounded text-sm">다운로드</button>
              <button
                onClick={() => {                                                                                // 초기화
                  if (preview) URL.revokeObjectURL(preview);                                                    // 미리보기 URL 해제
                  if (result.startsWith('blob:')) URL.revokeObjectURL(result);                                  // 결과 URL 해제 (ObjectURL인 경우)
                  setFile(null); setPreview(''); setResult(''); setProgress(0); setError(null);
                  lastProgressRef.current = 0;                                                                  // 진행률 참조 초기화
                }}
                className="bg-gray-600 text-white py-2 px-4 rounded text-sm"
              >
                새 이미지
              </button>
            </>
          )}
        </div>

        <div className="md:col-span-5 bg-lime-100 aspect-square flex items-center justify-center overflow-hidden relative rounded-lg">
          {preview ? ( <img src={preview} alt="Before" className="w-full h-full object-contain" /> )            // 원본 미리보기
                   : ( <p className="text-gray-700 text-center p-4">이미지를 선택하세요</p> )}
        </div>

        <div className="md:col-span-5 bg-yellow-100 aspect-square flex items-center justify-center overflow-hidden relative rounded-lg">
          {preview && result ? (                                                                               // Before/After 비교 슬라이더
            <div className="absolute inset-0">
              <ReactCompareSlider
                style={{ width: '100%', height: '100%' }}
                itemOne={<ReactCompareSliderImage src={preview} alt="Before" style={{ objectFit: 'contain' }} />}
                itemTwo={
                  <div className="checker-bg w-full h-full">
                    <ReactCompareSliderImage src={result} alt="After" style={{ objectFit: 'contain' }} />
                  </div>
                }
              />
            </div>
          ) : (
            <p className="text-gray-700 text-center p-4">처리 완료 후 표시됩니다</p>                           // 안내 문구
          )}
        </div>
      </div>

      <div className="text-right mt-4">                                                                        {/* 푸터 */}
<p className="text-sm text-white/80" aria-label="copyright">
  © {new Date().getFullYear()} <span className="font-medium">devmyungduk</span>
  <span className="mx-2">·</span>
  <a
    href="https://github.com/devmyungduk/bg-remover"
    target="_blank"
    rel="noopener noreferrer"
    className="underline hover:text-white"
    aria-label="Open project on GitHub"
  >
    bg-remover v1.0.0
  </a>
</p>      </div>
    </main>
  );
}
// ===================================================================                                      // 끝