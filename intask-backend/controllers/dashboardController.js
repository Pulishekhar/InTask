const { Team, User, Project, Task } = require("../models");
const { Op } = require("sequelize");

exports.getAdminDashboard = async (req, res) => {
  try {
    // Optional: Check DB connection
    await Team.sequelize.authenticate();
    console.log("✅ DB connected");

    // Use Promise.allSettled to avoid crashing on partial DB failures
    const results = await Promise.allSettled([
      Team.count(),
      User.count({
        where: {
          role: { [Op.ne]: "admin" },
          teamId: { [Op.not]: null }
        }
      }),
      Project.count(),
      Project.count({
        where: {
          status: { [Op.in]: ["todo", "inProgress"] }
        }
      }),
      Task.count({
        where: {
          status: "done",
          projectId: { [Op.not]: null }
        }
      }),
      Project.count({
        where: {
          status: "inReview",
          teamId: { [Op.not]: null }
        }
      })
    ]);

    const [
      totalTeams,
      totalMembers,
      totalProjects,
      activeProjects,
      completedTasks,
      pendingReviews
    ] = results.map(r => (r.status === "fulfilled" ? r.value : 0));

    return res.status(200).json({
      success: true,
      data: {
        totalTeams,
        totalMembers,
        totalProjects,
        activeProjects,
        completedTasks,
        pendingReviews
      }
    });
  } catch (error) {
    console.error("❌ Admin Dashboard Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Dashboard internal error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};
