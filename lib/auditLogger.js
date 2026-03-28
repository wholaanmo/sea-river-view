// lib/auditLogger.js
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { auth } from './firebase';

/**
 * Log an admin action to the audit logs
 * @param {Object} params - Log parameters
 * @param {string} params.action - Action performed (e.g., "Added staff member")
 * @param {string} params.module - Module/page where action occurred (e.g., "Staff Management")
 * @param {string} params.details - Detailed description of the action
 * @param {Object} params.userData - Optional user data override (if not provided, uses current user)
 */
export const logAdminAction = async ({ action, module, details, userData = null }) => {
  try {
    let userInfo = userData;
    
    if (!userInfo && auth.currentUser) {
      // Get current user's details from Firestore
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        userInfo = userDoc.data();
      } else {
        userInfo = {
          name: auth.currentUser.email,
          email: auth.currentUser.email,
          role: 'admin'
        };
      }
    }
    
    const logEntry = {
      action: action,
      module: module,
      details: details,
      timestamp: serverTimestamp(),
      userId: userInfo?.uid || auth.currentUser?.uid || 'unknown',
      userName: userInfo?.name || userInfo?.email || auth.currentUser?.email || 'Unknown User',
      userEmail: userInfo?.email || auth.currentUser?.email || '',
      userRole: userInfo?.role || 'admin'
    };
    
    const logsRef = collection(db, 'auditLogs');
    await addDoc(logsRef, logEntry);
    
    console.log('Audit log created:', logEntry);
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw - logging should not interrupt main functionality
  }
};