import React, { useState } from 'react';
import { useProjects } from '../context/ProjectsContext';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

const TaskCard = ({ task, provided, userRole }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const { addComment, comments } = useProjects();
  const { user } = useAuth();

  const handleAddComment = () => {
    if (commentText.trim()) {
      addComment(task._id, commentText);
      setCommentText('');
    }
  };

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`p-3 rounded-lg border ${
        task.priority === 'High' ? 'border-red-200 bg-red-50' : 
        task.priority === 'Medium' ? 'border-yellow-200 bg-yellow-50' : 
        'border-gray-200 bg-gray-50'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{task.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${
          task.priority === 'High' ? 'bg-red-100 text-red-800' :
          task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {task.priority}
        </span>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        <div>Assigned: {task.assignedTo?.name || 'Unassigned'}</div>
        <div>Due: {new Date(task.dueDate).toLocaleDateString()}</div>
      </div>

      <div className="mt-3 border-t pt-2">
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center text-sm text-indigo-600"
        >
          <MessageSquare size={14} className="mr-1" />
          Comments ({comments[task._id]?.length || 0})
          {showComments ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showComments && (
          <div className="mt-2 space-y-2">
            {comments[task._id]?.map(comment => (
              <div key={comment._id} className="p-2 bg-gray-50 rounded text-sm">
                <div className="font-medium">{comment.author.name}</div>
                <p>{comment.content}</p>
              </div>
            ))}

            <div className="mt-2">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-2 border rounded text-sm"
                rows="2"
              />
              <button
                onClick={handleAddComment}
                className="mt-1 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
              >
                Post Comment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;