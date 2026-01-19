import { NextResponse } from "next/server";
import { getCategoryProducts } from "@/lib/wa";


export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const limit = Math.min(60, Math.max(6, Number(url.searchParams.get("limit") ?? "24")));
  const offset = (page - 1) * limit;

  const data = await getCategoryProducts(Number(id), offset, limit);

  // waCategoryProducts может возвращать либо массив, либо объект {count, products...}
  // Нормализуем:
  const count = typeof data?.count === "number" ? data.count : (Array.isArray(data) ? data.length : 0);
  const products = Array.isArray(data?.products) ? data.products : (Array.isArray(data) ? data : []);

  return NextResponse.json({
    page,
    limit,
    offset,
    count,
    products,
  });
}

