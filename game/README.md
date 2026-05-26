# Party Game 🎉

A real-time multiplayer party game web app built with TanStack Start and deployed on Netlify. No login required — just pick a name, share a code, and play.

## Features

- **3 Game Modes**:
  - 🎭 **Truth or Dare** — Classic party game with spicy dares and drink penalties
  - ⚡ **Rapid Fire** — 2 random players battle through quick-fire questions in 60 seconds
  - 🧠 **Quiz Up** — 10-question trivia for the whole group with speed bonuses

- **Real-time Multiplayer** — All players see live updates via polling (no WebSockets needed)
- **Automated Scoring** — Points awarded automatically based on game actions; live leaderboard always visible
- **Host Controls** — Kick players, skip questions, change game mode, end game, reset to lobby
- **Instructions Screen** — Every game starts with a clear rules screen before play begins
- **Dare Drink Penalties** — Each dare includes a random 1–4 sip penalty displayed on screen
- **Session Continuity** — Host can reset and play again with the same group
- **Mobile-First Design** — Fully responsive dark UI optimized for phones

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start (React 19) |
| Routing | TanStack Router v1 (file-based) |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| Storage | Netlify Blobs (strong consistency) |
| Language | TypeScript 5.7 (strict mode) |
| Deployment | Netlify |

## How It Works

Game state is stored in **Netlify Blobs** with strong consistency, ensuring all players always see the same state. The frontend polls the game state API every 2 seconds and automatically transitions between screens (lobby → instructions → game → results).

## Project Structure

```
src/
  lib/
    game.ts          # Game types, Blobs store operations, session helpers
    questions.ts     # Question banks for all 3 game modes
  routes/
    index.tsx        # Home: create or join a game
    lobby.$sessionId.tsx     # Waiting room with player list + mode selection
    game.$sessionId.tsx      # Active game (all 3 modes rendered here)
    results.$sessionId.tsx   # Final leaderboard + play again
    api/game/
      create.ts      # POST /api/game/create
      join.ts        # POST /api/game/join
      state.$sessionId.ts    # GET /api/game/state/:id
      action.ts      # POST /api/game/action (gameplay actions)
      host.ts        # POST /api/game/host (host controls)
```

## Running Locally

```bash
# Install dependencies
npm install

# Start the dev server (requires Netlify CLI for Blobs emulation)
netlify dev
```

The app runs at `http://localhost:8888`.

> **Note**: Netlify Blobs requires a deployed site or the Netlify CLI dev server for local emulation. Running `netlify dev` handles this automatically.

## Deploying

Push to a Git repo connected to Netlify. The `netlify.toml` handles build configuration:

- Build command: `vite build`
- Publish directory: `dist/client`

No environment variables required — Netlify Blobs is provisioned automatically.
