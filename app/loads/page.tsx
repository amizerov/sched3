'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '../context/SessionContext';
import SubjectTable from './SubjectTable';
import SemesterSelector from './SemesterSelector';
import FacultyPlanSelector from './FacultyPlanSelector';

export default function Page() {
  const { sessionData } = useSession();
  const router = useRouter();
  
  // Получаем параметры из сессии или используем значения по умолчанию
  const facultyId = sessionData.facultyId ? Number(sessionData.facultyId) : 1;
  const planId = sessionData.planId ? Number(sessionData.planId) : 368;
  const semester = sessionData.semester ? Number(sessionData.semester) : 0;
  const year = sessionData.startYear ? Number(sessionData.startYear) : undefined;

  // Состояния для загрузки данных
  const [data, setData] = useState<any[]>([]);
  const [availableSemesters, setAvailableSemesters] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загружаем данные при изменении параметров или сессии
  useEffect(() => {
    // Очищаем URL от любых параметров если они есть
    if (window.location.search) {
      router.replace('/loads');
    }
    
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Получаем данные через API routes
        const [loadsResponse, semestersResponse, facultiesResponse, plansResponse] = await Promise.all([
          fetch(`/api/loads?facultyId=${facultyId}&planId=${planId}&semester=${semester}`),
          planId ? fetch(`/api/semesters?facultyId=${facultyId}&planId=${planId}`) : Promise.resolve(null),
          fetch('/api/faculties'),
          fetch(`/api/plans?facultyId=${facultyId}`)
        ]);

        const [loadsResult, semestersResult, facultiesResult, plansResult] = await Promise.all([
          loadsResponse.json(),
          semestersResponse ? semestersResponse.json() : { semesters: [], error: null },
          facultiesResponse.json(),
          plansResponse.json()
        ]);

        if (loadsResult.error || semestersResult.error || facultiesResult.error || plansResult.error) {
          setError(loadsResult.error || semestersResult.error || facultiesResult.error || plansResult.error);
        } else {
          setData(loadsResult.data);
          setAvailableSemesters(semestersResult.semesters);
          setFaculties(facultiesResult.faculties);
          setPlans(plansResult.plans);
        }
      } catch (err) {
        setError('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [facultyId, planId, semester, sessionData]); // Добавляем sessionData в зависимости

  // Получаем название факультета и учебного плана из первого элемента, если есть
  const facultyName = data.length > 0 && data[0].Faculty_Name ? data[0].Faculty_Name : '';
  const planName = data.length > 0 && data[0].Plan_Name ? data[0].Plan_Name : '';

  if (loading) {
    return (
      <main className="p-5 bg-yellow-50 min-h-[80vh] rounded-xl shadow-md mt-3">
        <div className="text-center py-12">Загрузка...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-5 bg-yellow-50 min-h-[80vh] rounded-xl shadow-md mt-3">
        <div className="text-red-600">Ошибка: {error}</div>
      </main>
    );
  }

  return (
    <main className="p-5 bg-yellow-50 min-h-[80vh] rounded-xl shadow-md mt-3">
      {/* Селекторы факультета и учебного плана */}
      <div className="mb-6">
        <FacultyPlanSelector 
          faculties={faculties}
          plans={plans}
          currentFacultyId={facultyId}
          currentPlanId={planId}
          currentSemester={semester}
          currentYear={year}
          semesterSelector={
            planId ? (
              <SemesterSelector 
                availableSemesters={availableSemesters}
                currentSemester={semester}
                facultyId={facultyId}
                planId={planId}
              />
            ) : null
          }
        />
      </div>

      {/* Таблица */}
      {planId && (
        <SubjectTable 
          data={data}
          facultyId={facultyId}
          faculty={facultyName}
          planId={planId}
          plan={planName}
          startYear={year || new Date().getFullYear()}
        />
      )}

      {/* Сообщение, если план не выбран */}
      {!planId && (
        <div className="text-center py-12">
          <div className="text-lg text-neutral-600 mb-2">Выберите факультет и учебный план</div>
          <div className="text-sm text-neutral-500">для просмотра учебных нагрузок</div>
        </div>
      )}

    </main>
  );
}
