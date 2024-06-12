import { Difficulty, MaterialType } from '@prisma/client';

export const MaterialTypes = ["Video", "Lecture Notes", "Slides", "Assignment", "Exam Questions", "Other"];

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
		case 'exam questions':
			return MaterialType.examQuestions;
		case 'lecture notes':
			return MaterialType.lectureNotes;
		case 'slides':
			return MaterialType.slides;
		case 'assignment':
			return MaterialType.assignment;
		case 'other':
			return MaterialType.other;
		case 'video':
			return MaterialType.video;
		default:
			// Handle invalid input if necessary
			return MaterialType.other;
	}
}
