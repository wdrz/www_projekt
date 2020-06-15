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
}

export interface AnswerToOne {
    questionId: number;
    answer: number;
    timeSpent: number;
}

/*
export interface Result {
    id: string;
    quizId: number;
    userId: number;
    points: number;
    stringStats : string;
}

*/