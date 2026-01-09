import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { queriesAPI } from '../services/api';
import QueryCard from './QueryCard';
import FilterBar from './FilterBar';

function Inbox() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    channel: '',
    tag: '',
    search: '',
    sort: 'created_at',
    order: 'DESC',
  });
  const [selectedQueries, setSelectedQueries] = useState([]);

  useEffect(() => {
    loadQueries();
  }, [filters]);

  const loadQueries = async () => {
    try {
      setLoading(true);
      const response = await queriesAPI.getAll(filters);
      setQueries(response.data);
    } catch (error) {
      console.error('Error loading queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleBulkAction = async (action, data) => {
    try {
      await queriesAPI.bulk({ action, query_ids: selectedQueries, ...data });
      setSelectedQueries([]);
      loadQueries();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Error performing bulk action');
    }
  };

  const handleQueryUpdate = () => {
    loadQueries();
  };

  const toggleSelect = (id) => {
    setSelectedQueries(prev =>
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedQueries.length === queries.length) {
      setSelectedQueries([]);
    } else {
      setSelectedQueries(queries.map(q => q.id));
    }
  };

  const stats = {
    total: queries.length,
    new: queries.filter(q => q.status === 'new').length,
    inProgress: queries.filter(q => q.status === 'in_progress').length,
    resolved: queries.filter(q => q.status === 'resolved').length,
    high: queries.filter(q => q.priority === 'high').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Unified Inbox</h2>
        <p className="text-gray-600">Manage all audience queries from one place</p>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total" value={stats.total} color="blue" />
        <StatCard label="New" value={stats.new} color="yellow" />
        <StatCard label="In Progress" value={stats.inProgress} color="purple" />
        <StatCard label="Resolved" value={stats.resolved} color="green" />
        <StatCard label="High Priority" value={stats.high} color="red" />
      </div>

      {}
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />

      {}
      {selectedQueries.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4 flex items-center justify-between">
          <span className="text-primary-800 font-medium">
            {selectedQueries.length} query{selectedQueries.length !== 1 ? 'ies' : ''} selected
          </span>
          <div className="flex gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkAction('assign', { assigned_to: e.target.value });
                  e.target.value = '';
                }
              }}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="">Assign to...</option>
              <option value="team-1">Support Team</option>
              <option value="team-2">Sales Team</option>
              <option value="team-3">Technical Team</option>
            </select>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkAction('update_status', { status: e.target.value });
                  e.target.value = '';
                }
              }}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="">Change status...</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <button
              onClick={() => setSelectedQueries([])}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading queries...</p>
        </div>
      ) : queries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No queries found</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center">
              <input
                type="checkbox"
                checked={selectedQueries.length === queries.length && queries.length > 0}
                onChange={toggleSelectAll}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">Select all</span>
            </div>
            {queries.map(query => (
              <QueryCard
                key={query.id}
                query={query}
                isSelected={selectedQueries.includes(query.id)}
                onSelect={() => toggleSelect(query.id)}
                onUpdate={handleQueryUpdate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm font-medium mt-1">{label}</div>
    </div>
  );
}

export default Inbox;



