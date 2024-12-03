<script lang="ts">
	import '../app.postcss';

	// Highlight JS
	import hljs from 'highlight.js/lib/core';
	import 'highlight.js/styles/github-dark.css';
	import { initializeStores, Modal, storeHighlightJs, storePopup, Toast } from '@skeletonlabs/skeleton';
	import xml from 'highlight.js/lib/languages/xml';
	import css from 'highlight.js/lib/languages/css';
	import javascript from 'highlight.js/lib/languages/javascript';
	import typescript from 'highlight.js/lib/languages/typescript';
	import python from 'highlight.js/lib/languages/python';
	import rust from 'highlight.js/lib/languages/rust';
	import scala from 'highlight.js/lib/languages/scala';
	import plaintext from 'highlight.js/lib/languages/plaintext';
	import { Footer, Grid, Header } from '$lib';

	// Floating UI for Popups
	import { arrow, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';

	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	export let data;
	$: ({ session, supabase } = data);

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});

	initializeStores();

	hljs.registerLanguage('xml', xml);
	hljs.registerLanguage('css', css);
	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('typescript', typescript);
	hljs.registerLanguage('python', python);
	hljs.registerLanguage('rust', rust);
	hljs.registerLanguage('scala', scala);
	hljs.registerLanguage('plaintext', plaintext);

	storeHighlightJs.set(hljs);

	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
</script>


<Modal />
<Toast />

<svelte:head>
	<meta charset="utf-8">
	<meta name="author" content="Praxidike">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="canonical" href="https://cait.tudelft.nl/">
	<meta name="theme-color" content="#00A6D6">

	<!--  Open Graph  -->
	<meta property="og:url" content="https://cait.tudelft.nl/" />
	<meta property="og:site_name" content="CAIT" />
	<!--    <meta property="og:image"               content="https://conventions.praxidike.org/ogmeta.png">-->
	<meta property="og:image:alt" content="CAIT - Community for AI Teachers">
	<meta property="og:image:width" content="1200">
	<meta property="og:image:height" content="630">
	<meta property="og:locale" content="en_US" />

	<!--  Twitter  -->
	<meta name="twitter:card" content="summary_large_image">
	<link rel="icon" href="/images/favicons/favicon-16.png" sizes="16x16" type="image/png">
	<link rel="icon" href="/images/favicons/favicon-32.png" sizes="32x32" type="image/png">
	<link rel="icon" href="/images/favicons/favicon-48.png" sizes="48x48" type="image/png">
	<link rel="icon" href="/images/favicons/favicon-64.png" sizes="64x64" type="image/png">
	<link rel="icon" href="/images/favicons/favicon-128.png" sizes="128x128" type="image/png">
</svelte:head>

<Header supabase={supabase} />

<div class="w-screen dark:text-surface-50 text-surface-900 overflow-x-hidden">
	<Grid pageGrid="{true}">
		<slot />
	</Grid>
</div>

<Footer />