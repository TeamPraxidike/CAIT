// place files you want to import through the `$lib` alias in this folder.

// Components
import Meta from '$lib/components/page/Meta.svelte';
import Header from '$lib/components/page/Header.svelte';
import Grid from '$lib/components/generic/Grid.svelte';
import SearchBar from '$lib/components/SearchBar.svelte';
import UserProp from '$lib/components/UserProp.svelte';
import DifficultySelection from '$lib/components/difficulty/DifficultySelection.svelte';
import Tag from '$lib/components/generic/Tag.svelte';
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
import type { AuthStore, AuthStruct } from '$lib/stores/auth';
// Stores
import { authStore } from '$lib/stores/auth';

const lorem =
	'Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus ea necessitatibus fugiat, sequi obcaecati aspernatur ipsum, eaque cumque recusandae, quam asperiores quod nostrum iste amet quaerat error similique vero illo?';

export {
	Tag,
	Meta,
	Header,
	Grid,
	DifficultySelection,
	DiffBar,
	UserProfileBar,
	authStore,
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
	type AuthStruct,
	type AuthStore,
};
