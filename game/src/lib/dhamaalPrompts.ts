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

export const MLT_PROMPTS: Record<Tone, MLTPrompt[]> = {
  chill: [
    { text: "Most likely to text \"I'm 5 minutes away\" when they haven't left the house yet" },
    { text: 'Most likely to cry during a Bollywood wedding scene and immediately deny it' },
    { text: 'Most likely to accidentally double-tap a 3-year-old Instagram post while stalking' },
    { text: 'Most likely to hype everyone for plans and then cancel with a vague excuse' },
    { text: 'Most likely to start a new diet every single Monday for the rest of their life' },
    { text: 'Most likely to befriend the aunty next door purely for free food and gossip' },
    { text: "Most likely to know everyone's drama while pretending they have no idea" },
    { text: 'Most likely to fall asleep 10 minutes into the movie they suggested' },
    { text: 'Most likely to finish the last of something and quietly put the empty container back' },
    { text: 'Most likely to have a meme folder organized by emotional category' },
    { text: 'Most likely to order the most expensive thing when someone else is paying' },
    { text: "Most likely to get completely lost in a mall they've been to 50 times" },
    { text: "Most likely to get emotionally attached to a TV show character like they're real" },
    { text: 'Most likely to ghost plans and blame their wifi' },
    { text: 'Most likely to bring up your most embarrassing moment in every group chat' },
    { text: 'Most likely to negotiate at a fixed-price store and somehow succeed' },
    { text: 'Most likely to be the last one to know about drama they accidentally caused' },
    { text: "Most likely to pretend they've watched a movie just to avoid looking out of touch" },
    { text: 'Most likely to get free upgrades everywhere just by smiling' },
    { text: 'Most likely to turn a quick grocery run into a 3-hour disappearance' },
  ],
  savage: [
    { text: 'Most likely to be the main character nobody asked for' },
    { text: "Most likely to be everyone's friend but nobody's best friend" },
    { text: "Most likely to have read receipts off because they're avoiding 6 people simultaneously" },
    { text: 'Most likely to give unsolicited life advice with zero self-awareness' },
    { text: "Most likely to talk behind everyone's back and cry if anyone does it to them" },
    { text: 'Most likely to slide into DMs at 2 AM and regret it at 8 AM' },
    { text: 'Most likely to fall deeply in love with someone who only sees them as a friend' },
    { text: 'Most likely to cry drunk and insist it\'s "not about that" when it definitely is' },
    { text: 'Most likely to make a detailed budget and break it within 24 hours' },
    { text: "Most likely to compare their life to their cousin who 'got settled abroad'" },
    { text: 'Most likely to start 5 things and finish exactly zero of them' },
    { text: 'Most likely to have their ex saved as "Do Not Pick Up" and still pick up' },
    { text: 'Most likely to call themselves "brutally honest" but crumble if anyone is honest with them' },
    { text: "Most likely to overshare about their situationship to people who didn't ask" },
    { text: 'Most likely to have a personality that only exists around their crush' },
    { text: 'Most likely to be "between jobs" for 18 months and calling it a "soul journey"' },
    { text: 'Most likely to get ghosted and immediately make it their personality' },
    { text: 'Most likely to make every conversation about themselves within 2 minutes' },
  ],
  nsfw: [
    { text: 'Most likely to have a very suspicious incognito tab history they forgot to close' },
    { text: 'Most likely to text their ex "u up?" after two drinks and call it an accident' },
    { text: 'Most likely to be seeing 3 people at once while calling none of them a "partner"' },
    { text: 'Most likely to confess deep feelings drunk and pretend it never happened sober' },
    { text: 'Most likely to accidentally send a flirty message to the completely wrong person' },
    { text: 'Most likely to have a secret situationship nobody in this room knows about' },
    { text: "Most likely to have photos on their phone they'd never want their parents to see" },
    { text: 'Most likely to have already hooked up with someone in this room or seriously thought about it' },
    { text: "Most likely to slide into a celebrity's DMs with zero shame" },
    { text: 'Most likely to have matched on a dating app and never sent a single message' },
    { text: 'Most likely to have a relationship red flag everyone sees except them' },
    { text: 'Most likely to overpromise on the first date and completely disappear after' },
  ],
}

export const WYR_PROMPTS: Record<Tone, WYRPrompt[]> = {
  chill: [
    { optA: 'Lose your phone for a month', optB: 'Lose all money in your account' },
    { optA: 'Only eat Dal Chawal for a year', optB: 'Never eat Dal Chawal ever again' },
    { optA: 'Speak only in Bollywood dialogues for 24 hours', optB: 'Speak no Hindi at all for a week' },
    { optA: 'Be stuck in a lift with your ex', optB: 'Be stuck in a lift with your most annoying relative' },
    { optA: 'Your parents read your WhatsApp chats', optB: 'Your parents see your Google search history' },
    { optA: "Have Amitabh Bachchan's voice forever", optB: "Have Shah Rukh Khan's charm forever" },
    { optA: 'Unlimited Zomato Gold for life', optB: 'Unlimited PVR passes for life' },
    { optA: 'Always arrive awkwardly 30 mins early to everything', optB: 'Always be exactly 25 mins late to everything' },
    { optA: 'Your parents find your Tinder profile', optB: 'Your parents find your meme folder' },
    { optA: 'Eat gol gappa for every meal for a week', optB: 'Never eat gol gappa again in your life' },
    { optA: 'Know the exact date of your death', optB: 'Know exactly how you will die' },
    { optA: 'Be famous but completely broke', optB: 'Be extremely rich but totally unknown' },
    { optA: 'Live in Mumbai summer with no AC', optB: 'Live in Delhi winter with no heating' },
    { optA: 'Every song you hear becomes Honey Singh', optB: 'Every movie you watch is dubbed in Bhojpuri' },
    { optA: 'Be fluent in every language on earth', optB: 'Play every instrument perfectly' },
    { optA: 'Fight one horse-sized duck', optB: 'Fight 100 duck-sized horses' },
  ],
  savage: [
    { optA: 'Know what your best friend really thinks of you', optB: 'Know what your crush really thinks of you' },
    { optA: 'Have your texts from last month read aloud to the group', optB: 'Have your Google search history shown to everyone' },
    { optA: 'Be slightly unattractive but insanely confident', optB: 'Be very attractive but cripplingly insecure' },
    { optA: 'Get zero matches on Shaadi.com ever', optB: 'Be arranged-married within the next 3 months' },
    { optA: 'Your boss knows your real salary expectations', optB: 'Your parents know your body count' },
    { optA: 'Go viral for something deeply embarrassing', optB: 'Never appear anywhere on the internet again' },
    { optA: 'Always know when someone is lying to you', optB: 'Be able to lie perfectly to literally anyone' },
    { optA: "Date someone your parents love but you're bored by", optB: 'Date someone you\'re obsessed with but parents hate' },
    { optA: 'Be brutally honest with everyone forever', optB: 'Lie smoothly and convincingly for the rest of your life' },
    { optA: 'Restart life as a completely different person', optB: 'Continue exactly as you are for the next 10 years' },
    { optA: 'Find out your 5-year relationship was built on a lie', optB: "Never learn the truth about something that's been bothering you for years" },
    { optA: 'Everyone knows your deepest insecurity', optB: 'Everyone knows your biggest mistake' },
  ],
  nsfw: [
    { optA: 'Accidentally moan in a silent office meeting', optB: 'Accidentally send a flirty text to your boss' },
    { optA: 'Your parents can hear everything you say for a week', optB: 'Your friends can read every thought you have for 24 hours' },
    { optA: 'Your last risky conversation read aloud by Amitabh Bachchan', optB: 'Your last risky conversation posted on family WhatsApp' },
    { optA: 'One perfect unforgettable night, never see them again', optB: 'Months of mediocre dates that go absolutely nowhere' },
    { optA: 'Date someone 10 years older with their life completely together', optB: "Date someone your age who's a chaotic mess but fun" },
    { optA: 'Incredible chemistry with zero emotional compatibility', optB: 'Perfect compatibility with absolutely no chemistry whatsoever' },
    { optA: 'Be completely celibate for 2 years', optB: 'Give up all food, alcohol, and social media for 6 months' },
    { optA: 'Only flirt in English', optB: 'Only confess feelings in your mother tongue' },
  ],
}

export const ACT_IT_OUT_PROMPTS: Record<Tone, ActItOutPrompt[]> = {
  chill: [
    { text: "You're stuck in a Mumbai local train during peak hour. Survive." },
    { text: 'Bollywood villain who just found out the hero is still alive... again.' },
    { text: 'Your mom just found something suspicious on your phone. Act her full reaction.' },
    { text: "Wedding aunty sizing up the bride's family and the food simultaneously." },
    { text: "You're negotiating with an auto driver who wants triple the meter." },
    { text: 'Explain WhatsApp voice notes to your 75-year-old dadi. She keeps calling back.' },
    { text: "You're the only one at a Navratri who doesn't know the Garba steps." },
    { text: 'You just remembered a family dinner started 20 minutes ago. React.' },
    { text: 'Splitting a restaurant bill between 8 people across 4 payment apps.' },
    { text: 'Bigg Boss contestant during nominations week. Innocent. Very innocent.' },
    { text: 'Act like you\'re at a wedding and "Naatu Naatu" comes on.' },
    { text: "You're a yoga instructor who has never done yoga. Fake it." },
    { text: 'Delivery partner: 6 floors, no parking, broken lift, angry customer.' },
    { text: 'You just got your first viral Instagram reel with 2M views.' },
    { text: "You're an Indian parent dropping their child at college for the first time." },
    { text: 'MasterChef India judge tasting a dish that is clearly burnt to ash.' },
    { text: 'You confidently ordered "extra spicy" at a South Indian restaurant and regret everything.' },
    { text: "First time riding an e-scooter. It's going much faster than expected." },
  ],
  savage: [
    { text: "You're the group's biggest gossip dramatically retelling today's drama." },
    { text: "Rishta aunty who's already decided NO but must sit politely through the meeting." },
    { text: 'Turning down a marriage proposal with maximum Bollywood drama.' },
    { text: 'Explaining crypto to your family WhatsApp group as they slowly stop responding.' },
    { text: 'Confessing your feelings to someone while completely hammered. In public.' },
    { text: 'You just caught your best friend in a massive lie. React in real time.' },
    { text: "On KBC, zero clue what the answer is, but pretending you totally do." },
    { text: "Meeting your ex's new partner at a mutual friend's party with everyone watching." },
    { text: 'Got subtly roasted in public. Desperately, visibly trying to play it cool.' },
    { text: 'Giving a TED Talk about something you learned from a single Instagram reel.' },
    { text: 'Relationship therapist who is clearly going through their own brutal breakup.' },
    { text: "Influencer reviewing a product they've never used and clearly don't understand." },
  ],
  nsfw: [
    { text: 'You sent a risky text to the wrong person. React in real time.' },
    { text: 'Trying to be smooth at a bar. Spectacularly failing at every single step.' },
    { text: 'The morning after an awkward night. No words allowed.' },
    { text: "Obviously flirting but will passionately deny it if anyone calls you out." },
    { text: "Got caught in a lie about where you were last night. Explain everything." },
    { text: "Playing it cool on a first date while being absolutely terrified inside." },
  ],
}

export const FAKE_IT_PROMPTS: Record<Tone, FakeItPrompt[]> = {
  chill: [
    { text: "You are the world's foremost expert in identifying which Mumbai neighborhood someone is from based purely on their slang." },
    { text: 'You are a certified expert in knowing if a recipe has too much ajwain just by looking at the pan.' },
    { text: 'You are globally renowned for predicting which Bollywood movie will flop before it releases.' },
    { text: 'You are a PhD-holding expert in decoding what your Indian mom means versus what she says.' },
    { text: 'You can read a restaurant menu and order perfectly for 10 people in under 60 seconds.' },
    { text: "You are the world's leading expert in detecting passive aggression in family WhatsApp messages." },
    { text: 'You can tell if a ladoo is from a good mithai shop or a mediocre one from across the room.' },
    { text: 'You know the exact correct time to actually show up to any Indian wedding.' },
    { text: 'You can sense the precise moment a Bollywood fight scene stops being remotely realistic.' },
    { text: 'You can detect whether a Zoom call is about to run 45 minutes over before the host knows.' },
    { text: 'You know which auto driver will accept your fare and which will make an excuse just by looking.' },
    { text: "You have a PhD in knowing if someone is genuinely busy or avoiding you based on their last seen." },
    { text: 'You can read the dynamics of any Indian family function within 30 seconds of arrival.' },
    { text: 'You are an expert negotiator who can get a better deal on literally anything.' },
    { text: 'You can identify all 5 singers in a classic RD Burman chorus from the first 3 seconds.' },
  ],
  savage: [
    { text: 'You are a world expert in identifying who in any friend group is secretly jealous of whom.' },
    { text: "You can rank the commitment issues of everyone in a room from their texting response time alone." },
    { text: "You can detect from a single Instagram story reaction whether someone is genuinely happy or silently seething." },
    { text: "You can tell if a Bollywood couple is real or a PR move from one red carpet appearance." },
    { text: 'You know someone is about to cancel plans from how they respond to "see you tomorrow!"' },
    { text: "You can diagnose which childhood wound is driving someone's current adult personality." },
    { text: "You can predict if a startup will fail within 6 months from the founder's LinkedIn posts alone." },
    { text: 'You can tell within 5 minutes if someone is going to be the drama catalyst in any group.' },
  ],
  nsfw: [
    { text: "You can tell from someone's Bumble profile alone whether they are emotionally available or a complete waste of time." },
    { text: 'You can detect how many people someone is simultaneously talking to on dating apps from one screenshot.' },
    { text: 'You can tell within 5 seconds of meeting someone whether there is genuine chemistry or it\'s purely platonic.' },
    { text: 'You can predict who in any group of friends will end up together by end of night.' },
    { text: 'You are an expert in detecting whether a situationship is going anywhere or stuck in an infinite loop.' },
    { text: "You can tell from texting style alone if someone is genuinely interested or stringing you along." },
  ],
}

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
    'Text your most recent ex — right now — anything you want',
    'Read your most flirty/awkward text from the last 2 weeks',
    'Tell the group your most embarrassing romantic fail',
    'Show your dating app profile to everyone',
    'Rate your own rizz out of 10 and justify it with evidence',
    'Tell us who in this room has the best rizz and who has the least',
    'Show the last person you matched with on a dating app',
    'Rate your last date out of 10 and explain your score',
  ],
}

export function pickRandomPrompt<T>(prompts: T[]): T {
  return prompts[Math.floor(Math.random() * prompts.length)]
}

export function pickRandomDare(tone: Tone): string {
  const pool = DHAMAAL_DARES[tone]
  return pool[Math.floor(Math.random() * pool.length)]
}
