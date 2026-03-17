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

const REAL_NAMES = [
  'Leonardo DiCaprio', 'Brad Pitt', 'Tom Cruise', 'Meryl Streep', 'Tom Hanks', 'Robert De Niro', 'Al Pacino', 'Morgan Freeman', 'Denzel Washington', 'Harrison Ford',
  'Natalie Portman', 'Scarlett Johansson', 'Jennifer Lawrence', 'Angelina Jolie', 'Emma Stone', 'Julia Roberts', 'Charlize Theron', 'Cate Blanchett', 'Anne Hathaway', 'Nicole Kidman',
  'Christopher Nolan', 'Steven Spielberg', 'Martin Scorsese', 'Quentin Tarantino', 'James Cameron', 'Peter Jackson', 'Ridley Scott', 'David Fincher', 'Denis Villeneuve', 'Alfonso Cuarón',
  'Cillian Murphy', 'Robert Downey Jr.', 'Chris Evans', 'Chris Hemsworth', 'Mark Ruffalo', 'Jeremy Renner', 'Paul Rudd', 'Brie Larson', 'Chadwick Boseman', 'Tom Holland',
  'Zendaya', 'Florence Pugh', 'Timothée Chalamet', 'Margot Robbie', 'Ryan Gosling', 'Christian Bale', 'Heath Ledger', 'Joaquin Phoenix', 'Daniel Day-Lewis', 'Gary Oldman',
  'Samuel L. Jackson', 'Bruce Willis', 'Keanu Reeves', 'Matt Damon', 'Will Smith', 'Johnny Depp', 'Dwayne Johnson', 'Vin Diesel', 'Jason Statham', 'Daniel Craig',
  'Greta Gerwig', 'Jordan Peele', 'Bong Joon-ho', 'Guillermo del Toro', 'Edgar Wright', 'Taika Waititi', 'Wes Anderson', 'Paul Thomas Anderson', 'Gareth Edwards', 'Matt Reeves',
  'Adam Sandler', 'Jim Carrey', 'Will Ferrell', 'Steve Carell', 'Jack Black', 'Kevin Hart', 'Seth Rogen', 'Jonah Hill', 'Paul Rudd', 'Jason Bateman',
  'Sandra Bullock', 'Melissa McCarthy', 'Kristen Wiig', 'Amy Poehler', 'Tina Fey', 'Rebel Wilson', 'Anna Kendrick', 'Aubrey Plaza', 'Kathryn Hahn', 'Maya Rudolph'
];

const REAL_MOVIES = [
  'The Dark Knight', 'Inception', 'Interstellar', 'The Matrix', 'Gladiator', 'The Godfather', 'Pulp Fiction', 'Forrest Gump', 'Fight Club', 'The Lord of the Rings: The Fellowship of the Ring',
  'The Lord of the Rings: The Return of the King', 'The Lord of the Rings: The Two Towers', 'Star Wars: Episode IV - A New Hope', 'Star Wars: Episode V - The Empire Strikes Back', 'Star Wars: Episode VI - Return of the Jedi',
  'The Shawshank Redemption', 'Schindler\'s List', 'Goodfellas', 'Se7en', 'The Silence of the Lambs', 'The Usual Suspects', 'Saving Private Ryan', 'The Green Mile', 'The Departed', 'The Prestige',
  'Whiplash', 'Mad Max: Fury Road', 'Parasite', 'Avengers: Endgame', 'Spider-Man: Into the Spider-Verse', 'Joker', 'The Batman', 'Dune', 'Top Gun: Maverick', 'Avatar', 'Avatar: The Way of Water',
  'Titanic', 'Jurassic Park', 'The Lion King', 'The Avengers', 'Black Panther', 'Iron Man', 'Captain America: The Winter Soldier', 'Guardians of the Galaxy', 'Thor: Ragnarok', 'The Terminator', 'Terminator 2: Judgment Day',
  'Alien', 'Aliens', 'Blade Runner', 'Blade Runner 2049', 'The Shining', 'A Clockwork Orange', '2001: A Space Odyssey', 'Taxi Driver', 'Raging Bull', 'Casino', 'Good Will Hunting', 'Dead Poets Society',
  'The Truman Show', 'Eternal Sunshine of the Spotless Mind', 'The Grand Budapest Hotel', 'No Country for Old Men', 'There Will Be Blood', 'The Social Network', 'Gone Girl', 'Zodiac', 'The Girl with the Dragon Tattoo',
  'Prisoners', 'Sicario', 'Arrival', 'Dune: Part Two', 'Oppenheimer', 'Barbie', 'Everything Everywhere All at Once', 'Spider-Man: Across the Spider-Verse', 'Mission: Impossible - Fallout', 'Mission: Impossible - Dead Reckoning Part One',
  'John Wick', 'John Wick: Chapter 2', 'John Wick: Chapter 3 - Parabellum', 'John Wick: Chapter 4', 'Logan', 'Deadpool', 'Deadpool 2', 'X-Men: Days of Future Past', 'X-Men: First Class', 'Spider-Man 2',
  'Batman Begins', 'The Dark Knight Rises', 'Transformers', 'Pirates of the Caribbean: The Curse of the Black Pearl', 'Harry Potter and the Sorcerer\'s Stone', 'Harry Potter and the Deathly Hallows: Part 2',
  'The Hunger Games', 'Catching Fire', 'Twilight', 'The Hobbit: An Unexpected Journey', 'Indiana Jones and the Raiders of the Lost Ark', 'Indiana Jones and the Last Crusade', 'Back to the Future', 'Ghostbusters', 'E.T. the Extra-Terrestrial',
  'A Nightmare on Elm Street', 'Halloween', 'The Exorcist', 'The Texas Chain Saw Massacre', 'Get Out', 'Hereditary', 'Midsommar', 'A Quiet Place', 'It', 'The Conjuring',
  'Toy Story', 'Finding Nemo', 'Up', 'Inside Out', 'Coco', 'The Incredibles', 'Monsters, Inc.', 'Ratatouille', 'WALL-E', 'Shrek'
];

const REAL_TV_SHOWS = [
  'Breaking Bad', 'Game of Thrones', 'The Wire', 'The Sopranos', 'Band of Brothers', 'Chernobyl', 'Succession', 'Mad Men', 'True Detective', 'Fargo',
  'Better Call Saul', 'Stranger Things', 'The Crown', 'Black Mirror', 'Narcos', 'Peaky Blinders', 'Mindhunter', 'Dark', 'The Office', 'Parks and Recreation',
  'Seinfeld', 'Friends', 'The Simpsons', 'South Park', 'Rick and Morty', 'BoJack Horseman', 'Avatar: The Last Airbender', 'Attack on Titan', 'Death Note', 'Fullmetal Alchemist: Brotherhood',
  'The Mandalorian', 'The Last of Us', 'House of the Dragon', 'Severance', 'Ted Lasso', 'The Bear', 'Barry', 'Atlanta', 'Fleabag', 'Mr. Robot',
  'The Boys', 'Invincible', 'Arcane', 'Cyberpunk: Edgerunners', 'Castlevania', 'The Witcher', 'Brat', 'Daredevil', 'The Punisher', 'Loki'
];

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

function generatePeople(count) {
  const people = [];
  const PROFESSIONS = ['actor', 'actress', 'director', 'writer', 'producer', 'cinematographer', 'composer'];
  
  for (let i = 1; i <= count; i++) {
    const nconst = padId('nm', i);
    let name = REAL_NAMES[i - 1];
    if (!name) {
       name = `${pick(REAL_NAMES).split(' ')[0]} ${pick(REAL_NAMES).split(' ').pop()}`;
    }
    const birthYear = rand(1940, 2005);
    const deathYear = Math.random() < 0.05 ? rand(birthYear + 40, 2023) : '\\N';
    const profs = pickN(PROFESSIONS, rand(1, 3));
    people.push({ nconst, primaryName: name, birthYear, deathYear, primaryProfession: profs.join(',') });
  }
  return people;
}

function generateMovies(count, people) {
  const directors = people.filter(p => p.primaryProfession.includes('director')).map(p => p.nconst);
  const writers = people.filter(p => p.primaryProfession.includes('writer')).map(p => p.nconst);
  const actors = people.filter(p => p.primaryProfession.includes('actor') || p.primaryProfession.includes('actress')).map(p => p.nconst);

  if (directors.length === 0) directors.push(people[0].nconst);
  if (writers.length === 0) writers.push(people[0].nconst);
  if (actors.length === 0) actors.push(people[0].nconst);

  const movies = [];
  const ratings = [];
  const crew = [];
  const principals = [];
  const akas = [];

  const allTitles = [...REAL_MOVIES, ...REAL_TV_SHOWS];
  const shuffledTitles = allTitles.sort(() => 0.5 - Math.random());

  for (let i = 1; i <= count; i++) {
    const tconst = padId('tt', i);
    const genreList = pickN(GENRES, rand(1, 3));
    
    let primaryTitle = shuffledTitles[i - 1];
    let titleType = 'movie';

    if (primaryTitle) {
      if (REAL_TV_SHOWS.includes(primaryTitle)) {
        titleType = 'tvSeries';
      }
    } else {
      primaryTitle = `${pick(REAL_MOVIES)}: Part ${rand(2, 5)}`;
      titleType = pick(TITLE_TYPES);
    }
    
    const startYear = rand(1970, 2024);
    const endYear = titleType === 'tvSeries' ? (Math.random() < 0.6 ? startYear + rand(1, 10) : '\\N') : '\\N';
    const runtime = titleType === 'short' ? rand(5, 30) : (titleType === 'tvSeries' ? rand(20, 60) : rand(80, 200));
    const isAdult = 0;

    const budget = rand(10, 250) * 1_000_000;
    const revenueFactor = randFloat(0.5, 10.0, 2);
    const revenue = Math.random() < 0.1 ? 0 : Math.round(budget * revenueFactor);
    const popularity = randFloat(10, 1000, 2);

    movies.push({
      tconst, titleType, primaryTitle,
      originalTitle: primaryTitle,
      isAdult, startYear, endYear,
      runtimeMinutes: runtime,
      genres: genreList.join(','),
      budget, revenue, popularity,
    });

    const avgRating = randFloat(6.0, 9.8, 1);
    const numVotes = rand(10_000, 3_000_000);
    ratings.push({ tconst, averageRating: avgRating, numVotes });

    const movieDirectors = pickN(directors, rand(1, 2));
    const movieWriters = pickN(writers, rand(1, 3));
    crew.push({ tconst, directors: movieDirectors.join(','), writers: movieWriters.join(',') });

    const castMembers = pickN(actors, rand(4, 10));
    const CATEGORIES = ['actor', 'actress', 'director', 'writer', 'producer', 'cinematographer', 'composer', 'editor'];
    castMembers.forEach((nconst, ordering) => {
      const category = ordering === 0 ? (Math.random() < 0.5 ? 'actor' : 'actress') : pick(CATEGORIES);
      const job = ['actor', 'actress'].includes(category) ? '\\N' : `${category}`;
      const character = ['actor', 'actress'].includes(category) ? `["Character_${rand(1, 99)}"]` : '\\N';
      principals.push({ tconst, ordering: ordering + 1, nconst, category, job, characters: character });
    });

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

  const tvSeries = movies.filter(m => m.titleType === 'tvSeries');
  const episodes = [];
  tvSeries.forEach(series => {
    const seasonCount = rand(1, 8);
    for (let s = 1; s <= seasonCount; s++) {
      const epCount = rand(6, 24);
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
  const PEOPLE_COUNT = 100;
  const MOVIE_COUNT = 160;

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
