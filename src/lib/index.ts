// place files you want to import through the `$lib` alias in this folder.

// Components
import Meta from "$lib/components/Meta.svelte";
import Header from "$lib/components/Header.svelte";
import Grid from "$lib/components/Grid.svelte";
import EasyDiff  from "$lib/components/difficulty/EasyDiff.svelte";
import HardDiff from "$lib/components/difficulty/HardDiff.svelte";
import MedDiff from "$lib/components/difficulty/MedDiff.svelte";
import DifficultySelection from "$lib/components/difficulty/DifficultySelection.svelte";
export {Meta, Header, Grid, EasyDiff, MedDiff, HardDiff, DifficultySelection}