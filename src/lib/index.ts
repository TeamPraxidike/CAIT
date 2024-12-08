// place files you want to import through the `$lib` alias in this folder.

// Components
import Meta from '$lib/components/page/Meta.svelte';
import Header from '$lib/components/page/Header.svelte';
import Grid from '$lib/components/generic/Grid.svelte';
import SearchBar from '$lib/components/SearchBar.svelte';
import UserProp from '$lib/components/UserProp.svelte';
import DifficultySelection from '$lib/components/difficulty/DifficultySelection.svelte';
import Tag from '$lib/components/generic/TagComponent.svelte';
import DiffBar from '$lib/components/difficulty/DiffBar.svelte';
import UserProfileBar from '$lib/components/user/UserProfileBar.svelte';
import IconLink from '$lib/components/generic/IconLink.svelte';
import UserMenu from '$lib/components/user/UserMenu.svelte';
import Footer from '$lib/components/page/Footer.svelte';
import Section from '$lib/components/generic/Section.svelte';
import TheoryAppBar from '$lib/components/TheoryAppBar.svelte';
import PublicationCard from '$lib/components/PublicationCard.svelte';
import Comment from '$lib/components/Comment.svelte';
import Filter from '$lib/components/Filter.svelte';
import Circuit from '$lib/components/circuits/Circuit.svelte';
import CircuitComponent from '$lib/components/circuits/CircuitComponent.svelte';
import Download from '$lib/components/generic/Download.svelte';
import HorizontalScroll from '$lib/components/HorizontalScroll.svelte';
import FileTable from '$lib/components/FileTable.svelte';
import Render from '$lib/components/Render.svelte';
import UsedInCourse from '$lib/components/UsedInCourse.svelte';
import PublishReview from '$lib/components/PublishReview.svelte';

// util
import { getDateDifference } from '$lib/util/date';
import { formatFileSize } from "$lib/util/file"
import { mapToType, mapToDifficulty, MaterialTypes } from '$lib/util/types';

const lorem =
	'Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus ea necessitatibus fugiat, sequi obcaecati aspernatur ipsum, eaque cumque recusandae, quam asperiores quod nostrum iste amet quaerat error similique vero illo?';

import AddInteractionForm from '$lib/components/AddInteractionForm.svelte';


export {
	formatFileSize,
	mapToType,
	mapToDifficulty,
	Download,
	getDateDifference,
	Render,
	FileTable,
	Tag,
	Meta,
	Header,
	Grid,
	DifficultySelection,
	DiffBar,
	UserProfileBar,
	TheoryAppBar,
	PublicationCard,
	SearchBar,
	UserProp,
	Comment,
	IconLink,
	UserMenu,
	Footer,
	Section,
	lorem,
	Filter,
	Circuit,
	CircuitComponent,
	AddInteractionForm,
	UsedInCourse,
	PublishReview,
	HorizontalScroll,
	MaterialTypes
};
