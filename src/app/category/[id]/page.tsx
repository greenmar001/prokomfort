import CategoryView from "@/components/CategoryView";

export const revalidate = 60;

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ page?: string; sort?: string; order?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams || {};

  return <CategoryView categoryId={Number(id)} searchParams={sp} baseUrl={`/category/${id}`} />;
}
