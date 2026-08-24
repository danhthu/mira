export type LetterReaction = 'helpful' | 'neutral' | 'off';

export interface Letter {
  readonly id: string;
  readonly weekStart: string;
  readonly body: string;
  readonly userReaction: LetterReaction | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}
