import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useProjects } from "../../context/ProjectsContext";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from 'react-toastify';

const ProjectDetails = () => {
  const { user, api } = useAuth();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { refetchTasks } = useProjects();
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    done: []
  });
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);

  const isAdmin = user?.role === "admin" || user?.role === "lead";

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      // Fetch project details
      const { data: projectData } = await api.get(`/projects/${projectId}`);
      setProject(projectData.data);
      
      // Fetch tasks for this project
      const { data: tasksData } = await api.get(`/tasks?projectId=${projectId}`);
      
      // Organize tasks by status
      const organizedTasks = {
        todo: tasksData.data.filter(task => task.status === 'todo'),
        inProgress: tasksData.data.filter(task => task.status === 'inProgress'),
        done: tasksData.data.filter(task => task.status === 'done')
      };
      
      setTasks(organizedTasks);
    } catch (error) {
      console.error("Error fetching project details:", error);
      toast.error("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
      
      // Set up polling for real-time updates
      const intervalId = setInterval(fetchProjectDetails, 15000); // Refresh every 15 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [projectId]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    // If dropped in the same column and same position
    if (source.droppableId === destination.droppableId && 
        source.index === destination.index) {
      return;
    }
    
    try {
      const newStatus = destination.droppableId;
      
      // Optimistic UI update
      const sourceTasks = [...tasks[source.droppableId]];
      const [removed] = sourceTasks.splice(source.index, 1);
      const newTasks = {
        ...tasks,
        [source.droppableId]: sourceTasks
      };
      
      // Add to destination column
      const destinationTasks = [...tasks[destination.droppableId]];
      destinationTasks.splice(destination.index, 0, {
        ...removed,
        status: newStatus
      });
      
      newTasks[destination.droppableId] = destinationTasks;
      setTasks(newTasks);
      
      // Update task status in backend
      await api.patch(`/tasks/${draggableId}`, {
        status: newStatus
      });
      
      // Refresh tasks data
      await refetchTasks();
      toast.success("Task status updated successfully");
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status");
      // Revert if error occurs
      fetchProjectDetails();
    }
  };

  const getColumnTitle = (status) => {
    switch (status) {
      case 'todo': return 'To Do';
      case 'inProgress': return 'In Progress';
      case 'done': return 'Done';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate("/projects")}
          className="mb-4 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
        >
          ← Back
        </button>
        <p>Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate("/projects")}
          className="mb-4 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-red-600">Project Not Found</h2>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/projects")}
        className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
      >
        ← Back to Projects
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>
        <p className="text-gray-600 mt-2">{project.description}</p>
        <div className="flex items-center mt-4 text-sm text-gray-500">
          <span className="mr-4">Status: {project.status}</span>
          <span>Due: {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date'}</span>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(tasks).map(([status, tasksInColumn]) => (
            <div key={status} className="bg-gray-50 rounded-lg p-4">
              <h2 className="font-semibold text-lg mb-4 flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                  status === 'todo' ? 'bg-blue-500' : 
                  status === 'inProgress' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></span>
                {getColumnTitle(status)} ({tasksInColumn.length})
              </h2>
              
              <Droppable droppableId={status}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="min-h-[100px]"
                  >
                    {tasksInColumn.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-3 rounded shadow mb-3 hover:shadow-md transition-shadow"
                          >
                            <h3 className="font-medium">{task.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                              <span>#{task.id}</span>
                              {task.dueDate && (
                                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {isAdmin && (
        <div className="mt-6">
          <button
            onClick={() => navigate(`/projects/${projectId}/tasks/new`)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            + Add New Task
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;