import moment from 'moment'
import { dateUtils, getDay } from '../../Common/Utils/common'
import { emotionCheck, emotionTrackerRepository } from '../Entities'
import { emotionList } from '../Entities/types'

export async function sample() {
  //general check statis
  await emotionTrackerRepository.empty()
  let startTime = getDay(moment(new Date()).add(-1, 'years').toDate())
  const emotionChecks = [] as Array<emotionCheck>
  while (dateUtils.dateLesser(startTime, new Date(), 1)) {
    const emotion =
      emotionList[randomIntFromInterval(1, emotionList.length - 1)]
    emotionChecks.push({
      ...new emotionCheck(),
      created_date: moment(startTime).toDate().getTime(),
      day: startTime,
      status: emotion, //good
      description: 'emotion _ ' + startTime,
    })
    emotionChecks.push({
      ...new emotionCheck(),
      created_date: moment(startTime).add(1, 'hour').toDate().getTime(),
      day: startTime,
      status: emotionList[randomIntFromInterval(1, emotionList.length - 1)], //good
      description: 'emotion _ ' + startTime,
    })
    emotionChecks.push({
      ...new emotionCheck(),
      created_date: moment(startTime).add(2, 'hour').toDate().getTime(),
      day: startTime,
      status: emotionList[randomIntFromInterval(1, emotionList.length - 1)], //good
      description: 'emotion _ ' + startTime,
    })
    startTime = moment(startTime).add(1, 'days').toDate()
  }

  await emotionTrackerRepository.adds(emotionChecks)
  await emotionTrackerRepository.save()
}

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}
