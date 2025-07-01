import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, Users, CheckCircle, Clock } from "lucide-react";
import { useProjects } from "../context/ProjectsContext";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-toastify';

// 24 hours in milliseconds
const REFRESH_INTERVAL = 24 * 60 * 60 * 1000;

const Dashboard = () => {
  const { tasks, refetchTasks, refetchProjects } = useProjects();
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamProjects, setTeamProjects] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Skip fetch if data was recently updated
      if (lastUpdated && Date.now() - lastUpdated < REFRESH_INTERVAL) {
        setLoading(false);
        return;
      }

      if (user?.role === "admin") {
const { data } = await api.get("/admin/dashboard"); // ✅ correct path
        setDashboardStats(data.data);
      } else {
        const { data: projectsData } = await api.get("/projects");
        setTeamProjects(projectsData.data);

        const activeProjects = projectsData.data.filter(
          (p) => p.status === "todo" || p.status === "inProgress"
        ).length;

        const completedTasks = tasks?.done?.length || 0;

        setDashboardStats({
          activeProjects,
          completedTasks,
          pendingReviews: projectsData.data.filter((p) => p.status === "inReview").length
        });
      }

      await refetchTasks();
      await refetchProjects();
      setLastUpdated(Date.now());
    } catch (err) {
      console.error("Dashboard error:", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [user, api, tasks, refetchTasks, refetchProjects, lastUpdated]);

  useEffect(() => {
    if (!user) return;

    let intervalId;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        await fetchDashboardData();
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Fetch error:", err);
        }
      }
    };

    // Initial fetch
    fetchData();

    // Set up 24-hour polling
    intervalId = setInterval(fetchData, REFRESH_INTERVAL);

    return () => {
      clearInterval(intervalId);
      controller.abort();
    };
  }, [user, fetchDashboardData]);

  if (!user) {
    return <div className="min-h-screen bg-gray-100 p-6">Loading...</div>;
  }

  const statsConfig = [
    {
      title: "Total Teams",
      value: dashboardStats?.totalTeams || 0,
      icon: <Users className="h-8 w-8" />,
      bgColor: "bg-sky-600",
      roles: ["admin"],
      route: "/teams",
    },
    {
      title: "Team Members",
      value: dashboardStats?.totalMembers || 0,
      icon: <Users className="h-8 w-8" />,
      bgColor: "bg-emerald-600",
      roles: ["admin"],
      route: "/teams",
    },
    {
      title: "Active Projects",
      value: dashboardStats?.activeProjects || 0,
      icon: <FolderKanban className="h-8 w-8" />,
      bgColor: "bg-indigo-600",
      roles: ["admin", "lead", "member"],
      route: "/projects",
    },
    {
      title: "Completed Tasks",
      value: dashboardStats?.completedTasks || 0,
      icon: <CheckCircle className="h-8 w-8" />,
      bgColor: "bg-green-600",
      roles: ["admin", "lead", "member"],
      route: "/tasks",
    },
    {
      title: "Pending Reviews",
      value: dashboardStats?.pendingReviews || 0,
      icon: <Clock className="h-8 w-8" />,
      bgColor: "bg-yellow-500",
      roles: ["admin", "lead"],
      route: "/reviews",
    },
  ];

  const visibleStats = statsConfig.filter(stat => stat.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">
          {user.role === "admin" ? "Admin Dashboard" :
           user.role === "lead" ? "Team Lead Dashboard" : "My Dashboard"}
        </h1>
       
      </div>

      {loading ? (
        <div className="text-center py-20">
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {visibleStats.map((item, index) => (
              <div
                key={index}
                onClick={() => navigate(item.route)}
                className={`${item.bgColor} hover:brightness-110 cursor-pointer rounded-xl shadow-md p-6 transition-all duration-300`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-medium text-white">{item.title}</p>
                    <p className="text-3xl font-bold text-white mt-1">{item.value}</p>
                  </div>
                  <div className="text-white bg-white bg-opacity-20 p-3 rounded-full">
                    {item.icon}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="h-2 w-full bg-white bg-opacity-30 rounded-full">
                    <div
                      className="h-2 bg-white rounded-full"
                      style={{ width: `${Math.min(100, item.value)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Projects Section */}
          {user.role !== "admin" && teamProjects.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Team Projects</h2>
                <span className="text-sm text-gray-500">
                  {teamProjects.length} project{teamProjects.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamProjects.map(project => (
                  <div 
                    key={project.id} 
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg">{project.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        project.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : project.status === 'inReview'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                      {project.description || 'No description'}
                    </p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Due: {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date'}
                      </span>
                      {project.tasks && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {project.completedTasks || 0}/{project.totalTasks || 0} tasks
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;