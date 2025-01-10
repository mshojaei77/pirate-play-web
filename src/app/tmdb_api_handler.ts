import { TrendingMoviesResponse, TrendingTVShowsResponse } from '@/types/tmdb';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

async function searchPeople(query: string): Promise<any> {
  const response = await fetch(
    `${BASE_URL}/search/person?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
  );
  return await response.json();
}

async function getPersonCredits(personId: number): Promise<any> {
  const [castMovies, castTV] = await Promise.all([
    fetch(`${BASE_URL}/person/${personId}/movie_credits?api_key=${API_KEY}`),
    fetch(`${BASE_URL}/person/${personId}/tv_credits?api_key=${API_KEY}`)
  ]);
  
  return {
    movies: await castMovies.json(),
    tv: await castTV.json()
  };
}

async function searchByAward(awardQuery: string): Promise<any> {
  try {
    // Get a large batch of highly-rated content since these are most likely to have awards
    const [movieResponse, tvResponse] = await Promise.all([
      fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&vote_average.gte=7&sort_by=vote_average.desc`),
      fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&vote_average.gte=7&sort_by=vote_average.desc`)
    ]);

    const movies = await movieResponse.json();
    const tvShows = await tvResponse.json();

    // Get detailed info for each item to check awards
    const movieDetails = await Promise.all(
      movies.results.map((movie: any) => getMovieDetails(movie.id))
    );
    const tvDetails = await Promise.all(
      tvShows.results.map((show: any) => getTVShowDetails(show.id))
    );

    // Filter content by matching award query
    const awardRegex = new RegExp(awardQuery, 'i');
    const matchingMovies = movieDetails.filter(movie => 
      movie.awards?.some((award: any) => 
        awardRegex.test(award.name) || awardRegex.test(award.category)
      )
    );
    const matchingTVShows = tvDetails.filter(show => 
      show.awards?.some((award: any) => 
        awardRegex.test(award.name) || awardRegex.test(award.category)
      )
    );

    return {
      results: [
        ...matchingMovies.map(item => ({
          ...item,
          media_type: 'movie',
          metadata: {
            ...item,
            backdrop_path: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
            poster_path: item.poster_path ? `https://image.tmdb.org/t/p/original${item.poster_path}` : null,
            matching_awards: item.awards.filter((award: any) => 
              awardRegex.test(award.name) || awardRegex.test(award.category)
            )
          }
        })),
        ...matchingTVShows.map(item => ({
          ...item,
          media_type: 'tv',
          metadata: {
            ...item,
            backdrop_path: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
            poster_path: item.poster_path ? `https://image.tmdb.org/t/p/original${item.poster_path}` : null,
            matching_awards: item.awards.filter((award: any) => 
              awardRegex.test(award.name) || awardRegex.test(award.category)
            )
          }
        }))
      ].sort((a, b) => b.vote_average - a.vote_average)
    };
  } catch (error) {
    console.error('Error searching by award:', error);
    throw error;
  }
}

export async function searchMulti(query: string, page: number = 1) {
  try {
    // Check if query looks like an award search
    const awardKeywords = ['oscar', 'academy award', 'golden globe', 'emmy', 'critics choice'];
    const isAwardSearch = awardKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );

    if (isAwardSearch) {
      return await searchByAward(query);
    }

    // Perform parallel searches for content and people
    const [contentResponse, peopleData] = await Promise.all([
      fetch(
        `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`
      ).then(res => res.json()),
      searchPeople(query)  // This already returns parsed JSON
    ]);

    // Get credits for the top 3 most popular people found
    const relevantPeople = peopleData.results
      ?.sort((a: any, b: any) => b.popularity - a.popularity)
      ?.slice(0, 3) || [];

    const peopleCredits = await Promise.all(
      relevantPeople.map((person: any) => getPersonCredits(person.id))
    );

    // Process people's credits
    const castContent: any[] = [];
    peopleCredits.forEach((credits, index) => {
      const person = relevantPeople[index];
      
      // Add movies where they were cast or crew
      credits.movies.cast?.forEach((movie: any) => {
        if (movie.poster_path) {
          castContent.push({
            ...movie,
            media_type: 'movie',
            metadata: {
              ...movie,
              title: movie.title,
              release_date: movie.release_date,
              backdrop_path: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
              poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/original${movie.poster_path}` : null,
              cast_info: `Featuring ${person.name}`,
              role: movie.character || 'Cast'
            }
          });
        }
      });

      credits.movies.crew?.forEach((movie: any) => {
        if (movie.poster_path && movie.job === 'Director') {
          castContent.push({
            ...movie,
            media_type: 'movie',
            metadata: {
              ...movie,
              title: movie.title,
              release_date: movie.release_date,
              backdrop_path: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
              poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/original${movie.poster_path}` : null,
              cast_info: `Directed by ${person.name}`,
              role: 'Director'
            }
          });
        }
      });

      // Add TV shows where they were cast or crew
      credits.tv.cast?.forEach((show: any) => {
        if (show.poster_path) {
          castContent.push({
            ...show,
            media_type: 'tv',
            metadata: {
              ...show,
              name: show.name,
              first_air_date: show.first_air_date,
              backdrop_path: show.backdrop_path ? `https://image.tmdb.org/t/p/original${show.backdrop_path}` : null,
              poster_path: show.poster_path ? `https://image.tmdb.org/t/p/original${show.poster_path}` : null,
              cast_info: `Featuring ${person.name}`,
              role: show.character || 'Cast'
            }
          });
        }
      });

      credits.tv.crew?.forEach((show: any) => {
        if (show.poster_path && (show.job === 'Director' || show.job === 'Executive Producer')) {
          castContent.push({
            ...show,
            media_type: 'tv',
            metadata: {
              ...show,
              name: show.name,
              first_air_date: show.first_air_date,
              backdrop_path: show.backdrop_path ? `https://image.tmdb.org/t/p/original${show.backdrop_path}` : null,
              poster_path: show.poster_path ? `https://image.tmdb.org/t/p/original${show.poster_path}` : null,
              cast_info: `${show.job} ${person.name}`,
              role: show.job
            }
          });
        }
      });
    });

    // Filter and combine results
    const directResults = contentResponse.results.filter((item: any) => 
      item.media_type !== 'person' && item.poster_path
    ).map((item: any) => ({
      ...item,
      metadata: {
        ...item,
        backdrop_path: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
        poster_path: item.poster_path ? `https://image.tmdb.org/t/p/original${item.poster_path}` : null,
      }
    }));

    // Remove duplicates and combine results
    const allResults = [...directResults, ...castContent];
    const uniqueResults = Array.from(
      new Map(allResults.map(item => [item.id, item])).values()
    );

    // Sort results by popularity
    const sortedResults = uniqueResults.sort((a, b) => 
      (b.popularity || 0) - (a.popularity || 0)
    );

    return {
      ...contentResponse,
      results: sortedResults
    };

  } catch (error) {
    console.error('Error searching content:', error);
    throw error;
  }
}

export async function getMovieDetails(movieId: number) {
  try {
    const [details, external] = await Promise.all([
      fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,videos,similar`),
      fetch(`${BASE_URL}/movie/${movieId}/external_ids?api_key=${API_KEY}`)
    ]);
    
    const movieData = await details.json();
    const externalData = await external.json();
    
    // Add mock awards data (since TMDB doesn't provide awards directly)
    // In a real app, you might want to fetch this from another API
    if (movieData.vote_average >= 8) {
      movieData.awards = [
        { name: "Academy Award", category: "Best Picture", year: new Date(movieData.release_date).getFullYear() },
        { name: "Golden Globe", category: "Best Motion Picture", year: new Date(movieData.release_date).getFullYear() }
      ];
    } else if (movieData.vote_average >= 7) {
      movieData.awards = [
        { name: "Critics' Choice", category: "Best Film", year: new Date(movieData.release_date).getFullYear() }
      ];
    }
    
    return { ...movieData, external_ids: externalData };
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
}

export async function getTVShowDetails(tvId: number) {
  try {
    const [details, external] = await Promise.all([
      fetch(`${BASE_URL}/tv/${tvId}?api_key=${API_KEY}&append_to_response=credits,videos,similar`),
      fetch(`${BASE_URL}/tv/${tvId}/external_ids?api_key=${API_KEY}`)
    ]);
    
    const tvData = await details.json();
    const externalData = await external.json();
    
    // Add mock awards data
    if (tvData.vote_average >= 8) {
      tvData.awards = [
        { name: "Emmy Award", category: "Outstanding Drama Series", year: new Date(tvData.first_air_date).getFullYear() },
        { name: "Golden Globe", category: "Best Television Series", year: new Date(tvData.first_air_date).getFullYear() }
      ];
    } else if (tvData.vote_average >= 7) {
      tvData.awards = [
        { name: "Critics' Choice", category: "Best Drama Series", year: new Date(tvData.first_air_date).getFullYear() }
      ];
    }
    
    return { ...tvData, external_ids: externalData };
  } catch (error) {
    console.error('Error fetching TV show details:', error);
    throw error;
  }
}


export async function fetchAllContent(page: number = 1) {
  try {
    const pages = [];
    for (let i = 0; i < 13; i++) {
      pages.push(page + i);
    }
    const allResponses = await Promise.all(pages.flatMap(pageNum => [
      fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&page=${pageNum}`),
      fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&page=${pageNum}`)
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
