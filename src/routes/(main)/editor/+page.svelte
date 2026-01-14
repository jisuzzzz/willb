<script>
	import Header from '../../@components/Header.svelte';
	import Footer from '../../@components/Footer.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let quill;

	async function getEditorText() {
		let delta = quill.getContents();
		// console.log(delta);
		submitServer(delta);
		// return text;
	}

	function formattingData(delta) {
		const texts = [];
		const images = [];

		delta.ops.forEach((op) => {
			if (typeof op.insert === 'string') {
				texts.push(op.insert.replace(/\n{2,}/g, '\n'));
			} else if (op.insert.image) {
				images.push(op.insert.image);
			}
		});
		// console.log(texts);
		return { texts, images };
	}
	function base64ToBlob(base64, mimeType) {
		const byteCharacters = atob(base64.split(',')[1]);
		const byteNumbers = new Array(byteCharacters.length);
		for (let i = 0; i < byteCharacters.length; i++) {
			byteNumbers[i] = byteCharacters.charCodeAt(i);
		}
		const byteArray = new Uint8Array(byteNumbers);
		return new Blob([byteArray], { type: mimeType });
	}

	async function submitServer(delta) {
		const { texts, images } = formattingData(delta);
		const formData = new FormData();

		texts.forEach((txt, idx) => {
			formData.append('contents', txt);
		});

		
		images.forEach((img, idx) => {
			const mimeType = img.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)[1];
			const blob = base64ToBlob(img, mimeType);
			formData.append('images', blob);
		});

		try {
			const data = await fetch('/api/magazines', {
				method: 'POST',
				body: formData
			});
			if (!data.ok) {
				const errorBody = await data.json();
            	throw new Error(`Server error: ${errorBody.message}`);
			} else {
				const result = await data.json(); 
				console.log('Server responded with:', result);
				alert("등록 성공");
				goto('/magazine');
			}
		} catch (error) {
			console.error('Error message:', error);
		}
	}

	onMount(() => {
		const script = document.createElement('script');
		script.src = 'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js';
		script.onload = () => {
			quill = new Quill('#editor', {
				modules: {
					toolbar: [
						[{ header: [1, 2, false] }],
						['bold', 'italic', 'underline'],
						['image', 'code-block']
					]
				},
				placeholder: '텍스트를 입력하세요...',
				theme: 'snow'
			});
		};
		document.body.appendChild(script);
	});
</script>

<svelte:head>
	<link href="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css" rel="stylesheet" />
</svelte:head>

<div class="bg-[white] min-h-screen">
	<Header />
		<div class="px-8 py-6 md:px-40 bg-white">
			<div class="items-start mb-6 border-gray-500 border-b pb-3">
				<h2 class="text-3xl text-black font-bold mb-2">편집기</h2>
				<button
					class="items-end inline-flex px-2 h-9 items-center text-md bg-black text-white rounded-md transition-colors hover:bg-gray-100 hover:text-gray-900"
					on:click={getEditorText}>등록하기</button>
			</div>
			<div id="editor"></div>
		</div>
		<div class="mt-40"></div>
	<Footer />
</div>

<style>
	#editor {
		height: 700px;
		overflow-y: auto;
		background-color: white;
	}
</style>
