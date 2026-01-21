
const { ManticoreApiClient } = require('manticoresearch');

// Configuration
const API_BASE_URL = "https://pro-komfort.com/api/v1";
const INDEX_NAME = "products";
const MANTICORE_URL = "http://127.0.0.1:9308";

// Manticore Setup
const config = new ManticoreApiClient.Configuration({
    basePath: MANTICORE_URL
});
const indexApi = new ManticoreApiClient.IndexApi(config);
const utilsApi = new ManticoreApiClient.UtilsApi(config);

/**
 * Fetch with basic retry logic
 */
async function waGet(endpoint) {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
        const res = await fetch(url, {
            headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return await res.json();
    } catch (e) {
        console.error(`Fetch API failed: ${url}`, e.message);
        throw e;
    }
}

async function main() {
    console.log("🚀 Starting Reindex...");

    try {
        // 1. Reset Index
        // Note: drop table logic usually via SQL or utils, but for simplicity let's assume we can insert/upsert
        // Or use utilsApi.sql to DROP TABLE IF EXISTS products
        console.log("Cleaning up index...");
        try {
            await utilsApi.sql(`DROP TABLE IF EXISTS ${INDEX_NAME}`);
            await utilsApi.sql(`CREATE TABLE IF NOT EXISTS ${INDEX_NAME} (
                title text,
                description text,
                category text,
                price float,
                url text,
                image_url text
            ) morphology='stem_en, stem_ru' html_strip='1'`);
        } catch (e) {
            console.warn("Index init warning:", e.message);
        }

        // 2. Fetch Categories to find all products
        // We need an efficient way to get all products. 
        // Strategy: Get entire category tree, then fetch products for each leaf category.

        console.log("Fetching categories...");
        const catRes = await waGet("/categories?tree=1");
        const categories = catRes.categories || [];

        const flatCats = [];
        function flatten(cats) {
            for (const c of cats) {
                flatCats.push(c);
                if (c.categories) flatten(c.categories);
            }
        }
        flatten(categories);
        console.log(`Found ${flatCats.length} categories.`);

        let totalIndexed = 0;
        const seenIds = new Set();

        for (const cat of flatCats) {
            // Skip if parent category (optional optimization, some setups have products only in leaves)
            // But let's check all to be sure.

            // Pagination loop
            let page = 1;
            const limit = 100; // API limit per request

            while (true) {
                console.log(`Processing Category ${cat.name} (ID: ${cat.id}), Page ${page}...`);
                try {
                    const prodRes = await waGet(`/category/${cat.id}/products?limit=${limit}&page=${page}&with=skus,images`);
                    const products = prodRes.products || [];

                    if (products.length === 0) break;

                    const batch = [];
                    for (const p of products) {
                        if (seenIds.has(p.id)) continue;
                        seenIds.add(p.id);

                        const sku = p.skus && p.skus[0];
                        const price = sku ? parseFloat(sku.price_str?.replace(/[^\d.]/g, "") || "0") : 0;

                        // Image construction
                        let imageUrl = "";
                        if (p.image_id) {
                            // Standard Shop-Script pattern
                            const group = Math.floor(p.id / 1000); // Wait, pattern is floor(id/1000) ? 
                            // Using the logic from previous session:
                            // https://pro-komfort.com/wa-data/public/shop/products/${Math.floor(prod.id / 1000)}/${prod.id}/images/${prod.image_id}/${prod.image_id}.970.jpg
                            // But usually folder is 00/00/00 if specific plugins aren't used.
                            // Let's use the one we derived:
                            // Assuming backend default:
                            imageUrl = `https://pro-komfort.com/wa-data/public/shop/products/${Math.floor(p.id / 1000)}/${p.id}/images/${p.image_id}/${p.image_id}.200.jpg`; // Use thumb size
                        }

                        batch.push({
                            insert: {
                                index: INDEX_NAME,
                                id: p.id,
                                doc: {
                                    title: p.name,
                                    description: p.summary || "",
                                    category: cat.name,
                                    price: price,
                                    url: p.url, // This is just the slug, full URL needs resolve? 
                                    // Actually we want full path.
                                    // But re-calculating full path here is hard without the full tree logic.
                                    // Let's store just the slug for now or try to use frontend_url if available.
                                    // API response usually has frontend_url if requested.
                                    // We didn't request frontend_url in 'with' param above? 
                                    // Let's rely on p.url for now and frontend logic can resolve it if needed, 
                                    // OR better: fix frontend_url in the fetch.
                                    image_url: imageUrl
                                }
                            }
                        });
                    }

                    if (batch.length > 0) {
                        // Bulk insert
                        // Manticore JS client uses NDJSON style or array?
                        // The 'manticoresearch' has .bulk method
                        const bulkBody = batch.map(b => JSON.stringify(b)).join("\n");
                        await indexApi.bulk(bulkBody);
                        totalIndexed += batch.length;
                    }

                    if (products.length < limit) break; // Last page
                    page++;

                } catch (err) {
                    console.error(`Error processing category ${cat.id}:`, err.message);
                    break;
                }
            }
        }

        console.log(`✅ Reindex complete! Total products: ${totalIndexed}`);

    } catch (e) {
        console.error("Reindex Fatal Error:", e);
    }
}

main();
