import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { queriesAPI } from '../services/api';

function QueryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadQuery();
  }, [id]);

  const loadQuery = async () => {
    try {
      setLoading(true);
      const response = await queriesAPI.getById(id);
      setQuery(response.data);
    } catch (error) {
      console.error('Error loading query:', error);
      alert('Error loading query');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (field, value) => {
    try {
      setUpdating(true);
      await queriesAPI.update(id, { [field]: value });
      loadQuery();
    } catch (error) {
      console.error('Error updating query:', error);
      alert('Error updating query');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading query...</p>
        </div>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Query not found</p>
          <Link to="/" className="text-primary-600 hover:text-primary-800 mt-4 inline-block">
            Back to Inbox
          </Link>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="text-primary-600 hover:text-primary-800 mb-4 inline-block">
        ← Back to Inbox
      </Link>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {query.subject || 'No Subject'}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>From: <strong>{query.sender_name}</strong></span>
                {query.sender_email && (
                  <span>Email: <strong>{query.sender_email}</strong></span>
                )}
                <span>Channel: <strong className="capitalize">{query.channel}</strong></span>
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={query.status}
                onChange={(e) => handleUpdate('status', e.target.value)}
                disabled={updating}
                className={`px-3 py-2 rounded-md text-sm font-medium border ${getStatusColor(query.status)}`}
              >
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <select
                value={query.priority}
                onChange={(e) => handleUpdate('priority', e.target.value)}
                disabled={updating}
                className={`px-3 py-2 rounded-md text-sm font-medium border ${getPriorityColor(query.priority)}`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>

        {}
        <div className="px-6 py-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Message</h2>
            <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-700">
              {query.content}
            </div>
          </div>

          {}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {query.tags && query.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                  {tag.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>

          {}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Assignment</h2>
            <select
              value={query.assigned_to || ''}
              onChange={(e) => handleUpdate('assigned_to', e.target.value)}
              disabled={updating}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Unassigned</option>
              <option value="team-1">Support Team</option>
              <option value="team-2">Sales Team</option>
              <option value="team-3">Technical Team</option>
            </select>
          </div>

          {}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-sm text-gray-600">Created:</span>
              <p className="font-medium">{format(new Date(query.created_at), 'PPpp')}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Last Updated:</span>
              <p className="font-medium">{format(new Date(query.updated_at), 'PPpp')}</p>
            </div>
            {query.resolved_at && (
              <div>
                <span className="text-sm text-gray-600">Resolved:</span>
                <p className="font-medium">{format(new Date(query.resolved_at), 'PPpp')}</p>
              </div>
            )}
            {query.response_time !== null && (
              <div>
                <span className="text-sm text-gray-600">Response Time:</span>
                <p className="font-medium">{query.response_time} minutes</p>
              </div>
            )}
          </div>

          {}
          {query.assignments && query.assignments.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Assignment History</h2>
              <div className="space-y-2">
                {query.assignments.map(assignment => (
                  <div key={assignment.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                    <span className="font-medium">Assigned to: {assignment.assigned_to}</span>
                    <span className="text-gray-500 ml-2">
                      {format(new Date(assignment.assigned_at), 'PPpp')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {}
          {query.statusHistory && query.statusHistory.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Status History</h2>
              <div className="space-y-2">
                {query.statusHistory.map(history => (
                  <div key={history.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                    <span className="font-medium">
                      {history.old_status || 'N/A'} → {history.new_status}
                    </span>
                    <span className="text-gray-500 ml-2">
                      {format(new Date(history.changed_at), 'PPpp')}
                    </span>
                    {history.notes && (
                      <p className="text-gray-600 mt-1">{history.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QueryDetail;



