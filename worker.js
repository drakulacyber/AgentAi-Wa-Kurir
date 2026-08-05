/**
 * Cloudflare Workers Serverless 24/7 Telegram Bot & Gemini API Backend
 * Runs 24/7 in the Cloud (0% Terminal / Laptop PC Required!)
 */
export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    if (request.method === "GET") {
      return new Response(JSON.stringify({
        status: "online",
        service: "Agent Ai Layanan 24/7 Cloudflare Worker",
        telegramBot: "@Agent_Ai_Layanan_bot"
      }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    try {
      const update = await request.json();
      const botToken = env.TELEGRAM_BOT_TOKEN || '8530097732:AAFaGlPj3kDAT-66ZtfEcCQ03IqoEpekC00';
      const geminiApiKey = env.GEMINI_API_KEY || 'AQ.Ab8RN6Lqn9wjanRtQBt3xoIFzPQsuEWVBGCEGWGnW-znp7Qvng';

      // Check if incoming Telegram message webhook
      if (update && update.message && update.message.text) {
        const chatId = update.message.chat.id;
        const userMsg = update.message.text;

        let replyText = `Halo bro/sis! Gue Agent Ai Layanan. Ada yang bisa gue bantuin hari ini? wkwk 😁`;

        // Generate Ultra-Relaxed AI response via Gemini API
        if (geminiApiKey && geminiApiKey.startsWith('AIzaSy')) {
          try {
            const gRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [{ text: `Kamu adalah Agent Ai Layanan. Persona ultra relaxed, santuy, ramah, balasan maks 3 kalimat.\nPesan Customer: ${userMsg}` }]
                }]
              })
            });
            const gData = await gRes.json();
            replyText = gData.candidates?.[0]?.content?.parts?.[0]?.text || replyText;
          } catch(e) {}
        } else {
          // Local NLP Smart Fallback
          const lower = userMsg.toLowerCase();
          if (lower.includes("lagi dimana")) replyText = "Lagi nongkrong santai nih bro sambil ngopi ☕ Lo sendiri lagi dimane?";
          else if (lower.includes("barang") || lower.includes("stok")) replyText = "Stok kita lengkap bro! Kaos oversize & sepatu ready. Mau model yang mana?";
          else if (lower.includes("resi") || lower.includes("kirim")) replyText = "Bisa banget! Sebutin no resi pesanan lo, ntar langsung gue cekin!";
        }

        // Reply to Telegram User
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: replyText })
        });

        return new Response(JSON.stringify({ status: "ok" }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({ status: "ignored" }), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }
};
