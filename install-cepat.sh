#!/bin/bash
echo "🚀 Auto Setup Customer AI Agent Gratisan..."
echo "=========================================="

echo "📦 Installing npm dependencies..."
npm install

if [ ! -f .env ]; then
  echo "📝 Creating .env file..."
  echo "Masukan Gemini API Key gratis (dapatkan dari https://aistudio.google.com/apikey):"
  read -p "Gemini API Key: " GEMINI_KEY
  echo "GEMINI_API_KEY=$GEMINI_KEY" > .env
  echo "AGENT_NAME=Bang Jago" >> .env
  echo "BISNIS_LO=Jualan Sepatu Keren" >> .env
fi

echo "✅ Environment configured!"
echo "🏃 Untuk menjalankan server preview PWA: npm start"
echo "📱 Untuk menjalankan bot WhatsApp: npm run bot:wa"
echo "✈️ Untuk menjalankan bot Telegram: npm run bot:telegram"
echo "☁️ Untuk deploy Cloudflare Workers: npm run deploy:worker"
