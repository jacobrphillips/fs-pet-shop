const express = require("express");
const dotenv = require('dotenv');
const pg = require('pg');
const {Client} = pg;
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const { log } = require("console");
const app = express();
const port = process.env.PORT || 4000;

dotenv.config();

const client = new Client(process.env.DATABASE_URL);
client.connect();

app.use(express.json());
app.use(bodyParser.json());


//create a PET
app.post('/pets', (req, res) => {
  const petData = req.body;
  console.log(petData);
  const insertStatement = 'INSERT INTO pets (age, name, kind) VALUES ($1, $2, $3)';
  const values = [petData.age, petData.name, petData.kind];
  client.query(insertStatement, values, (err, result) => {
       if (err) {
         console.error(err);
         res.sendStatus(500);
       } else {
          console.log('Insertion was successful');
          res.sendStatus(201);
       }
      });
  });


//patch a PET by their id
app.patch('/pets/:id', (req, res) => {
  const petId = req.params.id;
  const petData = req.body;
  const updateValues = [];
  const updateParams = [];

  Object.keys(petData).forEach(key => {
    if (key !== 'id') {
      updateValues.push(`${key} = $${updateValues.length + 1}`);
      updateParams.push(petData[key]);
    }
  });

  if (updateValues.length === 0) {
    res.status(400).send('At least one field must be updated');
    return;
  }

  updateParams.push(petId);

  const updateStatement = `UPDATE pets SET ${updateValues.join(', ')} WHERE id = $${updateParams.length}`;

  client.query(updateStatement, updateParams, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error updating pet');
    } else {
      res.send('Pet updated successfully');
    }
  });
});

//put a PET with all of the required info
app.put('/pets/:id', (req, res) => {
  const petData = req.body;
  const petId = req.params.id;

  
  if (!petData.age && !petData.name && !petData.kind) {
    return res.status(400).json({ error: 'You need to provide at least one field to update.' });
  }

  // this is to build the SQL query string to update the pet data
  const columnsToUpdate = [];
  const valuesToUpdate = [];
  let i = 1;


//the reason for this is to set each key to that of pg's positional reference parameters to protect from SQL injection
  for (const [key, value] of Object.entries(petData)) {
    columnsToUpdate.push(`${key} = $${i}`);
    valuesToUpdate.push(value);
    i++;
  }

  const updateStatement = `UPDATE pets SET ${columnsToUpdate.join(', ')} WHERE id = ${petId}`;

  client.query(updateStatement, valuesToUpdate, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error.' });
    } else {
      res.json({ message: 'Pet updated successfully.' });
    }
  });
});


//get one PET by index
app.get('/pets/:index', (req, res) => {
  if (Number(req.params.index) < 0){
    res.sendStatus(404);
  } else {
    client.query(`SELECT * FROM pets WHERE id = ${req.params.index}`, (err, result) => {
        if (err){
          console.error(err);
          res.status(500).send('Internal server error');
        } else {
          res.send(result.rows[0]);
        }
        // client.end();
    });
  }
});

//get all PETS using 
app.get("^/$|/:endpoint", (req, res)=>{

  if (req.params.endpoint !== 'pets'){
    res.sendStatus(404);
  } else {
    client.query(`SELECT * FROM pets`, (err, result) => {
      if(err){
        console.error(err);
        res.status(500).send('Internal server error');
      } else {
        res.send(result.rows);
      }
    //  client.end();
    });
  }
});

app.delete('/pets/:id', (req, res) => {
  const id = req.params.id;
  client.query(`DELETE FROM pets WHERE id=${id}`, (err, result) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
    // client.end();
  });
});

app.listen(port, (error) => {
  if (error) {
    console.error(error);
  } else {
    console.log(`Listening on port ${port}`);
  }
});


//If the user wants a specific pet @ index using EXPRESS and pets.json
// app.get("/pets/:index", (req, res) => {
//   let petsJSON = {};
//   let singlePet = {};
//   fs.readFile("pets.json", "utf-8", (error, data) => {
//     if (error) {
//       console.log(error);
//     }
//     petsJSON = JSON.parse(data);
//     singlePet = petsJSON[req.params.index];
//     if (typeof singlePet === "undefined" || req.params.index < 0) {
//         console.log(singlePet)
//       res.sendStatus(404);
//     } else {
//       res.send(singlePet);
//     }
//   });
// });

//If the user wants all of the pets using EXPRESS and pets.json
// app.get("^/$|/:endpoint", (req, res) => {
//   if (req.params.endpoint === "boom" ) {
//     res.sendStatus(500);
//   } else if (req.params.endpoint !== "pets"){
//     res.sendStatus(404);
//   } else {
//     res.sendFile(path.join(__dirname, "pets.json"));
//   }
// });


//create new pet using EXPRESS and pets.json
// app.post("/pets", (req, res) => {
//   let data = req.body;
//   let newPet = { age: Number(data.age), kind: data.kind, name: data.name };
//   const petsData = fs.readFileSync("pets.json", "utf-8");
//   const petsArray = JSON.parse(petsData);

//   if (isNaN(newPet.age) || !newPet.name || !newPet.kind) {
//     res.sendStatus(400);
//   } else {
//     petsArray.push(newPet);
//     fs.writeFileSync("pets.json", JSON.stringify(petsArray));
//     res.send(newPet);
//   }
// });


//update pet info using EXPRESS and pets.json
// app.patch('/pets/:id', (req, res) => {
//     fs.readFile("pets.json", "utf-8", (error, data) => {
//         if (error){
//             console.error(error)
//         } else if (typeof req.params.id === "undefined"){
//             res.status(404).send('Pet not found')
//         } else {   
//             let pets = JSON.parse(data);
//             let key = Object.keys(req.body)[0];
//             let value = Object.values(req.body)[0];
//             let index = req.params.id;
//             pets[index][key] = value;
//             fs.writeFileSync("pets.json", JSON.stringify(pets));
//             res.send(pets[index]);
//         }
     
//       });
// });

//delete pet using EXPRESS and pets.json
// app.delete('/pets/:id', (req, res) => {
//     fs.readFile("pets.json", "utf-8", (error, data) => {
//         if (error){
//             console.log(error)
//         } else if (typeof req.params.id === "undefined"){
//             res.status(404).send('Pet not found')
//         }  else {  
//             let pets = JSON.parse(data);
//             let index = req.params.id;
//             res.send(pets[index]);
//             pets.splice(index, 1);
//             fs.writeFileSync("pets.json", JSON.stringify(pets));
//         }
//       });
// });




