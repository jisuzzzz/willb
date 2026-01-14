import supabase from '$lib/server/db';

export async function load({ params }) {
    const { replyId } = params;
    const {data:repliesData, error:replyError} = await supabase.rpc('get_replies', {
        p_parent_id: replyId,
        p_page: 2,
        p_limit: 5
    });
    // console.log(repliesData);
    return {repliesData};
}