export type SpaceType = 'pair' | 'circle';

export interface Space {
  readonly id: string;
  readonly type: SpaceType;
  readonly name: string;
  readonly memberIds: string[];
  readonly sharedModules: string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}
