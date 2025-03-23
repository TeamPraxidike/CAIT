import { describe, expect, it } from 'vitest';
import { getDateDifference, mapToDifficulty, mapToType, formatFileSize } from '$lib';
import { Difficulty, MaterialType } from '@prisma/client';
import { typeToHumanString } from '$lib/util/types';

describe('formatFileSize', () => {
	it('should convert byte numbers to KBs', () => {
		expect(formatFileSize(2300)).toEqual('2.3 KB');
		expect(formatFileSize(3100)).toEqual('3.1 KB');
		expect(formatFileSize(1700)).toEqual('1.7 KB');
	});

	it('should convert byte numbers to Bs', () => {
		expect(formatFileSize(230)).toEqual('230 B');
		expect(formatFileSize(310)).toEqual('310 B');
		expect(formatFileSize(170)).toEqual('170 B');
	});

	it('should convert byte numbers into MBs', () => {
		expect(formatFileSize(2_300_000)).toEqual('2.3 MB');
		expect(formatFileSize(3_100_000)).toEqual('3.1 MB');
		expect(formatFileSize(1_700_000)).toEqual('1.7 MB');
	});

	it('should correctly round the numbers to 1 decimal', () => {
		expect(formatFileSize(2_390)).toEqual('2.4 KB');
		expect(formatFileSize(2_000)).toEqual('2.0 KB');
		expect(formatFileSize(2_950_000)).toEqual('3.0 MB');
		expect(formatFileSize(2_940_000)).toEqual('2.9 MB');
	});

	it('should render empty file as 0 B', () => {
		expect(formatFileSize(0)).toEqual('0 B');
	});

	it('should treat negative input as an empty file of 0 B', () => {
		expect(formatFileSize(-10)).toEqual('0 B');
	});

	it('should show extremely large files (at least 1 TB) in GBs', () => {
		expect(formatFileSize(1_000_000_000_000)).toEqual('1000.0 GB');
		expect(formatFileSize(1_200_000_000_000)).toEqual('1200.0 GB');
		expect(formatFileSize(1_200_400_200_000)).toEqual('1200.4 GB');
	});
});

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
	it('should return correct string', async () => {
		expect(typeToHumanString('examQuestions')).toEqual('Exam Questions');
		expect(typeToHumanString('lectureNotes')).toEqual('Lecture Notes');
		expect(typeToHumanString('slides')).toEqual('Slides');
		expect(typeToHumanString('assignment')).toEqual('Assignment');
		expect(typeToHumanString('other')).toEqual('Other');
		expect(typeToHumanString('video')).toEqual('Video');
		expect(typeToHumanString('invalid input')).toEqual('Other'); // Testing the default case
	});
});
