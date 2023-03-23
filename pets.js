let fs = require("fs");

let option = process.argv[2];

switch (option) {
  case "read":
    fs.readFile("pets.json", "utf-8", (error, data) => {
      let index = process.argv[3];

      let pets = JSON.parse(data);

      if (typeof index === "undefined") {
        console.log(pets);
      } else if (index < 0 || pets.length < index) {
        console.log("Usage: node pets.js read INDEX");
      } else {
        console.log(pets[index]);
      }
    });
    break;
  case "create":
    fs.readFile("pets.json", "utf-8", (error, data) => {
      let newAge = process.argv[3];
      let newKind = process.argv[4];
      let newName = process.argv[5];
      let pets = JSON.parse(data);

      if (typeof newName === "undefined") {
        console.log("Usage: node pets.js create AGE KIND NAME");
      } else {
        let newObj = { age: Number(newAge), kind: newKind, name: newName };
        pets.push(newObj);

        fs.writeFileSync("pets.json", JSON.stringify(pets));
        console.log(pets);
      }
    });
    break;
  case "update":
    fs.readFile("pets.json", "utf-8", (error, data) => {
      let pets = JSON.parse(data);
      let index = process.argv[3];
      let newAge = process.argv[4];
      let newKind = process.argv[5];
      let newName = process.argv[6];
      let newObj = { age: Number(newAge), kind: newKind, name: newName };
      pets[index] = newObj;

      if (typeof newName === "undefined") {
        console.log("Usage: node pets.js update INDEX AGE KIND NAME");
      } else {
        fs.writeFileSync("pets.json", JSON.stringify(pets));
        console.log(pets);
      }
    });
    break;
  case "destroy":
    fs.readFile("pets.json", "utf-8", (error, data) => {
      let pets = JSON.parse(data);
      let index = process.argv[3];

      if (typeof index === "undefined") {
        console.log("Usage: node pets.js destroy INDEX");
      } else {
        console.log(pets[index]);
        pets.splice(index, 1);

        fs.writeFileSync("pets.json", JSON.stringify(pets));
      }
    });
    break;
  default:
    console.error("Usage: node pets.js [read | create | update | destroy]");
    process.exit(1);
}
