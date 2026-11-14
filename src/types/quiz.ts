export type QuizQuestion = {
  question: string;
  options: string[];
};

export type DoshaType = "Vata" | "Pitta" | "Kapha";

export type DoshaInfo = {
  emoji: string;
  color: string;
  desc: string;
  tips: string;
};

export type DoshaResult = {
  type: DoshaType;
  vata: number;
  pitta: number;
  kapha: number;
};
