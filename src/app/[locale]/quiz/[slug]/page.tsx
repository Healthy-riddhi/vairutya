import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getQuizBySlug } from "@/lib/quiz/cms";
import { QuizClient } from "./QuizClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const quiz = await getQuizBySlug(slug, await getLocale());
  return quiz ? { title: `${quiz.title} — Vairutya`, description: quiz.description } : {};
}

export default async function QuizPage({ params }: Props) {
  const { slug } = await params;
  const quiz = await getQuizBySlug(slug, await getLocale());
  if (!quiz) notFound();
  return <QuizClient quiz={quiz} />;
}
