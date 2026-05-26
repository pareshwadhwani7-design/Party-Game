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
    'Do 10 push-ups right now',
    'Send the last meme you saved to your most formal contact',
    'Speak only in questions for the next 2 rounds',
    'Do your absolute best Bollywood dance move',
    'Reveal your last 3 Google searches to the group',
    'Do your best impression of someone in this room',
    'Send a voice note to any contact: "I have something important to tell you"',
    'Phone goes face-up on the table for the next 3 rounds',
    "Call someone in this room by their parent's name for 2 rounds",
    'Sing the first 10 seconds of any Bollywood song',
    'Everyone picks your workout for 60 seconds. Do it.',
  ],
  savage: [
    'Read your last 5 messages out loud to the group',
    'Show the last photo in your camera roll',
    'Let someone in the group send one message from your phone',
    "Tell the group who in this room you'd date if you absolutely had to",
    'Rate everyone here on attractiveness out of 10. Right now.',
    "Give someone a genuine compliment you've never said out loud before",
    'Tell everyone the last lie you told',
    'Show the most embarrassing contact name in your phone',
    'Read the most cringe-worthy message you sent last month',
    "Tell us what you genuinely think of one person's current life choices",
  ],
  nsfw: [
    'Text your most recent ex anything harmless but dramatic',
    'Read your most flirty or awkward text from the last 2 weeks',
    'Tell the group your most embarrassing romantic fail',
    'Show your dating app profile to everyone',
    'Rate your own rizz out of 10 and justify it with evidence',
    'Tell us who in this room has the best rizz and who has the least',
    'Show the last person you matched with on a dating app',
    'Rate your last date out of 10 and explain your score',
  ],
}
