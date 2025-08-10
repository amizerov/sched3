'use client';

import { useState, useMemo, useEffect } from 'react';
import { SubjectRow } from '../db/models';
import { useSession } from '../context/SessionContext';
import JustTable from './JustTable';

export default function PaginatedTable({ 
  data,
  facultyId,
  faculty,
  planId,
  plan,
  startYear
}: { 
  data: SubjectRow[];
  facultyId: string;
  faculty: string;
  planId: string;
  plan: string;
  startYear: string;
}) {
  const { sessionData, updateSessionData } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Состояние для сортировки
  const [sortField, setSortField] = useState<keyof SubjectRow>('Semester');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Получаем itemsPerPage из сессии или используем значение по умолчанию
  const itemsPerPage = sessionData.itemsPerPage ? Number(sessionData.itemsPerPage) : 50;

  // Функция для обновления количества элементов на странице
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    updateSessionData({ itemsPerPage: newItemsPerPage.toString() });
    setCurrentPage(1); // Сбрасываем на первую страницу
  };
  
  // Функция для обработки клика по заголовку
  const handleSort = (field: keyof SubjectRow) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Сбрасываем на первую страницу при сортировке
  };

  // Фильтрация данных по поиску
  const filteredData = useMemo(() => {
    const filtered = data.filter(row => {
        const sum = row.Lect_Hrs + row.Semin_Hrs + row.Labs_Hrs + row.Pract_Hrs;
        if (sum === 0) {
            return false;
        }
        // Проверяем, что Subj_Name существует и не пустой
        if (!row.Subj_Name) {
            return false;
        }
        // Фильтрация по названию предмета     
        const matches = row.Subj_Name.toLowerCase().includes(searchTerm.toLowerCase());
      
        return matches;
    });
    
    return filtered;
  }, [data, searchTerm]);
  
  // Сортировка отфильтрованных данных
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Приводим к числу если это возможно
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Для строк
      const aStr = String(aValue || '').toLowerCase();
      const bStr = String(bValue || '').toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr, 'ru');
      } else {
        return bStr.localeCompare(aStr, 'ru');
      }
    });
  }, [filteredData, sortField, sortDirection]);

  // Расчет пагинации на основе отсортированных данных
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  // Сброс страницы при изменении поиска
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  // Функции навигации
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPrevious = () => goToPage(currentPage - 1);
  const goToNext = () => goToPage(currentPage + 1);

  // Генерация номеров страниц для отображения
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <>
      {/* Поиск и настройки */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <input
            type="text"
            placeholder="Поиск по предметам..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
          />
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
          >
            <option value={5}>5 на странице</option>
            <option value={10}>10 на странице</option>
            <option value={15}>15 на странице</option>
            <option value={25}>25 на странице</option>
            <option value={50}>50 на странице</option>
            <option value={100}>100 на странице</option>
          </select>
        </div>
        
        {/* Информация о записях */}
        <div className="text-sm text-gray-600">
          Показано {startIndex + 1}-{Math.min(endIndex, totalItems)} из {totalItems} записей
          {searchTerm && ` (отфильтровано из ${data.length})`}
        </div>
      </div>

      {/* Таблица */}
      <JustTable
        data={currentData}
        searchTerm={searchTerm}
        facultyId={facultyId}
        faculty={faculty}
        planId={planId}
        plan={plan}
        startYear={startYear}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors cursor-pointer"
            >
              Первая
            </button>
            <button
              onClick={goToPrevious}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors cursor-pointer"
            >
              Предыдущая
            </button>
          </div>

          <div className="flex items-center gap-1">
            {getPageNumbers().map(pageNum => (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  pageNum === currentPage
                    ? 'bg-blue-400 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToNext}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors cursor-pointer"
            >
              Следующая
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors cursor-pointer"
            >
              Последняя
            </button>
          </div>
        </div>
      )}
    </>
  );
}
