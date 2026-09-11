import type { Chapter, SubjectId, Topic } from '@/types';

export interface ChapterSeed {
  titleEn: string;
  titleHi: string;
  topics: { en: string; hi: string }[];
}

export function buildSubjectSyllabus(subjectId: SubjectId, seeds: ChapterSeed[]) {
  const chapters: Chapter[] = [];
  const topics: Topic[] = [];

  seeds.forEach((seed, chapterIndex) => {
    const chapterId = `${subjectId}-ch${chapterIndex + 1}`;
    const topicIds: string[] = [];

    seed.topics.forEach((t, topicIndex) => {
      const topicId = `${chapterId}-t${topicIndex + 1}`;
      topicIds.push(topicId);
      topics.push({
        id: topicId,
        subjectId,
        chapterId,
        title: { en: t.en, hi: t.hi },
        description: {
          en: `Core concepts, formulas and practice questions on ${t.en}.`,
          hi: `${t.hi} से जुड़े मुख्य सिद्धांत, सूत्र और अभ्यास प्रश्न।`
        },
        order: topicIndex + 1
      });
    });

    chapters.push({
      id: chapterId,
      subjectId,
      title: { en: seed.titleEn, hi: seed.titleHi },
      order: chapterIndex + 1,
      topicIds
    });
  });

  return { chapters, topics };
}
