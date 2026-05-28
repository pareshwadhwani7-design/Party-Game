import truths from '../content/truths.json'
import dares from '../content/dares.json'
import rapidFireQuestions from '../content/rapid-fire.json'
import quizQuestions from '../content/quiz.json'
import type { Tone } from './dhamaalPrompts'

export interface QuizQuestionTemplate {
  text: string
  options: [string, string, string, string]
  correctIndex: number
}

export interface DareTemplate {
  text: string
  drinkPenalty: number
}

type ToneContent<T> = Record<Tone, T[]>

function toneContent<T>(content: T[] | Partial<ToneContent<T>>): ToneContent<T> {
  if (Array.isArray(content)) {
    return {
      chill: content,
      savage: content,
      nsfw: content,
    }
  }

  return {
    chill: content.chill ?? [],
    savage: content.savage ?? content.chill ?? [],
    nsfw: content.nsfw ?? content.savage ?? content.chill ?? [],
  }
}

function byTone<T>(content: ToneContent<T>, tone: Tone): T[] {
  return content[tone]?.length ? content[tone] : content.chill
}

export const TRUTHS_BY_TONE = toneContent(truths as string[] | Partial<ToneContent<string>>)
export const DARES_BY_TONE = toneContent(dares as DareTemplate[] | Partial<ToneContent<DareTemplate>>)
export const RAPID_FIRE_BY_TONE = toneContent(rapidFireQuestions as string[] | Partial<ToneContent<string>>)
export const QUIZ_BY_TONE = toneContent(quizQuestions as QuizQuestionTemplate[] | Partial<ToneContent<QuizQuestionTemplate>>)

export const TRUTHS = TRUTHS_BY_TONE.chill
export const DARES = DARES_BY_TONE.chill
export const RAPID_FIRE_QUESTIONS = RAPID_FIRE_BY_TONE.chill
export const QUIZ_QUESTIONS = QUIZ_BY_TONE.chill

export function getTruths(tone: Tone): string[] {
  return byTone(TRUTHS_BY_TONE, tone)
}

export function getDares(tone: Tone): DareTemplate[] {
  return byTone(DARES_BY_TONE, tone)
}

export function getRapidFireQuestions(tone: Tone): string[] {
  return byTone(RAPID_FIRE_BY_TONE, tone)
}

export function getQuizQuestions(tone: Tone): QuizQuestionTemplate[] {
  return byTone(QUIZ_BY_TONE, tone)
}

export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function pickRandomQuizIndexes(count: number): number[] {
  const all = Array.from({ length: QUIZ_QUESTIONS.length }, (_, i) => i)
  return shuffleArray(all).slice(0, Math.min(count, all.length))
}

export function buildTDPool(count: number): Array<{ type: 'truth' | 'dare'; index: number }> {
  const truthIndexes = shuffleArray(Array.from({ length: TRUTHS.length }, (_, i) => i))
  const dareIndexes = shuffleArray(Array.from({ length: DARES.length }, (_, i) => i))
  const pool: Array<{ type: 'truth' | 'dare'; index: number }> = []
  let t = 0
  let d = 0

  for (let i = 0; i < count; i++) {
    const useDare = i % 2 === 1

    if (useDare && d < dareIndexes.length) {
      pool.push({ type: 'dare', index: dareIndexes[d++] })
    } else if (t < truthIndexes.length) {
      pool.push({ type: 'truth', index: truthIndexes[t++] })
    } else if (d < dareIndexes.length) {
      pool.push({ type: 'dare', index: dareIndexes[d++] })
    }
  }

  return pool
}

export function buildDhamaalPool(totalPrompts: number, count: number): number[] {
  const all = Array.from({ length: totalPrompts }, (_, i) => i)
  return shuffleArray(all).slice(0, Math.min(count, totalPrompts))
}
