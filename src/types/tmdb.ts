// Common properties shared between movies and TV shows
interface MediaBase {
    id: number;
    poster_path: string | null;
    overview: string;
    vote_average: number;
    vote_count: number;
    popularity: number;
    original_language: string;
}

// Movie specific interface
export interface Movie extends MediaBase {
    title: string;
    release_date: string;
    original_title: string;
    adult: boolean;
    video: boolean;
    backdrop_path: string | null;
}

// TV Show specific interface
export interface TVShow extends MediaBase {
    name: string;
    first_air_date: string;
    original_name: string;
    origin_country: string[];
    backdrop_path: string | null;
}

// Response interfaces for API calls
export interface TrendingMoviesResponse {
    page: number;
    results: Movie[];
    total_pages: number;
    total_results: number;
}

export interface TrendingTVShowsResponse {
    page: number;
    results: TVShow[];
    total_pages: number;
    total_results: number;
}

export interface Credit {
  id: number;
  name: string;
  profile_path: string | null;
  character?: string;
  job?: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface DetailedMovie extends Movie {
  budget: number;
  genres: { id: number; name: string }[];
  homepage: string | null;
  runtime: number;
  status: string;
  tagline: string | null;
  credits: {
    cast: Credit[];
    crew: Credit[];
  };
  videos: {
    results: Video[];
  };
  similar: {
    results: Movie[];
  };
}

export interface DetailedTVShow extends TVShow {
  created_by: {
    id: number;
    name: string;
    profile_path: string | null;
  }[];
  episode_run_time: number[];
  genres: { id: number; name: string }[];
  homepage: string | null;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  number_of_episodes: number;
  number_of_seasons: number;
  credits: {
    cast: Credit[];
    crew: Credit[];
  };
  videos: {
    results: Video[];
  };
  similar: {
    results: TVShow[];
  };
}