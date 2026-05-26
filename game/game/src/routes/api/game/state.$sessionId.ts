import { createFileRoute } from '@tanstack/react-router'
import { getSession } from '../../../lib/game'

export const Route = createFileRoute('/api/game/state/$sessionId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const session = await getSession(params.sessionId)
          if (!session) {
            return Response.json({ error: 'Session not found' }, { status: 404 })
          }
          return Response.json(session)
        } catch (err) {
          console.error('[state]', err)
          return Response.json({ error: 'Failed to get session' }, { status: 500 })
        }
      },
    },
  },
})
