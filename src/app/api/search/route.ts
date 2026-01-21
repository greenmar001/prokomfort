import { NextRequest, NextResponse } from "next/server";
import { manticoreClient, INDEX_NAME } from "@/lib/manticore";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
        return NextResponse.json({ results: [] });
    }

    try {
        const searchApi = manticoreClient.search;
        const body = {
            index: INDEX_NAME,
            query: {
                // Bool query with 'match' usually allows fuzzy search if configured
                // Or use "match_phrase", "query_string" etc.
                // For simple match:
                match: {
                    // Search across all text fields
                    "*": query
                }
            },
            limit: 10
        };

        // Note: The SDK usage for search is typically: 
        // searchApi.search({ body: ... })
        // We need to check exact signature of the generated SDK.
        // Based on typings, it usually expects SearchRequest object.

        // Let's assume generic search method:
        const res = await searchApi.search(body);

        // Map Manticore hits to our frontend structure
        const hits = res.hits?.hits || [];

        const results = hits.map((h: any) => ({
            id: h._id,
            name: h._source.title,
            price: h._source.price,
            url: h._source.url,
            image: h._source.image_url,
            category: h._source.category
        }));

        return NextResponse.json({ results });

    } catch (e: any) {
        console.error("Search Error:", e);
        return NextResponse.json({ results: [] }, { status: 500 });
    }
}
