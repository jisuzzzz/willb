<script>
	import { goto } from '$app/navigation';
	let is_last = false;
	let password_hidden_toggle = true;
	let is_login = true;

	let user_id = '';
	let user_password = '';

	async function login() {
		const data = await fetch('/api/auth/login', {
			method: 'POST',
			body: JSON.stringify({ email: user_id, password: user_password })
		}).then((res) => res.json());
		if (data.error) return alert(data.error_msg);
		goto('/');
	}
</script>


<div class="flex justify-center w-full min-h-full">
	<div class="flex flex-col w-[372px] items-center my-24">
		<img class="w-[124px] h-[52px] mb-[55px]" alt="logo" src="./willb.png" />
		{#if is_login}
			<div class="space-y-[15px] w-full">
				<input
					bind:value={user_id}
					class="w-full h-[54px] px-[17px] py-[15px] text-[16px] border border-[#E2E2E2] rounded-[6px]"
					placeholder="아이디"
				/>
				<div class=" relative w-full">
					<input
						on:input={(e) => (user_password = e.target.value)}
						type={password_hidden_toggle ? 'password' : 'text'}
						class="w-full h-[54px] px-[17px] py-[15px] text-[16px] border border-[#E2E2E2] rounded-[6px]"
						placeholder="비밀번호"
					/>
					<button
						on:click={() => (password_hidden_toggle = !password_hidden_toggle)}
						class=" absolute right-[17px] top-[22px]"
					>
						<img alt="password_hideen_toggle_icon" src="password_hideen_toggle_icon.png" /><button
						/>
					</button>
				</div>
			</div>
			<button
				on:click={login}
				class="w-full h-[54px] px-[17px] py-[15px] text-[16px] bg-black text-white rounded-[6px] mt-[36px]"
				>로그인
			</button>
			<button
				on:click={() => (is_login = false)}
				class="w-full h-[54px] px-[17px] py-[15px] text-[14px] mt-[20px]"
				>회원가입
			</button>
		{/if}
		<div class="space-y-[7px] w-full mt-[34px] *:justify-center *:flex *:items-center">
			{#if !is_login}
				<a
					href="/signup"
					class=" relative w-full h-[54px] py-[10px] text-[13px] bg-black text-white rounded-[6px] border border-[#E2E2E2]"
					><img
						class=" absolute left-[25px] top-1/2 -translate-y-1/2 w-[45px] h-[19px]"
						alt="willb_login_logo"
						src="willb.png"
					/>
					<p>일반 회원가입</p>
				</a>
			{/if}
			<button
				class=" relative w-full h-[54px] py-[10px] text-[13px] bg-white text-[#757575] rounded-[6px] border border-[#E2E2E2]"
				><img
					class="absolute left-[25px] top-1/2 -translate-y-1/2 w-[22px] h-[22px]"
					alt="google_login_logo"
					src="google_login_logo.png"
				/>
				<p>Google 계정으로 로그인</p>
				<p />
			</button>
			<button
				class=" relative w-full h-[54px] px-[17px] py-[15px] text-[13px] bg-[#03C75A] text-white rounded-[6px] border border-[#E2E2E2]"
			>
				<img
					class=" absolute left-[25px] top-1/2 -translate-y-1/2 w-[15px] h-[15px]"
					alt="naver_login_logo"
					src="naver_login_logo.png"
				/>
				<p>NAVER 계정으로 로그인</p>
				<p />
			</button>
			<button
				class=" relative w-full h-[54px] px-[17px] py-[15px] text-[13px] bg-[#FFE700] text-[#3C1F1E] rounded-[6px] border border-[#E2E2E2]"
			>
				<img
					class=" absolute left-[25px] top-1/2 -translate-y-1/2 w-[20px] h-[18px]"
					alt="kakao_login_logo"
					src="kakao_login_logo.png"
				/>
				<p>KAKAO 계정으로 로그인</p>
				<p />
			</button>
		</div>
	</div>
</div>
