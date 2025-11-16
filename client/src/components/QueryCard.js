import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { queriesAPI } from '../services/api';

function QueryCard({ query, isSelected, onSelect, onUpdate }) {
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

  const getChannelIcon = (channel) => {
    const icons = {
      email: '📧',
      twitter: '🐦',
      facebook: '📘',
      instagram: '📷',
      chat: '💬',
      community: '👥',
    };
    return icons[channel] || '📨';
  };

  const handleStatusChange = async (e) => {
    try {
      await queriesAPI.update(query.id, { status: e.target.value });
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  const handlePriorityChange = async (e) => {
    try {
      await queriesAPI.update(query.id, { priority: e.target.value });
      onUpdate();
    } catch (error) {
      console.error('Error updating priority:', error);
      alert('Error updating priority');
    }
  };

  const handleAssignChange = async (e) => {
    try {
      await queriesAPI.update(query.id, { assigned_to: e.target.value });
      onUpdate();
    } catch (error) {
      console.error('Error updating assignment:', error);
      alert('Error updating assignment');
    }
  };

  return (
    <div className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-primary-50' : ''}`}>
      <div className="px-4 py-4 flex items-start">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
        />
        
        <div className="ml-4 flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <Link to={`/query/${query.id}`} className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{getChannelIcon(query.channel)}</span>
                <span className="font-medium text-gray-900 truncate">
                  {query.subject || 'No Subject'}
                </span>
                <span className="text-sm text-gray-500">from {query.sender_name}</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {query.content}
              </p>
            </Link>
          </div>

          <div className="flex items-center gap-2 flex-wrap mt-2">
            <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(query.priority)}`}>
              {query.priority}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(query.status)}`}>
              {query.status.replace('_', ' ')}
            </span>
            {query.tags && query.tags.map(tag => (
              <span key={tag} className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">
                {tag.replace('_', ' ')}
              </span>
            ))}
            <span className="text-xs text-gray-500">
              {format(new Date(query.created_at), 'MMM d, yyyy HH:mm')}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <select
              value={query.status}
              onChange={handleStatusChange}
              className="text-xs border border-gray-300 rounded px-2 py-1"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={query.priority}
              onChange={handlePriorityChange}
              className="text-xs border border-gray-300 rounded px-2 py-1"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select
              value={query.assigned_to || ''}
              onChange={handleAssignChange}
              className="text-xs border border-gray-300 rounded px-2 py-1"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="">Unassigned</option>
              <option value="team-1">Support Team</option>
              <option value="team-2">Sales Team</option>
              <option value="team-3">Technical Team</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QueryCard;


