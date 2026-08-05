/**
 * WhatsApp <-> Telegram Bridge & AI CS Relay System
 * 
 * ALUR KERJA:
 * 1. Customer kirim chat di WhatsApp.
 * 2. Sistem teruskan chat & data customer ke Telegram Admin (@Agent_Ai_Layanan_bot).
 * 3. Gemini AI memproses balasan otomatis + 3 saran balasan (Smart Suggestions).
 * 4. Balasan AI (atau pesan balasan dari Admin di Telegram) langsung dikirim kembali ke WhatsApp Customer!
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

// Read .env
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

// Mapping for Active WA Chats (Customer JID <-> Telegram Chat ID)
const waCustomerMap = new Map();
let lastAdminTelegramChatId = null;

async function sendTelegramMessage(chatId, text) {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML' })
    });
  } catch(e) {
    console.error('Telegram Send Error:', e.message);
  }
}

async function generateAIResponse(userText) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Kamu adalah ${AGENT_NAME}, CS ramah, santuy, gaya lo-gue, balasan maks 3 kalimat.\nPesan Customer WA: ${userText}` }]
        }]
      })
    });
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Bentar ya bro, gue cekin dulu data lo!";
  } catch(e) {
    console.error('Gemini API Error:', e.message);
    return "Bentar ya bro, gue cekin stok dulu!";
  }
}

async function startBridgeSystem() {
  console.log('⚡ Launching WhatsApp <-> Telegram AI Relay Bridge...');
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log('\n==================================================');
      console.log('📱 SCAN QR CODE WA DI BAWAH UNTUK VERIFIKASI:');
      console.log('==================================================\n');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'open') {
      console.log('🎉 SUCCESS! WA <-> Telegram Bridge Engine ONLINE!');
    }
  });

  // 1. Listen for Customer Messages on WhatsApp
  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const waJid = msg.key.remoteJid;
    const customerName = msg.pushName || waJid.split('@')[0];
    const customerText = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

    if (!customerText) return;

    console.log(`\n[WA Customer] ${customerName} (${waJid}): ${customerText}`);

    // Generate AI Reply
    const aiReply = await generateAIResponse(customerText);

    // Forward Customer WA Message to Telegram Admin
    if (lastAdminTelegramChatId) {
      const tgNotification = `📩 <b>Pesan Masuk WA Customer!</b>\n👤 <b>Nama:</b> ${customerName}\n📱 <b>No. WA:</b> ${waJid.split('@')[0]}\n\n💬 <b>Pesan WA:</b> ${customerText}\n\n🤖 <b>Rekomendasi Balasan AI:</b>\n<i>"${aiReply}"</i>`;
      await sendTelegramMessage(lastAdminTelegramChatId, tgNotification);
    }

    // Auto Send Reply to WhatsApp Customer
    await sock.sendPresenceUpdate('composing', waJid);
    await sock.sendMessage(waJid, { text: aiReply });
    console.log(`[WA Balasan Terkirim ke ${customerName}]: ${aiReply}`);
  });

  // 2. Listen for Admin Telegram Commands / Manual Overrides
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

            console.log(`[Telegram Admin ${chatId}]: ${text}`);

            if (text.startsWith('/reply')) {
              // Format: /reply [WA_NUMBER] [MESSAGE]
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
