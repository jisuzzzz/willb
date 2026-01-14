<!-- <script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.1/kakao.min.js"
        integrity="sha384-kDljxUXHaJ9xAb2AzRd59KxjrFjzHa5TAoFQ6GbYTCAG0bjM55XohjjDT7tDDC01"
        crossorigin="anonymous"> -->
<script>
    
    async function kakao_login() {
        const data = await fetch('/api/auth/login/kakao', {
            method: 'GET',
            body: JSON.stringify({})
        }).then((res) => res.json());
        if (data.error) return alert(data.error_msg);
        alert('success kakao login'); 
    }
</script>

<div class="signin-container flex flex-col items-center justify-center h-screen">
    <a
        href="https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=6ZkbI3j8SrToc7iErsp3C7JO6dKpuVQo&redirect_uri=https://fxecjwxkajutxkbsahge.supabase.co/auth/v1/callback"
    >
        <img
            src="/kakao_login.png"
            alt="kakao_login"
            class="mx-auto px-4 py-6"
        />
    </a>
</div>