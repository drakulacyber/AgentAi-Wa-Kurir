/**
 * Telegram Bot Integration (Topic-Aware & Group-Filter Version)
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
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || '';
const AGENT_NAME = process.env.AGENT_NAME || env.AGENT_NAME || 'Agent Ai Layanan';

console.log(`⚡ Telegram Bot ${AGENT_NAME} starting polling...`);

let lastOffset = 0;

const topicMatrix = [
  {
    keywords: ["harga", "berapa", "biaya", "pricelist", "ongkir"],
    reply: "Untuk harga produk kita mulai dari Rp 85.000 - Rp 250.000 aja bro! Bebas ongkir ke seluruh Jawa/Sumatera buat pembelian min 2 pcs. Lo mau cek harga produk yang mana nih?"
  },
  {
    keywords: ["stok", "ready", "ukuran", "size", "warna", "baju", "sepatu", "kaos"],
    reply: "Barang ready stok bro! Kaos oversize ready size S, M, L, XL. Untuk sepatu ready size 39-44. Lo biasa pake size berapa nih biar gue rekomendasikan?"
  },
  {
    keywords: ["resi", "lacak", "posisi", "paket", "kirim", "sampai"],
    reply: "Bisa banget! Sebutin aja nomor pesanan atau no resi lo (misal: KH-8821), ntar langsung gue cekin status posisinya di sistem JNE/SiCepat secepatnya ya!"
  },
  {
    keywords: ["bayar", "cod", "qris", "gopay", "transfer", "bca", "mandiri"],
    reply: "Pembayaran super simpel bro! Boleh bayar pas barang nyampe (COD), transfer bank BCA/Mandiri, atau scan QRIS / GoPay / ShopeePay. Mau bayar via apa?"
  },
  {
    keywords: ["retur", "garansi", "rusak", "cacat", "salah"],
    reply: "Tenang bro, garansi 100% ganti baru gratis kalau ada cacat pabrik atau salah kirim! Sertain video unboxing pas lo terima ya, ntar gue yang urus!"
  },
  {
    keywords: ["curhat", "pusing", "capek", "sedih", "solusi", "strategi", "bisnis"],
    reply: "Santai aja bro, obrolin aja ke gue! Mau curhat masalah kerjaan, atau diskusi strategi bisnis & marketing, gue siap nemenin dan ngasih masukan tajam!"
  },
  {
    keywords: ["dimana", "lokasi", "toko", "alamat"],
    reply: "Pusat gudang kita ada di Jakarta & Bandung bro! Pengiriman cepat kilat pake JNE, SiCepat & Instant GoSend/Grab."
  }
];

function generateTopicResponse(userMsg) {
  const lower = userMsg.toLowerCase().trim();
  for (const item of topicMatrix) {
    for (const kw of item.keywords) {
      if (lower.includes(kw)) {
        return item.reply;
      }
    }
  }

  if (lower.includes("lagi dimana") || lower.includes("lg dmn")) {
    return "Lagi nongkrong santai di basecamp nih bro sambil ngopi ☕ Lo sendiri lagi dimana nih? Ada yang seru ga hari ini?";
  }
  if (lower.includes("lagi apa") || lower.includes("lg apa")) {
    return "Lagi ngontrol sistem toko sambil dengerin musik santai nih wkwk 🎶 Lo lagi ngapain nih bro?";
  }
  if (lower.includes("halo") || lower.includes("hi") || lower.includes("p") || lower.includes("siang") || lower.includes("malam")) {
    return `Halo bro! Gue ${AGENT_NAME}. Ada yang mau lo tanyain soal barang, pengiriman, atau mau ngobrol santai aja hari ini? Bilang aja! ✌️`;
  }

  return `Wkwk santai bro! Obrolin aja ke gue mau bahas soal produk, lacak resi, atau konsultasi bisnis. Gue siap bantu sejelas-jelasnya! 😎`;
}

async function pollTelegramUpdates() {
  console.log('✈️ Telegram Bot ONLINE & Listening on @Agent_Ai_Layanan_bot!');

  while (true) {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastOffset + 1}&timeout=15`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.ok && data.result) {
        for (const update of data.result) {
          lastOffset = update.update_id;
          if (update.message && update.message.text) {
            // Ignore group messages (supergroup / group)
            if (update.message.chat.type === 'group' || update.message.chat.type === 'supergroup') {
              continue;
            }

            const chatId = update.message.chat.id;
            const userMsg = update.message.text;

            console.log(`\n[Telegram Personal] Chat ID ${chatId}: ${userMsg}`);
            let replyText = generateTopicResponse(userMsg);

            if (GEMINI_API_KEY && GEMINI_API_KEY.startsWith('AIzaSy')) {
              try {
                const gRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: [{
                      parts: [{ text: `Kamu adalah ${AGENT_NAME}. Balaslah SESUAI TOPIK (Harga, Stok, Size, Resi, Bayar, Retur, Bisnis). Bahasa santai ramah lo-gue, maks 3 kalimat.\nPesan: ${userMsg}` }]
                    }]
                  })
                });
                const gData = await gRes.json();
                if (gData.candidates?.[0]?.content?.parts?.[0]?.text) {
                  replyText = gData.candidates[0].content.parts[0].text;
                }
              } catch(e) {}
            }

            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: replyText
              })
            });
            console.log(`[Telegram Terkirim ke ${chatId}]: ${replyText}`);
          }
        }
      }
    } catch (err) {
      await new Promise(r => setTimeout(r, 4000));
    }
  }
}

pollTelegramUpdates();
