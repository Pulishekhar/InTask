exports.assignTeam = async (req, res) => {
  try {
    const userId = req.params.id;
    const { teamId } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (teamId) {
      const team = await Team.findByPk(teamId);
      if (!team) return res.status(404).json({ error: 'Team not found' });
      
      // Check if current user is the creator of the team
      if (team.creatorId !== req.user.id) {
        return res.status(403).json({ error: 'Only team creator can assign members' });
      }
    }

    user.teamId = teamId || null;
    await user.save();

    res.status(200).json({ message: 'Team assignment updated', user });
  } catch (err) {
    console.error('❌ assignTeam error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};