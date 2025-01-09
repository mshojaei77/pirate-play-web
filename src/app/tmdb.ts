import { TrendingMoviesResponse, TrendingTVShowsResponse } from '@/types/tmdb';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

export async function fetchTrendingContent() {
  try {
    const [
      trendingMoviesRes,
      trendingTVRes,
      animeRes,
      popularMoviesThisYearRes,
      popularTVThisYearRes,
      allTimeMoviesRes, 
      allTimeTVRes,
      upcomingMoviesRes,
      upcomingTVRes
    ] = await Promise.all([
      // Trending this week
      fetch(`${BASE_URL}/trending/movie/week?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`),
      fetch(`${BASE_URL}/trending/tv/week?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`),
      fetch(`${BASE_URL}/discover/tv?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&sort_by=popularity.asc&with_keywords=210024`),
      
      // Popular this year
      fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&primary_release_year=${new Date().getFullYear()}`),
      fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&sort_by=popularity.desc&first_air_date_year=${new Date().getFullYear()}`),
      
      // Most popular all time
      fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=vote_average.desc&vote_count.gte=1000`),
      fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&sort_by=vote_average.desc&vote_count.gte=1000`),
      
      // Upcoming
      fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}`),
      fetch(`${BASE_URL}/tv/on_the_air?api_key=${API_KEY}`),
    ]);

    const trendingMovies: TrendingMoviesResponse = await trendingMoviesRes.json();
    const trendingTV: TrendingTVShowsResponse = await trendingTVRes.json();
    const anime: TrendingTVShowsResponse = await animeRes.json();
    const popularMoviesThisYear = await popularMoviesThisYearRes.json();
    const popularTVThisYear = await popularTVThisYearRes.json();
    const allTimeMovies = await allTimeMoviesRes.json();
    const allTimeTV = await allTimeTVRes.json();
    const upcomingMovies = await upcomingMoviesRes.json();
    const upcomingTV = await upcomingTVRes.json();

    return {
      trending: {
        movies: trendingMovies.results,
        tvShows: trendingTV.results,
        anime: anime.results
      },
      thisYear: {
        movies: popularMoviesThisYear.results,
        tvShows: popularTVThisYear.results
      },
      allTime: {
        movies: allTimeMovies.results,
        tvShows: allTimeTV.results
      },
      upcoming: {
        movies: upcomingMovies.results,
        tvShows: upcomingTV.results
      }
    };
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
}

export async function searchMulti(query: string, page: number = 1) {
  try {
    const response = await fetch(
      `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    );
    return await response.json();
  } catch (error) {
    console.error('Error searching content:', error);
    throw error;
  }
}

export async function getMovieDetails(movieId: number) {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,videos,similar`
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
}

export async function getTVShowDetails(tvId: number) {
  try {
    const response = await fetch(
      `${BASE_URL}/tv/${tvId}?api_key=${API_KEY}&append_to_response=credits,videos,similar`
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching TV show details:', error);
    throw error;
  }
}

export async function getPopularMovies(page: number = 1) {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error;
  }
}

export async function getPopularTVShows(page: number = 1) {
  try {
    const response = await fetch(
      `${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching popular TV shows:', error);
    throw error;
  }
}

export async function getUpcomingMovies(page: number = 1) {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&page=${page}`
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    throw error;
  }
}
export async function fetchAllContent(page: number = 1) {
  try {
    // Fetch 3 pages of content for more variety
    const pages = [page, page + 1, page + 2];
    const allResponses = await Promise.all(pages.flatMap(pageNum => [
      fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${pageNum}&language=en-US`),
      fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${pageNum}&language=en-US`),
      fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&page=${pageNum}&language=en-US`),
      fetch(`${BASE_URL}/tv/on_the_air?api_key=${API_KEY}&page=${pageNum}&language=en-US`),
      fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=${pageNum}&language=en-US`),
      fetch(`${BASE_URL}/tv/top_rated?api_key=${API_KEY}&page=${pageNum}&language=en-US`),
      fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&page=${pageNum}&language=en-US`),
      fetch(`${BASE_URL}/tv/airing_today?api_key=${API_KEY}&page=${pageNum}&language=en-US`)
    ]));

    // Check if any requests failed
    for (const response of allResponses) {
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
    }

    const allData = await Promise.all(allResponses.map(r => r.json()));

    // Group the results by content type
    const popularMovies = allData.filter((_, i) => i % 8 === 0);
    const popularTV = allData.filter((_, i) => i % 8 === 1);
    const upcomingMovies = allData.filter((_, i) => i % 8 === 2);
    const upcomingTV = allData.filter((_, i) => i % 8 === 3);
    const topRatedMovies = allData.filter((_, i) => i % 8 === 4);
    const topRatedTV = allData.filter((_, i) => i % 8 === 5);
    const nowPlayingMovies = allData.filter((_, i) => i % 8 === 6);
    const airingTodayTV = allData.filter((_, i) => i % 8 === 7);

    // Combine all results from different pages
    const combinedMovies = [
      ...popularMovies.flatMap(data => data.results),
      ...upcomingMovies.flatMap(data => data.results),
      ...topRatedMovies.flatMap(data => data.results),
      ...nowPlayingMovies.flatMap(data => data.results)
    ];

    const combinedTVShows = [
      ...popularTV.flatMap(data => data.results),
      ...upcomingTV.flatMap(data => data.results),
      ...topRatedTV.flatMap(data => data.results),
      ...airingTodayTV.flatMap(data => data.results)
    ];

    const uniqueMovies = Array.from(new Map(combinedMovies.map(item => [item.id, item])).values());
    const uniqueTVShows = Array.from(new Map(combinedTVShows.map(item => [item.id, item])).values());

    return {
      movies: uniqueMovies.map(movie => ({
        ...movie,
        metadata: {
          // Basic Info
          id: movie.id,
          imdb_id: movie.imdb_id,
          title: movie.title,
          original_title: movie.original_title,
          tagline: movie.tagline,
          overview: movie.overview,
          homepage: movie.homepage,
          status: movie.status,

          // Dates & Release Info
          release_date: movie.release_date,
          release_dates: movie.release_dates,
          belongs_to_collection: movie.belongs_to_collection,

          // Ratings & Popularity
          popularity: movie.popularity,
          vote_average: movie.vote_average,
          vote_count: movie.vote_count,
          revenue: movie.revenue,
          budget: movie.budget,

          // Technical Details
          runtime: movie.runtime,
          original_language: movie.original_language,
          spoken_languages: movie.spoken_languages,
          adult: movie.adult,
          video: movie.video,

          // Visual Assets
          backdrop_path: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
          poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/original${movie.poster_path}` : null,
          images: movie.images,
          videos: movie.videos,

          // Categories & Keywords
          genre_ids: movie.genre_ids,
          genres: movie.genres,
          keywords: movie.keywords,

          // Production Info
          production_companies: movie.production_companies,
          production_countries: movie.production_countries,
          
          // Cast & Crew
          credits: movie.credits,
          cast: movie.cast,
          crew: movie.crew,
          director: movie.director,

          // Additional Content
          alternative_titles: movie.alternative_titles,
          recommendations: movie.recommendations,
          similar: movie.similar,
          reviews: movie.reviews,
          
          // Technical Specs
          original_aspect_ratio: movie.original_aspect_ratio,
          certification: movie.certification,
          content_ratings: movie.content_ratings
        }
      })),
      tvShows: uniqueTVShows.map(tvShow => ({
        ...tvShow,
        metadata: {
          // Basic Info
          id: tvShow.id,
          name: tvShow.name,
          original_name: tvShow.original_name,
          tagline: tvShow.tagline,
          overview: tvShow.overview,
          homepage: tvShow.homepage,
          status: tvShow.status,
          type: tvShow.type,
          
          // Dates & Airing Info
          first_air_date: tvShow.first_air_date,
          last_air_date: tvShow.last_air_date,
          next_episode_to_air: tvShow.next_episode_to_air,
          last_episode_to_air: tvShow.last_episode_to_air,
          in_production: tvShow.in_production,
          
          // Ratings & Popularity
          popularity: tvShow.popularity,
          vote_average: tvShow.vote_average,
          vote_count: tvShow.vote_count,
          
          // Series Details
          number_of_episodes: tvShow.number_of_episodes,
          number_of_seasons: tvShow.number_of_seasons,
          episode_run_time: tvShow.episode_run_time,
          seasons: tvShow.seasons,
          episodes: tvShow.episodes,
          
          // Technical Details
          original_language: tvShow.original_language,
          spoken_languages: tvShow.spoken_languages,
          languages: tvShow.languages,
          
          // Visual Assets
          backdrop_path: tvShow.backdrop_path ? `https://image.tmdb.org/t/p/original${tvShow.backdrop_path}` : null,
          poster_path: tvShow.poster_path ? `https://image.tmdb.org/t/p/original${tvShow.poster_path}` : null,
          images: tvShow.images,
          videos: tvShow.videos,
          
          // Categories & Keywords
          genre_ids: tvShow.genre_ids,
          genres: tvShow.genres,
          keywords: tvShow.keywords,
          
          // Networks & Production
          networks: tvShow.networks,
          production_companies: tvShow.production_companies,
          production_countries: tvShow.production_countries,
          origin_country: tvShow.origin_country,
          
          // Cast & Crew
          credits: tvShow.credits,
          cast: tvShow.cast,
          crew: tvShow.crew,
          created_by: tvShow.created_by,
          
          // Additional Content
          alternative_titles: tvShow.alternative_titles,
          recommendations: tvShow.recommendations,
          similar: tvShow.similar,
          reviews: tvShow.reviews,
          
          // Technical Specs
          original_aspect_ratio: tvShow.original_aspect_ratio,
          content_ratings: tvShow.content_ratings,
          external_ids: tvShow.external_ids,
          
          // Streaming Info
          available_on: tvShow.available_on,
          watch_providers: tvShow.watch_providers
        }
      })),
      totalPages: {
        movies: Math.max(
          ...popularMovies.map(data => data.total_pages || 1),
          ...upcomingMovies.map(data => data.total_pages || 1),
          ...topRatedMovies.map(data => data.total_pages || 1),
          ...nowPlayingMovies.map(data => data.total_pages || 1)
        ),
        tvShows: Math.max(
          ...popularTV.map(data => data.total_pages || 1),
          ...upcomingTV.map(data => data.total_pages || 1),
          ...topRatedTV.map(data => data.total_pages || 1),
          ...airingTodayTV.map(data => data.total_pages || 1)
        )
      }
    };
  } catch (error) {
    console.error('Error fetching all content:', error);
    throw error;
  }
}
