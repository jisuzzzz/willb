<script>
    import Header from "../../../@components/Header.svelte";
    import Footer from "../../../@components/Footer.svelte";
    import { goto } from "$app/navigation";

    export let data;
    // console.log(data.props);

    let is_login = data.props?.is_login;
    let user = data.props?.user || {};
    // console.log(user);

    let notifications = data.props?.noti || [];
	notifications = notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
	// console.log(notifications)
	let show_noti = false;

    let new_nick, new_email, new_desc;
    let file = null;
    let img_url = '';
    let default_img = 'https://fxecjwxkajutxkbsahge.supabase.co/storage/v1/object/public/bu/profile_image/user-profile.png';

    let profile = {
        profile_image: default_img,
        nickname: user.nickname,
        my_desc: user.my_desc,
    };

    let modify_nick = false;
    let modify_email = false;
    let modify_desc = false;
    let modify_img = false;

    function modifyNick() {
        modify_nick = !modify_nick;
    }
    function modifyEmail() {
        modify_email = !modify_email;
    }
    function modifyDesc() {
        modify_desc = !modify_desc;
    }
    function cancel_modify() {
        modify_img = !modify_img;
        img_url = '';
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

    async function update() {
        const data = await fetch('/api/user', {
            method: 'POST',
            body: JSON.stringify({
                user_id: user.id,
                new_data: profile,
            })
        })
        const res = await data.json();
        if (res.error) return alert(res.error_msg);
        // console.log(res);

        user.profile_image = res.res[0]?.profile_image;
        user.nickname = res.res[0]?.nickname;
        user.my_desc = res.res[0]?.my_desc;
    }

    function updateProfile(key, value) {
        profile[key] = value;
        update();
        if(key === 'nickname')
            modifyNick();
        else if(key === 'my_desc')
            modifyDesc();
        else return;
    }

    async function updateImg() {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('id', user.id);

        const data = await fetch('/api/user/profile_image' ,{
            method: 'POST',
            body: formData
        });
        const res = await data.json();
        if (res.error) return alert(res.error_msg);
        // console.log(res);
        user.profile_image = res.new_img[0]?.profile_image;
        modify_img = !modify_img;
        alert('수정 성공');
    }

    function handleFileChange(event) {
		file = event.target.files[0];
		if (file && file.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = (e) => {
				img_url = e.target.result;
			};
			reader.readAsDataURL(file);
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

    function openFilePicker() {
        if (fileInput) {
            fileInput.click();
        }
        modify_img = !modify_img;
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
			<div class="justify-center mb-6 border-gray-500 border-b pb-4">
				<h2 class="text-2xl text-white font-bold">프로필 수정</h2>
            </div>
            <div class="flex flex-row w-full h-32 itmes-center justify-between border-b border-gray-500 pl-5 pr-5">
                <div class="flex flex-row w-1/2 h-32 items-center">
                    {#if !img_url}
                        <img 
                        class="rounded-full h-20 w-20 object-cover shadow-lg"
                        src={user.profile_image}
                        alt="">
                    {:else}
                        <img 
                        class="rounded-full h-20 w-20 object-cover shadow-lg"
                        src={img_url}
                        alt="">
                    {/if}
                    <div class="flex flex-col h-20 text-white ml-5 justify-center">
                        <p>
                            {user.nickname}
                        </p>
                        <div class="flex flex-row mt-3">
                            <button 
                                class="text-white text-sm border px-2 py-1 rounded-md border-white justify-end mr-3 transition-colors hover:text-gray-900 hover:bg-gray-100"
                                on:click={openFilePicker}    
                            >
                                이미지 수정
                            </button>
                            <input 
                                type="file"
                                accept="image/*"
                                on:change={handleFileChange}
                                class="hidden"
                                id="fileInput"
                            />
                            {#if modify_img}
                            <div class="justify-between space-x-[7px]">
                                <button 
                                    class="text-white text-sm border px-2 py-1 rounded-md border-white transition-colors hover:text-gray-900 hover:bg-gray-100"
                                    on:click={updateImg}
                                >
                                    확인
                                </button>
                                <button 
                                    class="text-black bg-gray-200 text-sm border px-2 py-1 rounded-md border-gray-200 transition-colors hover:text-gray-900 hover:bg-gray-100"
                                    on:click={cancel_modify}
                                >
                                    취소
                                </button>
                            </div>
                            {:else}
                            <button 
                                class="text-white text-sm border px-2 py-1 rounded-md border-white justify-end transition-colors hover:text-gray-900 hover:bg-gray-100"
                                on:click={() => updateProfile('profile_image', default_img)}
                            >
                                삭제
                            </button>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex flex-col justify-start items-start w-[550px]">
                <h2 class="text-white text-bold text-md mt-8">프로필 정보</h2>
                <h3 class="text-gray-500 text-sm mt-4 mb-2">@닉네임</h3>
                {#if !modify_nick}
                <div class="flex flex-row w-full itmes-center justify-between border-b border-gray-500">
                    <span class="text-gray-200">{user.nickname}</span>
                    <button 
                        class="text-gray-500 h-9 w-max px-3 rounded-lg border border-gray-500 mb-2 transition-colors hover:bg-gray-200 hover:text-gray-900"
                        on:click={modifyNick}    
                    >
                        수정
                    </button>
                </div>
                {:else}
                <div class="flex flex-row w-full itmes-center justify-between border-b border-white">
                    <label for="nickname">
                        <input
                            id="nickname"
                            type="text"
                            class="bg-[#1a1a1a] border-none outline-none text-white w-[345px] h-full"
                            placeholder="{user.nickname}"
                            on:input={(e) => (new_nick = e.target.value)}
                        />
                    </label>
                    <div>
                        <button 
                            class="text-gray-500 h-9 w-max px-3 rounded-lg border border-gray-500 mb-2 transition-colors hover:bg-gray-200 hover:text-gray-900"
                            on:click={modifyNick}    
                        >
                            취소
                        </button>
                        <button 
                            class="text-black h-9 w-max px-3 bg-white rounded-lg border border-gray-500 mb-2 transition-colors hover:bg-gray-900 hover:text-gray-100"
                            on:click={() => updateProfile('nickname', new_nick)}    
                        >
                            변경
                        </button>
                    </div>
                </div>
                {/if}
                <h3 class="text-gray-500 text-sm mt-4 mb-2">아이디</h3>
                {#if !modify_email}
                <div class="flex flex-row w-full itmes-center justify-between border-b border-gray-500">
                    <span class="text-gray-200">{data.props.email}</span>
                    <button 
                        class="text-gray-500 h-9 w-max px-3 rounded-lg border border-gray-500 mb-2 transition-colors hover:bg-gray-200 hover:text-gray-900"
                        on:click={modifyEmail}
                    >
                        수정
                    </button>
                </div>
                {:else}
                <div class="flex flex-row w-full itmes-center justify-between border-b border-white">
                    <label for="email">
                        <input
                            id="email"
                            type="text"
                            class="bg-[#1a1a1a] border-none outline-none text-white w-[345px] h-full"
                            placeholder="{data.props.email}"
                            on:input={(e) => (new_email = e.target.value)}
                        />
                    </label>
                    <div>
                        <button 
                            class="text-gray-500 h-9 w-max px-3 rounded-lg border border-gray-500 mb-2 transition-colors hover:bg-gray-200 hover:text-gray-900"
                            on:click={modifyEmail}    
                        >
                            취소
                        </button>
                        <button 
                            class="text-black h-9 w-max px-3 bg-white rounded-lg border border-gray-500 mb-2 transition-colors hover:bg-gray-900 hover:text-gray-100"
                            on:click={modifyEmail}    
                        >
                            변경
                        </button>
                    </div>
                </div>
                {/if}
                <h3 class="text-gray-500 text-sm mt-4 mb-2">소개</h3>
                {#if !modify_desc}
                <div class="flex flex-row w-full itmes-center justify-between border-b border-gray-500">
                    <span class="text-gray-200">{user.my_desc}</span>
                    <button 
                        class="text-gray-500 h-9 w-max px-3 rounded-lg border border-gray-500 mb-2 transition-colors hover:bg-gray-200 hover:text-gray-900"
                        on:click={modifyDesc}
                    >
                        수정
                    </button>
                </div>
                {:else}
                <div class="flex flex-row w-full itmes-center justify-between border-b border-white">
                    <label for="desc">
                        <input
                            id="desc"
                            type="text"
                            class="bg-[#1a1a1a] border-none outline-none text-white w-[345px] h-full"
                            placeholder="{user.my_desc}"
                            on:input={(e) => (new_desc = e.target.value)}
                        />
                    </label>
                    <div>
                        <button 
                            class="text-gray-500 h-9 w-max px-3 rounded-lg border border-gray-500 mb-2 transition-colors hover:bg-gray-200 hover:text-gray-900"
                            on:click={modifyDesc}    
                        >
                            취소
                        </button>
                        <button 
                            class="text-black h-9 w-max px-3 bg-white rounded-lg border border-gray-500 mb-2 transition-colors hover:bg-gray-900 hover:text-gray-100"
                            on:click={updateProfile('my_desc', new_desc)}    
                        >
                            변경
                        </button>
                    </div>
                </div>
                {/if}
            </div>
        </div>
    </div>
    <div class="mt-40"></div>
    <Footer />
</div>