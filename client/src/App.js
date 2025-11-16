import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Inbox from './components/Inbox';
import Analytics from './components/Analytics';
import QueryDetail from './components/QueryDetail';
import CreateQuery from './components/CreateQuery';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Inbox />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/query/:id" element={<QueryDetail />} />
          <Route path="/create" element={<CreateQuery />} />
        </Routes>
      </div>
    </Router>
  );
}

function Navbar() {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-100';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Query Management System</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`${isActive('/')} inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium transition-colors`}
              >
                Inbox
              </Link>
              <Link
                to="/analytics"
                className={`${isActive('/analytics')} inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium transition-colors`}
              >
                Analytics
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <Link
              to="/create"
              className="ml-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              + New Query
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default App;


