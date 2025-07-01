import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Teams = () => {
  const { user, api, isAdmin } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTeam, setNewTeam] = useState("");

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await api.get("/teams");
      setTeams(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeam.trim()) {
      toast.warning("Please enter a team name");
      return;
    }

    try {
      await api.post("/teams", { name: newTeam });
      toast.success("Team created successfully");
      setNewTeam("");
      fetchTeams();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create team");
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;
    try {
      await api.delete(`/teams/${teamId}`);
      toast.success("Team deleted successfully");
      fetchTeams();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete team");
    }
  };

  const handleAssignTeam = async (userId, teamId) => {
    try {
      await api.patch(`/users/${userId}/team`, { teamId });
      toast.success("Team assignment updated");
      fetchTeams();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update team assignment");
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchTeams();
    }
  }, [isAdmin]);

  if (!user || !isAdmin) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg inline-block">
          You are not authorized to view teams.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Team Management</h1>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-3">Create New Team</h2>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded px-3 py-2"
            value={newTeam}
            onChange={(e) => setNewTeam(e.target.value)}
            placeholder="Enter team name"
          />
          <button
            onClick={handleCreateTeam}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Team
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading teams...</div>
      ) : (
        <div className="space-y-6">
          {teams.map((team) => (
            <div key={team.id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">{team.name}</h3>
                  <p className="text-sm text-gray-500">
                    ID: {team.id} | Created by: {team.creator?.name || 'Unknown'}
                  </p>
                </div>
                {team.creatorId === user.id && (
                  <button
                    onClick={() => handleDeleteTeam(team.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>

              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Members:</h4>
                {team.members?.length > 0 ? (
                  <ul className="space-y-2">
                    {team.members.map((member) => (
                      <li
                        key={member.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <span>
                          {member.name} ({member.role})
                        </span>
                        {team.creatorId === user.id && (
                          <select
                            value={member.teamId || ""}
                            onChange={(e) =>
                              handleAssignTeam(
                                member.id,
                                e.target.value || null
                              )
                            }
                            className="border rounded px-2 py-1"
                          >
                            <option value="">Unassign</option>
                            {teams.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No members in this team</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Teams;