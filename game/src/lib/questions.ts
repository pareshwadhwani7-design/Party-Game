export interface QuizQuestionTemplate {
  text: string
  options: [string, string, string, string]
  correctIndex: number
}

export const TRUTHS: string[] = [
  "What's the most embarrassing thing that's happened to you at work?",
  "Have you ever ghosted someone you actually liked?",
  "What's the biggest lie you've told to get out of social plans?",
  "What's the most ridiculous reason you've cried recently?",
  "Have you ever snooped through someone's phone? What did you find?",
  "What's your most embarrassing drunk story?",
  "Who here would you most want to switch lives with for a day, and why?",
  "What's the most childish thing you still do regularly?",
  "What's the worst date you've ever been on?",
  "Have you ever pretended to be sick to avoid seeing someone?",
  "What's the most money you've spent on something completely stupid?",
  "What's a habit you have that you'd be embarrassed if people knew about?",
  "What's your most controversial food opinion?",
  "What song do you secretly belt out alone in the car?",
  "Have you ever liked a post on social media going back 3+ years deep?",
  "What's the pettiest thing you've ever done to get revenge on someone?",
  "What's the longest you've gone without showering, and why?",
  "What's something you pretend to like but actually hate?",
  "If your group chat read your personal diary out loud, what would be most shocking?",
  "What's a purchase you regret but would probably make again?",
]

export const DARES: Array<{ text: string; drinkPenalty: number }> = [
  { text: "Do your best impression of someone in this room for 30 seconds.", drinkPenalty: 2 },
  { text: "Text a random contact 'We need to talk' and show everyone the response.", drinkPenalty: 3 },
  { text: "Let someone send one message from your Instagram or WhatsApp.", drinkPenalty: 4 },
  { text: "Show everyone your most recent camera roll photo.", drinkPenalty: 3 },
  { text: "Let the group look through your most recent browser search history.", drinkPenalty: 4 },
  { text: "Do your best runway walk across the room.", drinkPenalty: 1 },
  { text: "Talk in a different accent for the next 3 minutes.", drinkPenalty: 2 },
  { text: "Freestyle rap about someone in the room for 30 seconds.", drinkPenalty: 2 },
  { text: "Do 20 push-ups right now.", drinkPenalty: 1 },
  { text: "Show the last 5 apps you opened on your phone.", drinkPenalty: 2 },
  { text: "Tell everyone your most used emoji and explain what it really means.", drinkPenalty: 1 },
  { text: "Call a family member and tell them you have big news… then say you just love them.", drinkPenalty: 2 },
  { text: "Do your best TikTok dance move for 20 seconds.", drinkPenalty: 2 },
  { text: "Let someone post a selfie with a caption of their choice on your story.", drinkPenalty: 4 },
  { text: "Speak in a whisper for the next 5 minutes.", drinkPenalty: 2 },
  { text: "Text your most recent ex a compliment.", drinkPenalty: 3 },
  { text: "Show everyone your most embarrassing photo on your phone.", drinkPenalty: 3 },
  { text: "Do your best celebrity impression and let the group guess who it is.", drinkPenalty: 2 },
  { text: "Let the person to your left post anything they want on your Twitter/X.", drinkPenalty: 4 },
  { text: "Sing the chorus of any song chosen by the group.", drinkPenalty: 1 },
]

export const RAPID_FIRE_QUESTIONS: string[] = [
  "Would you rather live with your ex or your most annoying coworker?",
  "Who in this room would survive a zombie apocalypse the longest?",
  "Pineapple on pizza: bold choice or a crime against humanity?",
  "Would you take $1M but have to permanently delete all social media?",
  "Who here is most likely to accidentally start a cult?",
  "Worst personality trait: chronically late or always plays the victim?",
  "Would you rather always have to whisper or always have to shout?",
  "One app to delete from everyone's phone: Instagram or TikTok?",
  "Is a hot dog a sandwich? You have 5 seconds to defend your answer.",
  "Would you rather know when you die or how you die?",
  "Most overrated modern thing: brunch, yoga, or astrology?",
  "Would you swipe right on your boss if you saw them on Hinge?",
  "Is adulting actually worth it? Quick answer.",
  "More annoying: slow walkers in front of you or loud chewers?",
  "Would you give up coffee or alcohol for a year for $500?",
  "Who here would you want on your pub quiz team?",
  "Is it ever OK to check your partner's phone? Yes or no, no grey area.",
  "Would you take a pay cut to work from a beach permanently?",
  "Worst modern dating move: ghosting, breadcrumbing, or situationships?",
  "Would you eat mystery leftovers from the office fridge?",
  "Most acceptable reason to cancel plans: rain, 'tired', or 'not feeling it'?",
  "Would you rather be slightly too hot or slightly too cold for the rest of your life?",
  "Who here would make the worst roommate?",
  "Is cereal a soup? Defend your stance.",
  "Would you rather have no WiFi or no air conditioning for a month?",
]

export const QUIZ_QUESTIONS: QuizQuestionTemplate[] = [
  {
    text: "Which country has the most time zones?",
    options: ["Russia", "France", "USA", "Australia"],
    correctIndex: 1,
  },
  {
    text: "In what year was the iPhone first released?",
    options: ["2005", "2006", "2007", "2008"],
    correctIndex: 2,
  },
  {
    text: "Which planet in our solar system has the most moons?",
    options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
    correctIndex: 1,
  },
  {
    text: "What does 'GIF' stand for?",
    options: ["Graphics Interface Format", "Graphics Interchange Format", "General Image File", "Global Image Format"],
    correctIndex: 1,
  },
  {
    text: "How many bones are in the adult human body?",
    options: ["196", "206", "216", "226"],
    correctIndex: 1,
  },
  {
    text: "What is the most liked post on Instagram (as of 2024)?",
    options: ["Kylie Jenner baby reveal", "Ronaldo's egg photo", "The world record egg", "Beyoncé twins announcement"],
    correctIndex: 2,
  },
  {
    text: "What does URL stand for?",
    options: ["Universal Resource Locator", "Uniform Resource Locator", "Universal Reference Link", "Unified Resource Location"],
    correctIndex: 1,
  },
  {
    text: "Which streaming service launched first?",
    options: ["Disney+", "HBO Max", "Netflix Streaming", "Hulu"],
    correctIndex: 2,
  },
  {
    text: "What color do you get when you mix red and blue?",
    options: ["Orange", "Green", "Purple", "Brown"],
    correctIndex: 2,
  },
  {
    text: "Which is the longest river in the world?",
    options: ["Amazon", "Mississippi", "Nile", "Yangtze"],
    correctIndex: 2,
  },
  {
    text: "How many sides does a dodecagon have?",
    options: ["10", "11", "12", "14"],
    correctIndex: 2,
  },
  {
    text: "In which year did the Berlin Wall fall?",
    options: ["1987", "1988", "1989", "1990"],
    correctIndex: 2,
  },
  {
    text: "What is the world's best-selling video game of all time?",
    options: ["Tetris", "Minecraft", "GTA V", "Wii Sports"],
    correctIndex: 1,
  },
  {
    text: "How many keys does a standard piano have?",
    options: ["76", "80", "88", "92"],
    correctIndex: 2,
  },
  {
    text: "Which element has the chemical symbol 'Au'?",
    options: ["Silver", "Gold", "Aluminium", "Argon"],
    correctIndex: 1,
  },
]

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
    const useDare = Math.random() > 0.5

    if (useDare && d < dareIndexes.length) {
      pool.push({ type: 'dare', index: dareIndexes[d++] })
    } else if (t < truthIndexes.length) {
      pool.push({ type: 'truth', index: truthIndexes[t++] })
    }
  }

  return pool
}

export function buildDhamaalPool(totalPrompts: number, count: number): number[] {
  const all = Array.from({ length: totalPrompts }, (_, i) => i)
  return shuffleArray(all).slice(0, Math.min(count, totalPrompts))
}
