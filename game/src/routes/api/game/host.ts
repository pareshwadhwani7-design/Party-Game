import { createFileRoute } from '@tanstack/react-router'
import { getSession, saveSession } from '../../../lib/game'
import type { Tone } from '../../../lib/dhamaalPrompts'

type HostBody = {
  sessionId: string
  playerId: string
  action: string
  data?: Record<string, unknown>
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
              session.questionIndex++
              if (session.questionIndex >= session.totalQuestions) {
                session.state = 'results'
                session.currentTDQuestion = null
              } else {
                session.currentPlayerIndex = (session.currentPlayerIndex + 1) % session.players.length
                const { TRUTHS, DARES } = await import('../../../lib/questions')
                const target = session.players[session.currentPlayerIndex]
                const poolItem = session.tdPool?.[session.questionIndex]
                if (poolItem?.type === 'dare') {
                  const dare = DARES[poolItem.index]
                  session.currentTDQuestion = {
                    type: 'dare',
                    text: dare.text,
                    drinkPenalty: dare.drinkPenalty,
                    targetPlayerId: target.id,
                    targetPlayerName: target.name,
                  }
                } else if (poolItem) {
                  const truth = TRUTHS[poolItem.index]
                  session.currentTDQuestion = {
                    type: 'truth',
                    text: truth,
                    drinkPenalty: 0,
                    targetPlayerId: target.id,
                    targetPlayerName: target.name,
                  }
                }
              }
            } else if (session.gameMode === 'quiz-up' && session.currentQuizQuestion) {
              const { QUIZ_QUESTIONS } = await import('../../../lib/questions')
              session.currentQuizQuestion.revealed = true
              session.questionIndex++
              if (session.questionIndex >= session.totalQuestions) {
                session.state = 'results'
                session.currentQuizQuestion = null
              } else {
                const idx = session.quizQueueIndexes[session.questionIndex]
                const q = QUIZ_QUESTIONS[idx]
                session.currentQuizQuestion = {
                  text: q.text,
                  options: q.options,
                  correctIndex: q.correctIndex,
                  answers: {},
                  revealed: false,
                  openedAt: Date.now(),
                }
              }
            } else if (session.gameMode === 'most-likely-to' || session.gameMode === 'would-you-rather' || session.gameMode === 'fake-it' || session.gameMode === 'act-it-out') {
              session.questionIndex++
              if (session.questionIndex >= session.totalQuestions) {
                session.state = 'results'
                session.currentMLT = null
                session.currentWYR = null
                session.currentFakeIt = null
                session.currentActItOut = null
              } else {
                session.currentPlayerIndex = (session.currentPlayerIndex + 1) % session.players.length
                const { MLT_PROMPTS, WYR_PROMPTS, FAKE_IT_PROMPTS, ACT_IT_OUT_PROMPTS, pickRandomPrompt } = await import('../../../lib/dhamaalPrompts')
                const tone = session.tone || 'chill'

                if (session.gameMode === 'most-likely-to') {
                  const prompt = pickRandomPrompt(MLT_PROMPTS[tone])
                  session.currentMLT = { text: prompt.text, votes: {}, revealed: false }
                } else if (session.gameMode === 'would-you-rather') {
                  const prompt = pickRandomPrompt(WYR_PROMPTS[tone])
                  session.currentWYR = { optA: prompt.optA, optB: prompt.optB, votes: {}, revealed: false, dare: null }
                } else if (session.gameMode === 'fake-it') {
                  const prompt = pickRandomPrompt(FAKE_IT_PROMPTS[tone])
                  const faker = session.players[session.currentPlayerIndex]
                  session.currentFakeIt = { text: prompt.text, fakerId: faker.id, fakerName: faker.name, phase: 'presenting', votes: {} }
                } else if (session.gameMode === 'act-it-out') {
                  const prompt = pickRandomPrompt(ACT_IT_OUT_PROMPTS[tone])
                  const actor = session.players[session.currentPlayerIndex]
                  session.currentActItOut = { text: prompt.text, actorId: actor.id, actorName: actor.name, startedAt: Date.now(), durationMs: 60000, phase: 'acting', votes: {} }
                }
              }
            }

            await saveSession(session)
            return Response.json(session)
          }

          // --- END GAME ---
          if (action === 'end-game') {
            session.state = 'results'
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
            session.questionIndex = 0
            session.currentPlayerIndex = 0
            session.currentTDQuestion = null
            session.rapidFire = null
            session.currentQuizQuestion = null
            session.quizQueueIndexes = []
            session.currentMLT = null
            session.currentWYR = null
            session.currentFakeIt = null
            session.currentActItOut = null
            session.players.forEach(p => { p.score = 0 })
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
