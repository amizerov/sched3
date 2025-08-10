'use client';

import { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { Faculty } from '../db/getFaculties';
import FacultyModal from './FacultyModal';

interface FacultySelectorProps {
  faculties: Faculty[];
  currentFacultyId: number;
}

export default function FacultySelector({ 
  faculties, 
  currentFacultyId
}: FacultySelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { updateSessionData } = useSession();

  const currentFaculty = faculties.find(f => f.Faculty_ID === currentFacultyId);

  const handleFacultyChange = (facultyId: number) => {
    const selectedFaculty = faculties.find(f => f.Faculty_ID === facultyId);
    
    // Обновляем сессию с новым факультетом и сбрасываем ВСЕ зависимые данные
    // включая год поступления, так как у разных факультетов разные доступные годы
    updateSessionData({
      facultyId: facultyId.toString(),
      faculty: selectedFaculty?.Faculty_Name || '',
      startYear: '', // Сбрасываем год при смене факультета
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
    <>
      <div className="flex items-center justify-between w-full">
        <h1 className="text-xl font-semibold text-gray-900">
          Учебные нагрузки {currentFaculty ? currentFaculty.Faculty_Name : 'Выбрать факультет'}
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer"
          title="Выбрать факультет"
        >
          <svg 
            className="w-5 h-5" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <circle cx="3" cy="10" r="1.5" />
            <circle cx="10" cy="10" r="1.5" />
            <circle cx="17" cy="10" r="1.5" />
          </svg>
        </button>
      </div>

      <FacultyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        faculties={faculties}
        currentFacultyId={currentFacultyId}
        onSelect={handleFacultyChange}
      />
    </>
  );
}
