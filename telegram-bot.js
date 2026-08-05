/**
 * Telegram Bot Integration using Telegram Bot API (100% Free)
 * Run via: TELEGRAM_BOT_TOKEN="xxx" GEMINI_API_KEY="xxx" node telegram-bot.js
 */
require('dotenv').config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

if (!TELEGRAM_BOT_TOKEN) {
  console.log('⚠️ Harap isi TELEGRAM_BOT_TOKEN di .env dari @BotFather');
}

let lastOffset = 0;

async function pollTelegramUpdates() {
  console.log('⚡ Telegram Bot Bang Jago active polling...');

  while (true) {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastOffset + 1}&timeout=30`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.ok && data.result) {
        for (const update of data.result) {
          lastOffset = update.update_id;
          if (update.message && update.message.text) {
            const chatId = update.message.chat.id;
            const userMsg = update.message.text;

            console.log(`[Telegram] Chat ID ${chatId}: ${userMsg}`);
            let replyText = "Siap bro! Bentar ya gue cekin data lo dulu!";

            if (GEMINI_API_KEY) {
              try {
                const gRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: [{
                      parts: [{ text: `Kamu adalah Bang Jago, CS Toko Sepatu Keren. Gaya santuy, lo-gue, maks 3 kalimat.\nPesan: ${userMsg}` }]
                    }]
                  })
                });
                const gData = await gRes.json();
                replyText = gData.candidates?.[0]?.content?.parts?.[0]?.text || replyText;
              } catch(e) {
                console.error('Gemini API Error:', e);
              }
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
          }
        }
      }
    } catch (err) {
      console.error('Polling error:', err.message);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

if (TELEGRAM_BOT_TOKEN) {
  pollTelegramUpdates();
}
