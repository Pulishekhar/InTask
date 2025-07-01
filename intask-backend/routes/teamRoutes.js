const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam
} = require("../controllers/teamController");

router.use(protect);
router.get("/", getTeams);
router.post("/", createTeam);
router.put("/:id", updateTeam);
router.delete("/:id", deleteTeam);

module.exports = router;
