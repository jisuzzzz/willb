<script>
	import Header from '../../@components/Header.svelte';
	import Footer from '../../@components/Footer.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	export let data;
	// console.log(data);
	// let feeds = data.props.data.feeds;
	// console.log(feeds);
	let is_login = data.props?.is_login;
	let user = data.props?.user;
	// console.log(user.id);

	let notifications = data.props?.noti || [];
	notifications = notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
	// console.log(notifications);
	let show_noti = false;

	// let start_feeds = data.props.all_feeds.feeds;
	let start_feeds = data.props.all_feeds?.feeds.map((feed) => ({
		...feed,
		liked: feed.liked_users ? feed.liked_users.includes(user.id) : false
	}));
	let feeds = [];
	onMount(() => {
		feeds = start_feeds.sort((a, b) => {
			const dateA = new Date(a.created_at);
			const dateB = new Date(b.created_at);
			return dateB - dateA || b.like_cnt - a.like_cnt;
		}).slice(0, 8);
	});
	// console.log(start_feeds);
	// let feeds = [];
	let load_cnt = 4;

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

	function loadMore() {
		const next_feeds = start_feeds.slice(feeds.length, feeds.length + load_cnt);
		feeds = feeds.concat(next_feeds);
		if (feeds.length >= start_feeds.length) {
			document.getElementById('loadMoreButton').style.display = 'none';
		}
	}

	async function noti_like(f_id, u_id) {
		const data = await fetch('/api/notifications', {
			method: 'POST',
			body: JSON.stringify({
				feed_id: f_id,
				user_id: u_id,
				trigger_user_id: user.nickname,
				noti_type: 'like'
			})
		}).then((res) => res.json());
		if (data.error) console.log(data.error);
	}

	async function toggle_like(f_id, u_id, idx) {
		// console.log(idx);
		if (!is_login) {
			goto('/login');
			return;
		}
		const data = await fetch('/api/feeds/feed-likes', {
			method: 'POST',
			body: JSON.stringify({ feed_id: f_id})
		});
		const res = await data.json();
		// console.log(res);
		if (res.action === 'added') {
			feeds[idx].like_cnt += 1;
			feeds[idx].liked = true;
			await noti_like(f_id, u_id);
		}
		else if (res.action === 'removed'){
			feeds[idx].like_cnt -= 1
			feeds[idx].liked = false;
		}
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
		if (!is_login) {
			alert('로그인 후 이용하세요');
			goto(p1);
		} else {
			goto(p2);
		}
	}

</script>

<div class="bg-[#1a1a1a] min-h-screen">
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
	<div class="pt-32">
		<main class="flex w-full gap-4 px-4 py-12 md:px-40">
			<div class="flex-1">
				<h2 class="text-2xl text-white font-bold mb-6 border-gray-500 border-b pb-4">스타일</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
					{#each feeds as feed, idx}
						<button
							on:click={() => goto(`${feed.user_id}/${feed.feed_id}`)}
							class="flex flex-col w-full"
						>
							<img
								src={feed.url}
								alt=""
								class="object-cover w-screen h-auto hover:scale-[1.07] transition-transform"
								style="aspect-ratio: 4/5; object-fit: cover;"
							/>
							<div class="flex items-center justify-between w-full mt-2">
								<div class="flex items-center">
									<button
										on:click|stopPropagation={(event) => {
											event.stopPropagation();
											goto(`/${feed.nickname}`);
										}}
									>
										<img
											src={feed.profile}
											alt="Profile"
											class="shadow-lg h-5 w-5 rounded-full object-cover mr-2"
										/>
									</button>
									<button
										class="text-sm text-white transition-colors rounded-md hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
										on:click|stopPropagation={(event) => {
											event.stopPropagation();
											goto(`/${feed.nickname}`);
										}}
									>
										{feed.nickname}
									</button>
								</div>
								<div class="flex items-center text-gray-300 text-xs">
									<button 
										class="mr-1"
										on:click|stopPropagation={() => toggle_like(feed.feed_id, feed.user_id, idx)}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill={feed.liked === true ? '#D2042D' : 'none'}
											stroke={feed.liked === true ? '#D2042D' : 'currentColor'}
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											class="w-4 h-4"
										>
											<path
												d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
											></path>
										</svg>
									</button>
									<span>{feed.like_cnt}</span>
								</div>
							</div>
							<div class="mt-1 text-gray-300 text-sm hover:text-gray-400">
								{feed.content}
							</div>
						</button>
					{/each}
				</div>
				<div class="flex items-center py-12">
					<button
						id="loadMoreButton"
						class="inline-flex items-center justify-center w-full rounded-md text-sm font-medium border bg-background h-10 px-4 py-2 text-white border-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
						on:click={() => loadMore()}
					>
						더보기
					</button>
				</div>
			</div>
		</main>
	</div>
	<div class="mt-40"></div>
	<Footer />
</div>
