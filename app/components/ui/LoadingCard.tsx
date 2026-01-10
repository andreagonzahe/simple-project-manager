'use client';

export function LoadingCard() {
  return (
    <div className="rounded-2xl bg-[#18181B] p-8 shadow-xl border border-gray-800 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-8 bg-gray-800 rounded-lg w-3/4 mb-6"></div>
          <div className="h-5 bg-gray-800 rounded-lg w-full mb-3"></div>
          <div className="h-5 bg-gray-800 rounded-lg w-2/3 mb-6"></div>
          
          <div className="flex gap-4">
            <div className="h-8 bg-gray-800 rounded-xl w-24"></div>
            <div className="h-8 bg-gray-800 rounded-xl w-24"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
}
