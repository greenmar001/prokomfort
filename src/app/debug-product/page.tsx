
import { getProduct } from "@/lib/wa";

export default async function DebugProductPage({
    searchParams,
}: {
    searchParams: { slug?: string };
}) {
    const slug = searchParams.slug;

    if (!slug) {
        return (
            <div className="p-10">
                <h1 className="text-2xl font-bold mb-4">Debug Product Lookup</h1>
                <form>
                    <input
                        name="slug"
                        placeholder="Enter product slug"
                        className="border p-2 rounded mr-2 w-96"
                    />
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                        Test
                    </button>
                </form>
            </div>
        );
    }

    let result = null;
    let error = null;

    try {
        console.log(`Debug page requesting: ${slug}`);
        result = await getProduct(slug);
    } catch (e) {
        error = e;
    }

    return (
        <div className="p-10 font-mono">
            <h1 className="text-2xl font-bold mb-4">Result for: {slug}</h1>
            <a href="/debug-product" className="text-blue-500 underline mb-6 block">Back</a>

            {error ? (
                <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200">
                    <h2 className="font-bold">Error</h2>
                    <pre>{error instanceof Error ? error.message : String(error)}</pre>
                    <pre className="mt-4 text-xs opacity-75">{JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}</pre>
                </div>
            ) : (
                <div className="bg-green-50 text-green-700 p-4 rounded border border-green-200">
                    <h2 className="font-bold">Success</h2>
                    <div className="mb-2">
                        <strong>ID:</strong> {result?.id}
                    </div>
                    <div className="mb-2">
                        <strong>Name:</strong> {result?.name}
                    </div>
                    <div className="mb-2">
                        <strong>Frontend URL:</strong> {result?.frontend_url}
                    </div>
                    <div className="mb-2">
                        <strong>URL:</strong> {result?.url}
                    </div>
                    <details className="mt-4">
                        <summary className="cursor-pointer font-bold">Full JSON Response</summary>
                        <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
                    </details>
                </div>
            )}
        </div>
    );
}
