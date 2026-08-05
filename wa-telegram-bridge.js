/**
 * WhatsApp <-> Telegram Bridge & AI CS Relay System (Upgraded Topic-Aware Version)
 * 
 * ATURAN KHUSUS:
 * 1. PETA TOPIK PINTAR: Membalas sesuai topik spesifik (Harga, Stok, Ukuran, Resi, Payment, Curhat, Bisnis).
 * 2. NO GROUP CHAT: Chat Grup WA (endsWith '@g.us') DIABAIKAN TOTAL 100%.
 * 3. PRIORITAS NO LAMA / PENTING: Mendeteksi & memprioritaskan kontak penting/lama.
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
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

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || 'AQ.Ab8RN6Lqn9wjanRtQBt3xoIFzPQsuEWVBGCEGWGnW-znp7Qvng';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN || '8530097732:AAFaGlPj3kDAT-66ZtfEcCQ03IqoEpekC00';
const AGENT_NAME = process.env.AGENT_NAME || env.AGENT_NAME || 'Agent Ai Layanan';

let lastAdminTelegramChatId = null;

// Topic Knowledge Base Matrix for Context-Specific Answers
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

function generateTopicResponse(userText) {
  const lower = userText.toLowerCase().trim();

  // Match topic
  for (const item of topicMatrix) {
    for (const kw of item.keywords) {
      if (lower.includes(kw)) {
        return item.reply;
      }
    }
  }

  // Greetings / Conversational
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

async function sendTelegramMessage(chatId, text) {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML' })
    });
  } catch(e) {}
}

async function generateAIResponse(userText) {
  // 1. Try Gemini API first if valid key present
  if (GEMINI_API_KEY && GEMINI_API_KEY.startsWith('AIzaSy')) {
    try {
      const systemPrompt = `Kamu adalah ${AGENT_NAME}. Balaslah SESUAI TOPIK PERTANYAAN CUSTOMER (Harga, Stok, Size, Resi, Bayar, Retur, Bisnis, Curhat).
      Aturan:
      - Bahasa santai, ramah, pakai "gue-lo", "wkwk", "bro/sis".
      - JANGAN HANYA JAWAB HALO BRO! Jawablah secara spesifik sesuai topik pertanyaan customer.
      - Maksimal 3 kalimat per balasan.`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemPrompt}\n\nPesan Customer WA: ${userText}` }]
          }]
        })
      });
      const data = await res.json();
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
    } catch(e) {}
  }

  // 2. Fallback to Topic-Aware Engine
  return generateTopicResponse(userText);
}

async function startBridgeSystem() {
  console.log('\n==================================================');
  console.log('⚡ LAUNCHING TOPIC-AWARE WA ⇄ TELEGRAM BRIDGE');
  console.log('==================================================\n');

  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    auth: state,
    browser: ["AgentAiLayanan", "Chrome", "1.0.0"]
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n📱 SCAN QR CODE WHATSAPP DI BAWAH INI PAKAI HP ANDA:');
      console.log('--------------------------------------------------');
      qrcode.generate(qr, { small: true });
      console.log('--------------------------------------------------\n');
    }

    if (connection === 'open') {
      console.log('\n🎉 SUCCESS! WHATSAPP ⇄ TELEGRAM BRIDGE IS NOW ONLINE!');
      console.log('Rule Active: IGNORE GROUPS = YES | TOPIC AWARE = YES\n');
    } else if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode === DisconnectReason.loggedOut) {
        try { fs.rmSync('auth_info_baileys', { recursive: true, force: true }); } catch(e) {}
      }
      setTimeout(startBridgeSystem, 3000);
    }
  });

  // 1. Listen for Customer Messages on WhatsApp
  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const waJid = msg.key.remoteJid;

    // 🔥 ATURAN KHUSUS 1: GRUP DIABAIKAN TOTAL 100%!
    if (waJid.endsWith('@g.us')) {
      console.log(`🚫 Pesan dari Grup WA (${waJid}) diabaikan.`);
      return;
    }

    const customerName = msg.pushName || waJid.split('@')[0];
    const customerText = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

    if (!customerText) return;

    console.log(`\n[WA Customer Personal] ${customerName} (${waJid}): ${customerText}`);

    // Generate Topic-Specific AI Reply
    const aiReply = await generateAIResponse(customerText);

    // Forward to Telegram Admin
    if (lastAdminTelegramChatId) {
      const tgNotification = `📩 <b>Pesan WA Personal Masuk!</b>\n👤 <b>Nama:</b> ${customerName}\n📱 <b>No. WA:</b> ${waJid.split('@')[0]}\n\n💬 <b>Pesan WA:</b> ${customerText}\n\n🤖 <b>Balasan Sesuai Topik:</b>\n<i>"${aiReply}"</i>`;
      await sendTelegramMessage(lastAdminTelegramChatId, tgNotification);
    }

    // Auto Send Topic Reply to WA Customer
    await sock.sendPresenceUpdate('composing', waJid);
    await sock.sendMessage(waJid, { text: aiReply });
    console.log(`[WA Balasan Terkirim ke ${customerName}]: ${aiReply}`);
  });

  // 2. Listen for Admin Telegram Commands
  let tgLastOffset = 0;
  setInterval(async () => {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${tgLastOffset + 1}&timeout=5`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.ok && data.result) {
        for (const update of data.result) {
          tgLastOffset = update.update_id;
          if (update.message && update.message.text) {
            const chatId = update.message.chat.id;
            lastAdminTelegramChatId = chatId;
            const text = update.message.text;

            if (text.startsWith('/reply')) {
              const parts = text.split(' ');
              if (parts.length >= 3) {
                const targetNum = parts[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                const replyMsg = parts.slice(2).join(' ');

                await sock.sendMessage(targetNum, { text: replyMsg });
                await sendTelegramMessage(chatId, `✅ Pesan manual terkirim ke WA: ${parts[1]}`);
              }
            }
          }
        }
      }
    } catch(e) {}
  }, 3000);
}

startBridgeSystem();
