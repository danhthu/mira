import { Router } from '../../../Router';
import { getDay } from '../../Common/Utils/common';



export function OpenTimeUsedDetail(navigation, date: Date, cat: string) {
  Router.Open(navigation, 'TimeApp', { screen: 'TimeUsedDetail', catId: cat, day: getDay(date).getTime() });
}