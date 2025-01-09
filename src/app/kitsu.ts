const KITSU_API_BASE = 'https://kitsu.io/api/edge';

interface KitsuResponse<T> {
  data: T[];
  meta: {
    count: number;
  };
  links: {
    first: string;
    prev?: string;
    next?: string;
    last: string;
  };
  included?: any[];
}

interface KitsuAnime {
  id: string;
  type: string;
  attributes: {
    titles: {
      en?: string;
      en_jp?: string;
      ja_jp?: string;
    };
    canonicalTitle: string;
    averageRating: string;
    startDate: string;
    endDate: string;
    synopsis: string;
    userCount: string;
    coverImage: {
      original: string;
      large: string;
      small: string;
      tiny: string;
    };
    posterImage: {
      original: string;
      large: string;
      small: string;
      tiny: string;
    };
  };
}

export async function searchAnime(query: string, limit: number = 250) {
  try {
    const response = await fetch(
      `${KITSU_API_BASE}/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=${limit}`,
      {
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json'
        }
      }
    );
    const data: KitsuResponse<KitsuAnime> = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching anime:', error);
    throw error;
  }
}

export async function getTrendingAnime(limit: number = 250) {
  try {
    const response = await fetch(
      `${KITSU_API_BASE}/trending/anime?page[limit]=${limit}`,
      {
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json'
        }
      }
    );
    const data: KitsuResponse<KitsuAnime> = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching trending anime:', error);
    throw error;
  }
}

export async function getPopularThisYear(limit: number = 250) {
  const currentYear = new Date().getFullYear();
  try {
    const response = await fetch(
      `${KITSU_API_BASE}/anime?filter[seasonYear]=${currentYear}&sort=-userCount&page[limit]=${limit}`,
      {
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json'
        }
      }
    );
    const data: KitsuResponse<KitsuAnime> = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching popular anime this year:', error);
    throw error;
  }
}

export async function getMostPopularAllTime(limit: number = 250) {
  try {
    const response = await fetch(
      `${KITSU_API_BASE}/anime?sort=-userCount&page[limit]=${limit}`,
      {
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json'
        }
      }
    );
    const data: KitsuResponse<KitsuAnime> = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching most popular anime:', error);
    throw error;
  }
}

export async function getAnimeDetails(id: string) {
  try {
    const response = await fetch(
      `${KITSU_API_BASE}/anime/${id}?include=categories,characters`,
      {
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json'
        }
      }
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching anime details:', error);
    throw error;
  }
}
