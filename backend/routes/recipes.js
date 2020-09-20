const express = require('express');
const multer = require('multer');

const Recipe = require('../models/recipe');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-'+ Date.now() + '.' + ext);
  }
});

router.post("", checkAuth, multer({storage: storage}).single("image"), (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const recipe = new Recipe({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId
  });
  recipe.save().then(createdRecipe => {
    res.status(201).json({
      message: 'Recipe added successfully',
      recipe: {
        ...createdRecipe,
        id: createdRecipe._id
      }
    });
  })
  .catch(error => {
    res.status(500).json({
      message: "Creating a recipe failed!"
    });
  });
});

router.put("/:id", checkAuth, multer({storage: storage}).single("image"), (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images" + req.file.filename
  }
  const recipe = new Recipe({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  });
  Recipe.updateOne({ _id: req.params.id, creator: req.userData.userId }, recipe).then(result => {
    if (result.nModified > 0) {
      res.status(200).json({ message: "Update successfull!" });
    } else {
      res.status(401).json({ message: "Not authorized!" });
    }
  })
  .catch(error => {
    res.status(500).json({
      message: "Couldn't update recipe!"
    });
  });
});

router.get("/:id", (req, res, next) => {
  Recipe.findById(req.params.id).then(recipe => {
    if(recipe) {
      res.status(200).json(recipe);
    } else {
      res.status(404).json({ message: 'Recipe not found! '});
    }
  }).catch(error => {
    res.status(500).json({
      message: "Fetching recipe failed!"
    });
  });
});

router.get("", (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const recipeQuery = Recipe.find();
  let fetchedRecipes;
  if (pageSize && currentPage) {
    recipeQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  recipeQuery
    .then(documents => {
      fetchedRecipes = documents;
      return Recipe.count();
    })
    .then(count => {
      res.status(200).json({
        message: 'Recipes fetched successfully!',
        recipes: fetchedRecipes,
        maxRecipes: count
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Fetching recipes failed!"
      });
    });
});

router.delete("/:id", checkAuth, (req, res, next) => {
  Recipe.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then(result => {
    if (result.n > 0) {
      res.status(200).json({ message: "Deletion successfull!" });
    } else {
      res.status(401).json({ message: "Not authorized!" });
    }
  })
  .catch(error => {
    res.status(500).json({
      message: "Deleting a recipe failed!"
    });
  });
});

module.exports = router;
