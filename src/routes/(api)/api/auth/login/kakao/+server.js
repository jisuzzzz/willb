import supabase from '$lib/server/db';
import { redirect } from '@sveltejs/kit';


export async function GET( ) {
    
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
    })
    if (error) return new Response(JSON.stringify({error_msg: error.message}));

    if (data.url) {
    console.log(data.url)
    return redirect(300, data.url);
    }
}




// export async function DELET(request) {
//     const { error } = await supabase.auth.signOut();
//     if (error) return { status: 500, body: { error } };
//     return {
//         status: 200,
//         body: {}
//     };
// }
