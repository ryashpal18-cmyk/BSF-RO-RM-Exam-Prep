import type { Question, SubjectId } from '@/types';
import { SUBJECTS, EXAM_CONFIG } from '@/data/examConfig';
import { getTopicsBySubject } from '@/data/syllabus';
import { generateId } from './id';

// ==================== Gemini-powered AI Mock Test generator ====================
// Calls the Google Gemini API directly from the device to generate a fresh set
// of bilingual MCQs, spread across every subject/topic in the app's syllabus,
// matching the same exam pattern as the bundled Full Mock Test (100 Qs / 200 marks).

interface RawGeminiQuestion {
  questionEn?: string;
  questionHi?: string;
  optionsEn?: unknown;
  optionsHi?: unknown;
  correctIndex?: unknown;
  explanationEn?: string;
  explanationHi?: string;
  difficulty?: string;
  topicHint?: string;
}

export class GeminiMockGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiMockGenerationError';
  }
}

function buildPrompt(subjectId: SubjectId, count: number, topicTitles: string[]): string {
  const subject = SUBJECTS.find((s) => s.id === subjectId)!;
  return `You are an expert question setter for the BSF Head Constable (Radio Operator / Radio Mechanic) recruitment exam in India.

Generate exactly ${count} multiple-choice questions for the subject "${subject.title.en}" (${subject.title.hi}), at the difficulty level expected in this exam.

Spread the questions across these topics, don't over-repeat any single topic:
${topicTitles.join(', ')}

Return ONLY a raw JSON array (no markdown fences, no commentary before or after) of exactly ${count} objects. Each object must have exactly this shape:
{
  "questionEn": "question text in English",
  "questionHi": "same question translated to natural Hindi",
  "optionsEn": ["option A", "option B", "option C", "option D"],
  "optionsHi": ["option A in Hindi", "option B in Hindi", "option C in Hindi", "option D in Hindi"],
  "correctIndex": 0,
  "explanationEn": "1-2 sentence explanation in English",
  "explanationHi": "same explanation in Hindi",
  "difficulty": "easy",
  "topicHint": "the exact topic title (from the list above) this question belongs to"
}

Rules:
- correctIndex must be 0, 1, 2 or 3, pointing to the correct option.
- difficulty must be one of: "easy", "medium", "hard".
- Do not repeat the same question twice.
- Keep options plausible, distinct, and unambiguous — exactly one correct answer.
- Hindi text must be accurate, natural Hindi (not machine-transliterated English).`;
}

async function callGemini(apiKey: string, model: string, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json'
        }
      })
    });
  } catch {
    throw new GeminiMockGenerationError(
      'Could not reach Gemini API. Check your internet connection and try again.'
    );
  }

  if (!res.ok) {
    let detail = '';
    try {
      const errJson = await res.json();
      detail = errJson?.error?.message || '';
    } catch {
      // ignore
    }
    if (res.status === 400 || res.status === 403) {
      throw new GeminiMockGenerationError(
        `Gemini API key looks invalid or unauthorized (${res.status}). ${detail}`.trim()
      );
    }
    if (res.status === 429) {
      throw new GeminiMockGenerationError('Gemini API rate limit hit. Wait a bit and try again.');
    }
    throw new GeminiMockGenerationError(`Gemini API error (${res.status}). ${detail}`.trim());
  }

  const data = await res.json();
  const text: string =
    data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ??
    '';
  if (!text.trim()) {
    const finishReason = data?.candidates?.[0]?.finishReason;
    throw new GeminiMockGenerationError(
      `Gemini returned an empty response${finishReason ? ` (${finishReason})` : ''}.`
    );
  }
  return text;
}

function parseJsonArray(text: string): unknown[] {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(json)?/i, '').replace(/```$/i, '').trim();
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start === -1 || end === -1 || end < start) {
    throw new GeminiMockGenerationError('Could not find a JSON array in the Gemini response.');
  }
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    if (!Array.isArray(parsed)) throw new Error('not an array');
    return parsed;
  } catch {
    throw new GeminiMockGenerationError('Gemini response was not valid JSON.');
  }
}

function normalizeOptions(raw: unknown, fallback: string): [string, string, string, string] {
  const arr = Array.isArray(raw) ? raw.map((x) => String(x ?? '').trim()) : [];
  while (arr.length < 4) arr.push(fallback);
  return [arr[0], arr[1], arr[2], arr[3]];
}

function clampIndex(raw: unknown): 0 | 1 | 2 | 3 {
  const n = Number(raw);
  if (n === 0 || n === 1 || n === 2 || n === 3) return n;
  return 0;
}

/** Generates the required number of AI questions for a single subject. */
async function generateSubjectQuestions(
  apiKey: string,
  model: string,
  subjectId: SubjectId,
  count: number
): Promise<Question[]> {
  const topics = getTopicsBySubject(subjectId);
  if (topics.length === 0) {
    throw new GeminiMockGenerationError(`No syllabus topics found for subject "${subjectId}".`);
  }
  const topicTitles = topics.map((t) => t.title.en);
  const prompt = buildPrompt(subjectId, count, topicTitles);
  const raw = await callGemini(apiKey, model, prompt);
  const items = parseJsonArray(raw) as RawGeminiQuestion[];

  if (items.length === 0) {
    throw new GeminiMockGenerationError(`Gemini returned no questions for ${subjectId}.`);
  }

  const questions: Question[] = items.slice(0, count).map((item, idx) => {
    const topicHint = String(item.topicHint || '').trim().toLowerCase();
    const matchedTopic =
      topics.find((t) => t.title.en.trim().toLowerCase() === topicHint) ||
      topics[idx % topics.length];

    const difficulty =
      item.difficulty === 'easy' || item.difficulty === 'medium' || item.difficulty === 'hard'
        ? item.difficulty
        : 'medium';

    return {
      id: generateId(`ai-${subjectId}`),
      subjectId,
      chapterId: matchedTopic.chapterId,
      topicId: matchedTopic.id,
      questionEn: String(item.questionEn || '').trim() || 'Question text unavailable.',
      questionHi: String(item.questionHi || '').trim() || 'प्रश्न उपलब्ध नहीं है।',
      optionsEn: normalizeOptions(item.optionsEn, 'Option'),
      optionsHi: normalizeOptions(item.optionsHi, 'विकल्प'),
      correctIndex: clampIndex(item.correctIndex),
      explanationEn: String(item.explanationEn || '').trim(),
      explanationHi: String(item.explanationHi || '').trim(),
      difficulty,
      marks: EXAM_CONFIG.correctMarks,
      negativeMarks: Math.abs(EXAM_CONFIG.wrongMarks),
      isSample: false,
      aiGenerated: true
    };
  });

  return questions;
}

/**
 * Generates a full AI Mock Test: 100 questions spread across every subject
 * (Physics/Maths/Chemistry/English/GK) in the same proportion as the app's
 * official exam pattern, and across all syllabus topics within each subject.
 */
export async function generateAiMockQuestions(apiKey: string, model: string): Promise<Question[]> {
  return generateAiMockQuestionsStreaming(apiKey, model, () => {});
}

const CHUNK_SIZE = 10;

/**
 * Same as generateAiMockQuestions, but generates in small batches (10 questions
 * at a time) and invokes onBatch after each batch is ready, so the caller can
 * let the user start the test as soon as the first batch is ready while the
 * rest keep generating in the background.
 */
export async function generateAiMockQuestionsStreaming(
  apiKey: string,
  model: string,
  onBatch: (batch: Question[], totalGeneratedSoFar: number) => void | Promise<void>
): Promise<Question[]> {
  if (!apiKey.trim()) {
    throw new GeminiMockGenerationError('No Gemini API key set. Add one in Settings first.');
  }
  const resolvedModel = model.trim() || 'gemini-3.6-flash';

  const all: Question[] = [];
  for (const subject of SUBJECTS) {
    let remaining = subject.totalQuestions;
    while (remaining > 0) {
      const size = Math.min(CHUNK_SIZE, remaining);
      try {
        const batch = await generateSubjectQuestions(apiKey, resolvedModel, subject.id, size);
        all.push(...batch);
        remaining -= size;
        await onBatch(batch, all.length);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new GeminiMockGenerationError(`${subject.title.en}: ${msg}`);
      }
    }
  }

  if (all.length === 0) {
    throw new GeminiMockGenerationError('Gemini did not return any usable questions.');
  }

  return all;
}
