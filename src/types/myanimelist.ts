interface AnimeResult {
    id: number;
    name: string;
    poster_path: string;
    vote_average: number;
}

interface AnimeResponse {
    results: AnimeResult[];
}

interface MALAnimeNode {
    id: number;
    title: string;
    main_picture?: {
        large?: string;
    };
    mean?: number;
}

interface MALResponse {
    data?: Array<{
        node: MALAnimeNode;
    }>;
}
