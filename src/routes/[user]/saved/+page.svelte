<script lang="ts">
    import {authStore} from "$lib";
</script>

<h1 class="col-span-3">SAVED for {$authStore.user?.firstName} {$authStore.user?.lastName}</h1>