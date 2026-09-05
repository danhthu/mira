import moment from 'moment';
import 'react-native-get-random-values';
import { uuidv7 } from './uuidv7';

// Đổi v4 -> v7 ngày 2026-09-05 theo hợp đồng đồng bộ: id do client sinh phải sắp
// được theo thời gian. Id v4 đã lưu từ trước vẫn là chuỗi hợp lệ, server nhận TEXT.
export const uuid = () => uuidv7();
export const getDateFormat = (date: number) => {
  return new Date(date).toISOString();
};


export const getCurrentDay = (): Date => {
  return getDay(new Date());
};

export function getStartOfWeek(date: Date): Date {
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Điều chỉnh để đưa về Thứ Hai
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() + diff);
  return startOfWeek;
}


export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 là Chủ Nhật, 6 là Thứ Bảy
}


export function getNextWeekend(date: Date): Date {
  const day = date.getDay();
  const nextSaturday = new Date(date);
  nextSaturday.setDate(date.getDate() + (6 - day)); // Thứ Bảy tới

  if (day >= 6) {
    nextSaturday.setDate(nextSaturday.getDate() + 7); // Nếu đã là cuối tuần, chuyển tới tuần sau
  }

  return nextSaturday;
}


export const dateEqual = (from: Date, to: Date, addDay = 0) => {
  const _from = moment(from).toDate();
  _from.setHours(0, 0, 0, 0);
  const _to = moment(to).toDate();
  _to.setHours(0, 0, 0, 0);

  return getDay(_from).getTime() == getDay(_to).getTime() + addDay * 24 * 3600000;
};

export const dateLesser = (from: Date, to: Date, addDay = 0) => {
  return getDay(from).getTime() < getDay(to).getTime() + addDay * 24 * 3600000;
};

export const dateGreater = (from: Date, to: Date, addDay = 0) => {
  return getDay(from).getTime() > getDay(to).getTime() + addDay * 24 * 3600000;
};

export const getDay = (date: Date) => {
  const dd = date;
  dd.setHours(0, 0, 0, 0);
  return dd;
};

export const isToday = (date: Date) => {
  return dateEqual(new Date, date);
};

export const isYesterday = (date: Date) => {
  return dateEqual(new Date, date, -1);
};

export const dateUtils = {
  dateEqual, dateGreater, dateLesser, getDay, getCurrentDay, getNextWeekend, getStartOfWeek, isToday, isYesterday
};