import { createFileRoute } from '@tanstack/react-router'
import {
  getSession,
  saveSession,
  GameSession,
  getTotalQuestionsForMode,
} from '../../../lib/game'
import {
  advanceDhamaalMode,
  advanceQuizQuestion,
  advanceRapidFireQuestion,
  advanceTruthOrDare,
  beginPlaying,
  completeRapidFire,
  pickNextWyrDare,
  prepareModePools,
  revealQuizQuestion,
  scoreActItOut,
  scoreFakeIt,
  scoreMLT,
  scoreQuizQuestion,
} from '../../../lib/gameEngine'

type ActionBody = {
  sessionId: string
  playerId: string
  action: string
  data?: Record<string, unknown>
}

export const Route = createFileRoute('/api/game/action')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json() as ActionBody
          const { sessionId, playerId, action, data } = body

          const session = await getSession(sessionId)
          if (!session) return Response.json({ error: 'Session not found' }, { status: 404 })

          const player = session.players.find(p => p.id === playerId)
          if (!player) return Response.json({ error: 'Player not in session' }, { status: 403 })

          // --- START GAME (host only) ---
          if (action === 'start-game') {
            if (playerId !== session.hostId) return Response.json({ error: 'Not host' }, { status: 403 })
            if (session.state !== 'lobby') return Response.json({ error: 'Already started' }, { status: 400 })

            const mode = (data?.gameMode as GameSession['gameMode']) || session.gameMode || 'truth-or-dare'
            session.gameMode = mode
            session.state = 'instructions'
            session.questionIndex = 0
            session.currentPlayerIndex = 0
            session.totalQuestions = getTotalQuestionsForMode(mode, session.players.length)
            prepareModePools(session, mode)

            await saveSession(session)
            return Response.json(session)
          }

          // --- ACK INSTRUCTIONS (host advances to playing) ---
          if (action === 'ack-instructions') {
            if (playerId !== session.hostId) return Response.json(session)
            if (session.state !== 'instructions') return Response.json(session)

            beginPlaying(session)

            await saveSession(session)
            return Response.json(session)
          }

          // --- TRUTH OR DARE: RESOLVE ---
          if (action === 'td-resolve') {
            if (session.state !== 'playing' || session.gameMode !== 'truth-or-dare') {
              return Response.json({ error: 'Invalid state' }, { status: 400 })
            }
            const q = session.currentTDQuestion
            if (!q) return Response.json({ error: 'No active question' }, { status: 400 })
            if (q.targetPlayerId !== playerId) return Response.json({ error: 'Not your turn' }, { status: 403 })

            const resolution = data?.resolution as 'done' | 'skip'
            q.resolution = resolution
            q.resolvedBy = playerId

            if (resolution === 'done') {
              const pts = q.type === 'dare' ? 10 : 5
              const p = session.players.find(x => x.id === playerId)
              if (p) p.score += pts
            }

            advanceTruthOrDare(session)

            await saveSession(session)
            return Response.json(session)
          }

          // --- RAPID FIRE: ANSWER ---
          if (action === 'rf-answer') {
            if (session.state !== 'playing' || session.gameMode !== 'rapid-fire' || !session.rapidFire) {
              return Response.json({ error: 'Invalid state' }, { status: 400 })
            }
            const rf = session.rapidFire
            if (rf.ended) return Response.json(session)

            const now = Date.now()
            if (now - rf.startedAt >= rf.durationMs) {
              rf.ended = true
            } else {
              const isP1 = playerId === rf.player1Id
              const isP2 = playerId === rf.player2Id
              if (!isP1 && !isP2) return Response.json({ error: 'Not a rapid fire player' }, { status: 403 })

              if (isP1) rf.score1++
              if (isP2) rf.score2++

              advanceRapidFireQuestion(session)
            }

            await saveSession(session)
            return Response.json(session)
          }

          // --- RAPID FIRE: END ---
          if (action === 'rf-end') {
            if (session.state !== 'playing' || session.gameMode !== 'rapid-fire' || !session.rapidFire) {
              return Response.json({ error: 'Invalid state' }, { status: 400 })
            }
            completeRapidFire(session)
            await saveSession(session)
            return Response.json(session)
          }

          // --- QUIZ: ANSWER ---
          if (action === 'quiz-answer') {
            if (session.state !== 'playing' || session.gameMode !== 'quiz-up' || !session.currentQuizQuestion) {
              return Response.json({ error: 'Invalid state' }, { status: 400 })
            }
            const q = session.currentQuizQuestion
            if (q.revealed) return Response.json(session)
            if (q.answers[playerId] !== undefined) return Response.json(session)

            const answerIdx = data?.answerIndex as number
            q.answers[playerId] = answerIdx

            if (answerIdx === q.correctIndex && !q.firstCorrectPlayerId) {
              q.firstCorrectPlayerId = playerId
            }

            const allAnswered = session.players.every(p => q.answers[p.id] !== undefined)
            if (allAnswered) {
              q.revealed = true
              scoreQuizQuestion(session)
            }

            await saveSession(session)
            return Response.json(session)
          }

          // --- QUIZ: REVEAL ---
          if (action === 'quiz-reveal') {
            if (session.state !== 'playing' || session.gameMode !== 'quiz-up' || !session.currentQuizQuestion) {
              return Response.json({ error: 'Invalid state' }, { status: 400 })
            }
            const q = session.currentQuizQuestion
            if (q.revealed) return Response.json(session)

            revealQuizQuestion(session)

            await saveSession(session)
            return Response.json(session)
          }

          // --- QUIZ: NEXT QUESTION ---
          if (action === 'quiz-next') {
            if (playerId !== session.hostId) return Response.json({ error: 'Not host' }, { status: 403 })
            if (session.state !== 'playing' || session.gameMode !== 'quiz-up') {
              return Response.json({ error: 'Invalid state' }, { status: 400 })
            }

            advanceQuizQuestion(session)

            await saveSession(session)
            return Response.json(session)
          }

          // =============================================
          // DHAMAAL MODES
          // =============================================

          // --- MOST LIKELY TO: VOTE ---
          if (action === 'mlt-vote') {
            if (session.state !== 'playing' || session.gameMode !== 'most-likely-to' || !session.currentMLT) {
              return Response.json({ error: 'Invalid state' }, { status: 400 })
            }
            const mlt = session.currentMLT
            if (mlt.revealed) return Response.json(session)

            const targetId = data?.targetPlayerId as string
            if (!targetId || !session.players.find(p => p.id === targetId)) {
              return Response.json({ error: 'Invalid target' }, { status: 400 })
            }
            mlt.votes[playerId] = targetId

            const allVoted = session.players.every(p => mlt.votes[p.id])
            if (allVoted) {
              mlt.revealed = true
              scoreMLT(session)
            }

            await saveSession(session)
            return Response.json(session)
          }

          // --- MOST LIKELY TO: REVEAL (host) ---
          if (action === 'mlt-reveal') {
            if (session.state !== 'playing' || session.gameMode !== 'most-likely-to' || !session.currentMLT) {
              return Response.json({ error: 'Invalid state' }, { status: 400 })
            }
            const mlt = session.currentMLT
            if (mlt.revealed) return Response.json(session)

            mlt.revealed = true
            scoreMLT(session)

            await saveSession(session)
            return Response.json(session)
          }

          // --- MOST LIKELY TO: NEXT ---
          if (action === 'mlt-next') {
            if (playerId !== session.hostId) return Response.json({ error: 'Not host' }, { status: 403 })
            if (session.state !== 'playing' || session.gameMode !== 'most-likely-to') {
              return Response.json({ error: 'Invalid state' }, { status: 400 })
            }
            advanceDhamaalMode(session)
            await saveSession(session)
            return Response.json(session)
          }

          // --- WOULD YOU RATHER: VOTE ---
          if (action === 'wyr-vote') {
            if (session.state !== 'playing' || session.gameMode !== 'would-you-rather' || !session.currentWYR) {
              return Response.json({ error: 'Invalid state' }, { status: 400 })
            }
            const wyr = session.currentWYR
            if (wyr.revealed) return Response.json(session)

            const choice = data?.choice as 'a' | 'b'
            if (choice !== 'a' && choice !== 'b') {
              return Response.json({ error: 'Invalid choice' }, { status: 400 })
            }
            wyr.votes[playerId] = choice

            const allVoted = session.players.every(p => wyr.votes[p.id])
            if (allVoted) {
              wyr.revealed = true
            }

            await saveSession(session)
            return Response.json(session)
          }

          // --- WOULD YOU RATHER: REVEAL (host) ---
          if (action === 'wyr-reveal') {
            if (session.state !== 'playing' || session.gameMode !== 'would-you-rather' || !session.currentWYR) {
              return Response.json({ error: 'Invalid state' }, { status: 400 })
            }
            session.currentWYR.revealed = true
            await saveSession(session)
            return Response.json(session)
          }

          // --- WOULD YOU RATHER: DARE ---
          if (action === 'wyr-dare') {
            if (session.state !== 'playing' || session.gameMode !== 'would-you-rather' || !session.currentWYR) {
              return Response.json({ error: 'Invalid state' }, { status: 400 })
            }
            session.currentWYR.dare = pickNextWyrDare(session)
            await saveSession(session)
            return Response.json(session)
          }

          // --- WOULD YOU RATHER: NEXT ---
          if (action === 'wyr-next') {
            if (playerId !== session.hostId) return Response.json({ error: 'Not host' }, { status: 403 })
            if (session.state !== 'playing' || session.gameMode !== 'would-you-rather') {
              return Response.json({ error: 'Invalid state' }, { status: 400 })
            }
            advanceDhamaalMode(session)
            await saveSession(session)
            return Response.json(session)
          }

          // --- FAKE IT: ADVANCE PHASE ---
          if (action === 'fi-advance') {
            if (session.state !== 'playing' || session.gameMode !== 'fake-it' || !session.currentFakeIt) {
              return Response.json({ error: 'Invalid state' }, { status: 400 })
            }
            const fi = session.currentFakeIt
            if (fi.phase === 'presenting') {
              fi.phase = 'voting'
            }
            await saveSession(session)
            return Response.json(session)
          }

          // --- FAKE IT: VOTE ---
          if (action === 'fi-vote') {
            if (session.state !== 'playing' || session.gameMode !== 'fake-it' || !session.currentFakeIt) {
              return Response.json({ error: 'Invalid state' }, { status: 400 })
            }
            const fi = session.currentFakeIt
            if (fi.phase !== 'voting') return Response.json(session)
            if (playerId === fi.fakerId) return Response.json({ error: 'Faker cannot vote' }, { status: 400 })

            const vote = data?.vote as 'convinced' | 'busted'
            if (vote !== 'convinced' && vote !== 'busted') {
              return Response.json({ error: 'Invalid vote' }, { status: 400 })
            }
            fi.votes[playerId] = vote

            const nonFakers = session.players.filter(p => p.id !== fi.fakerId)
            const allVoted = nonFakers.every(p => fi.votes[p.id])
            if (allVoted) {
              fi.phase = 'revealed'
              scoreFakeIt(session)
            }

            await saveSession(session)
            return Response.json(session)
          }

          // --- FAKE IT: REVEAL (host force) ---
          if (action === 'fi-reveal') {
            if (session.state !== 'playing' || session.gameMode !== 'fake-it' || !session.currentFakeIt) {
              return Response.json({ error: 'Invalid state' }, { status: 400 })
            }
            const fi = session.currentFakeIt
            if (fi.phase === 'revealed') return Response.json(session)
            fi.phase = 'revealed'
            scoreFakeIt(session)
            await saveSession(session)
            return Response.json(session)
          }

          // --- FAKE IT: NEXT ---
          if (action === 'fi-next') {
            if (playerId !== session.hostId) return Response.json({ error: 'Not host' }, { status: 403 })
            if (session.state !== 'playing' || session.gameMode !== 'fake-it') {
              return Response.json({ error: 'Invalid state' }, { status: 400 })
            }
            advanceDhamaalMode(session)
            await saveSession(session)
            return Response.json(session)
          }

          // --- ACT IT OUT: ADVANCE TO VOTING ---
          if (action === 'aio-end-acting') {
            if (session.state !== 'playing' || session.gameMode !== 'act-it-out' || !session.currentActItOut) {
              return Response.json({ error: 'Invalid state' }, { status: 400 })
            }
            session.currentActItOut.phase = 'voting'
            await saveSession(session)
            return Response.json(session)
          }

          // --- ACT IT OUT: VOTE ---
          if (action === 'aio-vote') {
            if (session.state !== 'playing' || session.gameMode !== 'act-it-out' || !session.currentActItOut) {
              return Response.json({ error: 'Invalid state' }, { status: 400 })
            }
            const aio = session.currentActItOut
            if (aio.phase !== 'voting') return Response.json(session)
            if (playerId === aio.actorId) return Response.json({ error: 'Actor cannot vote' }, { status: 400 })

            const guessed = data?.guessed as boolean
            aio.votes[playerId] = guessed

            const nonActors = session.players.filter(p => p.id !== aio.actorId)
            const allVoted = nonActors.every(p => aio.votes[p.id] !== undefined)
            if (allVoted) {
              aio.phase = 'done'
              scoreActItOut(session)
            }

            await saveSession(session)
            return Response.json(session)
          }

          // --- ACT IT OUT: REVEAL (host force) ---
          if (action === 'aio-reveal') {
            if (session.state !== 'playing' || session.gameMode !== 'act-it-out' || !session.currentActItOut) {
              return Response.json({ error: 'Invalid state' }, { status: 400 })
            }
            const aio = session.currentActItOut
            if (aio.phase === 'done') return Response.json(session)
            aio.phase = 'done'
            scoreActItOut(session)
            await saveSession(session)
            return Response.json(session)
          }

          // --- ACT IT OUT: NEXT ---
          if (action === 'aio-next') {
            if (playerId !== session.hostId) return Response.json({ error: 'Not host' }, { status: 403 })
            if (session.state !== 'playing' || session.gameMode !== 'act-it-out') {
              return Response.json({ error: 'Invalid state' }, { status: 400 })
            }
            advanceDhamaalMode(session)
            await saveSession(session)
            return Response.json(session)
          }

          return Response.json({ error: 'Unknown action' }, { status: 400 })
        } catch (err) {
          console.error('[action]', err)
          return Response.json({ error: 'Action failed' }, { status: 500 })
        }
      },
    },
  },
})
