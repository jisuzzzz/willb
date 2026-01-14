<script>
	import Header from '../@components/Header.svelte';
	import Footer from '../@components/Footer.svelte';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';

	export let data;
	// console.log(data);
	// console.log(data.props?.noti);
	// let nickname = data.props.user.nickname;
	let is_login = data.props?.is_login;
	
	let notifications = data.props?.noti || [];
	notifications = notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
	// console.log(notifications)
	let show_noti = false;

	let start_yts = data.props?.youtube;
	let youtubes = [];
	let load_cnt_y = 2;

	// let feeds = data.props.data.feeds;
	let banners = data.props?.banner;
	let interval_banner;
	let interval_tag;
	
	let start_tags = data.props?.hashtag;
	let hashtags = [];
	let t_idx = 0;
	
	let mazs = data.props.m_data?.magazines;

	let start_feeds = data.props.f_data?.feeds;
	let feeds = [];
	let load_cnt = 4;

	let curr_banner_idx = 0;

	function nextTags() {
    if (start_tags.length > 0) {
        	hashtags = start_tags.slice(t_idx, t_idx + 5);
        	t_idx = (t_idx + 1) % (start_tags.length - 4);
    	}
	}

	function nextBanner() {
		curr_banner_idx = (curr_banner_idx + 1) % banners.length;
	}
	function prevBanner() {
		curr_banner_idx = (curr_banner_idx - 1 + banners.length) % banners.length;
	}

	function sortBylike() {
		feeds = start_feeds.sort((a, b) => b.like_cnt - a.like_cnt).slice(0, 4);
	}

	function showNoti() {
		if (!is_login){
            alert('로그인 후 이용하세요');
			goto('/login');
		}
		show_noti = !show_noti;
	}

	async function delNoti(id) {
		const data = await fetch('/api/notifications' ,{
			method: 'DELETE',
			body: JSON.stringify({ id })
		}).then((res) => res.json());
		if (data.error) alert(data.error);
		else notifications = notifications.filter((noti) => noti.id != id);
	}

	function formattingTime(time) {
		let total_sec = Math.floor((new Date() - new Date(time)) / 1000);
		// console.log(total_sec);

		if (total_sec >= 86400) {
			return `${Math.floor(total_sec / 86400)}일`;
		} else if (total_sec >= 3600) {
			return `${Math.floor(total_sec / 3600)}시간`;
		} else if (total_sec >= 60) {
			return `${Math.floor(total_sec / 60)}분`;
		} else {
			return `${total_sec}초`;
		}
	}
	
	function sortByViewAndDate() {
		youtubes = start_yts.sort((a,b) => {
			if (b.total_views - a.total_views !== 0){
				return b.total_views - a.total_views;
			}
			return new Date(b.publish_date) - new Date(a.publish_date);
		}).slice(0,2);
	}

	onMount(() => {
		interval_banner = setInterval(nextBanner, 3000);
		interval_tag = setInterval(nextTags, 2500);
		sortByViewAndDate();
		sortBylike();
	});

	onDestroy(() => {
		clearInterval(interval_banner);
		clearInterval(interval_tag);
	});

	function loadMoreYt() {
		const next_yts = start_yts.slice(youtubes.length, youtubes.length + load_cnt_y);
		youtubes = youtubes.concat(next_yts);
		// if (youtubes.length >= start_yts.length) {
		// 	document.getElementById('loadMoreButton').style.display = 'none';
		// }
	}


	function loadMore() {
		const next_feeds = start_feeds.slice(feeds.length, feeds.length + load_cnt);
		feeds = feeds.concat(next_feeds);
		// if (feeds.length >= start_feeds.length) {
		//     document.getElementById('loadMoreButton').style.display = 'none';
		// }
	}

	async function logout() {
		const data = await fetch('/api/auth/login', {
			method: 'GET'
		}).then((res) => res.json());
		if (data.error) {
			alert(data.error.msg);
			return false;
		}
		// clearSession();
		alert('로그아웃');
		window.location.reload();
		return true;
	}

	function isNotlogin(p1, p2) {
        if (!is_login){
            alert('로그인 후 이용하세요');
            goto(p1);
        } else {
			goto(p2);
		}
    }
</script>

<div class="bg-[#1a1a1a] max-h-screen">
	<div class="fixed top-0 w-full z-50">
		<header class="absolute right-40 top-4 text-gray-500 flex space-x-[20px]">
			{#if is_login}
				<button
					class="inline-flex items-center text-xs transition-colors hover-text-white"
					on:click={() => logout()}>로그아웃</button
				>
			{:else}
				<button
					class="inline-flex items-center text-xs transition-colors hover:text-white"
					on:click={() => goto('/login')}>로그인</button
				>
			{/if}
				<button
					class="inline-flex items-center text-xs transition-colors hover:text-white"
					on:click={() => isNotlogin('/login', '/my')}
				>
					마이페이지
				</button>
				<button
					class="inline-flex items-center text-xs transition-colors hover:text-white"
					on:click={showNoti}
				>
					알림
				</button>
				{#if show_noti}
					<div class="fixed top-10 right-40 bg-[white] w-[400px] h-[600px] opacity-85">
						<div class="absolute top-0 right-0 overflow-y-auto w-full h-full justify-start">
							<div class="flex justify-between items-center w-full text-2xl text-black font-bold border-b border-gray-500 p-4">
								<h2>알림</h2>
								<button
									class="text-base text-gray-500"
									on:click={showNoti}
								>
									닫기
								</button>
							</div>
							{#each notifications as notis}
								<div class="flex items-center mt-3 p-4 justify-between">
									<div class="flex flex-row space-x-2">
										<img src='/willb.png' alt="Profile"
										class="shadow-lg h-7 w-7 rounded-full border-black border-2 object-cover"/>
										<button 
											class="text-sm hover:text-gray-900"
											on:click={() => goto(`/${notis.user_id}/${notis.feed_id}`)}
										>
											<strong>{notis.trigger_user_id}</strong>님이
											{notis.noti_type === 'comment' ? '댓글을 남겼습니다.' : '회원님의 사진을 좋아합니다'}
										</button>
										<span class="text-xs text-gray-400">
											{formattingTime(notis.created_at)} 전
										</span>
									</div>
									<button
										class="text-md hover:text-gray-900"
										on:click={() => delNoti(notis.id)}
									>
										X
									</button>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			<button
				class="inline-flex items-center text-xs transition-colors hover:text-white"
					on:click={() => goto('/signup')}
				>
					회원가입
			</button>
		</header>
		<Header />
	</div>
	<div class="pt-32 h-screen">
		<div class="relative w-screen h-[470px] bg-white -mt-2">
			<button class="absolute left-0 top-1/2 transform -translate-y-1/2 z-40" 
			on:click={() => prevBanner()}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="85"
					height="85"
					viewBox="0 0 24 24"
					fill="none"
					stroke="white"
					stroke-width="0.4"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M15 18l-6-6 6-6"></path>
				</svg>
			</button>
			<button class="absolute right-0 top-1/2 transform -translate-y-1/2 z-40" 
			on:click={() => nextBanner()}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="85"
					height="85"
					viewBox="0 0 24 24"
					fill="none"
					stroke="white"
					stroke-width="0.4"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M9 18l6-6-6-6"></path>
				</svg>
			</button>
			<div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-2 z-40">
				{#each banners as _, idx}
					<svg
						width="24"
						height="24"
						fill={curr_banner_idx === idx ? 'white' : 'gray'}
						stroke={curr_banner_idx === idx ? 'white' : 'gray'}
						stroke-width="1"
					>
						<circle cx="12" cy="12" r="4" />
					</svg>
				{/each}
			</div>
			{#if banners}
			<img
			
				src={banners[curr_banner_idx].b_url}
				alt="banner-item"
				class="object-cover h-full w-full transform-gpu transition-transform"
			/>
			{/if}
		</div>
		<main class="flex w-full gap-4 px-4 pt-12 md:px-40 bg-[#1a1a1a]">
			<div class="flex-1">
				<div class="flex flex-col w-1/2">
					<h2
						class="whitespace-nowrap text-2xl text-white items-start"
					>
						트랜딩 헤시태그
					</h2>
				</div>
				<div class="mt-3 mb-10">
					<div class="flex flex-wrap gap-2">
						{#each hashtags as tag}
							<a class="hover:underline" href="/">
								<div
									class="inline-flex w-fit items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs text-black bg-white font-semibold transition-colors"
								>
									{tag.name}
								</div>
							</a>
						{/each}
					</div>
				</div>
				<div class="border-b border-gray-500 pb-3">
					<h2 class="text-white text-2xl font-bord">
						인기 인터뷰
					</h2>
				</div>
				<div class="grid grid-cols-2 gap-6 mt-10 mb-10">
					{#each mazs as m}
					<div class="flex flex-col items-center">
						<button on:click={() => goto(`magazine/${m.magazine_id}`)}>
							<img
							src={m.url}
							alt="Featured interview"
							class="object-cover h-64 w-screen transform-gpu hover:scale-[1.07] transition-transform"
							style="aspect-ratio: 7/4; object-fit: cover; object-position: center;"
							/>
							<div class="text-left w-full overflow-x-visible">
								<div class="flex justify-between mt-3">
									<span class="text-gray-600 text-xs">패션 > 인터뷰</span>
									<span class="text-right text-gray-600 text-xs">읽음 {m.view} • 2024.04.16</span>
								</div>
								<h3 class="font-bold text-white mb-1 mt-2 hover:scale-[1.02]">{m.title}</h3>
								<p class="text-sm text-gray-400 mb-2">{m.sub_title}</p>
							</div>
						</button>
					</div>
					{/each}
				</div>
				<div class="border-b border-gray-500 pb-3">
					<h2 class="text-white text-2xl font-bord">
						인기 유튜브
					</h2>
				</div>
				<div class="grid grid-cols-2 gap-6 mt-10">
					{#each youtubes as yt}
					<div class="youtube-container w-full">
						<iframe width="100%" height="315" src={yt.video_link} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
						<div class="text-left w-[550px] overflow-x-visible">
							<div class="flex justify-between mt-3">
								<span class="text-gray-600 text-xs">유튜브</span>
								<span class="text-right text-gray-600 text-xs">읽음 {yt.total_views} • {yt.publish_date}</span>
							</div>
							<h3 class="font-bold text-white mt-2">{yt.video_title}</h3>
						</div>
					</div>
					{/each}
				</div>
				<div class="flex justify-center py-12">
					<button
						id="loadMoreButton"
						class="inline-flex items-center justify-center w-full rounded-md text-sm font-medium border bg-background h-10 px-4 py-2 text-white border-gray-600 transition-colors hover:bg-gray-300 hover:text-gray-900"
						on:click={() => loadMoreYt()}
					>
						더보기
					</button>
				</div>
				<div class="overflow-y-auto h-auto">
					<div class="border-b border-gray-500 pb-3">
						<h2 class="text-white text-2xl font-bord">
							인기 스타일
						</h2>
					</div>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mt-10">
						{#each feeds as feed}
							<button on:click={() => goto(`${feed.user_id}/${feed.feed_id}`)}>
								<img
									src={feed.url}
									alt=""
									class="object-cover w-full h-64 transform-gpu hover:scale-[1.07] transition-transform"
									style="aspect-ratio: 5 / 3; object-fit: cover;"
								/>
							</button>
						{/each}
					</div>
				</div>
				<div class="flex justify-center py-12">
					<button
						id="loadMoreButton"
						class="inline-flex items-center justify-center w-full rounded-md text-sm font-medium border bg-background h-10 px-4 py-2 text-white border-gray-600 transition-colors hover:bg-gray-300 hover:text-gray-900"
						on:click={() => loadMore()}
					>
						더보기
					</button>
				</div>
			</div>
		</main>
		<div class="w-full md:px-40 h-[100px] bg-[#1a1a1a]">
		</div>
		<div class="w-full md:px-40 h-[100px] bg-[#1a1a1a]">
		</div>
		<Footer />
	</div>
</div>