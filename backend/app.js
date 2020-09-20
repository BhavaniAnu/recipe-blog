const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const recipesRoutes = require("./routes/recipes");
const userRoutes = require("./routes/user");

const app = express();

mongoose
  .connect(
    'mongodb+srv://Natours:vERuD9UmO7zmesyc@natours-b3mil.mongodb.net/Recipe-Blog?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  }
  )
  .then(()=> {
    console.log("Database Connected!")
  })
  .catch(() => {
    console.log("Connection failed!");
  });

app.use(bodyParser.json());
app.use("/images", express.static(path.join("backend/images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/recipes/", recipesRoutes);
app.use("/api/user", userRoutes);

module.exports = app;
