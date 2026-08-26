/**
 * MovieMind Curated Fallback Catalogue
 * Ensures instant, reliable rendering on Vercel and offline environments.
 */

export const FALLBACK_CATALOGUE = {
  hero: [
    {
      movieId: 'hero_bahubali2',
      title: 'Baahubali 2: The Conclusion',
      year: '2017',
      rating: 8.2,
      genres: ['Action', 'Drama', 'Epic'],
      language: 'Telugu',
      languageCode: 'te',
      director: 'S.S. Rajamouli',
      cast: [{ name: 'Prabhas' }, { name: 'Rana Daggubati' }, { name: 'Anushka Shetty' }],
      overview: 'Amarendra Baahubali learns about his royal heritage and must confront his jealous cousin Bhallaladeva to reclaim the kingdom of Mahishmati.',
      poster: 'https://image.tmdb.org/t/p/w500/pas2v04aCi3a83j142b93.jpg',
      backdrop: '/hero/bahubali2-hero.png',
      trailer: 'https://www.youtube.com/watch?v=qD-6d8Wo3do'
    },
    {
      movieId: 'hero_kalki',
      title: 'Kalki 2898 AD',
      year: '2024',
      rating: 7.8,
      genres: ['Action', 'Sci-Fi', 'Fantasy'],
      language: 'Telugu',
      languageCode: 'te',
      director: 'Nag Ashwin',
      cast: [{ name: 'Prabhas' }, { name: 'Amitabh Bachchan' }, { name: 'Kamal Haasan' }, { name: 'Deepika Padukone' }],
      overview: 'In a dystopian post-apocalyptic future, a modern avatar of Vishnu descends to Earth to protect humanity from dark forces.',
      poster: 'https://image.tmdb.org/t/p/w500/uIFU1d4j2x52b66k.jpg',
      backdrop: 'https://image.tmdb.org/t/p/original/r4q8h66.jpg',
      trailer: 'https://www.youtube.com/watch?v=kQDd1AhGIHk'
    },
    {
      movieId: 'hero_rrr',
      title: 'RRR',
      year: '2022',
      rating: 7.9,
      genres: ['Action', 'Drama', 'Epic'],
      language: 'Telugu',
      languageCode: 'te',
      director: 'S.S. Rajamouli',
      cast: [{ name: 'N.T. Rama Rao Jr.' }, { name: 'Ram Charan' }, { name: 'Alia Bhatt' }],
      overview: 'A fearless revolutionary and an officer in the British force meet and forge an unbreakable bond before fighting for India’s freedom.',
      poster: 'https://image.tmdb.org/t/p/w500/wE0bvjh6k.jpg',
      backdrop: '/hero/bahubali1-hero.png',
      trailer: 'https://www.youtube.com/watch?v=NgBoTscV1oI'
    },
    {
      movieId: 'hero_pushpa1',
      title: 'Pushpa: The Rise',
      year: '2021',
      rating: 7.6,
      genres: ['Action', 'Crime', 'Drama'],
      language: 'Telugu',
      languageCode: 'te',
      director: 'Sukumar',
      cast: [{ name: 'Allu Arjun' }, { name: 'Rashmika Mandanna' }, { name: 'Fahadh Faasil' }],
      overview: 'A laborer rises through the ranks of a red sandalwood smuggling syndicate, making dangerous enemies along the way.',
      poster: 'https://image.tmdb.org/t/p/w500/x56k77b.jpg',
      backdrop: '/hero/pushpa1-hero.png',
      trailer: 'https://www.youtube.com/watch?v=pKctlefJj0U'
    }
  ],

  trending: [
    {
      movieId: 'm_kalki',
      title: 'Kalki 2898 AD',
      year: '2024',
      rating: 7.8,
      genres: ['Action', 'Sci-Fi', 'Fantasy'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg'
    },
    {
      movieId: 'm_salaar',
      title: 'Salaar: Part 1 – Ceasefire',
      year: '2023',
      rating: 7.2,
      genres: ['Action', 'Crime', 'Drama'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/mCwo7r6r4n6e0j8G8Vp7x4.jpg'
    },
    {
      movieId: 'm_rrr',
      title: 'RRR',
      year: '2022',
      rating: 7.9,
      genres: ['Action', 'Drama'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/nEufeZlyAOLqO2brrs0ye9qioo.jpg'
    },
    {
      movieId: 'm_pushpa2',
      title: 'Pushpa 2: The Rule',
      year: '2024',
      rating: 7.9,
      genres: ['Action', 'Crime'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/m2aP9r3k52v.jpg'
    },
    {
      movieId: 'm_hinanna',
      title: 'Hi Nanna',
      year: '2023',
      rating: 8.3,
      genres: ['Romance', 'Drama', 'Family'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/sita12345.jpg'
    },
    {
      movieId: 'm_sitaramam',
      title: 'Sita Ramam',
      year: '2022',
      rating: 8.6,
      genres: ['Romance', 'Drama', 'Mystery'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/z0Gz9k2.jpg'
    },
    {
      movieId: 'm_animal',
      title: 'Animal',
      year: '2023',
      rating: 6.9,
      genres: ['Action', 'Crime', 'Drama'],
      language: 'Hindi',
      poster: 'https://image.tmdb.org/t/p/w500/hr9rj.jpg'
    },
    {
      movieId: 'm_interstellar',
      title: 'Interstellar',
      year: '2014',
      rating: 8.7,
      genres: ['Sci-Fi', 'Adventure', 'Drama'],
      language: 'English',
      poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'
    }
  ],

  top_rated: [
    {
      movieId: 'm_sitaramam',
      title: 'Sita Ramam',
      year: '2022',
      rating: 8.6,
      genres: ['Romance', 'Drama'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/z0Gz9k2.jpg'
    },
    {
      movieId: 'm_interstellar',
      title: 'Interstellar',
      year: '2014',
      rating: 8.7,
      genres: ['Sci-Fi', 'Adventure'],
      language: 'English',
      poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'
    },
    {
      movieId: 'm_tdk',
      title: 'The Dark Knight',
      year: '2008',
      rating: 9.0,
      genres: ['Action', 'Crime', 'Drama'],
      language: 'English',
      poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'
    },
    {
      movieId: 'm_jersey',
      title: 'Jersey',
      year: '2019',
      rating: 8.5,
      genres: ['Drama', 'Sport'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/jersey.jpg'
    },
    {
      movieId: 'm_mahanati',
      title: 'Mahanati',
      year: '2018',
      rating: 8.5,
      genres: ['Biography', 'Drama'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/mahanati.jpg'
    },
    {
      movieId: 'm_inception',
      title: 'Inception',
      year: '2010',
      rating: 8.8,
      genres: ['Sci-Fi', 'Action'],
      language: 'English',
      poster: 'https://image.tmdb.org/t/p/w500/oYuLEW92o1BFiacDeMtIGvP244.jpg'
    }
  ],

  blockbusters: [
    {
      movieId: 'm_bahubali2',
      title: 'Baahubali 2: The Conclusion',
      year: '2017',
      rating: 8.2,
      genres: ['Action', 'Epic'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/pas2v04aCi3a83j142b93.jpg'
    },
    {
      movieId: 'm_kgf2',
      title: 'K.G.F: Chapter 2',
      year: '2022',
      rating: 8.3,
      genres: ['Action', 'Crime'],
      language: 'Kannada',
      poster: 'https://image.tmdb.org/t/p/w500/kgf2.jpg'
    },
    {
      movieId: 'm_rrr',
      title: 'RRR',
      year: '2022',
      rating: 7.9,
      genres: ['Action', 'Drama'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/nEufeZlyAOLqO2brrs0ye9qioo.jpg'
    },
    {
      movieId: 'm_avatar2',
      title: 'Avatar: The Way of Water',
      year: '2022',
      rating: 7.7,
      genres: ['Sci-Fi', 'Adventure'],
      language: 'English',
      poster: 'https://image.tmdb.org/t/p/w500/t6HIqrRA8jOYdPf2Yy8YmyCevaY.jpg'
    }
  ],

  action: [
    {
      movieId: 'm_salaar',
      title: 'Salaar: Part 1 – Ceasefire',
      year: '2023',
      rating: 7.2,
      genres: ['Action', 'Crime'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/mCwo7r6r4n6e0j8G8Vp7x4.jpg'
    },
    {
      movieId: 'm_vikram',
      title: 'Vikram',
      year: '2022',
      rating: 8.3,
      genres: ['Action', 'Thriller'],
      language: 'Tamil',
      poster: 'https://image.tmdb.org/t/p/w500/vikram.jpg'
    },
    {
      movieId: 'm_tdk',
      title: 'The Dark Knight',
      year: '2008',
      rating: 9.0,
      genres: ['Action', 'Crime'],
      language: 'English',
      poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'
    }
  ],

  romance: [
    {
      movieId: 'm_sitaramam',
      title: 'Sita Ramam',
      year: '2022',
      rating: 8.6,
      genres: ['Romance', 'Drama'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/z0Gz9k2.jpg'
    },
    {
      movieId: 'm_hinanna',
      title: 'Hi Nanna',
      year: '2023',
      rating: 8.3,
      genres: ['Romance', 'Family'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/sita12345.jpg'
    },
    {
      movieId: 'm_shyamsingharoy',
      title: 'Shyam Singha Roy',
      year: '2021',
      rating: 7.7,
      genres: ['Romance', 'Fantasy'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/ssr.jpg'
    }
  ],

  drama: [
    {
      movieId: 'm_jersey',
      title: 'Jersey',
      year: '2019',
      rating: 8.5,
      genres: ['Drama', 'Sport'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/jersey.jpg'
    },
    {
      movieId: 'm_mahanati',
      title: 'Mahanati',
      year: '2018',
      rating: 8.5,
      genres: ['Biography', 'Drama'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/mahanati.jpg'
    }
  ],

  comedy: [
    {
      movieId: 'm_jathiratnalu',
      title: 'Jathi Ratnalu',
      year: '2021',
      rating: 7.4,
      genres: ['Comedy'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/jathi.jpg'
    },
    {
      movieId: 'm_mathuvadalara',
      title: 'Mathu Vadalara',
      year: '2019',
      rating: 8.2,
      genres: ['Comedy', 'Thriller'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/mathu.jpg'
    }
  ],

  family: [
    {
      movieId: 'm_hinanna',
      title: 'Hi Nanna',
      year: '2023',
      rating: 8.3,
      genres: ['Family', 'Romance'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/sita12345.jpg'
    },
    {
      movieId: 'm_sitaramam',
      title: 'Sita Ramam',
      year: '2022',
      rating: 8.6,
      genres: ['Romance', 'Family'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/z0Gz9k2.jpg'
    }
  ],

  award_winning: [
    {
      movieId: 'm_rrr',
      title: 'RRR',
      year: '2022',
      rating: 7.9,
      genres: ['Action', 'Award Winning'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/nEufeZlyAOLqO2brrs0ye9qioo.jpg'
    },
    {
      movieId: 'm_oppenheimer',
      title: 'Oppenheimer',
      year: '2023',
      rating: 8.9,
      genres: ['Biography', 'Drama'],
      language: 'English',
      poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg'
    }
  ],

  hidden_gems: [
    {
      movieId: 'm_mathuvadalara',
      title: 'Mathu Vadalara',
      year: '2019',
      rating: 8.2,
      genres: ['Comedy', 'Mystery'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/mathu.jpg'
    },
    {
      movieId: 'm_kancharapalem',
      title: 'C/o Kancharapalem',
      year: '2018',
      rating: 8.9,
      genres: ['Drama', 'Romance'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/kanchara.jpg'
    }
  ],

  recommended: [
    {
      movieId: 'm_kalki',
      title: 'Kalki 2898 AD',
      year: '2024',
      rating: 7.8,
      genres: ['Action', 'Sci-Fi'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg'
    },
    {
      movieId: 'm_salaar',
      title: 'Salaar: Part 1 – Ceasefire',
      year: '2023',
      rating: 7.2,
      genres: ['Action', 'Crime'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/mCwo7r6r4n6e0j8G8Vp7x4.jpg'
    },
    {
      movieId: 'm_sitaramam',
      title: 'Sita Ramam',
      year: '2022',
      rating: 8.6,
      genres: ['Romance', 'Drama'],
      language: 'Telugu',
      poster: 'https://image.tmdb.org/t/p/w500/z0Gz9k2.jpg'
    },
    {
      movieId: 'm_interstellar',
      title: 'Interstellar',
      year: '2014',
      rating: 8.7,
      genres: ['Sci-Fi', 'Adventure'],
      language: 'English',
      poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'
    }
  ]
};
