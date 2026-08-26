import moment from 'moment'
import * as paper from 'react-native-paper'
import { sortBy } from 'sort-by-typescript'
import { getLogger } from '../src/Common'
import { dateEqual } from '../src/Common/Utils/common'
import { getDay } from './dateUtils'



export const Libs = {
  ...paper,
  Alert: (msg: string, callback?: CallableFunction) => { },
}

/**
 * ECMA2015
 */


export const getSegmentsFor = (data: Array<{ day: number }>): Array<{ startDay, endDay }> => {
  let logger = getLogger("getSegmentsFor")
  data.sort(sortBy("day"))
  var startDay = data.length > 0 ? getDay(new Date(data[0].day)).getTime() : 0
  var endDay = startDay
  const segments = []
  // 5/24; 6/25
  //

  for (var i = 1; i < data.length - 1; i++) {
    if (dateEqual(new Date(data[i + 1].day), new Date(data[i].day), 1)) {
      endDay = data[i + 1].day
    } else {
      segments.push({ startDay, endDay })
      startDay = data[i + 1].day
      endDay = startDay
    }
  }
  if (endDay != startDay) {
    segments.push({ startDay, endDay })
  }
  if (endDay == startDay && startDay > 0) {
    segments.push({ startDay, endDay: startDay })
  }
  return segments
}

function printSegment(p) {
  console.log(p)
  return moment(new Date(p.startDay)).format("DD/MM") + " - " + moment(new Date(p.endDay)).format("DD/MM")
}

