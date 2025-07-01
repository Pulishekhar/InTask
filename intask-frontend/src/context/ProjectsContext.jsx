import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const ProjectsContext = createContext();
export const useProjects = () => useContext(ProjectsContext);

export const ProjectsProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState({ todo: [], inProgress: [], done: [] });
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(false);
  const { user, token, isAppReady, logout } = useAuth();

  const api = useCallback(() => {
    return axios.create({
      baseURL: 'http://localhost:5000/api',
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined
      }
    });
  }, [token]);

  const handleApiError = (error, defaultMessage) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return false;
    }
    toast.error(error.response?.data?.error || defaultMessage);
    return false;
  };

  const fetchProjects = useCallback(async () => {
    if (!token || !isAppReady) return;

    setLoading(true);
    try {
      const res = await api().get('/projects');
      setProjects(res.data.data);
    } catch (err) {
      handleApiError(err, 'Failed to fetch projects');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, isAppReady, api]);

  const fetchTasks = useCallback(async () => {
  if (!token || !isAppReady) return;

  setLoading(true);
  try {
    const res = await api().get('/tasks');
    const grouped = { todo: [], inProgress: [], done: [] };

    const taskArray = res.data.data || []; // ✅ Access res.data.data
    taskArray.forEach(task => {
      grouped[task.status]?.push(task);
    });

    setTasks(grouped);
  } catch (err) {
    handleApiError(err, 'Failed to fetch tasks');
    throw err;
  } finally {
    setLoading(false);
  }
}, [token, isAppReady, api]);

  const fetchComments = useCallback(async (taskId) => {
    if (!token || !isAppReady) return;

    try {
      const res = await api().get(`/tasks/${taskId}/comments`);
      setComments(prev => ({ ...prev, [taskId]: res.data }));
    } catch (err) {
      handleApiError(err, 'Failed to fetch comments');
      throw err;
    }
  }, [token, isAppReady, api]);

 const createProject = useCallback(async (projectData) => {
  try {
    if (user?.role !== 'lead') {
      throw new Error('Only team leads can create projects');
    }

    if (!user.teamId) {
      throw new Error('Your account is not assigned to a team');
    }

    const res = await api().post('/projects', {
      ...projectData,
      teamId: user.teamId
    });

    const newProject = res.data.data;

    setProjects(prev => Array.isArray(prev) ? [...prev, newProject] : [newProject]);

    toast.success('Project created successfully!');
    return newProject;
  } catch (err) {
    const errorDetails = {
      message: err.response?.data?.error || err.message,
      validation: err.response?.data?.validation,
      userTeamId: user?.teamId,
      requestedTeamId: projectData.teamId
    };

    console.error('Project creation failed:', errorDetails);
    toast.error(errorDetails.message || 'Failed to create project');
    throw err;
  }
}, [user?.role, user?.teamId, api]);

  const addComment = useCallback(async (taskId, content) => {
    try {
      const res = await api().post(`/tasks/${taskId}/comments`, { content });
      setComments(prev => ({
        ...prev,
        [taskId]: [...(prev[taskId] || []), res.data]
      }));
      toast.success('Comment added!');
    } catch (err) {
      handleApiError(err, 'Failed to add comment');
      throw err;
    }
  }, [api]);

  const updateTaskStatus = useCallback(async (taskId, newStatus) => {
    try {
      await api().patch(`/tasks/${taskId}/status`, { status: newStatus });
      await fetchTasks();
      toast.success('Task status updated!');
    } catch (err) {
      handleApiError(err, 'Failed to update task');
      throw err;
    }
  }, [api, fetchTasks]);

  useEffect(() => {
    if (!isAppReady || !token || !user) return;

    const initializeData = async () => {
      try {
        await Promise.all([fetchProjects(), fetchTasks()]);
      } catch (error) {}
    };

    initializeData();
  }, [token, user, isAppReady, fetchProjects, fetchTasks]);

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        tasks,
        comments,
        loading,
        createProject,
        updateTaskStatus,
        addComment,
        fetchComments,
        refetchProjects: fetchProjects,
        refetchTasks: fetchTasks
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
};
