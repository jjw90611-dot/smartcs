// Cloudflare Pages Functions - 조회수 API
// 엔드포인트: /api/views

export async function onRequest(context) {
  const { env } = context;
  const kv = env.VIEWS_KV; // KV 네임스페이스 바인딩

  // CORS 헤더
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store",
  };

  try {
    // 오늘 날짜 (KST 기준)
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const today = kst.toISOString().slice(0, 10); // "2026-01-15"

    // 현재 값 읽기
    const totalStr = await kv.get("total");
    const todayStr = await kv.get(`daily:${today}`);

    const total = (parseInt(totalStr) || 0) + 1;
    const todayCount = (parseInt(todayStr) || 0) + 1;

    // 값 저장 (daily 키는 40일 후 자동 삭제)
    await kv.put("total", total.toString());
    await kv.put(`daily:${today}`, todayCount.toString(), {
      expirationTtl: 60 * 60 * 24 * 40,
    });

    return new Response(
      JSON.stringify({ total, today: todayCount, date: today }),
      { headers }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message, total: 0, today: 0 }),
      { status: 500, headers }
    );
  }
}
