// app/dashboard/admin/audit/page.js
'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '../../../../lib/firebase';
import { collection, query, orderBy, limit, getDocs, where, startAfter, onSnapshot } from 'firebase/firestore';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    user: '',
    role: '',
    module: ''
  });
  
  // Filter options
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  
  // Pagination
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    // Set up real-time listener for audit logs
    const logsRef = collection(db, 'auditLogs');
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(50));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const logsList = [];
      querySnapshot.forEach((doc) => {
        logsList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setLogs(logsList);
      setLoading(false);
      
      // Extract unique values for filters
      const uniqueUsers = [...new Set(logsList.map(log => log.userName).filter(Boolean))];
      const uniqueRoles = [...new Set(logsList.map(log => log.userRole).filter(Boolean))];
      const uniqueModules = [...new Set(logsList.map(log => log.module).filter(Boolean))];
      
      setUsers(uniqueUsers);
      setRoles(uniqueRoles);
      setModules(uniqueModules);
      
      // Set last document for pagination
      if (querySnapshot.docs.length > 0) {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(querySnapshot.docs.length === 50);
      } else {
        setHasMore(false);
      }
    }, (error) => {
      console.error('Error fetching audit logs:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    
    setLoadingMore(true);
    try {
      const logsRef = collection(db, 'auditLogs');
      const q = query(
        logsRef, 
        orderBy('timestamp', 'desc'), 
        startAfter(lastVisible),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const newLogs = [];
      querySnapshot.forEach((doc) => {
        newLogs.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setLogs(prev => [...prev, ...newLogs]);
      if (querySnapshot.docs.length > 0) {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(querySnapshot.docs.length === 50);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more logs:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = !filters.user || log.userName === filters.user;
    const matchesRole = !filters.role || log.userRole === filters.role;
    const matchesModule = !filters.module || log.module === filters.module;
    
    return matchesSearch && matchesUser && matchesRole && matchesModule;
  });

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionColor = (action) => {
    if (action.includes('created') || action.includes('added')) return 'text-green-600 bg-green-50';
    if (action.includes('updated') || action.includes('edited')) return 'text-blue-600 bg-blue-50';
    if (action.includes('deleted') || action.includes('removed')) return 'text-red-600 bg-red-50';
    if (action.includes('activated') || action.includes('deactivated')) return 'text-yellow-600 bg-yellow-50';
    if (action.includes('promoted') || action.includes('demoted')) return 'text-purple-600 bg-purple-50';
    return 'text-gray-600 bg-gray-50';
  };

  const clearFilters = () => {
    setFilters({ user: '', role: '', module: '' });
    setSearchTerm('');
  };

  return (
    <div className="p-8 min-h-screen" style={{ backgroundColor: 'var(--color-blue-white)' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-textPrimary font-playfair mb-1">
          Audit Logs
        </h1>
        <p className="text-textSecondary">
          Track all administrative actions across the system
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-md border border-ocean-light/10 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium text-textPrimary">Search</label>
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral text-sm"></i>
              <input
                type="text"
                placeholder="Search by action or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-ocean-light/20 rounded-xl text-sm focus:outline-none focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 transition-all duration-300"
              />
            </div>
          </div>

          {/* User Filter */}
          <div>
            <label className="block mb-2 text-sm font-medium text-textPrimary">User</label>
            <select
              value={filters.user}
              onChange={(e) => setFilters({ ...filters, user: e.target.value })}
              className="w-full px-3 py-2.5 border border-ocean-light/20 rounded-xl text-sm focus:outline-none focus:border-ocean-light cursor-pointer bg-white"
            >
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block mb-2 text-sm font-medium text-textPrimary">Role</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="w-full px-3 py-2.5 border border-ocean-light/20 rounded-xl text-sm focus:outline-none focus:border-ocean-light cursor-pointer bg-white"
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* Module Filter */}
          <div>
            <label className="block mb-2 text-sm font-medium text-textPrimary">Module/Page</label>
            <select
              value={filters.module}
              onChange={(e) => setFilters({ ...filters, module: e.target.value })}
              className="w-full px-3 py-2.5 border border-ocean-light/20 rounded-xl text-sm focus:outline-none focus:border-ocean-light cursor-pointer bg-white"
            >
              <option value="">All Modules</option>
              {modules.map(module => (
                <option key={module} value={module}>{module}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(searchTerm || filters.user || filters.role || filters.module) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-ocean-light hover:text-ocean-mid transition-colors duration-200"
            >
              <i className="fas fa-times mr-2"></i>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Audit Logs Table */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <i className="fas fa-spinner fa-spin text-3xl text-ocean-light"></i>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md border border-ocean-light/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-ocean-pale/50 border-b border-ocean-light/20">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Timestamp</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">User</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Module/Page</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Action</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-neutral">
                      <i className="fas fa-history text-4xl mb-3 block"></i>
                      No audit logs found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b border-ocean-light/10 hover:bg-ocean-ice/30 transition-colors">
                      <td className="px-4 py-3 text-textSecondary text-sm whitespace-nowrap">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-textPrimary">{log.userName}</div>
                        <div className="text-xs text-neutral">{log.userEmail}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          log.userRole === 'admin' 
                            ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {log.userRole}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                          {log.module}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-textSecondary text-sm">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Load More Button */}
          {hasMore && filteredLogs.length > 0 && (
            <div className="p-4 text-center border-t border-ocean-light/10">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 bg-gradient-to-r from-ocean-mid to-ocean-light text-white rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <span><i className="fas fa-spinner fa-spin mr-2"></i> Loading...</span>
                ) : (
                  <span><i className="fas fa-chevron-down mr-2"></i> Load More</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}