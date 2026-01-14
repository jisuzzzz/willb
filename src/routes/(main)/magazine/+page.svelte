<script>
	import Header from '../../@components/Header.svelte';
	import Footer from '../../@components/Footer.svelte';
	import { goto } from '$app/navigation';

	export let data;
	// console.log(data.props);
	let user = data.props?.user || {};
	let nick = user.nickname
	// let magazine = data.props.data[0];
	let magazines = data.props.data?.magazines;
    let is_login = data.props?.is_login;

	let notifications = data.props?.noti || [];
	notifications = notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
	// console.log(notifications)
	let show_noti = false;

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

	function loadMore() {
        const next_feeds = start_feeds.slice(feeds.length, feeds.length + load_cnt);
        feeds = feeds.concat(next_feeds);
        if (feeds.length >= start_feeds.length) {
            document.getElementById('loadMoreButton').style.display = 'none';
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
		<div class="px-4 py-12 md:px-40">
			<div class="flex flex-row items-center justify-between mb-6 border-gray-500 border-b pb-4">
				<h2 class="text-2xl text-white font-bold">메거진</h2>
				{#if is_login && nick === '@admin'}
					<button
						class="p-0 transition-colors h-9 w-max rounded-md hover:bg-gray-500 disabled:pointer-events-none disabled:opacity-50"
						on:click={() => goto('/editor')}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="h-8 w-8 text-white"
						>
							<path d="M5 12h14"></path>
							<path d="M12 5v14"></path>
						</svg>
					</button>
				{/if}
			</div>
			<div class="grid grid-cols-3 gap-5 mt-10">
				{#each magazines as mag}
				<div class="flex flex-col items-center">
					<button
						class="w-full aspect-ratio-1 bg-transparent p-0 border-none"
						on:click={() => goto(`magazine/${mag.magazine_id}`)}
					>
						<img
							src={mag.url}
							alt="Featured interview"
							class="object-cover h-64 w-screen transform-gpu hover:scale-[1.07] transition-transform"
							style="aspect-ratio: 500 / 300; object-fit: cover; object-position: center;"
						/>
						<div class="text-left w-full overflow-x-visible">
							<div class="flex justify-between mt-3">
								<span class="text-gray-600 text-xs">패션 > 인터뷰</span>
								<span class="text-right text-gray-600 text-xs">읽음 {mag.view} • 2024.04.16</span>
							</div>
							<h3 class="font-bold text-white mb-1 mt-2 hover:scale-[1.02]">{mag.title}</h3>
							<p class="text-sm text-gray-400 mb-2">{mag.sub_title}</p>
						</div>
					</button>
				</div>
				{/each}
				<div class="flex flex-col items-center">
					<img
						src="/genzox.jpeg"
						alt="Featured interview"
						class="object-cover h-64 w-screen transform-gpu hover:scale-[1.07] transition-transform"
						style="aspect-ratio: 700 / 400; object-fit: cover; object-position: center;"
					/>
					<div class="text-left w-full overflow-x-visible">
						<div class="flex justify-between mt-3">
							<span class="text-gray-600 text-xs">패션 > 인터뷰</span>
							<span class="text-gray-600 text-xs">읽음 14716 • 2024.04.09</span>
						</div>
						<h3 class="font-bold text-white mb-1 mt-2">
							겐조 x 베르디 협업 컬렉션 팝업 스토어 오픈 기념, 니고 & 베르디 인터뷰
						</h3>
						<p class="text-sm text-gray-400 mb-2">
							시너지의 '정석', 니고와 베르디가 직접 밝힌 협업 컬렉션의 비하인드
						</p>
					</div>
				</div>
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
	</div>
	<div class="mt-40"></div>
	<Footer />
</div>
