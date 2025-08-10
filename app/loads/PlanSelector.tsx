'use client';

import { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { StudyPlan } from '../db/getAvailablePlans';

interface PlanSelectorProps {
  plans: StudyPlan[];
  currentFacultyId: number;
  currentPlanId: number;
  currentYear?: number;
}

export default function PlanSelector({ 
  plans, 
  currentFacultyId,
  currentPlanId,
  currentYear
}: PlanSelectorProps) {
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const { updateSessionData } = useSession();

  // Фильтруем планы по выбранному году
  const filteredPlans = currentYear 
    ? plans.filter(plan => plan.Start_Year === currentYear)
    : plans;

  const currentPlan = filteredPlans.find(p => p.Plan_ID === currentPlanId);

  const handlePlanChange = (planId: number) => {
    setIsPlanOpen(false);
    const selectedPlan = filteredPlans.find(p => p.Plan_ID === planId);
    
    // Обновляем сессию с новым планом и сбрасываем семестр
    updateSessionData({
      planId: planId.toString(),
      plan: selectedPlan?.Plan_Name || '',
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
        onClick={() => setIsPlanOpen(!isPlanOpen)}
        disabled={!currentFacultyId || filteredPlans.length === 0}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded border border-gray-300 hover:bg-gray-200 transition-colors text-sm min-w-[250px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <span className="truncate">
          {currentPlan ? `${currentPlan.Plan_Name}` : 'Выберите учебный план'}
        </span>
        <svg 
          className={`w-3 h-3 transition-transform flex-shrink-0 ${isPlanOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isPlanOpen && filteredPlans.length > 0 && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsPlanOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded border border-gray-300 shadow-sm z-20 py-1 max-h-80 overflow-y-auto">
            {filteredPlans.map(plan => (
              <button
                key={plan.Plan_ID}
                onClick={() => handlePlanChange(plan.Plan_ID)}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 transition-colors cursor-pointer ${
                  currentPlanId === plan.Plan_ID ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <div className="truncate">{plan.Plan_Name}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
