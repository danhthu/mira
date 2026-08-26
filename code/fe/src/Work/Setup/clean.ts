import { workRepository } from '../Entities';

export async function clean() {
  await workRepository.empty();
}