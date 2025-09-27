const express = require("express");
const router = express.Router();

const User = require("../Models/UserModel");

const UserController = require("../Controllers/UserController");
const authMiddleware = require("../Middleware/authMiddleware");
router.post("/forgot-password", UserController.forgotPassword);
router.post("/reset-password/:token", UserController.resetPassword);


router.post("/",UserController.addUsers);
router.get("/", authMiddleware('admin'), UserController.getAllUsers);
// Current logged in user - must be defined BEFORE any dynamic ":id" routes
router.get("/me", authMiddleware(), UserController.getCurrentUser);
// Specific routes must come before parameterized routes
router.get("/report", authMiddleware('admin'), UserController.getUserReport);
router.post("/login", UserController.loginUser);

// Parameterized routes come after specific routes
router.get("/:id", UserController.getById);
// Allow admins to update any user; non-admins can only update themselves
router.put("/:id", authMiddleware(), UserController.updateUserWithAuth);
// Delete policy: only customers can delete themselves; others cannot delete
router.delete("/:id", authMiddleware(), UserController.deleteUserWithAuth);

router.get("/export/pdf", authMiddleware('admin'), UserController.exportUsersPdf);

module.exports = router;