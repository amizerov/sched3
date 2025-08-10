'use client';

import { SubjectRow } from "../db/models"
import { useRouter } from 'next/navigation';
import { useSession } from '../context/SessionContext';

export default function JustTable(
    { 
      data, 
      searchTerm, 
      facultyId, 
      faculty, 
      planId, 
      plan, 
      startYear,
      sortField,
      sortDirection,
      onSort
    }: { 
      data: SubjectRow[], 
      searchTerm: string,
      facultyId: string,
      faculty: string,
      planId: string,
      plan: string,
      startYear: string,
      sortField: keyof SubjectRow,
      sortDirection: 'asc' | 'desc',
      onSort: (field: keyof SubjectRow) => void
    }
) 
{
    const router = useRouter();
    const { updateSessionData } = useSession();
    
    // Компонент иконки сортировки
    const SortIcon = ({ field }: { field: keyof SubjectRow }) => {
      if (sortField !== field) {
        return (
          <svg className="w-3 h-3 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        );
      }
      
      return sortDirection === 'asc' ? (
        <svg className="w-3 h-3 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      ) : (
        <svg className="w-3 h-3 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    };
    
    return (
      <div className="overflow-x-auto mb-4">
        <table className="w-full border-collapse bg-gray-50 shadow-sm rounded-lg overflow-hidden text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th 
                className="text-left px-2 py-1 text-gray-700 font-medium cursor-pointer hover:bg-gray-300 transition-colors select-none"
                onClick={() => onSort('Sub_Plan')}
              >
                <div className="flex items-center">
                  Под.план
                  <SortIcon field="Sub_Plan" />
                </div>
              </th>
              <th 
                className="text-left px-2 py-1 text-gray-700 font-medium cursor-pointer hover:bg-gray-300 transition-colors select-none"
                onClick={() => onSort('Subj_Name')}
              >
                <div className="flex items-center">
                  Предмет
                  <SortIcon field="Subj_Name" />
                </div>
              </th>
              <th 
                className="px-2 py-1 text-gray-700 font-medium cursor-pointer hover:bg-gray-300 transition-colors select-none"
                onClick={() => onSort('Semester')}
              >
                <div className="flex items-center justify-center">
                  Семестр
                  <SortIcon field="Semester" />
                </div>
              </th>
              <th 
                className="px-2 py-1 text-gray-700 font-medium cursor-pointer hover:bg-gray-300 transition-colors select-none"
                onClick={() => onSort('Lect_Hrs')}
              >
                <div className="flex items-center justify-center">
                  Лекции
                  <SortIcon field="Lect_Hrs" />
                </div>
              </th>
              <th 
                className="px-2 py-1 text-gray-700 font-medium cursor-pointer hover:bg-gray-300 transition-colors select-none"
                onClick={() => onSort('Semin_Hrs')}
              >
                <div className="flex items-center justify-center">
                  Семинар
                  <SortIcon field="Semin_Hrs" />
                </div>
              </th>
              <th 
                className="px-2 py-1 text-gray-700 font-medium cursor-pointer hover:bg-gray-300 transition-colors select-none"
                onClick={() => onSort('Labs_Hrs')}
              >
                <div className="flex items-center justify-center">
                  Лабы
                  <SortIcon field="Labs_Hrs" />
                </div>
              </th>
              <th 
                className="px-2 py-1 text-gray-700 font-medium cursor-pointer hover:bg-gray-300 transition-colors select-none"
                onClick={() => onSort('Pract_Hrs')}
              >
                <div className="flex items-center justify-center">
                  Практика
                  <SortIcon field="Pract_Hrs" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, idx) => {

                const sup = row.Sub_Plan || '';
                const lec = row.Lect_Hrs || 0;
                const sem = row.Semin_Hrs || 0;
                const lab = row.Labs_Hrs || 0;
                const pract = row.Pract_Hrs || 0;

                return (
                  <tr 
                    key={idx} 
                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors`}
                    onClick={() => {
                      // Отладочная информация
                      console.log('Row data:', row);
                      
                      // Сохраняем данные о выбранном предмете в сессии
                      updateSessionData({
                        facultyId: facultyId, // Из пропсов селектора
                        faculty: faculty,     // Из пропсов селектора
                        planId: planId,       // Из пропсов селектора
                        plan: plan,           // Из пропсов селектора
                        subPlanId: row.Sub_Plan_ID?.toString() || '', // Из базы данных
                        subPlan: sup,
                        subjectId: row.Subj_ID?.toString() || '',     // Из базы данных
                        subject: row.Subj_Name || '',
                        semester: row.Semester?.toString() || '',
                        lectures: lec.toString(),
                        seminars: sem.toString(),
                        labs: lab.toString(),
                        practice: pract.toString(),
                        startYear: startYear
                      });
                      
                      // Переходим на страницу расписания
                      router.push('/sched');
                    }}
                  >
                    <td className="text-left px-2 py-1 text-gray-700">{sup}</td>
                    <td className="text-left px-2 py-1 text-gray-700">{row.Subj_Name}</td>
                    <td className="text-center px-2 py-1 text-gray-700">{row.Semester}</td>
                    <td className="text-center px-2 py-1 text-gray-700">{lec}</td>
                    <td className="text-center px-2 py-1 text-gray-700">{sem}</td>
                    <td className="text-center px-2 py-1 text-gray-700">{lab}</td>
                    <td className="text-center px-2 py-1 text-gray-700">{pract}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-center px-2 py-4 text-gray-600">
                  {searchTerm ? 'Ничего не найдено' : 'Нет данных для отображения'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
   );
}