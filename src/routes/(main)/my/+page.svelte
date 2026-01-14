<script>
    import Header from "../../@components/Header.svelte";
    import Footer from "../../@components/Footer.svelte";
    import { goto } from "$app/navigation";

    export let data;
    let is_login = data.props?.is_login;
    let user = data.props?.user || {};
    let user_email = data.props?.email;

    let notifications = data.props?.noti || [];
	notifications = notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
	// console.log(notifications)
	let show_noti = false;

    // console.log(data.props.detail)

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
        <Header/>
    </div>
    <div class="pt-32">
        <div class="px-4 py-12 md:px-40">
            <div class="justify-center mb-6 border-gray-500 border-b pb-4">
                <h2 class="text-2xl text-white font-bold"> 마이페이지 </h2>
            </div>
            <div class="flex flex-row w-full h-32 items-center justify-between border rounded-md border-gray-500 pl-5 pr-5">
                <div class="flex flex-row w-1/2 h-32 items-center">
                    <img 
                        class="rounded-full h-20 w-20 object-cover shadow-lg"
                        src={user.profile_image}
                        alt="">
                    <div class="flex flex-col h-20 text-white ml-5 justify-center">
                        <p>
                            {user.nickname}
                        </p>
                        <p class="text-gray-400">
                            {user_email}
                        </p>
                    </div>
                </div>
                <div class="flex flex-row items-end">
                    <button 
                        class="text-white text-sm border px-4 py-2 rounded-md border-white justify-end mr-5 transition-colors hover:text-gray-900 hover:bg-gray-100"
                        on:click={() => goto('/my/my-edit')}
                    >
                        프로필 수정
                    </button>
                    <button 
                        class="text-white text-sm border px-4 py-2 rounded-md border-white justify-end transition-colors hover:text-gray-900 hover:bg-gray-100"
                        on:click={() => goto(`/${user.nickname}`)}
                    >
                        내 스타일
                    </button>
                </div>
            </div>

        </div>
    </div>
    <div class="mt-40"></div>
    <Footer />
</div>