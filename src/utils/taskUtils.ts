import moment from 'moment';

export enum TaskFrequency {
  ONCE = 'once',
  DAILY = 'daily',
  WEEKDAYS = 'weekdays',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom'
}

export interface IHistory {
  date: Date;
  completed: boolean;
}

export interface ITask {
  dueDate: string;
  frequency?: TaskFrequency;
  scheduledDays?: number[];
  customSchedule?: Date[];
  history?: IHistory[];
  scheduledDate?: number
}

/**
 * Get the next scheduled date for the task.
 */
export function getNextScheduledDate(task: ITask): Date | null {
  const completedHistory = task.history?.filter((h) => h.completed) || [];

  const lastCompletedDate =
    completedHistory.length > 0
      ? moment(completedHistory[completedHistory.length - 1].date)
      : moment(task.dueDate);

  const nextDate = lastCompletedDate.clone();

  switch (task?.frequency) {
    case TaskFrequency.DAILY:
      nextDate.add(1, 'days');
      break;

    case TaskFrequency.WEEKLY:
      nextDate.add(1, 'weeks');
      break;

    case TaskFrequency.MONTHLY:
      // Get the selected day from the task's scheduledDate
      const selectedDay = task.scheduledDate || 1; // Default to 1st if not specified
      nextDate.add(1, 'months');
      nextDate.date(selectedDay);

      // Ensure we don't go past the end of the month
      if (nextDate.date() !== selectedDay) {
        nextDate.endOf('month');
      }
      break;

    case TaskFrequency.WEEKDAYS:
      if (task.scheduledDays && task.scheduledDays.length > 0) {
        do {
          nextDate.add(1, 'days');
        } while (!task.scheduledDays.includes(nextDate.day()));
      } else {
        nextDate.add(1, 'days');
      }
      break;

    case TaskFrequency.CUSTOM:
      // For CUSTOM frequency, move to the next day after the last completed date
      nextDate.add(1, 'days'); // Add one day after completion

      if (task.customSchedule && task.customSchedule.length > 0) {
        // Assuming the customSchedule is an array of dates
        const startDate = moment(task.customSchedule[0]); // First date is the start date
        const endDate = moment(
          task.customSchedule[task.customSchedule.length - 1]
        ); // Last date is the end date

        // Check if the next date is within the custom schedule's range
        if (nextDate.isBetween(startDate, endDate, null, '[]')) {
          return nextDate.toDate();
        } else {
          // If nextDate is out of range, return the start date if no valid date found
          return startDate.isAfter(lastCompletedDate)
            ? startDate.toDate()
            : null;
        }
      }
      break;

    case TaskFrequency.ONCE:
    default:
      return null;
  }

  return nextDate.toDate();
}
