import type { GameMode, GameSession } from './game'
import { createDefaultMafiaState } from './mafia'
import {
  getDares,
  getQuizQuestions,
  getRapidFireQuestions,
  getTruths,
  shuffleArray,
} from './questions'
import {
  ACT_IT_OUT_PROMPTS,
  DHAMAAL_DARES,
  FAKE_IT_PROMPTS,
  MLT_PROMPTS,
  WYR_PROMPTS,
  type Tone,
} from './dhamaalPrompts'

const DHAMAAL_MODES = ['most-likely-to', 'would-you-rather', 'fake-it', 'act-it-out'] as const
type DhamaalMode = (typeof DHAMAAL_MODES)[number]

function ensureUsedPromptIds(session: GameSession): string[] {
  if (!Array.isArray(session.usedPromptIds)) session.usedPromptIds = []
  return session.usedPromptIds
}

function markPromptUsed(session: GameSession, promptId: string) {
  const used = ensureUsedPromptIds(session)
  if (!used.includes(promptId)) used.push(promptId)
}

function buildIndexPool(total: number, count: number, session: GameSession, idForIndex: (index: number) => string): number[] {
  const used = new Set(ensureUsedPromptIds(session))
  const all = Array.from({ length: total }, (_, index) => index)
  const unused = all.filter(index => !used.has(idForIndex(index)))
  const usedIndexes = all.filter(index => used.has(idForIndex(index)))
  const ordered = [...shuffleArray(unused), ...shuffleArray(usedIndexes)]
  return ordered.slice(0, Math.min(count, total))
}

function tdPromptId(tone: Tone, item: { type: 'truth' | 'dare'; index: number }) {
  return `td:${tone}:${item.type}:${item.index}`
}

function quizPromptId(tone: Tone, index: number) {
  return `quiz:${tone}:${index}`
}

function rapidFirePromptId(tone: Tone, index: number) {
  return `rapid-fire:${tone}:${index}`
}

function dhamaalPromptId(mode: DhamaalMode, tone: Tone, index: number) {
  return `${mode}:${tone}:${index}`
}

function wyrDarePromptId(tone: Tone, index: number) {
  return `wyr-dare:${tone}:${index}`
}

function getDhamaalPrompts(mode: DhamaalMode, tone: Tone) {
  if (mode === 'most-likely-to') return MLT_PROMPTS[tone]
  if (mode === 'would-you-rather') return WYR_PROMPTS[tone]
  if (mode === 'fake-it') return FAKE_IT_PROMPTS[tone]
  return ACT_IT_OUT_PROMPTS[tone]
}

function buildTDPool(session: GameSession, count: number): Array<{ type: 'truth' | 'dare'; index: number }> {
  const tone = session.tone || 'chill'
  const truths = getTruths(tone)
  const dares = getDares(tone)
  const used = new Set(ensureUsedPromptIds(session))
  const truthItems = Array.from({ length: truths.length }, (_, index) => ({ type: 'truth' as const, index }))
  const dareItems = Array.from({ length: dares.length }, (_, index) => ({ type: 'dare' as const, index }))
  const allItems = [...truthItems, ...dareItems]
  const unusedItems = allItems.filter(item => !used.has(tdPromptId(tone, item)))
  const usedItems = allItems.filter(item => used.has(tdPromptId(tone, item)))
  return [...shuffleArray(unusedItems), ...shuffleArray(usedItems)].slice(0, Math.min(count, allItems.length))
}

export function resetActiveRoundState(session: GameSession) {
  session.currentTDQuestion = null
  session.rapidFire = null
  session.currentQuizQuestion = null
  session.currentMLT = null
  session.currentWYR = null
  session.currentFakeIt = null
  session.currentActItOut = null
}

export function resetRoundProgress(session: GameSession) {
  session.questionIndex = 0
  session.currentPlayerIndex = 0
  session.currentTDIndex = 0
  session.currentPromptIndex = 0
  session.quizIndexes = []
  session.quizQueueIndexes = []
  session.questionIndexes = []
  session.promptIndexes = []
  session.dhamaalPool = []
  session.tdPool = []
  session.mafia = null
  resetActiveRoundState(session)
}

export function resetScores(session: GameSession) {
  session.players.forEach(player => {
    player.score = 0
  })
}

export function finishGameNow(session: GameSession) {
  if (session.gameMode === 'rapid-fire' && session.rapidFire && !session.rapidFire.completed) {
    completeRapidFire(session)
    return
  }

  session.state = 'results'
  resetActiveRoundState(session)
}

export function prepareModePools(session: GameSession, mode: GameMode) {
  ensureUsedPromptIds(session)
  resetRoundProgress(session)

  if (mode === 'truth-or-dare') {
    session.tdPool = buildTDPool(session, session.totalQuestions)
    session.totalQuestions = session.tdPool.length
  } else if (mode === 'quiz-up') {
    const tone = session.tone || 'chill'
    const questions = getQuizQuestions(tone)
    session.quizIndexes = buildIndexPool(questions.length, session.totalQuestions, session, index => quizPromptId(tone, index))
    session.quizQueueIndexes = session.quizIndexes
    session.totalQuestions = session.quizIndexes.length
  } else if (mode === 'rapid-fire') {
    const tone = session.tone || 'chill'
    const questions = getRapidFireQuestions(tone)
    session.questionIndexes = buildIndexPool(questions.length, session.totalQuestions, session, index => rapidFirePromptId(tone, index))
    session.totalQuestions = session.questionIndexes.length
  } else if (mode === 'mafia') {
    session.mafia = createDefaultMafiaState()
  } else if (DHAMAAL_MODES.includes(mode as DhamaalMode)) {
    const dhamaalMode = mode as DhamaalMode
    const tone = session.tone || 'chill'
    const prompts = getDhamaalPrompts(dhamaalMode, tone)
    session.promptIndexes = buildIndexPool(prompts.length, session.totalQuestions, session, index => dhamaalPromptId(dhamaalMode, tone, index))
    session.dhamaalPool = session.promptIndexes
    session.totalQuestions = session.promptIndexes.length
  }
}

export function buildCurrentTDQuestion(session: GameSession) {
  const tone = session.tone || 'chill'
  const truths = getTruths(tone)
  const dares = getDares(tone)
  const target = session.players[session.currentPlayerIndex]
  const currentIndex = session.currentTDIndex ?? session.questionIndex
  const poolItem = session.tdPool?.[currentIndex]
  if (!target || !poolItem) return null

  markPromptUsed(session, tdPromptId(tone, poolItem))
  if (poolItem.type === 'dare') {
    const dare = dares[poolItem.index]
    return {
      type: 'dare' as const,
      text: dare.text,
      drinkPenalty: dare.drinkPenalty,
      targetPlayerId: target.id,
      targetPlayerName: target.name,
    }
  }

  return {
    type: 'truth' as const,
    text: truths[poolItem.index],
    drinkPenalty: 0,
    targetPlayerId: target.id,
    targetPlayerName: target.name,
  }
}

export function buildCurrentQuizQuestion(session: GameSession): GameSession['currentQuizQuestion'] {
  const tone = session.tone || 'chill'
  const questions = getQuizQuestions(tone)
  const indexes = session.quizIndexes?.length ? session.quizIndexes : session.quizQueueIndexes
  const idx = indexes[session.questionIndex]
  if (idx === undefined) return null
  const q = questions[idx]
  markPromptUsed(session, quizPromptId(tone, idx))
  return {
    text: q.text,
    options: q.options,
    correctIndex: q.correctIndex,
    answers: {},
    revealed: false,
    scored: false,
    openedAt: Date.now(),
  }
}

export function buildRapidFireState(session: GameSession): GameSession['rapidFire'] {
  if (session.players.length < 2) return null
  const tone = session.tone || 'chill'
  const questions = getRapidFireQuestions(tone)
  const shuffled = shuffleArray([...Array(session.players.length).keys()])
  const p1Idx = shuffled[0]
  const p2Idx = shuffled.find(index => index !== p1Idx) ?? (p1Idx === 0 ? 1 : 0)
  const questionIndexes = session.questionIndexes?.length
    ? session.questionIndexes
    : buildIndexPool(questions.length, session.totalQuestions, session, index => rapidFirePromptId(tone, index))
  const firstIndex = questionIndexes[0]
  if (firstIndex === undefined) return null
  markPromptUsed(session, rapidFirePromptId(tone, firstIndex))

  return {
    player1Id: session.players[p1Idx].id,
    player2Id: session.players[p2Idx].id,
    player1Name: session.players[p1Idx].name,
    player2Name: session.players[p2Idx].name,
    startedAt: Date.now(),
    durationMs: 120000,
    score1: 0,
    score2: 0,
    currentQuestion: questions[firstIndex],
    questionIndexes,
    questionIndex: 0,
    ended: false,
    completed: false,
  }
}

export function advanceRapidFireQuestion(session: GameSession) {
  const rf = session.rapidFire
  if (!rf) return
  const tone = session.tone || 'chill'
  const questions = getRapidFireQuestions(tone)
  const nextQuestionIndex = rf.questionIndex + 1
  const nextPromptIndex = rf.questionIndexes[nextQuestionIndex]
  if (nextPromptIndex === undefined) {
    rf.ended = true
    return
  }
  rf.questionIndex = nextQuestionIndex
  rf.currentQuestion = questions[nextPromptIndex]
  markPromptUsed(session, rapidFirePromptId(tone, nextPromptIndex))
}

export function buildCurrentDhamaalPrompt(session: GameSession) {
  const mode = session.gameMode as DhamaalMode | null
  if (!mode || !DHAMAAL_MODES.includes(mode)) return
  const tone = session.tone || 'chill'
  const promptIndexes = session.promptIndexes?.length ? session.promptIndexes : session.dhamaalPool
  const currentIndex = session.currentPromptIndex ?? session.questionIndex
  const promptIndex = promptIndexes?.[currentIndex]
  if (promptIndex === undefined) return

  markPromptUsed(session, dhamaalPromptId(mode, tone, promptIndex))
  session.currentMLT = null
  session.currentWYR = null
  session.currentFakeIt = null
  session.currentActItOut = null

  if (mode === 'most-likely-to') {
    const prompt = MLT_PROMPTS[tone][promptIndex]
    session.currentMLT = { text: prompt.text, votes: {}, revealed: false, scored: false }
  } else if (mode === 'would-you-rather') {
    const prompt = WYR_PROMPTS[tone][promptIndex]
    session.currentWYR = { optA: prompt.optA, optB: prompt.optB, votes: {}, revealed: false, dare: null }
  } else if (mode === 'fake-it') {
    const faker = session.players[session.currentPlayerIndex]
    const prompt = FAKE_IT_PROMPTS[tone][promptIndex]
    if (faker) session.currentFakeIt = { text: prompt.text, fakerId: faker.id, fakerName: faker.name, phase: 'presenting', votes: {}, scored: false }
  } else if (mode === 'act-it-out') {
    const actor = session.players[session.currentPlayerIndex]
    const prompt = ACT_IT_OUT_PROMPTS[tone][promptIndex]
    if (actor) {
      session.currentActItOut = {
        text: prompt.text,
        actorId: actor.id,
        actorName: actor.name,
        startedAt: Date.now(),
        durationMs: 60000,
        phase: 'acting',
        votes: {},
        scored: false,
      }
    }
  }
}

export function beginPlaying(session: GameSession) {
  session.state = 'playing'
  if (session.gameMode === 'truth-or-dare') {
    session.currentTDQuestion = buildCurrentTDQuestion(session)
  } else if (session.gameMode === 'rapid-fire') {
    session.rapidFire = buildRapidFireState(session)
  } else if (session.gameMode === 'quiz-up') {
    session.currentQuizQuestion = buildCurrentQuizQuestion(session)
  } else {
    buildCurrentDhamaalPrompt(session)
  }
}

export function advanceTruthOrDare(session: GameSession) {
  session.questionIndex++
  session.currentTDIndex = (session.currentTDIndex ?? 0) + 1
  if (session.questionIndex >= session.totalQuestions) {
    session.state = 'results'
    session.currentTDQuestion = null
    return
  }
  session.currentPlayerIndex = (session.currentPlayerIndex + 1) % session.players.length
  session.currentTDQuestion = buildCurrentTDQuestion(session)
}

export function scoreQuizQuestion(session: GameSession) {
  const q = session.currentQuizQuestion
  if (!q || q.scored) return
  q.scored = true
  session.players.forEach(player => {
    if (q.answers[player.id] === q.correctIndex) {
      player.score += 10
      if (player.id === q.firstCorrectPlayerId) player.score += 3
    }
  })
}

export function revealQuizQuestion(session: GameSession) {
  const q = session.currentQuizQuestion
  if (!q || q.revealed) return
  q.revealed = true
  scoreQuizQuestion(session)
}

export function advanceQuizQuestion(session: GameSession) {
  session.questionIndex++
  if (session.questionIndex >= session.totalQuestions) {
    session.state = 'results'
    session.currentQuizQuestion = null
    return
  }
  session.currentQuizQuestion = buildCurrentQuizQuestion(session)
}

export function scoreMLT(session: GameSession) {
  const mlt = session.currentMLT
  if (!mlt || mlt.scored) return
  mlt.scored = true
  const voteCounts: Record<string, number> = {}
  Object.values(mlt.votes).forEach(targetId => {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1
  })
  let maxVotes = 0
  let winnerId = ''
  Object.entries(voteCounts).forEach(([playerId, count]) => {
    if (count > maxVotes) {
      maxVotes = count
      winnerId = playerId
    }
  })
  const winner = session.players.find(player => player.id === winnerId)
  if (winner) winner.score += maxVotes
}

export function advanceDhamaalMode(session: GameSession) {
  session.questionIndex++
  session.currentPromptIndex = (session.currentPromptIndex ?? 0) + 1
  if (session.questionIndex >= session.totalQuestions) {
    session.state = 'results'
    session.currentMLT = null
    session.currentWYR = null
    session.currentFakeIt = null
    session.currentActItOut = null
    return
  }
  session.currentPlayerIndex = (session.currentPlayerIndex + 1) % session.players.length
  buildCurrentDhamaalPrompt(session)
}

export function pickNextWyrDare(session: GameSession): string | null {
  const tone = session.tone || 'chill'
  const indexes = buildIndexPool(DHAMAAL_DARES[tone].length, 1, session, index => wyrDarePromptId(tone, index))
  const index = indexes[0]
  if (index === undefined) return null
  markPromptUsed(session, wyrDarePromptId(tone, index))
  return DHAMAAL_DARES[tone][index]
}

export function scoreFakeIt(session: GameSession) {
  const fi = session.currentFakeIt
  if (!fi || fi.scored) return
  fi.scored = true
  const nonFakers = session.players.filter(player => player.id !== fi.fakerId)
  const convincedCount = Object.values(fi.votes).filter(vote => vote === 'convinced').length
  if (convincedCount > nonFakers.length / 2) {
    const faker = session.players.find(player => player.id === fi.fakerId)
    if (faker) faker.score += convincedCount * 2
  }
}

export function scoreActItOut(session: GameSession) {
  const aio = session.currentActItOut
  if (!aio || aio.scored) return
  aio.scored = true
  const nonActors = session.players.filter(player => player.id !== aio.actorId)
  const guessedCount = Object.values(aio.votes).filter(Boolean).length
  if (guessedCount > nonActors.length / 2) {
    const actor = session.players.find(player => player.id === aio.actorId)
    if (actor) actor.score += 10
  }
}

export function completeRapidFire(session: GameSession) {
  const rf = session.rapidFire
  if (!rf || rf.completed) return false
  rf.completed = true
  rf.ended = true

  const p1 = session.players.find(player => player.id === rf.player1Id)
  const p2 = session.players.find(player => player.id === rf.player2Id)
  if (p1) p1.score += rf.score1 * 5
  if (p2) p2.score += rf.score2 * 5

  if (rf.score1 > rf.score2 && p1) p1.score += 10
  else if (rf.score2 > rf.score1 && p2) p2.score += 10

  session.state = 'results'
  return true
}
