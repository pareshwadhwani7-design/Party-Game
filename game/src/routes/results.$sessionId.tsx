import { createFileRoute, useNavigate } from '@tanstack/react-router'
import React, { useEffect, useState } from 'react'
import { GameSession, GAME_MODES } from '../lib/game'

export const Route = createFileRoute('/results/$sessionId')({
  component: ResultsPage,
})

function ResultsPage() {
  const { sessionId } = Route.useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState<GameSession | null>(null)
  const [playerId, setPlayerId] = useState('')
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    setPlayerId(localStorage.getItem('playerId') || '')
  }, [])

  useEffect(() => {
    const fetchState = () => {
      fetch(`/api/game/state/${sessionId}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (!d) return
          setSession(d)
          if (d.state === 'lobby') {
            navigate({ to: '/lobby/$sessionId', params: { sessionId } })
          }
        })
        .catch(() => {})
    }

    fetchState()
    const interval = setInterval(fetchState, 2000)
    return () => clearInterval(interval)
  }, [sessionId, navigate])

  async function playAgain() {
    if (!playerId) return
    setResetting(true)
    await fetch('/api/game/host', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, playerId, action: 'reset' }),
    })
    navigate({ to: '/lobby/$sessionId', params: { sessionId } })
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-purple-400 text-lg animate-pulse">Loading results…</div>
      </div>
    )
  }

  const sorted = [...session.players].sort((a, b) => b.score - a.score)
  const winner = sorted[0]
  const isHost = session.hostId === playerId
  const mode = session.gameMode
  const modeInfo = mode ? GAME_MODES[mode] : null

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Winner Banner */}
        <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-500/30 rounded-3xl p-6 text-center">
          <div className="text-5xl mb-2">🏆</div>
          <p className="text-yellow-400 text-xs uppercase tracking-widest mb-1">Winner</p>
          <h2 className="text-3xl font-black text-white">{winner?.name}</h2>
          <p className="text-yellow-400 font-bold text-xl mt-1">{winner?.score} points</p>
        </div>

        {/* Mode Tag */}
        {modeInfo && (
          <div className="text-center">
            <span className="text-sm text-slate-400">{modeInfo.icon} {modeInfo.label}</span>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Final Standings</h3>
          <div className="space-y-2">
            {sorted.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                  i === 0 ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-slate-700/30'
                }`}
              >
                <span className="text-xl w-6 text-center">{medals[i] || `${i + 1}`}</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                  {p.name[0].toUpperCase()}
                </div>
                <span className="text-white font-medium flex-1">{p.name}</span>
                {p.id === playerId && <span className="text-xs text-purple-400">(you)</span>}
                <span className={`font-bold ${i === 0 ? 'text-yellow-400' : 'text-slate-300'}`}>
                  {p.score}pt
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {isHost ? (
          <div className="space-y-3">
            <button
              onClick={playAgain}
              disabled={resetting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95 text-lg"
            >
              {resetting ? 'Resetting…' : '🔄 Play Again'}
            </button>
            <button
              onClick={() => navigate({ to: '/' })}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-2xl transition-all"
            >
              🏠 New Game
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-center text-slate-400 text-sm py-2 animate-pulse">
              Waiting for host to continue…
            </div>
            <button
              onClick={() => navigate({ to: '/' })}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-2xl transition-all"
            >
              🏠 Leave Game
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
