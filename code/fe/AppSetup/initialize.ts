import { initialize as time_init } from '../src/TimeTracker/Setup/initialize';
import { initialize as work_init } from '../src/Work/Setup/initialize';
import { initialize as habit_init } from '../src/HabitTracker/Setup/initialize';

import { initialize as goal_init } from '../src/Goal/Setup/initialize';
import { initialize as common_init } from '../src/Common/Setup/initialize';

export async function initialize() {
  await time_init();
  await work_init();
  await habit_init();
  await goal_init();
  await common_init();
}