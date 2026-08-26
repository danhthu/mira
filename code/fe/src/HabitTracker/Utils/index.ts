import moment from 'moment'
import { sortBy } from 'sort-by-typescript'
import { repeatOption } from '../../../common/interface'
import { Habit, habitTrackerRepository } from '../Entities'

function distanceTwoHabit(habit: Habit): number {
  return !habit.repeatOption
    ? 1
    : habit.repeatOption.repeat *
        (habit.repeatOption.kind == 'daily'
          ? 1
          : habit.repeatOption.kind == 'weekly'
          ? 7
          : 30)
}

async function isStability(habit: Habit): Promise<boolean> {
  //80% complete > 21 times last.
  //1. xác định khoảng cách giữa 2 habit
  //2. ước lượng thời gian đạt 21 lần
  //3. giá trị thời gian > (2)*1.5
  const trackers = (
    await habitTrackerRepository.filter((ht) => ht.hid == habit.id)
  )
    .sort(sortBy('-day'))
    .slice(0, 21)
  if (trackers.length < 21) return false
  if (
    moment(new Date(trackers[0].day)).diff(
      moment(new Date(trackers[trackers.length - 1].day)),
      'days',
    ) <
    distanceTwoHabit(habit) * 21 * 1.5
  ) {
    return true
  }
  return false
}

export const filterStability = (data: Habit[]) => {
  return data.filter(isStability)
}

export const filterBuild = (data: Habit[]) => {
  return data.filter((h) => !isStability(h))
}

export const repeateToString = (repeat: repeatOption) => {
  if (!repeat || !repeat.enable) return ''
  if (repeat.kind == 'daily') return 'Everyday'
  if (repeat.kind == 'weekly') return repeat.dayOfWeek.length + ' days per week'
  if (repeat.kind == 'monthly') return repeat.days.length + ' days per week'
}
