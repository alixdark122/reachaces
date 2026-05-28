# ⚡ Ace Race — Kick Giveaway Game

A browser-based Kick chat giveaway and duel game. Viewers type a keyword in chat to join, then the streamer selects two players for an Ace Duel — they draw cards until someone pulls an Ace!

## Features

- 🔌 **Kick OAuth Login** — PKCE-based authentication
- 💬 **Live Chat Integration** — Connects to Kick chat via Pusher WebSocket (browser-side)
- 📢 **Two Giveaway Modes**:
  - **Keyword Mode** — Viewers type `!ace` (or any keyword) to join
  - **Active Chatter Mode** — Automatically tracks active chatters with customizable inactivity timeout
- ⚔️ **Ace Duel** — Two players draw cards until someone hits an Ace
- 🎡 **Wheel Selector** — Animated wheel to pick two random duelists
- ✅ **Ready Check** — Both players must type in chat to confirm they're ready
- 🏆 **Winner Overlay** — Full-screen celebration with confetti & live chat feed
- 🃏 **3D Card Flip Animation** — Smooth flip effect on each card draw
- 🔊 **Sound Effects** — Card shuffle, duel start, card slap, ace win, winner fanfare (all Web Audio, no files needed)
- 📋 **Duel History** — Last 15 matches recorded, persists across refreshes
- 📱 **Responsive** — Works on desktop and mobile
- 🔄 **Auto-Reconnect** — Automatically reconnects to Kick chat if connection drops

## How it looks

```
┌──────────────┬──────────────────────┬──────────────┐
│ 🔌 Kick      │   ⚔️ Ace Duel        │ Participants  │
│   Connection │   [Player1 vs P2]   │  (12)         │
│              │   [Cards flipping]   │ ┌─Name1──✖┐  │
│ ⚙️ Mode      │   [Controls]        │ │ Name2──✖ │  │
│              │   📋 Duel History    │ └─────────┘  │
│ Manual Join  │   🏆 A beat B       │               │
└──────────────┴──────────────────────┴──────────────┘
```

## Local Setup

1. **Clone the repo**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ace-race.git
   cd ace-race
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the project root:
   ```env
   KICK_CLIENT_ID=your_kick_client_id
   KICK_CLIENT_SECRET=your_kick_client_secret
   KICK_REDIRECT_URI=http://localhost:3000/auth/kick/callback
   PORT=3000
   ```

4. **Get Kick API credentials**:
   - Go to [Kick Developers](https://dev.kick.com/)
   - Create a new app
   - Set the redirect URI to `http://localhost:3000/auth/kick/callback`

5. **Run the server**:
   ```bash
   npm start
   ```

6. **Open the app** at [http://localhost:3000](http://localhost:3000)

## Deployment

### Railway

1. Push this repo to GitHub
2. Connect the repo to Railway
3. Set environment variables: `KICK_CLIENT_ID`, `KICK_CLIENT_SECRET`, `KICK_REDIRECT_URI`
4. Update `KICK_REDIRECT_URI` to your Railway URL (e.g., `https://your-app.railway.app/auth/kick/callback`)

### Requirements

- Node.js 18+
- Kick API credentials (free)

## Tech Stack

- **Backend**: Node.js, Express
- **Real-time**: WebSocket (ws), Pusher (browser)
- **Auth**: PKCE OAuth 2.0 with Kick
- **Frontend**: Vanilla JS, CSS3 animations (no frameworks)

## Project Structure

```
ace-race/
├── server.js          # Express server + OAuth endpoints
├── game.html          # Full game UI (single file, all-in-one)
├── package.json       # Dependencies
├── Procfile           # Railway/Heroku deployment
├── .gitignore
├── README.md
└── assets/
    ├── cards/         # Card images (PNG, optional — falls back to text)
    └── package-lock.json
```

## Card Images

The game expects card images at `/assets/cards/{rank}{suit}.png` (e.g., `AH.png`, `10C.png`). If images aren't found, the game gracefully falls back to displaying card text (e.g., `A♥`). You can find free card sprite sheets online or generate your own.

## Notes

- Keep your Kick OAuth client secret private
- Never commit `.env` or any credentials
- The `.env` file is already in `.gitignore`