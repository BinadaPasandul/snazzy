const express = require("express");
const router = express.Router();

const User = require("../Models/UserModel");

const UserController = require("../Controllers/UserController");
const authMiddleware = require("../Middleware/authMiddleware");
router.post("/forgot-password", UserController.forgotPassword);
router.post("/reset-password/:token", UserController.resetPassword);


router.post("/",UserController.addUsers);
router.get("/", authMiddleware('admin'), UserController.getAllUsers);

router.get("/me", authMiddleware(), UserController.getCurrentUser);


router.post("/login", UserController.loginUser);


router.get("/:id", UserController.getById);

router.put("/:id", authMiddleware(), UserController.updateUserWithAuth);

router.delete("/:id", authMiddleware(), UserController.deleteUserWithAuth);



module.exports = router;