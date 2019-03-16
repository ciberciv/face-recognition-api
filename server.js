const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Working");
})

app.listen(3000, () => {
  console.log("app init");
})

/*
/ -> res = this is working
/signin -> POST = success/fail
/register -> POST = new user
/profile/:userId -> GET = user
/image -> PUT = user updated (photo counter)
*/
