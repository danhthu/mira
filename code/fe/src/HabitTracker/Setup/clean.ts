import { habitRepository, habitTemplateRepository, habitTrackerRepository } from '../Entities';

export  async function clean(){
  await habitRepository.empty();
  await habitTrackerRepository.empty();
  await habitTemplateRepository.empty();
}