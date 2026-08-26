import moment from 'moment';
import * as Repo from '../../Common/Repositories';
import { dateEqual, getDay, uuid } from '../../Common/Utils/common';
import { Work } from './Work';


class Repository extends Repo.Repository<Work> {

  public getListByDate = async (date: Date): Promise<Work[]> => {
    const list = await workRepository.filter(
      (h) => h.ref == null && h.created_date <= date.getTime() + 3600 * 60000
    );
    const result = [
      ...list.filter((h) => dateEqual(h.startDate, date)),
    ];

    //tính repeat
    list
      .filter((h) => !dateEqual(h.startDate, date))
      .forEach((h) => {
        if (result.indexOf(h) > -1) return;
        if (h.repeatOption && h.repeatOption.enable) {
          // console.log(h)
          if (h.repeatOption.kind == 'daily') {
            const startDate = moment(getDay(new Date(h.created_date)));
            const diffDays = moment(date).diff(startDate, 'days');

            if (
              diffDays % h.repeatOption.repeat === 0 &&
              result.indexOf(h) === -1
            ) {
              this.add({ ...h, id: uuid(), ref: h.id });
              result.push(h);
            }
          }
          if (h.repeatOption.kind == 'weekly') {
            const startDate = moment(getDay(new Date(h.created_date)));
            const diffDays = moment(date).diff(startDate, 'weeks');
            let chk =
              diffDays % h.repeatOption.repeat === 0 && result.indexOf(h) === -1;
            chk =
              chk &&
              h.repeatOption.dayOfWeek.includes(moment(date).isoWeekday());
            if (chk) {
              this.add({ ...h, id: uuid(), ref: h.id });
              result.push(h);
            }
          }

          if (h.repeatOption.kind == 'monthly') {
            const startDate = moment(getDay(new Date(h.created_date)));
            const diffDays = moment(date).diff(startDate, 'months');
            let chk =
              diffDays % h.repeatOption.repeat === 0 && result.indexOf(h) === -1;
            chk = chk && h.repeatOption.days.includes(moment(date).date());
            if (chk) {
              this.add({ ...h, id: uuid(), ref: h.id });
              result.push(h);
            }
            // Check if the day of the month matches
            //if (repeatOptions.days && repeatOptions.days.length > 0) {
            //   return repeatOptions.days.includes(providedDate.date());
            // }
          }
        }
      });
    const kk = result.filter(
      (h) => !h.deleted || !h.deleted_date || h.deleted_date > getDay(date).getTime(),
    );
    //auto insert
    this.save(true);
    return result;

  };


  public getUnPlanned = async (day: Date) => {
    const all = (await this.list());
    const result = all.filter(w => {
      return w.status != 'DONE' && getDay(w.startDate).getTime() != getDay(day).getTime();
    });
    return result;
  };

  public getTaskByDate = async (day: Date) => {
    const all = (await this.list()).filter(w => getDay(w.startDate).getTime() == getDay(day).getTime());
    return {
      mandatory: all.filter(w => w.mandatory).length,
      total: all.length
    };
  };

  public done = async (work: Work) => {
    await this.update(w => w.id == work.id, w => w.status = 'DONE');
    await this.save();
  };

  public doing = async (work: Work) => {
    const tmp = await (await this.getListByDate(work.startDate)).filter(w => w.status == 'DOING');
    await this.update(w => tmp.map(t => t.id).indexOf(w.id) > -1, w => w.status = 'PAUSE');
    await this.update(w => w.id == work.id, w => w.status = 'DOING');
    await this.save();
  };
  public pause = async (work: Work) => {
    await this.update(w => w.id == work.id, w => w.status = 'PAUSE');
    await this.save();
  };


  public unDone = async (work: Work) => {
    await this.update(w => w.id == work.id, w => w.status = 'PLAN');
    await this.save();
  };

  public setDayWillDo = async (work: Work, day: Date) => {
    day.setHours(0, 0, 0, 0);
    await this.update(w => w.id == work.id, w => w.startDate = day);
    await this.save();
  };


  public getRootGroups = async (): Promise<Array<Work>> => {
    const unTitledGroup = { ...new Work, id: 'untitled', name: 'Untitled', kind: 'group' } as Work;
    const roots = await this.filter(w => w.kind == 'group' && !w.workRef);
    const hasUnTitled = await this.filter(w => w.kind == 'todo' && !w.workRef);
    if (hasUnTitled.length == 0) return roots;
    return [...roots, unTitledGroup];
  };

  public getChildren = async (groupId: string): Promise<Array<Work>> => {
    if (groupId == 'untitled') return await this.filter(w => w.kind == 'todo' && !w.workRef);
    return await this.filter(w => w.kind == 'todo' && w.workRef == groupId);;
  };
  public getChildrenCounts = async (groupId: string): Promise<{ done: number, total: number }> => {
    const all = (await this.filter(w => w.kind == 'todo' && w.workRef == groupId));
    return { done: all.filter(w => w.status == 'DONE').length, total: all.length };


  };
}

class TodoRepository extends Repository {

}

export const workRepository = new Repository('work');
export const todoRepository = new Repository('todo');




