import { getRepository } from '../../Common/Repositories';
import { Habit } from './Habit';
import { habitRepository, habitTrackerRepository } from './habitRepository';
import { HabitTemplate } from './Template';
import { HabitTracker } from './Tracker';

export const habitTemplateRepository = getRepository<HabitTemplate>(
  'habitTemplate',
);
export {
  Habit,
  habitRepository,
  HabitTemplate,
  HabitTracker,
  habitTrackerRepository
};

