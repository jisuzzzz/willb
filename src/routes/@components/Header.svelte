<script>
	import { writable } from 'svelte/store';
	import { goto } from '$app/navigation';

	let show_search = false;
	function toggleSearch() {
		show_search = !show_search;
	}
	
	let search = writable('');

	function executeSearch() {
		if ($search.trim() !== '') {
			const encodedSearch = encodeURIComponent($search.trim()); 
			goto(`/search?query=${encodedSearch}`);
        }
    }
</script>

<div class="bg-[#1a1a1a] border-b border-white w-full items-center px-40 py-10 flex space-x-[28px]">
	<a href="/">
		<img class="w-[110px] h-[40px]" alt="logo" src="/willb.png" />
	</a>
	<ul class="flex space-x-[28px]">
		<li>
			<a
				class="inline-flex h-9 w-max items-center rounded-md px-4 py-2 text-white font-medium transition-colors hover:bg-gray-100 hover:text-gray-900"
				href="/magazine"
			>
				매거진
			</a>
		</li>
		<li>
			<a
				class="inline-flex h-9 w-max items-center rounded-md px-4 py-2 text-white font-medium transition-colors hover:bg-gray-100 hover:text-gray-900"
				href="/style"
			>
				스타일
			</a>
		</li>
		<li>
			<a
				class="inline-flex h-9 w-max items-center rounded-md bg-none px-4 py-2 text-white font-medium transition-colors hover:bg-gray-100 hover:text-gray-900"
				href="/youtube"
			>
				유튜브
			</a>
		</li>
		<li>
			<a
				class="inline-flex h-9 w-max items-center rounded-md px-4 py-2 text-white font-medium transition-colors hover:bg-gray-100 hover:text-gray-900"
				href="/shop"
			>
				샵
			</a>
		</li>
		<li class="flex items-center">
			<button
				class="inline-flex h-9 w-max items-center rounded-md px-4 py-2 text-white font-medium"
				on:click={toggleSearch}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 20 20"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="ml-1 h-5 w-5 transition duration-300 hover:scale-[1.25]"
				>
					<circle cx="11" cy="11" r="6"></circle>
					<path d="m21 21-4.3-4.3"></path>
				</svg>
			</button>
			{#if show_search}
            <div class="border-b border-gray-300">
                <input
                    type="text"
                    class="bg-[#1a1a1a] border-none outline-none px-4 py-1 text-white w-full"
                    placeholder="검색하실 내용을 입력하세요"
                    style="caret-color: white; margin-left: -10px; width: calc(25vw);"
					bind:value={$search}
                    on:change={executeSearch}
                />
            </div>
			{/if}
		</li>
	</ul>
</div>
