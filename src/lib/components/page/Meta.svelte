<script lang="ts">
    export let title:string
    export let description:string
    export let type:string
</script>

<svelte:head>
    <meta name="lang" content="en">
    <title> { `${title} | CAIT` } </title>
    <meta name="description" content={description}>

    <!--  Open graph  -->
    <meta property="og:description"         content={description} >
    <meta property="og:title"               content={`${title} | CAIT`} />
    <meta property="og:type"                content={type} />
</svelte:head>