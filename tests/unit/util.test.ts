import { describe, expect, it } from 'vitest';
import { getDateDifference, mapToDifficulty, mapToType } from '$lib';
import { Difficulty, MaterialType } from '@prisma/client';

describe('date difference method', () => {
	it('should return correct difference string', async () => {
		const date1 = new Date(2024, 5, 12, 14);

		let date2 = new Date(2023, 5, 12, 14);
		expect(getDateDifference(date2, date1)).toEqual('1 year ago');

		date2 = new Date(2021, 3, 12, 14);
		expect(getDateDifference(date2, date1)).toEqual('3 years ago');

		date2 = new Date(2024, 3, 12, 14);
		expect(getDateDifference(date2, date1)).toEqual('2 months ago');
		date2 = new Date(2024, 4, 10, 14);
		expect(getDateDifference(date2, date1)).toEqual('1 month ago');
		date2 = new Date(2024, 4, 29, 14);
		expect(getDateDifference(date2, date1)).toEqual('2 weeks ago');
		date2 = new Date(2024, 5, 4, 14);
		expect(getDateDifference(date2, date1)).toEqual('1 week ago');
		date2 = new Date(2024, 5, 8, 14);
		expect(getDateDifference(date2, date1)).toEqual('4 days ago');
		date2 = new Date(2024, 5, 11, 14);
		expect(getDateDifference(date2, date1)).toEqual('1 day ago');
		date2 = new Date(2024, 5, 12, 12);
		expect(getDateDifference(date2, date1)).toEqual('2 hours ago');
		date2 = new Date(2024, 5, 12, 13);
		expect(getDateDifference(date2, date1)).toEqual('1 hour ago');
		date2 = new Date(2024, 5, 12, 13, 50);
		expect(getDateDifference(date2, date1)).toEqual('10 minutes ago');
		date2 = new Date(2024, 5, 12, 13, 59);
		expect(getDateDifference(date2, date1)).toEqual('1 minute ago');
		date2 = new Date(2024, 5, 12, 13, 59, 30);
		expect(getDateDifference(date2, date1)).toEqual('just now');
	});
});

describe('type methods', () => {
	it('should return correct difficulty type', async () => {
		expect(mapToDifficulty('easy')).toEqual(Difficulty.easy);
		expect(mapToDifficulty('medium')).toEqual(Difficulty.medium);
		expect(mapToDifficulty('hard')).toEqual(Difficulty.hard);
		expect(() => mapToDifficulty('invalid')).toThrow(
			'Invalid difficulty: invalid',
		);
	});
	it('should return correct encapsulating type', async () => {
		expect(mapToType('exam questions')).toEqual(MaterialType.examQuestions);
		expect(mapToType('lecture notes')).toEqual(MaterialType.lectureNotes);
		expect(mapToType('slides')).toEqual(MaterialType.slides);
		expect(mapToType('assignment')).toEqual(MaterialType.assignment);
		expect(mapToType('other')).toEqual(MaterialType.other);
		expect(mapToType('video')).toEqual(MaterialType.video);
		expect(mapToType('invalid input')).toEqual(MaterialType.other); // Testing the default case
	});
});
