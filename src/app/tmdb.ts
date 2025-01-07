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
