// app/dashboard/admin/audit/page.js
'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '../../../../lib/firebase';
import { collection, query, orderBy, limit, getDocs, startAfter, onSnapshot } from 'firebase/firestore';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
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
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      log.userName?.toLowerCase().includes(searchLower) ||
      log.userRole?.toLowerCase().includes(searchLower) ||
      log.module?.toLowerCase().includes(searchLower)
    );
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

  const clearSearch = () => {
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

      {/* Search Input - Wider */}
      <div className="mb-6">
        <div className="relative w-full">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral text-sm"></i>
          <input
            type="text"
            placeholder="Search by user, role, or module..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-10 py-2.5 border border-ocean-light/20 rounded-xl text-sm focus:outline-none focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 transition-all duration-300 bg-white"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral hover:text-ocean-light transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-textPrimary uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-textPrimary uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-textPrimary uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-textPrimary uppercase tracking-wider">Module</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-textPrimary uppercase tracking-wider">Action</th>
                 </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-neutral">
                      <i className="fas fa-history text-4xl mb-3 block"></i>
                      {searchTerm ? 'No matching audit logs found' : 'No audit logs found'}
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b border-ocean-light/10 hover:bg-ocean-ice/30 transition-colors">
                      <td className="px-6 py-4 text-textSecondary text-sm whitespace-nowrap">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-textPrimary">{log.userName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          log.userRole === 'admin' 
                            ? 'bg-ocean-lighter/10 text-ocean-light border border-ocean-lighter/30' 
                            : 'bg-ocean-ice text-textSecondary border border-ocean-light/20'
                        }`}>
                          {log.userRole}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                          {log.module}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                          <span className="text-textSecondary text-sm mt-1">
                            {log.details}
                          </span>
                        </div>
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