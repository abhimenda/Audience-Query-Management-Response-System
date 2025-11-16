import React from 'react';

function FilterBar({ filters, onFilterChange }) {
  const handleChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search queries..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={filters.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
          <select
            value={filters.channel}
            onChange={(e) => handleChange('channel', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Channels</option>
            <option value="email">Email</option>
            <option value="twitter">Twitter</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="chat">Chat</option>
            <option value="community">Community</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            value={filters.sort}
            onChange={(e) => handleChange('sort', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="created_at">Date</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
            <option value="sender_name">Sender</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
          <select
            value={filters.order}
            onChange={(e) => handleChange('order', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="DESC">Descending</option>
            <option value="ASC">Ascending</option>
          </select>
        </div>
      </div>

      {(filters.status || filters.priority || filters.channel || filters.search || filters.tag) && (
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => onFilterChange({
              status: '',
              priority: '',
              channel: '',
              tag: '',
              search: '',
            })}
            className="text-sm text-primary-600 hover:text-primary-800"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

export default FilterBar;


