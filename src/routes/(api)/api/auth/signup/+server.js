import supabase from "$lib/server/db";

export async function POST({ request }) {    
try{
    const { email, password, name, nickname, profile_image, gender, birth } = await request.json();
    if (!email || !password || !name || !nickname || !gender || !birth) {
        return new Response(JSON.stringify({ error: true, message: "Required fields are missing"}), {status: 400});
    }
    if (gender !== 'M' && gender !== 'W') {
        return new Response(JSON.stringify({ error: true, message: "Invalid gender value" }), {status: 400});
    }
    const { data:user, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
    });
    if (signUpError) {
        throw signUpError;
    }
        const {data, error} = await supabase
        . from('users')
        .insert([
            {
                id: user.user.id,
                name,
                nickname,
                profile_image,
                gender,
                birth
            }
        ]);
        if (error) {
            throw error;
        }
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: true, message: error.message || "An error occurred" }), { status: 500 });
    }
}