<script>
    let show_popup = false;
	let file;
	let img_url = '';
	let content = '';
	let hashtag = '';

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

	function togglePopup() {
		show_popup = !show_popup;
		if (!show_popup) {
			img_url = '';
			content = '';
			hashtag = '';
			file = null;
		}
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
</script>
<div class="flex flex-col bg-[#262626] lg:w-[538px] 2xl:w-[654px] rounded-lg shadow-xl">
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
    </div>						
</div>