# Final project - course: WWW Applications
Witold Drzewakowski, April-June 2020

## Description
1. A web application allows logged-in users to solve quizes (each user can solve each quiz only once)
Users can log in, log out and change their password (after changing user's password all sessions of this user are logged out)
2. Application displays statistics in two places: after solving a quiz, a button "Solve" at the front page will be replaced by button "Details" which redirects to a subpage where stats of every question can be viewed: time spent on solving each question, user's answer and in case it is wrong - a correct answer. Users that scored top 5 are presented in a table at the bottom of a page. The average time of correctly soving each question will also be displayed. At the front page there is a link to more general statistics.
3. Every user can create a new quiz. After clicking a big plus frame a form is rendered. A client-side script allows to adjust the number of questions - the appropriate number of text fields will be displayed. Data is validated against containing empty fields and nonnumeric values client-side and then is send to server, where after reformatting is inserted into database. Two tables are changed: table "quiz" which contains quiz title and introduction and table "questions" which contains question statements, the numeric answers, penalties, and some keys. All inserts happen in one transaction. Database will not accept a quiz or a question that has an empty field. In case of failure approriate message is render at the bottom of the form. All new quizes contain at least one question, which is checked server-side and client-side.

## Installation
To create a database and compile client-side js, run this seqence of commands
```
npm run createdb

npm run compile
```

Run the first command only once. Two user accounts will be set up:
```
user1/user1 
```
and 
```
user2/user2
```

## Usage
To start server run the following script
```
npm run start
```
App runs on port 3000.

## Tests
```
npm run test
```