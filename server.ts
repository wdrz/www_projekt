import express from "express";
import session from 'express-session';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import { QuizList } from "./quizList";
import sqlite from "sqlite3";
import { attachDB, loginCheck, loginWall, UserHandler } from "./login";
import { AnswerToOne, Result } from './definitions'


const secretkey = "a@3aFANp38ah"


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
    resave: true,
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

  app.post("/change", csrfProtection, (req, res) => uh.changePassword(req, res));

  app.get("/", async (req, res) => {
    res.render('front', {
      user: req.session.login,
      quizes: await ql.get_quizes(req.session.user_id)
    });
  });

  app.get("/quiz/:p1(\\w+)", async (req, res) => {
    const quizId = Number(req.params.p1);
    ql.getResult(quizId, req.session.user_id).then(
      async (row: Result) => {
        res.render('stats', {
          user: req.session.login,
          quiz: await ql.getQuizById(quizId),
          questions: await ql.getQuestionsByQuizId(quizId, true),
          stats: await JSON.parse(row.answers),
          bestResults: await ql.getBestResultsToQuiz(quizId),
          results: row
        });
    }).catch(() => {
      ql.getQuizById(quizId).then(async (quiz) => {
        const questions = await ql.getQuestionsByQuizId(quizId, false);
        req.session.timeQuizStarted = Date.now();
        res.render('quiz', {
          quiz,
          questions: JSON.stringify(questions),
          numOfQuestions: questions.length,
          user: req.session.login,
          csrfToken: req.csrfToken()
        });
      }).catch((err) => {
        res.status(404);
        res.send("404");
      });
    });
  });


  app.get("/addquiz", async (req, res) => {
    res.render('addQuiz', {
      user: req.session.login,
      csrfToken: req.csrfToken()
    });
  });

/*

    ql.canBeAccessed(Number(req.params.p1), req.session.user_id).then(([quiz, questions]) => {
      req.session.timeQuizStarted = Date.now();
      res.render('quiz', {
        quiz,
        questions: JSON.stringify(questions),
        numOfQuestions: questions.length,
        user: req.session.login,
        csrfToken: req.csrfToken()});
      }).catch((err) => {
        res.status(404);
        res.send("404");
      });
  });*/


  app.post("/quiz/:p1(\\w+)", async (req, res) => {
    console.log("RECEIVED DATA");
    ql.canBeAccessed(Number(req.params.p1), req.session.login).then(([quiz, questions]) => {
      console.log("RECEIVED DATA quiz " + req.params.p1);
      console.log(JSON.stringify(req.body));
      try {
        const stats = req.body as AnswerToOne[];
        ql.submit_result(stats, req.session.user_id, Number(req.params.p1),
          Date.now() - req.session.timeQuizStarted).then(() => {
            res.status(204);
            res.end();
          }).catch(() => {
            res.status(403);
            console.log("tu");
            res.end();
          })
      } catch (err) {
        if (err instanceof TypeError) {
          res.status(400);
          res.end();
        }
      }
    }).catch((err) => {
      res.status(403);
      console.log("tu2");
      res.send("403");
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