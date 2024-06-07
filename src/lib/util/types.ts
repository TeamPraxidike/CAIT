import { Difficulty, MaterialType } from '@prisma/client';

export function mapToDifficulty(difficulty: string): Difficulty {
	switch (difficulty.toLowerCase()) {
		case 'easy':
			return Difficulty.easy;
		case 'medium':
			return Difficulty.medium;
		case 'hard':
			return Difficulty.hard;
		default:
			throw new Error(`Invalid difficulty: ${difficulty}`);
	}
}

export function mapToType(mt: string): MaterialType {
	switch (mt.toLowerCase()) {
		case 'video':
			return MaterialType.video;
		case 'presentation':
			return MaterialType.presentation;
		case 'assignment':
			return MaterialType.assignment;
		case 'dataset':
			return MaterialType.dataset;
		case 'exam':
			return MaterialType.exam;
		case 'code':
			return MaterialType.code;
		default:
			throw new Error(`Invalid material type: ${mt}`);
	}
}
