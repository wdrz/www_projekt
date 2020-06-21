import express from "express";
import path from "path";
import session from 'express-session';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import { QuizList } from "./quizList";
import sqlite from "sqlite3";
import { attachDB, loginCheck, loginWall, UserHandler } from "./login";
import { AnswerToOne, Result, Question, Quiz } from './definitions'

// tslint:disable-next-line: no-var-requires
const SQLiteStore = require('connect-sqlite3')(session);


const secretkey = "a@3aFANp38ah"

const sessionStore = new SQLiteStore();

const db = new sqlite.Database('dataStorage.db');
const ql = new QuizList(db);
const uh = new UserHandler(db);

async function run() : Promise<void> {
  const app = express();
  const port = 3000;

  app.set("view engine", "pug");

  app.use(express.urlencoded({ extended: true }))
  app.use(express.json());

  const csrfProtection = csurf({cookie: true});
  app.use(cookieParser(secretkey));

  app.use(session({
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    secret: secretkey,
    cookie: { maxAge: 15 * 60 * 1000 } // session length: 15 min
  }));

  app.use('/static', express.static('public'));

  app.post("/login", csrfProtection, attachDB(loginCheck, db));
  app.post("*", (req, res, next) => {
    if (!req.session.login) {
      res.status(404);
      res.send("404");
    } else {
      next();
    }
  });
  app.get("*", csrfProtection, loginWall);

  app.get("/logout", (req, res) => {
    req.session.login = undefined;
    req.session.user_id = undefined;
    res.redirect("/");
  });

  app.get("/change", (req, res) => {
    res.render('changePassword', {user: req.session.login, csrfToken: req.csrfToken()});
  });

  app.post("/change", csrfProtection, (req, res) => {
    uh.changePassword(req, res)
  });


  app.get('/logoutall', (req, res) => {
    console.log(sessionStore.db);
    sessionStore.db.all(`SELECT * FROM sessions;`, (err : Error, rows : any[]) => {
      if (err) {
        console.log(err);
        res.status(400);
        res.send("400");
        return;
      }
      const login: string = req.session.login;
      rows.forEach((row) => {
        if (JSON.parse(row.sess).login === login) {
          sessionStore.destroy(row.sid);
        }
      });
      req.session.login = undefined;
      req.session.user_id = undefined;
      res.redirect("/");
    });
  });

  app.get("/", async (req, res) => {
    res.sendFile(path.resolve('html', 'frontPage.html'));
  });

  app.get("/quizlist", async (req, res) => {
    res.json(JSON.stringify({
      login: req.session.login,
      quizes: await ql.get_quizes(req.session.user_id)
    }));
  });


  app.get("/quiz/:p1(\\w+)/json", async (req, res) => {
    const quizId = Number(req.params.p1);
    ql.getResult(quizId, req.session.user_id).then(() => {
      res.status(403);
      res.send("403");
    }).catch(async () => {
      const questions = await ql.getQuestionsByQuizId(quizId, false);
      const quiz = await ql.getQuizById(quizId);
      req.session.timeQuizStarted = Date.now();
      res.json(JSON.stringify({questions, quiz, login: req.session.login}));
    }).catch(() => {
      res.status(404);
      res.send("404");
    });
  });


  app.get("/quiz/:p1(\\w+)", async (req, res) => {
    const quizId = Number(req.params.p1);
    ql.getResult(quizId, req.session.user_id).then(
      async (row: Result) => {
        res.render('stats', {
          user: req.session.login,
          quiz: await ql.getQuizById(quizId),
          questions: await ql.getAveragesByQuizId(quizId),
          stats: await ql.getAnswersByResultId(row.id),
          bestResults: await ql.getBestResultsToQuiz(quizId),
          results: row
        });
    }).catch(() => {
      ql.getQuizById(quizId).then(async _ => {
        res.sendFile(path.resolve('html', 'quizscreen.html'));
      }).catch((err) => {
        console.log(err);
        res.status(404);
        res.send(err);
      });
    });
  });

  app.get("/stats", csrfProtection, async (req, res) => {
    const quizes: Quiz[] = await ql.get_all_quiz_ids();
    const stats: Result[][] = [];
    console.log(quizes);
    for (const quiz of quizes) {
      console.log(quiz.title);
      console.log(await ql.getBestResultsToQuiz(quiz.id));
      stats.push(await ql.getBestResultsToQuiz(quiz.id));
    }
    console.log(stats);
    res.render('generalStats', {
      stats, quizes,
      user: req.session.login
    });
  });



  app.get("/addquiz", csrfProtection, async (req, res) => {
    res.render('addQuiz', {
      user: req.session.login,
      csrfToken: req.csrfToken()
    });
  });

  app.post("/addquiz", csrfProtection, async (req, res) => {
    console.log(req.body);
    const numOfQuestions: number = Number(req.body.numberOfQuestions) > 0 ? Number(req.body.numberOfQuestions) : 1;
    const quests: Question[] = new Array(numOfQuestions);

    for (let i: number = 0; i < numOfQuestions; i++) {
      quests[i] = {text: req.body[`quest${i}`], answer: req.body[`answ${i}`], penalty: req.body[`pena${i}`]};
    }

    ql.add_quizes([{title: req.body.title, intro: req.body.intro, content: quests}]).then(
      () => res.redirect("/")
    ).catch(
      (err) => {
        console.log(err);
        res.status(400);
        // res.send("400");
        res.render("addQuiz", {
          ...req.body,
          error: "Wystąpił błąd bazy danych. Popraw dane i spróbuj ponownie."
        });
      });
  });


  app.post("/quiz/:p1(\\w+)", async (req, res) => {
    console.log("RECEIVED DATA");
    ql.canBeAccessed(Number(req.params.p1), req.session.user_id).then(() => {
      console.log("RECEIVED DATA quiz " + req.params.p1);
      console.log(JSON.stringify(req.body));
      try {
        const stats = req.body as AnswerToOne[];
        ql.submit_result(stats, req.session.user_id, Number(req.params.p1),
          Date.now() - req.session.timeQuizStarted).then(() => {
            res.status(204);
            res.end();
          }).catch((err) => {
            res.status(403);
            res.send("Db query error: " + err);
          })
      } catch (err) {
        if (err instanceof TypeError) {
          res.status(400);
          res.send("Incorrect data format");
        }
      }
    }).catch((err) => {
      res.status(403);
      res.send("User is not allowed to solve this quiz.");
    });
  });

  app.use((req, res, next) => {
    res.status(404);
    res.send("404");
  });

  app.listen(port, () => {
    console.log(`server started at http://localhost:${ port }`);
  });
}

run();