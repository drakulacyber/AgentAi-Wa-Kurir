/**
 * WhatsApp Bot Integration using Baileys Library (100% Free)
 * Designed for Render.com Cloud 24/7 Deployment
 */
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6Lqn9wjanRtQBt3xoIFzPQsuEWVBGCEGWGnW-znp7Qvng';
const AGENT_NAME = process.env.AGENT_NAME || 'Agent Ai Layanan';

async function startWhatsAppBot() {
  console.log('⚡ Starting Agent Ai Layanan WhatsApp Bot on Cloud...');
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
      console.log('📱 SCAN QR CODE DI BAWAH INI PAKAI WHATSAPP HP:');
      console.log('==================================================\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
      console.log('Koneksi WA terputus. Mencoba menghubungkan ulang...', shouldReconnect);
      if (shouldReconnect) startWhatsAppBot();
    } else if (connection === 'open') {
      console.log('🎉 SUCCESS! WhatsApp Bot Agent Ai Layanan ONLINE & SIAP MEMBALAS CHAT 24/7!');
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

    console.log(`[WA Chat Masuk] ${from}: ${text}`);

    if (text) {
      await sock.sendPresenceUpdate('composing', from);

      let replyText = "Halo bro/sis! Bentar ya gue cekin dulu data lo di sistem!";

      if (GEMINI_API_KEY) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: `Kamu adalah ${AGENT_NAME}, CS santuy, ramah, pakai lo-gue, balasan maks 3 kalimat.\nPesan Customer: ${text}` }]
              }]
            })
          });
          const data = await res.json();
          replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || replyText;
        } catch(e) {
          console.error('Error calling Gemini API:', e);
        }
      }

      await sock.sendMessage(from, { text: replyText });
    }
  });
}

startWhatsAppBot();
