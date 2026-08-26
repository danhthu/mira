import { from } from 'linq-to-typescript';
import moment from 'moment';
import { sortBy } from 'sort-by-typescript';
import { dateGreater, dateLesser, dateUtils, getDay } from '../../Common/Utils/common';
import { habitTrackerRepository } from '../../HabitTracker/Entities';
import { workRepository } from '../../Work/Entities';
import { dailyActivityRepository, timeCatRepository, timeDataRepository } from '../Entities/repositories';
import { TimeCat } from '../Entities/TimeCat';
import { TimeData } from '../Entities/TimeData';

//cats: working, personal, family, relationship, waste, sleep & relax
export async function getCats(startDate, endDate): Promise<Array<TimeCat>> {
  const data = await timeDataRepository.filter(d => dateGreater(d.day, startDate) && dateLesser(d.day, endDate));
  const r = (await timeCatRepository.list()).map(cat => ({
    ...cat,
    value: data.filter(d => d.catId == cat.id).map(d => parseFloat('' + (d.minut || 5))).reduce((acc, curr) => acc + curr, 0),
    total: data.filter(d => d.catId == cat.id).length

  }));
  return r;
}
//
export async function getActivityInDay(day: Date): Promise<Array<TimeCat>> {
  return getCats(moment(day).add(-1, 'days').toDate(), moment(day).add(1, 'days').toDate());
}
export async function getActivityInDays(startDate, endDate): Promise<Array<{ day: string, data: Array<TimeCat> }>> {
  const data = (await timeDataRepository.filter(d => dateGreater(d.day, startDate) && dateLesser(d.day, endDate))
  ).sort(sortBy('-day'));
  //
  const cats = await timeCatRepository.list();
  return from(data).groupBy(d => moment(d.day).format('DD-MM-YYYY')).toArray()
    .map(g => ({
      day: g.key,
      data: cats.map(c => ({
        ...c,
        total: g.where(k => k.catId == c.id).count(),
        day: moment(g.key, 'DD-MM-YYYY').toDate(),
        value: g.where(k => k.catId == c.id).select(k => k.minut || 5).sum()
      }))
        .filter(c => c.total > 0 || c.value > 0)
    }));
}
export async function getCatDetails(startDate, endDate): Promise<Array<{ value, label, cat, day }>> {
  const data = await timeDataRepository.filter(d => dateGreater(d.day, startDate) && dateLesser(d.day, endDate));
  const cats = await timeCatRepository.list();
  return data.map(d => ({ day: d.day, value: d.minut, label: d.label, cat: cats.findLast(c => c.id == d.catId).label, catInfo: cats.findLast(c => c.id == d.catId) }));
}

export async function calc(startDate, endDate) {
  //console.log('call init....')
  await timeDataRepository.empty();
  const _called = await timeDataRepository.filter(d => dateGreater(d.day, startDate) && dateLesser(d.day, endDate));
  //add activitity
  const dailyActivities = await dailyActivityRepository.list();


  for (let s = getDay(startDate); dateUtils.dateLesser(s, endDate); s = moment(s).add(1, 'days').toDate()) {
    await Promise.all(dailyActivities.map(async da => {
      const entry = _called.findLast(d => d.refTable == 'DailyActivity' && d.refId == da.id && dateUtils.dateEqual(s, d.day));
      if (!entry) {
        await timeDataRepository.add({
          ...new TimeData,
          catId: da.timeCatId, day: getDay(s),
          label: da.name,
          minut: da.did,
          refId: da.id,
          refTable: 'DailyActivity',
        });
      }
    }));
  }


  const workData = await workRepository.filter(w => dateGreater(w.startDate, startDate) && dateLesser(w.endDate, endDate));

  await Promise.all(workData.map(async w => {
    if (!_called.findLast(d => d.refTable == 'Work' && d.refId == w.id)) {
      await timeDataRepository.add({
        ...new TimeData, catId: w.timeCatId, day: getDay(w.startDate),
        label: w.name,
        minut: w.did || w.estimated,
        refId: w.id,
        refTable: 'Work',
      });
    }
  }));
  //Personal  Personal
  const habitData = await habitTrackerRepository.filter(h => dateGreater(new Date(h.day), startDate) && dateLesser(new Date(h.day), endDate));
  await Promise.all(habitData.map(async h => {
    if (!_called.findLast(d => d.refTable == 'HabitTracker' && d.refId == h.id)) {
      await timeDataRepository.add({
        ...new TimeData, catId: h.timeCatId, day: getDay(new Date(h.day)),
        label: h.label,
        minut: h.did,
        refId: h.id,
        refTable: 'HabitTracker',
      });
    }
  }));
  await timeDataRepository.save();
}
