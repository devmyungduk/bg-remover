import { NextRequest, NextResponse } from "next/server"; // Next 서버 타입 임포트
import { COMFY_BASE_URL, CORS_HEADERS } from "@/lib/config"; // 환경설정 임포트

export const runtime = "nodejs"; // Node.js 런타임 명시

export async function OPTIONS() { // 프리플라이트 요청 처리
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS }); // 204 응답
} // OPTIONS 종료

export async function POST(req: NextRequest) { // 프롬프트 큐잉 엔드포인트
  try { // 예외 처리 시작
    const body = await req.json(); // 요청 JSON 파싱
    const r = await fetch(`${COMFY_BASE_URL}/prompt`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); // ComfyUI로 전달
    const text = await r.text(); // 원문 보존
    const headers = { ...CORS_HEADERS, "Content-Type": r.headers.get("content-type") ?? "application/json" }; // 컨텐츠 타입 전달
    return new NextResponse(text, { status: r.status, headers }); // 상태와 함께 반환
  } catch (e: any) { // 예외 처리
    return NextResponse.json({ error: "prompt_failed", message: String(e?.message ?? e) }, { status: 500, headers: CORS_HEADERS }); // 500 JSON
  } // catch 종료
} // POST 종료
