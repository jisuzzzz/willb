<script>
	import Header from '../../../@components/Header.svelte';
	import Footer from '../../../@components/Footer.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	export let data;

	let user = data.props?.user || {};
	// console.log(user);
	// console.log(data.props);
	// let feed_data = data.props.feedData;
	let feed_data = {
		...data.props?.feedData,
		liked: data.props.feedData?.liked_users
			? data.props.feedData?.liked_users.includes(user.id)
			: false
	};
	let is_login = data.props?.is_login;
	// console.log(feed_data);
	let comments = data.props?.commentData || [];
	comments = comments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
	// console.log(comments);
	let com_cnt = comments.length;
	let feed_created_at = data.props.feedData?.feed.created_at;

	let notifications = data.props?.noti || [];
	notifications = notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
	// console.log(notifications)
	let show_noti = false;
	let modal_update = false;
	let modal_delete = false;
	let modify_feed = false;
	let modify_comment = false;

	// console.log(create_at);
	// const new_date = Math.floor((new Date() - new Date(created_at)) / (24 * 1000 * 60 * 60));
	let feed_format_time = '';
	// console.log(format_time);
	let comment = '';
	let tmp_del_com = {};
	let like_cnt = feed_data.like_cnt;
	let show_popup = false;
	let url = 'http://localhost:5173/api/feeds/replies/5';
	// let url = `http://localhost:5173/api/feeds/replies/${parent_id}`;

	function showNoti() {
		if (!is_login) {
			alert('로그인 후 이용하세요');
			goto('/login');
		}
		show_noti = !show_noti;
	}

	async function delNoti(id) {
		const data = await fetch('/api/notifications', {
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
		} else if (total_sec > 0){
			return `${total_sec}초`;
		} else {
			return `0초`;
		}
	}

	function toggle_modify_feed() {
		if (!is_login || !(user.id === feed_data.feed.user_id)) {
			modal_update = !modal_update;
			alert('본인이 아닙니다.')
			return;
		}
		modal_update = !modal_update;
		modify_feed = !modify_feed;
	}

	let content = '';

    async function updateFeed() {

		const data = await fetch('http://localhost:5173/api/feeds', {
			method: 'PATCH',
			body: JSON.stringify({content, feed_id: feed_data.feed.id })
		});
		// console.log(data);
		const res = await data.json();
		if (data.ok) {
			console.log('File and content uploaded successfully', res);
			toggle_modify_feed();
			window.location.reload();
			// console.log(data);
		} else console.log('Upload failed', res);
	}

	function toggle_update() {
		modal_update = !modal_update;
	}

	function toggle_update_comment() {
		modify_comment = !modify_comment;
	}

	async function deleteComment(id) {
		// console.log(id);
		const data = await fetch('/api/feeds/replies' ,{
			method: 'DELETE',
			body: JSON.stringify({id})
		}).then((res) => res.json());
		if (data.error) console.log(data);
		else {
			// console.log(data);
			toggle_update_comment();
			comments = comments.filter(comment => comment.reply_id !== id);
        	// console.log(comments);
		}
	}

	function toggle_delete() {
		if (!is_login || !(user.id === feed_data.feed.user_id)) {
			modal_update = !modal_update;
			alert('본인이 아닙니다.')
			return;
		}
		modal_update = !modal_update;
		modal_delete = !modal_delete
	}

	function toggle_popup() {
		if (!is_login) {
			goto('/login');
			return;
		}
		show_popup = !show_popup;
	}

	async function delete_feed() {
		const data = await fetch('/api/feeds' ,{
			method: 'DELETE',
			body: JSON.stringify({id:feed_data.feed.id})
		}).then((res) => res.json());
		if (data.error) console.log(data);
		else {
			goBack();
		}
	}

	async function toggle_like() {
		if (!is_login) {
			goto('/login');
			return;
		}
		const data = await fetch('/api/feeds/feed-likes', {
			method: 'POST',
			body: JSON.stringify({ feed_id: feed_data.feed.id })
		});
		const res = await data.json();
		if (res.action === 'added') {
			feed_data.liked = true;
			like_cnt += 1;
			await noti_like();
		} else if (res.action === 'removed') {
			feed_data.liked = false;
			like_cnt -= 1;
		} else {
			alert('An error occurred');
		}
	}

	async function noti_like() {
		const data = await fetch('/api/notifications', {
			method: 'POST',
			body: JSON.stringify({
				feed_id: feed_data.feed?.id,
				user_id: feed_data.feed?.user_id,
				trigger_user_id: user.nickname,
				noti_type: 'like'
			})
		}).then((res) => res.json());
		if (data.error) console.log(data.error);
	}

	async function noti_comment() {
		const data = await fetch('/api/notifications', {
			method: 'POST',
			body: JSON.stringify({
				feed_id: feed_data.feed?.id,
				user_id: feed_data.feed?.user_id,
				trigger_user_id: user.nickname,
				noti_type: 'comment'
			})
		}).then((res) => res.json());
		if (data.error) console.log(data.error);
	}

	function handleClick(comment) {
		// console.log(comment);
		if (comment.nickname === user.nickname) {
			toggle_update_comment();
			tmp_del_com = comment;
		} else {
			alert("You can only edit your own comments.");
		}
	}

	async function add_comment() {
		if (!is_login) goto('/login');
		const data = await fetch('/api/feeds/replies', {
			method: 'POST',
			body: JSON.stringify({ feed_id: feed_data.feed.id, comment })
		}).then((res) => res.json());
		if (data.error) return alert(data.error_msg);
		// console.log('res_data: ', data);

		const new_comment = {
			comment: data.data[0]?.comment,
			nickname: user.nickname,
			profile: user.profile_image,
			reply_id: data.data[0]?.id,
			created_at: data.data[0]?.created_at
		};
		comments = [...comments, new_comment];
		comment = '';
		com_cnt += 1;
		await noti_comment();
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

	function goBack() {
		window.history.back();
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
						<div
							class="flex justify-between items-center w-full text-2xl text-black font-bold border-b border-gray-500 p-4"
						>
							<h2>알림</h2>
							<button class="text-gray-500 text-base" on:click={showNoti}> 닫기 </button>
						</div>
						{#each notifications as notis}
							<div class="flex items-center mt-3 p-4 justify-between">
								<div class="flex flex-row space-x-2">
									<img
										src="/willb.png"
										alt="Profile"
										class="shadow-lg h-7 w-7 rounded-full border-black border-2 object-cover"
									/>
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
								<button class="text-md hover:text-gray-900" on:click={() => delNoti(notis.id)}>
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
	<div class="flex flex-col pt-32 items-center justify-center">
		<div class="w-[640px]">
			<div class="flex w-full items-center space-x-4 mt-4 mb-1 pb-4 justify-between">
				<div class="flex flex-row">
					<img
						src={feed_data.feed?.profile}
						alt="Profile"
						class="border-2 border-white shadow-lg h-11 w-11 rounded-full object-cover"
					/>
					<div class="ml-4">
						<button
							class="text-sm text-white font-medium hover:text-gray-400 disabled:opacity-50"
							on:click={() => goto(`/${feed_data.feed?.nickname}`)}
						>
							{feed_data.feed.nickname}
						</button>
						<div class="text-xs text-gray-400">팔로워 983명 팔로잉 164명</div>
					</div>
				</div>
				<div class="flex flex-row items-center mt-2">
					<button
						class="inline-flex items-center rounded-md text-sm font-medium bg-white text-black hover:bg-gray-200 disabled:opacity-50 h-7 px-4 py-2"
					>
						팔로우
					</button>
					<button 
						class="pl-3 text-gray-400 hover:text-gray-300"
						on:click={toggle_update}
					>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<circle cx="5" cy="12" r="2" fill="currentColor"/>
							<circle cx="12" cy="12" r="2" fill="currentColor"/>
							<circle cx="19" cy="12" r="2" fill="currentColor"/>
						</svg>
					</button>
					{#if modal_update}
        				<div class="fixed inset-0 bg-[#1a1a1a] bg-opacity-50 flex items-center justify-center">
            				<div class="bg-[#262626] w-[390px] h-auto rounded-lg shadow-lg">
								<div class="flex flex-col w-full h-full itmes-center">
									<button class="py-3 text-[#ED4956] border-b border-[#363636]" on:click={toggle_update}>신고</button>
									<button class="py-3 text-[#ED4956] border-b border-[#363636]" on:click={toggle_delete}>삭제</button>
									<button class="py-3 text-gray-100 border-b border-[#363636]" on:click={toggle_modify_feed}>수정</button>
									<button class="py-3 text-gray-100 border-b border-[#363636]" on:click={toggle_update}>링크 복사</button>
									<button class="py-3 text-gray-100" on:click={toggle_update}>취소</button>
								</div>
            				</div>
        				</div>
    				{/if}
					{#if modal_delete}
						<div class="fixed inset-0 bg-[#1a1a1a] bg-opacity-50 flex items-center justify-center">
							<div class="bg-[#262626] w-[390px] h-auto rounded-lg shadow-lg">
								<div class="flex flex-col w-full h-full itmes-center">
									<span class="py-7 text-center border-b border-[#363636]">
										<h2 class="text-white text-center text-xl pb-1">게시물을 삭제할까요?</h2>
										<p class="text-gray-400 text-center text-sm">이 게시물을 삭제하시겠어요?</p>
									</span>
									<button class="py-3 text-[#ED4956] border-b border-[#363636]" on:click={() => delete_feed()}>삭제</button>
									<button class="py-3 text-gray-100" on:click={toggle_delete}>취소</button>
								</div>
							</div>
						</div>
					{/if}
					{#if modify_feed}
						<div class="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
							<div class="flex flex-col bg-[#262626] lg:w-[867px] 2xl:w-[989px] rounded-lg shadow-xl">
								<div class="flex justify-between items-center p-3 border-b border-[#363636]">
									<button
										class="text-[15px] text-white"
										on:click={toggle_modify_feed}>
										취소
									</button>
									<h2 class="text-base font-semibold text-white">
										게시물 수정
									</h2>
									<button 
										class="text-[15px] text-blue-500 hover:text-gray-200"
										on:click={updateFeed}>
										완료
									</button>
								</div>
								<div class="flex w-full h-[682px]">
									<div class="bg-black lg:w-[538px] 2xl:w-[654px] h-full">
										<img src={feed_data.images} alt="Preview" class="w-full h-full" />
									</div>
									<div class="flex flex-col lg:w-[329px] 2xl:w-[335px] h-full">
										<div class="flex p-4 items-center">
											<img
												class="rounded-full object-cover h-8 w-8 shadow-lg"
												alt="Profile"
												src={feed_data.feed?.profile}
											/>
											<span class="ml-4 font-semibold text-sm text-gray-100">{feed_data.feed?.nickname}</span>
										</div>
										<textarea
											class="w-full h-[231px] px-4 border-b border-[#363636] bg-[#262626] text-white text-[15px] resize-none focus:outline-none"
											placeholder="{feed_data.feed?.content}"
											on:input={(e) => (content = e.target.value)}
										/>
										<textarea
											class="p-4 border-b border-[#363636] bg-[#262626] text-white text-sm resize-none focus:outline-none"
											placeholder="헤시태그를 입력하세요..."
											onfocus="this.placeholder='예시: #스트릿 #데일리 #미니멀'"
											onblur="this.placeholder='헤시태그를 입력하세요...'"
										/>
									</div>
								</div>						
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
		<div class="w-[640px] flex flex-col items-center justify-center">
			<img
				src={feed_data.images}
				alt=""
				class="w-[640px] h-[750px]"
				style="aspect-ratio: 3/4; object-fit: cover;"
			/>
		</div>
		<div class="flex flex-row w-[640px] justify-between mt-3 border-gray-500 border-t">
			<p class="text-xl text-white mt-2">
				{feed_data.feed?.content}
			</p>
			<div class="flex flex-row gap-3 text-white items-center">
				<button
					class="inline-flex mt-3 rounded-md transition-colors hover:text-gray-600"
					on:click={() => toggle_like()}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill={feed_data.liked === true ? '#D2042D' : 'none'}
						stroke={feed_data.liked === true ? '#D2042D' : 'currentColor'}
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="w-5 h-5 hover:scale-[1.2]"
					>
						<path
							d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
						></path>
					</svg>
				</button>
				<p class="text-m text-white mt-3">{like_cnt}</p>
				<button
					class="inline-flex mt-3 rounded-md transition-colors hover:text-gray-600"
					on:click|stopPropagation={toggle_popup}
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
						class="w-5 h-5 hover:scale-[1.2]"
					>
						<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
					</svg>
				</button>
				<p class="text-m text-white mt-3">{com_cnt}</p>
			</div>
		</div>
		<div class="flex flex-row w-[640px] justify-end">
			<p class="text-sm text-gray-600 mt-2">{formattingTime(feed_created_at)} 전</p>
		</div>
		{#if show_popup}
			<div class="bg-[#1a1a1a] w-[640px] overflow-y-auto h-[352px] justify-start mt-1 p-2 focus:disable">
				{#each comments as com}
					<div class="flex flex-row justify-between w-full items-center mb-2">
						<div class="flex flex-row space-x-2 items-center">
							<img
								src={com.profile}
								alt="Profile"
								class="shadow-lg h-7 w-7 rounded-full object-cover"
							/>
							<p class="text-sm text-gray-300">
								<strong class="pr-2 text-white">{com.nickname}</strong>
								{com.comment}
							</p>
						</div>
						<div class="itmes-center">
							<div class="text-[10px] text-gray-400">
								{formattingTime(com.created_at)} 전
							</div>
							<button
								class="text-[#1a1a1a] hover:text-gray-200"
								on:click|stopPropagation={() => handleClick(com)}
							>
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<circle cx="5" cy="12" r="2" fill="currentColor"/>
									<circle cx="12" cy="12" r="2" fill="currentColor"/>
									<circle cx="19" cy="12" r="2" fill="currentColor"/>
								</svg>
							</button>
						</div>
					</div>
					{#if modify_comment}
						<div class="fixed inset-0 bg-[#1a1a1a] bg-opacity-10 flex items-center justify-center">
							<div class="bg-[#262626] w-[390px] h-auto rounded-lg shadow-lg">
								<div class="flex flex-col w-full h-full itmes-center">
									<button class="py-3 text-[#ED4956] border-b border-[#363636]" on:click|stopPropagation={() => deleteComment(tmp_del_com.reply_id)}>삭제</button>
									<button class="py-3 text-gray-100" on:click={toggle_update_comment}>취소</button>
								</div>
							</div>
						</div>
					{/if}
				{/each}
			</div>
			<div
				class="flex bg-[#1a1a1a] text-white w-[640px] rounded-md border border-gray-500 items-center"
			>
				<input
					bind:value={comment}
					type="text"
					class="bg-[#1a1a1a] outline-none p-2 text-white flex-grow rounded-l-md"
					placeholder="댓글을 입력하세요."
				/>
				<button
					class="inline-flex items-center rounded-md text-sm font-medium bg-white text-black hover:bg-gray-100 h-7 px-4 py-2 mr-2"
					on:click={add_comment}
				>
					제출
				</button>
			</div>
		{/if}
	</div>
	<div class="mt-40"></div>
	<Footer />
</div>