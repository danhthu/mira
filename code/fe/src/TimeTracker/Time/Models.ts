
import { useAsyncAction, useDectectDataChanged } from '../Common/Hooks';
import { habitRepository } from '../HabitTracker/Entities';
import { timeSegmentRepository } from './Entities';

export const useTextDaily = ()=> 'Wake up with determination, go to bed with satisfaction.';

export const useStatistic=()=>{
  const totals = {
    working: 5 * 7,
    healthy: 2 * 7,
    personal: 1 * 7,
    waste: 2 * 7,
    rest: 8 * 7,
    total: 0
  };
  totals.total =
        totals.working +
        totals.healthy +
        totals.personal +
        totals.waste +
        totals.rest;
  return totals;
};

export const useDailyTimeLine=():Array<{time:number, title:string,descritpion:string,status:string,duration:number}>=>{
  const deps = [useDectectDataChanged(habitRepository), useDectectDataChanged(timeSegmentRepository)];
  return useAsyncAction(async () => {
    const startTime = Math.floor(new Date().getTime() / 1000); // Lấy thời gian hiện tại ở định dạng Unix
    const hourInSeconds = 3600; // 1 giờ = 3600 giây
    
    const timelineObjects = [];

    for (let i = 0; i < 10; i++) {
      const currentTime = startTime + i * hourInSeconds;
      const timelineObject = {
        status: i % 3 == 0 ? 'PLAN' : i % 2 === 0 ? 'DOING' : 'DONE', // Chia lẻ để thay đổi trạng thái
        title: `Task ${i + 1}`,
        description: `Description for Task ${i + 1}`,
        time: currentTime * 1000,
        duration: hourInSeconds,
      };

      timelineObjects.push(timelineObject);
    }

    const mapStatus = { DONE: 2, DOING: 0, PLAN: 1 };
    timelineObjects.sort(
      (t1, t2) => mapStatus[t1.status] - mapStatus[t2.status],
    );
    timelineObjects.sort((t1, t2) =>
      mapStatus[t1.status] == mapStatus[t2.status]
        ? t2.time - t1.time
        : mapStatus[t1.status] - mapStatus[t2.status],
    );
    return timelineObjects;
  }, deps);
}; 