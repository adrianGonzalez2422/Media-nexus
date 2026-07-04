export interface UnifiedItem {
  id: string;
  tmdbId?: number;          // Set when item comes from the TMDB API
  rawgId?: number;          // Set when item comes from the RAWG API
  youtubeId?: string;       // Set when item comes from the YouTube API
  title: string;
  description: string;
  imageUrl: string;
  backdropUrl: string;
  type: 'movie' | 'game' | 'video';
  releaseDate?: string;
  rating: number; // e.g. 4.8 / 5
  genre: string;
  accentColor: string;
  trailerUrl: string; // YouTube embed URL
  
  // Movie specific
  duration?: string;
  director?: string;
  cast?: string[];
  
  // Game specific
  platforms?: string[]; // e.g. ['PC', 'PS5', 'Xbox Series X', 'Switch']
  metacritic?: number;
  developer?: string;
  
  // Video specific
  channel?: string;
  views?: string;
  videoDuration?: string;
}

export const mediaItems: UnifiedItem[] = [
  {
    id: 'dune-2',
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=1200&auto=format&fit=crop&q=80',
    type: 'movie',
    releaseDate: '2024',
    rating: 4.8,
    genre: 'Sci-Fi',
    duration: '2h 46m',
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Austin Butler', 'Florence Pugh'],
    accentColor: 'var(--color-scifi)',
    trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w'
  },
  {
    id: 'spider-man-sv',
    title: 'Spider-Man: Across the Spider-Verse',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
    imageUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80',
    type: 'movie',
    releaseDate: '2023',
    rating: 4.9,
    genre: 'Action',
    duration: '2h 20m',
    director: 'Joaquim Dos Santos',
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Jake Johnson', 'Issa Rae'],
    accentColor: 'var(--color-action)',
    trailerUrl: 'https://www.youtube.com/embed/shW9i6k8cB0'
  },
  {
    id: 'oppenheimer',
    title: 'Oppenheimer',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, showing how one man\'s brilliant mind changed the course of history forever at the cost of immense moral burden.',
    imageUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=1200&auto=format&fit=crop&q=80',
    type: 'movie',
    releaseDate: '2023',
    rating: 4.7,
    genre: 'Drama',
    duration: '3h 00m',
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh'],
    accentColor: 'var(--color-drama)',
    trailerUrl: 'https://www.youtube.com/embed/uYPbbksJxIg'
  },
  {
    id: 'the-batman',
    title: 'The Batman',
    description: 'Batman ventures into Gotham City\'s underworld when a sadistic killer leaves behind a trail of cryptic clues. As the evidence begins to lead closer to home and the scale of the perpetrator\'s plans becomes clear, he must forge new relationships.',
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=1200&auto=format&fit=crop&q=80',
    type: 'movie',
    releaseDate: '2022',
    rating: 4.5,
    genre: 'Mystery',
    duration: '2h 56m',
    director: 'Matt Reeves',
    cast: ['Robert Pattinson', 'Zoë Kravitz', 'Paul Dano', 'Jeffrey Wright', 'Colin Farrell'],
    accentColor: 'var(--color-drama)',
    trailerUrl: 'https://www.youtube.com/embed/mqqft2x_Aa4'
  },
  {
    id: 'elden-ring',
    title: 'Elden Ring: Shadow of the Erdtree',
    description: 'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between. Traverse a vast, seamless open-world and conquer legendary foes.',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=1200&auto=format&fit=crop&q=80',
    type: 'game',
    releaseDate: '2024',
    rating: 4.9,
    genre: 'RPG',
    platforms: ['PC', 'PS5', 'Xbox Series X'],
    metacritic: 96,
    developer: 'FromSoftware',
    accentColor: 'var(--color-drama)',
    trailerUrl: 'https://www.youtube.com/embed/qLZenOn7WUo'
  },
  {
    id: 'cyberpunk-2077',
    title: 'Cyberpunk 2077: Phantom Liberty',
    description: 'Phantom Liberty is a new spy-thriller adventure for Cyberpunk 2077. Return as cyber-enhanced mercenary V and embark on a high-stakes mission of espionage and intrigue to save the NUSA president.',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
    type: 'game',
    releaseDate: '2023',
    rating: 4.7,
    genre: 'Sci-Fi',
    platforms: ['PC', 'PS5', 'Xbox Series X'],
    metacritic: 89,
    developer: 'CD Projekt Red',
    accentColor: 'var(--color-comedy)',
    trailerUrl: 'https://www.youtube.com/embed/pbLJLy89pM0'
  },
  {
    id: 'zelda-totk',
    title: 'The Legend of Zelda: Tears of the Kingdom',
    description: 'An epic adventure across the land and skies of Hyrule awaits in the sequel to The Legend of Zelda: Breath of the Wild. Choose your own path through the sprawling landscapes and mysterious islands floating in the skies.',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1200&auto=format&fit=crop&q=80',
    type: 'game',
    releaseDate: '2023',
    rating: 4.8,
    genre: 'Adventure',
    platforms: ['Switch'],
    metacritic: 96,
    developer: 'Nintendo',
    accentColor: 'var(--color-horror)',
    trailerUrl: 'https://www.youtube.com/embed/2SNF4M_v7wc'
  },
  {
    id: 'baldurs-gate-3',
    title: 'Baldur\'s Gate 3',
    description: 'Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival, and the lure of absolute power. Mysterious abilities are awakening within you.',
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    type: 'game',
    releaseDate: '2023',
    rating: 4.9,
    genre: 'RPG',
    platforms: ['PC', 'PS5', 'Xbox Series X'],
    metacritic: 96,
    developer: 'Larian Studios',
    accentColor: 'var(--color-action)',
    trailerUrl: 'https://www.youtube.com/embed/1T22jUttC2c'
  },
  {
    id: 'gta-6-trailer',
    title: 'Grand Theft Auto VI - Official Trailer 1',
    description: 'Grand Theft Auto VI heads to the state of Leonida, home to the neon-soaked streets of Vice City and beyond in the biggest, most immersive evolution of the Grand Theft Auto series yet.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&auto=format&fit=crop&q=80',
    type: 'video',
    releaseDate: '2023',
    rating: 4.9,
    genre: 'Action',
    channel: 'Rockstar Games',
    views: '205M views',
    videoDuration: '1:30',
    accentColor: 'var(--color-action)',
    trailerUrl: 'https://www.youtube.com/embed/QdBZY2fkU-0'
  },
  {
    id: 'elden-ring-gameplay',
    title: 'ELDEN RING Shadow of the Erdtree - Gameplay Reveal',
    description: 'Official gameplay reveal trailer for ELDEN RING Shadow of the Erdtree, introducing the Land of Shadow, new bosses, weapons, armor, and abilities.',
    imageUrl: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    type: 'video',
    releaseDate: '2024',
    rating: 4.9,
    genre: 'RPG',
    channel: 'Bandai Namco Europe',
    views: '18M views',
    videoDuration: '3:07',
    accentColor: 'var(--color-drama)',
    trailerUrl: 'https://www.youtube.com/embed/qLZenOn7WUo'
  },
  {
    id: 'last-of-us-s2',
    title: 'The Last of Us Season 2 - Announcement Trailer',
    description: 'Get a first look at the high-stakes television adaptation of the legendary PlayStation game\'s sequel. Introducing Dina, Abby, and returning stars Pedro Pascal and Bella Ramsey.',
    imageUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=1200&auto=format&fit=crop&q=80',
    type: 'video',
    releaseDate: '2024',
    rating: 4.7,
    genre: 'Drama',
    channel: 'PlayStation',
    views: '8.4M views',
    videoDuration: '2:04',
    accentColor: 'var(--color-scifi)',
    trailerUrl: 'https://www.youtube.com/embed/sS558KzFst8'
  }
];
