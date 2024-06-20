export function diffInUnitOfTime(then: number, unitOfTime: 'day' | 'hour' | 'minute' | 'second' | 'millisecond' = 'millisecond'): number {
  const now = new Date().getTime();
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

  return Math.floor((now - then) / msInInterval);
}
