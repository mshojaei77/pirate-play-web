'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiPlay, FiPlus, FiStar } from 'react-icons/fi';

interface DetailHeroProps {
  title: string;
  backdrop_path: string | null;
  poster_path: string | null;
  vote_average: number | undefined;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  genres?: { id: number; name: string }[];
  onGenreClick?: (genreId: number) => void;
  className?: string;
}

export default function DetailHero({
  title,
  backdrop_path,
  poster_path,
  vote_average,
  release_date,
  first_air_date,
  overview,
  genres,
  onGenreClick,
  className
}: DetailHeroProps) {
  return (
    <div className={`relative w-full min-h-[70vh] ${className || ''}`}>
      <div className="container mx-auto flex flex-col md:flex-row items-end gap-8 py-12">
        {/* Poster */}
        {poster_path && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:block w-64 h-96 relative rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl"
          >
            <img
              src={poster_path}
              alt={title}
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
          </motion.div>
        )}

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 space-y-6"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{title}</h1>
          
          <div className="flex items-center gap-4 text-base">
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500">
              <FiStar />
              {vote_average ? vote_average.toFixed(1) : 'N/A'}
            </span>
            <span className="text-white/40">•</span>
            <span className="text-white/80">{release_date || first_air_date}</span>
          </div>

          {genres && genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => onGenreClick?.(genre.id)}
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm
                    hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-500 
                    transition-all duration-300"
                >
                  {genre.name}
                </button>
              ))}
            </div>
          )}

          <p className="text-lg text-white/70 max-w-3xl leading-relaxed">
            {overview}
          </p>

          <div className="flex gap-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 
                text-white font-medium flex items-center gap-2 shadow-lg 
                shadow-emerald-500/20 transition-colors"
            >
              <FiPlay /> Watch Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-full bg-white/5 border border-white/10 
                hover:bg-white/10 font-medium flex items-center gap-2 
                transition-colors"
            >
              <FiPlus /> Add to List
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}