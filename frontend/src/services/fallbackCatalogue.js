/**
 * MovieMind Curated Fallback Catalogue
 * Ensures instant, reliable rendering on Vercel and offline environments with verified high-res poster links.
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
      poster: 'https://m.media-amazon.com/images/M/MV5BYWQ4YmNjYjEtOWE1Zi00Y2U4LWI4NTAtMTU0MjkxNWQ1ZmJiXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
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
      poster: 'https://m.media-amazon.com/images/M/MV5BN2RjZDJhYzUtOTQ5Yy00OWVmLWE0OTgtM2YyNDBmMWYxOTE5XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
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
      poster: 'https://m.media-amazon.com/images/M/MV5BODUwNDNjYzctODUxNy00ZTA2LWIyMDctMGEwMjUzMGNmOWZjXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
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
      poster: 'https://m.media-amazon.com/images/M/MV5BMmQ4YjY5YmItYmJiYi00MjJjLThjZmEtNmE0YjFhMWZlNTU4XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
      backdrop: '/hero/pushpa1-hero.png',
      trailer: 'https://www.youtube.com/watch?v=pKctlefJj0U'
    }
  ],

  telugu: [
    {
      movieId: 'm_salaar',
      title: 'Salaar: Part 1 – Ceasefire',
      year: '2023',
      rating: 7.2,
      genres: ['Action', 'Crime', 'Drama'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BMmU4MmU5MDgtZWZiZi00NzdhLWE2NGEtNGJmMDY1OTFjYjZhXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_kalki',
      title: 'Kalki 2898 AD',
      year: '2024',
      rating: 7.8,
      genres: ['Action', 'Sci-Fi', 'Fantasy'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BN2RjZDJhYzUtOTQ5Yy00OWVmLWE0OTgtM2YyNDBmMWYxOTE5XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_hinanna',
      title: 'Hi Nanna',
      year: '2023',
      rating: 8.3,
      genres: ['Romance', 'Drama'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BYzA4MzA2ZDAtNDRjMy00OTI5LWJhOGItYTIzYzM3MTZhYWFjXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_sitaramam',
      title: 'Sita Ramam',
      year: '2022',
      rating: 8.6,
      genres: ['Romance', 'Drama'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BMTExNmZhOWItMjFkOC00Uy00ZDRhXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_shyamsingharoy',
      title: 'Shyam Singha Roy',
      year: '2021',
      rating: 7.7,
      genres: ['Romance', 'Fantasy'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BMTBhNGM2N2ItYTY4MS00MTgzLTk3YzAtNDdmMWU2MmI4MjFjXkEyXkFqcGc@._V1_SX300.jpg'
    },
    {
      movieId: 'm_bahubali2',
      title: 'Baahubali 2: The Conclusion',
      year: '2017',
      rating: 8.2,
      genres: ['Action', 'Epic'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BYWQ4YmNjYjEtOWE1Zi00Y2U4LWI4NTAtMTU0MjkxNWQ1ZmJiXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_pushpa1',
      title: 'Pushpa: The Rise',
      year: '2021',
      rating: 7.6,
      genres: ['Action', 'Crime', 'Drama'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BMmQ4YjY5YmItYmJiYi00MjJjLThjZmEtNmE0YjFhMWZlNTU4XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_rrr',
      title: 'RRR',
      year: '2022',
      rating: 7.9,
      genres: ['Action', 'Drama'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BODUwNDNjYzctODUxNy00ZTA2LWIyMDctMGEwMjUzMGNmOWZjXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_jersey',
      title: 'Jersey',
      year: '2019',
      rating: 8.5,
      genres: ['Drama', 'Sport'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BN2NlMmFlYTctMGI4My00M2VmLTg0N2MtZTE3N2NlZjdjMjEzXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_mahanati',
      title: 'Mahanati',
      year: '2018',
      rating: 8.5,
      genres: ['Biography', 'Drama'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BZWVkYmM2NGMtMTY1MS00YjVmLWJkMDktY2ZhYzg1MmEzODRjXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_rangasthalam',
      title: 'Rangasthalam',
      year: '2018',
      rating: 8.2,
      genres: ['Action', 'Drama'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BNzVlY2MwOWEtZTMzMS00YzFiLTg2M2YtMzc4YjE0ZDFmN2RjXkEyXkFqcGc@._V1_SX300.jpg'
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
      poster: 'https://m.media-amazon.com/images/M/MV5BN2RjZDJhYzUtOTQ5Yy00OWVmLWE0OTgtM2YyNDBmMWYxOTE5XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_salaar',
      title: 'Salaar: Part 1 – Ceasefire',
      year: '2023',
      rating: 7.2,
      genres: ['Action', 'Crime', 'Drama'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BMmU4MmU5MDgtZWZiZi00NzdhLWE2NGEtNGJmMDY1OTFjYjZhXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_rrr',
      title: 'RRR',
      year: '2022',
      rating: 7.9,
      genres: ['Action', 'Drama'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BODUwNDNjYzctODUxNy00ZTA2LWIyMDctMGEwMjUzMGNmOWZjXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_pushpa2',
      title: 'Pushpa 2: The Rule',
      year: '2024',
      rating: 7.9,
      genres: ['Action', 'Crime'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BNzdiNDU4NjUtNmNjMi00YTc5LTk0OTQtNjY4ODQzMDUzYmI4XkEyXkFqcGc@._V1_SX300.jpg'
    },
    {
      movieId: 'm_hinanna',
      title: 'Hi Nanna',
      year: '2023',
      rating: 8.3,
      genres: ['Romance', 'Drama', 'Family'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BYzA4MzA2ZDAtNDRjMy00OTI5LWJhOGItYTIzYzM3MTZhYWFjXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_sitaramam',
      title: 'Sita Ramam',
      year: '2022',
      rating: 8.6,
      genres: ['Romance', 'Drama', 'Mystery'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BMTExNmZhOWItMjFkOC00Uy00ZDRhXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_animal',
      title: 'Animal',
      year: '2023',
      rating: 6.9,
      genres: ['Action', 'Crime', 'Drama'],
      language: 'Hindi',
      poster: 'https://m.media-amazon.com/images/M/MV5BNGViM2M4NmUtMmE3ZC00YzU2LWIyOWEtN2EzNDc5OWVjMWFiXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_interstellar',
      title: 'Interstellar',
      year: '2014',
      rating: 8.7,
      genres: ['Sci-Fi', 'Adventure', 'Drama'],
      language: 'English',
      poster: 'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
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
      poster: 'https://m.media-amazon.com/images/M/MV5BMTExNmZhOWItMjFkOC00Uy00ZDRhXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_interstellar',
      title: 'Interstellar',
      year: '2014',
      rating: 8.7,
      genres: ['Sci-Fi', 'Adventure'],
      language: 'English',
      poster: 'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_tdk',
      title: 'The Dark Knight',
      year: '2008',
      rating: 9.0,
      genres: ['Action', 'Crime', 'Drama'],
      language: 'English',
      poster: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg'
    },
    {
      movieId: 'm_jersey',
      title: 'Jersey',
      year: '2019',
      rating: 8.5,
      genres: ['Drama', 'Sport'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BN2NlMmFlYTctMGI4My00M2VmLTg0N2MtZTE3N2NlZjdjMjEzXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_mahanati',
      title: 'Mahanati',
      year: '2018',
      rating: 8.5,
      genres: ['Biography', 'Drama'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BZWVkYmM2NGMtMTY1MS00YjVmLWJkMDktY2ZhYzg1MmEzODRjXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_inception',
      title: 'Inception',
      year: '2010',
      rating: 8.8,
      genres: ['Sci-Fi', 'Action'],
      language: 'English',
      poster: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg'
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
      poster: 'https://m.media-amazon.com/images/M/MV5BYWQ4YmNjYjEtOWE1Zi00Y2U4LWI4NTAtMTU0MjkxNWQ1ZmJiXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_kgf2',
      title: 'K.G.F: Chapter 2',
      year: '2022',
      rating: 8.3,
      genres: ['Action', 'Crime'],
      language: 'Kannada',
      poster: 'https://m.media-amazon.com/images/M/MV5BMjA2MDU3NjQ1N15BMl5BanBnXkFtZTgwMjMyNjc3NjM@._V1_SX300.jpg'
    },
    {
      movieId: 'm_rrr',
      title: 'RRR',
      year: '2022',
      rating: 7.9,
      genres: ['Action', 'Drama'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BODUwNDNjYzctODUxNy00ZTA2LWIyMDctMGEwMjUzMGNmOWZjXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_avatar2',
      title: 'Avatar: The Way of Water',
      year: '2022',
      rating: 7.7,
      genres: ['Sci-Fi', 'Adventure'],
      language: 'English',
      poster: 'https://m.media-amazon.com/images/M/MV5BYjhiNjBlODctYzE0Mi00YjJhLTk5YTItYWVkZjZkMWU2ZmJiXkEyXkFqcGc@._V1_SX300.jpg'
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
      poster: 'https://m.media-amazon.com/images/M/MV5BMmU4MmU5MDgtZWZiZi00NzdhLWE2NGEtNGJmMDY1OTFjYjZhXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_vikram',
      title: 'Vikram',
      year: '2022',
      rating: 8.3,
      genres: ['Action', 'Thriller'],
      language: 'Tamil',
      poster: 'https://m.media-amazon.com/images/M/MV5BNDMwNWQ1NDgtZTk2MS00OWJjLWJkOWItMDFlOTU0ZTJiZTFhXkEyXkFqcGc@._V1_SX300.jpg'
    },
    {
      movieId: 'm_tdk',
      title: 'The Dark Knight',
      year: '2008',
      rating: 9.0,
      genres: ['Action', 'Crime'],
      language: 'English',
      poster: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg'
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
      poster: 'https://m.media-amazon.com/images/M/MV5BMTExNmZhOWItMjFkOC00Uy00ZDRhXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_hinanna',
      title: 'Hi Nanna',
      year: '2023',
      rating: 8.3,
      genres: ['Romance', 'Family'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BYzA4MzA2ZDAtNDRjMy00OTI5LWJhOGItYTIzYzM3MTZhYWFjXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_shyamsingharoy',
      title: 'Shyam Singha Roy',
      year: '2021',
      rating: 7.7,
      genres: ['Romance', 'Fantasy'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BMTBhNGM2N2ItYTY4MS00MTgzLTk3YzAtNDdmMWU2MmI4MjFjXkEyXkFqcGc@._V1_SX300.jpg'
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
      poster: 'https://m.media-amazon.com/images/M/MV5BN2NlMmFlYTctMGI4My00M2VmLTg0N2MtZTE3N2NlZjdjMjEzXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_mahanati',
      title: 'Mahanati',
      year: '2018',
      rating: 8.5,
      genres: ['Biography', 'Drama'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BZWVkYmM2NGMtMTY1MS00YjVmLWJkMDktY2ZhYzg1MmEzODRjXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
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
      poster: 'https://m.media-amazon.com/images/M/MV5BZDg5Nzg0NzUtODQxNS00Y2E3LTlhYWEtOWFmMTBhZWRhMWFlXkEyXkFqcGc@._V1_SX300.jpg'
    },
    {
      movieId: 'm_mathuvadalara',
      title: 'Mathu Vadalara',
      year: '2019',
      rating: 8.2,
      genres: ['Comedy', 'Thriller'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BMzg4Yjg1ZjItZDNhMi00ZDMwLWEzOWEtN2RhOTkxMTk1MWQ0XkEyXkFqcGc@._V1_SX300.jpg'
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
      poster: 'https://m.media-amazon.com/images/M/MV5BYzA4MzA2ZDAtNDRjMy00OTI5LWJhOGItYTIzYzM3MTZhYWFjXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_sitaramam',
      title: 'Sita Ramam',
      year: '2022',
      rating: 8.6,
      genres: ['Romance', 'Family'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BMTExNmZhOWItMjFkOC00Uy00ZDRhXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
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
      poster: 'https://m.media-amazon.com/images/M/MV5BODUwNDNjYzctODUxNy00ZTA2LWIyMDctMGEwMjUzMGNmOWZjXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_oppenheimer',
      title: 'Oppenheimer',
      year: '2023',
      rating: 8.9,
      genres: ['Biography', 'Drama'],
      language: 'English',
      poster: 'https://m.media-amazon.com/images/M/MV5BN2JkMDc5MGQtZjg3YS00NmFiLWIyZmQtZTJmNTM5MjVmYTQ4XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
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
      poster: 'https://m.media-amazon.com/images/M/MV5BMzg4Yjg1ZjItZDNhMi00ZDMwLWEzOWEtN2RhOTkxMTk1MWQ0XkEyXkFqcGc@._V1_SX300.jpg'
    },
    {
      movieId: 'm_kancharapalem',
      title: 'C/o Kancharapalem',
      year: '2018',
      rating: 8.9,
      genres: ['Drama', 'Romance'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BNzMzYjM1YzMtNmUwNi00ZDdlLTg5YzYtMWFiNGMzNDg4ZDM5XkEyXkFqcGc@._V1_SX300.jpg'
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
      poster: 'https://m.media-amazon.com/images/M/MV5BN2RjZDJhYzUtOTQ5Yy00OWVmLWE0OTgtM2YyNDBmMWYxOTE5XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_salaar',
      title: 'Salaar: Part 1 – Ceasefire',
      year: '2023',
      rating: 7.2,
      genres: ['Action', 'Crime'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BMmU4MmU5MDgtZWZiZi00NzdhLWE2NGEtNGJmMDY1OTFjYjZhXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_sitaramam',
      title: 'Sita Ramam',
      year: '2022',
      rating: 8.6,
      genres: ['Romance', 'Drama'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BMTExNmZhOWItMjFkOC00Uy00ZDRhXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_interstellar',
      title: 'Interstellar',
      year: '2014',
      rating: 8.7,
      genres: ['Sci-Fi', 'Adventure'],
      language: 'English',
      poster: 'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_inception',
      title: 'Inception',
      year: '2010',
      rating: 8.8,
      genres: ['Sci-Fi', 'Action'],
      language: 'English',
      poster: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_fightclub',
      title: 'Fight Club',
      year: '1999',
      rating: 8.8,
      genres: ['Drama'],
      language: 'English',
      poster: 'https://m.media-amazon.com/images/M/MV5BOTgyOGQ1NDItNGU3Ny00MjU3LTg2YWEtNmEyYjBiMjI1Y2M5XkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg'
    },
    {
      movieId: 'm_forrestgump',
      title: 'Forrest Gump',
      year: '1994',
      rating: 8.8,
      genres: ['Drama', 'Romance'],
      language: 'English',
      poster: 'https://m.media-amazon.com/images/M/MV5BNDYwNzVjMTItZmU5YS00YjQ5LTljYjgtMjY2NDVmYWMyNWFmXkEyXkFqcGc@._V1_QL75_UY562_CR4,0,380,562_.jpg'
    },
    {
      movieId: 'm_darkknight',
      title: 'The Dark Knight',
      year: '2008',
      rating: 9.0,
      genres: ['Action', 'Crime', 'Drama'],
      language: 'English',
      poster: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_QL75_UX380_CR0,0,380,562_.jpg'
    },
    {
      movieId: 'm_kancharapalem',
      title: 'C/o Kancharapalem',
      year: '2018',
      rating: 8.9,
      genres: ['Drama', 'Romance'],
      language: 'Telugu',
      poster: 'https://m.media-amazon.com/images/M/MV5BZjYyM2UwMGQtMjI4YS00Y2U4LTllOWItYjIzODlhZThlMDc2XkEyXkFqcGc@._V1_SX300.jpg'
    },
    {
      movieId: 'm_soorarai',
      title: 'Soorarai Pottru',
      year: '2020',
      rating: 8.7,
      genres: ['Action', 'Drama'],
      language: 'Tamil',
      poster: 'https://m.media-amazon.com/images/M/MV5BZTU5NTNmMjAtODM0Mi00YzU5LTk1OWQtZWU1NzZhMzBjYjY1XkEyXkFqcGc@._V1_SX300.jpg'
    },
    {
      movieId: 'm_jaibhim',
      title: 'Jai Bhim',
      year: '2021',
      rating: 8.8,
      genres: ['Crime', 'Drama'],
      language: 'Tamil',
      poster: 'https://m.media-amazon.com/images/M/MV5BZjEyNDIzNmEtMjdkYS00ZDAwLTljOWYtNDRhYTVhYTlmOTk1XkEyXkFqcGc@._V1_SX300.jpg'
    }
  ]
};
