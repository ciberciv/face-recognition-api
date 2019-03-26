const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cors = require("cors");
const knex = require("knex");
const clarifai = require("clarifai");
const dbcredentials = require("./dbcredentials");
const keys =  require("./keys");

const clarifaiApp = new Clarifai.App({
 apiKey: keys.privateKey
});

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : dbcredentials.user,
    password : dbcredentials.password,
    database : 'smart-brain'
  }
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send(database.users);
})

app.post("/signin", (req, res) => {
  const {email, password} = req.body;

  if (!email || !password){
    return res.status(400).json("Incorrect form submission");
  }

  db.select("email", "hash").from("login")
    .where("email", "=", email)
    .then(data => {
      if (bcrypt.compareSync(password, data[0].hash)) {
        return db.select("*").from("users").where("email", "=", email)
          .then(user => {
            res.json(user[0]);
          })
          .catch(err => res.status(400).json("Unable to login"))
      } else {
        res.status(400).json("Wrong credentials")
      }
    })
    .catch(err => res.status(400).json("Wrong credentials"))
})

app.post("/register", (req, res) => {
  const {email, name, password} = req.body;

  if (!email || !name || !password){
    return res.status(400).json("Incorrect form submission");
  }

  const hash = bcrypt.hashSync(password, 10);

  db.transaction(trx => {
    trx.insert({
      hash: hash,
      email: email
    })
    .into("login")
    .returning("email")
    .then(successEmail => {
      return trx("users")
      .returning("*")
      .insert({
        email: successEmail[0],
        name: name,
        joined: new Date()
      })
      .then(user => {
        res.json(user[0]);
      })
    }).then(trx.commit).catch(trx.rollback)
  }).catch(err => res.status(400).json("Unable to register"));
})

app.get("/profile/:id", (req, res) => {
  const {id} = req.params;

  db.select("*").from("users").where({id}).then(user => {
    if (!user.length){
      res.status(400).json("User not found")
    } else {
      res.json(user[0])
    }
  });
})

app.put("/image", (req, res) => {
  const {id} = req.body;

  db("users").where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then(entries => {
      res.json(entries[0]);
    })
    .catch(err => res.status(400).json("Unable to get entries"))
})

app.post("/imageurl", (req, res) => {
  clarifaiApp.models.predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
    .then(data => {
      res.json(data);
    })
    .catch(err => res.stauts(404).json("Unable to use API"))
})

app.listen(3000, () => {
})
