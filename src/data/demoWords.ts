import { WordEntry } from '../models/WordEntry';

const now = '2025-05-12T09:41:00.000Z';

function entry(input: {
  word: string;
  phonetic?: string;
  part: string;
  meaning: string;
  example: string;
  synonyms?: string[];
  letter?: string;
  favorite?: boolean;
  createdOffset: number;
  searches?: number;
  reviewed?: number;
  correct?: number;
}): WordEntry {
  const normalized = input.word.toLowerCase();
  const date = new Date(Date.parse(now) - input.createdOffset * 24 * 60 * 60 * 1000).toISOString();
  return {
    id: `demo-${normalized}`,
    word: input.word,
    normalized_word: normalized,
    first_letter: input.letter || input.word[0]?.toUpperCase() || 'A',
    phonetic: input.phonetic || null,
    audio_url: null,
    part_of_speech: input.part,
    meaning_short: input.meaning,
    definitions: [{ partOfSpeech: input.part, definition: input.meaning, example: input.example, synonyms: input.synonyms || [] }],
    example: input.example,
    examples: [input.example],
    synonyms: input.synonyms || [],
    antonyms: [],
    my_meaning: input.word === 'Resilient' ? 'Someone who becomes strong again after problems.' : null,
    personal_note: input.word === 'Resilient' ? 'I will use this word when talking about strong people who never give up.' : null,
    is_favorite: !!input.favorite,
    search_count: input.searches || 1,
    reviewed_count: input.reviewed || 0,
    correct_count: input.correct || 0,
    mastery_level: Math.min(5, Math.floor((input.correct || 0) / 2)),
    source: 'demo',
    created_at: date,
    updated_at: date,
    last_searched_at: date,
  };
}

export const demoWords: WordEntry[] = [
  entry({ word: 'Abandon', phonetic: '/əˈbandən/', part: 'verb', meaning: 'to leave something behind', example: 'They had to abandon the old plan.', synonyms: ['leave', 'desert'], createdOffset: 20, searches: 2, reviewed: 4, correct: 3 }),
  entry({ word: 'Ability', phonetic: '/əˈbɪləti/', part: 'noun', meaning: 'power or skill', example: 'She has the ability to learn quickly.', synonyms: ['skill', 'talent'], createdOffset: 19, searches: 1, reviewed: 4, correct: 3 }),
  entry({ word: 'Accurate', phonetic: '/ˈakyərət/', part: 'adjective', meaning: 'correct and exact', example: 'The map was accurate.', synonyms: ['correct', 'exact'], createdOffset: 18, searches: 3, reviewed: 4, correct: 3 }),
  entry({ word: 'Benevolent', phonetic: '/bəˈnevələnt/', part: 'adjective', meaning: 'kind and helpful', example: 'A benevolent teacher helped the class.', synonyms: ['kind', 'generous'], createdOffset: 1, searches: 4, reviewed: 5, correct: 4 }),
  entry({ word: 'Brilliant', phonetic: '/ˈbrilyənt/', part: 'adjective', meaning: 'very clever or talented', example: 'It was a brilliant idea.', synonyms: ['clever', 'bright'], createdOffset: 10, searches: 5, reviewed: 3, correct: 2 }),
  entry({ word: 'Resilient', phonetic: '/rɪˈzɪliənt/', part: 'adjective', meaning: 'Able to recover quickly after difficulty.', example: 'She remained resilient after many failures.', synonyms: ['strong', 'tough', 'flexible'], letter: 'R', favorite: true, createdOffset: 0, searches: 5, reviewed: 3, correct: 2 }),
  entry({ word: 'Curious', phonetic: '/ˈkyʊəriəs/', part: 'adjective', meaning: 'eager to know or learn', example: 'The curious child asked many questions.', synonyms: ['interested', 'inquiring'], createdOffset: 0, searches: 2, reviewed: 2, correct: 1 }),
];
