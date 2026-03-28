// app/dashboard/admin/audit/page.js
'use client';

import { useState, useEffect } from 'react';
import { db } from '../../../../lib/firebase';
import { collection, query, orderBy, limit, getDocs, startAfter, onSnapshot } from 'firebase/firestore';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
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
      setNotification({ show: true, message: 'Failed to load audit logs.', type: 'error' });
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Auto-hide notification
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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
      setNotification({ show: true, message: 'Failed to load more logs.', type: 'error' });
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
      log.module?.toLowerCase().includes(searchLower) ||
      log.action?.toLowerCase().includes(searchLower) ||
      log.details?.toLowerCase().includes(searchLower)
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
    if (action.includes('Created') || action.includes('Added')) return 'text-green-600 bg-green-50';
    if (action.includes('Updated') || action.includes('Edited')) return 'text-blue-600 bg-blue-50';
    if (action.includes('Archived') || action.includes('Deleted') || action.includes('Removed')) return 'text-red-600 bg-red-50';
    if (action.includes('Activated') || action.includes('Deactivated')) return 'text-yellow-600 bg-yellow-50';
    if (action.includes('Promoted') || action.includes('Demoted')) return 'text-purple-600 bg-purple-50';
    return 'text-gray-600 bg-gray-50';
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="p-6 bg-gradient-to-br from-ocean-ice to-blue-white min-h-screen">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-20 right-5 z-50 px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slideInRight ${
          notification.type === 'error' ? 'bg-red-50 border-l-4 border-red-500 text-red-700' : 'bg-green-50 border-l-4 border-green-500 text-green-700'
        }`}>
          <i className={`${notification.type === 'error' ? 'fas fa-exclamation-circle text-red-500' : 'fas fa-check-circle text-green-500'} text-base`}></i>
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-textPrimary font-playfair mb-1">
          Audit Logs
        </h1>
        <p className="text-textSecondary">
          Track all administrative actions across the system
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative w-full">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral text-sm"></i>
          <input
            type="text"
            placeholder="Search by user, role, module, action, or details..."
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-textPrimary uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-neutral">
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
                        <div className="text-xs text-neutral">{log.userEmail}</div>
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
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-textSecondary text-sm max-w-md">
                          {log.details}
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

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}