'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Movie, TVShow } from '@/types/tmdb';
import Image from 'next/image';
import { FiSearch, FiFilter, FiPlay, FiPlus, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getTrendingAnime, getPopularThisYear, getMostPopularAllTime } from '@/app/kitsu';
import ContentSection from '@/components/ContentSection';
import { fetchTrendingContent } from '@/app/tmdb';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTvShows] = useState<TVShow[]>([]);
  const [anime, setAnime] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'movies' | 'tv' | 'anime'>('movies');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [allContent, setAllContent] = useState<any>(null);

  useEffect(() => {
    const loadTrendingContent = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'anime') {
          const [trendingData, thisYearData, allTimeData] = await Promise.all([
            getTrendingAnime(20),
            getPopularThisYear(20),
            getMostPopularAllTime(20)
          ]);
          
          setAnime(trendingData.data);
          setAllContent({
            thisYear: { movies: [], tvShows: [], anime: thisYearData.data },
            allTime: { movies: [], tvShows: [], anime: allTimeData.data }
          });
        } else if (activeTab === 'movies') {
          const [trendingMovies, content] = await Promise.all([
            fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`).then(res => res.json()),
            fetchTrendingContent()
          ]);
          setMovies(trendingMovies.results);
          setAllContent(content);
        } else if (activeTab === 'tv') {
          const [trendingTV, content] = await Promise.all([
            fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`).then(res => res.json()),
            fetchTrendingContent()
          ]);
          setTvShows(trendingTV.results);
          setAllContent(content);
        }
      } catch (error) {
        console.error('Error loading trending content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrendingContent();
  }, [activeTab]);

  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-center gap-2 mb-8"
      >
        <div className="flex items-center gap-2 w-full md:w-auto">
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
        <div className="flex justify-center gap-2">
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
          <div className="flex flex-wrap gap-3">
            <button className="filter-button">
              <FiFilter className="inline mr-2" />
              All Genres
            </button>

            <button className="filter-button">
              Year: All
            </button>

            <button className="filter-button">
              Rating: All
            </button>
          </div>

        </motion.div>
      </div>

      {/* Content Grid */}
      {allContent && (
        <div className="space-y-16">
          <ContentSection
            title="Trending"
            isLoading={isLoading}
            activeTab={activeTab}
            content={activeTab === 'movies' 
              ? movies
              : activeTab === 'tv'
              ? tvShows
              : anime}
          />
          
          <ContentSection
            title="Popular"
            isLoading={isLoading}
            activeTab={activeTab}
            content={activeTab === 'movies' 
              ? allContent.thisYear.movies
              : activeTab === 'tv'
              ? allContent.thisYear.tvShows
              : allContent.thisYear.anime || []}
          />

          <ContentSection
            title="Most Popular"
            isLoading={isLoading}
            activeTab={activeTab}
            content={activeTab === 'movies'
              ? allContent.allTime.movies
              : activeTab === 'tv'
              ? allContent.allTime.tvShows
              : allContent.allTime.anime || []}
          />
        </div>
      )}
    </main>
  );
}