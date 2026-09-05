import moment from 'moment';
import * as Repo from '../../Common/Repositories';
import { dateEqual, getDay } from '../../Common/Utils/common';
import { Work } from './Work';

/** Một bản ghi lặp có xuất hiện vào `date` hay không. */
function repeatsOn(work: Work, date: Date): boolean {
  const option = work.repeatOption;
  if (!option || !option.enable || option.repeat <= 0) return false;
  const startDate = moment(getDay(new Date(work.created_date)));
  if (option.kind == 'daily') {
    return moment(date).diff(startDate, 'days') % option.repeat === 0;
  }
  if (option.kind == 'weekly') {
    return (
      moment(date).diff(startDate, 'weeks') % option.repeat === 0 &&
      option.dayOfWeek.includes(moment(date).isoWeekday())
    );
  }
  if (option.kind == 'monthly') {
    return (
      moment(date).diff(startDate, 'months') % option.repeat === 0 &&
      option.days.includes(moment(date).date())
    );
  }
  return false;
}

class Repository extends Repo.Repository<Work> {
  /**
   * Danh sách việc của một ngày: việc đặt đúng ngày đó, cộng việc lặp rơi vào ngày đó.
   *
   * Đọc không ghi. Bản cũ gọi `this.add()` rồi `this.save()` ngay trong lúc đọc,
   * nên mỗi lần mở màn danh sách lại nhân thêm một bản sao của mọi việc lặp vào
   * kho; sau vài ngày kho phình lên và danh sách đầy bản trùng.
   */
  public getListByDate = async (date: Date): Promise<Work[]> => {
    const list = await this.filter(
      (h) =>
        h.ref == null &&
        h.kind != 'group' &&
        h.created_date <= date.getTime() + 3600 * 60000,
    );
    // `dateEqual(undefined, date)` coi `undefined` là "bây giờ", nên thiếu chốt
    // `h.startDate` thì mọi việc chưa xếp ngày đều hiện ở mọi ngày.
    const onDate = list.filter((h) => h.startDate && dateEqual(h.startDate, date));
    const repeated = list.filter(
      (h) => !(h.startDate && dateEqual(h.startDate, date)) && repeatsOn(h, date),
    );
    // Bản ghi bị xoá ở máy khác về qua đồng bộ mang cờ `deleted` chứ không biến
    // khỏi mảng, nên phải lọc ở đây — bản cũ tính rồi bỏ kết quả đi.
    return [...onDate, ...repeated].filter((h) => !h.deleted);
  };

  /** Việc chưa xong và chưa xếp vào ngày nào. */
  public getUnscheduled = async (): Promise<Work[]> => {
    return (await this.list()).filter((w) => w.status != 'DONE' && !w.startDate && w.kind != 'group');
  };

  public done = async (work: Work) => {
    await this.update((w) => w.id == work.id, (w) => (w.status = 'DONE'));
  };

  public unDone = async (work: Work) => {
    await this.update((w) => w.id == work.id, (w) => (w.status = 'PLAN'));
  };

  public setDayWillDo = async (work: Work, day: Date) => {
    const target = getDay(day);
    await this.update((w) => w.id == work.id, (w) => (w.startDate = target));
  };
}

export const workRepository = new Repository('work');
