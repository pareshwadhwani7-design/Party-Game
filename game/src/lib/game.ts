import { getStore } from '@netlify/blobs'
import type { Tone } from './dhamaalPrompts'

export type GameMode = 'truth-or-dare' | 'rapid-fire' | 'quiz-up' | 'most-likely-to' | 'would-you-rather' | 'fake-it' | 'act-it-out'
export type SessionState = 'lobby' | 'instructions' | 'playing' | 'results' | 'ended'

export interface Player {
  id: string
  name: string
  score: number
  isHost: boolean
  joinedAt: number
}

export interface TDQuestion {
  type: 'truth' | 'dare'
  text: string
  drinkPenalty: number
  targetPlayerId: string
  targetPlayerName: string
  resolvedBy?: string
  resolution?: 'done' | 'skip'
}

export interface RapidFireState {
  questionIndexes: number[]
  completed?: boolean
  player1Id: string
  player2Id: string
  player1Name: string
  player2Name: string
  startedAt: number
  durationMs: number
  score1: number
  score2: number
  currentQuestion: string
  questionIndex: number
  ended: boolean
}

export interface QuizQuestion {
  text: string
  options: [string, string, string, string]
  correctIndex: number
  answers: Record<string, number>
  firstCorrectPlayerId?: string
  revealed: boolean
  openedAt: number
}

export interface MLTState {
  text: string
  votes: Record<string, string>
  revealed: boolean
}

export interface WYRState {
  optA: string
  optB: string
  votes: Record<string, 'a' | 'b'>
  revealed: boolean
  dare: string | null
}

export interface FakeItState {
  text: string
  fakerId: string
  fakerName: string
  phase: 'presenting' | 'voting' | 'revealed'
  votes: Record<string, 'convinced' | 'busted'>
}

export interface ActItOutState {
  text: string
  actorId: string
  actorName: string
  startedAt: number
  durationMs: number
  phase: 'acting' | 'voting' | 'done'
  votes: Record<string, boolean>
}

export interface GameSession {
  id: string
  hostId: string
  players: Player[]
  gameMode: GameMode | null
  state: SessionState
  tone: Tone
  currentPlayerIndex: number
  questionIndex: number
  totalQuestions: number
  currentTDQuestion: TDQuestion | null
  rapidFire: RapidFireState | null
  currentQuizQuestion: QuizQuestion | null
  quizQueueIndexes: number[]
  tdPool?: Array<{ type: 'truth' | 'dare'; index: number }>
  dhamaalPool?: number[]
  currentMLT: MLTState | null
  currentWYR: WYRState | null
  currentFakeIt: FakeItState | null
  currentActItOut: ActItOutState | null
  createdAt: number
  updatedAt: number
}

function getGameStore() {
  return getStore({ name: 'party-game-sessions', consistency: 'strong' })
}

export async function getSession(id: string): Promise<GameSession | null> {
  const store = getGameStore()
  return store.get(id, { type: 'json' }) as Promise<GameSession | null>
}

export async function saveSession(session: GameSession): Promise<void> {
  const store = getGameStore()
  session.updatedAt = Date.now()
  await store.setJSON(session.id, session)
}

export async function deleteSession(id: string): Promise<void> {
  const store = getGameStore()
  await store.delete(id)
}

export function generateId(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

export function generatePlayerId(): string {
  return 'p_' + Math.random().toString(36).slice(2, 11)
}

export function createNewSession(hostId: string, hostName: string): GameSession {
  return {
    id: generateId(),
    hostId,
    players: [{
      id: hostId,
      name: hostName,
      score: 0,
      isHost: true,
      joinedAt: Date.now(),
    }],
    gameMode: null,
    state: 'lobby',
    tone: 'chill',
    currentPlayerIndex: 0,
    questionIndex: 0,
    totalQuestions: 0,
    currentTDQuestion: null,
    rapidFire: null,
    currentQuizQuestion: null,
    quizQueueIndexes: [],
    currentMLT: null,
    currentWYR: null,
    currentFakeIt: null,
    currentActItOut: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

export function getTotalQuestionsForMode(mode: GameMode, playerCount: number): number {
  if (mode === 'truth-or-dare') return Math.max(playerCount * 6, 30)
  if (mode === 'rapid-fire') return 1
  if (mode === 'quiz-up') return 30
  if (mode === 'most-likely-to') return Math.max(playerCount * 4, 20)
  if (mode === 'would-you-rather') return 20
  if (mode === 'fake-it') return Math.max(playerCount * 2, 12)
  if (mode === 'act-it-out') return Math.max(playerCount * 2, 12)
  return 10
}

export const GAME_MODES: Record<GameMode, { label: string; icon: string; description: string }> = {
  'truth-or-dare': { label: 'Truth or Dare', icon: '🎭', description: 'Classic truths and spicy dares' },
  'rapid-fire': { label: 'Rapid Fire', icon: '⚡', description: '2 players, 60 seconds, fire away!' },
  'quiz-up': { label: 'Quiz Up', icon: '🧠', description: 'Trivia and fun questions for all' },
  'most-likely-to': { label: 'Most Likely To', icon: '👆', description: 'Point at the guilty one' },
  'would-you-rather': { label: 'Would You Rather', icon: '⚖️', description: 'No safe option here' },
  'fake-it': { label: 'Fake It', icon: '🤥', description: "Convince 'em you're the expert" },
  'act-it-out': { label: 'Act It Out', icon: '🎬', description: 'No words, pure vibes' },
}
