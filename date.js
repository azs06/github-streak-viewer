// helpers.js
import { format } from 'date-fns';
import { utcToZonedTime } from '@date-fns/tz';

export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    month: "short",
    day: "numeric",
  };
  const optionToUse = Object.assign({}, defaultOptions, options);
  return new Date(date)?.toLocaleDateString("en-US", optionToUse);
};

export const formatDateZ = (date, formatStr = 'MMM dd', timeZone = 'UTC') => {
  const zonedDate = utcToZonedTime(date, timeZone);
  return format(zonedDate, formatStr);
};