const mdb = require("mongodb");
const dbUrl =
  "mongodb+srv://user1:papapa@baturinsky-br54c.mongodb.net/test?retryWrites=true&w=majority";
const dbName = "test_base";

(async function () {
  const client = new mdb.MongoClient(dbUrl);

  try {
    await client.connect();
    console.log("Connected correctly to server");

    const db = client.db(dbName);
    const col = db.collection("test_collection");

    // Insert a single document
    let r = await col.insertOne({ a: 1, b: [2,3,4] });
    console.log(r.insertedCount);

    // Insert multiple documents
    r = await col.insertMany([{ a: 2 }, { a: 3 }]);
    console.log(r.insertedCount);

    const docs = await col.find({a:1}).toArray();
    console.log(docs);
  } catch (err) {
    console.log(err.stack);
  }

  // Close connection
  client.close();
})();

const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 5000;

express()
  .use(express.static(path.join(__dirname, "public")))
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/", (req, res) => res.render("pages/index"))
  .get("/db.html", (req, res) => res.render("pages/db"))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
