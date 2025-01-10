'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Movie, TVShow } from '@/types/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { FiSearch, FiFilter, FiPlay, FiPlus, FiStar, FiChevronLeft, FiChevronRight, FiTrendingUp, FiCalendar, FiDollarSign, FiUsers } from 'react-icons/fi';
import { fetchAllContent, searchMulti } from '@/app/tmdb_api_handler';
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

// Update the GENRES constant to separate movie and TV genres
const MOVIE_GENRES = [
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

const TV_GENRES = [
  { id: '10759', name: 'Action & Adventure' },
  { id: '16', name: 'Animation' },
  { id: '35', name: 'Comedy' },
  { id: '80', name: 'Crime' },
  { id: '99', name: 'Documentary' },
  { id: '18', name: 'Drama' },
  { id: '10751', name: 'Family' },
  { id: '10762', name: 'Kids' },
  { id: '9648', name: 'Mystery' },
  { id: '10763', name: 'News' },
  { id: '10764', name: 'Reality' },
  { id: '10765', name: 'Sci-Fi & Fantasy' },
  { id: '10766', name: 'Soap' },
  { id: '10767', name: 'Talk' },
  { id: '10768', name: 'War & Politics' },
  { id: '37', name: 'Western' }
];

// Add this utility function at the top of your file
const ensureNumber = (value: any): string => {
  const num = Number(value);
  return isNaN(num) ? '0' : num.toString();
};

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
    yearRange: { 
      start: 1900, 
      end: new Date().getFullYear() 
    },
    ratingRange: { 
      min: 0, 
      max: 10 
    },
    votesRange: { 
      min: 0, 
      max: 1000000 
    },
    genres: [],
    language: 'all'
  });

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 42; 

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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

  // Add debounced search function
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        setSortOption('rating');
        try {
          const results = await searchMulti(searchQuery);
          setSearchResults(results.results.map((item: any) => ({
            ...item,
            metadata: {
              ...item,
              backdrop_path: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
              poster_path: item.poster_path ? `https://image.tmdb.org/t/p/original${item.poster_path}` : null,
            }
          })));
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setSortOption('trending');
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

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
    if (!allContent) return { items: [], totalItems: 0 };
    
    // If there's a search query, use search results instead
    const content = searchQuery.trim()
      ? searchResults
      : activeTab === 'movies' 
        ? allContent.movies 
        : allContent.tvShows;

    // Apply filters first
    const filteredContent = applyFilters(content);

    // Sort the filtered content
    const sortedContent = (() => {
      switch (sortOption) {
        case 'trending':
          return [...filteredContent]
            .filter(item => Number(item.metadata?.vote_count) >= 100)
            .sort((a, b) => {
              const dateA = new Date(a.metadata?.release_date || a.metadata?.first_air_date || 0).getTime();
              const dateB = new Date(b.metadata?.release_date || b.metadata?.first_air_date || 0).getTime();
              return isNaN(dateB - dateA) ? 0 : dateB - dateA;
          });
        case 'popular':
          return [...filteredContent].sort((a, b) => {
            const aVote = Number(a.metadata?.vote_average) || 0;
            const bVote = Number(b.metadata?.vote_average) || 0;
            return (isNaN(bVote) ? 0 : bVote) - (isNaN(aVote) ? 0 : aVote);
          });
        case 'rating':
          return [...filteredContent].sort((a, b) => {
            const aCount = Number(a.metadata?.vote_count) || 0;
            const bCount = Number(b.metadata?.vote_count) || 0;
            const aAvg = Number(a.metadata?.vote_average) || 0;
            const bAvg = Number(b.metadata?.vote_average) || 0;
            const aRating = (isNaN(aAvg) ? 0 : aAvg) * Math.log10((isNaN(aCount) ? 0 : aCount) + 1);
            const bRating = (isNaN(bAvg) ? 0 : bAvg) * Math.log10((isNaN(bCount) ? 0 : bCount) + 1);
            return bRating - aRating;
          });
        case 'releaseDate':
          return [...filteredContent].sort((a, b) => {
            const dateA = new Date(a.metadata?.release_date || a.metadata?.first_air_date || 0).getTime();
            const dateB = new Date(b.metadata?.release_date || b.metadata?.first_air_date || 0).getTime();
            return isNaN(dateB - dateA) ? 0 : dateB - dateA;
          });
        case 'runtime':
          return [...filteredContent].sort((a, b) => {
            const aRuntime = Number(a.metadata?.runtime) || 0;
            const bRuntime = Number(b.metadata?.runtime) || 0;
            return (isNaN(bRuntime) ? 0 : bRuntime) - (isNaN(aRuntime) ? 0 : aRuntime);
          });
        default:
          return filteredContent;
      }
    })();

    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = sortedContent.slice(startIndex, startIndex + itemsPerPage);
    
    return {
      items: paginatedItems,
      totalItems: sortedContent.length
    };
  };

  // Add this useEffect to handle URL search parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('searchQuery');
    const genre = urlParams.get('genre');
    
    if (query) {
      setSearchQuery(query);
    }
    
    if (genre) {
      setFilters(prev => ({
        ...prev,
        genres: [genre]
      }));
      
      // Optional: Scroll to the genre filter
      const filterSection = document.querySelector('.filter-controls');
      filterSection?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Add this function before the return statement
  const resetAllFilters = () => {
    setSearchQuery('');
    setSortOption('trending');
    setCurrentPage(1);
    setFilters({
      yearRange: { 
        start: 1900, 
        end: new Date().getFullYear() 
      },
      ratingRange: { 
        min: 0, 
        max: 10 
      },
      votesRange: { 
        min: 0, 
        max: 1000000 
      },
      genres: [],
      language: 'all'
    });
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
          <Link 
            href="/" 
            className="flex items-center gap-2"
            onClick={(e) => {
              // Only reset if we're already on the home page
              if (window.location.pathname === '/') {
                e.preventDefault();
                resetAllFilters();
              }
            }}
          >
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
          </Link>
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
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[var(--accent)]"></div>
            </div>
          )}
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
            onClick={() => {
              setActiveTab('movies');
              setFilters(prev => ({
                ...prev,
                genres: [] // Reset genres when switching to movies
              }));
            }}
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
            onClick={() => {
              setActiveTab('tv');
              setFilters(prev => ({
                ...prev,
                genres: [] // Reset genres when switching to TV shows
              }));
            }}
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
            value={ensureNumber(filters.yearRange.start)}
            onChange={(e) => {
              const newValue = parseInt(e.target.value);
              setFilters(prev => ({
                ...prev,
                yearRange: { 
                  ...prev.yearRange, 
                  start: isNaN(newValue) ? 1900 : newValue 
                }
              }));
            }}
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
            value={ensureNumber(filters.ratingRange.min)}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              ratingRange: { ...prev.ratingRange, min: Number(e.target.value) }
            }))}
            className="w-24 px-4 py-2 bg-transparent
            text-[var(--foreground)] focus:outline-none
            transition-colors text-sm cursor-pointer appearance-none"
          >
            {[...Array(11)].map((_, i) => (
              <option key={i} value={i.toString()} className="bg-[var(--background)]">{i} ★</option>
            ))}
          </select>
          <select
            value={ensureNumber(filters.ratingRange.max)}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              ratingRange: { ...prev.ratingRange, max: Number(e.target.value) }
            }))}
            className="w-24 px-4 py-2 bg-transparent
            text-[var(--foreground)] focus:outline-none
            transition-colors text-sm cursor-pointer appearance-none"
          >
            {[...Array(11)].map((_, i) => (
              <option key={i} value={i.toString()} className="bg-[var(--background)]">★ {i}</option>
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
          <option value="fr" className="bg-[var(--background)]">French</option>
          <option value="it" className="bg-[var(--background)]">Italian</option>
          <option value="fa" className="bg-[var(--background)]">Persian</option>
        </select>

        <select
          value={ensureNumber(filters.votesRange.min)}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            votesRange: { ...prev.votesRange, min: parseInt(e.target.value) || 0 }
          }))}
          className="px-6 py-2 rounded-full bg-[var(--background)]
          border border-green-500/20 
          text-[var(--foreground)] focus:border-green-500 focus:outline-none 
          transition-colors text-sm min-w-[140px] hover:border-green-500/40 cursor-pointer appearance-none"
        >
          <option value="0" className="bg-[var(--background)]">Min Votes</option>
          <option value="100" className="bg-[var(--background)]">100+</option>
          {[1, 2, 3, 4, 5, 10, 15, 20, 25].map((k) => (
            <option key={k} value={String(k * 1000)} className="bg-[var(--background)]">
              {`${k}k+`}
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
          {(activeTab === 'movies' ? MOVIE_GENRES : TV_GENRES).map(genre => (
            <option 
              key={genre.id} 
              value={genre.id} 
              className="bg-[var(--background)]"
            >
              {genre.name}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Content Section */}
      <ContentSection
        title={searchQuery.trim() 
          ? `Search Results for "${searchQuery}"`
          : `${sortOption === 'trending' 
              ? 'Trending'
              : sortOption === 'rating'
              ? 'Top'
              : sortOption === 'releaseDate'
              ? 'Recent'
              : 'Trending'} ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
        isLoading={isLoading || isSearching}
        activeTab={activeTab}
        content={getSortedContent().items}
      />

      {/* Add pagination controls at the bottom */}
      <div className="flex justify-center gap-4 mt-8 mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-full font-medium ${
            currentPage === 1 
              ? 'opacity-50 cursor-not-allowed' 
              : 'gradient-bg hover:opacity-90'
          }`}
        >
          <FiChevronLeft className="inline" /> Previous
        </motion.button>
        
        <span className="flex items-center px-4 py-2">
          Page {currentPage} of {Math.ceil(getSortedContent().totalItems / itemsPerPage)}
        </span>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={currentPage >= Math.ceil(getSortedContent().totalItems / itemsPerPage)}
          className={`px-4 py-2 rounded-full font-medium ${
            currentPage >= Math.ceil(getSortedContent().totalItems / itemsPerPage)
              ? 'opacity-50 cursor-not-allowed'
              : 'gradient-bg hover:opacity-90'
          }`}
        >
          Next <FiChevronRight className="inline" />
        </motion.button>
      </div>
    </main>
  );
}