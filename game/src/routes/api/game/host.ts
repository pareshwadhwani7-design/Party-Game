import { createFileRoute } from '@tanstack/react-router'
import { getSession, getTotalQuestionsForMode, saveSession } from '../../../lib/game'
import {
  advanceDhamaalMode,
  advanceQuizQuestion,
  advanceRapidFireQuestion,
  advanceTruthOrDare,
  finishGameNow,
  prepareModePools,
  resetRoundProgress,
  resetScores,
} from '../../../lib/gameEngine'
import type { Tone } from '../../../lib/dhamaalPrompts'
import {
  assignRandomMafiaRoles,
  createDefaultMafiaState,
  getVisibleMafiaPlayerIds,
  normalizeManualMafiaAssignments,
  normalizeRoleCounts,
  sanitizeMafiaStateForPlayer,
  type MafiaAssignmentMode,
} from '../../../lib/mafia'

type HostBody = {
  sessionId: string
  playerId: string
  action: string
  data?: Record<string, unknown>
}

function sessionViewForPlayer(session: NonNullable<Awaited<ReturnType<typeof getSession>>>, playerId: string) {
  if (session.gameMode === 'mafia' && session.mafia) {
    const visiblePlayerIds = getVisibleMafiaPlayerIds(session.mafia, session.players, playerId)
    const hidePlayerIds = session.mafia.phase === 'assigned'
    return {
      ...session,
      hostId: playerId === session.hostId ? session.hostId : 'hidden-host',
      players: hidePlayerIds
        ? session.players.map((player, index) => ({
          ...player,
          id: visiblePlayerIds.has(player.id) ? player.id : `hidden-player-${index}`,
        }))
        : session.players,
      mafia: sanitizeMafiaStateForPlayer(session.mafia, session.players, playerId),
    }
  }
  return session
}

export const Route = createFileRoute('/api/game/host')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json() as HostBody
          const { sessionId, playerId, action, data } = body

          const session = await getSession(sessionId)
          if (!session) return Response.json({ error: 'Session not found' }, { status: 404 })

          if (session.hostId !== playerId) {
            return Response.json({ error: 'Only the host can do this' }, { status: 403 })
          }

          // --- KICK PLAYER ---
          if (action === 'kick') {
            if (session.state !== 'lobby') {
              return Response.json({ error: 'Players can only be kicked from the lobby' }, { status: 400 })
            }
            const targetId = data?.targetPlayerId as string
            if (!targetId || targetId === playerId) {
              return Response.json({ error: 'Invalid target' }, { status: 400 })
            }
            session.players = session.players.filter(p => p.id !== targetId)
            await saveSession(session)
            return Response.json(session)
          }

          // --- SKIP ROUND/QUESTION ---
          if (action === 'skip-question') {
            if (session.state !== 'playing') return Response.json({ error: 'Not playing' }, { status: 400 })

            if (session.gameMode === 'truth-or-dare') {
              advanceTruthOrDare(session)
            } else if (session.gameMode === 'quiz-up' && session.currentQuizQuestion) {
              advanceQuizQuestion(session)
            } else if (session.gameMode === 'rapid-fire' && session.rapidFire) {
              advanceRapidFireQuestion(session)
            } else if (session.gameMode === 'most-likely-to' || session.gameMode === 'would-you-rather' || session.gameMode === 'fake-it' || session.gameMode === 'act-it-out') {
              advanceDhamaalMode(session)
            }

            await saveSession(session)
            return Response.json(session)
          }

          // --- END GAME ---
          if (action === 'end-game') {
            finishGameNow(session)
            await saveSession(session)
            return Response.json(session)
          }

          // --- CHANGE MODE (lobby only) ---
          if (action === 'change-mode') {
            if (session.state !== 'lobby') return Response.json({ error: 'Can only change mode in lobby' }, { status: 400 })
            session.gameMode = data?.gameMode as typeof session.gameMode
            await saveSession(session)
            return Response.json(session)
          }

          // --- CHANGE TONE (lobby only) ---
          if (action === 'change-tone') {
            if (session.state !== 'lobby') return Response.json({ error: 'Can only change tone in lobby' }, { status: 400 })
            session.tone = (data?.tone as Tone) || 'chill'
            await saveSession(session)
            return Response.json(session)
          }

          // --- RESET TO LOBBY ---
          if (action === 'reset') {
            session.state = 'lobby'
            resetRoundProgress(session)
            resetScores(session)
            await saveSession(session)
            return Response.json(session)
          }

          // --- MAFIA: UPDATE CONFIG ---
          if (action === 'mafia-update-config') {
            if (session.gameMode !== 'mafia') return Response.json({ error: 'Not a Mafia game' }, { status: 400 })
            const mafia = session.mafia || createDefaultMafiaState()
            mafia.phase = 'setup'
            mafia.roleCounts = normalizeRoleCounts((data?.roleCounts as Record<string, number>) || mafia.roleCounts)
            mafia.assignmentMode = ((data?.assignmentMode as MafiaAssignmentMode) || mafia.assignmentMode) === 'god' ? 'god' : 'random'
            mafia.assignments = {}
            session.mafia = mafia
            session.state = 'instructions'
            await saveSession(session)
            return Response.json(sessionViewForPlayer(session, playerId))
          }

          // --- MAFIA: RANDOM ASSIGNMENT ---
          if (action === 'mafia-random-assign') {
            if (session.gameMode !== 'mafia') return Response.json({ error: 'Not a Mafia game' }, { status: 400 })
            const mafia = session.mafia || createDefaultMafiaState()
            mafia.assignmentMode = 'random'
            mafia.roleCounts = normalizeRoleCounts((data?.roleCounts as Record<string, number>) || mafia.roleCounts)
            mafia.assignments = assignRandomMafiaRoles(session.players, mafia.roleCounts)
            mafia.phase = 'assigned'
            mafia.assignedAt = Date.now()
            session.mafia = mafia
            session.state = 'playing'
            await saveSession(session)
            return Response.json(sessionViewForPlayer(session, playerId))
          }

          // --- MAFIA: GOD MODE ASSIGNMENT ---
          if (action === 'mafia-god-assign') {
            if (session.gameMode !== 'mafia') return Response.json({ error: 'Not a Mafia game' }, { status: 400 })
            const mafia = session.mafia || createDefaultMafiaState()
            mafia.assignmentMode = 'god'
            mafia.roleCounts = normalizeRoleCounts((data?.roleCounts as Record<string, number>) || mafia.roleCounts)
            mafia.assignments = normalizeManualMafiaAssignments(
              session.players,
              (data?.assignments as Record<string, string>) || {},
            )
            mafia.phase = 'assigned'
            mafia.assignedAt = Date.now()
            session.mafia = mafia
            session.state = 'playing'
            await saveSession(session)
            return Response.json(sessionViewForPlayer(session, playerId))
          }

          // --- MAFIA: RESTART ASSIGNMENT ---
          if (action === 'mafia-restart-assignment') {
            if (session.gameMode !== 'mafia' || !session.mafia) return Response.json({ error: 'Not a Mafia game' }, { status: 400 })
            if (session.mafia.assignmentMode === 'random') {
              session.mafia.assignments = assignRandomMafiaRoles(session.players, session.mafia.roleCounts)
              session.mafia.phase = 'assigned'
              session.mafia.assignedAt = Date.now()
              session.state = 'playing'
            } else {
              session.mafia.phase = 'setup'
              session.mafia.assignments = {}
              session.state = 'instructions'
            }
            await saveSession(session)
            return Response.json(sessionViewForPlayer(session, playerId))
          }

          // --- MAFIA: RECONFIGURE ROLES ---
          if (action === 'mafia-reconfigure') {
            if (session.gameMode !== 'mafia') return Response.json({ error: 'Not a Mafia game' }, { status: 400 })
            const mafia = session.mafia || createDefaultMafiaState()
            mafia.phase = 'setup'
            mafia.assignments = {}
            session.mafia = mafia
            session.state = 'instructions'
            await saveSession(session)
            return Response.json(sessionViewForPlayer(session, playerId))
          }

          // --- PLAY SAME GAME AGAIN ---
          if (action === 'play-same-game') {
            const mode = session.gameMode
            if (!mode) return Response.json({ error: 'No game mode selected' }, { status: 400 })
            resetScores(session)
            session.totalQuestions = getTotalQuestionsForMode(mode, session.players.length)
            prepareModePools(session, mode)
            session.state = 'instructions'
            await saveSession(session)
            return Response.json(session)
          }

          return Response.json({ error: 'Unknown host action' }, { status: 400 })
        } catch (err) {
          console.error('[host]', err)
          return Response.json({ error: 'Host action failed' }, { status: 500 })
        }
      },
    },
  },
})
