import { NextResponse } from "next/server";
import { getProduct } from "@/lib/wa";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const data = await getProduct(Number(id));
  return NextResponse.json(data);
}
