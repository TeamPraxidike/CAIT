import http from 'k6/http'

export type UserInput = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
}

export const firstNames = ["Martin", "Joan", "Vasko", "Bobi", "Kiril", "John", "Jane", "Alice", "Bob", "Ivan", "Maria", "Petar", "Georgi", "Stefan", "Dimitar", "Nikolay", "Todor", "Viktor", "Elena", "Sofia"];
export const lastNames = ["Damyanov", "Guenov", "Marinov", "Popov", "Panayotov", "Petrov", "Ivanov", "Georgiev", "Dimitrov", "Kolev", "Smith", "Doe", "Johnson", "Brown"];
export const emailProviders = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "example.com", "abv.bg", "mail.bg", "yandex.com", "icloud.com", "protonmail.com"];


enum Difficulty {
	"easy",
	"medium",
	"hard"
}

enum Level {
	"Bachelor",
	"Master",
	"PhD"
}

enum MaterialType {
	"video",
	"lectureNotes",
	"slides",
	"assignment",
	"examQuestions",
	"other"
}


export function createUserInputObject(firstName: string = "DELETE", lastName: string = getLastName()): UserInput {
	return {
		firstName: firstName,
		lastName: lastName,
		email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNumber()}@${getRandomElement(emailProviders)}`,
		password: 'password',
	};
}

// generate a random first name
export function getFirstName(): string {
	return getRandomElement(firstNames);
}

// generate a random last name
export function getLastName(): string {
	return getRandomElement(lastNames);
}

// pick a random value from an array
export function getRandomElement(arr: string[]): string {
	return arr[Math.floor(Math.random() * arr.length)];
}

export function randomNumber(): string {
	const randomNumber = Math.random(); // Generate a random number between 0 and 1
	const decimalPart = randomNumber.toString().split('.')[1]; // Extract the decimal part
	return decimalPart || '0'; // Return the decimal part or '0' if undefined
}

export function createMaterialMetaData() {
	return{
		 title: generateRandomString(),
		 description: generateRandomString(100),
		 copyright: generateRandomString(10),
		 difficulty: randomEnumValue(Difficulty),
		 learningObjectives: [generateRandomString()],
		 prerequisites: [generateRandomString()],
		 materialType: [randomEnumValue(MaterialType)],
		 timeEstimate: (Math.floor(Math.random() * 10) + 1),
		 theoryPractice: Math.random()
	}

}

const SUPABASE_URL = "https://supabase.praxidike.org";
const SERVICE_TOKEN = __ENV.SUPABASE_SERVICE_KEY;
const BUCKET = 'uploadedFiles';

// Read a local file at init time (binary)
const BYTES = open('./logo.jpg', 'b');
const CONTENT_TYPE = 'image/jpg';

const BASE = "https://cait.beta.praxidike.org"

export function createMaterialData(userId: string) {
	const objectPath = `${Date.now()}${generateRandomString(10)}.jpg`;
	const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(objectPath)}`;

	const res = http.post(url, BYTES, {
		headers: {
			Authorization: `Bearer ${SERVICE_TOKEN}`,
			'Content-Type': CONTENT_TYPE,
			'x-upsert': 'true',
			'Origin': BASE,
			'Referer': `${BASE}/publish/materials`
		},
	});

	if (res.status !== 200 && res.status !== 201) {
		console.error('Upload failed:', res.status, res.body);
	} else {
		return {
			userId,
			metaData: createMaterialMetaData(),
			fileDiff: {
				add: [{ title: "stress.jpg", type: CONTENT_TYPE, info: objectPath }],
				delete: [],
				edit: []
			},
			coverPic: null
		}
	}


}

export function generateCourseData(creatorID: string){
	const los = Math.ceil(Math.random() * 5);
	const prerequisites = Math.ceil(Math.random() * 5);

	const learningObjectives: string[] = [];
	for (let i = 0; i < los; i++) {
		learningObjectives.push(generateRandomString(20));
	}
	const prerequisitesArray: string[] = [];
	for (let i = 0; i < prerequisites; i++) {
		prerequisitesArray.push(generateRandomString(20));
	}
	return {
		learningObjectives: learningObjectives,
		prerequisites: prerequisitesArray,
		educationalLevel: randomEnumValue(Level),
		courseName: generateRandomString(10),
		creatorId: creatorID
	};
}

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function generateRandomString(n: number = 20): string {
	let result = '';
	for (let i = 0; i < n; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
}

export function randomEnumValue<T extends object>(e: T): T[keyof T] {
	const rand = Math.floor(Math.random() * Object.keys(e).length);
	const key = Object.keys(e)[rand] as keyof T;
	return e[key];
}