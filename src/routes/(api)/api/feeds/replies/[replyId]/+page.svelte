<script>

    export let data;

    // console.log(data.repliesData);
    // console.log(data.repliesData.comment);
</script>

<ul class="text-white">
    {#each data.repliesData as reply}
        <li>{reply.comment}</li>
    {/each}
</ul>
