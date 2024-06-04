export function timestampDiff(timestamp: number, unitOfTime: 'hour' | 'minute' | 'second' | 'millisecond'): number {
  const now = new Date();
  const dateToCheck = new Date(timestamp);

  let msInInterval: number;
  switch (unitOfTime) {
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

  return (now.getTime() - dateToCheck.getTime()) / msInInterval;
}
