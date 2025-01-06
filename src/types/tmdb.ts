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