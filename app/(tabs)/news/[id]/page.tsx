import { NewsDetail } from "@/components/news/NewsDetail";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <NewsDetail id={decodeURIComponent(id)} />;
}
