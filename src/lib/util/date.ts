import {
	differenceInDays,
	differenceInHours,
	differenceInMinutes,
	differenceInMonths,
	differenceInWeeks,
} from 'date-fns';

/**
 * Get the difference between two dates in human-readable format
 * @param startDate the start date
 * @param endDate the end date
 */
export function getDateDifference(startDate: Date, endDate: Date): string {
	const minutes = differenceInMinutes(endDate, startDate);
	const hours = differenceInHours(endDate, startDate);
	const days = differenceInDays(endDate, startDate);
	const weeks = differenceInWeeks(endDate, startDate);
	const months = differenceInMonths(endDate, startDate);

	if (months >= 1) {
		return `${months} month${months > 1 ? 's' : ''} ago`;
	} else if (weeks >= 1) {
		return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
	} else if (days >= 1) {
		return `${days} day${days > 1 ? 's' : ''} ago`;
	} else if (hours >= 1) {
		return `${hours} hour${hours > 1 ? 's' : ''} ago`;
	} else if (minutes >= 1) {
		return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
	} else {
		return 'just now';
	}
}
