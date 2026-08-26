import { sample as time_sample } from '../src/TimeTracker/Setup/sample';
import { sample as work_sample } from '../src/Work/Setup/sample';
import { sample as habit_sample } from '../src/HabitTracker/Setup/sample';

import { sample as emotion_sample } from '../src/Emotion/Setup/sample';
import { sample as goal_sample } from '../src/Goal/Setup/sample';
import { sample  as challenge_sample } from '../src/Challenger/Setup/sample';
import { sample as common_sample } from '../src/Common/Setup/sample';

export async function sample() {
  await time_sample();
  await work_sample();
  await habit_sample();
  await common_sample();
  await goal_sample();
  await emotion_sample();
  await challenge_sample();
}