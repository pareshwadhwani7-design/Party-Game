import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, useCallback, useRef } from 'react'
import { GameSession, GAME_MODES } from '../lib/game'

export const Route = createFileRoute('/game/$sessionId')({
  component: GamePage,
})

// ---- Shared helpers ----
function Leaderboard({ players }: { players: GameSession['players'] }) {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  return (
    <div className="bg-slate-700/30 rounded-xl p-3 space-y-1.5">
      {sorted.map((p, i) => (
        <div key={p.id} className="flex items-center gap-2 text-sm">
          <span className="text-slate-500 w-4 font-bold">{i + 1}</span>
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
            {p.name[0].toUpperCase()}
          </div>
          <span className="text-white flex-1 truncate">{p.name}</span>
          <span className="text-yellow-400 font-bold">{p.score}pt</span>
        </div>
      ))}
    </div>
  )
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Round {current + 1} of {total}</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-1.5">
        <div
          className="bg-purple-500 h-1.5 rounded-full transition-all"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </>
  )
}

function useGameAction(sessionId: string, playerId: string, onAction: () => void) {
  const [loading, setLoading] = useState(false)
  const send = useCallback(async (action: string, data?: Record<string, unknown>) => {
    setLoading(true)
    try {
      await fetch('/api/game/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, playerId, action, data }),
      })
      onAction()
    } finally {
      setLoading(false)
    }
  }, [sessionId, playerId, onAction])
  return { send, loading }
}

function HostEndGameButton({
  session,
  playerId,
  sessionId,
  onAction,
}: {
  session: GameSession
  playerId: string
  sessionId: string
  onAction: () => void
}) {
  const [ending, setEnding] = useState(false)
  const isHost = session.hostId === playerId
  if (!isHost) return null

  async function endGame() {
    if (ending) return
    setEnding(true)
    try {
      await fetch('/api/game/host', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, playerId, action: 'end-game' }),
      })
      onAction()
    } finally {
      setEnding(false)
    }
  }

  return (
    <button
      onClick={endGame}
      disabled={ending}
      className="w-full border border-red-500/30 bg-red-950/30 hover:bg-red-950/50 disabled:opacity-50 text-red-200 font-bold py-3 rounded-2xl transition-all active:scale-95"
    >
      {ending ? 'Ending...' : 'End Game'}
    </button>
  )
}

// ---- Instructions Screen ----
function InstructionsScreen({
  session,
  playerId,
  sessionId,
}: {
  session: GameSession
  playerId: string
  sessionId: string
}) {
  const [loading, setLoading] = useState(false)
  const isHost = session.hostId === playerId
  const mode = session.gameMode!
  const info = GAME_MODES[mode]

  const rules: Record<string, { rules: string[]; scoring: string[] }> = {
    'truth-or-dare': {
      rules: [
        'Players take turns being in the hot seat',
        "You'll get a random Truth or Dare",
        'Complete it to earn points — skip if you dare (pun intended) and face the drink penalty',
        'Other players watch and react',
      ],
      scoring: ['Truth completed: +5 points', 'Dare completed: +10 points', 'Skip: 0 points + drink penalty'],
    },
    'rapid-fire': {
      rules: [
        '2 players are randomly selected to face off',
        'A question appears — be first to answer it',
        'Press "Answered!" as fast as you can',
        '120 seconds on the clock — go!',
      ],
      scoring: ['Each answered question: +5 points', 'Winner bonus: +10 points'],
    },
    'quiz-up': {
      rules: [
        'Everyone plays at the same time',
        'A question appears with 4 options',
        'Tap your answer before time runs out (20 seconds)',
        '30 questions total',
      ],
      scoring: ['Correct answer: +10 points', 'First correct: +3 bonus points'],
    },
    'most-likely-to': {
      rules: [
        'A prompt appears on everyone\'s screen',
        'Each player votes for who fits the prompt best',
        'Results reveal when everyone has voted',
        'The person with the most votes gets points!',
      ],
      scoring: ['Points = number of votes received', 'Unanimous vote = bonus bragging rights'],
    },
    'would-you-rather': {
      rules: [
        'A dilemma appears with two options: A or B',
        'Everyone picks their choice privately',
        'Results reveal when everyone has voted',
        'Dare for the minority — losers face the consequences!',
      ],
      scoring: ['No points — just spicy debates and dares', 'The real prize is learning the truth about your friends'],
    },
    'fake-it': {
      rules: [
        'One player becomes the "expert" and sees a secret expertise',
        'They present and the group asks 3 questions',
        'Everyone else votes: Convinced or Busted?',
        'The faker wins if majority believes them!',
      ],
      scoring: ['Convinced majority: +2 points per convinced vote', 'Busted: 0 points, eternal shame'],
    },
    'act-it-out': {
      rules: [
        'One player sees a scene to act out on their screen',
        'They perform it — no words allowed!',
        'Everyone else watches and tries to guess',
        'Vote whether they guessed correctly',
      ],
      scoring: ['Majority guessed: actor gets +10 points', 'Nobody guessed: better luck next time!'],
    },
  }

  const modeRules = rules[mode]

  async function handleStart() {
    if (!isHost) return
    setLoading(true)
    await fetch('/api/game/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, playerId, action: 'ack-instructions' }),
    })
    setLoading(false)
  }

  const toneLabel = session.tone === 'nsfw' ? '🔞 NSFW' : session.tone === 'savage' ? '🔥 Savage' : '😄 Chill'
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <div className="text-5xl mb-2">{info.icon}</div>
          <h1 className="text-3xl font-black text-white">{info.label}</h1>
          <p className="text-purple-300 text-sm mt-1">How to play</p>
          <div className="mt-2 inline-flex items-center gap-1 bg-slate-800/60 rounded-full px-3 py-1 text-xs text-slate-300">
            Tone: {toneLabel}
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Rules</h3>
            <ul className="space-y-2">
              {modeRules.rules.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-300">
                  <span className="text-purple-400 shrink-0">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-slate-700 pt-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Scoring</h3>
            <ul className="space-y-1.5">
              {modeRules.scoring.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-yellow-400 shrink-0">⭐</span>
                  <span className="text-slate-300">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {isHost ? (
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-purple-500/20 active:scale-95 text-lg"
          >
            {loading ? 'Starting...' : "🎮 Let's Play!"}
          </button>
        ) : (
          <div className="text-center text-slate-400 text-sm py-3 animate-pulse">
            Waiting for host to start...
          </div>
        )}
      </div>
    </div>
  )
}

// ---- Truth or Dare Screen ----
function TruthOrDareScreen({
  session,
  playerId,
  sessionId,
  onAction,
}: {
  session: GameSession
  playerId: string
  sessionId: string
  onAction: () => void
}) {
  const [loading, setLoading] = useState(false)
  const q = session.currentTDQuestion
  if (!q) return null

  const isMyTurn = q.targetPlayerId === playerId
  const progress = session.questionIndex
  const total = session.totalQuestions

  async function resolve(resolution: 'done' | 'skip') {
    setLoading(true)
    await fetch('/api/game/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, playerId, action: 'td-resolve', data: { resolution } }),
    })
    setLoading(false)
    onAction()
  }

  async function skipAsHost() {
    setLoading(true)
    await fetch('/api/game/host', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, playerId, action: 'skip-question' }),
    })
    setLoading(false)
    onAction()
  }

  const isHost = session.hostId === playerId

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <ProgressBar current={progress} total={total} />

        <div className="text-center">
          {isMyTurn ? (
            <p className="text-purple-300 font-semibold text-lg">🎯 It's your turn!</p>
          ) : (
            <p className="text-slate-400 text-sm">
              👀 <span className="text-white font-semibold">{q.targetPlayerName}</span>'s turn
            </p>
          )}
        </div>

        <div className={`rounded-3xl p-6 border-2 text-center ${
          q.type === 'dare'
            ? 'bg-gradient-to-br from-orange-900/40 to-red-900/40 border-orange-500/40'
            : 'bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-500/40'
        }`}>
          <div className="text-4xl mb-3">{q.type === 'dare' ? '🔥' : '💬'}</div>
          <div className={`text-xs font-bold uppercase tracking-widest mb-3 ${
            q.type === 'dare' ? 'text-orange-400' : 'text-blue-400'
          }`}>
            {q.type === 'dare' ? 'Dare' : 'Truth'}
          </div>
          <p className="text-white text-lg font-semibold leading-relaxed">{q.text}</p>
          {q.type === 'dare' && q.drinkPenalty > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-slate-800/60 rounded-full px-4 py-1.5">
              <span className="text-lg">🍺</span>
              <span className="text-sm text-slate-300">
                Skip penalty: <span className="text-yellow-400 font-bold">{q.drinkPenalty} sip{q.drinkPenalty > 1 ? 's' : ''}</span>
              </span>
            </div>
          )}
        </div>

        {isMyTurn ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => resolve('done')}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all active:scale-95"
            >
              ✅ Done!
              <div className="text-xs font-normal opacity-75 mt-0.5">
                +{q.type === 'dare' ? 10 : 5} pts
              </div>
            </button>
            <button
              onClick={() => resolve('skip')}
              disabled={loading}
              className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all active:scale-95"
            >
              🚫 Skip
              {q.type === 'dare' && q.drinkPenalty > 0 && (
                <div className="text-xs font-normal text-orange-400 mt-0.5">
                  {q.drinkPenalty} sip{q.drinkPenalty > 1 ? 's' : ''}
                </div>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-center text-slate-400 text-sm animate-pulse py-2">
              Waiting for {q.targetPlayerName} to decide...
            </div>
            {isHost && (
              <button
                onClick={skipAsHost}
                disabled={loading}
                className="w-full text-xs text-slate-500 hover:text-slate-400 border border-slate-700 rounded-xl py-2 transition-colors"
              >
                Host: Skip this question
              </button>
            )}
          </div>
        )}

        <HostEndGameButton session={session} playerId={playerId} sessionId={sessionId} onAction={onAction} />
        <Leaderboard players={session.players} />
      </div>
    </div>
  )
}

// ---- Rapid Fire Screen ----
function RapidFireScreen({
  session,
  playerId,
  sessionId,
  onAction,
}: {
  session: GameSession
  playerId: string
  sessionId: string
  onAction: () => void
}) {
  const rf = session.rapidFire
  const [timeLeft, setTimeLeft] = useState(120)
  const [ended, setEnded] = useState(false)
  const endedRef = useRef(false)

  useEffect(() => {
    if (!rf) return
    const tick = () => {
      const elapsed = Date.now() - rf.startedAt
      const remaining = Math.max(0, Math.ceil((rf.durationMs - elapsed) / 1000))
      setTimeLeft(remaining)
      if (remaining === 0 && !endedRef.current) {
        endedRef.current = true
        setEnded(true)
        fetch('/api/game/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, playerId, action: 'rf-end' }),
        }).then(onAction)
      }
    }
    tick()
    const interval = setInterval(tick, 500)
    return () => clearInterval(interval)
  }, [rf, sessionId, playerId, onAction])

  if (!rf) return null

  const isPlayer = playerId === rf.player1Id || playerId === rf.player2Id
  const timerColor = timeLeft <= 10 ? 'text-red-400' : timeLeft <= 20 ? 'text-yellow-400' : 'text-green-400'

  async function answer() {
    if (ended || rf?.ended) return
    await fetch('/api/game/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, playerId, action: 'rf-answer' }),
    })
    onAction()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-black text-white">⚡ Rapid Fire</h1>
          <p className="text-slate-400 text-sm mt-1">
            <span className="text-white font-semibold">{rf.player1Name}</span> vs{' '}
            <span className="text-white font-semibold">{rf.player2Name}</span>
          </p>
        </div>

        <div className="text-center">
          <div className={`text-6xl font-black ${timerColor} transition-colors`}>{timeLeft}</div>
          <div className="text-slate-500 text-xs uppercase tracking-widest">seconds left</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-2xl p-4 text-center border-2 ${playerId === rf.player1Id ? 'border-purple-500 bg-purple-500/10' : 'border-slate-700 bg-slate-800/40'}`}>
            <div className="text-2xl font-black text-white">{rf.score1}</div>
            <div className="text-sm text-slate-300 truncate">{rf.player1Name}</div>
          </div>
          <div className={`rounded-2xl p-4 text-center border-2 ${playerId === rf.player2Id ? 'border-pink-500 bg-pink-500/10' : 'border-slate-700 bg-slate-800/40'}`}>
            <div className="text-2xl font-black text-white">{rf.score2}</div>
            <div className="text-sm text-slate-300 truncate">{rf.player2Name}</div>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-5 text-center">
          <p className="text-white text-lg font-semibold leading-relaxed">{rf.currentQuestion}</p>
        </div>

        {isPlayer && !ended && !rf.ended && (
          <button
            onClick={answer}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-black py-5 rounded-2xl transition-all shadow-lg active:scale-95 text-xl"
          >
            ⚡ Answered!
          </button>
        )}

        {!isPlayer && (
          <div className="text-center text-slate-400 text-sm animate-pulse py-2">
            👀 Watching the showdown...
          </div>
        )}

        <HostEndGameButton session={session} playerId={playerId} sessionId={sessionId} onAction={onAction} />
        <Leaderboard players={session.players} />
      </div>
    </div>
  )
}

// ---- Quiz Screen ----
function QuizScreen({
  session,
  playerId,
  sessionId,
  onAction,
}: {
  session: GameSession
  playerId: string
  sessionId: string
  onAction: () => void
}) {
  const q = session.currentQuizQuestion
  const [timeLeft, setTimeLeft] = useState(20)
  const autoRevealedRef = useRef(false)
  const isHost = session.hostId === playerId

  useEffect(() => {
    if (!q || q.revealed) return
    autoRevealedRef.current = false

    const tick = () => {
      const elapsed = Date.now() - q.openedAt
      const remaining = Math.max(0, Math.ceil((20000 - elapsed) / 1000))
      setTimeLeft(remaining)
      if (remaining === 0 && !autoRevealedRef.current) {
        autoRevealedRef.current = true
        fetch('/api/game/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, playerId, action: 'quiz-reveal' }),
        }).then(onAction)
      }
    }
    tick()
    const interval = setInterval(tick, 500)
    return () => clearInterval(interval)
  }, [q?.openedAt, q?.revealed, sessionId, playerId, onAction])

  if (!q) return null

  const myAnswer = q.answers[playerId]
  const hasAnswered = myAnswer !== undefined
  const optionLabels = ['A', 'B', 'C', 'D']
  const progress = session.questionIndex
  const total = session.totalQuestions

  async function submitAnswer(idx: number) {
    if (hasAnswered || q?.revealed) return
    await fetch('/api/game/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, playerId, action: 'quiz-answer', data: { answerIndex: idx } }),
    })
    onAction()
  }

  async function nextQuestion() {
    await fetch('/api/game/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, playerId, action: 'quiz-next' }),
    })
    onAction()
  }

  const timerColor = timeLeft <= 5 ? 'text-red-400' : timeLeft <= 10 ? 'text-yellow-400' : 'text-green-400'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Q {progress + 1} of {total}</span>
          {!q.revealed && (
            <span className={`font-bold text-sm ${timerColor}`}>{timeLeft}s</span>
          )}
        </div>
        <div className="w-full bg-slate-700 rounded-full h-1.5">
          <div
            className="bg-purple-500 h-1.5 rounded-full transition-all"
            style={{ width: `${(progress / total) * 100}%` }}
          />
        </div>

        <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-5 text-center">
          <div className="text-xs text-slate-400 uppercase tracking-widest mb-2">🧠 Quiz Up</div>
          <p className="text-white text-lg font-semibold leading-relaxed">{q.text}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {q.options.map((opt, idx) => {
            let style = 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500'
            if (hasAnswered && myAnswer === idx && !q.revealed) {
              style = 'border-purple-500 bg-purple-500/20 text-white'
            }
            if (q.revealed) {
              if (idx === q.correctIndex) {
                style = 'border-green-500 bg-green-500/20 text-green-300'
              } else if (myAnswer === idx) {
                style = 'border-red-500 bg-red-500/20 text-red-300'
              } else {
                style = 'border-slate-700 bg-slate-800/30 text-slate-500'
              }
            }

            return (
              <button
                key={idx}
                onClick={() => submitAnswer(idx)}
                disabled={hasAnswered || q.revealed}
                className={`flex items-center gap-2 p-3.5 rounded-xl border-2 transition-all text-left ${style} disabled:cursor-default`}
              >
                <span className="font-bold text-sm w-5 shrink-0">{optionLabels[idx]}</span>
                <span className="text-sm leading-snug">{opt}</span>
                {q.revealed && idx === q.correctIndex && <span className="ml-auto">✅</span>}
                {q.revealed && myAnswer === idx && idx !== q.correctIndex && <span className="ml-auto">❌</span>}
              </button>
            )
          })}
        </div>

        {!q.revealed && (
          <div className="text-center text-sm text-slate-400">
            {hasAnswered ? (
              <span className="text-purple-400">✓ Answer locked in! Waiting for others...</span>
            ) : (
              <span className="animate-pulse">Pick your answer!</span>
            )}
            <span className="block text-xs text-slate-600 mt-1">
              {Object.keys(q.answers).length}/{session.players.length} answered
            </span>
          </div>
        )}

        {q.revealed && isHost && (
          <button
            onClick={nextQuestion}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95"
          >
            {progress + 1 >= total ? '🏆 See Results' : '➡️ Next Question'}
          </button>
        )}

        {q.revealed && !isHost && (
          <div className="text-center text-slate-400 text-sm animate-pulse py-2">
            Waiting for host to continue...
          </div>
        )}

        <HostEndGameButton session={session} playerId={playerId} sessionId={sessionId} onAction={onAction} />
        <Leaderboard players={session.players} />
      </div>
    </div>
  )
}

// ---- Most Likely To Screen ----
function MostLikelyToScreen({
  session,
  playerId,
  sessionId,
  onAction,
}: {
  session: GameSession
  playerId: string
  sessionId: string
  onAction: () => void
}) {
  const mlt = session.currentMLT
  const { send, loading } = useGameAction(sessionId, playerId, onAction)
  const isHost = session.hostId === playerId
  if (!mlt) return null

  const hasVoted = !!mlt.votes[playerId]
  const voteCount = Object.keys(mlt.votes).length
  const totalPlayers = session.players.length

  const voteCounts: Record<string, number> = {}
  if (mlt.revealed) {
    Object.values(mlt.votes).forEach(tid => {
      voteCounts[tid] = (voteCounts[tid] || 0) + 1
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <ProgressBar current={session.questionIndex} total={session.totalQuestions} />

        <div className="rounded-3xl p-6 border-2 bg-gradient-to-br from-orange-900/30 to-pink-900/30 border-orange-500/30 text-center">
          <div className="text-4xl mb-3">👆</div>
          <div className="text-xs font-bold uppercase tracking-widest mb-3 text-orange-400">Most Likely To</div>
          <p className="text-white text-lg font-semibold leading-relaxed">{mlt.text}</p>
        </div>

        {!mlt.revealed ? (
          <>
            <div className="text-center text-xs text-slate-500 mb-1">
              {voteCount}/{totalPlayers} voted
            </div>
            <div className="grid grid-cols-2 gap-2">
              {session.players.map(p => (
                <button
                  key={p.id}
                  onClick={() => send('mlt-vote', { targetPlayerId: p.id })}
                  disabled={loading || hasVoted}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    hasVoted && mlt.votes[playerId] === p.id
                      ? 'border-orange-500 bg-orange-500/15 text-white'
                      : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500'
                  } disabled:cursor-default`}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {p.name[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold truncate">{p.name}</span>
                  {hasVoted && mlt.votes[playerId] === p.id && <span className="ml-auto text-orange-400">✓</span>}
                </button>
              ))}
            </div>
            {hasVoted && (
              <div className="text-center text-purple-400 text-sm">
                ✓ Vote locked in! Waiting for others...
              </div>
            )}
            {isHost && voteCount > 0 && (
              <button
                onClick={() => send('mlt-reveal')}
                className="w-full text-xs text-slate-500 hover:text-slate-400 border border-slate-700 rounded-xl py-2 transition-colors"
              >
                Host: Reveal results now
              </button>
            )}
          </>
        ) : (
          <>
            <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Results</h3>
              {session.players
                .map(p => ({ ...p, votes: voteCounts[p.id] || 0 }))
                .sort((a, b) => b.votes - a.votes)
                .map((p, i) => (
                  <div key={p.id} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                    i === 0 && p.votes > 0 ? 'bg-orange-500/15 border border-orange-500/30' : 'bg-slate-700/30'
                  }`}>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                      {p.name[0].toUpperCase()}
                    </div>
                    <span className="text-white font-medium flex-1 text-sm">{p.name}</span>
                    <span className="text-orange-400 font-bold text-sm">
                      {p.votes} vote{p.votes !== 1 ? 's' : ''}
                    </span>
                    {i === 0 && p.votes > 0 && <span>👑</span>}
                  </div>
                ))}
            </div>

            {isHost && (
              <button
                onClick={() => send('mlt-next')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95"
              >
                {session.questionIndex + 1 >= session.totalQuestions ? '🏆 See Results' : '➡️ Next Round'}
              </button>
            )}
            {!isHost && (
              <div className="text-center text-slate-400 text-sm animate-pulse py-2">
                Waiting for host to continue...
              </div>
            )}
          </>
        )}

        <HostEndGameButton session={session} playerId={playerId} sessionId={sessionId} onAction={onAction} />
        <Leaderboard players={session.players} />
      </div>
    </div>
  )
}

// ---- Would You Rather Screen ----
function WouldYouRatherScreen({
  session,
  playerId,
  sessionId,
  onAction,
}: {
  session: GameSession
  playerId: string
  sessionId: string
  onAction: () => void
}) {
  const wyr = session.currentWYR
  const { send, loading } = useGameAction(sessionId, playerId, onAction)
  const isHost = session.hostId === playerId
  if (!wyr) return null

  const myVote = wyr.votes[playerId]
  const hasVoted = !!myVote
  const voteCount = Object.keys(wyr.votes).length
  const totalPlayers = session.players.length

  const countA = Object.values(wyr.votes).filter(v => v === 'a').length
  const countB = Object.values(wyr.votes).filter(v => v === 'b').length
  const total = countA + countB

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <ProgressBar current={session.questionIndex} total={session.totalQuestions} />

        <div className="text-center">
          <div className="text-4xl mb-2">⚖️</div>
          <div className="text-xs font-bold uppercase tracking-widest text-pink-400">Would You Rather</div>
        </div>

        <button
          onClick={() => !hasVoted && send('wyr-vote', { choice: 'a' })}
          disabled={loading || hasVoted}
          className={`w-full p-5 rounded-2xl border-2 text-center text-lg font-bold transition-all ${
            myVote === 'a'
              ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300'
              : 'border-slate-600 bg-slate-800/60 text-white hover:border-cyan-500/50'
          } disabled:cursor-default`}
        >
          {wyr.optA}
          {wyr.revealed && total > 0 && (
            <div className="mt-2 text-sm font-normal text-cyan-400">
              {countA} vote{countA !== 1 ? 's' : ''} ({Math.round((countA / total) * 100)}%)
            </div>
          )}
        </button>

        <div className="text-center text-slate-500 font-black text-sm">VS</div>

        <button
          onClick={() => !hasVoted && send('wyr-vote', { choice: 'b' })}
          disabled={loading || hasVoted}
          className={`w-full p-5 rounded-2xl border-2 text-center text-lg font-bold transition-all ${
            myVote === 'b'
              ? 'border-pink-500 bg-pink-500/15 text-pink-300'
              : 'border-slate-600 bg-slate-800/60 text-white hover:border-pink-500/50'
          } disabled:cursor-default`}
        >
          {wyr.optB}
          {wyr.revealed && total > 0 && (
            <div className="mt-2 text-sm font-normal text-pink-400">
              {countB} vote{countB !== 1 ? 's' : ''} ({Math.round((countB / total) * 100)}%)
            </div>
          )}
        </button>

        {!wyr.revealed && (
          <div className="text-center text-xs text-slate-500">
            {hasVoted ? (
              <span className="text-purple-400">✓ Choice locked! {voteCount}/{totalPlayers} voted</span>
            ) : (
              <span>{voteCount}/{totalPlayers} voted</span>
            )}
          </div>
        )}

        {wyr.revealed && total > 0 && (
          <div>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all rounded-full"
                style={{ width: `${(countA / total) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-bold mt-1">
              <span className="text-cyan-400">A: {countA}</span>
              <span className="text-pink-400">B: {countB}</span>
            </div>
          </div>
        )}

        {wyr.revealed && !wyr.dare && isHost && (
          <button
            onClick={() => send('wyr-dare')}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 rounded-2xl transition-all active:scale-95"
          >
            🎲 Dare for the Minority!
          </button>
        )}

        {wyr.dare && (
          <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border-2 border-orange-500/30 rounded-2xl p-5 text-center">
            <div className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-2">Dare for the Minority</div>
            <p className="text-white text-lg font-semibold">{wyr.dare}</p>
          </div>
        )}

        {!wyr.revealed && isHost && voteCount > 0 && (
          <button
            onClick={() => send('wyr-reveal')}
            className="w-full text-xs text-slate-500 hover:text-slate-400 border border-slate-700 rounded-xl py-2 transition-colors"
          >
            Host: Reveal results now
          </button>
        )}

        {wyr.revealed && isHost && (
          <button
            onClick={() => send('wyr-next')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95"
          >
            {session.questionIndex + 1 >= session.totalQuestions ? '🏆 See Results' : '➡️ Next Round'}
          </button>
        )}
        {wyr.revealed && !isHost && (
          <div className="text-center text-slate-400 text-sm animate-pulse py-2">
            Waiting for host to continue...
          </div>
        )}

        <HostEndGameButton session={session} playerId={playerId} sessionId={sessionId} onAction={onAction} />
        <Leaderboard players={session.players} />
      </div>
    </div>
  )
}

// ---- Fake It Screen ----
function FakeItScreen({
  session,
  playerId,
  sessionId,
  onAction,
}: {
  session: GameSession
  playerId: string
  sessionId: string
  onAction: () => void
}) {
  const fi = session.currentFakeIt
  const { send, loading } = useGameAction(sessionId, playerId, onAction)
  const isHost = session.hostId === playerId
  if (!fi) return null

  const isFaker = playerId === fi.fakerId
  const myVote = fi.votes[playerId]
  const hasVoted = !!myVote
  const nonFakers = session.players.filter(p => p.id !== fi.fakerId)
  const voteCount = Object.keys(fi.votes).length

  const convincedCount = Object.values(fi.votes).filter(v => v === 'convinced').length
  const bustedCount = Object.values(fi.votes).filter(v => v === 'busted').length
  const convinced = convincedCount > nonFakers.length / 2

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <ProgressBar current={session.questionIndex} total={session.totalQuestions} />

        {/* Presenting phase */}
        {fi.phase === 'presenting' && (
          <>
            <div className="rounded-3xl p-6 border-2 bg-gradient-to-br from-purple-900/30 to-violet-900/30 border-purple-500/30 text-center">
              <div className="text-4xl mb-3">🤥</div>
              <div className="text-xs font-bold uppercase tracking-widest mb-2 text-purple-400">
                {isFaker ? 'Your Secret Expertise' : `${fi.fakerName} is the Expert`}
              </div>
              {isFaker ? (
                <>
                  <p className="text-white text-lg font-semibold leading-relaxed">{fi.text}</p>
                  <p className="text-slate-400 text-sm mt-3">Convince them you're the real expert. They'll ask 3 questions!</p>
                </>
              ) : (
                <>
                  <p className="text-white text-lg font-semibold">
                    <span className="text-purple-300">{fi.fakerName}</span> claims to be an expert...
                  </p>
                  <p className="text-slate-400 text-sm mt-3">Ask them 3 questions to test their expertise!</p>
                </>
              )}
            </div>

            {isHost && (
              <button
                onClick={() => send('fi-advance')}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95"
              >
                🗳️ Start Voting
              </button>
            )}
            {!isHost && (
              <div className="text-center text-slate-400 text-sm animate-pulse py-2">
                Host will start voting when Q&A is done...
              </div>
            )}
          </>
        )}

        {/* Voting phase */}
        {fi.phase === 'voting' && (
          <>
            <div className="rounded-3xl p-6 border-2 bg-gradient-to-br from-purple-900/30 to-violet-900/30 border-purple-500/30 text-center">
              <div className="text-4xl mb-3">🗳️</div>
              <div className="text-xs font-bold uppercase tracking-widest mb-2 text-purple-400">Vote Now</div>
              <p className="text-white text-lg font-semibold">
                Do you believe <span className="text-purple-300">{fi.fakerName}</span> is the real expert?
              </p>
            </div>

            {isFaker ? (
              <div className="text-center text-purple-400 text-sm py-3 animate-pulse">
                Others are voting on your performance...
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => send('fi-vote', { vote: 'convinced' })}
                  disabled={loading || hasVoted}
                  className={`py-4 rounded-2xl border-2 font-bold text-lg transition-all ${
                    myVote === 'convinced'
                      ? 'border-green-500 bg-green-500/15 text-green-300'
                      : 'border-slate-600 bg-slate-800/50 text-white hover:border-green-500/50'
                  } disabled:cursor-default`}
                >
                  👏 Convinced
                </button>
                <button
                  onClick={() => send('fi-vote', { vote: 'busted' })}
                  disabled={loading || hasVoted}
                  className={`py-4 rounded-2xl border-2 font-bold text-lg transition-all ${
                    myVote === 'busted'
                      ? 'border-red-500 bg-red-500/15 text-red-300'
                      : 'border-slate-600 bg-slate-800/50 text-white hover:border-red-500/50'
                  } disabled:cursor-default`}
                >
                  💀 Busted
                </button>
              </div>
            )}

            <div className="text-center text-xs text-slate-500">
              {voteCount}/{nonFakers.length} voted
            </div>

            {isHost && voteCount > 0 && (
              <button
                onClick={() => send('fi-reveal')}
                className="w-full text-xs text-slate-500 hover:text-slate-400 border border-slate-700 rounded-xl py-2 transition-colors"
              >
                Host: Reveal results now
              </button>
            )}
          </>
        )}

        {/* Revealed phase */}
        {fi.phase === 'revealed' && (
          <>
            <div className={`rounded-3xl p-6 border-2 text-center ${
              convinced
                ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30'
                : 'bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-500/30'
            }`}>
              <div className="text-5xl mb-3">{convinced ? '👏' : '💀'}</div>
              <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${convinced ? 'text-green-400' : 'text-red-400'}`}>
                {convinced ? 'CONVINCED!' : 'BUSTED!'}
              </div>
              <p className="text-white text-lg font-semibold">
                {convinced
                  ? `${fi.fakerName} fooled ${convincedCount} of you! +${convincedCount * 2} points!`
                  : `Only ${convincedCount} believed. ${fi.fakerName} got busted!`}
              </p>
              <div className="mt-3 text-slate-400 text-sm">
                {convincedCount} convinced · {bustedCount} busted
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-3">
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">The expertise was:</div>
              <p className="text-slate-300 text-sm">{fi.text}</p>
            </div>

            {isHost && (
              <button
                onClick={() => send('fi-next')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95"
              >
                {session.questionIndex + 1 >= session.totalQuestions ? '🏆 See Results' : '➡️ Next Round'}
              </button>
            )}
            {!isHost && (
              <div className="text-center text-slate-400 text-sm animate-pulse py-2">
                Waiting for host to continue...
              </div>
            )}
          </>
        )}

        <HostEndGameButton session={session} playerId={playerId} sessionId={sessionId} onAction={onAction} />
        <Leaderboard players={session.players} />
      </div>
    </div>
  )
}

// ---- Act It Out Screen ----
function ActItOutScreen({
  session,
  playerId,
  sessionId,
  onAction,
}: {
  session: GameSession
  playerId: string
  sessionId: string
  onAction: () => void
}) {
  const aio = session.currentActItOut
  const { send, loading } = useGameAction(sessionId, playerId, onAction)
  const isHost = session.hostId === playerId
  const [timeLeft, setTimeLeft] = useState(60)
  const endedRef = useRef(false)

  useEffect(() => {
    if (!aio || aio.phase !== 'acting') return
    endedRef.current = false
    const tick = () => {
      const elapsed = Date.now() - aio.startedAt
      const remaining = Math.max(0, Math.ceil((aio.durationMs - elapsed) / 1000))
      setTimeLeft(remaining)
      if (remaining === 0 && !endedRef.current) {
        endedRef.current = true
        fetch('/api/game/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, playerId, action: 'aio-end-acting' }),
        }).then(onAction)
      }
    }
    tick()
    const interval = setInterval(tick, 500)
    return () => clearInterval(interval)
  }, [aio?.startedAt, aio?.phase, sessionId, playerId, onAction])

  if (!aio) return null

  const isActor = playerId === aio.actorId
  const myVote = aio.votes[playerId]
  const hasVoted = myVote !== undefined
  const nonActors = session.players.filter(p => p.id !== aio.actorId)
  const voteCount = Object.keys(aio.votes).length
  const timerColor = timeLeft <= 10 ? 'text-red-400' : timeLeft <= 20 ? 'text-yellow-400' : 'text-green-400'

  const guessedCount = Object.values(aio.votes).filter(v => v).length
  const majorityGuessed = guessedCount > nonActors.length / 2

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <ProgressBar current={session.questionIndex} total={session.totalQuestions} />

        {/* Acting phase */}
        {aio.phase === 'acting' && (
          <>
            <div className="text-center">
              <div className={`text-5xl font-black ${timerColor} transition-colors`}>{timeLeft}</div>
              <div className="text-slate-500 text-xs uppercase tracking-widest">seconds left</div>
            </div>

            <div className="rounded-3xl p-6 border-2 bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-500/30 text-center">
              <div className="text-4xl mb-3">🎬</div>
              {isActor ? (
                <>
                  <div className="text-xs font-bold uppercase tracking-widest mb-2 text-cyan-400">Your Scene</div>
                  <p className="text-white text-lg font-semibold leading-relaxed">{aio.text}</p>
                  <p className="text-slate-400 text-sm mt-3">Act it out! No words allowed!</p>
                </>
              ) : (
                <>
                  <div className="text-xs font-bold uppercase tracking-widest mb-2 text-cyan-400">Now Acting</div>
                  <p className="text-white text-2xl font-black">{aio.actorName}</p>
                  <p className="text-slate-400 text-sm mt-3">Watch and try to guess what they're acting!</p>
                </>
              )}
            </div>

            {isHost && (
              <button
                onClick={() => send('aio-end-acting')}
                className="w-full text-xs text-slate-500 hover:text-slate-400 border border-slate-700 rounded-xl py-2 transition-colors"
              >
                Host: End acting early
              </button>
            )}
          </>
        )}

        {/* Voting phase */}
        {aio.phase === 'voting' && (
          <>
            <div className="rounded-3xl p-6 border-2 bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-500/30 text-center">
              <div className="text-4xl mb-3">🤔</div>
              <div className="text-xs font-bold uppercase tracking-widest mb-2 text-cyan-400">Time's up!</div>
              <p className="text-white text-lg font-semibold">
                Did you guess what <span className="text-cyan-300">{aio.actorName}</span> was acting?
              </p>
            </div>

            {isActor ? (
              <div className="text-center text-cyan-400 text-sm py-3 animate-pulse">
                Others are voting...
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => send('aio-vote', { guessed: true })}
                  disabled={loading || hasVoted}
                  className={`py-4 rounded-2xl border-2 font-bold text-lg transition-all ${
                    myVote === true
                      ? 'border-green-500 bg-green-500/15 text-green-300'
                      : 'border-slate-600 bg-slate-800/50 text-white hover:border-green-500/50'
                  } disabled:cursor-default`}
                >
                  ✅ Got it!
                </button>
                <button
                  onClick={() => send('aio-vote', { guessed: false })}
                  disabled={loading || hasVoted}
                  className={`py-4 rounded-2xl border-2 font-bold text-lg transition-all ${
                    myVote === false
                      ? 'border-red-500 bg-red-500/15 text-red-300'
                      : 'border-slate-600 bg-slate-800/50 text-white hover:border-red-500/50'
                  } disabled:cursor-default`}
                >
                  ❌ No clue
                </button>
              </div>
            )}

            <div className="text-center text-xs text-slate-500">
              {voteCount}/{nonActors.length} voted
            </div>

            {isHost && voteCount > 0 && (
              <button
                onClick={() => send('aio-reveal')}
                className="w-full text-xs text-slate-500 hover:text-slate-400 border border-slate-700 rounded-xl py-2 transition-colors"
              >
                Host: Reveal results now
              </button>
            )}
          </>
        )}

        {/* Done phase */}
        {aio.phase === 'done' && (
          <>
            <div className={`rounded-3xl p-6 border-2 text-center ${
              majorityGuessed
                ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30'
                : 'bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-500/30'
            }`}>
              <div className="text-5xl mb-3">{majorityGuessed ? '🎉' : '😅'}</div>
              <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${majorityGuessed ? 'text-green-400' : 'text-red-400'}`}>
                {majorityGuessed ? 'NAILED IT!' : 'TOUGH CROWD!'}
              </div>
              <p className="text-white text-lg font-semibold">
                {majorityGuessed
                  ? `${guessedCount} guessed correctly! ${aio.actorName} earns +10 points!`
                  : `Only ${guessedCount} guessed it. Better luck next time!`}
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-3">
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">The scene was:</div>
              <p className="text-slate-300 text-sm">{aio.text}</p>
            </div>

            {isHost && (
              <button
                onClick={() => send('aio-next')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95"
              >
                {session.questionIndex + 1 >= session.totalQuestions ? '🏆 See Results' : '➡️ Next Round'}
              </button>
            )}
            {!isHost && (
              <div className="text-center text-slate-400 text-sm animate-pulse py-2">
                Waiting for host to continue...
              </div>
            )}
          </>
        )}

        <HostEndGameButton session={session} playerId={playerId} sessionId={sessionId} onAction={onAction} />
        <Leaderboard players={session.players} />
      </div>
    </div>
  )
}

// ---- Main Game Page ----
function GamePage() {
  const { sessionId } = Route.useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState<GameSession | null>(null)
  const [playerId, setPlayerId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setPlayerId(localStorage.getItem('playerId') || '')
  }, [])

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/game/state/${sessionId}`)
      if (!res.ok) { setError('Session not found'); return }
      const data: GameSession = await res.json()
      setSession(data)
      if (data.state === 'results' || data.state === 'ended') {
        navigate({ to: '/results/$sessionId', params: { sessionId } })
      }
    } catch {
      setError('Connection error')
    }
  }, [sessionId, navigate])

  useEffect(() => {
    fetchState()
    const interval = setInterval(fetchState, 2000)
    return () => clearInterval(interval)
  }, [fetchState])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-red-500/30 rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-3">😕</div>
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => navigate({ to: '/' })} className="text-purple-400 hover:text-purple-300 underline text-sm">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  if (!session || !playerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-purple-400 text-lg animate-pulse">Loading game...</div>
      </div>
    )
  }

  const props = { session, playerId, sessionId, onAction: fetchState }

  if (session.state === 'instructions') return <InstructionsScreen {...props} />

  if (session.state === 'playing') {
    if (session.gameMode === 'truth-or-dare') return <TruthOrDareScreen {...props} />
    if (session.gameMode === 'rapid-fire') return <RapidFireScreen {...props} />
    if (session.gameMode === 'quiz-up') return <QuizScreen {...props} />
    if (session.gameMode === 'most-likely-to') return <MostLikelyToScreen {...props} />
    if (session.gameMode === 'would-you-rather') return <WouldYouRatherScreen {...props} />
    if (session.gameMode === 'fake-it') return <FakeItScreen {...props} />
    if (session.gameMode === 'act-it-out') return <ActItOutScreen {...props} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center">
      <div className="text-purple-400 text-lg animate-pulse">Loading game...</div>
    </div>
  )
}
