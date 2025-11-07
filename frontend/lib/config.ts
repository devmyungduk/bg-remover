export const COMFY_BASE_URL = (process.env.COMFY_BASE_URL ?? "http://127.0.0.1:8188").replace(/\/+$/, ""); // ComfyUI 기본 주소, 끝의 슬래시 제거
export const CORS_HEADERS: Record<string, string> = { // CORS 헤더 정의
  "Access-Control-Allow-Origin": "*", // 모든 오리진 허용(배포 시 제한 권장)
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS", // 허용 메서드
  "Access-Control-Allow-Headers": "Content-Type, Authorization" // 허용 헤더
}; // 헤더 객체 종료
