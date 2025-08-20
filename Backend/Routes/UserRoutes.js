const express = require("express");
const router = express.Router();

const User = require("../Models/UserModel");

const UserController = require("../Controllers/UserController");

router.post("/",UserController.addUsers);

module.exports = router;