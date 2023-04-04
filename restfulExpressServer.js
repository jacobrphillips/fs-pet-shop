const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const app = express();

const port = 4000;


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
        console.log(singlePet)
      res.sendStatus(404);
    } else {
      res.send(singlePet);
    }
  });
});

//If the user wants all of the pets
app.get("^/$|/:endpoint", (req, res) => {
  if (req.params.endpoint === "boom" ) {
    res.sendStatus(500);
  } else if (req.params.endpoint !== "pets"){
    res.sendStatus(404);
  } else {
    res.sendFile(path.join(__dirname, "pets.json"));
  }
});

//create new pet
app.post("/pets", (req, res) => {
  let data = req.body;
  let newPet = { age: Number(data.age), kind: data.kind, name: data.name };
  const petsData = fs.readFileSync("pets.json", "utf-8");
  const petsArray = JSON.parse(petsData);

  if (isNaN(newPet.age) || !newPet.name || !newPet.kind) {
    res.sendStatus(400);
  } else {
    petsArray.push(newPet);
    fs.writeFileSync("pets.json", JSON.stringify(petsArray));
    res.send(newPet);
  }
});


//update pet info
app.patch('/pets/:id', (req, res) => {
    fs.readFile("pets.json", "utf-8", (error, data) => {
        if (error){
            console.error(error)
        } else if (typeof req.params.id === "undefined"){
            res.status(404).send('Pet not found')
        } else {   
            let pets = JSON.parse(data);
            let key = Object.keys(req.body)[0];
            let value = Object.values(req.body)[0];
            let index = req.params.id;
            pets[index][key] = value;
            fs.writeFileSync("pets.json", JSON.stringify(pets));
            res.send(pets[index]);
        }
     
      });
});

//delete pet
app.delete('/pets/:id', (req, res) => {
    fs.readFile("pets.json", "utf-8", (error, data) => {
        if (error){
            console.log(error)
        } else if (typeof req.params.id === "undefined"){
            res.status(404).send('Pet not found')
        }  else {  
            let pets = JSON.parse(data);
            let index = req.params.id;
            res.send(pets[index]);
            pets.splice(index, 1);
            fs.writeFileSync("pets.json", JSON.stringify(pets));
        }
      });
});

app.listen(port, (error) => {
  if (error) {
    console.error(error);
  } else {
    console.log(`Listening on port ${port}`);
  }
});


