import mltPrompts from '../content/mlt.json'
import wyrPrompts from '../content/wyr.json'
import fakeItPrompts from '../content/fakeit.json'
import actItOutPrompts from '../content/actitout.json'

export type Tone = 'chill' | 'savage' | 'nsfw'

export interface MLTPrompt {
  text: string
}

export interface WYRPrompt {
  optA: string
  optB: string
}

export interface ActItOutPrompt {
  text: string
}

export interface FakeItPrompt {
  text: string
}

export const MLT_PROMPTS = mltPrompts as Record<Tone, MLTPrompt[]>
export const WYR_PROMPTS = wyrPrompts as Record<Tone, WYRPrompt[]>
export const ACT_IT_OUT_PROMPTS = actItOutPrompts as Record<Tone, ActItOutPrompt[]>
export const FAKE_IT_PROMPTS = fakeItPrompts as Record<Tone, FakeItPrompt[]>

export const DHAMAAL_DARES: Record<Tone, string[]> = {
  chill: [
    'Let the group choose your nickname until the next WYR round.',
    'Read your last safe search query like it is breaking news.',
    'Give a dramatic apology to the person you would most likely leave on read.',
    'Let the group pick one app you cannot open for two rounds.',
    'Describe your current mood as a fake Instagram caption.',
    'Show your most recently used emoji and explain the situation.',
    'Give everyone here a harmless one-word review.',
    'Narrate your last food order like a serious life decision.',
    'Let someone choose your pose for the next group photo.',
    'Give a 20-second pitch for why you are fun at parties.',
    'Read the title of one safe note from your Notes app.',
    'Make a toast to the most chaotic planner in the group.',
    'Explain your phone wallpaper like it has deep meaning.',
    'Let the room choose your temporary theme song.',
    'Say one compliment to the person who voted opposite you.',
    'Act like a fake influencer reviewing this room.',
    'Give a weather report for the vibe of the party.',
    'Speak in your most formal office voice for your next answer.',
    'Give your current bank balance an emotional support message.',
    'Let the group decide your official harmless red flag.',
  ],
  savage: [
    'Let the group vote on your most obvious toxic trait.',
    'Read your last sent group-chat message with dramatic seriousness.',
    'Say who here gives the best advice but worst example.',
    'Tell the room one thing you pretend is under control.',
    'Let the group choose one contact you should not text tonight.',
    'Show your screen-time top three and accept questions.',
    'Give a brutally honest review of your own communication style.',
    'Say which person here would survive cancellation by charm alone.',
    'Read the most suspicious safe note title from your Notes app.',
    'Let the group pick your warning label.',
    'Name one phrase this group needs to retire.',
    'Say who here is most likely to make peace and then bring receipts.',
    'Tell the room the last excuse you used to avoid plans.',
    'Let someone inspect your recent emojis and ask one question.',
    'Admit one thing you call self-care that is actually avoidance.',
    'Give a fake PR statement about your worst recent decision.',
    'Say which friend would be the villain in a friend-group documentary.',
    'Let the room decide your green flag and red flag.',
    'Name the app that brings out your worst personality.',
    'Tell one truth that makes you immediately regret speaking.',
  ],
  nsfw: [
    'Let the group write a clean dating-app opener for you.',
    'Read a flirty recent text that is safe for the room, or take the penalty.',
    'Give your last crush a fake code name and explain it.',
    'Say who here has the most dangerous charm.',
    'Let the group identify your most obvious dating red flag.',
    'Describe your type badly enough that the room can roast it.',
    'Say which friend should never give flirting advice.',
    'Tell the group your most avoidable romantic mistake.',
    'Let someone choose a song that describes your dating life.',
    'Give one clean but flirty compliment with full confidence.',
    'Say what your ex would roast you for.',
    'Let the group choose one person you are banned from drunk-texting.',
    'Describe your worst talking stage in three words.',
    'Say which friend would be the most chaotic wedding plus-one.',
    'Give your situationship history a movie title.',
    'Tell the room the compliment that makes you fold fastest.',
    'Let the group decide if your type is a type or a warning sign.',
    'Read your last safe story reply or explain why you cannot.',
    'Give a fake apology for your romantic decision-making.',
    'Say who here would be most dangerous on a couples trip.',
  ],
}
