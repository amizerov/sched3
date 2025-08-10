'use client';

import { useState, useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import { StudyPlan } from '../db/getAvailablePlans';

interface YearSelectorProps {
  plans: StudyPlan[];
  currentFacultyId: number;
  currentYear?: number;
}

export default function YearSelector({ 
  plans, 
  currentFacultyId,
  currentYear
}: YearSelectorProps) {
  const [isYearOpen, setIsYearOpen] = useState(false);
  const { updateSessionData } = useSession();

  // Получаем уникальные годы поступления из планов
  const availableYears = [...new Set(plans.map(plan => plan.Start_Year))].sort((a, b) => b - a);
  
  // Проверяем, есть ли текущий год в доступных, если нет - сбрасываем
  const isCurrentYearValid = currentYear && availableYears.includes(currentYear);
  
  // Если текущий год не валиден, сбрасываем его через useEffect
  useEffect(() => {
    if (currentYear && !availableYears.includes(currentYear)) {
      updateSessionData({
        startYear: '',
        planId: '',
        plan: '',
        semester: '',
        subPlanId: '',
        subPlan: '',
        subjectId: '',
        subject: '',
        lectures: '',
        seminars: '',
        labs: '',
        practice: ''
      });
    }
  }, [currentYear, availableYears, updateSessionData]);
  
  const handleYearChange = (year: number) => {
    setIsYearOpen(false);
    // Обновляем сессию с новым годом и сбрасываем зависимые данные
    // НЕ сбрасываем facultyId и faculty
    updateSessionData({
      startYear: year.toString(),
      planId: '',
      plan: '',
      semester: '',
      subPlanId: '',
      subPlan: '',
      subjectId: '',
      subject: '',
      lectures: '',
      seminars: '',
      labs: '',
      practice: ''
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsYearOpen(!isYearOpen)}
        disabled={!currentFacultyId || availableYears.length === 0}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded border border-gray-300 hover:bg-gray-200 transition-colors text-sm min-w-[180px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <span className="truncate">
          {isCurrentYearValid ? `${currentYear} год поступления` : 'Выберите год поступления'}
        </span>
        <svg 
          className={`w-3 h-3 transition-transform flex-shrink-0 ${isYearOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isYearOpen && availableYears.length > 0 && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsYearOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded border border-gray-300 shadow-sm z-20 py-1 max-h-60 overflow-y-auto">
            {availableYears.map(year => (
              <button
                key={year}
                onClick={() => handleYearChange(year)}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 transition-colors cursor-pointer ${
                  isCurrentYearValid && currentYear === year ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                {year} год поступления
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
