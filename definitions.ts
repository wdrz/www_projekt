export interface Question {
  text: string;
  answer: number;
  penalty: number;
  id?: number;
}

export interface Quiz {
  id: number;
  title: string;
  intro: string;
  content?: Question[];
  points?: number;
}

export interface AnswerToOne {
  questionId: number;
  answer: number;
  timeSpent: number;
  ok?: boolean;
  correctAnswer?: number;
}

export interface Result {
  id: string;
  quiz_id: number;
  user_id: number;
  points: number;
  answers : string;
}

