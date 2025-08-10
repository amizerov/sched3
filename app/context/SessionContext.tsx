'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface SessionData {
  facultyId: string;
  faculty: string;
  planId: string;
  plan: string;
  subPlanId: string;
  subPlan: string;
  subjectId: string;
  subject: string;
  semester: string;
  lectures: string;
  seminars: string;
  labs: string;
  practice: string;
  startYear: string;
  itemsPerPage: string; // Количество строк на странице
}

interface SessionContextType {
  sessionData: SessionData;
  setSessionData: (data: SessionData) => void;
  updateSessionData: (data: Partial<SessionData>) => void;
  clearSessionData: () => void;
}

const defaultSessionData: SessionData = {
  facultyId: '',
  faculty: '',
  planId: '',
  plan: '',
  subPlanId: '',
  subPlan: '',
  subjectId: '',
  subject: '',
  semester: '',
  lectures: '',
  seminars: '',
  labs: '',
  practice: '',
  startYear: '',
  itemsPerPage: '10' // По умолчанию 10 строк на странице
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionData, setSessionDataState] = useState<SessionData>(defaultSessionData);

  const setSessionData = (data: SessionData) => {
    setSessionDataState(data);
    // Сохраняем в localStorage для персистентности
    if (typeof window !== 'undefined') {
      localStorage.setItem('scheduleSessionData', JSON.stringify(data));
    }
  };

  const updateSessionData = (data: Partial<SessionData>) => {
    const newData = { ...sessionData, ...data };
    setSessionData(newData);
  };

  const clearSessionData = () => {
    setSessionDataState(defaultSessionData);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('scheduleSessionData');
    }
  };

  // Восстанавливаем данные из localStorage при загрузке
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('scheduleSessionData');
      if (saved) {
        try {
          const parsedData = JSON.parse(saved);
          setSessionDataState(parsedData);
        } catch (error) {
          console.error('Error parsing session data:', error);
        }
      }
    }
  }, []);

  return (
    <SessionContext.Provider value={{
      sessionData,
      setSessionData,
      updateSessionData,
      clearSessionData
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
