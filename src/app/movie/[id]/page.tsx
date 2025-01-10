'use client';

import { use, useEffect, useState } from 'react';
import { getMovieDetails } from '@/app/tmdb_api_handler';
import DetailHero from '@/components/DetailHero';
import Image from 'next/image';
import { 
  FaFilm, FaCalendarAlt, FaClock, 
  FaTheaterMasks, FaBuilding, FaMoneyBillWave,
  FaChartLine, FaGlobe, FaTrophy 
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface CrewMember {
  id: number;
  name: string;
  job: string;
}

interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

const InfoItem = ({ 
  title, 
  value, 
  icon 
}: { 
  title: string; 
  value: string | React.ReactNode; 
  icon?: React.ReactNode;
}) => (
  <div className="group">
    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
      {icon}
      {title}
    </h3>
    <div className="text-[var(--foreground)]/70 group-hover:text-[var(--foreground)] transition-colors">
      {value}
    </div>
  </div>
);

export default function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();

  const handleSearch = (query: string) => {
    router.push(`/?searchQuery=${encodeURIComponent(query)}`);
  };

  // Unwrap params using React.use()
  const resolvedParams = use(params);
  const [movie, setMovie] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMovie = async () => {
      try {
        const data = await getMovieDetails(parseInt(resolvedParams.id));
        setMovie(data);
      } catch (error) {
        console.error('Error loading movie:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMovie();
  }, [resolvedParams.id]);

  if (isLoading) return null; // Next.js will show the loading.tsx
  if (!movie) return <div>Movie not found</div>;

  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <DetailHero
        title={movie.title}
        backdrop_path={movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null}
        poster_path={movie.poster_path ? `https://image.tmdb.org/t/p/original${movie.poster_path}` : null}
        vote_average={movie.vote_average}
        release_date={movie.release_date}
        overview={movie.overview}
        genres={movie.genres}
        onGenreClick={(genreId) => router.push(`/?genre=${genreId}`)}
      />

      {/* Additional movie details can be added here */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="md:col-span-2 space-y-8">
            {/* 1. Overview with Images - Most important context */}
            <section className="bg-[#141414] p-6 rounded-xl border border-white/10">
              <h2 className="text-2xl font-bold mb-6">Overview</h2>
              <p className="text-[var(--foreground)]/70 text-lg leading-relaxed mb-6">{movie.overview}</p>
              
              {/* Add shots grid */}
              {movie.images?.backdrops && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {movie.images.backdrops.slice(0, 4).map((image: any, index: number) => (
                    <div key={index} className="aspect-video rounded-lg overflow-hidden">
                      <img
                        src={`https://image.tmdb.org/t/p/w780${image.file_path}`}
                        alt={`${movie.title} shot ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 2. Videos Section - High engagement content */}
            {movie.videos?.results && (
              <section className="bg-[#141414] p-6 rounded-xl border border-white/10">
                <h2 className="text-2xl font-bold mb-4">Videos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {movie.videos.results.slice(0, 4).map((video: any) => (
                    <div key={video.id} className="aspect-video relative group">
                      <div className="absolute inset-0 bg-center bg-cover rounded-lg"
                           style={{ backgroundImage: `url(https://img.youtube.com/vi/${video.key}/maxresdefault.jpg)` }}>
                        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/70 transition-colors" />
                      </div>
                      <a
                        href={`https://www.youtube.com/watch?v=${video.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-600 group-hover:bg-red-700 transition-colors">
                          <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[16px] border-l-white border-b-8 border-b-transparent ml-1" />
                        </div>
                      </a>
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-sm bg-gradient-to-t from-black/80 to-transparent">
                        {video.name}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 3. Cast Section - Important for user recognition */}
            {movie.credits?.cast && (
              <section className="bg-[#141414] p-6 rounded-xl border border-white/10">
                <h2 className="text-2xl font-bold mb-4">Cast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {movie.credits.cast.slice(0, 8).map((actor: any) => (
                    <button 
                      key={actor.id}
                      onClick={() => handleSearch(actor.name)}
                      className="text-center hover:opacity-80 transition-opacity"
                    >
                      <div className="w-full aspect-[2/3] relative rounded-lg overflow-hidden mb-2">
                        {actor.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${actor.profile_path}`}
                            alt={actor.name}
                            className="object-cover absolute inset-0 w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-[var(--background)]/50" />
                        )}
                      </div>
                      <p className="font-medium hover:text-emerald-500 transition-colors">{actor.name}</p>
                      <p className="text-sm text-[var(--foreground)]/70">{actor.character}</p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* 4. Director Section */}
            {movie.credits?.crew?.find((person: CrewMember) => person.job === 'Director') && (
              <section className="bg-[#141414] p-6 rounded-xl border border-white/10">
                <h2 className="text-2xl font-bold mb-4">Director</h2>
                {movie.credits.crew
                  .filter((person: CrewMember) => person.job === 'Director')
                  .map((director: any) => (
                    <button 
                      key={director.id}
                      onClick={() => handleSearch(director.name)}
                      className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0">
                        {director.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${director.profile_path}`}
                            alt={director.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-[var(--background)]/50 flex items-center justify-center">
                            <FaTheaterMasks className="text-3xl text-emerald-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-lg hover:text-emerald-500 transition-colors">{director.name}</p>
                        <p className="text-sm text-[var(--foreground)]/70">Director</p>
                      </div>
                    </button>
                  ))}
              </section>
            )}

            {/* 5. Awards Section */}
            {movie.awards && movie.awards.length > 0 && (
              <section className="bg-[#141414] p-6 rounded-xl border border-white/10">
                <h2 className="text-2xl font-bold mb-4">
                  Awards
                </h2>
                <div className="grid gap-4">
                  {movie.awards.map((award: any, index: number) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-[var(--background)]/50 rounded-lg">
                      <div className="w-12 h-12 flex-shrink-0 bg-emerald-500/10 rounded-full flex items-center justify-center">
                        <FaTrophy className="text-2xl text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{award.name}</h3>
                        <p className="text-[var(--foreground)]/70">{award.category}</p>
                        <p className="text-sm text-emerald-500">{award.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 6. Similar Movies - Discovery */}
            {movie.similar?.results && (
              <section className="bg-[#141414] p-6 rounded-xl border border-white/10">
                <h2 className="text-2xl font-bold mb-4">Similar Movies</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {movie.similar.results.slice(0, 4).map((similar: any) => (
                    <a 
                      href={`/movie/${similar.id}`} 
                      key={similar.id} 
                      className="text-center hover:opacity-80 transition-opacity"
                    >
                      <div className="w-full aspect-[2/3] relative rounded-lg overflow-hidden mb-2">
                        {similar.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${similar.poster_path}`}
                            alt={similar.title}
                            className="object-cover absolute inset-0 w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-[var(--background)]/50" />
                        )}
                      </div>
                      <p className="font-medium">{similar.title}</p>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6 bg-[#141414] p-6 rounded-xl border border-white/10">
            {/* Status - Most important current info */}
            <InfoItem 
              title="Status" 
              value={
                <span className="px-3 py-1.5 rounded-md bg-[var(--background)] border border-white/10 inline-block">
                  {movie.status}
                </span>
              } 
              icon={<FaFilm className="text-emerald-500 text-lg" />} 
            />

            {/* Release Date - Key info */}
            <InfoItem 
              title="Release Date" 
              value={
                <span className="px-3 py-1.5 rounded-md bg-[var(--background)] border border-white/10 inline-block">
                  {movie.release_date}
                </span>
              }
              icon={<FaCalendarAlt className="text-emerald-500 text-lg" />} 
            />

            {/* Runtime */}
            <InfoItem 
              title="Runtime" 
              value={`${movie.runtime} minutes`} 
              icon={<FaClock className="text-emerald-500 text-lg" />} 
            />

            {/* Box Office - Important performance metrics */}
            {movie.revenue > 0 && (
              <InfoItem
                title="Box Office"
                value={
                  <span className="px-3 py-1.5 rounded-md bg-black/40 border border-emerald-900/30 inline-block hover:bg-emerald-900/20 transition-colors font-mono">
                    ${movie.revenue.toLocaleString()}
                  </span>
                }
                icon={<FaChartLine className="text-emerald-500 text-lg" />}
              />
            )}

            {movie.budget > 0 && (
              <InfoItem
                title="Budget"
                value={
                  <span className="px-3 py-1.5 rounded-md bg-[var(--background)] border border-white/10 inline-block font-mono">
                    ${movie.budget.toLocaleString()}
                  </span>
                }
                icon={<FaMoneyBillWave className="text-emerald-500 text-lg" />}
              />
            )}

            {/* Production Companies */}
            {movie.production_companies && (
              <InfoItem
                title="Production Companies"
                value={
                  <div className="space-y-2">
                    {movie.production_companies.map((company: any) => (
                      <div key={company.id} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{company.name}</span>
                      </div>
                    ))}
                  </div>
                }
                icon={<FaBuilding className="text-emerald-500 text-lg" />}
              />
            )}

            {/* Less important metadata */}
            {movie.production_countries && movie.production_countries.length > 0 && (
              <InfoItem
                title="Countries"
                value={movie.production_countries.map((country: ProductionCountry) => country.name).join(', ')}
                icon={<FaGlobe className="text-emerald-500 text-lg" />}
              />
            )}

            <InfoItem
              title="Original Language"
              value={movie.original_language?.toUpperCase()}
              icon={<FaGlobe className="text-emerald-500 text-lg" />}
            />
          </div>
        </div>
      </div>
    </main>
  );
}