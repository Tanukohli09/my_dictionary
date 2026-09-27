import { WordEntry } from '../models/WordEntry';
import { firstLetter, normalizeWord, titleCaseWord } from '../utils/normalizeWord';

type OfflineSeed = {
  partOfSpeech: string;
  meaning: string;
  example: string;
  synonyms?: string[];
};

const OFFLINE_WORDS: Record<string, OfflineSeed> = {
  abandon: { partOfSpeech: 'verb', meaning: 'To leave someone or something behind.', example: 'They had to abandon the old plan.', synonyms: ['leave', 'desert'] },
  ability: { partOfSpeech: 'noun', meaning: 'The power or skill to do something.', example: 'She has the ability to learn quickly.', synonyms: ['skill', 'talent'] },
  accurate: { partOfSpeech: 'adjective', meaning: 'Correct and free from error.', example: 'The map was accurate.', synonyms: ['correct', 'exact'] },
  animal: { partOfSpeech: 'noun', meaning: 'A living organism that can move and respond to its surroundings.', example: 'The fox is a wild animal.' },
  beautiful: { partOfSpeech: 'adjective', meaning: 'Pleasing to the senses or mind.', example: 'The garden is beautiful.' },
  benevolent: { partOfSpeech: 'adjective', meaning: 'Kind, generous, and helpful.', example: 'A benevolent teacher helped the class.', synonyms: ['kind', 'generous'] },
  brilliant: { partOfSpeech: 'adjective', meaning: 'Very clever, talented, or impressive.', example: 'It was a brilliant idea.', synonyms: ['clever', 'bright'] },
  book: { partOfSpeech: 'noun', meaning: 'A set of written or printed pages bound together.', example: 'I borrowed a book from the library.' },
  computer: { partOfSpeech: 'noun', meaning: 'An electronic machine that stores and processes data.', example: 'The computer saved the document.' },
  create: { partOfSpeech: 'verb', meaning: 'To make something new.', example: 'The team will create a new design.' },
  curious: { partOfSpeech: 'adjective', meaning: 'Eager to know or learn something.', example: 'The curious child asked many questions.', synonyms: ['interested', 'inquiring'] },
  courage: { partOfSpeech: 'noun', meaning: 'The ability to face fear or difficulty.', example: 'It took courage to try again.' },
  dictionary: { partOfSpeech: 'noun', meaning: 'A reference work that lists words and explains their meanings.', example: 'She checked the word in a dictionary.' },
  discover: { partOfSpeech: 'verb', meaning: 'To find something unexpectedly or for the first time.', example: 'They discovered a quiet path through the woods.' },
  ephemeral: { partOfSpeech: 'adjective', meaning: 'Existing or lasting for a very short time.', example: 'The beauty of the sunset was ephemeral.' },
  example: { partOfSpeech: 'noun', meaning: 'A thing that shows or illustrates a general rule.', example: 'This sentence is an example of clear writing.' },
  fish: { partOfSpeech: 'noun', meaning: 'A cold-blooded animal that lives in water and breathes through gills.', example: 'Salmon is a fish.' },
  focus: { partOfSpeech: 'noun', meaning: 'The center of attention or activity.', example: 'Her focus stayed on the lesson.' },
  friend: { partOfSpeech: 'noun', meaning: 'A person with whom one has a close, trusting relationship.', example: 'My friend helped me study.' },
  happy: { partOfSpeech: 'adjective', meaning: 'Feeling or showing pleasure or contentment.', example: 'The good news made everyone happy.' },
  hello: { partOfSpeech: 'interjection', meaning: 'A greeting used when meeting or addressing someone.', example: 'She smiled and said hello.' },
  hope: { partOfSpeech: 'noun', meaning: 'A feeling of expectation and desire for something to happen.', example: 'There is hope for a better result.' },
  journey: { partOfSpeech: 'noun', meaning: 'An act of traveling from one place to another.', example: 'The journey took three days.' },
  kind: { partOfSpeech: 'adjective', meaning: 'Friendly, considerate, and helpful.', example: 'It was kind of you to help.' },
  knowledge: { partOfSpeech: 'noun', meaning: 'Information and understanding gained through learning or experience.', example: 'Reading builds knowledge.' },
  learn: { partOfSpeech: 'verb', meaning: 'To gain knowledge or skill through study or experience.', example: 'Children learn through practice.' },
  resilient: { partOfSpeech: 'adjective', meaning: 'Able to recover quickly after difficulty.', example: 'She remained resilient after many failures.', synonyms: ['strong', 'tough', 'flexible'] },
  search: { partOfSpeech: 'verb', meaning: 'To look carefully for something.', example: 'We search the room for the missing key.' },
  strong: { partOfSpeech: 'adjective', meaning: 'Having power or physical strength.', example: 'The strong bridge held firm.' },
  success: { partOfSpeech: 'noun', meaning: 'The achievement of a desired result.', example: 'Her success came from steady practice.' },
  water: { partOfSpeech: 'noun', meaning: 'A clear liquid that forms rain, rivers, and seas.', example: 'Plants need water to grow.' },
  word: { partOfSpeech: 'noun', meaning: 'A single unit of language that has meaning.', example: 'The sentence begins with a short word.' },
  world: { partOfSpeech: 'noun', meaning: 'The earth and all its people and places.', example: 'People around the world use language.' },
};

export function getOfflineWordEntry(input: string): WordEntry | null {
  const normalized = normalizeWord(input);
  const seed = OFFLINE_WORDS[normalized];
  if (!seed) return null;

  const now = new Date().toISOString();
  const definition = {
    partOfSpeech: seed.partOfSpeech,
    definition: seed.meaning,
    example: seed.example,
    synonyms: seed.synonyms || [],
    antonyms: [],
  };

  return {
    id: `offline-${normalized.replace(/\s+/g, '-')}-${Date.now()}`,
    word: titleCaseWord(normalized),
    normalized_word: normalized,
    first_letter: firstLetter(normalized),
    phonetic: null,
    audio_url: null,
    part_of_speech: seed.partOfSpeech,
    meaning_short: seed.meaning,
    definitions: [definition],
    example: seed.example,
    examples: [seed.example],
    synonyms: seed.synonyms || [],
    antonyms: [],
    my_meaning: null,
    personal_note: null,
    is_favorite: false,
    search_count: 1,
    reviewed_count: 0,
    correct_count: 0,
    mastery_level: 0,
    source: 'offline-local',
    created_at: now,
    updated_at: now,
    last_searched_at: now,
  };
}
