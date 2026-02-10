// components/skeletons/CardGridSkeleton.jsx
import CardSkeleton from "./CardSkeleton";

export default function CardGridSkeleton({
  count = 6,
  cols = "md:grid-cols-2 lg:grid-cols-3",
}) {
  return (
    <div className={`grid gap-8 ${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
