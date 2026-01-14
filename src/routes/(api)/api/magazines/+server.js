import supabase from '$lib/server/db';

export async function POST({ request, locals }) {
try {
    const user = locals.user;

    if(!user) {
        return new Response(JSON.stringify({ error: true, message: "Unauthorized" }), { status: 401 });
    }
    const formData = await request.formData();
    const files = formData.getAll('images');
    // console.log(files);
    const contents = formData.getAll('contents');

    if (!files || !contents) {
        return new Response(JSON.stringify({ error: true, message: "Required fields are missing" }), { status: 400 });
    }
    // console.log(contents);
    const qa_list = [];
    const tmp_list = contents[0].trim().split('\r\n');
    const header_list = [];
    header_list.push({
        title: tmp_list[0],
        sub_title: tmp_list[1],
        summary: tmp_list[2]
    });

    for (let idx = 1; idx < contents.length; idx++) {
        const tmp = contents[idx].trim().split('\r\n');
        // console.log(tmp);
    
        for (let i = 0; i < tmp.length; i += 2) {
            if (!tmp[i] || !tmp[i + 1]) {
                throw new Error("Invalid data pair" + idx);
            }
    
            const que = tmp[i];
            const ans = tmp[i + 1];
    
            qa_list.push({
                question: que,
                answer: ans,
                index: idx
            });
        }
    }
    // console.log("header: ",header_list);
    // console.log("qa_list: ",qa_list);
    const urls = [];

    for (const file of files) {
        const timestamp = new Date().getTime();
        const randomNum = Math.floor(Math.random() * 1000); // 0과 999 사이의 래덤 숫자
        const fileExtension = file.name.split('.').pop(); // 확장자 추출
        const fileName = `image-${timestamp}-${randomNum}.${fileExtension}`; // 고유한 파일 이름 생성
    
        const filePath = `magazine_image/${encodeURIComponent(fileName)}`; // 파일 경로 설정

        const { data:img,error: uploadError } = await supabase.storage.from('bu').upload(filePath, file);

        if (uploadError) {
            throw new Error(`Upload Error: ${uploadError.message}`);
        }
        
        const { data, error: urlError } = await supabase.storage.from('bu').getPublicUrl(filePath);

        if (urlError) {
            throw new Error(`URL Retrieval Error: ${urlError.message}`);
        }
        urls.push(data.publicUrl);
    }
    // console.log(urls);

    const { data: interview, error } = await supabase.rpc('post_magazine', {
        header_list_json: header_list,
        qa_list_json: qa_list,
        urls
    });
    if (error) {
        throw error;
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: true, message: error.message || "An error occurred" }), { status: 500 });
    }
}

