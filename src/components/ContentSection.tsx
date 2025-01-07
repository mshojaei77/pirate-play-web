import { motion } from 'framer-motion';
import { FiPlay, FiPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface ContentSectionProps {
  title: string;
  isLoading: boolean;
  activeTab: 'movies' | 'tv' | 'anime';
  content: any[];
}

export default function ContentSection({ title, isLoading, activeTab, content }: ContentSectionProps) {
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
        id={`content-scroll-${sectionId}`}
        className="flex gap-2 overflow-x-hidden scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        {content.map((item: any) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-shrink-0 w-[calc(100%/6-1rem)] bg-[var(--background)] rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            <div className="aspect-[2/3] relative">
              <img
                src={
                  activeTab === 'anime'
                    ? item.attributes.posterImage.large
                    : `https://image.tmdb.org/t/p/w500${item.poster_path}`
                }
                alt={
                  activeTab === 'anime'
                    ? item.attributes.canonicalTitle
                    : item.title || item.name
                }
                className="object-cover w-full h-full"
                loading="lazy"
              />
              <div className="card-hover-overlay">
                <div className="flex justify-between items-start">
                  <span className="bg-[var(--accent)] px-2 py-1 rounded-full text-sm">
                    ⭐ {activeTab === 'anime' ? (parseFloat(item.attributes.averageRating) / 10).toFixed(1) : item.vote_average.toFixed(1)}
                  </span>
                  <button className="p-2 hover:text-[var(--accent)]">
                    <FiPlus size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <p className="text-sm line-clamp-3">
                    {activeTab === 'anime' 
                      ? item.attributes?.synopsis || 'No synopsis available'
                      : item.overview || 'No overview available'}
                  </p>
                  <button className="w-full gradient-bg py-2 rounded-full flex items-center justify-center gap-2">
                    <FiPlay /> Play Now
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg truncate">
                {activeTab === 'anime' ? item.attributes.canonicalTitle : (item.title || item.name)}
              </h3>
              <p className="text-[var(--foreground)]/70 text-sm">
                {activeTab === 'anime' ? new Date(item.attributes.startDate).getFullYear() : new Date(item.release_date || item.first_air_date).getFullYear()}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <button 
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
        onClick={() => {
          const container = document.getElementById(`content-scroll-${sectionId}`);
          if (container) container.scrollLeft -= container.clientWidth;
        }}
      >
        <FiChevronLeft size={24} />
      </button>

      <button 
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
        onClick={() => {
          const container = document.getElementById(`content-scroll-${sectionId}`);
          if (container) container.scrollLeft += container.clientWidth;
        }}
      >
        <FiChevronRight size={24} />
      </button>
    </div>
  );
}