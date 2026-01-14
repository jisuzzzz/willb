<script>
    import Header from "../../../@components/Header.svelte";
    import Footer from "../../../@components/Footer.svelte";
    export let data;
    // console.log(data);
    let interview = data.props.interview
    // console.log(interview)

    // let notifications = data.props?.noti || [];
	// notifications = notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
	// // console.log(notifications)
	// let show_noti = false;

    // function showNoti() {
	// 	if (!is_login){
    //         alert('로그인 후 이용하세요');
	// 		goto('/login');
	// 	}
	// 	show_noti = !show_noti;
	// }

	// async function delNoti(id) {
	// 	const data = await fetch('/api/notifications' ,{
	// 		method: 'DELETE',
	// 		body: JSON.stringify({ id })
	// 	}).then((res) => res.json());
	// 	if (data.error) alert(data.error);
	// 	else notifications = notifications.filter((noti) => noti.id != id);
	// }

	// function formattingTime(time) {
	// 	let total_sec = Math.floor((new Date() - new Date(time)) / 1000);
	// 	// console.log(total_sec);

	// 	if (total_sec >= 86400) {
	// 		return `${Math.floor(total_sec / 86400)}일`;
	// 	} else if (total_sec >= 3600) {
	// 		return `${Math.floor(total_sec / 3600)}시간`;
	// 	} else if (total_sec >= 60) {
	// 		return `${Math.floor(total_sec / 60)}분`;
	// 	} else {
	// 		return `${total_sec}초`;
	// 	}
	// }

    let grouped_data = {};
    interview.question?.forEach((question, i) => {
        let idx = interview.index[i];
        if (!grouped_data[idx]) {
            grouped_data[idx] = {
                questions: [],
                answers: [],
                images: []
            };
            grouped_data[idx].images.push(interview.url[idx-1]);
        }
        grouped_data[idx].questions.push(question);
        grouped_data[idx].answers.push(interview.answer[i]);
    });
    // console.log(grouped_data);
</script>


<div class="bg-[#1a1a1a] min-h-screen">
    <Header />
    <main class="flex flex-col items-center justify-center">
        <div class="w-1/2 my-10">
            <h1 class="text-3xl text-white font-bold self-start">{interview.title}</h1>
            <h2 class="text-white text-2xl text-center m-7">Summary</h2>
            <h3 class="text-sm text-gray-400 self-start">{interview.summary}</h3>
        </div>
        {#each Object.values(grouped_data) as group}
            <div class="w-1/2 flex flex-col items-center justify-center my-10">
                {#if group.images.length > 0}
                    <img src={group.images[0]} alt="images" class="w-full h-full object-cover" />
                {/if}
                <div class="justify-start mt-20">
                    {#each group.questions as question, idx}
                        <strong class="text-l text-white">? {question}</strong>
                        <p class="text-sm text-gray-400 mt-2 mb-10">! {group.answers[idx]}</p>
                    {/each}
                </div>
            </div>
        {/each}
    </main>
    <div class="mt-40"></div>
    <Footer />
</div>