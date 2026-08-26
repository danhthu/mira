import { clean as time_clean } from '../src/TimeTracker/Setup/clean';
import { clean as work_clean } from '../src/Work/Setup/clean';
import { clean as habit_clean } from '../src/HabitTracker/Setup/clean';
import { clean as emotion_clean } from '../src/Emotion/Setup/clean';
import { clean as goal_clean } from '../src/Goal/Setup/clean';
import { clean  as challenge_clean } from '../src/Challenger/Setup/clean';
import { clean as common_clean } from '../src/Common/Setup/clean';
export async function clean() {
  await time_clean();
  await work_clean();
  await habit_clean();
  await emotion_clean();
  await goal_clean();
  await challenge_clean();
  await common_clean();
}