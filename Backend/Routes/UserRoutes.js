const express = require("express");
const router = express.Router();

const User = require("../Models/UserModel");

const UserController = require("../Controllers/UserController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/",UserController.addUsers);
router.get("/",UserController.getAllUsers);
// Current logged in user - must be defined BEFORE any dynamic ":id" routes
router.get("/me", authMiddleware(), async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select("-password");
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user: currentUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error while fetching current user" });
  }
});
router.get("/:id", UserController.getById);
router.put("/:id", UserController.updateUser);
// Delete policy: only customers can delete themselves; others cannot delete
router.delete("/:id", authMiddleware(), async (req, res, next) => {
  try {
    const requesterId = req.user && req.user.id;
    const requesterRole = req.user && req.user.role;
    const targetId = req.params.id;

    if (requesterRole === 'customer' && requesterId === targetId) {
      return UserController.deleteUser(req, res, next);
    }

    return res.status(403).json({ message: "Only customers can delete their own account" });
  } catch (err) {
    return res.status(500).json({ message: "Server error while deleting user" });
  }
});
router.post("/login", UserController.loginUser);

module.exports = router;