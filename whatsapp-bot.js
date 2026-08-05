/**
 * WhatsApp Bot Integration using Baileys Library (100% Free)
 * Run via: node whatsapp-bot.js
 */
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

async function startWhatsAppBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut);
      console.log('Koneksi terputus. Reconnecting...', shouldReconnect);
      if (shouldReconnect) startWhatsAppBot();
    } else if (connection === 'open') {
      console.log('⚡ WhatsApp Bot Bang Jago ONLINE & Siap Bales Chat!');
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

    console.log(`[WA Pesan Masuk] ${from}: ${text}`);

    if (text) {
      // Simulate typing indicator
      await sock.sendPresenceUpdate('composing', from);

      let replyText = "Halo bro/sis! Bentar ya gue cekin dulu data lo di sistem!";

      if (GEMINI_API_KEY) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: `Kamu adalah Bang Jago CS, gaya santuy pakai lo-gue, balasan maks 3 kalimat.\nPesan: ${text}` }]
              }]
            })
          });
          const data = await res.json();
          replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || replyText;
        } catch(e) {
          console.error('Error calling Gemini API:', e);
        }
      }

      // Send reply
      await sock.sendMessage(from, { text: replyText });
    }
  });
}

startWhatsAppBot();
