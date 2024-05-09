<script lang="ts">
    import { TheoryAppBar} from "$lib";

    let finalValue:number = 0.75;


</script>

    <h1>ABOUT</h1>
<div class = "flex">
    <div><TheoryAppBar bind:value={finalValue} editable={true}></TheoryAppBar></div>
        <p>Final value: {finalValue}</p>
</div>