import * as sqlite from 'sqlite3';
import {Quiz, Question, AnswerToOne, Result } from './definitions';

export class QuizList {

  #db: sqlite.Database;

  constructor(db: sqlite.Database) {
    this.#db = db;
  }
/*
  async query_db(): Promise<any> {
    return new Promise<void>((resolve, reject) => {


    }
  }*/

  async add_question(quest : Question, quizId: number) : Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.#db.run("INSERT INTO questions (id, text, answer, penalty, quiz_id) VALUES (?, ?, ?, ?, ?);",
        [quest.id || null, quest.text, quest.answer, quest.penalty, quizId], (err) => {
          if (err) {
            console.log(err);
            reject('DB Error: question could not be added');
          } else {
            console.log('Added question ' + quest.text);
            resolve();
          }
      });
    });
  }

  async add_quiz(quiz : Quiz) : Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.#db.run("INSERT INTO quizes (id, title, intro) VALUES (?, ?, ?);",
        [quiz.id || null, quiz.title, quiz.intro], (err) => {
          if (err) {
            console.log(err);
            reject('DB Error: quiz could not be added');
          } else {
            console.log('DB: Added quiz ' + quiz.title);
            resolve();
          }
      });
    });
  }

  async add_quizes(quizes : Quiz[]) : Promise<void> {
    for (const quiz of quizes) {
      await this.add_quiz(quiz);
      for (const quest of quiz.content) {
        await this.add_question(quest, quiz.id);
      }
    }
  }

  async get_quizes(userId: number) : Promise<Quiz[]> {
    return new Promise<Quiz[]> ((resolve, reject) => {
      this.#db.all(`
        SELECT quizes.id, intro, title, results.points AS points
        FROM quizes
        LEFT JOIN results
        ON quizes.id=results.quiz_id
        AND results.user_id=?;`, [userId], (err, rows) => {
          if (err) {
            console.log(err);
            reject('DB Error while getting quizes.');
          } else {
            console.log(rows);
            resolve(rows);
          }
        });
    });
  }

  async getQuizById(quizId: number) : Promise<Quiz> {
    return new Promise<Quiz> ((resolve, reject) => {
      this.#db.all(`
        SELECT * FROM quizes WHERE id = ?;`, [quizId], (err, rows) => {
          if (err) {
            console.log(err);
            reject('DB Error while getting a quiz by id.');
          } else if (rows.length === 0) {
            reject('No such quiz');
          } else {
            console.log(rows);
            resolve(rows[0]);
          }
        });
    });
  }

  async getQuestionsByQuizId(quizId: number, answers: boolean) : Promise<Question[]> {
    return new Promise<Question[]> ((resolve, reject) => {
      this.#db.all(`
        SELECT id, text, penalty ${answers ? ", answer " : ""}
        FROM questions
        WHERE quiz_id = ?
        ORDER BY id ASC;`, [quizId], (err, rows) => {
          if (err) {
            console.log(err);
            reject('DB Error while getting questions for a quiz.');
          } else {
            console.log(rows);
            resolve(rows);
          }
        });
    });
  }

  async hasUserNotSolvedAQuiz(quizId: number, userId: number): Promise<void> {
    return new Promise<void> ((resolve, reject) => {
      this.#db.all(`
        SELECT * FROM results WHERE user_id = ? AND quiz_id = ?;`, [userId, quizId], (err, rows) => {
          console.log("ROWS");
          console.log(rows);
          console.log(quizId, userId);
          if (err) {
            console.log(err);
            reject('DB Error hasUserNotSolvedAQuiz.');
          } else if (rows.length === 0) {
            resolve();
          } else {
            reject();
          }
        });
    });
  }

  async getResult(quizId: number, userId: number): Promise<Result> {
    return new Promise<Result> ((resolve, reject) => {
      this.#db.all(`
        SELECT * FROM results WHERE user_id = ? AND quiz_id = ?;`, [userId, quizId], (err, rows) => {
          console.log("ROWS");
          console.log(rows);
          console.log(quizId, userId);
          if (err) {
            console.log(err);
            reject('DB Error hasUserNotSolvedAQuiz.');
          } else if (rows.length === 0) {
            reject();
          } else {
            resolve(rows[0]);
          }
        });
    });
  }

  async canBeAccessed(quizId: number, userId: number): Promise<[Quiz, Question[]]> {
    return new Promise<[Quiz, Question[]]> ((resolve, reject) => {
      this.hasUserNotSolvedAQuiz(quizId, userId).then(
        () => this.getQuizById(quizId)
      ).then(
        async (quiz) => {
          resolve([quiz, await this.getQuestionsByQuizId(quizId, false)])
        }
      ).catch(
        () => reject()
      )
    });
  }

  async add_result(res: Result): Promise<void> {
    console.log('inserting a result ... ');
    console.log(res);
    return new Promise<void>((resolve, reject) => {
      this.#db.run(`
        INSERT INTO results (id, quiz_id, user_id, points, answers)
        VALUES (?, ?, ?, ?, ?);`,
        [res.id, res.quiz_id, res.user_id, res.points, res.answers], (err) => {
          if (err) {
            console.log(err);
            reject('DB Error: result could not be added');
          } else {
            console.log('DB: Added result');
            resolve();
          }
      });
    });
  }


  async submit_result(stats: AnswerToOne[], userId: number, quizId: number, serverMiliseconds: number): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const quests: Question[] = await this.getQuestionsByQuizId(quizId, true);
      if (stats.length !== quests.length) {
        console.log("wrong length of answer array");
        reject();
        return;
      }
      console.log("Questions");
      console.log(quests);
      let points: number = Math.floor(serverMiliseconds / 1000);
      let clientTime: number = 0;

      stats.forEach((stat, i) => {
        clientTime += stat.timeSpent;
        if (stat.questionId !== quests[i].id) {
          console.log("wrong id of a question");
          reject();
        }
        if (stat.answer === quests[i].answer) {
          stat.ok = true;
        } else {
          stat.ok = false;
          stat.correctAnswer = quests[i].answer;
          points += quests[i].penalty;
        }
      });

      for (const stat of stats) {
        stat.timeSpent = Math.round(stat.timeSpent * serverMiliseconds / clientTime);
      }

      const res: Result = {
        id: `${userId}&&&${quizId}`,
        quiz_id: quizId, user_id: userId, points,
        answers: JSON.stringify(stats)
      };
      this.add_result(res).then(() => resolve()).catch(() => reject());
    });
  }

  async getBestResultsToQuiz(quizId: number): Promise<Result[]> {
    return new Promise<Result[]> ((resolve, reject) => {
      this.#db.all(`
        SELECT *
        FROM results
        LEFT JOIN users
        ON results.user_id = users.id
        WHERE quiz_id = ?
        ORDER BY points ASC
        LIMIT 5;`, [quizId], (err, rows) => {
          if (err) {
            console.log(err);
            reject('DB Error getBestResultsToQuiz.');
          } else {
            resolve(rows);
          }
        });
    });
  }

/*
  async getDetails(quizId: number, userId: number): Promise<Result> {
    return new Promise<Result> ((resolve, reject) => {
      this.#db.all(`
        SELECT *
        FROM results
        WHERE user_id = ?
        AND quiz_id = ?;`, [userId, quizId], (err, rows) => {
          if (err) {
            console.log(err);
            reject('DB Error getDetails.');
          } else {
            resolve(rows[0]);
          }
        });
    });
  }*/
}