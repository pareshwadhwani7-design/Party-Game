import { createFileRoute } from '@tanstack/react-router'
import { createNewSession, generatePlayerId, saveSession } from '../../../lib/game'
import type { Tone } from '../../../lib/dhamaalPrompts'

export const Route = createFileRoute('/api/game/create')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json() as { hostName: string; gameMode?: string; tone?: Tone }
          const hostName = (body.hostName || '').trim()
          if (!hostName) {
            return Response.json({ error: 'Host name is required' }, { status: 400 })
          }

          const playerId = generatePlayerId()
          const session = createNewSession(playerId, hostName)
          if (body.gameMode) {
            session.gameMode = body.gameMode as typeof session.gameMode
          }
          if (body.tone) {
            session.tone = body.tone
          }

          await saveSession(session)

          return Response.json({ sessionId: session.id, playerId })
        } catch (err) {
          console.error('[create]', err)
          return Response.json({ error: 'Failed to create session' }, { status: 500 })
        }
      },
    },
  },
})
