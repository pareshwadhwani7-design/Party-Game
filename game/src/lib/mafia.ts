export type MafiaAlignment = 'Village' | 'Mafia' | 'Neutral / Chaos'
export type MafiaAssignmentMode = 'random' | 'god'
export type MafiaPhase = 'setup' | 'assigned'

export interface MafiaRoleDefinition {
  id: string
  name: string
  alignment: MafiaAlignment
  objective: string
  powers: string
  strategy: string
  notes: string
}

export interface MafiaState {
  phase: MafiaPhase
  assignmentMode: MafiaAssignmentMode
  roleCounts: Record<string, number>
  assignments: Record<string, string>
  assignedAt?: number
}

export interface MafiaPlayerRef {
  id: string
  name: string
}

const villageObjective = 'Help the village identify and eliminate the Mafia through discussion, suspicion, and voting in real life.'
const mafiaObjective = 'Work with the Mafia team to survive suspicion and mislead the village until Mafia controls the game.'

export const MAFIA_ROLES: MafiaRoleDefinition[] = [
  {
    id: 'villager',
    name: 'Villager',
    alignment: 'Village',
    objective: villageObjective,
    powers: 'No special power. Your weapon is observation, logic, and reading people badly or brilliantly.',
    strategy: 'Listen for contradictions, watch who is too quiet or too helpful, and do not waste your vote just because someone is annoying.',
    notes: 'Villagers are automatically added when selected roles are fewer than players.',
  },
  {
    id: 'doctor',
    name: 'Doctor',
    alignment: 'Village',
    objective: villageObjective,
    powers: 'Protect one player each night from being eliminated by the Mafia.',
    strategy: 'Do not reveal too early. Try to predict who Mafia will target, especially loud villagers and confirmed roles.',
    notes: 'Use one protection per night. House rules decide whether you can protect yourself.',
  },
  {
    id: 'police',
    name: 'Police',
    alignment: 'Village',
    objective: villageObjective,
    powers: 'Investigate one player each night and ask the narrator whether they are suspicious.',
    strategy: 'Build a quiet information trail. Revealing too early can make you the next target.',
    notes: 'If you use both Police and Detective, decide locally how their investigation results differ.',
  },
  {
    id: 'detective',
    name: 'Detective',
    alignment: 'Village',
    objective: villageObjective,
    powers: 'Investigate behaviour and privately ask for clues about one player each night.',
    strategy: 'Track voting patterns and pressure people who change stories. Your power is strongest when paired with good memory.',
    notes: 'Best used with a narrator who gives simple yes/no or alignment hints.',
  },
  {
    id: 'bodyguard',
    name: 'Bodyguard',
    alignment: 'Village',
    objective: villageObjective,
    powers: 'Choose one player to guard. If they are targeted, you may take the hit instead.',
    strategy: 'Protect players who are likely to be useful but avoid being too obvious about it.',
    notes: 'House rules decide whether the Bodyguard dies, blocks the attack, or both.',
  },
  {
    id: 'vigilante',
    name: 'Vigilante',
    alignment: 'Village',
    objective: villageObjective,
    powers: 'May eliminate one player at night, depending on house rules.',
    strategy: 'Do not shoot emotionally. Bad instincts can lose the village the game.',
    notes: 'Recommended for experienced groups because this role can swing the game hard.',
  },
  {
    id: 'fortune-teller',
    name: 'Fortune Teller',
    alignment: 'Village',
    objective: villageObjective,
    powers: 'Ask the narrator for a vague clue about the game, a player, or the Mafia team.',
    strategy: 'Use soft information to steer discussion without pretending you know everything.',
    notes: 'Keep clues simple and theatrical. This role is for party flavour, not perfect balance.',
  },
  {
    id: 'guardian-angel',
    name: 'Guardian Angel',
    alignment: 'Village',
    objective: villageObjective,
    powers: 'Secretly protects a chosen player or a preassigned target from one major danger.',
    strategy: 'Play quietly. Your value comes from timing, not attention.',
    notes: 'Works best when the narrator defines the protection rule before the game begins.',
  },
  {
    id: 'mafia',
    name: 'Mafia',
    alignment: 'Mafia',
    objective: mafiaObjective,
    powers: 'Wake with Mafia teammates and choose a target during the night phase.',
    strategy: 'Blend in. Push suspicion gently, avoid coordinated overacting, and never all vote the same way too early.',
    notes: 'Mafia-aligned players can see each other after role reveal.',
  },
  {
    id: 'godfather',
    name: 'Godfather',
    alignment: 'Mafia',
    objective: mafiaObjective,
    powers: 'Leads the Mafia. Under some house rules, investigations may show you as innocent.',
    strategy: 'Act calm, helpful, and slightly bored. Let louder players attract suspicion.',
    notes: 'If your group wants a simpler game, play Godfather as regular Mafia with a cooler title.',
  },
  {
    id: 'lawyer',
    name: 'Lawyer',
    alignment: 'Mafia',
    objective: mafiaObjective,
    powers: 'Defends Mafia members in discussion and may protect one Mafia player from suspicion-based powers.',
    strategy: 'Create reasonable doubt without obviously saving your teammate every time.',
    notes: 'Great for dramatic groups that enjoy arguing.',
  },
  {
    id: 'hitman',
    name: 'Hitman',
    alignment: 'Mafia',
    objective: mafiaObjective,
    powers: 'Carries out the Mafia elimination and may have one special unstoppable hit by house rule.',
    strategy: 'Stay ordinary during the day. Let the Godfather look strategic while you look harmless.',
    notes: 'Use the special hit rule only if the group has enough protective Village roles.',
  },
  {
    id: 'spy',
    name: 'Spy',
    alignment: 'Mafia',
    objective: mafiaObjective,
    powers: 'Collects information for Mafia and may peek at a player role or overhear a village clue.',
    strategy: 'Pretend your reads come from vibes, not information.',
    notes: 'Keep information limited so the role does not overpower casual play.',
  },
  {
    id: 'corrupt-cop',
    name: 'Corrupt Cop',
    alignment: 'Mafia',
    objective: mafiaObjective,
    powers: 'Appears like a village investigator but works for Mafia.',
    strategy: 'Seed false confidence. Accuse carefully so your lies survive one more round.',
    notes: 'Best with Police or Detective in the same game for maximum confusion.',
  },
  {
    id: 'joker',
    name: 'Joker',
    alignment: 'Neutral / Chaos',
    objective: 'Get yourself eliminated by vote and create maximum confusion without being too obvious.',
    powers: 'No night power. Your win condition is social manipulation.',
    strategy: 'Act suspicious enough to attract heat but not so cartoonish that people ignore you.',
    notes: 'If Joker wins, your group can either end the game or let Mafia/Village continue.',
  },
  {
    id: 'bomber',
    name: 'Bomber',
    alignment: 'Neutral / Chaos',
    objective: 'Create a dramatic swing by taking another player down with you.',
    powers: 'When eliminated, may choose one player to also be eliminated by house rule.',
    strategy: 'Stay alive until your exit hurts the right people.',
    notes: 'Use carefully in small groups because it can end games quickly.',
  },
  {
    id: 'serial-killer',
    name: 'Serial Killer',
    alignment: 'Neutral / Chaos',
    objective: 'Survive alone and eliminate both Village and Mafia threats.',
    powers: 'May eliminate one player at night, separate from Mafia.',
    strategy: 'Let Mafia and Village weaken each other while you look like a confused villager.',
    notes: 'Recommended for larger groups only.',
  },
  {
    id: 'executioner',
    name: 'Executioner',
    alignment: 'Neutral / Chaos',
    objective: 'Get your assigned target eliminated by vote.',
    powers: 'No night power. Your power is persuasion and targeted suspicion.',
    strategy: 'Build a case slowly. If you attack too hard, people will read you as fake.',
    notes: 'The narrator should privately assign your target before play begins.',
  },
  {
    id: 'arsonist',
    name: 'Arsonist',
    alignment: 'Neutral / Chaos',
    objective: 'Mark players over time and trigger a major elimination by house rule.',
    powers: 'May secretly mark one player each night, then ignite marked players later.',
    strategy: 'Survive quietly. The longer you stay, the more terrifying you become.',
    notes: 'Use only with groups comfortable with extra night instructions.',
  },
  {
    id: 'cult-leader',
    name: 'Cult Leader',
    alignment: 'Neutral / Chaos',
    objective: 'Recruit players and grow a secret faction.',
    powers: 'May recruit one player at night, depending on house rules.',
    strategy: 'Choose socially trusted players and avoid recruiting people already under suspicion.',
    notes: 'This can become chaotic fast. Best for experienced groups.',
  },
  {
    id: 'trickster',
    name: 'Trickster',
    alignment: 'Neutral / Chaos',
    objective: 'Confuse the table and make clean reads unreliable.',
    powers: 'May swap, block, or distort one night action by house rule.',
    strategy: 'Act helpful while quietly making everyone doubt their information.',
    notes: 'Let the narrator define the exact trick before the game starts.',
  },
  {
    id: 'mad-scientist',
    name: 'Mad Scientist',
    alignment: 'Neutral / Chaos',
    objective: 'Create unpredictable outcomes and survive the fallout.',
    powers: 'May perform one experimental action such as reviving, swapping, or blocking by house rule.',
    strategy: 'Do not explain yourself too well. Confusion is your shield.',
    notes: 'Party role. Prioritize fun over perfect balance.',
  },
  {
    id: 'shape-shifter',
    name: 'Shape Shifter',
    alignment: 'Neutral / Chaos',
    objective: 'Use identity confusion to survive and manipulate the game.',
    powers: 'May appear as another role or swap perceived identity by house rule.',
    strategy: 'Let people make assumptions, then benefit from the mess.',
    notes: 'Works best with a narrator who keeps results intentionally simple.',
  },
  {
    id: 'thief',
    name: 'Thief',
    alignment: 'Neutral / Chaos',
    objective: 'Steal influence, survive suspicion, and win by your group-defined condition.',
    powers: 'May steal, block, or copy one player power by house rule.',
    strategy: 'Target powerful roles but avoid making yourself the obvious common problem.',
    notes: 'Agree before play whether stolen powers are temporary or permanent.',
  },
]

export const DEFAULT_MAFIA_ROLE_COUNTS: Record<string, number> = {
  mafia: 1,
  doctor: 1,
  police: 1,
}

export function createDefaultMafiaState(): MafiaState {
  return {
    phase: 'setup',
    assignmentMode: 'random',
    roleCounts: { ...DEFAULT_MAFIA_ROLE_COUNTS },
    assignments: {},
  }
}

export function getMafiaRole(roleId: string): MafiaRoleDefinition {
  return MAFIA_ROLES.find(role => role.id === roleId) ?? MAFIA_ROLES[0]
}

export function getSelectedRoleCount(roleCounts: Record<string, number>): number {
  return Object.values(roleCounts).reduce((sum, count) => sum + Math.max(0, Number(count) || 0), 0)
}

export function getEffectiveRoleCounts(roleCounts: Record<string, number>, playerCount: number): Record<string, number> {
  const normalized = normalizeRoleCounts(roleCounts)
  const selectedCount = getSelectedRoleCount(normalized)
  if (selectedCount < playerCount) {
    normalized.villager = (normalized.villager || 0) + (playerCount - selectedCount)
  }
  return normalized
}

export function normalizeRoleCounts(roleCounts: Record<string, number>): Record<string, number> {
  const validRoleIds = new Set(MAFIA_ROLES.map(role => role.id))
  return Object.entries(roleCounts).reduce<Record<string, number>>((counts, [roleId, count]) => {
    const safeCount = Math.max(0, Math.floor(Number(count) || 0))
    if (validRoleIds.has(roleId) && safeCount > 0) counts[roleId] = safeCount
    return counts
  }, {})
}

export function getRolePool(roleCounts: Record<string, number>, playerCount: number): string[] {
  const effectiveCounts = getEffectiveRoleCounts(roleCounts, playerCount)
  return Object.entries(effectiveCounts).flatMap(([roleId, count]) => Array.from({ length: count }, () => roleId))
}

export function shuffleMafiaItems<T>(items: T[]): T[] {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function assignRandomMafiaRoles(players: MafiaPlayerRef[], roleCounts: Record<string, number>): Record<string, string> {
  const shuffledPlayers = shuffleMafiaItems(players)
  const shuffledRoles = shuffleMafiaItems(getRolePool(roleCounts, players.length))
  return shuffledPlayers.reduce<Record<string, string>>((assignments, player, index) => {
    assignments[player.id] = shuffledRoles[index] || 'villager'
    return assignments
  }, {})
}

export function normalizeManualMafiaAssignments(
  players: MafiaPlayerRef[],
  assignments: Record<string, string>,
): Record<string, string> {
  const validRoleIds = new Set(MAFIA_ROLES.map(role => role.id))
  return players.reduce<Record<string, string>>((normalized, player) => {
    const roleId = assignments[player.id]
    normalized[player.id] = validRoleIds.has(roleId) ? roleId : 'villager'
    return normalized
  }, {})
}

export function getMafiaTeammates(
  playerId: string,
  players: MafiaPlayerRef[],
  assignments: Record<string, string>,
): MafiaPlayerRef[] {
  const myRole = getMafiaRole(assignments[playerId] || 'villager')
  if (myRole.alignment !== 'Mafia') return []
  return players.filter(player => player.id !== playerId && getMafiaRole(assignments[player.id] || 'villager').alignment === 'Mafia')
}

export function sanitizeMafiaStateForPlayer(
  mafia: MafiaState,
  players: MafiaPlayerRef[],
  playerId: string | null,
): MafiaState {
  const safeState: MafiaState = {
    ...mafia,
    roleCounts: { ...mafia.roleCounts },
    assignments: {},
  }

  if (mafia.phase !== 'assigned' || !playerId || !players.some(player => player.id === playerId)) {
    return safeState
  }

  const ownRoleId = mafia.assignments[playerId]
  if (!ownRoleId) return safeState

  safeState.assignments[playerId] = ownRoleId

  if (getMafiaRole(ownRoleId).alignment === 'Mafia') {
    players.forEach(player => {
      const roleId = mafia.assignments[player.id]
      if (roleId && getMafiaRole(roleId).alignment === 'Mafia') {
        safeState.assignments[player.id] = roleId
      }
    })
  }

  return safeState
}

export function getVisibleMafiaPlayerIds(
  mafia: MafiaState,
  players: MafiaPlayerRef[],
  playerId: string | null,
): Set<string> {
  const visibleIds = new Set<string>()
  if (mafia.phase !== 'assigned' || !playerId || !players.some(player => player.id === playerId)) {
    return visibleIds
  }

  visibleIds.add(playerId)
  const ownRoleId = mafia.assignments[playerId]
  if (ownRoleId && getMafiaRole(ownRoleId).alignment === 'Mafia') {
    players.forEach(player => {
      const roleId = mafia.assignments[player.id]
      if (roleId && getMafiaRole(roleId).alignment === 'Mafia') {
        visibleIds.add(player.id)
      }
    })
  }

  return visibleIds
}
