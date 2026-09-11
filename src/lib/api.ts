import { Identity, Sinner, KeywordInfo, KeywordType, Rarity, SinType, Ego, RiskTier, AttackType } from './types';
import sinnersData from '../data/sinners.json';
import keywordsData from '../data/keywords.json';
import identitiesData from '../data/identities.json';
import egosData from '../data/egos.json';

export function getSinners(): Sinner[] {
  return sinnersData as Sinner[];
}

export function getKeywords(): KeywordInfo[] {
  return keywordsData as KeywordInfo[];
}

export function getIdentities(): Identity[] {
  return identitiesData as Identity[];
}

export function getEgos(): Ego[] {
  return egosData as Ego[];
}

const baseZayinSlugs: Record<number, string> = {
  1: 'crows-eye-view-yi-sang',
  2: 'representation-emitter-faust',
  3: 'la-sangre-de-sancho-don-quixote',
  4: 'forest-for-the-flames-ryoshu',
  5: 'chains-of-others-meursault',
  6: 'land-of-illusion-hong-lu',
  7: 'bodysack-heathcliff',
  8: 'snagharpoon-ishmael',
  9: 'what-is-cast-rodion',
  10: 'branch-of-knowledge-sinclair',
  11: 'to-p%C3%A1thos-m%C3%A1thos-outis',
  12: 'suddenly-one-day-gregor'
};

export function getDefaultZayinEgo(sinnerId: number): Ego | undefined {
  const baseSlug = baseZayinSlugs[sinnerId];
  if (baseSlug) {
    const baseEgo = (egosData as Ego[]).find(
      e => e.sinnerId === sinnerId && (e.slug === baseSlug || decodeURIComponent(e.slug) === decodeURIComponent(baseSlug))
    );
    if (baseEgo) return baseEgo;
  }
  return (egosData as Ego[]).find(e => e.sinnerId === sinnerId && e.riskTier === 'ZAYIN');
}

export function getIdentityBySlug(slug: string): Identity | undefined {
  return (identitiesData as Identity[]).find(i => i.slug === slug);
}

// ===== FACTION EXTRACTION =====
const FACTION_PATTERNS: [RegExp, string][] = [
  [/^W Corp\. L3/, 'W Corp. L3'],
  [/^W Corp\. L2/, 'W Corp. L2'],
  [/^W Corp\. L4/, 'W Corp.'],
  [/^W Corp\./, 'W Corp.'],
  [/^Cinq Assoc\./, 'Cinq Assoc.'],
  [/^Liu Assoc\./, 'Liu Assoc.'],
  [/^Seven Assoc\./, 'Seven Assoc.'],
  [/^Shi Assoc\./, 'Shi Assoc.'],
  [/^Zwei Assoc\./, 'Zwei Assoc.'],
  [/^Dieci Assoc\./, 'Dieci Assoc.'],
  [/^Öufi Assoc\./, 'Öufi Assoc.'],
  [/^Devyat'/, 'Devyat'],
  [/^N Corp\./, 'N Corp.'],
  [/^R Corp\./, 'R Corp.'],
  [/^K Corp\./, 'K Corp.'],
  [/^T Corp\./, 'T Corp.'],
  [/^G Corp\./, 'G Corp.'],
  [/^S Corp\./, 'S Corp.'],
  [/^Blade Lineage/, 'Blade Lineage'],
  [/^Kurokumo Clan/, 'Kurokumo Clan'],
  [/^Dawn Office/, 'Dawn Office'],
  [/^Edgar Family/, 'Edgar Family'],
  [/^LCCB/, 'LCCB'],
  [/^Rosespanner Workshop/, 'Rosespanner Workshop'],
  [/^Molar Office/, 'Molar Office'],
  [/^Molar Boatworks/, 'Molar Boatworks'],
  [/^Full-Stop Office/, 'Full-Stop Office'],
  [/^MultiCrack Office/, 'MultiCrack Office'],
  [/^Hook Office/, 'Hook Office'],
  [/^Lantern Office/, 'Lantern Office'],
  [/^Fanghunt Office/, 'Fanghunt Office'],
  [/^Jeong's Office/, 'Jeong\'s Office'],
  [/^Firefist Office/, 'Firefist Office'],
  [/^Wild Hunt/, 'Wild Hunt'],
  [/^Dead Rabbits/, 'Dead Rabbits'],
  [/^Night Awls/, 'Night Awls'],
  [/^District 20/, 'District 20'],
  [/^Lobotomy E\.G\.O::/, 'Lobotomy E.G.O'],
  [/^Lobotomy Corp\./, 'Lobotomy Corp.'],
  [/^LCE E\.G\.O::/, 'LCE E.G.O'],
  [/^Effloresced E\.G\.O::/, 'Effloresced E.G.O'],
  [/^LCA Udjat/, 'LCA Udjat'],
  [/^LCD OSIR/, 'LCD OSIR'],
  [/^The House of Spiders/, 'The House of Spiders'],
  [/^The Ring /, 'The Ring'],
  [/^The Pequod/, 'The Pequod'],
  [/^The Middle/, 'The Middle'],
  [/^The Thumb/, 'The Thumb'],
  [/^The One Who/, 'The One Who Grips'],
  [/^The Index Proxy/, 'The Index'],
  [/^The Index Proselyte/, 'The Index'],
  [/^Heishou Pack/, 'Heishou Pack'],
  [/Prince of La Manchaland|Manager of La Manchaland|Princess of La Manchaland|Priest of La Manchaland|Barber of La Manchaland/, 'La Manchaland'],
  [/^The Lord of Hongyuan|^Drifting Blade of Hongyuan/, 'Hongyuan'],
  [/^Family Hierarch/, 'Edgar Family'],
  [/^Blade of the House of Spiders/, 'The House of Spiders'],
  [/^R\.B\. /, 'R.B.'],
  [/^Wuthering Heights/, 'Wuthering Heights'],
  [/^Twinhook Pirates/, 'Twinhook Pirates'],
  [/^Tingtang Gang/, 'Tingtang Gang'],
  [/^Los Mariachis/, 'Los Mariachis'],
  [/^LCB Sinner/, 'LCB Sinner'],
];

export function extractFaction(name: string): string | null {
  for (const [pattern, faction] of FACTION_PATTERNS) {
    if (pattern.test(name)) return faction;
  }
  return null;
}

export function filterEgos(filters: {
  sinnerId?: number | null;
  riskTier?: RiskTier | null;
  searchQuery?: string;
}): Ego[] {
  return (egosData as Ego[]).filter(ego => {
    if (filters.sinnerId && ego.sinnerId !== filters.sinnerId) {
      return false;
    }
    if (filters.riskTier && ego.riskTier !== filters.riskTier) {
      return false;
    }
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase();
      const matchName = ego.name.toLowerCase().includes(q);
      const matchSinner = ego.sinner.toLowerCase().includes(q);
      const matchRisk = ego.riskTier.toLowerCase().includes(q);
      const matchSin = ego.cost.some(c => c.sin.toLowerCase().includes(q));
      if (!matchName && !matchSinner && !matchRisk && !matchSin) {
        return false;
      }
    }
    return true;
  });
}


export function filterIdentities(filters: {
  sinnerId?: number | null;
  keyword?: KeywordType | null;
  rarity?: Rarity | null;
  searchQuery?: string;
}): Identity[] {
  return (identitiesData as Identity[]).filter(identity => {
    if (filters.sinnerId && identity.sinnerId !== filters.sinnerId) {
      return false;
    }
    if (filters.keyword && !identity.keywords.includes(filters.keyword)) {
      return false;
    }
    if (filters.rarity && identity.rarity !== filters.rarity) {
      return false;
    }
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase();
      const matchName = identity.name.toLowerCase().includes(q);
      const matchSinner = identity.sinner.toLowerCase().includes(q);
      const matchKeyword = identity.keywords.some(k => k.toLowerCase().includes(q));
      if (!matchName && !matchSinner && !matchKeyword) {
        return false;
      }
    }
    return true;
  });
}

// Synergy calculation helper
export interface SynergyAnalysis {
  keywordCounts: Record<KeywordType, number>;
  sinDistribution: Record<SinType, number>;
  attackTypeCounts: Record<AttackType, number>;
  factionCounts: Record<string, number>;
  activeCount: number;
  egoSinDemand: Record<SinType, number>;
  missingSins: SinType[];
  satisfiedSins: SinType[];
}

export function analyzePartySynergy(
  selectedIdentities: (Identity | null)[],
  ownedEgoIds?: Set<string>
): SynergyAnalysis {
  const active = selectedIdentities.filter((i): i is Identity => i !== null);
  const egos = getEgos();

  const keywordCounts: Record<KeywordType, number> = {
    Burn: 0,
    Bleed: 0,
    Tremor: 0,
    Rupture: 0,
    Sinking: 0,
    Poise: 0,
    Charge: 0
  };

  const sinDistribution: Record<SinType, number> = {
    Wrath: 0,
    Lust: 0,
    Sloth: 0,
    Gluttony: 0,
    Gloom: 0,
    Pride: 0,
    Envy: 0
  };

  const attackTypeCounts: Record<AttackType, number> = {
    Slash: 0,
    Pierce: 0,
    Blunt: 0
  };

  const egoSinDemand: Record<SinType, number> = {
    Wrath: 0,
    Lust: 0,
    Sloth: 0,
    Gluttony: 0,
    Gloom: 0,
    Pride: 0,
    Envy: 0
  };

  const factionCounts: Record<string, number> = {};

  active.forEach(identity => {
    // Count keywords
    identity.keywords.forEach(kw => {
      if (keywordCounts[kw] !== undefined) {
        keywordCounts[kw]++;
      }
    });

    // Count faction / collection
    const faction = extractFaction(identity.name);
    if (faction) {
      factionCounts[faction] = (factionCounts[faction] || 0) + 1;
    }

    // Count sin skills & attack types
    if (identity.skills) {
      identity.skills.forEach(skill => {
        if (sinDistribution[skill.sin] !== undefined) {
          // Weighting: S1 = 3, S2 = 2, S3 = 1
          const weight = skill.tier === 1 ? 3 : skill.tier === 2 ? 2 : 1;
          sinDistribution[skill.sin] += weight;
        }

        if (skill.attackType && attackTypeCounts[skill.attackType] !== undefined) {
          attackTypeCounts[skill.attackType]++;
        }
      });
    }
  });

  // Calculate E.G.O Sin Demand for active sinners
  const activeSinnerIds = new Set(active.map(i => i.sinnerId));
  const activeEgos = egos.filter(e => {
    if (!activeSinnerIds.has(e.sinnerId)) return false;
    if (ownedEgoIds && ownedEgoIds.size > 0 && !ownedEgoIds.has(e.id)) return false;
    return true;
  });

  activeEgos.forEach(ego => {
    ego.cost.forEach(c => {
      if (egoSinDemand[c.sin] !== undefined) {
        egoSinDemand[c.sin] += c.count;
      }
    });
  });

  const missingSins: SinType[] = [];
  const satisfiedSins: SinType[] = [];

  (Object.keys(egoSinDemand) as SinType[]).forEach(sin => {
    if (egoSinDemand[sin] > 0) {
      if (sinDistribution[sin] === 0) {
        missingSins.push(sin);
      } else {
        satisfiedSins.push(sin);
      }
    }
  });

  return {
    keywordCounts,
    sinDistribution,
    attackTypeCounts,
    factionCounts,
    activeCount: active.length,
    egoSinDemand,
    missingSins,
    satisfiedSins
  };
}

// ===== RECOMMENDATION ENGINE =====

export interface RecommendOptions {
  targetKeyword: KeywordType | 'Mixed';
  activeSlots: number;     // 5, 6, or 7
  supportSlots: number;    // 0 to 7
  onlyOwned: boolean;
  ownedIds?: Set<string>;
  ownedEgoIds?: Set<string>;
}

export interface RecommendedParty {
  active: Record<number, Identity | null>;   // sinnerId -> identity
  support: Record<number, Identity | null>;  // sinnerId -> identity
  unselected: number[];                       // sinnerIds not assigned
  egos: Record<number, Ego[]>;               // sinnerId -> recommended E.G.Os
}

// --- Cached EGO list for performance ---
const cachedEgos = egosData as Ego[];

// --- Team-Aware E.G.O Selection (Fase B) ---
export function recommendEgosForParty(
  activeIdentities: Identity[],
  supportIdentities: Identity[],
  onlyOwned?: boolean,
  ownedEgoIds?: Set<string>
): Record<number, Ego[]> {
  const sinners = getSinners();

  // Step 1: Calculate team-wide sin budget (active skills weighted + 50% support contribution)
  const squadSinBudget: Record<SinType, number> = {
    Wrath: 0, Lust: 0, Sloth: 0, Gluttony: 0, Gloom: 0, Pride: 0, Envy: 0
  };

  activeIdentities.forEach(id => {
    if (id.skills) {
      id.skills.forEach(sk => {
        if (squadSinBudget[sk.sin] !== undefined) {
          squadSinBudget[sk.sin] += (sk.tier === 1 ? 3 : sk.tier === 2 ? 2 : 1);
        }
      });
    }
  });

  // Support contribution (50% weight)
  supportIdentities.forEach(id => {
    if (id.skills) {
      id.skills.forEach(sk => {
        if (squadSinBudget[sk.sin] !== undefined) {
          squadSinBudget[sk.sin] += (sk.tier === 1 ? 1.5 : sk.tier === 2 ? 1.0 : 0.5);
        }
      });
    }
  });

  const activeSinnerIds = new Set(activeIdentities.map(i => i.sinnerId));
  const recommendedEgos: Record<number, Ego[]> = {};
  const riskOrder: RiskTier[] = ['ZAYIN', 'TETH', 'HE', 'WAW', 'ALEPH'];

  // Step 2: Equip mandatory ZAYIN base for each active sinner
  const remainingBudget = { ...squadSinBudget };

  sinners.forEach(sinner => {
    const defaultZayin = getDefaultZayinEgo(sinner.id);
    if (activeSinnerIds.has(sinner.id) && defaultZayin) {
      recommendedEgos[sinner.id] = [defaultZayin];
      // Deduct ZAYIN cost from budget (small cost, always affordable)
      defaultZayin.cost.forEach(c => {
        if (remainingBudget[c.sin] !== undefined) {
          remainingBudget[c.sin] = Math.max(0, remainingBudget[c.sin] - c.count * 0.3);
        }
      });
    } else {
      recommendedEgos[sinner.id] = defaultZayin ? [defaultZayin] : [];
    }
  });

  // Step 3: Collect ALL candidate EGOs for active sinners (excluding already-equipped ZAYINs)
  interface EgoCandidate {
    ego: Ego;
    sinnerId: number;
    coverageRatio: number;
    score: number;
    totalCost: number;
  }

  const allCandidates: EgoCandidate[] = [];

  sinners.forEach(sinner => {
    if (!activeSinnerIds.has(sinner.id)) return;

    let availableEgos = cachedEgos.filter(e => e.sinnerId === sinner.id);
    if (onlyOwned && ownedEgoIds && ownedEgoIds.size > 0) {
      availableEgos = availableEgos.filter(e => ownedEgoIds.has(e.id));
    }

    const equippedIds = new Set((recommendedEgos[sinner.id] || []).map(e => e.id));

    riskOrder.forEach(tier => {
      const candidates = availableEgos.filter(e => e.riskTier === tier && !equippedIds.has(e.id));
      candidates.forEach(ego => {
        let totalCost = 0;
        let coveredCost = 0;

        ego.cost.forEach(c => {
          totalCost += c.count;
          const available = remainingBudget[c.sin] || 0;
          coveredCost += Math.min(c.count, available);
        });

        const coverageRatio = totalCost > 0 ? coveredCost / totalCost : 1;

        // Tier weight
        let tierWeight = 1;
        if (tier === 'ALEPH') tierWeight = 6;
        else if (tier === 'WAW') tierWeight = 5;
        else if (tier === 'HE') tierWeight = 4;
        else if (tier === 'TETH') tierWeight = 3;
        else if (tier === 'ZAYIN') tierWeight = 1;

        const score = coverageRatio * tierWeight;

        allCandidates.push({ ego, sinnerId: sinner.id, coverageRatio, score, totalCost });
      });
    });
  });

  // Step 4: Greedy selection — pick best EGO globally, deduct cost, repeat
  // One EGO per tier per sinner
  const equippedTiers: Record<number, Set<RiskTier>> = {};
  sinners.forEach(s => {
    equippedTiers[s.id] = new Set((recommendedEgos[s.id] || []).map(e => e.riskTier));
  });

  // Sort by score descending
  allCandidates.sort((a, b) => b.score - a.score);

  for (const candidate of allCandidates) {
    // Skip if this sinner already has an EGO of this tier
    if (equippedTiers[candidate.sinnerId]?.has(candidate.ego.riskTier)) continue;

    // Only equip if coverage >= 70%
    // Recalculate coverage with current remaining budget
    let totalCost = 0;
    let coveredCost = 0;
    candidate.ego.cost.forEach(c => {
      totalCost += c.count;
      const available = remainingBudget[c.sin] || 0;
      coveredCost += Math.min(c.count, available);
    });
    const currentCoverage = totalCost > 0 ? coveredCost / totalCost : 1;

    if (currentCoverage >= 0.7) {
      recommendedEgos[candidate.sinnerId].push(candidate.ego);
      equippedTiers[candidate.sinnerId].add(candidate.ego.riskTier);

      // Deduct cost from remaining budget (partial deduction to allow sharing)
      candidate.ego.cost.forEach(c => {
        if (remainingBudget[c.sin] !== undefined) {
          remainingBudget[c.sin] = Math.max(0, remainingBudget[c.sin] - c.count * 0.5);
        }
      });
    }
  }

  return recommendedEgos;
}

// --- Identity Scoring (Fase A) ---
function scoreIdentity(
  identity: Identity,
  targetKeyword: KeywordType | 'Mixed',
  alreadySelectedKeywords: KeywordType[],
  alreadySelectedFactions: string[],
  teamAttackTypes: Record<AttackType, number>,
  ownedEgoIds?: Set<string>,
  accumulatedSinSupply?: Record<SinType, number>,
  targetSinQuota?: Record<SinType, number>
): number {
  let score = 0;

  // === 1. Keyword Matching ===
  if (targetKeyword !== 'Mixed') {
    // Primary keyword match (first keyword is the identity's main archetype)
    if (identity.keywords.length > 0 && identity.keywords[0] === targetKeyword) {
      score += 6;
    }
    // Secondary keyword match
    if (identity.keywords.includes(targetKeyword)) {
      score += 3;
    }
  } else {
    // Mixed mode: bonus for having multiple keywords (versatility)
    score += identity.keywords.length * 1.5;
  }

  // === 2. Keyword Concentration (Escalable) ===
  // Simulates conditional passive thresholds: ≥3 of same keyword activates passives
  identity.keywords.forEach(kw => {
    const count = alreadySelectedKeywords.filter(k => k === kw).length;
    if (count === 0) score += 1.5;       // First of this keyword in team
    else if (count === 1) score += 2.5;  // 2nd — building synergy
    else if (count === 2) score += 4.5;  // 3rd — THRESHOLD for passive activation!
    else if (count === 3) score += 3.5;  // 4th — strong team
    else score += 2.0;                   // 5th+ — diminishing but still valuable
  });

  // === 3. Faction Synergy ===
  const faction = extractFaction(identity.name);
  if (faction && faction !== 'LCB Sinner') {
    const factionCount = alreadySelectedFactions.filter(f => f === faction).length;
    if (factionCount === 0) score += 0.5;   // First of faction — minor
    else if (factionCount === 1) score += 3; // 2nd — building faction synergy
    else if (factionCount === 2) score += 5; // 3rd — THRESHOLD for faction passives!
    else score += 3;                         // 4th+ — strong faction team
  }

  // === 4. E.G.O Sin Resource Matching ===
  if (identity.skills) {
    const sinnerEgos = cachedEgos.filter(
      e => e.sinnerId === identity.sinnerId && (!ownedEgoIds || ownedEgoIds.size === 0 || ownedEgoIds.has(e.id))
    );
    const neededSins = new Set<SinType>();
    sinnerEgos.forEach(e => e.cost.forEach(c => neededSins.add(c.sin)));

    identity.skills.forEach(skill => {
      if (neededSins.has(skill.sin)) {
        score += 1.0; // Bonus for producing sin required by sinner's E.G.Os
      }

      // Dynamic Team Sin Quota bonus
      if (accumulatedSinSupply && targetSinQuota && targetSinQuota[skill.sin] > 0) {
        const currentSupply = accumulatedSinSupply[skill.sin] || 0;
        if (currentSupply === 0) {
          score += 4.0; // High bonus for filling a completely missing Sin
        } else if (currentSupply < targetSinQuota[skill.sin]) {
          score += 2.0; // Medium bonus for reducing a deficit
        }
      }
    });
  }

  // === 5. Attack Type Diversity ===
  if (identity.skills) {
    const identityAttackTypes = new Set<AttackType>();
    identity.skills.forEach(sk => {
      if (sk.attackType) identityAttackTypes.add(sk.attackType);
    });

    identityAttackTypes.forEach(at => {
      if (teamAttackTypes[at] === 0) {
        score += 2.5; // Strong bonus for bringing an absent attack type
      } else if (teamAttackTypes[at] <= 2) {
        score += 1.0; // Minor bonus for underrepresented types
      }
    });
  }

  // === 6. Rarity Bonus (boosted) ===
  score += identity.rarity * 1.0;

  return score;
}

// --- Main Recommendation (Fase C) ---
export function recommendParty(options: RecommendOptions): RecommendedParty {
  const { targetKeyword, activeSlots, supportSlots, onlyOwned, ownedIds, ownedEgoIds } = options;
  const sinners = getSinners();
  const allIds = getIdentities();

  // Filter by ownership if needed
  const availableIds = onlyOwned && ownedIds
    ? allIds.filter(i => ownedIds.has(i.id))
    : allIds;

  // Compute total team E.G.O Sin demand quota from mandatory ZAYIN + available E.G.Os
  const targetSinQuota: Record<SinType, number> = {
    Wrath: 0, Lust: 0, Sloth: 0, Gluttony: 0, Gloom: 0, Pride: 0, Envy: 0
  };

  sinners.forEach(s => {
    const defaultZayin = getDefaultZayinEgo(s.id);
    if (defaultZayin) {
      defaultZayin.cost.forEach(c => {
        if (targetSinQuota[c.sin] !== undefined) targetSinQuota[c.sin] += c.count;
      });
    }
  });

  // Track team state
  const accumulatedSinSupply: Record<SinType, number> = {
    Wrath: 0, Lust: 0, Sloth: 0, Gluttony: 0, Gloom: 0, Pride: 0, Envy: 0
  };
  const teamAttackTypes: Record<AttackType, number> = { Slash: 0, Pierce: 0, Blunt: 0 };
  const alreadySelectedKeywords: KeywordType[] = [];
  const alreadySelectedFactions: string[] = [];

  const selectedForActive: { sinnerId: number; identity: Identity }[] = [];
  const selectedForSupport: { sinnerId: number; identity: Identity }[] = [];
  const unselected: number[] = [];
  const assignedSinners = new Set<number>();

  // Pass 1: Select Active Slots with Dynamic Synergy Tracking
  for (let slot = 0; slot < Math.min(activeSlots, sinners.length); slot++) {
    let bestPick: { sinnerId: number; identity: Identity; score: number } | null = null;

    sinners.forEach(sinner => {
      if (assignedSinners.has(sinner.id)) return;

      const candidates = availableIds.filter(i => i.sinnerId === sinner.id);
      candidates.forEach(identity => {
        const score = scoreIdentity(
          identity,
          targetKeyword,
          alreadySelectedKeywords,
          alreadySelectedFactions,
          teamAttackTypes,
          ownedEgoIds,
          accumulatedSinSupply,
          targetSinQuota
        );

        if (!bestPick || score > bestPick.score) {
          bestPick = { sinnerId: sinner.id, identity, score };
        }
      });
    });

    if (bestPick) {
      const pick = bestPick as { sinnerId: number; identity: Identity; score: number };
      assignedSinners.add(pick.sinnerId);
      selectedForActive.push({ sinnerId: pick.sinnerId, identity: pick.identity });

      // Update team state
      alreadySelectedKeywords.push(...pick.identity.keywords);

      const faction = extractFaction(pick.identity.name);
      if (faction) alreadySelectedFactions.push(faction);

      if (pick.identity.skills) {
        pick.identity.skills.forEach(sk => {
          if (accumulatedSinSupply[sk.sin] !== undefined) {
            accumulatedSinSupply[sk.sin] += (sk.tier === 1 ? 3 : sk.tier === 2 ? 2 : 1);
          }
          if (sk.attackType && teamAttackTypes[sk.attackType] !== undefined) {
            teamAttackTypes[sk.attackType]++;
          }
        });
      }
    }
  }

  // Pass 2: Select Support Slots for remaining sinners
  sinners.forEach(sinner => {
    if (assignedSinners.has(sinner.id)) return;

    if (selectedForSupport.length < supportSlots) {
      const candidates = availableIds.filter(i => i.sinnerId === sinner.id);
      if (candidates.length > 0) {
        const top = candidates.map(identity => ({
          identity,
          score: scoreIdentity(
            identity,
            targetKeyword,
            alreadySelectedKeywords,
            alreadySelectedFactions,
            teamAttackTypes,
            ownedEgoIds
          )
        })).sort((a, b) => b.score - a.score)[0];

        assignedSinners.add(sinner.id);
        selectedForSupport.push({ sinnerId: sinner.id, identity: top.identity });

        // Track support keywords/factions for synergy awareness
        alreadySelectedKeywords.push(...top.identity.keywords);
        const faction = extractFaction(top.identity.name);
        if (faction) alreadySelectedFactions.push(faction);
      } else {
        unselected.push(sinner.id);
      }
    } else {
      unselected.push(sinner.id);
    }
  });

  // Build result records
  const active: Record<number, Identity | null> = {};
  const support: Record<number, Identity | null> = {};

  sinners.forEach(s => {
    active[s.id] = null;
    support[s.id] = null;
  });

  selectedForActive.forEach(sa => { active[sa.sinnerId] = sa.identity; });
  selectedForSupport.forEach(ss => { support[ss.sinnerId] = ss.identity; });

  // Recommend EGOs with team-wide budget awareness (includes support sin contribution)
  const activeIdentitiesList = selectedForActive.map(sa => sa.identity);
  const supportIdentitiesList = selectedForSupport.map(ss => ss.identity);
  const recommendedEgosMap = recommendEgosForParty(
    activeIdentitiesList,
    supportIdentitiesList,
    onlyOwned,
    ownedEgoIds
  );

  return { active, support, unselected, egos: recommendedEgosMap };
}

