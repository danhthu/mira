import { dailyActivityRepository, timeCatRepository, timeDataRepository } from '../Entities/repositories';

export  async function clean(){
  await dailyActivityRepository.empty();
  await timeCatRepository.empty();
  await timeDataRepository.empty();
}