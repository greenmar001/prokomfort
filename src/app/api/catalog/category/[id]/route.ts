import { NextResponse } from "next/server";
import { getCategoryProducts } from "@/lib/wa";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const data = await getCategoryProducts(Number(id));
  return NextResponse.json(data);
}
