import { createFileRoute } from '@tanstack/react-router'
import { generatePlayerId, getSession, saveSession } from '../../../lib/game'

export const Route = createFileRoute('/api/game/join')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json() as { sessionId: string; playerName: string }
          const sessionId = (body.sessionId || '').trim().toUpperCase()
          const playerName = (body.playerName || '').trim()

          if (!sessionId || !playerName) {
            return Response.json({ error: 'Session ID and player name are required' }, { status: 400 })
          }

          const session = await getSession(sessionId)
          if (!session) {
            return Response.json({ error: 'Game not found. Check the code and try again.' }, { status: 404 })
          }

          if (session.state !== 'lobby') {
            return Response.json({ error: 'This game has already started.' }, { status: 400 })
          }

          if (session.players.length >= 10) {
            return Response.json({ error: 'Game is full (max 10 players).' }, { status: 400 })
          }

          const playerId = generatePlayerId()
          session.players.push({
            id: playerId,
            name: playerName,
            score: 0,
            isHost: false,
            joinedAt: Date.now(),
          })

          await saveSession(session)

          return Response.json({ sessionId, playerId })
        } catch (err) {
          console.error('[join]', err)
          return Response.json({ error: 'Failed to join session' }, { status: 500 })
        }
      },
    },
  },
})
