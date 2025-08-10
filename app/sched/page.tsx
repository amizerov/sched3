'use client';

import { useSession } from '../context/SessionContext';
import { useRouter } from 'next/navigation';

export default function SchedulePage() {
  const { sessionData } = useSession();
  const router = useRouter();

  // Функция для вычисления учебного периода
  const calculatePeriod = (startYear: string, semester: string) => {
    if (!startYear || !semester) return { startDate: '', endDate: '' };
    
    const year = parseInt(startYear);
    const sem = parseInt(semester);
    
    if (sem % 2 === 1) {
      // Нечетный семестр (осенний) - сентябрь-январь
      const courseYear = Math.ceil(sem / 2); // 1,3,5,7 семестры -> 1,2,3,4 курсы
      const academicYear = year + courseYear - 1;
      return {
        startDate: `${academicYear}-09-01`,
        endDate: `${academicYear + 1}-01-31`
      };
    } else {
      // Четный семестр (весенний) - февраль-июнь
      const courseYear = sem / 2; // 2,4,6,8 семестры -> 1,2,3,4 курсы
      const academicYear = year + courseYear - 1;
      return {
        startDate: `${academicYear + 1}-02-01`,
        endDate: `${academicYear + 1}-06-30`
      };
    }
  };

  // Вычисляем период на основе данных из сессии
  const { startDate, endDate } = calculatePeriod(sessionData.startYear, sessionData.semester);

  return (
    <main className="p-5 bg-yellow-50 min-h-[80vh] rounded-xl shadow-md mt-3">
      <div className="max-w-6xl mx-auto">
        {/* Красивая карточка с информацией */}
        <div className="bg-yellow-50 rounded-lg shadow-md p-8 mb-6">
          {/* Заголовок */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  📝 Создание расписания
                </h1>
                <p className="text-lg text-gray-600">{sessionData.faculty}</p>
                <p className="text-lg text-gray-600">{sessionData.plan}</p>
                <p className="text-lg text-gray-600">{sessionData.subPlan}</p>
              </div>
              <button 
                onClick={() => router.push('/loads')} 
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors cursor-pointer flex items-center"
              >
                ← Назад
              </button>
            </div>
          </div>

          {/* Основная информация в двух колонках */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Левая колонка - Общая информация */}
            <div className="space-y-4">
              
              <div className="space-y-3">
                
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 w-32">Предмет:</span>
                  <span className="text-gray-800 font-medium">{sessionData.subject}</span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 w-32">Год поступления:</span>
                  <span className="text-gray-800">{sessionData.startYear}</span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 w-32">Учебный год:</span>
                  <span className="text-gray-800">
                    {startDate && startDate.split('-')[0] 
                      ? `${startDate.split('-')[0]}-${parseInt(startDate.split('-')[0]) + 1}`
                      : 'Не определен'
                    }
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 w-32">Период:</span>
                  <span className="text-gray-800">
                    {startDate && endDate 
                      ? `${startDate} — ${endDate}`
                      : 'Не определен'
                    }
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 w-32">Семестр:</span>
                  <span className="text-gray-800">{sessionData.semester}</span>
                </div>

              </div>
            </div>

            {/* Правая колонка - Нагрузка */}
            <div className="space-y-4">

              
              <div className="space-y-3">
                {parseInt(sessionData.lectures) > 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-2">📚</span>
                        <span className="text-sm font-medium text-gray-700">Лекции:</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-700">{sessionData.lectures} ч (план)</span>
                        <button 
                          onClick={() => router.push('/series')}
                          className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors cursor-pointer border border-gray-300"
                        >
                          Создать серию занятий
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 ml-6">
                      В расписании: 0 занятий (0 ч) • Аудитории: не назначены • Группы: не назначены
                    </div>
                  </div>
                )}
                
                {parseInt(sessionData.seminars) > 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-2">💬</span>
                        <span className="text-sm font-medium text-gray-700">Семинары:</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-700">{sessionData.seminars} ч (план)</span>
                        <button 
                          onClick={() => router.push('/series')}
                          className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors cursor-pointer border border-gray-300"
                        >
                          Создать серию занятий
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 ml-6">
                      В расписании: 0 занятий (0 ч) • Аудитории: не назначены • Группы: не назначены
                    </div>
                  </div>
                )}
                
                {parseInt(sessionData.labs) > 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-2">🔬</span>
                        <span className="text-sm font-medium text-gray-700">Лабораторные:</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-700">{sessionData.labs} ч (план)</span>
                        <button 
                          onClick={() => router.push('/series')}
                          className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors cursor-pointer border border-gray-300"
                        >
                          Создать серию занятий
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 ml-6">
                      В расписании: 0 занятий (0 ч) • Аудитории: не назначены • Группы: не назначены
                    </div>
                  </div>
                )}
                
                {parseInt(sessionData.practice) > 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-2">⚡</span>
                        <span className="text-sm font-medium text-gray-700">Практика:</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-700">{sessionData.practice} ч (план)</span>
                        <button 
                          onClick={() => router.push('/series')}
                          className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors cursor-pointer border border-gray-300"
                        >
                          Создать серию занятий
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 ml-6">
                      В расписании: 0 занятий (0 ч) • Аудитории: не назначены • Группы: не назначены
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Техническая информация (ID) */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center">
                <span className="font-medium text-gray-500 w-24">ID фак-та:</span>
                <span className="text-gray-700 font-mono">{sessionData.facultyId}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-500 w-24">ID плана:</span>
                <span className="text-gray-700 font-mono">{sessionData.planId}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-500 w-24">ID подплана:</span>
                <span className="text-gray-700 font-mono">{sessionData.subPlanId}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-500 w-24">ID предмета:</span>
                <span className="text-gray-700 font-mono">{sessionData.subjectId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
