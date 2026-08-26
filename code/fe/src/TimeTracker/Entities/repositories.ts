import { Repo } from '../../Common/Entities';
import { DailyActivity } from './DailyActivity';
import { TimeCat } from './TimeCat';
import { TimeData } from './TimeData';

class TimeDataRepository extends Repo.Repository<TimeData> {

}
class TimeCatRepository  extends Repo.Repository<TimeCat> {

}

class ActivitityRepository  extends Repo.Repository<DailyActivity> {

}
export const timeDataRepository = new TimeDataRepository('TimeData');
export const timeCatRepository = new TimeCatRepository('TimeCat');
export const dailyActivityRepository = new ActivitityRepository('DailyActivity');
