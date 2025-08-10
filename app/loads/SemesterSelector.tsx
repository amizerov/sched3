'use client';

import { useState } from 'react';
import { useSession } from '../context/SessionContext';

interface SemesterSelectorProps {
  availableSemesters: number[];
  currentSemester: number;
  facultyId: number;
  planId: number;
}

export default function SemesterSelector({ 
  availableSemesters, 
  currentSemester, 
  facultyId, 
  planId 
}: SemesterSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { updateSessionData } = useSession();

  const handleSemesterChange = (semester: number) => {
    setIsOpen(false);
    
    // Обновляем сессию с новым семестром
    updateSessionData({
      semester: semester.toString()
    });
  };

  const getCurrentSemesterLabel = () => {
    return currentSemester === 0 ? 'Все семестры' : `Семестр ${currentSemester}`;
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded border border-gray-300 hover:bg-gray-200 transition-colors text-sm cursor-pointer"
      >
        <span>{getCurrentSemesterLabel()}</span>
        <svg 
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop для закрытия при клике вне */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Выпадающее меню */}
          <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded border border-gray-300 shadow-sm z-20 py-1">
            {/* Опция "Все семестры" */}
            <button
              onClick={() => handleSemesterChange(0)}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 transition-colors cursor-pointer ${
                currentSemester === 0 ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              Все семестры
            </button>
            
            {/* Доступные семестры */}
            {availableSemesters.map(semester => (
              <button
                key={semester}
                onClick={() => handleSemesterChange(semester)}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 transition-colors cursor-pointer ${
                  currentSemester === semester ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                Семестр {semester}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
