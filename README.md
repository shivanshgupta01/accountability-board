# 🤝 Accountability Board

> **Stay consistent. Hold each other accountable. Win together.**

A real-time accountability web app where you and your partners check in daily, track streaks, set goals, and stay motivated with an AI coach — all synced live across all devices.

![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat-square&logo=react)
![Powered by Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=flat-square&logo=supabase)
![AI by Groq](https://img.shields.io/badge/AI-Groq%20LLaMA-F55036?style=flat-square)
![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)
![No Login Required](https://img.shields.io/badge/No%20Login-Required-green?style=flat-square)

---

## ✨ Features

- 🧘 **3 Board Modes** — Solo, Duo (2 people), Group (up to 5 people)
- 🔗 **Real Invite System** — Share a link or 6-digit Board ID with your partner
- ✅ **Daily Check-ins** — Tap your ring to check in, glows green when done
- 🔥 **Streak Tracking** — Live streak counter per member, breaks if you miss a day
- 📅 **7-Day Grid** — Visual consistency grid per member
- 🏆 **Leaderboard** — Members ranked by current streak
- 🗺️ **28-Day Heatmap** — GitHub-style contribution heatmap per member
- 🎯 **Goal Setting** — Add goals, assign to individuals or everyone, mark complete
- 🤖 **AI Coach** — Groq LLaMA analyzes streaks and gives personalized motivation, shoutouts, challenges and quotes
- 📥 **CSV Export** — Download full check-in history and goals
- ⚡ **Real-time Sync** — Supabase Realtime keeps all devices in sync instantly
- 💾 **No Login Required** — Board saved locally, data stored in Supabase

---

## 🌐 Live Demo

🔗 **[accountability-board-shivansh.vercel.app](https://accountability-board-gamma.vercel.app)**

---

## 🚀 How It Works

```
Creator opens app
       ↓
Selects mode: Solo / Duo / Group
       ↓
Enters their name + picks avatar
       ↓
Board created in Supabase with unique ID
       ↓
Invite link generated instantly
       ↓
Partner opens link → enters name → joins
       ↓
Everyone checks in daily
       ↓
Streaks, goals & check-ins sync live 🔥
```

---

## 🤖 AI Coach Features

The AI Coach button uses **Groq LLaMA 3.1** to analyze your board and returns:

- 💡 **Personalized headline** — Short punchy motivation
- 📝 **Custom message** — Mentions each member by name
- ⭐ **Shoutout** — Highlights the member with the best streak
- 🎯 **Today's Challenge** — One specific action for the group
- 💬 **Powerful Quote** — Relevant motivational quote with author

---

## 🎨 Design

- **Style:** Glassmorphism — frosted glass cards on cosmic purple/indigo gradient
- **Fonts:** Outfit (display) + Nunito (body)
- **Animations:** Smooth slide-ups, glowing orbs, pulsing live dot
- **Mobile First:** Fully responsive on all screen sizes

---

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| React 18 | Frontend framework |
| Vite | Build tool |
| Supabase | Real-time database + backend |
| Groq LLaMA 3.1 | AI motivation coach (free) |
| Vercel | Deployment |
| localStorage | Remember board and member ID |
| CSS-in-JS | Styling with inline styles |
| Google Fonts | Outfit + Nunito |

---

## 📁 Project Structure

```
accountability-board/
├── src/
│   ├── App.jsx          ← Main app (all components)
│   ├── supabase.js      ← Supabase client config
│   └── main.jsx         ← React entry point
├── index.html
├── .env                 ← API keys (not committed)
├── .gitignore
├── vite.config.js
└── package.json
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- npm v9+
- Supabase account (free)
- Groq account (free)

### Installation

```bash
# Clone the repository
git clone https://github.com/shivanshgupta01/accountability-board.git

# Navigate into the project
cd accountability-board

# Install dependencies
npm install
```

### Supabase Setup

1. Go to **supabase.com** and create a new project
2. Open **SQL Editor** and run this query:

```sql
create table boards (
  id text primary key,
  board_name text not null,
  mode text not null,
  members jsonb default '[]',
  checkins jsonb default '{}',
  goals jsonb default '[]',
  created_at text
);

ALTER TABLE boards DISABLE ROW LEVEL SECURITY;
GRANT ALL ON boards TO anon;
GRANT ALL ON boards TO authenticated;
```

3. Go to **Settings → API** and copy your Project URL and anon key

### Environment Setup

Create a `.env` file in the root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GROQ_KEY=your_groq_api_key
```

Get your free Groq key at **console.groq.com**

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) ✅

---

## 🚀 Deployment on Vercel

### Step 1 — Push to GitHub
```bash
git add .
git commit -m "initial commit"
git push origin main
```

### Step 2 — Deploy on Vercel
1. Go to **vercel.com** and import your repository
2. Add these environment variables:
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_GROQ_KEY
```
3. Click **Deploy** ✅

### Step 3 — Future Updates
Every time you make changes just run:
```bash
git add .
git commit -m "your update message"
git push origin main
```
Vercel auto-deploys in 30 seconds ✅

---

## 🔐 Security Notes

- All API keys stored in `.env` — never committed to GitHub
- `.env` is listed in `.gitignore`
- Supabase RLS disabled for simplicity — suitable for personal and demo use
- For production apps, enable RLS with proper authentication policies

---

## 🗺️ Roadmap

- [ ] Push notifications for daily reminders
- [ ] Weekly summary email report
- [ ] Custom themes per board
- [ ] Reaction emojis on check-ins
- [ ] Board admin controls
- [ ] PWA support — installable on phone

---

## 🏗️ Part of 30 Days Mini Projects

This app is **Day 04** of my **30 Days Mini Projects** challenge — building one web app every day.

| Day | Project | Status |
|---|---|---|
| 01 | Daily Habit Tracker | ✅ Live |
| 02 | Skill Progress Tracker | ✅ Live |
| 03 | Focus Timer | 🔨 Building |
| 04 | Accountability Board | ✅ Live |

---

## 👨‍💻 Author

**Shivansh Gupta**
- Instagram: [@flowkraftai](https://www.instagram.com/flowkraftai)
- GitHub: [@shivanshgupta01](https://github.com/shivanshgupta01)

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

<p align="center">Built with ❤️ by Shivansh Gupta</p>
<p align="center">⭐ Star this repo if you found it useful!</p>
