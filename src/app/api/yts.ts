interface Torrent {
    url: string;
    hash: string;
    quality: string;
    type: string;
    is_repack: string;
    video_codec: string;
    bit_depth: string;
    audio_channels: string;
    seeds: number;
    peers: number;
    size: string;
    size_bytes: number;
    date_uploaded: string;
    date_uploaded_unix: number;
}

interface Movie {
    id: number;
    url: string;
    imdb_code: string;
    title: string;
    title_english: string;
    title_long: string;
    slug: string;
    year: number;
    rating: number;
    runtime: number;
    genres: string[];
    summary: string;
    description_full: string;
    synopsis: string;
    yt_trailer_code: string;
    language: string;
    mpa_rating: string;
    background_image: string;
    background_image_original: string;
    small_cover_image: string;
    medium_cover_image: string;
    large_cover_image: string;
    state: string;
    torrents: Torrent[];
    date_uploaded: string;
    date_uploaded_unix: number;
}

class YTSService {
    private static readonly BASE_URL = "https://yts.mx/api/v2";
    private session: typeof fetch;
    private params: {
        limit: number;
        page: number;
        quality: string | null;
        minimum_rating: number;
        query_term: string | null;
        genre: string | null;
        sort_by: string;
        order_by: string;
        with_rt_ratings: boolean;
    };

    constructor() {
        this.session = fetch;
        this.params = {
            limit: 20,
            page: 1,
            quality: null,
            minimum_rating: 0,
            query_term: null,
            genre: null,
            sort_by: "date_added",
            order_by: "desc",
            with_rt_ratings: false
        };
    }

    setParams(params: Partial<typeof this.params>): void {
        Object.assign(this.params, params);
    }

    private async makeRequest(endpoint: string, params?: typeof this.params): Promise<any> {
        const url = new URL(`${YTSService.BASE_URL}/${endpoint}`);
        const searchParams = new URLSearchParams(
            Object.entries(params || this.params)
                .filter(([_, value]) => value !== null)
                .map(([key, value]) => [key, String(value)])
        );
        url.search = searchParams.toString();

        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    async listMovies(): Promise<Movie[]> {
        const response = await this.makeRequest("list_movies.json");
        if (response.status !== "ok") {
            throw new Error(response.status_message);
        }
        return response.data.movies;
    }

    async getMovieDetails(movieId: number): Promise<Movie> {
        const response = await this.makeRequest("movie_details.json", { movie_id: movieId } as any);
        if (response.status !== "ok") {
            throw new Error(response.status_message);
        }
        return response.data.movie;
    }

    async searchMovies(query: string): Promise<Movie[]> {
        this.params.query_term = query;
        return this.listMovies();
    }

    async filterByGenre(genre: string): Promise<Movie[]> {
        this.params.genre = genre;
        return this.listMovies();
    }

    async filterByQuality(quality: string): Promise<Movie[]> {
        this.params.quality = quality;
        return this.listMovies();
    }

    async filterByRating(minimumRating: number): Promise<Movie[]> {
        this.params.minimum_rating = minimumRating;
        return this.listMovies();
    }

    async sortMovies(sortBy: string, orderBy: "desc" | "asc" = "desc"): Promise<Movie[]> {
        this.params.sort_by = sortBy;
        this.params.order_by = orderBy;
        return this.listMovies();
    }

    async setPage(page: number, limit: number = 20): Promise<Movie[]> {
        this.params.page = page;
        this.params.limit = limit;
        return this.listMovies();
    }

    resetParams(): void {
        this.params = {
            limit: 20,
            page: 1,
            quality: null,
            minimum_rating: 0,
            query_term: null,
            genre: null,
            sort_by: "date_added",
            order_by: "desc",
            with_rt_ratings: false
        };
    }

    async advancedSearch({
        queryTerm,
        quality,
        genre,
        rating,
        sortBy = "date_added",
        orderBy = "desc",
        limit = 20,
        page = 1,
        withRtRatings = false
    }: {
        queryTerm?: string;
        quality?: string;
        genre?: string;
        rating?: number;
        sortBy?: string;
        orderBy?: "desc" | "asc";
        limit?: number;
        page?: number;
        withRtRatings?: boolean;
    }): Promise<Movie[]> {
        const searchParams = {
            query_term: queryTerm,
            quality,
            genre,
            minimum_rating: rating,
            sort_by: sortBy,
            order_by: orderBy,
            limit: Math.min(Math.max(1, limit), 50),
            page: Math.max(1, page),
            with_rt_ratings: withRtRatings
        };

        // Update current params with non-null values
        this.setParams(Object.fromEntries(
            Object.entries(searchParams).filter(([_, v]) => v !== undefined)
        ));

        return this.listMovies();
    }

    async getMoviePoster(movieName: string): Promise<{ 
        small: string; 
        medium: string; 
        large: string; 
    } | null> {
        const searchParams = {
            query_term: movieName,
            limit: 1
        };

        try {
            const response = await this.makeRequest("list_movies.json", searchParams as any);
            if (
                response.status === "ok" &&
                response.data?.movies?.length > 0
            ) {
                const movie = response.data.movies[0];
                return {
                    small: movie.small_cover_image,
                    medium: movie.medium_cover_image,
                    large: movie.large_cover_image
                };
            }
        } catch (e) {
            console.error(`Error fetching poster for ${movieName}:`, e);
        }

        return null;
    }
}

// Example usage
if (typeof window !== 'undefined') {
    const yts = new YTSService();
    yts.getMoviePoster("The Matrix").then(poster => console.log(poster?.medium));
}