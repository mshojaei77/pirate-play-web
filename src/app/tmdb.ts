import { TrendingMoviesResponse, TrendingTVShowsResponse } from '@/types/tmdb';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

export async function fetchTrendingContent() {
  try {
    const [moviesRes, tvRes, animeRes] = await Promise.all([
      fetch(`${BASE_URL}/trending/movie/week?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`),
      fetch(`${BASE_URL}/trending/tv/week?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`),
      fetch(`${BASE_URL}/discover/tv?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&sort_by=popularity.asc&with_keywords=210024`)
    ]);

    const moviesData: TrendingMoviesResponse = await moviesRes.json();
    const tvData: TrendingTVShowsResponse = await tvRes.json();
    const animeData: TrendingTVShowsResponse = await animeRes.json();

    return {
      movies: moviesData.results,
      tvShows: tvData.results,
      anime: animeData.results
    };
  } catch (error) {
    console.error('Error fetching trending content:', error);
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
