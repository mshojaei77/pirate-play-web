'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Movie, TVShow } from '@/types/tmdb';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTvShows] = useState<TVShow[]>([]);
  const [activeTab, setActiveTab] = useState<'movies' | 'tv'>('movies');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      setIsLoading(true);
      try {
        const baseUrl = 'https://api.themoviedb.org/3';
        const [moviesRes, tvRes] = await Promise.all([
          fetch(`${baseUrl}/trending/movie/week?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`),
          fetch(`${baseUrl}/trending/tv/week?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`)
        ]);

        const moviesData = await moviesRes.json();
        const tvData = await tvRes.json();

        setMovies(moviesData.results);
        setTvShows(tvData.results);
      } catch (error) {
        console.error('Error fetching trending content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Pirate Play
        </h1>
        <p className="text-gray-400 mt-2">Discover what's popular right now</p>
      </motion.div>

      {/* Tab Buttons */}
      <div className="flex justify-center gap-4 mb-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-2 rounded-full font-medium transition-colors ${
            activeTab === 'movies'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
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
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          onClick={() => setActiveTab('tv')}
        >
          TV Shows
        </motion.button>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
        >
          {(activeTab === 'movies' ? movies : tvShows).map((item: any) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-shadow hover:shadow-xl"
            >
              <div className="aspect-[2/3] relative">
                <img
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.title || item.name}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded-full text-sm backdrop-blur-sm">
                  ⭐ {item.vote_average.toFixed(1)}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg truncate">
                  {item.title || item.name}
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  {new Date(
                    item.release_date || item.first_air_date
                  ).getFullYear()}
                </p>
                <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                  {item.overview}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </main>
  );
}