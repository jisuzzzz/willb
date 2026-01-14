<script>
    import Header from "../../@components/Header.svelte";
    import Footer from "../../@components/Footer.svelte";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    
    export let data;
    // console.log(data);
    let start_yts = data.props?.youtube;

    let is_login = data.props?.is_login;
    // let youtubes = data.props.youtube.slice(0,4);
    let youtubes = [];
    // console.log(youtubes)
    let load_cnt = 4;

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

    function loadMore() {
		const next_yts = start_yts.slice(youtubes.length, youtubes.length + load_cnt);
		youtubes = youtubes.concat(next_yts);
		if (youtubes.length >= start_yts.length) {
			document.getElementById('loadMoreButton').style.display = 'none';
		}
	}

    function sortByViewAndDate() {
        youtubes = start_yts.sort((a,b) => {
            if (b.total_views - a.total_views !== 0){
                return b.total_views - a.total_views;
            }
            return new Date(b.publish_date) - new Date(a.publish_date);
        }).slice(0,4);
    }

    onMount(() => {
        sortByViewAndDate(); 
    });

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
        <main class="flex w-full gap-4 px-4 py-12 md:px-40 ">
            <div class="flex-1">
                <h2 class="text-2xl text-white font-bold mb-6 border-gray-500 border-b pb-4">유튜브</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mt-10">
                    {#each youtubes as yt}
                    <div class="youtube-container w-full">
                        <iframe width="100%" height="315" src={yt.video_link} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                        <div class="text-left w-[550px] overflow-x-visible">
							<div class="flex justify-between mt-3">
								<span class="text-gray-600 text-xs">유튜브</span>
								<span class="text-right text-gray-600 text-xs">읽음 {yt.total_views} • {yt.publish_date}</span>
							</div>
							<h3 class="font-bold text-white mb-1 mt-2">{yt.video_title}</h3>
						</div>
                    </div>
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