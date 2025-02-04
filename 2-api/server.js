const express = require("express");
const app = express();
const { Pool } = require("pg");

const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Database Project");
});

const db = new Pool({
  user: "saharkarimi", // replace with you username
  host: "localhost",
  database: "cyf_ecommerce",
  password: process.env.USER_PASS,
  port: 5432,
});

app.get("/customers", function (req, res) {
  db.query("SELECT * FROM customers", (error, result) => {
    res.json(result.rows);
  });
});

app.get("/customers/:id", function (req, res) {
  const custId = parseInt(req.params.id);
  db.query(
    "SELECT * FROM customers WHERE id = $1",
    [custId],
    function (err, result) {
      if (err) {
        console.error(err);
        res.status(500).send("Error retrieving customer from database");
      } else {
        res.json(result.rows[0]);
        console.log(result.rows[0]);
      }
    }
  );
});

app.post("/customers", function (req, res) {
  const newName = req.body.name;
  const nweAddress = req.body.address;
  const newCity = req.body.city;
  const newCountry = req.body.country;

  if (!newName || !nweAddress || !newCity || !newCountry) {
    return res.status(400).send("Missing required field(s).");
  }

  const query =
    "INSERT INTO customers (name, address, city, country) " +
    "VALUES ($1, $2, $3, $4) returning id";

  db.query(query, [newName, nweAddress, newCity, newCountry], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error creating customer.");
    }
    const newID = result.rows[0].id;
    res.send(`New customer added. New Id = ${newID}`);
  });
});

app.get("/products", function (req, res) {
  const productName = req.query.name;
  console.log(productName);

  db.query(
    "SELECT * FROM products WHERE product_name LIKE CONCAT('%', $1::text, '%')",
    [productName],
    (error, result) => {
      if (error) {
        console.error(error);
        res.status(500).send("Error retrieving products from database");
      } else {
        res.json(result.rows);
      }
    }
  );
});

app.listen(5000, function () {
  console.log("Server is listening on port 5000. Ready to accept requests!");
});