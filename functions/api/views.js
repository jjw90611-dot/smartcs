export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // API 엔드포인트: /api/views
    if (url.pathname === "/api/views") {
      try {
        // 오늘 날짜 (KST 기준)
        const today = new Date().toLocaleDateString("sv-SE", {
          timeZone: "Asia/Seoul"
        }); // "2026-01-15" 형식

        // 현재 조회수 읽기
        const totalStr = await env.VIEWS_KV.get("total");
        const todayStr = await env.VIEWS_KV.get(`day:${today}`);

        const total = parseInt(totalStr || "0");
        const todayCount = parseInt(todayStr || "0");

        // POST 요청이면 조회수 증가
        if (request.method === "POST") {
          const newTotal = total + 1;
          const newToday = todayCount + 1;

          await env.VIEWS_KV.put("total", String(newTotal));
          await env.VIEWS_KV.put(`day:${today}`, String(newToday));

          return new Response(
            JSON.stringify({ total: newTotal, today: newToday }),
            {
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
              }
            }
          );
        }

        // GET 요청이면 현재 조회수 반환
        return new Response(
          JSON.stringify({ total, today: todayCount }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err.message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // 정적 자산 (index.html 등) 서빙
    return env.ASSETS.fetch(request);
  }
};
