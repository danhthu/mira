export interface Item {
  readonly id: string;
  readonly name: string;
  readonly price: number | null;
  readonly purchasedAt: string | null;
  readonly useCount: number;
  readonly releasedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}
