const jsonQuizData: string = `[
    {
        "id" : 1,
        "tytul": "Odejmowanie",
        "wstep": "Prosty quiz: odejmowanie liczb",
        "zawartosc": [
            {"pytanie" : "2 + 2 = ?", "odpowiedz" : 4, "kara" : 5},
            {"pytanie" : "1 + 3 = ?", "odpowiedz" : 4, "kara" : 10},
            {"pytanie" : "13 + 1 = ?", "odpowiedz" : 14, "kara" : 2}
        ]
    },
    {
        "id" : 2,
        "tytul": "Dodawanie",
        "wstep": "Prosty quiz: dodawanie liczb",
        "zawartosc": [
            {"pytanie" : "3 - 3 = ?", "odpowiedz" : 0, "kara" : 1},
            {"pytanie" : "14 - 1 = ?", "odpowiedz" : 13, "kara" : 10},
            {"pytanie" : "20 - 9 = ?", "odpowiedz" : 11, "kara" : 2},
            {"pytanie" : "3 - 2 = ?", "odpowiedz" : 1, "kara" : 1},
            {"pytanie" : "14 - 1 = ?", "odpowiedz" : 13, "kara" : 10},
            {"pytanie" : "20 - 9 = ?", "odpowiedz" : 11, "kara" : 2}
        ]
    },
    {
        "id" : 3,
        "tytul": "Mnożenie",
        "wstep": "Prosty quiz: mnożenie liczb. Musisz odpowiedzieć na wszystkie pytania!",
        "zawartosc": [
            {"pytanie" : "3 ⋅ 3 = ?", "odpowiedz" : 9, "kara" : 1},
            {"pytanie" : "14 ⋅ 1 = ?", "odpowiedz" : 14, "kara" : 10},
            {"pytanie" : "20 ⋅ 9 = ?", "odpowiedz" : 180, "kara" : 5},
            {"pytanie" : "1 ⋅ 9 = ?", "odpowiedz" : 9, "kara" : 10}
        ]
    },
    {
        "id" : 4,
        "tytul": "Mnożenie 2",
        "wstep": "Prosty quiz: mnożenie liczb. Musisz odpowiedzieć na wszystkie pytania!",
        "zawartosc": [
            {"pytanie" : "3 ⋅ 3 = ?", "odpowiedz" : 9, "kara" : 1},
            {"pytanie" : "14 ⋅ 1 = ?", "odpowiedz" : 14, "kara" : 10},
            {"pytanie" : "20 ⋅ 9 = ?", "odpowiedz" : 180, "kara" : 5},
            {"pytanie" : "1 ⋅ 9 = ?", "odpowiedz" : 9, "kara" : 10}
        ]
    },
    {
        "id" : 5,
        "tytul": "Mnożenie 3",
        "wstep": "Prosty quiz: mnożenie liczb. Musisz odpowiedzieć na wszystkie pytania!",
        "zawartosc": [
            {"pytanie" : "1 ⋅ 3 = ?", "odpowiedz" : 3, "kara" : 1},
            {"pytanie" : "14 ⋅ 1 = ?", "odpowiedz" : 14, "kara" : 10},
            {"pytanie" : "20 ⋅ 9 = ?", "odpowiedz" : 180, "kara" : 5},
            {"pytanie" : "1 ⋅ 9 = ?", "odpowiedz" : 9, "kara" : 10}
        ]
    }
]`

export interface Question {
    pytanie: string;
    odpowiedz: number;
    kara: number;
}

export interface Quiz {
    id: number;
    tytul: string;
    wstep: string;
    zawartosc: Question[];
}

export const QUIZES: Quiz[] = JSON.parse(jsonQuizData);


/// ---------------------

/*
const jsonString: string = `{
    "wstep": "Oto quiz dotyczący posiłków. Pamiętaj, że aby zakończyć musisz udzilić odpowiedzi na wszystkie pytania. Powodzenia!",
    "zawartosc": [
        {"pytanie" : "Co jadłeś na śniadanie?", "odpowiedz" : "płatki", "kara" : 10},
        {"pytanie" : "Co jadłeś na kolację?", "odpowiedz" : "owoce", "kara" : 7},
        {"pytanie" : "Co jadłeś na obiad?", "odpowiedz" : "kurczaka", "kara" : 4}
    ]
}`;



const quizz: Quiz = JSON.parse(jsonString);*/

export interface AnswerToOne {
    answer: number;
    timeSpent: number;
}

export interface Result {
    quizId : number;
    total : number;
    statistics? : AnswerToOne[];
}

