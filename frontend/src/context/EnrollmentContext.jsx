import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getApiUrl } from '../services/api';

const EnrollmentContext = createContext();

export function EnrollmentProvider({ children }) {
  const { user, token } = useAuth();
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [enrollmentMap, setEnrollmentMap] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchEnrollments = useCallback(async () => {
    if (!token) {
      setEnrolledCourseIds([]);
      setEnrollmentMap({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(getApiUrl('/api/v1/learning/enrollment-status'), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setEnrolledCourseIds(data.enrolledCourseIds || []);
          setEnrollmentMap(data.enrollmentMap || {});
        }
      }
    } catch (err) {
      console.warn('Could not refresh enrollment status:', err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  // Listen to window event for cross-component re-fetch (after payment verified or registration)
  useEffect(() => {
    const handleUpdate = () => {
      fetchEnrollments();
    };
    window.addEventListener('kaira_enrollment_updated', handleUpdate);
    return () => window.removeEventListener('kaira_enrollment_updated', handleUpdate);
  }, [fetchEnrollments]);

  const checkOwnership = useCallback((courseId) => {
    if (!courseId) return { isEnrolled: false, isCompleted: false, completionPercentage: 0 };
    const cid = String(courseId);
    if (enrollmentMap[cid]) {
      return enrollmentMap[cid];
    }
    const isEnrolled = enrolledCourseIds.includes(cid);
    return {
      isEnrolled,
      isCompleted: false,
      completionPercentage: isEnrolled ? 10 : 0
    };
  }, [enrollmentMap, enrolledCourseIds]);

  return (
    <EnrollmentContext.Provider
      value={{
        enrolledCourseIds,
        enrollmentMap,
        loading,
        checkOwnership,
        refreshEnrollments: fetchEnrollments
      }}
    >
      {children}
    </EnrollmentContext.Provider>
  );
}

export function useEnrollment() {
  const context = useContext(EnrollmentContext);
  if (!context) {
    throw new Error('useEnrollment must be used within an EnrollmentProvider');
  }
  return context;
}
