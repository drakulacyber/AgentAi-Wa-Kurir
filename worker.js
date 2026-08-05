/**
 * Cloudflare Workers Backend Proxy for Free Gemini API
 * Deploy via: npx wrangler deploy
 */
export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ status: "ok", message: "Agent Ai Layanan Worker is Running!" }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    try {
      const body = await request.json();
      const customerMessage = body.message || "Halo";
      const apiKey = env.GEMINI_API_KEY || body.geminiApiKey;

      if (!apiKey) {
        return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY" }), {
          status: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const aiResponse = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `Kamu adalah Agent Ai Layanan, CS santuy, ramah, pakai lo-gue.\nPertanyaan: ${customerMessage}` }]
            }
          ]
        })
      });

      const data = await aiResponse.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Bentar ya bro, gue cekin dulu data lo di sistem!";

      return new Response(JSON.stringify({ reply: reply, status: "success" }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
  }
};
