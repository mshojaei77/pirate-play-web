'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiPlay, FiPlus, FiStar } from 'react-icons/fi';

interface DetailHeroProps {
  title: string;
  backdrop_path: string | null;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  genres?: { id: number; name: string }[];
  onGenreClick?: (genreId: number) => void;
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
  onGenreClick
}: DetailHeroProps) {
  return (
    <div className="relative w-full h-[60vh] mb-8">
      {/* Backdrop Image */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        {backdrop_path && (
          <img
            src={backdrop_path}
            alt={title}
            className="object-cover w-full h-full"
          />
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 flex gap-8">
        {/* Poster */}
        {poster_path && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:block w-48 h-72 relative rounded-xl overflow-hidden flex-shrink-0"
          >
            <img
              src={poster_path}
              alt={title}
              className="object-cover w-full h-full"
            />
          </motion.div>
        )}

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold">{title}</h1>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <FiStar className="text-yellow-500" />
              {vote_average.toFixed(1)}
            </span>
            <span>•</span>
            <span>{release_date || first_air_date}</span>
          </div>

          {genres && genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => onGenreClick?.(genre.id)}
                  className="px-3 py-1.5 rounded-md bg-black/40 border border-white/10 text-sm
                  hover:bg-emerald-900/20 hover:border-emerald-500/30 transition-all cursor-pointer"
                >
                  {genre.name}
                </button>
              ))}
            </div>
          )}

          <p className="text-[var(--foreground)]/70 max-w-2xl line-clamp-3">
            {overview}
          </p>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="gradient-bg px-6 py-2 rounded-full font-medium flex items-center gap-2"
            >
              <FiPlay /> Watch Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[var(--background)] border border-[var(--foreground)]/10 px-6 py-2 rounded-full font-medium flex items-center gap-2"
            >
              <FiPlus /> Add to List
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}