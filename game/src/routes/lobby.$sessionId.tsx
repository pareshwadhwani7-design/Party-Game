import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, useCallback } from 'react'
import { GameSession, GAME_MODES, GameMode } from '../lib/game'
import type { Tone } from '../lib/dhamaalPrompts'

export const Route = createFileRoute('/lobby/$sessionId')({
  component: LobbyPage,
})

const DHAMAAL_MODES: GameMode[] = ['most-likely-to', 'would-you-rather', 'fake-it', 'act-it-out']

const TONES: { id: Tone; emoji: string; label: string }[] = [
  { id: 'chill', emoji: '😄', label: 'Chill' },
  { id: 'savage', emoji: '🔥', label: 'Savage' },
  { id: 'nsfw', emoji: '🔞', label: 'NSFW' },
]

function LobbyPage() {
  const { sessionId } = Route.useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState<GameSession | null>(null)
  const [playerId, setPlayerId] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    setPlayerId(localStorage.getItem('playerId') || '')
  }, [])

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/game/state/${sessionId}`)
      if (!res.ok) {
        setError('Session not found')
        return
      }
      const data: GameSession = await res.json()
      setSession(data)

      if (data.state === 'instructions' || data.state === 'playing') {
        navigate({ to: '/game/$sessionId', params: { sessionId } })
      } else if (data.state === 'results') {
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

  async function copyCode() {
    await navigator.clipboard.writeText(sessionId).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function startGame() {
    if (!playerId) return
    setStarting(true)
    try {
      const res = await fetch('/api/game/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          playerId,
          action: 'start-game',
          data: { gameMode: session?.gameMode },
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Failed to start')
      }
    } catch {
      setError('Failed to start game')
    } finally {
      setStarting(false)
    }
  }

  async function changeMode(mode: GameMode) {
    if (!playerId) return
    await fetch('/api/game/host', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, playerId, action: 'change-mode', data: { gameMode: mode } }),
    })
    fetchState()
  }

  async function changeTone(tone: Tone) {
    if (!playerId) return
    await fetch('/api/game/host', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, playerId, action: 'change-tone', data: { tone } }),
    })
    fetchState()
  }

  async function kickPlayer(targetPlayerId: string) {
    if (!playerId) return
    await fetch('/api/game/host', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, playerId, action: 'kick', data: { targetPlayerId } }),
    })
    fetchState()
  }

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

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-purple-400 text-lg animate-pulse">Loading...</div>
      </div>
    )
  }

  const isHost = session.hostId === playerId
  const currentMode = session.gameMode || 'truth-or-dare'
  const currentTone = session.tone || 'chill'
  const showToneSelector = DHAMAAL_MODES.includes(currentMode)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-black text-white">Lobby</h1>
          <p className="text-slate-400 text-sm mt-1">Waiting for players...</p>
        </div>

        {/* Share Code */}
        <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-5 text-center">
          <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Game Code</p>
          <div className="font-mono text-4xl font-black text-white tracking-widest mb-3">{sessionId}</div>
          <button
            onClick={copyCode}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            {copied ? '✓ Copied!' : '📋 Copy code'}
          </button>
        </div>

        {/* Players */}
        <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Players ({session.players.length})
          </h2>
          <div className="space-y-2">
            {session.players.map(p => (
              <div
                key={p.id}
                className="flex items-center gap-3 bg-slate-700/40 rounded-xl px-4 py-3 animate-fadeIn"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                  {p.name[0].toUpperCase()}
                </div>
                <span className="text-white font-medium flex-1">{p.name}</span>
                {p.isHost && <span className="text-xs text-yellow-400 font-semibold">👑 Host</span>}
                {p.id === playerId && <span className="text-xs text-purple-400">(you)</span>}
                {isHost && !p.isHost && (
                  <button
                    onClick={() => kickPlayer(p.id)}
                    className="text-xs text-red-400 hover:text-red-300 ml-2"
                    title="Kick player"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mode Selection (host only) */}
        {isHost && (
          <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">Game Mode</h2>
            <div className="space-y-2">
              {(Object.entries(GAME_MODES) as [GameMode, typeof GAME_MODES[GameMode]][]).map(([mode, info]) => (
                <button
                  key={mode}
                  onClick={() => changeMode(mode)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    currentMode === mode
                      ? 'border-purple-500 bg-purple-500/10 text-white'
                      : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span className="text-xl">{info.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{info.label}</div>
                    <div className="text-xs text-slate-400">{info.description}</div>
                  </div>
                  {DHAMAAL_MODES.includes(mode) && (
                    <span className="text-[10px] font-bold bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">NEW</span>
                  )}
                  {currentMode === mode && <span className="text-purple-400 font-bold">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tone Selector (host only, dhamaal modes) */}
        {isHost && showToneSelector && (
          <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">Tone</h2>
            <div className="grid grid-cols-3 gap-2">
              {TONES.map(t => (
                <button
                  key={t.id}
                  onClick={() => changeTone(t.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                    currentTone === t.id
                      ? 'border-orange-500 bg-orange-500/10 text-white'
                      : 'border-slate-600 bg-slate-700/30 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <span className="text-xl">{t.emoji}</span>
                  <span className="text-xs font-bold">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!isHost && (
          <div className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-4 text-center">
            <p className="text-slate-400 text-sm">
              {GAME_MODES[currentMode as GameMode]?.icon} Mode: <span className="text-white font-semibold">{GAME_MODES[currentMode as GameMode]?.label}</span>
            </p>
            {showToneSelector && (
              <p className="text-slate-500 text-xs mt-1">
                Tone: {TONES.find(t => t.id === currentTone)?.emoji} {TONES.find(t => t.id === currentTone)?.label}
              </p>
            )}
            <p className="text-slate-500 text-xs mt-1">Waiting for host to start...</p>
          </div>
        )}

        {/* Start Button (host only) */}
        {isHost && (
          <button
            onClick={startGame}
            disabled={starting || session.players.length < 2}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-40 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-purple-500/20 active:scale-95 text-lg"
          >
            {starting ? 'Starting...' : session.players.length < 2 ? 'Need at least 2 players' : '🎮 Start Game'}
          </button>
        )}
      </div>
    </div>
  )
}
