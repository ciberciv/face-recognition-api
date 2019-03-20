const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cors = require("cors");
const knex = require("knex");
const dbcredentials = require("./dbcredentials");

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : dbcredentials.user,
    password : "test",
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

app.listen(3000, () => {
})
