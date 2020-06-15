import crypto from 'crypto-js';
import * as sqlite from 'sqlite3';
import express from "express";


type MiddlewareDB = (req: express.Request, res: express.Response,
  next: express.NextFunction, db: sqlite.Database) => void;


export const attachDB = (functionName: MiddlewareDB, db: sqlite.Database) => (
  (req: express.Request, res: express.Response, next: express.NextFunction) => functionName(req, res, next, db)
);


async function check_credentials(db: sqlite.Database, user: string, password: string): Promise<[string, number]> {
  console.log(user + "/" + password);
  return new Promise<[string, number]>((resolve, reject) => {
    db.all(`SELECT * FROM users WHERE username = ? AND password = ?;`,
    [user, crypto.SHA256(password).toString(crypto.enc.Base64)], (err, rows) => {
      if (err) {
        console.log('DB Error check_credentials');
        reject();
      } else if (rows.length === 0) {
        console.log("Incorrect login and/or password.");
        reject();
      } else {
        resolve([rows[0].username, rows[0].id]);
      }
    });
  });
}


export const loginCheck: MiddlewareDB = (req: express.Request, res: express.Response, next: express.NextFunction, db: sqlite.Database) => {
  console.log("POST happen");
  if (req.session.login) {
    next();
  } else {
    check_credentials(db, req.body.username, req.body.password).then(([user, userId]) => {
      req.session.login = user;
      req.session.user_id = userId;
      console.log("Logged successfully.");
      res.redirect("/");
    }).catch(() => {
      res.render('login', {
        csrfToken: req.csrfToken(),
        error: "Incorrect credentials",
        username: req.body.username
      });
    });
  }
};


export const loginWall = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.login) {
    console.log("login needed");
    res.render("login", {csrfToken: req.csrfToken()});
  } else {
    console.log("sciaganie zasobu");
    next();
  }
};

export const changePassword = (req: express.Request, res: express.Response) => {
  res.send("changing");
};