import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useProjects } from "../../context/ProjectsContext";
import { useAuth } from "../../context/AuthContext";
import TaskCard from "../../components/TaskCard";
import ProjectForm from "../../components/ProjectForm";

const Projects = () => {
  const { tasks, updateTaskStatus, loading, projects } = useProjects();
  const { user } = useAuth();
  const [showProjectForm, setShowProjectForm] = useState(false);

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceStatus = source.droppableId;
    const destinationStatus = destination.droppableId;

    if (sourceStatus !== destinationStatus) {
      const taskId = tasks[sourceStatus][source.index]._id;
      updateTaskStatus(taskId, destinationStatus);
    }
  };

  const getColTitle = (key) => {
    const titles = {
      todo: "To Do",
      inProgress: "In Progress",
      done: "Done"
    };
    return titles[key] || "";
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Project Board</h2>
        {user?.role === 'lead' && (
          <button
            onClick={() => setShowProjectForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Create Project
          </button>
        )}
      </div>

      {showProjectForm && (
        <ProjectForm onClose={() => setShowProjectForm(false)} />
      )}

      {projects.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">📁 Projects</h3>
          <ul className="list-disc pl-5 text-gray-600 space-y-1">
            {projects.map((project) => (
              <li key={project.id}>
                <span className="font-medium text-gray-800">{project.name || project.title}</span>
                {project.status && <span className="ml-2 text-sm text-gray-500">({project.status})</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(tasks).map(([colId, columnTasks]) => (
            <Droppable key={colId} droppableId={colId}>
              {(provided) => (
                <div
                  className="bg-white rounded-xl shadow-md p-4 min-h-[300px]"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <h3 className="text-lg font-semibold mb-4 text-indigo-600">
                    {getColTitle(colId)} ({columnTasks.length})
                  </h3>

                  <div className="space-y-3">
                    {columnTasks.map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                        isDragDisabled={!['admin', 'lead'].includes(user?.role)}
                      >
                        {(provided) => (
                          <TaskCard 
                            task={task} 
                            provided={provided} 
                            userRole={user?.role} 
                          />
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Projects;
