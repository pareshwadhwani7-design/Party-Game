import { createFileRoute, useNavigate } from '@tanstack/react-router'
import React, { useState } from 'react'
import { GAME_MODES, GameMode } from '../lib/game'
import type { Tone } from '../lib/dhamaalPrompts'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const DHAMAAL_MODES: GameMode[] = ['most-likely-to', 'would-you-rather', 'fake-it', 'act-it-out']

const TONES: { id: Tone; emoji: string; label: string; desc: string }[] = [
  { id: 'chill', emoji: '😄', label: 'Chill', desc: 'Safe for all' },
  { id: 'savage', emoji: '🔥', label: 'Savage', desc: 'Spicy & brutal' },
  { id: 'nsfw', emoji: '🔞', label: 'NSFW', desc: 'Adults only' },
]

function HomePage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'create' | 'join'>('create')
  const [name, setName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [selectedMode, setSelectedMode] = useState<GameMode>('most-likely-to')
  const [selectedTone, setSelectedTone] = useState<Tone>('chill')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const showToneSelector = DHAMAAL_MODES.includes(selectedMode)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError('Enter your name first')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/game/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: name.trim(),
          gameMode: selectedMode,
          tone: showToneSelector ? selectedTone : 'chill',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create game')
      localStorage.setItem('playerId', data.playerId)
      localStorage.setItem('playerName', name.trim())
      navigate({ to: '/lobby/$sessionId', params: { sessionId: data.sessionId } })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError('Enter your name first')
    if (!joinCode.trim()) return setError('Enter a game code')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/game/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: joinCode.trim().toUpperCase(), playerName: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to join game')
      localStorage.setItem('playerId', data.playerId)
      localStorage.setItem('playerName', name.trim())
      navigate({ to: '/lobby/$sessionId', params: { sessionId: data.sessionId } })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🎉</div>
          <h1 className="text-4xl font-black text-white tracking-tight">Party Game</h1>
          <p className="text-purple-300 mt-2">The ultimate party experience</p>
        </div>

        <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-3xl p-6 shadow-2xl">
          <div className="flex bg-slate-700/50 rounded-2xl p-1 mb-6">
            <button
              onClick={() => { setTab('create'); setError('') }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                tab === 'create'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Game
            </button>
            <button
              onClick={() => { setTab('join'); setError('') }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                tab === 'join'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Join Game
            </button>
          </div>

          {tab === 'create' ? (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={20}
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Game Mode</label>
                <div className="space-y-2">
                  {(Object.entries(GAME_MODES) as [GameMode, typeof GAME_MODES[GameMode]][]).map(([mode, info]) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSelectedMode(mode)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        selectedMode === mode
                          ? 'border-purple-500 bg-purple-500/10 text-white'
                          : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <span className="text-2xl">{info.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{info.label}</div>
                        <div className="text-xs text-slate-400">{info.description}</div>
                      </div>
                      {DHAMAAL_MODES.includes(mode) && (
                        <span className="text-[10px] font-bold bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">NEW</span>
                      )}
                      {selectedMode === mode && <div className="text-purple-400 font-bold">✓</div>}
                    </button>
                  ))}
                </div>
              </div>

              {showToneSelector && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Tone</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TONES.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTone(t.id)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                          selectedTone === t.id
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

              {error && <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-500/20 active:scale-95"
              >
                {loading ? 'Creating...' : '🚀 Create Game'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={20}
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Game Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. AB3X7K"
                  maxLength={6}
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors font-mono text-lg tracking-widest text-center uppercase"
                />
              </div>

              {error && <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-pink-500/20 active:scale-95"
              >
                {loading ? 'Joining...' : '🎮 Join Game'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">No account needed · Share the code to invite friends</p>
      </div>
    </div>
  )
}
