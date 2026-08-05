# 🚀 Human-Like AI Customer Service Agent PWA 👾👑

Aplikasi PWA (Progressive Web App) AI Customer Service Agent dengan gaya bahasa manusia santuy, ramah, dan anti-detection. Dapat di-install langsung ke perangkat HP atau Desktop dari GitHub Pages, berjalan offline, dan dilengkapi fitur pengelola persona cerdas.

![UI Preview](./assets/icons/preview.png)

## ✨ Fitur Utama

- 🎨 **UI Dark Mode Premium Futuristic**: Palet warna neon purple & dark navy (`#0a0a0f`, `#7c3aed`), glassmorphism, dan animasi mikro.
- 📱 **PWA & Offline Ready**: File `manifest.json` dan `sw.js` Service Worker siap pakai untuk install di Home Screen HP.
- 💬 **Human Typing Simulator**: Mengatur jeda waktu ngetik secara dinamis sesuai panjang kalimat + waktu mikir (Short: 2-4s, Med: 5-8s, Long: 9-15s) + tombol fast skip.
- 🧠 **Context Memory Viewer**: Menyimpan riwayat topik customer, nomor HP, masalah pending, dan emosi secara real-time.
- ⚡ **Emotion Detector**: Membaca mood customer (*Marah 😡, Kecewa 😢, Senang 😊, Bingung 🤔, Netral 😐*) dan menyesuaikan nada emosional balasan.
- 🔥 **Smart Suggestion Generator**: Memberikan 3 rekomendasi balasan otomatis (Solusi Utama, Alternatif, Eskalasi) beserta AI Confidence Score.
- 🎛️ **Manual CS Override Switch**: Mode pengambilalihan obrolan oleh CS manusia sewaktu-waktu.
- ⚙️ **Persona Switcher Modal**: Pilih gaya bahasa (Santuy, Kasual, Gaul, Lo-Gue, Formil) & aktifkan typo natural (`yg`, `bgt`, `ttp`).

---

## 📦 Struktur File GitHub

```
customer-ai-agent/
├── index.html              # Main PWA Single Page Application
├── manifest.json           # PWA Manifest
├── sw.js                   # Service Worker Cache & Offline handler
├── config.js               # Personalization config
├── data/
│   └── knowledge-base.json # Custom FAQ & Business Knowledge Base
├── assets/
│   ├── css/
│   │   ├── style.css       # Dark Mode futuristic design system
│   │   └── responsive.css  # Mobile optimizations
│   └── js/
│       ├── db.js           # LocalStorage & memory persistence
│       ├── typing-simulator.js # Typing delay logic
│       ├── ai-agent.js     # AI NLP & persona engine
│       ├── ui-controller.js# DOM manipulations & Audio synthesis
│       ├── pwa-installer.js# PWA install prompt handler
│       └── app.js          # App lifecycle connector
└── .github/
    └── workflows/
        └── deploy.yml      # GitHub Actions auto-deploy to Pages
```

---

## 🚀 Cara Deploy ke GitHub Pages

1. Buat repository baru di GitHub dengan nama: `customer-ai-agent`.
2. Upload atau push semua file project ini ke repository tersebut.
3. Buka **Settings** -> **Pages** di repository GitHub Anda.
4. Pilih Source: **GitHub Actions** atau **Deploy from a branch** (Main branch / root).
5. Aktifkan HTTPS.
6. Akses aplikasi Anda via URL: `https://[username].github.io/customer-ai-agent/`.
7. Buka URL di browser HP (Chrome / Safari) lalu klik **"Add to Home Screen"** atau klik tombol **"Install PWA"** di header!
