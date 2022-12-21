import fetch from "node-fetch";

const express = require("express");

let keyMap = new Map([]);
let count = 8888;

var app = express();
app.use(express.json());

const port = 3000;


// http://localhost:3000/api?amount=10&category=9&difficulty=easy&type=multiple
app.get("/api", function (req, res) {
  //   const queryParams = querystring.parse(req.url);
  //   const query1 = queryParams.q; // get the value of the "q" query

  let amount = req.query.amount;
  let category = req.query.category;
  let difficulty = req.query.difficulty;
  let type = req.query.type;
  let token = req.query.token;

  fetch(
    `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=${type}`
  )
    .then((response) => response.json())
    .then((data) => {
      let strippedData = stripData(data);
      res.send(strippedData);

      //   res.send(data);
    })
    .catch((error) => {
      // handle errors
      console.error(error);
      res.status(500).send({ error: "Something went wrong" });
    });
});

app.get("/api/:amount/:category/:difficulty/:type/:token", function (req, res) {
  let amount = req.params.amount;
  let category = req.params.category;
  let difficulty = req.params.difficulty;
  let type = req.params.type;
  let token = req.params.token;
  res.send("From express: " + amount + category + difficulty + type + token);
});

// http://localhost:3000/validate/
app.post("/validate", function (req, res) {
  
  let num = validateAnswers(req.body);
  res.send("Correct questions: " + num);

  // console.log(req.body);
  // res.send(req.body);

});

function stripData(jsonResult) {
  let results = jsonResult["results"];
  let correct_answer = [];

//   console.log(results);

  for (let index = 0; index < results.length; index++) {
    const element = results[index];
    let allAnswers = element["incorrect_answers"];
    allAnswers.push(element["correct_answer"]);
    let correctAnswerNoEntities = decodeHtml(element["correct_answer"]);

    correct_answer.push(correctAnswerNoEntities);
    delete element["correct_answer"];
    delete element["incorrect_answers"];
    element["all_answers"] = allAnswers;
    element["quiz_key"] = count;
  }

  keyMap[count] = correct_answer;

  console.log("Correct Answers: " + correct_answer);
  console.log("Quiz Key: " + count);
  count++;


  return results;
}

function validateAnswers(data) {
  console.log("here");
  console.log(keyMap);

  const allanswers = data["answers"];
  let questionsCorrect = 0;
  let answerKeys = keyMap[data["quiz_key"]];

  for (let index = 0; index < allanswers.length; index++) {
    const element = allanswers[index];

    if (answerKeys.includes(element)) {
      console.log("✅ String is contained in Array");
      questionsCorrect++;
    } else {
      console.log("⛔️ String is NOT contained in Array");
    }
  }

  return questionsCorrect;
}

function decodeHtml(htmlString) {
  let plainText = htmlString.replace(/&[^;]+;/g, "");
  return plainText;
}

app.listen(port);