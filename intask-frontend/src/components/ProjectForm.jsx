import React, { useState, useEffect } from 'react';
import { useProjects } from '../context/ProjectsContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ProjectForm = ({ onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const { createProject } = useProjects();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'lead' && !user?.teamId) {
      toast.warning('⚠️ You are not assigned to any team. Contact an admin.');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (user?.role !== 'lead') {
      toast.error('Only team leads can create projects.');
      return;
    }

    if (!user?.teamId) {
      toast.error('You are not assigned to any team. Project creation disabled.');
      return;
    }

    try {
      await createProject({
        name,
        description,
        dueDate,
        teamId: user.teamId
      });
      toast.success('✅ Project created!');
      onClose();
    } catch (err) {
      console.error('❌ Project creation failed:', {
        error: err.response?.data || err.message,
        requestData: { name, description, dueDate, teamId: user.teamId }
      });
      toast.error(err.response?.data?.error || 'Failed to create project.');
    }
  };

  const isLeadWithoutTeam = user?.role === 'lead' && !user?.teamId;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isLeadWithoutTeam && (
        <p className="text-sm text-red-600">
          You are not assigned to any team. Please contact an admin to assign your team.
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Project Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          required
          disabled={isLeadWithoutTeam}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          disabled={isLeadWithoutTeam}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          disabled={isLeadWithoutTeam}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          disabled={user?.role !== 'lead' || !user?.teamId}
        >
          Create Project
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
