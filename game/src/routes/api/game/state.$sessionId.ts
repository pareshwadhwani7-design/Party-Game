import { createFileRoute } from '@tanstack/react-router'
import { getSession } from '../../../lib/game'
import { getVisibleMafiaPlayerIds, sanitizeMafiaStateForPlayer } from '../../../lib/mafia'

export const Route = createFileRoute('/api/game/state/$sessionId')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        try {
          const session = await getSession(params.sessionId)
          if (!session) {
            return Response.json({ error: 'Session not found' }, { status: 404 })
          }
          const playerId = new URL(request.url).searchParams.get('playerId')
          if (session.gameMode === 'mafia' && session.mafia) {
            const visiblePlayerIds = getVisibleMafiaPlayerIds(session.mafia, session.players, playerId)
            const hidePlayerIds = session.mafia.phase === 'assigned'
            return Response.json({
              ...session,
              hostId: playerId === session.hostId ? session.hostId : 'hidden-host',
              players: hidePlayerIds
                ? session.players.map((player, index) => ({
                  ...player,
                  id: visiblePlayerIds.has(player.id) ? player.id : `hidden-player-${index}`,
                }))
                : session.players,
              mafia: sanitizeMafiaStateForPlayer(session.mafia, session.players, playerId),
            })
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
