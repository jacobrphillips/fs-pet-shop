const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const app = express();

const port = 8000;

app.use(express.json());
app.use(bodyParser.json());

//If the user wants a specific pet @ index
app.get("/pets/:index", (req, res) => {
  let petsJSON = {};
  let singlePet = {};
  fs.readFile("pets.json", "utf-8", (error, data) => {
    if (error) {
      console.log(error);
    }
    petsJSON = JSON.parse(data);
    singlePet = petsJSON[req.params.index];
    if (typeof singlePet === "undefined" || req.params.index < 0) {
      res.sendStatus(404);
    } else {
      res.send(singlePet);
    }
  });
});

//If the user wants all of the pets
app.get("^/$|/:endpoint", (req, res) => {
  console.log(req.params.endpoint);
  if (req.params.endpoint !== "pets") {
    res.sendStatus(404);
  } else {
    res.sendFile(path.join(__dirname, "pets.json"));
  }
});

//create new pet
app.post("/pets", (req, res) => {
  let data = req.body;
  let newPet = { age: Number(data.age), kind: data.kind, name: data.name };

  if (isNaN(newPet.age) || !newPet.name || !newPet.kind) {
    res.sendStatus(400);
  } else {
    console.log(typeof newPet.name);
    res.send(newPet);
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
