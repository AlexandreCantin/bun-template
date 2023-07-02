import dayjs from "dayjs";

export function addDaysToToday(daysToAdd: number): Date {
  return dayjs().add(daysToAdd, "day").toDate();
}
export function isAfterNow(date: string | Date): boolean {
  return dayjs(date).isAfter(dayjs());
}
