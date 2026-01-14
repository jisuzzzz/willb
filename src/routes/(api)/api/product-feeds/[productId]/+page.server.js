import supabase from '$lib/server/db';

export async function load({ params }) {
    const { productId } = params;

    const {data:productData, error:productError} = await supabase.rpc('get_product', {
        p_product_id: productId
    });
    console.log(productData);
    return {
        props: {
            productData
        }
    };
}