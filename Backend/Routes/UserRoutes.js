const express = require("express");
const router = express.Router();

const User = require("../Models/UserModel");

const UserController = require("../Controllers/UserController");

router.post("/",UserController.addUsers);
router.get("/",UserController.getAllUsers);
router.get("/:id", UserController.getById);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);
router.post("/login", UserController.loginUser);

module.exports = router;