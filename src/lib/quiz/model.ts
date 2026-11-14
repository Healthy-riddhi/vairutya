export type QuizProduct = {
  name: string;
  description: string;
  buttonLabel: string;
  link: string;
  image: string | null;
  highlighted: boolean;
};

export type QuizOutcome = {
  name: string;
  headline: string;
  emoji: string;
  color: string;
  description: string;
  tips: string;
  products: QuizProduct[];
};

/** `outcome` is the position of the outcome this answer counts toward. */
export type QuizAnswer = { text: string; outcome: number };
export type QuizQuestion = { prompt: string; answers: QuizAnswer[] };

export type QuizSection = { heading: string; body: string };

/** What to show for one winning outcome, a tie between outcomes, or "all". `key` is normalised. */
export type QuizResult = {
  key: string;
  headline: string;
  description: string;
  sections: QuizSection[];
  products: QuizProduct[];
};

export type Quiz = {
  slug: string;
  title: string;
  description: string;
  instructions: string;
  icon: string;
  resultTitle: string;
  profileTitle: string;
  balanceTitle: string;
  questions: QuizQuestion[];
  outcomes: QuizOutcome[];
  results: QuizResult[];
};

/** `winners` holds every outcome tied for the most answers (one entry unless there is a tie). */
export type QuizScore = { winner: number; winners: number[]; percents: number[] };

export function scoreQuiz(outcomeCount: number, picks: number[]): QuizScore {
  const counts: number[] = Array(outcomeCount).fill(0);
  picks.forEach((p) => {
    if (p >= 0 && p < outcomeCount) counts[p]++;
  });
  const total = counts.reduce((s, c) => s + c, 0) || 1;
  const max = Math.max(...counts);
  const winners = counts.flatMap((c, i) => (c === max ? [i] : []));
  return {
    winner: winners[0] ?? 0,
    winners,
    percents: counts.map((c) => Math.round((c / total) * 100)),
  };
}

export const matchKey = (names: string[]) =>
  names.map((n) => n.trim().toLowerCase()).filter(Boolean).sort().join("+");

/** The result for these winners: a three-way tie ("all"), the exact tie, or the first winner alone. */
export function pickResult(quiz: Quiz, score: QuizScore): QuizResult | undefined {
  const names = score.winners.map((i) => quiz.outcomes[i]?.name ?? "");
  const byKey = new Map(quiz.results.map((r) => [r.key, r]));
  const allTied = score.winners.length === quiz.outcomes.length && quiz.outcomes.length > 1;
  return (allTied ? byKey.get("all") : undefined) ?? byKey.get(matchKey(names)) ?? byKey.get(matchKey([names[0] ?? ""]));
}
