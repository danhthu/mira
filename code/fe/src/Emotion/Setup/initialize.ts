import { wish, wishRepository } from '../Entities';

export async function initialize() {
  const data = ['Every day is a new chance to make a difference'];
  await wishRepository.empty();
  await wishRepository.adds(data.map(d => ({ ...new wish, text: d })));
  await wishRepository.save();


}