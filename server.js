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

db.select("*").from("users").then(data => {
  console.log(data);
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

const database = {
  users: [
    {
      id: "123",
      name: "ciberciv",
      password: "secret",
      email: "ciberciv@ciber.com",
      entries: 0,
      joined: new Date()
    },
    {
      id: "124",
      name: "vicrebic",
      password: "secrettoo",
      email: "vicrebic@ciber.com",
      entries: 0,
      joined: new Date()
    }
  ],
  login: [
    {
      id: "987",
      hash: "",
      email: "ciberciv@ciber.com"
    }
  ]
}

app.get("/", (req, res) => {
  res.send(database.users);
})

app.post("/signin", (req, res) => {
  if (req.body.email === database.users[0].email && req.body.password === database.users[0].password){
    res.json(database.users[0]);
  } else {
    res.status(400).json("error logging");
  }
})

app.post("/register", (req, res) => {
  const {email, name, password} = req.body;

  db("users")
    .returning("*")
    .insert({
    email: email,
    name: name,
    joined: new Date()
  }).then(user => {
    res.json(user[0]);
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
