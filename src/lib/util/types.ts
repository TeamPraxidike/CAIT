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

export const convertMaterial = (s: string): MaterialType => {
	switch (s) {
		case 'Exam':
			return MaterialType.examQuestions;
		case 'Lecture Notes':
			return MaterialType.lectureNotes;
		case 'Slides':
			return MaterialType.slides;
		case 'Assignment':
			return MaterialType.assignment;
		case 'Other':
			return MaterialType.other;
		case 'Video':
			return MaterialType.video;
		default:
			// Handle invalid input if necessary
			return MaterialType.other;
	}
};

export function typeToHumanString(mt: string): string {
	switch (mt) {
		case 'examQuestions':
			return 'Exam Questions';
		case 'lectureNotes':
			return 'Lecture Notes';
		case 'slides':
			return 'Slides';
		case 'assignment':
			return 'Assignment';
		case 'other':
			return 'Other';
		case 'video':
			return 'Video';
		default:
			// Handle invalid input if necessary
			return 'Other';
	}
}
