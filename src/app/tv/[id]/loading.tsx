import { motion } from 'framer-motion';

export default function MovieLoading() {
  return (
    <div className="min-h-screen p-4 md:p-8 animate-pulse">
      {/* Hero Section Skeleton */}
      <div className="w-full h-[60vh] bg-[var(--background)]/50 rounded-3xl mb-8" />
      
      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="h-8 bg-[var(--background)]/50 rounded-full w-1/3" />
        <div className="space-y-4">
          <div className="h-4 bg-[var(--background)]/50 rounded-full w-3/4" />
          <div className="h-4 bg-[var(--background)]/50 rounded-full w-2/3" />
          <div className="h-4 bg-[var(--background)]/50 rounded-full w-5/6" />
        </div>
      </div>
    </div>
  );
}