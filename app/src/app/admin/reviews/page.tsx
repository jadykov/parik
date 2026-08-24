import ReviewsClient from "./ReviewsClient";
export const dynamic = "force-dynamic";
export default function AdminReviewsPage() {
  return <div><h1 className="text-xl font-bold">Отзывы (модерация)</h1><ReviewsClient /></div>;
}
