import { from } from 'linq-to-typescript'
import moment from 'moment'
import { sortBy } from 'sort-by-typescript'
import { Repository } from '../../Common/Repositories'
import { getDay } from '../../Common/Utils/common'
import { emotionCheck } from './emotionCheck'
import { emotionList } from './types'

class EmotionTrackerRepository extends Repository<emotionCheck> {
  public groupByDate = async (): Promise<Record<string, emotionCheck>> => {
    try {
      const data = from(await this.list())
        .groupBy((e) =>
          moment(getDay(new Date(e.day)))
            .toDate()
            .toISOString(),
        )
        .select((g) => ({
          key: g.key,
          status: g.orderByDescending((k) => k.created_date).first(),
        }))
        .toArray()
        .reduce((acc, group) => {
          acc[group.key] = group.status
          return acc
        }, {} as Record<string, emotionCheck>)
      return data
    } catch (ex) {
      return {}
    }
  }
  public groupsByDate = async (): Promise<Record<string, emotionCheck[]>> => {
    try {
      const data = from(await this.list())
        .groupBy((e) =>
          moment(getDay(new Date(e.day)))
            .toDate()
            .toISOString(),
        )
        .select((g) => ({
          key: moment(g.key).toDate().getTime(),
          data: g.orderByDescending((k) => k.created_date),
        }))
        .toArray()
      data.sort(sortBy('-key'))
      const result = data.reduce((acc, group) => {
        acc[new Date(group.key).toISOString()] = [...group.data]
        return acc
      }, {} as Record<string, emotionCheck[]>)
      return result
    } catch (ex) {
      return {}
    }
  }

  public groupByStatus = async (
    range: '3m' | '6m' | '1y' | 'all' | string = '3m',
  ): Promise<Array<{ status: string; total: number }>> => {
    try {
      let lastDate =
        range == '3m'
          ? moment().add(-3, 'months')
          : range == '6m'
          ? moment().add(-6, 'months')
          : range == '1y'
          ? moment().add(-12, 'months')
          : moment().add(-10, 'years')
      const data = from(await this.list())
        .where((e) => moment(e.day).isAfter(lastDate))
        .groupBy((e) => e.status)
        .select((g) => ({
          status: g.key,
          total: g.count(),
        }))
        .orderByDescending((g) => g.total)
        .toArray()
        .filter((s) => s.status)
      //xu ly
      if (emotionList.length != data.length) {
        emotionList
          .filter((s) => data.filter((d) => d.status == s).length == 0)
          .forEach((item) => {
            data.push({ status: item, total: 0 })
          })
      }
      return data
    } catch (ex) {
      return emotionList.map((e) => ({
        status: e,
        total: 0,
      }))
    }
  }

  public groupByWeek = async (startWeek): Promise<Array<string>> => {
    const data = await this.groupByDate()
    return [
      data[moment(startWeek).startOf('day').toDate().toISOString()]?.status,
      data[
        moment(startWeek).add(1, 'days').startOf('day').toDate().toISOString()
      ]?.status,
      data[
        moment(startWeek).add(2, 'days').startOf('day').toDate().toISOString()
      ]?.status,
      data[
        moment(startWeek).add(3, 'days').startOf('day').toDate().toISOString()
      ]?.status,
      data[
        moment(startWeek).add(4, 'days').startOf('day').toDate().toISOString()
      ]?.status,
      data[
        moment(startWeek).add(5, 'days').startOf('day').toDate().toISOString()
      ]?.status,
      data[
        moment(startWeek).add(6, 'days').startOf('day').toDate().toISOString()
      ]?.status,
    ]
  }

  public getStatusByDate = async (date): Promise<string> => {
    return (await this.groupByDate())[
      moment(date).startOf('day').toDate().toISOString()
    ]?.status
  }

  public getEmotionByDate = async (date): Promise<emotionCheck> => {
    return (await this.groupByDate())[
      moment(date).startOf('day').toDate().toISOString()
    ]
  }
  public getEmotionsByDate = async (date): Promise<emotionCheck[]> => {
    return await this.filter((h) => moment(h.day).isSame(moment(date), 'day'))
  }
}

export const emotionTrackerRepository = new EmotionTrackerRepository(
  'emotionCheck',
)
