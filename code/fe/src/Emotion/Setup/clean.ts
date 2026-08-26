import { emotionTrackerRepository,  wishRepository } from '../Entities';

export  async function clean(){
  await wishRepository.empty();
  await emotionTrackerRepository.empty();
}