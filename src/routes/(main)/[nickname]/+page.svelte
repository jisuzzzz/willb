<script>
	import Header from '../../@components/Header.svelte';
	import Footer from '../../@components/Footer.svelte';
	import Input from '../../@components/Input.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	export let data;
	// console.log(data.props);
	// let feeds = data.props.data.feeds;
	let user = data.props?.user;
	// console.log(user);
	let is_login = data.props?.is_login;
	// console.log(feeds);

	// console.log(data.userData);
	let notifications = data.props?.noti || [];
	notifications = notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
	// console.log(notifications)
	let show_noti = false;

	// let start_feeds = data.props.data?.feeds;
	let start_feeds = data.props.data.feeds?.map((feed) => ({
		...feed,
		liked: feed.liked_users ? feed.liked_users.includes(user.id) : false
	}));
	// console.log(start_feeds);
	let feeds = [];
	let load_cnt = 4;

	function sortByDate() {
		feeds = start_feeds.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8);
	}

	onMount(() => {
		sortByDate();
	});

	function loadMore() {
		const next_feeds = start_feeds.slice(feeds.length, feeds.length + load_cnt);
		feeds = feeds.concat(next_feeds);
		if (feeds.length >= start_feeds.length) {
			document.getElementById('loadMoreButton').style.display = 'none';
		}
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

	let show_popup = false;
	let file;
	let img_url = '';
	let content = '';
	let hashtag = '';
	function togglePopup() {
		show_popup = !show_popup;
		if (!show_popup) {
			img_url = '';
			content = '';
			hashtag = '';
			file = null;
		}
	}

	async function uploadFile() {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('content', content);

		const tags_arr = hashtag.split('#')
    		.filter(tag => tag.trim() !== '')  
    		.map(tag => '#' + tag.trim());  
		formData.append('hashtags', JSON.stringify(tags_arr));

		const data = await fetch('http://localhost:5173/api/feeds', {
			method: 'POST',
			body: formData
		});
		// console.log(data);
		const res = await data.json();
		if (data.ok) {
			console.log('File and content uploaded successfully', res);
			togglePopup();
			window.location.reload();
			// console.log(data);
		} else console.log('Upload failed', res);
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

	function handleContentChange(event) {
		content = event.target.value;
	}

	function handleHashtagChange(event) {
    	hashtag = event.target.value;
  	}

	  
	function clickInput() {
		document.getElementById('fileInput').click();
	}

	function goBack() {
		window.history.back();
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
	// console.log(data.userData.profile_image);
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
				on:click={showNoti}>
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
											{notis.noti_type === 'comment' ? '댓글을 남겼습니다.' : '회원님의 사진을 좋아합니다'}d
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
		{#if show_popup}
			<div class="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
				<div class="flex flex-col bg-[#262626] lg:w-[867px] 2xl:w-[989px] rounded-lg shadow-xl">
					<div class="flex justify-between items-center p-3 border-b border-[#363636]">
						<button
							class="text-[15px] text-white"
							on:click={togglePopup}>
							취소
						</button>
						<h2 class="text-base font-semibold text-white">
							새 게시물 만들기
						</h2>
						<button 
							class="text-[15px] text-blue-500 hover:text-gray-200"
							on:click={uploadFile}>
							업로드
						</button>
					</div>
					<div class="flex w-full h-[682px]">
						<input
							type="file"
							accept="image/*"
							on:change={handleFileChange}
							id="fileInput"
							class="hidden"
						/>
						<div
							class="lg:w-[538px] 2xl:w-[654px] h-full flex justify-center items-center bg-none border-t border-r border-[#363636]"
						>
							{#if img_url}
								<div class="bg-black w-full h-full">
									<img src={img_url} alt="Preview" class="w-full h-full" />
								</div>
							{:else}
								<div class="flex flex-col justify-center items-center">
									<span class="text-2xl text-gray-200 mb-4">사진을 선택하세요!</span>
									<button on:click={() => clickInput()} class="px-4 py-2 bg-blue-500 rounded-lg text-white text-sm">컴퓨터에서 선택</button>
								</div>
							{/if}
						</div>
						<div class="flex flex-col lg:w-[329px] 2xl:w-[335px] h-full">
							<div class="flex p-4 items-center">
								<img
									class="rounded-full object-cover h-8 w-8 shadow-lg"
									alt="Profile"
									src={data.props.userData?.profile_image}
								/>
								<span class="ml-4 font-semibold text-sm text-gray-100">{data.props?.nickname}</span>
							</div>
							<textarea
								class="w-full h-[231px] px-4 border-b border-[#363636] bg-[#262626] text-white text-[15px] resize-none focus:outline-none"
								placeholder="텍스트를 입력하세요..."
								on:input={handleContentChange}
							/>
							<textarea
								class="p-4 border-b border-[#363636] bg-[#262626] text-white text-sm resize-none focus:outline-none"
  								placeholder="헤시태그를 입력하세요..."
  								onfocus="this.placeholder='예시: #스트릿 #데일리 #미니멀'"
  								onblur="this.placeholder='헤시태그를 입력하세요...'"
								on:input={handleHashtagChange}
							/>
						</div>
					</div>						
				</div>
			</div>
		{/if}
		<main class="flex w-full gap-4 px-4 py-8 md:px-40">
			<div class="flex-1">
				<div class="flex items-center justify-start text-white border-gray-500 border-b pb-7">
					<div class="flex items-center space-x-3 justify-between">
						<div class="flex h-20 w-20 shrink-0 overflow-hidden rounded-full mr-2">
							<img
								class="rounded-full object-cover h-full w-full border-2 border-gray-100 shadow-lg"
								alt="Profile"
								src="{data.props.userData?.profile_image}?height=40&amp;width=40"
							/>
						</div>
						<div>
							<div class="text-md">{data.props?.nickname}</div>
							<div class="text-xs text-gray-400">{data.props.userData?.my_desc}</div>
						</div>
						<button
							class="inline-flex items-center rounded-md text-sm font-medium bg-white text-black hover:bg-gray-200 disabled:opacity-50 h-6 px-4 py-2 ml-2"
						>
							팔로우
						</button>
						{#if is_login && data.props.nickname === data.props.user?.nickname}
							<button
								class="p-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded hover:bg-gray-300"
								on:click={togglePopup}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="h-6 w-6 text-white"
								>
									<path d="M5 12h14"></path>
									<path d="M12 5v14"></path>
								</svg>
							</button>
						{/if}
					</div>
				</div>
				<div class="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
					{#each feeds as feed}
						<button
							class="w-full aspect-ratio-1 bg-transparent p-0 border-none"
							on:click={() => goto(`${data.props.userData?.id}/${feed.feed_id}`)}
						>
							<div class="flex flex-col">
								<img
									src={feed.images}
									alt=""
									class="object-cover w-full h-full transform-gpu hover:scale-[1.07] transition-transform"
									style="aspect-ratio: 1/1; object-fit: cover;"
								/>
								<div class="flex items-center justify-between w-full mt-2 mb-2">
									<div class="text-xs text-white text-left">{feed.content}</div>
									<div class="flex items-center text-gray-300 text-xs">
										<button 
											class="mr-1"
											on:click|stopPropagation={(event) => {
												event.stopPropagation();
											}}
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
								<p class="text-xs text-white mb-2 text-left">#미니멀 #스트릿</p>
							</div>
						</button>
					{/each}
				</div>
				<div class="flex justify-center mt-6">
					<button
						id="loadMoreButton"
						class="inline-flex items-center justify-center w-full rounded-md text-sm font-medium border bg-background h-10 px-4 py-2 text-white border-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
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
