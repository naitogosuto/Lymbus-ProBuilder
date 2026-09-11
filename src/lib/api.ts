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

  active.forEach(identity => {
    // Count keywords
    identity.keywords.forEach(kw => {
      if (keywordCounts[kw] !== undefined) {
        keywordCounts[kw]++;
      }
    });

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

export function recommendEgosForParty(
  activeIdentities: Identity[],
  onlyOwned?: boolean,
  ownedEgoIds?: Set<string>
): Record<number, Ego[]> {
  const sinners = getSinners();
  const allEgos = getEgos();

  // Calculate squad sin supply (weighted count of Sins produced by active identities)
  const squadSinSupply: Record<SinType, number> = {
    Wrath: 0,
    Lust: 0,
    Sloth: 0,
    Gluttony: 0,
    Gloom: 0,
    Pride: 0,
    Envy: 0
  };

  activeIdentities.forEach(id => {
    if (id.skills) {
      id.skills.forEach(sk => {
        if (squadSinSupply[sk.sin] !== undefined) {
          squadSinSupply[sk.sin] += (sk.tier === 1 ? 3 : sk.tier === 2 ? 2 : 1);
        }
      });
    }
  });

  const riskOrder: RiskTier[] = ['ZAYIN', 'TETH', 'HE', 'WAW', 'ALEPH'];
  const recommendedEgos: Record<number, Ego[]> = {};

  sinners.forEach(sinner => {
    // Filter available E.G.Os for this sinner
    let availableEgos = allEgos.filter(e => e.sinnerId === sinner.id);
    if (onlyOwned && ownedEgoIds && ownedEgoIds.size > 0) {
      availableEgos = availableEgos.filter(e => ownedEgoIds.has(e.id));
    }

    const defaultZayin = getDefaultZayinEgo(sinner.id);
    const equipped: Ego[] = defaultZayin ? [defaultZayin] : [];

    // For higher risk tiers (or alternative ZAYIN if base not present), pick best E.G.O
    riskOrder.forEach(tier => {
      if (tier === 'ZAYIN' && defaultZayin) {
        return; // Mandatory base ZAYIN is already equipped
      }
      const candidates = availableEgos.filter(e => e.riskTier === tier);
      if (candidates.length === 0) return;

      // Score each E.G.O based on how well squadSinSupply covers its cost
      const scoredCandidates = candidates.map(ego => {
        let score = 0;
        // Risk tier base weight
        if (tier === 'WAW') score += 4;
        else if (tier === 'HE') score += 3;
        else if (tier === 'TETH') score += 2;
        else if (tier === 'ZAYIN') score += 1;

        let missingCount = 0;

        // Check sin coverage
        ego.cost.forEach(cost => {
          const supply = squadSinSupply[cost.sin] || 0;
          if (supply > 0) {
            score += Math.min(5, supply) * 2;
          } else {
            missingCount += 1;
            score -= 100; // Heavy penalty for missing Sin resources
          }
        });

        return { ego, score, missingCount };
      }).sort((a, b) => b.score - a.score);

      if (scoredCandidates.length > 0) {
        const top = scoredCandidates[0];
        // Only equip higher tier E.G.O if it has 0 missing sins
        if (top.missingCount === 0) {
          equipped.push(top.ego);
        }
      }
    });

    recommendedEgos[sinner.id] = equipped;
  });

  return recommendedEgos;
}

function scoreIdentity(
  identity: Identity,
  targetKeyword: KeywordType | 'Mixed',
  alreadySelectedKeywords: KeywordType[],
  ownedEgoIds?: Set<string>,
  accumulatedSinSupply?: Record<SinType, number>,
  targetSinQuota?: Record<SinType, number>
): number {
  let score = 0;

  if (targetKeyword !== 'Mixed') {
    // Primary keyword match
    if (identity.keywords.length > 0 && identity.keywords[0] === targetKeyword) {
      score += 5;
    }
    // Secondary keyword match
    if (identity.keywords.includes(targetKeyword)) {
      score += 3;
    }
  } else {
    // Mixed mode: bonus for having multiple keywords
    score += identity.keywords.length * 1.5;
  }

  // Synergy bonus: shared keywords with already-selected identities
  identity.keywords.forEach(kw => {
    const synCount = alreadySelectedKeywords.filter(k => k === kw).length;
    score += synCount * 0.8;
  });

  // E.G.O Sin resource matching & Missing Sin Fill bonus
  if (identity.skills) {
    const egos = getEgos();
    const sinnerEgos = egos.filter(e => e.sinnerId === identity.sinnerId && (!ownedEgoIds || ownedEgoIds.has(e.id)));
    const neededSins = new Set<SinType>();
    sinnerEgos.forEach(e => e.cost.forEach(c => neededSins.add(c.sin)));

    identity.skills.forEach(skill => {
      if (neededSins.has(skill.sin)) {
        score += 1.2; // Bonus for producing sin required by sinner's E.G.Os
      }

      // Dynamic Team Sin Quota bonus if accumulated supply is tracked
      if (accumulatedSinSupply && targetSinQuota && targetSinQuota[skill.sin] > 0) {
        const currentSupply = accumulatedSinSupply[skill.sin] || 0;
        if (currentSupply === 0) {
          score += 4.0; // High bonus for filling a missing Sin required by team E.G.Os
        } else if (currentSupply < targetSinQuota[skill.sin]) {
          score += 2.0; // Medium bonus for filling a Sin deficit
        }
      }
    });
  }

  // Rarity bonus
  score += identity.rarity * 0.5;

  return score;
}

export function recommendParty(options: RecommendOptions): RecommendedParty {
  const { targetKeyword, activeSlots, supportSlots, onlyOwned, ownedIds, ownedEgoIds } = options;
  const sinners = getSinners();
  const allIds = getIdentities();
  const egos = getEgos();

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

  // Track team accumulated Sin supply
  const accumulatedSinSupply: Record<SinType, number> = {
    Wrath: 0, Lust: 0, Sloth: 0, Gluttony: 0, Gloom: 0, Pride: 0, Envy: 0
  };

  const alreadySelectedKeywords: KeywordType[] = [];
  const selectedForActive: { sinnerId: number; identity: Identity }[] = [];
  const selectedForSupport: { sinnerId: number; identity: Identity }[] = [];
  const unselected: number[] = [];

  const assignedSinners = new Set<number>();

  // Pass 1: Select Active Slots with Dynamic Sin Quota Tracking
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
      alreadySelectedKeywords.push(...pick.identity.keywords);

      // Accumulate Sin supply from this identity's skills
      if (pick.identity.skills) {
        pick.identity.skills.forEach(sk => {
          if (accumulatedSinSupply[sk.sin] !== undefined) {
            accumulatedSinSupply[sk.sin] += (sk.tier === 1 ? 3 : sk.tier === 2 ? 2 : 1);
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
          score: scoreIdentity(identity, targetKeyword, alreadySelectedKeywords, ownedEgoIds)
        })).sort((a, b) => b.score - a.score)[0];

        assignedSinners.add(sinner.id);
        selectedForSupport.push({ sinnerId: sinner.id, identity: top.identity });
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

  const activeIdentitiesList = selectedForActive.map(sa => sa.identity);
  const recommendedEgosMap = recommendEgosForParty(activeIdentitiesList, onlyOwned, ownedEgoIds);

  return { active, support, unselected, egos: recommendedEgosMap };
}
