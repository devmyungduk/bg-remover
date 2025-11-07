import { NextRequest, NextResponse } from "next/server"; // Next 서버 타입 임포트
import { COMFY_BASE_URL, CORS_HEADERS } from "@/lib/config"; // 환경설정 임포트

export const runtime = "nodejs"; // Node.js 런타임 명시

export async function OPTIONS() { // 프리플라이트 요청 처리
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS }); // 204 응답
} // OPTIONS 종료

export async function GET(req: NextRequest) { // 이미지 조회 프록시
  try { // 예외 처리 시작
    const url = new URL(req.url); // 요청 URL 파싱
    const filename = url.searchParams.get("filename") ?? ""; // 파일명 추출
    const subfolder = url.searchParams.get("subfolder") ?? ""; // 서브폴더 추출
    const type = url.searchParams.get("type") ?? "output"; // 타입 추출(기본 output)

    const target = new URL(`${COMFY_BASE_URL}/view`); // 대상 URL 생성
    if (filename) target.searchParams.set("filename", filename); // 파일명 전달
    if (subfolder) target.searchParams.set("subfolder", subfolder); // 서브폴더 전달
    if (type) target.searchParams.set("type", type); // 타입 전달

    const r = await fetch(target, { method: "GET" }); // 원 서버로 요청
    const headers = new Headers(CORS_HEADERS); // CORS 헤더 복사
    const ct = r.headers.get("content-type") ?? "application/octet-stream"; // 컨텐츠 타입 가져오기
    headers.set("Content-Type", ct); // 컨텐츠 타입 설정
    const disp = r.headers.get("content-disposition"); // 다운로드 헤더 가져오기
    if (disp) headers.set("Content-Disposition", disp); // 다운로드 헤더 전달
    return new NextResponse(r.body, { status: r.status, headers }); // 스트림 그대로 반환
  } catch (e: any) { // 예외 처리
    return NextResponse.json({ error: "view_failed", message: String(e?.message ?? e) }, { status: 500, headers: CORS_HEADERS }); // 500 JSON
  } // catch 종료
} // GET 종료
