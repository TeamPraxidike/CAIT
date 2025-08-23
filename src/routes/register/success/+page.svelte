<script lang="ts">
	import type {PageServerData} from './$types';
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import { fade } from 'svelte/transition';

	export let data: PageServerData;

	import { goto } from '$app/navigation';
</script>

<div class="col-span-12 h-[80vh] flex items-center justify-center">
	{#if !data.putUsernameRequest}
		<ProgressRadial font={18} width="w-14"/>
	{/if}
	{#await data.putUsernameRequest}
		<h1>Setting some things up</h1>
		<ProgressRadial font={12} width="w-10"/>
	{:then awaitedRequest}
		<div class="fade-overlay col-span-full pt-20"
			 in:fade={{ delay: 600, duration: 400 }} out:fade={{duration: 300}}>
			<div class="logo-container">
				<img src="/images/about/CAIT_Logo_nobg.png" alt="Success" class="logo">
			</div>
			<div class="success-text">Welcome to CAIT, {awaitedRequest.firstName} {awaitedRequest.lastName}</div>
			<div class="button-container">
				<button type="button" class="success-btn
				bg-primary-600 text-surface-50 border-2 border-primary-600
				hover:opacity-60 transition duration-400;" on:click={() => {
					// showAnimation = false;
					goto('/browse');
				}}>
					Browse the catalog
				</button>
				<button type="button" class="success-btn
				bg-[#fcfcfd] text-black border-2 border-[#007393]
				hover:opacity-60 transition duration-400;" on:click={() => {
					// showAnimation = false;
					goto(`/${awaitedRequest.username}`);
				}}>
					Go to your profile
				</button>
			</div>
		</div>
		<h1> </h1>
	{:catch error}
		<h1>error</h1>
	{/await}
</div>

<style>
    .fade-overlay {
        position: relative;
        width: 100%;
        height: 100%;
        z-index: 40;
        background: linear-gradient(135deg, #ffffff 0%, #fcfcfd 100%);
        filter: saturate(0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 2rem;
    }

    .logo-container {
        opacity: 0;
        animation: slide-in-logo 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s forwards;
    }

    .logo {
        width: 200px;
        height: 200px;
        max-width: 80vw;
        max-height: 80vh;
        object-fit: contain;
    }

    .success-text {
        color: black;
        font-size: 1.5rem;
        font-weight: 500;
        text-align: center;
        opacity: 0;
        animation: slide-in-content 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s forwards;
    }

    .success-subtext {
        color: black;
        font-size: 1.0rem;
        font-weight: 350;
        text-align: center;
        opacity: 0;
        animation: slide-in-content 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s forwards;
    }

    .button-container {
        display: flex;
        gap: 1rem;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        opacity: 0;
        animation: slide-in-content 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.7s forwards;
    }

    .success-btn {
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        min-width: 160px;
        text-align: center;
        transition: background-color 0.3s ease, opacity 0.3s ease, border-color 0.3s ease;
    }


    @keyframes slide-in-logo {
        from {
            transform: scale(0.4) translateY(20px);
            opacity: 0;
        }
        to {
            transform: scale(1) translateY(0);
            opacity: 1;
        }
    }

    @keyframes slide-in-content {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    @media (max-width: 640px) {
        .button-container {
            flex-direction: column;
            gap: 0.75rem;
        }
    }

    @media (max-width: 768px) {
        .logo {
            width: 150px;
            height: 150px;
        }

        .success-text {
            font-size: 1rem;
        }

        .success-subtext {
            font-size: 0.75rem;
        }
    }
</style>