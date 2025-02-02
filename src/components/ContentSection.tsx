import { motion } from 'framer-motion';
import { FiPlay, FiPlus } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface ContentSectionProps {
  title: string;
  isLoading: boolean;
  activeTab: 'movies' | 'tv';
  content: any[];
}

export default function ContentSection({ title, isLoading, activeTab, content }: ContentSectionProps) {
  const router = useRouter();
  const sectionId = title.toLowerCase().replace(/\s+/g, '-');

  const getSectionLabel = (title: string) => {
    switch (title) {
      case 'Trending':
        return 'This Month';
      case 'Popular':
        return 'This Year';
      case 'Most Popular':
        return 'All-Time';
      default:
        return ' ';
    }
  };

  const handleViewDetails = (itemId: number) => {
    router.push(`/${activeTab === 'movies' ? 'movie' : 'tv'}/${itemId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  return (
    <div className="relative mb-16">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-3xl md:text-4xl font-extrabold relative">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-middle)] to-[var(--gradient-end)]">
            {title}
          </span>
          <div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-middle)] to-[var(--gradient-end)] rounded-full"></div>
        </h2>
        <span className="px-3 py-1 bg-[var(--accent)]/10 rounded-full text-sm font-medium text-[var(--accent)]">
          {getSectionLabel(title)}
        </span>
      </div>

      <motion.div
        layout
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      >
        {content.map((item: any) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-[var(--background)] rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            <div className="aspect-[2/3] relative">
              <img
                src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                alt={item.title || item.name || 'Untitled'}
                className="object-cover w-full h-full"
                loading="lazy"
              />
              <div className="card-hover-overlay">
                <div className="flex justify-between items-start">
                  <span className="bg-[var(--accent)] px-2 py-1 rounded-full text-sm">
                    ⭐ {item.vote_average ? Number(item.vote_average).toFixed(1) : '0'}
                  </span>
                  <button className="p-2 hover:text-[var(--accent)]">
                    <FiPlus size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <p className="text-sm line-clamp-3">
                    {item.overview || 'No overview available'}
                  </p>
                  <button 
                    onClick={() => handleViewDetails(item.id)}
                    className="w-full gradient-bg py-2 rounded-full flex items-center justify-center gap-2"
                  >
                    <FiPlay /> View Details
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg truncate">
                {item.title || item.name || 'Untitled'}
              </h3>
              <p className="text-[var(--foreground)]/70 text-sm">
                {(() => {
                  const date = item.release_date || item.first_air_date;
                  try {
                    return date ? new Date(date).getFullYear().toString() : 'N/A';
                  } catch {
                    return 'N/A';
                  }
                })()}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}