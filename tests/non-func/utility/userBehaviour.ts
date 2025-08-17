import { sleep } from 'k6';
import { randomSeed } from 'k6';
randomSeed(42);

export function randUniform(min = 1, max = 5){
	return min + Math.random() * (max - min)
}

export function thinkUniform(min = 1, max = 5){
	return sleep(randUniform(min, max));
}