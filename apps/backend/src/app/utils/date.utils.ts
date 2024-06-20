export function diffInUnitOfTime(now: number, then: number = new Date().getTime(), unitOfTime: 'day' | 'hour' | 'minute' | 'second' | 'millisecond' = 'millisecond'): number {
  let msInInterval: number;
  switch (unitOfTime) {
    case 'day':
      msInInterval = 1000 * 60 * 60 * 24;
      break;
    case 'hour':
      msInInterval = 1000 * 60 * 60;
      break;
    case 'minute':
      msInInterval = 1000 * 60;
      break;
    case 'second':
      msInInterval = 1000;
      break;
    case 'millisecond':
      msInInterval = 1;
      break;
    default:
      throw new Error('Invalid unit of time');
  }

  return Math.floor((then - now) / msInInterval);
}
