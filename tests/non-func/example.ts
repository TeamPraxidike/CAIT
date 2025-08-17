import http from 'k6/http'
import encoding from 'k6/encoding';
import { check, group } from 'k6';
import { createMaterialData, createUserInputObject, getLastName } from './utility/users.ts';
import { thinkUniform } from './utility/userBehaviour.ts';

// TODO: this could be used to extract browser metrics, but it could be difficult...
// https://grafana.com/docs/k6/latest/using-k6-browser/
// import { browser } from "k6/browser";

export const options = {
	// https://grafana.com/docs/k6/latest/using-k6/k6-options/reference/#no-cookies-reset
	noCookiesReset: true,
	scenarios: {
		// new_signups: {
		// 	executor: 'ramping-vus',
		// 	startVUs: 0, //something
		// 	stages: [
		// 		{ duration: '5s', target: 5 }, // ramp up (to 5 VUs)
		// 		{ duration: '15s', target: 5 }, // hold
		// 		{ duration: '5s', target: 10 }, // ramp up (to 5 VUs)
		// 		{ duration: '15s', target: 10 }, // hold
		// 		{ duration: '15s', target: 0 }, // ramp down
		// 	],
		// 	gracefulRampDown: '0s',
		// 	exec: 'flowSignUp'
		// },
		platform_exploration: {
			// executor: 'constant-vus',
			// vus: 50,
			// duration: '180s',
			// exec: 'explorePlatform'
			executor: 'ramping-vus',
			startVUs: 0,
			stages: [
				{ duration: '15s', target: 30 }, // ramp up (to 10 VUs)
				{ duration: '120s', target: 30 },
				{ duration: '15s', target: 40 }, // ramp up (to 20 VUs)
				{ duration: '120s', target: 40 },
				{ duration: '15s', target: 50 }, // ramp up (to 30 VUs)
				{ duration: '120s', target: 50 },
			],
			gracefulRampDown: '0s',
			exec: 'explorePlatform'
		}
	},
	thresholds: {
		http_req_failed: ['rate<0.01'],
		http_req_duration: ['p(99)<1000'],
		'http_req_duration{name:form_register}': ['p(95)<1500'],
		'http_req_duration{name:form_login}': ['p(95)<1500'],
		'http_req_duration{name:form_comment}': ['p(95)<1500'],
		'http_req_duration{name:browse_nointeraction}': ['p(95)<1500'],
		'http_req_duration{name:save_publication}': ['p(95)<1500'],
		'http_req_duration{name:like_publication}': ['p(95)<1500'],
		'http_req_duration{name:form_materialUpload}': ['p(95)<1500'],
	}
};

export function verboseError(URL, res){
	console.error(`❌ Request failed: ${URL}`);
	console.error(`Status: ${res.status}`);
	console.error(`Body: ${res.body}`);
	console.error(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
}

function decodeBase64ToJson<T = any>(base64Str: string): T {
	const decoded = encoding.b64decode(base64Str, 'rawurl', "s");
	return JSON.parse(decoded) as T;
}

const BASE = "https://cait.beta.praxidike.org"

let signedUp = false;
let loggedIn = false;
let email: string = "";
let password: string = "";
let userId: string = "";

const publicationsToExplore: string[] = [
	`${BASE}/YoanPopov_3/82`,
	`${BASE}/JoaoGoncalves_2/79`,
	`${BASE}/IuliaLefter_2/75`,
	`${BASE}/Gosia_2/74`,
	`${BASE}/BiancaGiovanardi_3/71`,
	`${BASE}/BaharehAbdi_2/68`,
	`${BASE}/MartinDamyanov_2/64`,
	`${BASE}/BiancaGiovanardi_3/63`,
	`${BASE}/SaraColombo_2/60`
]

// source: https://stackoverflow.com/questions/48083353/i-want-to-know-how-to-shuffle-an-array-in-typescript
export function shuffle<T>(array: T[]): T[] {
	let currentIndex = array.length,  randomIndex;

	// While there remain elements to shuffle.
	while (currentIndex != 0) {

		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex], array[currentIndex]];
	}

	return array;
}

function randomizeFirstLetter(str: string): string {
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const randomChar = alphabet[Math.floor(Math.random() * alphabet.length)];
	return randomChar + str.slice(1);
}


export function getUserIdFromCookie(response){
	// sb-supabase-auth-token=base64-<base64string>
	const supaCookie = "sb-supabase-auth-token"

	const cookieVal = response.cookies[supaCookie][0]["value"];
	if (!cookieVal) {
		console.error("No sb-supabase-auth-token cookie found!");
		return;
	}

	let rawBase64 = cookieVal.startsWith("base64") ? cookieVal.slice(7) : cookieVal;

	rawBase64 = rawBase64.trim().replace(/\s/g, "");
	if (rawBase64.startsWith('"') && rawBase64.endsWith('"')) {
		rawBase64 = rawBase64.slice(1, -1);
	}

	const parsed = decodeBase64ToJson(rawBase64)

	userId = parsed.user.id;
}

//////////////////////////////////////////
// FLOWS
//////////////////////////////////////////

export function flowSignUp(){
	group('signup', () => {
		let URL = `${BASE}/register?/register`

		const userInput = createUserInputObject("DELETE", getLastName());

		// using this instead of JSON since we are sending form data to the backend
		const payload =
			`firstName=${encodeURIComponent(userInput.firstName)}` +
			`&lastName=${encodeURIComponent(userInput.lastName)}` +
			`&email=${encodeURIComponent(userInput.email)}` +
			`&password=${encodeURIComponent(userInput.password)}`;

		const params = {
			headers: {
				// 'Content-Type': 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded',
				// the following two are needed to bypass the CSRF
				'Origin': 'https://cait.beta.praxidike.org',
				'Referer': 'https://cait.beta.praxidike.org/register'
			},
			tags: { name: 'form_register' }
		};

		let res = http.post(URL, payload, params);

		let ok = check(res, {
			'response code was 200': (res) => res.status == 200,
		});

		if (!ok){
			verboseError(URL, res)
		}

		getUserIdFromCookie(res);

		thinkUniform();

		// goto home page
		URL = `${BASE}/`

		res = http.get(URL);

		ok = check(res, {
			'response code was 200': (res) => res.status == 200,
		});

		if (!ok){
			verboseError(URL, res)
		}

		signedUp = true;
		email = userInput.email;
		password = userInput.password;
	})
}

export function flowLogin(){
	group('login', () => {
		let URL = `${BASE}/signin?/login`

		// using this instead of JSON since we are sending form data to the backend
		const payload =
			`&email=${encodeURIComponent(email)}` +
			`&password=${encodeURIComponent(password)}`;

		const params = {
			headers: {
				// 'Content-Type': 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded',
				// the following two are needed to bypass the CSRF
				'Origin': 'https://cait.beta.praxidike.org',
				'Referer': 'https://cait.beta.praxidike.org/signin'
			},
			tags: { name: 'form_login' }
		};

		let res = http.post(URL, payload, params);

		let ok = check(res, {
			'response code was 200': (res) => res.status == 200,
		});

		if (!ok){
			verboseError(URL, res)
		}

		thinkUniform();

		// goto home page
		URL = `${BASE}/`

		res = http.get(URL);

		ok = check(res, {
			'response code was 200': (res) => res.status == 200,
		});

		if (!ok){
			verboseError(URL, res)
		}

		loggedIn = true;
	})
}

export function flowComment(URLSource: string){
	group('comment', () => {
		// URLSource example: `${BASE}/SaraColombo_2/60`
		const URL = `${URLSource}?/comment`

		const comment = randomizeFirstLetter("TRAVIS SCOTT");

		const payload =
			`userId=${encodeURIComponent(userId)}` +
			`&comment=${encodeURIComponent(comment)}` +
			`&isComment=true` +
			`&commentId=1` +
			`&publicationId=${URLSource.split("/").pop()}`

		const params = {
			headers: {
				// 'Content-Type': 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded',
				// the following two are needed to bypass the CSRF
				'Origin': `${BASE}`,
				'Referer': `${URLSource}`
			},
			tags: { name: 'form_comment' }
		};

		const res = http.post(URL, payload, params);

		const ok = check(res, {
			'response code was 200': (res) => res.status == 200,
		});

		if (!ok){
			verboseError(URL, res)
		}
	})
}

export function flowUploadMaterial(){
	group('uploadMaterial', () => {
		let URL = `${BASE}/publish/materials`

		let res = http.get(URL);

		let ok = check(res, {
			'response code was 200': (res) => res.status == 200,
		});

		if (!ok) {
			verboseError(URL, res)
		}

		thinkUniform();

		URL = `${URL}?/publish`

		const materialData = createMaterialData(userId);

		const payload =
			`userId=${encodeURIComponent(userId)}` +
			`&title=${encodeURIComponent(materialData.metaData.title)}` +
			`&description=${encodeURIComponent(materialData.metaData.description)}` +
			`&type=${encodeURIComponent(JSON.stringify(materialData.metaData.materialType))}` +
			`&difficulty=${encodeURIComponent(materialData.metaData.difficulty)}` +
			`&estimate=${encodeURIComponent(JSON.stringify(materialData.metaData.timeEstimate))}` +
			`&copyright=${encodeURIComponent(materialData.metaData.copyright)}` +
			`&tags=${encodeURIComponent(JSON.stringify(["ai"]))}` +
			`&maintainers=${encodeURIComponent(JSON.stringify([]))}` +
			`&learningObjectives=${encodeURIComponent(JSON.stringify(materialData.metaData.learningObjectives))}` +
			`&prerequisites=${encodeURIComponent(JSON.stringify(materialData.metaData.prerequisites))}` +
			`&coverPic=${encodeURIComponent('')}` +
			`&newTags=${encodeURIComponent(JSON.stringify([]))}` +
			`&theoryToApplication=${encodeURIComponent(JSON.stringify(materialData.metaData.theoryPractice))}` +
			`&isDraft=${encodeURIComponent(JSON.stringify(false))}` +
			`&course=${encodeURIComponent('null')}` +
			`&file=${encodeURIComponent(JSON.stringify(materialData.fileDiff.add[0]))}`;


		const params = {
			headers: {
				// 'Content-Type': 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded',
				// the following two are needed to bypass the CSRF
				'Origin': BASE,
				'Referer': `${BASE}/publish/materials`
			},
			tags: { name: 'form_materialUpload' }
		};

		res = http.post(URL, payload, params);

		ok = check(res, {
			'response code was 200': (res) => res.status == 200,
		});

		if (!ok) {
			verboseError(URL, res)
		}
	})
}

export function flowGoBrowseNoInteraction(){
	group('browseNoInt', () => {
		const URL = `${BASE}/browse?type=materials`

		const params = {
			tags: { name: 'browse_nointeraction' }
		};

		const res = http.get(URL, params);

		const ok = check(res, {
			'response code was 200': (res) => res.status == 200,
		});

		if (!ok){
			verboseError(URL, res)
		}
	})
}

export function flowSaveOrLikePublication(URLSource: string, saveOrLike: "save" | "like"){
	group(`${saveOrLike}Publication`, () => {
		// beautiful
		const URL = `${BASE}/api/user/${encodeURIComponent(userId)}/${saveOrLike}d/${URLSource.split("/").pop()}`

		const params = {
			headers: {
				// the following two are needed to bypass the CSRF
				'Origin': BASE,
				'Referer': URLSource
			},
			tags: { name: `${saveOrLike}_publication` }
		};

		const res = http.post(URL, null, params);

		const ok = check(res, {
			'response code was 200': (res) => res.status == 200,
		});

		if (!ok){
			verboseError(URL, res)
		}
	})
}

export function getRandomPublications(): string[]{
	const URL = `${BASE}/api/material`

	const res = http.get(URL);

	const ok = check(res, {
		'response code was 200': (res) => res.status == 200,
	});

	if (!ok){
		verboseError(URL, res)
	}

	// res.body is the full HTML
	const materialInformation = res.json();

	const publications: string[] = [];

	for (const material of materialInformation.materials){
		const publisher = material.publisher;
		const usernameSlug = publisher.username;
		const publicationId = material.publicationId;

		publications.push(`${BASE}/${usernameSlug}/${publicationId}`,)
	}

	return publications;
}


export function explorePlatform(){
	if (!signedUp){
		flowSignUp();
	}
	else {
		if (!loggedIn){
			flowLogin();
		}

		// comment 20% of the time
		if (Math.random() <= 0.2){
			flowUploadMaterial();
		}
		else{
			const publicationsExplorationOrder = shuffle(getRandomPublications())

			// for each of the shuffled pubs, go to it and simulate waiting
			for (const pURL of publicationsExplorationOrder){
				let res = http.get(pURL);

				const ok = check(res, {
					'response code was 200': (res) => res.status == 200,
				});

				if (!ok){
					verboseError(pURL, res);
				}

				thinkUniform();

				// comment 10% of the time
				if (Math.random() <= 0.1){
					flowComment(pURL);
				}

				// engage in saving or liking 25% of the time
				if (Math.random() <= 0.25){
					// always like, save sometimes
					if (Math.random() <= 0.5) {
						flowSaveOrLikePublication(pURL, "save")
					}
					flowSaveOrLikePublication(pURL, "like")
				}

				flowGoBrowseNoInteraction();
				thinkUniform();
			}
		}
	}

}
