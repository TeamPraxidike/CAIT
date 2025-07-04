import { createUser, type User } from '$lib/database/user';
import { expect } from 'vitest';

const firstNames = ["Martin", "Joan", "Vasko", "Bobi", "Kiril", "John", "Jane", "Alice", "Bob", "Ivan", "Maria", "Petar", "Georgi", "Stefan", "Dimitar", "Nikolay", "Todor", "Viktor", "Elena", "Sofia"];
const lastNames = ["Damyanov", "Guenov", "Marinov", "Popov", "Panayotov", "Petrov", "Ivanov", "Georgiev", "Dimitrov", "Kolev", "Smith", "Doe", "Johnson", "Brown"];
const emailProviders = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "example.com", ".abv.bg", "mail.bg", "yandex.com", "icloud.com", "protonmail.com"];


// pick a random value from an array
function getRandomElement(arr: string[]): string {
	return arr[Math.floor(Math.random() * arr.length)];
}

// generate a random first name
function getFirstName(): string {
	return getRandomElement(firstNames);
}

// generate a random last name
function getLastName(): string {
	return getRandomElement(lastNames) + Math.random() * 10000;
}

// create a user input object with random first and last names
// and a random email address
export function createUserInputObject(firstName: string = getFirstName(), lastName: string = getLastName()) {
	return {
		firstName: firstName,
		lastName: lastName,
		email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.random()*10000}@${getRandomElement(emailProviders)}`,
		password: 'password',
	};
}

// create a new user with the given input
async function newUser(
	userInput: {
		firstName: string;
		lastName: string;
		password: string;
		email: string;
	}
): Promise<User> {
	const user = await createUser(userInput);
	expect(user.firstName).toBe(userInput.firstName);
	expect(user.lastName).toBe(userInput.lastName);
	expect(user.email).toBe(userInput.email);
	return user;
}


// create a user
export async function createUniqueUser(firstName: string = getFirstName(), lastName: string = getLastName()): Promise<User> {
	const userInput = createUserInputObject(firstName, lastName);
	return await newUser(userInput);
}
