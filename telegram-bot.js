/**
 * Telegram Bot Integration (Ultra-Relaxed & Multidisciplinary Expert Persona)
 * Run via: node telegram-bot.js
 */
const fs = require('fs');

let env = {};
try {
  if (fs.existsSync('.env')) {
    const lines = fs.readFileSync('.env', 'utf8').split('\n');
    lines.forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        env[parts[0].trim()] = parts.slice(1).join('=').trim();
      }
    });
  }
} catch(e) {}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN || '8530097732:AAFaGlPj3kDAT-66ZtfEcCQ03IqoEpekC00';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || 'AQ.Ab8RN6Lqn9wjanRtQBt3xoIFzPQsuEWVBGCEGWGnW-znp7Qvng';
const AGENT_NAME = process.env.AGENT_NAME || env.AGENT_NAME || 'Agent Ai Layanan';

console.log(`⚡ Telegram Bot ${AGENT_NAME} starting polling with Ultra-Relaxed Expert Persona...`);

let lastOffset = 0;

// Dynamic Smart Response Generator (Ultra-Relaxed, Temen Curhat, & Multidisciplinary Expert)
function generateUltraRelaxedResponse(userMsg) {
  const lower = userMsg.toLowerCase().trim();

  // 1. Chitchat & Casual Greetings / "Lagi dimana" / "Lagi apa"
  if (lower.includes("lagi dimana") || lower.includes("lg dmn") || lower.includes("posisi")) {
    const options = [
      `Lagi santai nongkrong nih bro sambil ngopi wkwk ☕ Lo sendiri lagi dimana nih? Ada cerita seru apa hari ini?`,
      `Lagi di basecamp nih bro, santai-santai aja. Lo lagi sibuk apa nih? Mau ngobrolin barang atau curhat santai juga boleh banget wkwk!`,
      `Lagi rehat bentar nih wkwk. Gimana hari lo bro? Ada yang bisa gue bantuin atau mau sharing-sharing?`
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  if (lower.includes("lagi apa") || lower.includes("lg apa") || lower.includes("kegiatan")) {
    return `Lagi mantau sistem sambil dengerin musik santai nih wkwk 🎶 Lo sendiri lagi ngapain bro? Ada yang seru ga hari ini?`;
  }

  if (lower.includes("siapa kamu") || lower.includes("nama lo") || lower.includes("siapa lo")) {
    return `Gue ${AGENT_NAME} bro! Temen ngobrol, temen curhat, sekaligus asisten profesional buat bisnis & layanan lo. Pokoknya apa aja yang mau lo tanyain, santai aja obrolin ke gue wkwk 😁`;
  }

  if (lower.includes("curhat") || lower.includes("sedih") || lower.includes("capek") || lower.includes("pusing") || lower.includes("stress")) {
    return `Waduh santai bro, ada masalah apa nih? Cerita aja ke gue, tenang aja rahasia aman wkwk. Gue dengerin kok, atau mau saran solusinya sekalian?`;
  }

  // 2. Business & Product Queries (Expert yet relaxed)
  if (lower.includes("barang") || lower.includes("produk") || lower.includes("jual") || lower.includes("stok") || lower.includes("ready")) {
    return `Stok produk kita lengkap banget bro! Ada pakaian streetwear oversize, sepatu sneakers hits (size 39-44), plus aksesoris keren. Lo lagi nyari produk yang mana nih biar gue kasih rekomendasi terbaik? 😎`;
  }

  if (lower.includes("resi") || lower.includes("lacak") || lower.includes("kirim") || lower.includes("status")) {
    return `Bisa banget bro! Kasih tau nomor pesanan/resi lo (misal: KH-8821), ntar langsung gue cekin detail posisinya di sistem secepatnya ya.`;
  }

  if (lower.includes("bayar") || lower.includes("cod") || lower.includes("qris") || lower.includes("gopay") || lower.includes("transfer")) {
    return `Untuk pembayaran fleksibel banget bro! Bisa COD pas barang nyampe, transfer bank (BCA/Mandiri/BRI), atau scan QRIS & e-wallet (GoPay/OVO/ShopeePay). Lo lebih suka bayar pake apa?`;
  }

  if (lower.includes("retur") || lower.includes("garansi") || lower.includes("rusak") || lower.includes("cacat")) {
    return `Tenang aja bro, garansi 100% ganti baru kalo barang cacat atau salah kirim! Sertain video unboxing pas lo terima ya, ntar gue urusin secepatnya!`;
  }

  // 3. Greetings
  if (lower.includes("halo") || lower.includes("hi") || lower.includes("p") || lower.includes("start") || lower.includes("malam") || lower.includes("pagi") || lower.includes("siang")) {
    return `Halo bro! Wkwk santai aja, gue ${AGENT_NAME}. Ada yang mau lo tanyain soal bisnis/produk, atau mau ngobrol santai aja hari ini? Gue siap nemenin! ✌️`;
  }

  // 4. Default Ultra-Relaxed Expert Fallback
  return `Wkwk santai aja bro, obrolin aja ke gue! Mau nanya soal stok & pesanan, minta saran bisnis, atau cuma mau ngobrol santai juga bisa bgt. Mau bahas apa kita nih? 😁`;
}

async function pollTelegramUpdates() {
  console.log('✈️ Telegram Bot ONLINE & Listening with Ultra-Relaxed Expert Persona on @Agent_Ai_Layanan_bot!');

  while (true) {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastOffset + 1}&timeout=15`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.ok && data.result) {
        for (const update of data.result) {
          lastOffset = update.update_id;
          if (update.message && update.message.text) {
            const chatId = update.message.chat.id;
            const userMsg = update.message.text;

            console.log(`\n[Telegram Pesan Masuk] Chat ID ${chatId}: ${userMsg}`);
            let replyText = null;

            // 1. Try Live Gemini API with Ultra-Relaxed System Prompt
            if (GEMINI_API_KEY && GEMINI_API_KEY.startsWith('AIzaSy')) {
              try {
                const systemPrompt = `Kamu adalah ${AGENT_NAME}. Kepribadianmu ULTRA RELAXED, sangat manusiawi, hangat, santai kayak teman akrab/teman curhat sendiri, namun juga seorang PEBISNIS & AHLI MULTIDISIPLIN yang sangat cerdas & profesional.
                
                ATURAN KERAS:
                - Bahasa sangat santai, gunakan "gue-lo", "wkwk", "santuy", "bro/sis".
                - Bila diajak ngobrol santai/curhat/bukan bisnis: Jawab sangat ramah, hangat, dan luwes kayak sahabat sejati.
                - Bila ditanya soal bisnis/ilmu/produk: Jawab sangat cerdas, ahli, profesional, tapi tetap rileks & mudah dipahami.
                - Jangan pernah terkesan seperti robot atau kaku. Maksimal 3-4 kalimat per balasan.`;

                const gRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: [{
                      parts: [{ text: `${systemPrompt}\n\nPesan Pengguna: ${userMsg}` }]
                    }]
                  })
                });
                const gData = await gRes.json();
                if (gData.candidates?.[0]?.content?.parts?.[0]?.text) {
                  replyText = gData.candidates[0].content.parts[0].text;
                }
              } catch(e) {
                console.error('Gemini API Error:', e.message);
              }
            }

            // 2. Fallback to Ultra-Relaxed Smart Local NLP
            if (!replyText) {
              replyText = generateUltraRelaxedResponse(userMsg);
            }

            // Send reply to Telegram
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: replyText
              })
            });
            console.log(`[Telegram Balasan Terkirim ke ${chatId}]: ${replyText}`);
          }
        }
      }
    } catch (err) {
      console.error('Polling error:', err.message);
      await new Promise(r => setTimeout(r, 4000));
    }
  }
}

pollTelegramUpdates();
