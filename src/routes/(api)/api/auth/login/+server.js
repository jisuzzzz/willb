import supabase from '$lib/server/db';
import { serialize } from 'cookie';

export async function POST({ request }) {
    const { email, password } = await request.json();
    if (email && password) {
        const { data: user, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            return new Response(JSON.stringify({ error: true, error_msg: error.message }), { status: 400 });
        } else {
            const accessToken = user.session.access_token;
            if (accessToken) {
                const headers = new Headers();
                headers.append('Set-Cookie', serialize('access_token', accessToken, {
                    path: '/',
                    httpOnly: true,
                    secure: false,
                    sameSite: 'strict',
                }));
                return new Response(JSON.stringify({ success: true , user}), { headers, status: 200 });
            } else {
                return new Response(JSON.stringify({ error: true, error_msg: "Access token not found" }), { status: 404 });
            }
        }
    }
    return new Response(JSON.stringify({ error: true, error_msg: "email & password is missing" }), { status: 400 });
}

export async function GET({}) {
    const { error } = await supabase.auth.signOut();

    const headers = new Headers({
        'Set-Cookie': serialize('access_token', '', {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            expires: new Date(0)
        })
    });
    if (error) {
        return new Response(JSON.stringify({ error: true, message: error.message }), { status: 400 });
    }
    return new Response(JSON.stringify({ success: true, message: 'Logged out successfully.' }), { status: 200, headers });
}