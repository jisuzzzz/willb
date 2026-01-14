<script>
	import { goto } from '$app/navigation';

	let is_last = false;
	let password_match = true;
	let password_hidden_toggle = true;
	let email, password, password_for_dobule_check, name, nickname, gender, birth;

	async function submit() {
		const data = await fetch('/api/auth/signup', {
			method: 'POST',
			body: JSON.stringify({
				email,
				password,
				name,
				nickname,
				gender,
				birth: birth.slice(0, 4) + '-' + birth.slice(4, 6) + '-' + birth.slice(6, 8)
			})
		}).then((res) => res.json());
		console.log(data);
		alert(data);
	}

	async function next_page() {
		if (is_last) submit();
		else is_last = true;
	}

	async function previous_page() {
		if (is_last) is_last = false;
		else goto('/login');
	}

	async function dupl_check(nick) {
		const data = await fetch('/api/util/dupl-check', {
			method: 'POST',
			body: JSON.stringify({ nick })
		})
		if (data.ok) {
			console.log(data);
			alert("사용 가능한 닉네임입니다!");
		} else alert("이미 존재하는 닉네임입니다.")
	}
	
	$: password_match = password === password_for_dobule_check;
	$: {
		if (password && password_for_dobule_check && !password_match) {
      		console.log('비밀번호가 일치하지 않습니다.');
    	}
	}
</script>

<div class="flex justify-center w-full min-h-full">
	<div class="flex flex-col w-[837px] items-center my-12 min-h-screen pb-[100px]">
		<div class="relative w-full h-[107px] flex">
			<button class="ml-[9px]" on:click={previous_page}>
				<img alt="previous" src="./previous_button.png" />
			</button>
			<p class=" absolute left-1/2 -translate-x-1/2 top-1/2 text-[28px] font-medium ml-[19px]">
				회원가입
			</p>
		</div>
		{#if is_last}
			<div class="w-full border-b border-[#7F7F7F] mt-[32px] h-[51px]">
				<p class="text-[24px] font-bold ml-[19px]">계정 생성</p>
			</div>
			<div class="w-full mt-[32px]">
				<p class="text-[22px] font-semibold ml-[20px] mb-[20px]">아이디</p>
				<div class="flex w-full h-[67px] space-x-[10px] mb-[30px]">
					<input
						bind:value={email}
						class="text-[23px] font-light py-[21.5px] px-[18.5px] bg-[#] w-full h-[68px]
				border border-[#E2E2E2] rounded-[6px]"
						placeholder="ex) mmm@example.com"
					/>
					<button
						class="w-[143px] text-[23px] font-light rounded-[6px] border border-black text-black"
					>
						중복 확인
					</button>
				</div>
				<p class="text-[22px] font-semibold ml-[20px] mb-[20px]">비밀번호</p>
				<div class=" relative w-full">
					<input
						on:input={(e) => (password = e.target.value)}
						type={password_hidden_toggle ? 'password' : 'text'}
						class="w-full h-[68px] px-[18.5px] py-[18.5px] text-[23px] border border-[#E2E2E2] rounded-[6px]"
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
				<input
					on:input={(e) => (password_for_dobule_check = e.target.value)}
					type={password_hidden_toggle ? 'password' : 'text'}
					class="text-[23px] font-light py-[21.5px] px-[18.5px] bg-[#] w-full h-[68px]
				border border-[#E2E2E2] rounded-[6px] mb-[10px]"
					placeholder="비밀번호 확인"
				/>
				<p class={password_match ? 'text-green-500 pl-3 mb-5' : 'text-red-500 pl-3 mb-5'}>
					{password_match ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
				</p>
				  
				<p class="text-[22px] font-semibold ml-[20px] mb-[20px]">@닉네임</p>
				<div class="flex w-full h-[67px] space-x-[10px]">
					<input
						bind:value={nickname}
						class="text-[23px] font-light py-[21.5px] px-[18.5px] bg-[#] w-full h-[68px]
				border border-[#E2E2E2] rounded-[6px] mb-[30px]"
						placeholder="@ + 영어, 숫자, _, .를 조합해서 자유롭게 정해주세요."
					/>
					<button
						class="w-[143px] text-[23px] font-light rounded-[6px] border border-black text-black"
						on:click={() => dupl_check(nickname)}
					>
						중복 확인
					</button>
				</div>
			</div>
		{:else}
			<div class="w-full border-b border-[#7F7F7F] mt-[32px] h-[51px]">
				<p class="text-[24px] font-bold ml-[19px]">본인인증</p>
			</div>
			<div class="w-full mt-[32px]">
				<p class="text-[22px] font-semibold ml-[20px] mb-[20px]">이름</p>
				<input
					bind:value={name}
					class="text-[23px] font-light py-[21.5px] px-[18.5px] bg-[#] w-full h-[68px]
			border border-[#E2E2E2] rounded-[6px] mb-[30px]"
					placeholder="본명 입력"
				/>
				<p class="text-[22px] font-semibold ml-[20px] mb-[20px]">생년월일</p>
				<div class="flex w-full space-x-[10px]">
					<input
						bind:value={birth}
						class="text-[23px] font-light py-[21.5px] px-[18.5px] w-[684px] h-[68px]
		border border-[#E2E2E2] rounded-[6px]"
						placeholder="8자리 ex)19900101"
						maxlength="8"
					/>
					<div class="flex space-x-[7px]">
						<button
							class="w-[68px] h-[68px] text-[23px] rounded-[6px] border border-black flex justify-center items-center"
							on:click={() => { gender = 'M'; console.log(gender); }}
						>남
							<!-- <p class=" text-black text-center">남</p> -->
						</button>
						<button
							class="w-[68px] h-[68px] text-[23px] rounded-[6px] border border-black flex justify-center items-center"
							on:click={() => { gender = 'W'; console.log(gender); }}
						>여
							<!-- <p class=" text-black text-center">여</p> -->
						</button>
					</div>
				</div>
			</div>
		{/if}
		<button
			on:click={next_page}
			class=" fixed left-1/2 -translate-x-1/2 bottom-12 w-[598px] h-[60px] bg-black text-white rounded-[30px] text-[25px] font-bold"
		>
			다음
		</button>
	</div>
</div>
