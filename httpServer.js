const fs = require("fs");

const http = require("http");

const port = process.env.PORT || 8000;

const petRegExp = /^\/pets\/(.*)$/;

const server = http.createServer((req, res) => {

  var index = req.url.slice(6);

  if (req.url === "/pets") {
    fs.readFile("pets.json", "utf-8", function (error, data) {
      if (error) {
        console.error(error);
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(data);
        res.end();
      }
    });
  } else if (petRegExp.test(req.url)) {
    let found = req.url.match(petRegExp)
    fs.readFile("pets.json", "utf-8", function (error, data) {
      var pets = JSON.parse(data);
      var individualPet = JSON.stringify(pets[Number(found[1])]);
      if (error) {
        console.error(error);
      } else if (typeof individualPet === "undefined" || Number(index) < 0) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.write("Not Found");
        res.end();
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(individualPet);
        res.end();
      }
    });
  } else if (
    req.url !== "/pets" ||
    req.url === "/" ||
    req.url !== `/pets/${index}`
  ) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.write("Not Found");
    res.end();
  }
});

server.listen(port, function () {
  console.log(`Listening on ${port}`);
});

