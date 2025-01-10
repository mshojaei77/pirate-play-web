'use client';

import { use, useEffect, useState } from 'react';
import { getTVShowDetails } from '@/app/tmdb_api_handler';
import DetailHero from '@/components/DetailHero';
import Image from 'next/image';
import { 
  FaTv, FaCalendarAlt, FaFilm, FaListUl, 
  FaGlobe, FaTheaterMasks, FaBroadcastTower,
  FaRegClock, FaInfo, FaClock, FaTrophy 
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface Creator {
  id: number;
  name: string;
  profile_path: string | null;
  credit_id: string;
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

export default function TVShowPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();

  const handleSearch = (query: string) => {
    router.push(`/?searchQuery=${encodeURIComponent(query)}`);
  };

  // Unwrap params using React.use()
  const resolvedParams = use(params);
  const [show, setShow] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadShow = async () => {
      try {
        const data = await getTVShowDetails(parseInt(resolvedParams.id));
        setShow(data);
      } catch (error) {
        console.error('Error loading TV show:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadShow();
  }, [resolvedParams.id]);

  if (isLoading) return null; // Next.js will show the loading.tsx
  if (!show) return <div>TV Show not found</div>;

  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <DetailHero
        title={show.name}
        backdrop_path={show.backdrop_path ? `https://image.tmdb.org/t/p/original${show.backdrop_path}` : null}
        poster_path={show.poster_path ? `https://image.tmdb.org/t/p/original${show.poster_path}` : null}
        vote_average={show.vote_average}
        first_air_date={show.first_air_date}
        overview={show.overview}
        genres={show.genres}
        onGenreClick={(genreId) => router.push(`/?genre=${genreId}`)}
      />

      {/* Additional TV show details */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="md:col-span-2 space-y-8">
            {/* 1. Overview with Images */}
            <section className="bg-[#141414] p-6 rounded-xl border border-white/10">
              <h2 className="text-2xl font-bold mb-6">Overview</h2>
              <p className="text-[var(--foreground)]/70 text-lg leading-relaxed mb-6">{show.overview}</p>
              
              {/* Add shots grid */}
              {show.images?.backdrops && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {show.images.backdrops.slice(0, 4).map((image: any, index: number) => (
                    <div key={index} className="aspect-video rounded-lg overflow-hidden">
                      <img
                        src={`https://image.tmdb.org/t/p/w780${image.file_path}`}
                        alt={`${show.name} shot ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 2. Seasons - Unique to TV shows and highly relevant */}
            {show.seasons && (
              <section className="bg-[#141414] p-6 rounded-xl border border-white/10">
                <h2 className="text-2xl font-bold mb-4">Seasons</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {show.seasons.map((season: any) => (
                    <div key={season.id} className="bg-[var(--background)]/50 rounded-xl p-4">
                      <h3 className="font-medium mb-2">{season.name}</h3>
                      <p className="text-sm text-[var(--foreground)]/70">
                        {season.episode_count} Episodes
                      </p>
                      <p className="text-sm text-[var(--foreground)]/70">
                        {season.air_date}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 3. Videos Section */}
            {show.videos?.results && (
              <section className="bg-[#141414] p-6 rounded-xl border border-white/10">
                <h2 className="text-2xl font-bold mb-4">Videos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {show.videos.results.slice(0, 4).map((video: any) => (
                    <div key={video.id} className="aspect-video">
                      <iframe
                        className="w-full h-full rounded-lg"
                        src={`https://www.youtube.com/embed/${video.key}`}
                        allowFullScreen
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 4. Cast Section */}
            {show.credits?.cast && (
              <section className="bg-[#141414] p-6 rounded-xl border border-white/10">
                <h2 className="text-2xl font-bold mb-4">Cast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {show.credits.cast.slice(0, 8).map((actor: any) => (
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

            {/* 5. Creators Section */}
            {show.created_by && show.created_by.length > 0 && (
              <section className="bg-[#141414] p-6 rounded-xl border border-white/10">
                <h2 className="text-2xl font-bold mb-4">Created By</h2>
                <div className="grid gap-4">
                  {show.created_by.map((creator: Creator) => (
                    <button 
                      key={creator.id}
                      onClick={() => handleSearch(creator.name)}
                      className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0">
                        {creator.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${creator.profile_path}`}
                            alt={creator.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-[var(--background)]/50 flex items-center justify-center">
                            <FaTheaterMasks className="text-3xl text-emerald-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-lg hover:text-emerald-500 transition-colors">{creator.name}</p>
                        <p className="text-sm text-[var(--foreground)]/70">Creator</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* 6. Awards Section */}
            {show.awards && show.awards.length > 0 && (
              <section className="bg-[#141414] p-6 rounded-xl border border-white/10">
                <h2 className="text-2xl font-bold mb-4">Awards</h2>
                <div className="grid gap-4">
                  {show.awards.map((award: any, index: number) => (
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

            {/* 7. Similar Shows */}
            {show.similar?.results && (
              <section className="bg-[#141414] p-6 rounded-xl border border-white/10">
                <h2 className="text-2xl font-bold mb-4">Similar Shows</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {show.similar.results.slice(0, 4).map((similar: any) => (
                    <a 
                      href={`/tv/${similar.id}`} 
                      key={similar.id} 
                      className="text-center hover:opacity-80 transition-opacity"
                    >
                      <div className="w-full aspect-[2/3] relative rounded-lg overflow-hidden mb-2">
                        {similar.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${similar.poster_path}`}
                            alt={similar.name}
                            className="object-cover absolute inset-0 w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-[var(--background)]/50" />
                        )}
                      </div>
                      <p className="font-medium">{similar.name}</p>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6 bg-[#141414] p-6 rounded-xl border border-white/10">
            {/* Add Production Countries */}
            {show.production_countries && show.production_countries.length > 0 && (
              <InfoItem
                title="Countries"
                value={show.production_countries.map((country: ProductionCountry) => country.name).join(', ')}
                icon={<FaGlobe className="text-emerald-500 text-lg" />}
              />
            )}

            {/* Add Episode Runtime */}
            {show.episode_run_time && show.episode_run_time.length > 0 && (
              <InfoItem
                title="Episode Runtime"
                value={`${show.episode_run_time[0]} minutes`}
                icon={<FaClock className="text-emerald-500 text-lg" />}
              />
            )}

            {/* Add Next Episode Info */}
            {show.next_episode_to_air && (
              <InfoItem
                title="Next Episode"
                value={
                  <div className="space-y-1">
                    <div>Episode {show.next_episode_to_air.episode_number}</div>
                    <div className="text-sm opacity-70">{show.next_episode_to_air.air_date}</div>
                  </div>
                }
                icon={<FaCalendarAlt className="text-emerald-500 text-lg" />}
              />
            )}

            {/* Status */}
            <InfoItem 
              title="Status" 
              value={
                <span className="px-3 py-1.5 rounded-md bg-[var(--background)] border border-white/10 inline-block">
                  {show.status}
                </span>
              } 
              icon={<FaTv className="text-emerald-500 text-lg" />} 
            />

            {/* First Aired */}
            <InfoItem 
              title="First Aired" 
              value={
                <span className="px-3 py-1.5 rounded-md bg-[var(--background)] border border-white/10 inline-block">
                  {show.first_air_date}
                </span>
              } 
              icon={<FaCalendarAlt className="text-emerald-500 text-lg" />} 
            />
            
            {/* Seasons and Episodes grid */}
            <div className="grid grid-cols-2 gap-6">
              <InfoItem
                title="Seasons"
                value={
                  <span className="px-3 py-1.5 rounded-md bg-[var(--background)] border border-white/10 inline-block">
                    {`${show.number_of_seasons} ${show.number_of_seasons === 1 ? 'Season' : 'Seasons'}`}
                  </span>
                }
                icon={<FaFilm className="text-emerald-500 text-lg" />}
              />
              <InfoItem
                title="Episodes"
                value={
                  <span className="px-3 py-1.5 rounded-md bg-[var(--background)] border border-white/10 inline-block">
                    {`${show.number_of_episodes} ${show.number_of_episodes === 1 ? 'Episode' : 'Episodes'}`}
                  </span>
                }
                icon={<FaListUl className="text-emerald-500 text-lg" />}
              />
            </div>

            {show.last_air_date && (
              <InfoItem
                title="Last Aired"
                value={show.last_air_date}
                icon={<FaRegClock className="text-emerald-500 text-lg" />}
              />
            )}

            {show.networks && (
              <InfoItem
                title="Networks"
                value={
                  <div className="space-y-2">
                    {show.networks.map((network: any) => (
                      <div key={network.id} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{network.name}</span>
                      </div>
                    ))}
                  </div>
                }
                icon={<FaBroadcastTower className="text-emerald-500 text-lg" />}
              />
            )}

            {show.type && (
              <InfoItem
                title="Show Type"
                value={show.type}
                icon={<FaInfo className="text-emerald-500 text-lg" />}
              />
            )}

            {show.original_language && (
              <InfoItem
                title="Original Language"
                value={show.original_language?.toUpperCase()}
                icon={<FaGlobe className="text-emerald-500 text-lg" />}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}