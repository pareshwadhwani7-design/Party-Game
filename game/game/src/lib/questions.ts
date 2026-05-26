import truths from '../content/truths.json'
import dares from '../content/dares.json'
import rapidFireQuestions from '../content/rapid-fire.json'
import quizQuestions from '../content/quiz.json'

export interface QuizQuestionTemplate {
  text: string
  options: [string, string, string, string]
  correctIndex: number
}

export const TRUTHS = truths as string[]
export const DARES = dares as Array<{ text: string; drinkPenalty: number }>
export const RAPID_FIRE_QUESTIONS = rapidFireQuestions as string[]
export const QUIZ_QUESTIONS = quizQuestions as QuizQuestionTemplate[]

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
