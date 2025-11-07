import { NextRequest, NextResponse } from "next/server"; // Next 서버 타입 임포트
import { COMFY_BASE_URL, CORS_HEADERS } from "@/lib/config"; // 환경설정 임포트

export const runtime = "nodejs"; // Node.js 런타임 명시

export async function OPTIONS() { // 프리플라이트 요청 처리
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS }); // 204 응답
} // OPTIONS 종료

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) { // 히스토리 조회 엔드포인트
  try { // 예외 처리 시작
    const id = encodeURIComponent(params.id); // 경로 변수 인코딩
    const r = await fetch(`${COMFY_BASE_URL}/history/${id}`, { method: "GET" }); // ComfyUI로 프록시 조회
    const text = await r.text(); // 원문 보존
    const headers = { ...CORS_HEADERS, "Content-Type": r.headers.get("content-type") ?? "application/json" }; // 컨텐츠 타입 전달
    return new NextResponse(text, { status: r.status, headers }); // 그대로 반환
  } catch (e: any) { // 예외 처리
    return NextResponse.json({ error: "history_failed", message: String(e?.message ?? e) }, { status: 500, headers: CORS_HEADERS }); // 500 JSON
  } // catch 종료
} // GET 종료
