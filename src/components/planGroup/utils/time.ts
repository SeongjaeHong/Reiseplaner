import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

export const getSchedule = (schedule: DateRange | undefined) => {
  const startDay = schedule?.from
    ? format(schedule.from, 'dd. MMM. yyyy')
    : null;
  const endDay = schedule?.to ? format(schedule.to, 'dd. MMM. yyyy') : null;
  const scheduleText = startDay
    ? startDay === endDay
      ? startDay
      : `${startDay} - ${endDay}`
    : 'Datum hinzufügen';

  return scheduleText;
};
