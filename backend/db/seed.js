/**
 * seed.js - Generates realistic IMDB-schema-compatible mock data into SQLite.
 * Called by loader.js when real TSV files are not present in data/.
 */

const GENRES = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller',
  'Western', 'Biography', 'History', 'Music', 'Sport', 'War', 'Family'];

const LANGUAGES = ['en', 'fr', 'de', 'es', 'ja', 'ko', 'it', 'pt', 'zh', 'hi'];
const REGIONS = ['US', 'GB', 'FR', 'DE', 'JP', 'KR', 'IT', 'BR', 'CN', 'IN'];
const TITLE_TYPES = ['movie', 'movie', 'movie', 'movie', 'movie', 'movie',
  'tvSeries', 'tvSeries', 'short', 'tvMovie'];

const FIRST_NAMES = ['James', 'Emma', 'Christopher', 'Sofia', 'Liam', 'Ava', 'Noah',
  'Olivia', 'Ethan', 'Mia', 'Lucas', 'Isabella', 'Mason', 'Grace', 'Logan',
  'Chloe', 'Jackson', 'Zoe', 'Sebastian', 'Lily', 'Akira', 'Yuki', 'Min', 'Priya',
  'Arjun', 'Fatima', 'Mohammed', 'Chen', 'Wei', 'Han', 'Ana', 'Carlos', 'Diego',
  'Elena', 'Marco', 'Giulia', 'Ravi', 'Noor', 'Amir', 'Leila'];

const LAST_NAMES = ['Anderson', 'Miller', 'Nolan', 'Spielberg', 'Kubrick', 'Cameron',
  'Fincher', 'Villeneuve', 'Scott', 'Tarantino', 'Wright', 'Gunn', 'Zhao', 'Jenkins',
  'Washington', 'Jordan', 'Waititi', 'Reed', 'Peele', 'Fukunaga', 'Tanaka', 'Kim',
  'Park', 'Sharma', 'Patel', 'Hassan', 'Ali', 'Zhang', 'Liu', 'Wu', 'Santos',
  'Rodrigues', 'Garcia', 'Martinez', 'Russo', 'Conti', 'Kumar', 'Khan', 'Reza', 'Nazari'];

const TITLE_WORDS = {
  Action: ['Strike', 'Force', 'Thunder', 'Iron', 'Steel', 'Blade', 'Shadow', 'Dark', 'Fire', 'Storm'],
  SciFi: ['Nebula', 'Quantum', 'Void', 'Stellar', 'Cosmos', 'Orbit', 'Genesis', 'Horizon', 'Signal', 'Prime'],
  Drama: ['Echo', 'Silence', 'Broken', 'Light', 'Distance', 'Last', 'First', 'After', 'Before', 'Between'],
  Thriller: ['Cipher', 'Trace', 'Hunt', 'Prey', 'Witness', 'Veil', 'Hidden', 'Marked', 'Ghost', 'Specter'],
  Comedy: ['Chaos', 'Absurd', 'Lucky', 'Random', 'Happy', 'Perfect', 'Funny', 'Wild', 'Crazy', 'Super'],
  Horror: ['Dread', 'Fear', 'Curse', 'Haunted', 'Dead', 'Grave', 'Sinister', 'Wicked', 'Evil', 'Nightmare'],
  Romance: ['Heart', 'Love', 'Dream', 'Memory', 'Together', 'Promise', 'Summer', 'Forever', 'Second', 'Chance'],
  Animation: ['Magic', 'Wonder', 'Journey', 'Quest', 'Adventure', 'Kingdom', 'Dragon', 'Sky', 'Ocean', 'Star'],
  Default: ['The', 'Beyond', 'Into', 'After', 'Before', 'Through', 'Under', 'Over', 'Above', 'Below'],
};

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}
function padId(prefix, n) { return `${prefix}${String(n).padStart(7, '0')}`; }

function generateTitle(genre) {
  const words = TITLE_WORDS[genre] || TITLE_WORDS.Default;
  const alt = TITLE_WORDS.Default;
  const patterns = [
    () => `${pick(words)} ${pick(alt)}`,
    () => `The ${pick(words)} ${pick(alt)}`,
    () => `${pick(alt)} ${pick(words)}`,
    () => `${pick(words)} of ${pick(alt)}`,
    () => `${pick(words)}s`,
  ];
  return pick(patterns)();
}

function generatePeople(count) {
  const people = [];
  const PROFESSIONS = ['actor', 'actress', 'director', 'writer', 'producer', 'cinematographer', 'composer'];
  for (let i = 1; i <= count; i++) {
    const nconst = padId('nm', i);
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    const birthYear = rand(1940, 1990);
    const deathYear = Math.random() < 0.1 ? rand(birthYear + 40, 2020) : '\\N';
    const profs = pickN(PROFESSIONS, rand(1, 3));
    people.push({ nconst, primaryName: name, birthYear, deathYear, primaryProfession: profs.join(',') });
  }
  return people;
}

function generateMovies(count, people) {
  const directors = people.filter((_, i) => i < 15).map(p => p.nconst);
  const writers = people.filter((_, i) => i >= 5 && i < 25).map(p => p.nconst);
  const actors = people.filter((_, i) => i >= 10).map(p => p.nconst);

  const movies = [];
  const ratings = [];
  const crew = [];
  const principals = [];
  const akas = [];

  for (let i = 1; i <= count; i++) {
    const tconst = padId('tt', i);
    const genreList = pickN(GENRES, rand(1, 3));
    const titleType = pick(TITLE_TYPES);
    const startYear = rand(2000, 2025);
    const endYear = titleType === 'tvSeries' ? (Math.random() < 0.5 ? startYear + rand(1, 10) : '\\N') : '\\N';
    const runtime = titleType === 'short' ? rand(5, 30) : rand(80, 200);
    const primaryTitle = generateTitle(genreList[0]);
    const isAdult = 0;

    // Extended: budget, revenue, popularity (not in IMDB schema, added for analytics)
    const budget = rand(1, 250) * 1_000_000;
    const revenue = Math.random() < 0.05 ? 0 : Math.round(budget * randFloat(0.2, 8.0, 2));
    const popularity = randFloat(1, 100, 2);

    movies.push({
      tconst, titleType, primaryTitle,
      originalTitle: primaryTitle,
      isAdult, startYear, endYear,
      runtimeMinutes: runtime,
      genres: genreList.join(','),
      budget, revenue, popularity,
    });

    // Ratings
    const avgRating = randFloat(1.5, 9.8, 1);
    const numVotes = rand(100, 2_000_000);
    ratings.push({ tconst, averageRating: avgRating, numVotes });

    // Crew
    const movieDirectors = pickN(directors, rand(1, 2));
    const movieWriters = pickN(writers, rand(1, 3));
    crew.push({ tconst, directors: movieDirectors.join(','), writers: movieWriters.join(',') });

    // Principals (cast & key crew)
    const castMembers = pickN(actors, rand(3, 8));
    const CATEGORIES = ['actor', 'actress', 'director', 'writer', 'producer', 'cinematographer', 'composer', 'editor'];
    castMembers.forEach((nconst, ordering) => {
      const category = ordering === 0 ? (Math.random() < 0.5 ? 'actor' : 'actress') : pick(CATEGORIES);
      const job = category === 'actor' || category === 'actress' ? '\\N' : `${category}`;
      const character = category === 'actor' || category === 'actress' ? `["Character_${rand(1, 99)}"]` : '\\N';
      principals.push({ tconst, ordering: ordering + 1, nconst, category, job, characters: character });
    });

    // AKAs (regional titles)
    const regions = pickN(REGIONS, rand(1, 4));
    regions.forEach((region, ordering) => {
      const isOriginal = ordering === 0 ? 1 : 0;
      const types = isOriginal ? 'original' : pick(['imdbDisplay', 'alternative', 'tv']);
      akas.push({
        titleId: tconst,
        ordering: ordering + 1,
        title: `${primaryTitle}${isOriginal ? '' : ` (${region})`}`,
        region,
        language: pick(LANGUAGES),
        types,
        attributes: '\\N',
        isOriginalTitle: isOriginal,
      });
    });
  }

  // episodes for first 10 tvseries
  const tvSeries = movies.filter(m => m.titleType === 'tvSeries').slice(0, 10);
  const episodes = [];
  tvSeries.forEach(series => {
    const seasonCount = rand(2, 5);
    for (let s = 1; s <= seasonCount; s++) {
      const epCount = rand(6, 13);
      for (let e = 1; e <= epCount; e++) {
        const epId = padId('tt', movies.length + episodes.length + 1);
        episodes.push({
          tconst: epId,
          parentTconst: series.tconst,
          seasonNumber: s,
          episodeNumber: e,
        });
      }
    }
  });

  return { movies, ratings, crew, principals, akas, episodes };
}

function seed(db) {
  console.log('[seed] Generating mock data...');
  const PEOPLE_COUNT = 60;
  const MOVIE_COUNT = 200;

  const people = generatePeople(PEOPLE_COUNT);
  const { movies, ratings, crew, principals, akas, episodes } = generateMovies(MOVIE_COUNT, people);

  // Insert people
  const insertPerson = db.prepare(`
    INSERT OR IGNORE INTO name_basics (nconst, primaryName, birthYear, deathYear, primaryProfession, knownForTitles)
    VALUES (@nconst, @primaryName, @birthYear, @deathYear, @primaryProfession, '')
  `);
  const insertManyPeople = db.transaction(rows => rows.forEach(r => insertPerson.run(r)));
  insertManyPeople(people);

  // Insert movies
  const insertMovie = db.prepare(`
    INSERT OR IGNORE INTO title_basics
      (tconst, titleType, primaryTitle, originalTitle, isAdult, startYear, endYear, runtimeMinutes, genres, budget, revenue, popularity)
    VALUES
      (@tconst, @titleType, @primaryTitle, @originalTitle, @isAdult, @startYear, @endYear, @runtimeMinutes, @genres, @budget, @revenue, @popularity)
  `);
  const insertManyMovies = db.transaction(rows => rows.forEach(r => insertMovie.run(r)));
  insertManyMovies(movies);

  // Insert ratings
  const insertRating = db.prepare(`
    INSERT OR IGNORE INTO title_ratings (tconst, averageRating, numVotes)
    VALUES (@tconst, @averageRating, @numVotes)
  `);
  const insertManyRatings = db.transaction(rows => rows.forEach(r => insertRating.run(r)));
  insertManyRatings(ratings);

  // Insert crew
  const insertCrew = db.prepare(`
    INSERT OR IGNORE INTO title_crew (tconst, directors, writers)
    VALUES (@tconst, @directors, @writers)
  `);
  const insertManyCrew = db.transaction(rows => rows.forEach(r => insertCrew.run(r)));
  insertManyCrew(crew);

  // Insert principals
  const insertPrincipal = db.prepare(`
    INSERT OR IGNORE INTO title_principals (tconst, ordering, nconst, category, job, characters)
    VALUES (@tconst, @ordering, @nconst, @category, @job, @characters)
  `);
  const insertManyPrincipals = db.transaction(rows => rows.forEach(r => insertPrincipal.run(r)));
  insertManyPrincipals(principals);

  // Insert akas
  const insertAka = db.prepare(`
    INSERT OR IGNORE INTO title_akas (titleId, ordering, title, region, language, types, attributes, isOriginalTitle)
    VALUES (@titleId, @ordering, @title, @region, @language, @types, @attributes, @isOriginalTitle)
  `);
  const insertManyAkas = db.transaction(rows => rows.forEach(r => insertAka.run(r)));
  insertManyAkas(akas);

  // Insert episodes
  const insertEpisode = db.prepare(`
    INSERT OR IGNORE INTO title_episode (tconst, parentTconst, seasonNumber, episodeNumber)
    VALUES (@tconst, @parentTconst, @seasonNumber, @episodeNumber)
  `);
  const insertManyEpisodes = db.transaction(rows => rows.forEach(r => insertEpisode.run(r)));
  insertManyEpisodes(episodes);

  // Update knownForTitles on people (random 1-4 titles each)
  const allTconsts = movies.map(m => m.tconst);
  const updatePerson = db.prepare(`UPDATE name_basics SET knownForTitles=? WHERE nconst=?`);
  const updatePeople = db.transaction(() => {
    people.forEach(p => {
      const known = pickN(allTconsts, rand(1, 4)).join(',');
      updatePerson.run(known, p.nconst);
    });
  });
  updatePeople();

  console.log(`[seed] Inserted: ${people.length} people, ${movies.length} titles, ${ratings.length} ratings, ${principals.length} principals, ${akas.length} akas, ${episodes.length} episodes`);
}

module.exports = { seed };
