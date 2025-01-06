'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Movie, TVShow } from '@/types/tmdb';
import Image from 'next/image';
import { FiSearch, FiFilter, FiPlay, FiPlus, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getTrendingAnime } from '@/app/kitsu';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTvShows] = useState<TVShow[]>([]);
  const [anime, setAnime] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'movies' | 'tv' | 'anime'>('movies');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');

  useEffect(() => {
    const loadTrendingContent = async () => {
      setIsLoading(true);
      try {
        // Load content based on active tab
        if (activeTab === 'anime') {
          const animeData = await getTrendingAnime(20);
          setAnime(animeData.data);
        } else if (activeTab === 'movies') {
          const response = await fetch(
            `https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
          );
          const data = await response.json();
          setMovies(data.results);
        } else if (activeTab === 'tv') {
          const response = await fetch(
            `https://api.themoviedb.org/3/trending/tv/week?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
          );
          const data = await response.json();
          setTvShows(data.results);
        }
      } catch (error) {
        console.error('Error loading trending content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrendingContent();
  }, [activeTab]); // Add activeTab as dependency

  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8"
      >
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Image
            src="/parrot.png"
            alt="Pirate Play Logo"
            width={60}
            height={60}
            className="hidden md:block"
          />
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">
            Pirate Play
          </h1>
        </div>

        <div className="relative flex-1 max-w-2xl">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50 z-10" size={20} />
          <input
            type="text"
            placeholder="Search movies, TV shows..."
            className="w-full pl-12 pr-4 py-3 bg-[var(--background)] rounded-full border border-[var(--foreground)]/10 focus:outline-none focus:border-[var(--accent)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="gradient-bg px-6 py-2 rounded-full font-medium text-[var(--foreground)] hidden md:block"
        >
          Sign In
        </motion.button>
      </motion.div>

      {/* Tabs and Filters */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              activeTab === 'movies'
                ? 'gradient-bg text-[var(--foreground)]'
                : 'bg-[var(--background)] text-[var(--foreground)] opacity-70 hover:opacity-100'
            }`}
            onClick={() => setActiveTab('movies')}
          >
            Movies
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              activeTab === 'tv'
                ? 'gradient-bg text-[var(--foreground)]'
                : 'bg-[var(--background)] text-[var(--foreground)] opacity-70 hover:opacity-100'
            }`}
            onClick={() => setActiveTab('tv')}
          >
            TV Shows
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              activeTab === 'anime'
                ? 'gradient-bg text-[var(--foreground)]'
                : 'bg-[var(--background)] text-[var(--foreground)] opacity-70 hover:opacity-100'
            }`}
            onClick={() => setActiveTab('anime')}
          >
            Anime
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          <button className="filter-button">
            <FiFilter className="inline mr-2" />
            All Genres
          </button>
          <button className="filter-button">Latest</button>
          <button className="filter-button">Top Rated</button>
          <button className="filter-button">Popular</button>
        </motion.div>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-3xl md:text-4xl font-extrabold relative">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-middle)] to-[var(--gradient-end)]">
                Trending
              </span>
              <div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-middle)] to-[var(--gradient-end)] rounded-full"></div>
            </h2>
            <span className="px-3 py-1 bg-[var(--accent)]/10 rounded-full text-sm font-medium text-[var(--accent)]">
              This Week
            </span>
          </div>
          <motion.div
            layout
            className="flex gap-4 overflow-x-hidden scroll-smooth"
            style={{ scrollBehavior: 'smooth' }}
          >
            {(activeTab === 'movies' 
              ? movies 
              : activeTab === 'tv' 
              ? tvShows 
              : anime
            ).map((item: any) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-shrink-0 w-[calc(100%/6-1rem)] bg-[var(--background)] rounded-lg overflow-hidden shadow-glow hover:shadow-xl transition-all duration-300"
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
                      <p className="text-sm line-clamp-3">{item.overview || item.attributes.synopsis}</p>
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
          
          {/* Navigation Buttons */}
          <button 
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
            onClick={() => {
              const container = document.querySelector('.overflow-x-hidden');
              if (container) container.scrollLeft -= container.clientWidth;
            }}
          >
            <FiChevronLeft size={24} />
          </button>
          
          <button 
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
            onClick={() => {
              const container = document.querySelector('.overflow-x-hidden');
              if (container) container.scrollLeft += container.clientWidth;
            }}
          >
            <FiChevronRight size={24} />
          </button>
        </div>
      )}
    </main>
  );
}