export type SinType = 'Wrath' | 'Lust' | 'Sloth' | 'Gluttony' | 'Gloom' | 'Pride' | 'Envy';
export type AttackType = 'Slash' | 'Pierce' | 'Blunt';
export type KeywordType = 'Burn' | 'Bleed' | 'Tremor' | 'Rupture' | 'Sinking' | 'Poise' | 'Charge';
export type Rarity = 1 | 2 | 3;

export interface Sinner {
  id: number;
  name: string;
  codeName: string;
  avatarUrl?: string;
  themeColor: string;
}

export interface Skill {
  name: string;
  tier: 1 | 2 | 3; // S1, S2, S3
  sin: SinType;
  attackType: AttackType;
  basePower?: number;
  coinCount?: number;
  coinPower?: number;
}

export interface Identity {
  id: string;
  slug: string;
  name: string;
  sinner: string; // e.g. "Hong Lu"
  sinnerId: number; // 1-12
  rarity: Rarity;
  keywords: KeywordType[];
  skills?: Skill[];
  hp?: number;
  speedRange?: [number, number];
  defenseType?: 'Guard' | 'Evade' | 'Counter';
  season?: string;
  imageUrl?: string;
}

export interface KeywordInfo {
  id: KeywordType;
  name: string;
  nameKr: string;
  color: string;
  icon: string;
  description: string;
}

export interface PartySlot {
  sinnerId: number;
  sinnerName: string;
  identity?: Identity;
  isBench?: boolean;
}

export interface PartyComposition {
  name: string;
  slots: Record<number, Identity | null>; // sinnerId -> Identity
}

export type RiskTier = 'ZAYIN' | 'TETH' | 'HE' | 'WAW' | 'ALEPH';

export interface EgoCost {
  sin: SinType;
  count: number;
}

export interface Ego {
  id: string;
  slug: string;
  name: string;
  sinner: string;
  sinnerId: number;
  riskTier: RiskTier;
  cost: EgoCost[];
  imageUrl?: string;
}

