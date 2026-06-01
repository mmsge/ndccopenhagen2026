export default function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-20" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-4/5" />
        </div>
        <div className="space-y-1">
          <div className="h-3 bg-gray-100 rounded" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}
