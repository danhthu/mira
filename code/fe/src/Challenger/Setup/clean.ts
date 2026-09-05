import { challengeAssociateRepository, challengeRepository } from '../Entities';

/** Xoá sạch kho cục bộ của module (cài lại app / dựng lại dữ liệu). */
export async function clean() {
  await challengeRepository.empty();
  await challengeAssociateRepository.empty();
}
