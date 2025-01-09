'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Movie, TVShow } from '@/types/tmdb';
import Image from 'next/image';
import { FiSearch, FiFilter, FiPlay, FiPlus, FiStar, FiChevronLeft, FiChevronRight, FiTrendingUp, FiCalendar, FiDollarSign, FiUsers } from 'react-icons/fi';
import { fetchAllContent } from '@/app/tmdb';
import ContentSection from '@/components/ContentSection';

// Add new sort options type
type SortOption = 'trending' | 'popular' | 'rating' | 'releaseDate' | 'runtime';

// Add new filter types
type FilterOptions = {
  yearRange: { start: number; end: number };
  ratingRange: { min: number; max: number };
  votesRange: { min: number; max: number };
  genres: string[];
  language: string;
};

// Add this near the top of your file with other constants
const GENRES = [
  { id: '28', name: 'Action' },
  { id: '12', name: 'Adventure' },
  { id: '16', name: 'Animation' },
  { id: '35', name: 'Comedy' },
  { id: '80', name: 'Crime' },
  { id: '99', name: 'Documentary' },
  { id: '18', name: 'Drama' },
  { id: '10751', name: 'Family' },
  { id: '14', name: 'Fantasy' },
  { id: '36', name: 'History' },
  { id: '27', name: 'Horror' },
  { id: '10402', name: 'Music' },
  { id: '9648', name: 'Mystery' },
  { id: '10749', name: 'Romance' },
  { id: '878', name: 'Science Fiction' },
  { id: '10770', name: 'TV Movie' },
  { id: '53', name: 'Thriller' },
  { id: '10752', name: 'War' },
  { id: '37', name: 'Western' }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'movies' | 'tv'>('movies');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [allContent, setAllContent] = useState<{
    movies: any[];
    tvShows: any[];
    totalPages: { movies: number; tvShows: number; }
  } | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('trending');

  // Add new filter state
  const [filters, setFilters] = useState<FilterOptions>({
    yearRange: { start: 1900, end: new Date().getFullYear() },
    ratingRange: { min: 0, max: 10 },
    votesRange: { min: 0, max: 1000000 },
    genres: [],
    language: 'all'
  });

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        const content = await fetchAllContent();
        setAllContent(content);
      } catch (error) {
        console.error('Error loading content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [activeTab]);

  // Add this function before getSortedContent
  const applyFilters = (content: any[]) => {
    return content.filter(item => {
      const metadata = item.metadata;
      const releaseDate = new Date(metadata?.release_date || metadata?.first_air_date || 0);
      const releaseYear = releaseDate.getFullYear();
      
      return (
        // Year filter
        releaseYear >= filters.yearRange.start &&
        releaseYear <= filters.yearRange.end &&
        // Rating filter
        metadata?.vote_average >= filters.ratingRange.min &&
        metadata?.vote_average <= filters.ratingRange.max &&
        // Votes filter
        metadata?.vote_count >= filters.votesRange.min &&
        metadata?.vote_count <= filters.votesRange.max &&
        // Language filter
        (filters.language === 'all' || metadata?.original_language === filters.language) &&
        // Genres filter
        (filters.genres.length === 0 || 
          metadata?.genre_ids?.some((id: number) => filters.genres.includes(id.toString())))
      );
    });
  };

  const getSortedContent = () => {
    if (!allContent) return [];
    
    const content = activeTab === 'movies' 
      ? allContent.movies 
      : allContent.tvShows;

    // Apply filters first
    const filteredContent = applyFilters(content);

    switch (sortOption) {
      case 'trending':
        return [...filteredContent].sort((a, b) => 
          (b.metadata?.popularity || 0) - (a.metadata?.popularity || 0)
        );
      case 'popular':
        return [...filteredContent].sort((a, b) => 
          (b.metadata?.vote_average || 0) - (a.metadata?.vote_average || 0)
        );
      case 'rating':
        return [...filteredContent].sort((a, b) => {
          const aRating = a.metadata?.vote_average * Math.log10(a.metadata?.vote_count + 1) || 0;
          const bRating = b.metadata?.vote_average * Math.log10(b.metadata?.vote_count + 1) || 0;
          return bRating - aRating;
        });
      case 'releaseDate':
        return [...filteredContent].sort((a, b) => {
          const dateA = new Date(a.metadata?.release_date || a.metadata?.first_air_date || 0);
          const dateB = new Date(b.metadata?.release_date || b.metadata?.first_air_date || 0);
          return dateB.getTime() - dateA.getTime();
        });
      case 'runtime':
        return [...filteredContent].sort((a, b) => 
          (b.metadata?.runtime || 0) - (a.metadata?.runtime || 0)
        );
      default:
        return filteredContent;
    }
  };

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

      {/* Tabs and Sort Options */}
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
        </div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          <div className="flex flex-wrap gap-3">
            <button 
              className={`filter-button ${sortOption === 'trending' ? 'gradient-bg' : ''}`}
              onClick={() => setSortOption('trending')}
            >
              <FiTrendingUp className="inline mr-2" />
              Trending
            </button>

            <button 
              className={`filter-button ${sortOption === 'releaseDate' ? 'gradient-bg' : ''}`}
              onClick={() => setSortOption('releaseDate')}
            >
              <FiCalendar className="inline mr-2" />
              Recent
            </button>

            <button 
              className={`filter-button ${sortOption === 'rating' ? 'gradient-bg' : ''}`}
              onClick={() => setSortOption('rating')}
            >
              <FiStar className="inline mr-2" />
              Top Rated
            </button>
          </div>
        </motion.div>
      </div>

      {/* Filter Controls */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-4 justify-center mb-6"
      >
        {/* Year Range */}
        <div className="flex items-center bg-[var(--background)] border border-green-500/20 rounded-full hover:border-green-500/40 transition-colors">
          <input
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={filters.yearRange.start}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              yearRange: { ...prev.yearRange, start: parseInt(e.target.value) }
            }))}
            className="w-20 px-4 py-2 bg-transparent
            text-[var(--foreground)] focus:outline-none
            transition-colors text-sm"
            placeholder="Year"
          />
          <span className="text-[var(--foreground)]/50 px-1">-</span>
          <input
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={filters.yearRange.end}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              yearRange: { ...prev.yearRange, end: parseInt(e.target.value) }
            }))}
            className="w-20 px-4 py-2 bg-transparent
            text-[var(--foreground)] focus:outline-none
            transition-colors text-sm"
            placeholder="Year"
          />
        </div>

        {/* Rating Range */}
        <div className="flex items-center bg-[var(--background)] border border-green-500/20 rounded-full hover:border-green-500/40 transition-colors">
          <select
            value={filters.ratingRange.min}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              ratingRange: { ...prev.ratingRange, min: parseInt(e.target.value) }
            }))}
            className="w-24 px-4 py-2 bg-transparent
            text-[var(--foreground)] focus:outline-none
            transition-colors text-sm cursor-pointer appearance-none"
          >
            {[...Array(11)].map((_, i) => (
              <option key={i} value={i} className="bg-[var(--background)]">{i} ★</option>
            ))}
          </select>
          <select
            value={filters.ratingRange.max}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              ratingRange: { ...prev.ratingRange, max: parseInt(e.target.value) }
            }))}
            className="w-24 px-4 py-2 bg-transparent
            text-[var(--foreground)] focus:outline-none
            transition-colors text-sm cursor-pointer appearance-none"
          >
            {[...Array(11)].map((_, i) => (
              <option key={i} value={i} className="bg-[var(--background)]">★ {i}</option>
            ))}
          </select>
        </div>

        {/* Other Filters - using consistent styling */}
        <select
          value={filters.language}
          onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
          className="px-6 py-2 rounded-full bg-[var(--background)]
          border border-green-500/20 
          text-[var(--foreground)] focus:border-green-500 focus:outline-none 
          transition-colors text-sm min-w-[140px] hover:border-green-500/40 cursor-pointer appearance-none"
        >
          <option value="all" className="bg-[var(--background)]">Language</option>
          <option value="en" className="bg-[var(--background)]">English</option>
          <option value="ja" className="bg-[var(--background)]">Japanese</option>
          <option value="ko" className="bg-[var(--background)]">Korean</option>
          <option value="es" className="bg-[var(--background)]">Spanish</option>
        </select>

        <select
          value={filters.votesRange.min}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            votesRange: { ...prev.votesRange, min: parseInt(e.target.value) }
          }))}
          className="px-6 py-2 rounded-full bg-[var(--background)]
          border border-green-500/20 
          text-[var(--foreground)] focus:border-green-500 focus:outline-none 
          transition-colors text-sm min-w-[140px] hover:border-green-500/40 cursor-pointer appearance-none"
        >
          <option value="0" className="bg-[var(--background)]">Min Votes</option>
          {[1, 2, 3, 4, 5, 10, 15, 20, 25].map((k) => (
            <option key={k} value={k * 1000} className="bg-[var(--background)]">
              {k}k+
            </option>
          ))}
        </select>

        <select
          value={filters.genres[0] || 'all'}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            genres: e.target.value === 'all' ? [] : [e.target.value]
          }))}
          className="px-6 py-2 rounded-full bg-[var(--background)]
          border border-green-500/20 
          text-[var(--foreground)] focus:border-green-500 focus:outline-none 
          transition-colors text-sm min-w-[140px] hover:border-green-500/40 cursor-pointer appearance-none"
        >
          <option value="all" className="bg-[var(--background)]">Genre</option>
          {GENRES.map(genre => (
            <option key={genre.id} value={genre.id} className="bg-[var(--background)]">
              {genre.name}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Single Content Section */}
      <ContentSection
        title={`${sortOption === 'trending' 
          ? 'Trending'
          : sortOption === 'rating'
          ? 'Top'
          : sortOption === 'releaseDate'
          ? 'Recent'
          : 'Trending'} ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
        isLoading={isLoading}
        activeTab={activeTab}
        content={getSortedContent()}
      />
    </main>
  );
}