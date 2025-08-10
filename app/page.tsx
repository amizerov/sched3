'use client';

import Image from "next/image";
import { useState } from "react";
import ScheduleDiagram from "./components/ScheduleDiagram";

export default function Home() {
  const [showDescription, setShowDescription] = useState(false);

  return (
    <div className="p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {!showDescription ? (
          // UML диаграмма
          <div className="relative pb-2">
            <ScheduleDiagram />

            {/* Кнопка Далее - справа в середине */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
              <button 
                onClick={() => setShowDescription(true)}
                className="px-6 py-4 bg-gray-600 text-white text-lg font-medium rounded-full hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
    ) : (
      // Описание процесса
      <div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Описание процесса составления расписания
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-blue-600 mb-2">Этап планирования</h3>
              <p className="text-gray-700 text-sm">
                Учебный план определяет структуру образовательного процесса, содержит информацию о предметах, 
                курсах и семестрах. На его основе формируются нагрузки по каждому предмету с указанием 
                количества часов разных типов занятий.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-indigo-600 mb-2">Расчет учебной нагрузки</h3>
              <p className="text-gray-700 text-sm">
                Процедура GetPlanTermLoads выполняет автоматический расчет учебной нагрузки в академических часах 
                для каждой дисциплины по типам занятий (лекции, семинары, лабораторные, практика). 
                Учитывается продолжительность периода обучения и коэффициент 0.5 для перевода в академические часы.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-600 mb-2">Этап структурирования</h3>
              <p className="text-gray-700 text-sm">
                Подпланы позволяют гибко адаптировать учебный план под конкретные специализации и 
                требования, обеспечивая привязку к определенным группам студентов.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-teal-600 mb-2">Группировка и агрегация</h3>
              <p className="text-gray-700 text-sm">
                Система группирует нагрузку по факультету, учебному плану, подпланам и дисциплинам. 
                Данные суммируются по типам занятий с учетом графика учебного процесса, исключая 
                периоды сессий, каникул и практик для получения точной теоретической нагрузки.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-500 mb-2">Управление ресурсами</h3>
              <p className="text-gray-700 text-sm">
                Аудиторный фонд МГУ предоставляет информацию о доступных помещениях, их вместимости, 
                типе и оборудовании, привязанных к конкретным зданиям. Каждое здание имеет свою 
                схему звонков, которая может быть смещена для оптимизации потока студентов в столовую.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-600 mb-2">Временные рамки по зданиям</h3>
              <p className="text-gray-700 text-sm">
                Схемы звонков привязаны к конкретным зданиям и могут иметь смещение во времени 
                для равномерного распределения студентов во время обеденного перерыва. Это 
                предотвращает перегрузку столовых и улучшает логистику университета.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-500 mb-2">Итоговое назначение</h3>
              <p className="text-gray-700 text-sm">
                Финальный этап объединяет все компоненты: предметы, группы, аудитории и временные слоты 
                для создания конкретного расписания занятий с учетом всех ограничений и требований.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-600 mb-2">Учет педагогической нагрузки</h3>
              <p className="text-gray-700 text-sm">
                АИС Педагогическая нагрузка автоматически получает данные из расписания для подсчета 
                фактических часов каждого преподавателя по назначенным занятиям, обеспечивая 
                контроль соответствия плановой нагрузке.
              </p>
            </div>
          </div>
        </div>

        {/* Кнопка Назад */}
        <div className="mt-6 pb-32 text-center">
          <button 
            onClick={() => setShowDescription(false)}
            className="px-8 py-3 bg-gray-600 text-white text-lg font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-lg cursor-pointer"
          >
            ← Назад
          </button>
        </div>
      </div>
    )}

      </div>
    </div>
  );
}
