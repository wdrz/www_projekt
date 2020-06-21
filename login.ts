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
    res.render("login", {csrfToken: req.csrfToken()});
  } else {
    next();
  }
};



export class UserHandler {
  db: sqlite.Database;

  constructor(db: sqlite.Database) {
    this.db = db;
  }


  changePassword (req: express.Request, res: express.Response): void {
    // res.send("changing");
    this.db.run(`BEGIN TRANSACTION`, (err) => {
      if (err) {
        console.log(err);
        res.render('changePassword', {
          user: req.session.login,
          csrfToken: req.csrfToken(),
          error: "Database error"
        });
        return;
      }

      check_credentials(this.db, req.session.login, req.body.password).then(() => {
          this.db.run(`
            UPDATE users
            SET password = ?
            WHERE username = ?;`, [crypto.SHA256(req.body.newpassword).toString(crypto.enc.Base64), req.session.login], (err2) => {
              this.db.run(`END TRANSACTION`);
              if (err2) {
                console.log(err2);
                res.render('changePassword', {
                  user: req.session.login,
                  csrfToken: req.csrfToken(),
                  error: "Database error"
                });
              } else {
                // OK!

                res.redirect("/logoutall");
              }
            });
        }
      ).catch(() => {
        this.db.run(`END TRANSACTION`);
        res.render('changePassword', {
          user: req.session.login,
          csrfToken: req.csrfToken(),
          error: "Incorrect password"
        });
      });
    });
  }

}