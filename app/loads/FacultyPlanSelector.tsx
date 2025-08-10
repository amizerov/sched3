'use client';

import { Faculty } from '../db/getFaculties';
import { StudyPlan } from '../db/getAvailablePlans';
import FacultySelector from './FacultySelector';
import PlanSelector from './PlanSelector';
import YearSelector from './YearSelector';
import { ReactNode } from 'react';

interface FacultyPlanSelectorProps {
  faculties: Faculty[];
  plans: StudyPlan[];
  currentFacultyId: number;
  currentPlanId: number;
  currentSemester: number;
  currentYear?: number;
  semesterSelector?: ReactNode;
}

export default function FacultyPlanSelector({ 
  faculties, 
  plans, 
  currentFacultyId, 
  currentPlanId,
  currentSemester,
  currentYear,
  semesterSelector
}: FacultyPlanSelectorProps) {

  return (
    <div className="space-y-4">
      {/* Первая строка: Выбор факультета */}
      <div>
        <FacultySelector 
          faculties={faculties}
          currentFacultyId={currentFacultyId}
        />
      </div>
      
      {/* Остальные селекторы показываем только если выбран факультет (currentFacultyId > 0 и не 99) */}
      {currentFacultyId && currentFacultyId > 0 && currentFacultyId != 99 && (
        <div className="flex flex-wrap gap-3 items-start">
          {/* Шаг 2: Показываем выбор года только после выбора факультета */}
          <div className="flex-shrink-0">
            <YearSelector 
              plans={plans}
              currentFacultyId={currentFacultyId}
              currentYear={currentYear}
            />
          </div>
          {/* Шаг 3: Показываем выбор учебного плана только после выбора факультета и года */}
          {currentYear && (
            <div className="flex-shrink-0">
              <PlanSelector 
                plans={plans}
                currentFacultyId={currentFacultyId}
                currentPlanId={currentPlanId}
                currentYear={currentYear}
              />
            </div>
          )}
          {/* Шаг 4: Показываем выбор семестра только после выбора учебного плана */}
          {currentYear && currentPlanId && semesterSelector && (
            <div className="flex-shrink-0">
              {semesterSelector}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
