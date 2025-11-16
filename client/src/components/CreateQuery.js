import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { queriesAPI } from '../services/api';

function CreateQuery() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    channel: 'email',
    sender_name: '',
    sender_email: '',
    subject: '',
    content: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.sender_name || !formData.content) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const response = await queriesAPI.create(formData);
      navigate(`/query/${response.data.id}`);
    } catch (error) {
      console.error('Error creating query:', error);
      alert('Error creating query');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Query</h2>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Channel <span className="text-red-500">*</span>
            </label>
            <select
              name="channel"
              value={formData.channel}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="email">Email</option>
              <option value="twitter">Twitter</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="chat">Chat</option>
              <option value="community">Community</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sender Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="sender_name"
              value={formData.sender_name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sender Email
            </label>
            <input
              type="email"
              name="sender_email"
              value={formData.sender_email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={8}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Query'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateQuery;


