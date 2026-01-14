<script>
    import Header from "../../@components/Header.svelte";
    import Footer from "../../@components/Footer.svelte";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

	// export let data;
	// console.log(data.props.search);
	// console.log(data);
	// let d = data.props.search[0];
	// console.log(d);


    let is_login = false;


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
			<a class="inline-flex items-center text-xs transition-colors hover:text-white" href="/login">
				알림
			</a>
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
		
	</div>
</div>