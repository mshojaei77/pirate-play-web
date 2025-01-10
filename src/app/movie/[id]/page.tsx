'use client';

import { use, useEffect, useState } from 'react';
import { getMovieDetails } from '@/app/tmdb_api_handler';
import DetailHero from '@/components/DetailHero';
import Image from 'next/image';
import { 
  FaFilm, FaCalendarAlt, FaClock, 
  FaTheaterMasks, FaBuilding, FaMoneyBillWave,
  FaChartLine, FaGlobe, FaTrophy, FaPlay, FaUsers 
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

  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;

  return (
    <main className="min-h-screen relative">
      {/* Full-page backdrop */}
      {backdropUrl && (
        <div className="fixed inset-0 z-0">
          <img
            src={backdropUrl}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/95" />
          <div className="absolute inset-0 backdrop-blur-[1px]" />
        </div>
      )}

      <div className="relative z-10">
        {/* Updated header container to match TV show page */}
        <div className="backdrop-blur-sm bg-black/30 border-b border-white/10">
          <DetailHero
            title={movie.title}
            backdrop_path={null}
            poster_path={movie.poster_path ? `https://image.tmdb.org/t/p/original${movie.poster_path}` : null}
            vote_average={movie.vote_average}
            release_date={movie.release_date}
            overview={movie.overview}
            genres={movie.genres}
            onGenreClick={(genreId) => router.push(`/?genre=${genreId}`)}
            className="bg-transparent p-6 md:p-8"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 p-6 md:p-8">
          {/* Left Column - Details */}
          <div className="md:col-span-3 space-y-6">
            {/* 2. Videos Section - High engagement content */}
            {movie.videos?.results && (
              <section className="backdrop-blur-md bg-black/20 p-8 rounded-2xl border border-white/10 shadow-2xl hover:bg-black/25 transition-all duration-300">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <FaPlay className="text-emerald-400" />
                  Videos
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {movie.videos.results.slice(0, 3).map((video: any) => (
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
              <section className="backdrop-blur-md bg-black/20 p-8 rounded-2xl border border-white/10 shadow-2xl hover:bg-black/25 transition-all duration-300">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <FaUsers className="text-emerald-400" />
                  Cast
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 overflow-x-auto">
                  {movie.credits.cast.slice(0, 8).map((actor: any) => (
                    <button 
                      key={actor.id}
                      onClick={() => handleSearch(actor.name)}
                      className="text-center hover:opacity-80 transition-opacity w-[120px]"
                    >
                      <div className="w-[120px] h-[180px] relative rounded-lg overflow-hidden mb-2">
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
                      <p className="font-medium hover:text-emerald-500 transition-colors text-sm">{actor.name}</p>
                      <p className="text-xs text-[var(--foreground)]/70">{actor.character}</p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* 4. Key Crew Section */}
            {movie.credits?.crew && (
              <section className="backdrop-blur-md bg-black/20 p-8 rounded-2xl border border-white/10 shadow-2xl hover:bg-black/25 transition-all duration-300">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <FaTheaterMasks className="text-emerald-400" />
                  Key Crew
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 overflow-x-auto">
                  {movie.credits.crew
                    .filter((person: any) => 
                      ['Director', 'Producer', 'Executive Producer', 'Screenplay', 'Writer', 'Director of Photography', 'Original Music Composer']
                      .includes(person.job) && person.profile_path
                    )
                    .slice(0, 8)
                    .map((crewMember: any) => (
                      <button 
                        key={`${crewMember.id}-${crewMember.job}`}
                        onClick={() => handleSearch(crewMember.name)}
                        className="text-center hover:opacity-80 transition-opacity w-[120px]"
                      >
                        <div className="w-[120px] h-[180px] relative rounded-lg overflow-hidden mb-2">
                          <img
                            src={`https://image.tmdb.org/t/p/w500${crewMember.profile_path}`}
                            alt={crewMember.name}
                            className="object-cover absolute inset-0 w-full h-full"
                          />
                        </div>
                        <p className="font-medium hover:text-emerald-500 transition-colors text-sm">{crewMember.name}</p>
                        <p className="text-xs text-[var(--foreground)]/70">{crewMember.job}</p>
                      </button>
                    ))}
                </div>
              </section>
            )}

            {/* 5. Awards Section - Update to 1x8 grid */}
            {movie.awards && movie.awards.length > 0 && (
              <section className="backdrop-blur-md bg-black/20 p-8 rounded-2xl border border-white/10 shadow-2xl hover:bg-black/25 transition-all duration-300">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <FaTrophy className="text-emerald-400" />
                  Awards
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                  {movie.awards.map((award: any, index: number) => (
                    <div key={index} className="bg-[var(--background)]/50 rounded-lg p-4 flex flex-col items-center text-center">
                      <div className="w-12 h-12 mb-3 bg-emerald-500/10 rounded-full flex items-center justify-center">
                        <FaTrophy className="text-2xl text-emerald-500" />
                      </div>
                      <h3 className="font-medium text-sm mb-1">{award.name}</h3>
                      <p className="text-xs text-[var(--foreground)]/70 mb-1">{award.category}</p>
                      <p className="text-xs text-emerald-500">{award.year}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 6. Similar Movies - Update to show similarity details */}
            {movie.similar?.results && (
              <section className="backdrop-blur-md bg-black/20 p-8 rounded-2xl border border-white/10 shadow-2xl hover:bg-black/25 transition-all duration-300">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <FaFilm className="text-emerald-400" />
                  Similar Movies
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                  {movie.similar.results.slice(0, 8).map((similar: any) => (
                    <a 
                      href={`/movie/${similar.id}`} 
                      key={similar.id} 
                      className="text-center group"
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
                        {/* Updated Similarity Details Overlay */}
                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-xs flex flex-col justify-center items-center text-center gap-1">
                          {similar.similarity_details?.people_matches > 0 && (
                            <div className="text-blue-400">
                              {similar.similarity_details.people_matches} Shared Cast/Crew
                            </div>
                          )}
                          {similar.similarity_details?.genre_matches > 0 && (
                            <div className="text-purple-400">
                              {similar.similarity_details.genre_matches} Similar Genres
                            </div>
                          )}
                          {similar.similarity_details?.all_genres_match && (
                            <div className="text-emerald-400">All Genres Match!</div>
                          )}
                          <div className="mt-2 font-semibold">
                            Score: {Math.round(similar.similarity_score)}
                          </div>
                        </div>
                      </div>
                      <p className="font-medium text-sm">{similar.title}</p>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6 backdrop-blur-md bg-black/30 p-6 rounded-2xl border border-white/10 shadow-2xl sticky top-8 h-fit">
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