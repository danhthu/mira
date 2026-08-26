import moment from 'moment';
import { getDay } from '../../Common/Utils/common';
import { Work, workRepository } from '../Entities';

export async function sample() {
  console.log('init work sample');
  let startDate = moment(getDay(new Date())).add(-1, 'years').toDate();
  const endDate = getDay(new Date());
  const data = [] as Work[];
  await workRepository.empty();
  while (startDate.getTime() < endDate.getTime()) {
    startDate = moment(startDate).add(1, 'days').toDate();
    const rand = randomIntFromInterval(4, 10);
    for (let i = 0; i < rand; i++) {
      data.push({
        ...new Work, name: 'Working ' + (i + moment(endDate).diff(startDate, 'days')),
        mandatory: randomIntFromInterval(0, 1) == 1,
        created_date: startDate.getTime(),
        startDate: startDate,
        finishDate: endDate,
        endDate: moment(startDate).add(2, 'days').toDate(),
        focus: randomIntFromInterval(0, 1) == 1,
        status: 'DONE',
        timeCatId: 'Working',
        did: 45
      });
    }
  }

  await workRepository.adds(data);
  await workRepository.save();
  console.log('init work complete');
}

function randomIntFromInterval(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}