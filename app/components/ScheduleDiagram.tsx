'use client';

import { useState, useRef, useEffect } from 'react';

interface BlockPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BlockPositions {
  [key: string]: BlockPosition;
}

export default function ScheduleDiagram() {
  // Дефолтные позиции блоков
  const defaultPositions: BlockPositions = {
    'study-plan': { x: 50, y: 50, width: 200, height: 120 },
    'subject-loads': { x: 350, y: 50, width: 200, height: 120 },
    'sub-plans': { x: 650, y: 50, width: 200, height: 120 },
    'student-groups': { x: 950, y: 50, width: 200, height: 120 },
    'auditorium-fund': { x: 200, y: 250, width: 200, height: 150 },
    'bell-schedule': { x: 500, y: 250, width: 200, height: 150 },
    'class-assignment': { x: 400, y: 480, width: 300, height: 150 },
    'teaching-load-system': { x: 800, y: 480, width: 220, height: 150 }
  };

  // Функция для загрузки позиций из куки
  const loadPositionsFromCookies = (): BlockPositions => {
    if (typeof document === 'undefined') return defaultPositions;
    
    try {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('diagram-positions='))
        ?.split('=')[1];
      
      if (cookieValue) {
        const savedPositions = JSON.parse(decodeURIComponent(cookieValue));
        // Проверяем, что все блоки присутствуют и имеют нужные свойства
        const isValid = Object.keys(defaultPositions).every(key => 
          savedPositions[key] && 
          typeof savedPositions[key].x === 'number' &&
          typeof savedPositions[key].y === 'number'
        );
        
        if (isValid) {
          // Сохраняем размеры из дефолтных позиций, но берем координаты из куки
          const mergedPositions: BlockPositions = {};
          Object.keys(defaultPositions).forEach(key => {
            mergedPositions[key] = {
              ...defaultPositions[key],
              x: savedPositions[key].x,
              y: savedPositions[key].y
            };
          });
          return mergedPositions;
        }
      }
    } catch (error) {
      console.warn('Failed to load positions from cookies:', error);
    }
    
    return defaultPositions;
  };

  // Функция для сохранения позиций в куки
  const savePositionsToCookies = (positions: BlockPositions) => {
    if (typeof document === 'undefined') return;
    
    try {
      const positionsToSave: Record<string, {x: number, y: number}> = {};
      Object.keys(positions).forEach(key => {
        positionsToSave[key] = {
          x: positions[key].x,
          y: positions[key].y
        };
      });
      
      const cookieValue = encodeURIComponent(JSON.stringify(positionsToSave));
      // Сохраняем на 1 год
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      document.cookie = `diagram-positions=${cookieValue}; expires=${expires.toUTCString()}; path=/`;
    } catch (error) {
      console.warn('Failed to save positions to cookies:', error);
    }
  };

  const [positions, setPositions] = useState<BlockPositions>(defaultPositions);

  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Загружаем позиции из куки при инициализации компонента
  useEffect(() => {
    const savedPositions = loadPositionsFromCookies();
    setPositions(savedPositions);
  }, []);

  const handleMouseDown = (e: React.MouseEvent, blockId: string) => {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const svgX = (e.clientX - rect.left) * (1200 / rect.width);
    const svgY = (e.clientY - rect.top) * (800 / rect.height);
    
    const block = positions[blockId];
    setDragOffset({
      x: svgX - block.x,
      y: svgY - block.y
    });
    setDragging(blockId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !svgRef.current) return;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const svgX = (e.clientX - rect.left) * (1200 / rect.width);
    const svgY = (e.clientY - rect.top) * (800 / rect.height);

    const newPositions = {
      ...positions,
      [dragging]: {
        ...positions[dragging],
        x: Math.max(0, Math.min(1200 - positions[dragging].width, svgX - dragOffset.x)),
        y: Math.max(0, Math.min(800 - positions[dragging].height, svgY - dragOffset.y))
      }
    };

    setPositions(newPositions);
    // Сохраняем позиции в куки при каждом перемещении
    savePositionsToCookies(newPositions);
  };

  const handleMouseUp = () => {
    setDragging(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // Функции для вычисления координат соединений
  const getConnectionPoint = (blockId: string, side: 'left' | 'right' | 'top' | 'bottom' | 'center') => {
    const block = positions[blockId];
    switch (side) {
      case 'left':
        return { x: block.x, y: block.y + block.height / 2 };
      case 'right':
        return { x: block.x + block.width, y: block.y + block.height / 2 };
      case 'top':
        return { x: block.x + block.width / 2, y: block.y };
      case 'bottom':
        return { x: block.x + block.width / 2, y: block.y + block.height };
      case 'center':
        return { x: block.x + block.width / 2, y: block.y + block.height / 2 };
      default:
        return { x: block.x + block.width / 2, y: block.y + block.height / 2 };
    }
  };

  // Функция для получения всех доступных точек соединения блока
  const getAllConnectionPoints = (blockId: string) => {
    return {
      top: getConnectionPoint(blockId, 'top'),
      right: getConnectionPoint(blockId, 'right'),
      bottom: getConnectionPoint(blockId, 'bottom'),
      left: getConnectionPoint(blockId, 'left')
    };
  };

  // Функция для вычисления расстояния между двумя точками
  const getDistance = (point1: { x: number; y: number }, point2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
  };

  // Функция для нахождения оптимальных точек соединения между двумя блоками
  const getOptimalConnectionPoints = (blockId1: string, blockId2: string) => {
    const points1 = getAllConnectionPoints(blockId1);
    const points2 = getAllConnectionPoints(blockId2);
    
    let minDistance = Infinity;
    let bestConnection = {
      point1: points1.right,
      point2: points2.left,
      side1: 'right' as 'top' | 'right' | 'bottom' | 'left',
      side2: 'left' as 'top' | 'right' | 'bottom' | 'left'
    };

    // Проверяем все возможные комбинации точек соединения
    const sides = ['top', 'right', 'bottom', 'left'] as const;
    
    for (const side1 of sides) {
      for (const side2 of sides) {
        const distance = getDistance(points1[side1], points2[side2]);
        if (distance < minDistance) {
          minDistance = distance;
          bestConnection = {
            point1: points1[side1],
            point2: points2[side2],
            side1: side1,
            side2: side2
          };
        }
      }
    }

    return bestConnection;
  };

  const getMidPoint = (point1: { x: number; y: number }, point2: { x: number; y: number }) => {
    return {
      x: (point1.x + point2.x) / 2,
      y: (point1.y + point2.y) / 2
    };
  };

  return (
    <div className="bg-yellow-50 rounded-lg shadow-lg p-8 overflow-x-auto">
      <svg 
        ref={svgRef}
        width="1200" 
        height="800" 
        viewBox="0 0 1200 800" 
        className="w-full h-auto cursor-default"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Определения стрелок */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                  refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
          </marker>
          <marker id="diamond" markerWidth="12" markerHeight="8" 
                  refX="6" refY="4" orient="auto">
            <polygon points="0 4, 6 0, 12 4, 6 8" fill="white" stroke="#374151" strokeWidth="1" />
          </marker>
        </defs>

        {/* Учебный план */}
        <g id="study-plan" style={{ cursor: dragging === 'study-plan' ? 'grabbing' : 'grab' }}>
          <rect 
            x={positions['study-plan'].x} 
            y={positions['study-plan'].y} 
            width={positions['study-plan'].width} 
            height={positions['study-plan'].height} 
            fill="#e5e7eb" 
            stroke="#374151" 
            strokeWidth="2" 
            rx="5"
            onMouseDown={(e) => handleMouseDown(e, 'study-plan')}
          />
          <text x={positions['study-plan'].x + positions['study-plan'].width / 2} y={positions['study-plan'].y + 25} textAnchor="middle" className="text-sm font-bold fill-gray-800 pointer-events-none">
            Учебный план
          </text>
          <line x1={positions['study-plan'].x} y1={positions['study-plan'].y + 35} x2={positions['study-plan'].x + positions['study-plan'].width} y2={positions['study-plan'].y + 35} stroke="#374151" strokeWidth="1" className="pointer-events-none"/>
          <text x={positions['study-plan'].x + 10} y={positions['study-plan'].y + 55} className="text-xs fill-gray-700 pointer-events-none">• Специальность</text>
          <text x={positions['study-plan'].x + 10} y={positions['study-plan'].y + 70} className="text-xs fill-gray-700 pointer-events-none">• Курс</text>
          <text x={positions['study-plan'].x + 10} y={positions['study-plan'].y + 85} className="text-xs fill-gray-700 pointer-events-none">• Семестр</text>
          <text x={positions['study-plan'].x + 10} y={positions['study-plan'].y + 100} className="text-xs fill-gray-700 pointer-events-none">• Предметы</text>
        </g>

        {/* Нагрузки по предметам */}
        <g id="subject-loads" style={{ cursor: dragging === 'subject-loads' ? 'grabbing' : 'grab' }}>
          <rect 
            x={positions['subject-loads'].x} 
            y={positions['subject-loads'].y} 
            width={positions['subject-loads'].width} 
            height={positions['subject-loads'].height} 
            fill="#ddd6fe" 
            stroke="#374151" 
            strokeWidth="2" 
            rx="5"
            onMouseDown={(e) => handleMouseDown(e, 'subject-loads')}
          />
          <text x={positions['subject-loads'].x + positions['subject-loads'].width / 2} y={positions['subject-loads'].y + 25} textAnchor="middle" className="text-sm font-bold fill-gray-800 pointer-events-none">
            Нагрузки по предметам
          </text>
          <line x1={positions['subject-loads'].x} y1={positions['subject-loads'].y + 35} x2={positions['subject-loads'].x + positions['subject-loads'].width} y2={positions['subject-loads'].y + 35} stroke="#374151" strokeWidth="1" className="pointer-events-none"/>
          <text x={positions['subject-loads'].x + 10} y={positions['subject-loads'].y + 55} className="text-xs fill-gray-700 pointer-events-none">• Лекции (часы)</text>
          <text x={positions['subject-loads'].x + 10} y={positions['subject-loads'].y + 70} className="text-xs fill-gray-700 pointer-events-none">• Семинары (часы)</text>
          <text x={positions['subject-loads'].x + 10} y={positions['subject-loads'].y + 85} className="text-xs fill-gray-700 pointer-events-none">• Лабораторные (часы)</text>
          <text x={positions['subject-loads'].x + 10} y={positions['subject-loads'].y + 100} className="text-xs fill-gray-700 pointer-events-none">• Практика (часы)</text>
        </g>

        {/* Подпланы */}
        <g id="sub-plans" style={{ cursor: dragging === 'sub-plans' ? 'grabbing' : 'grab' }}>
          <rect 
            x={positions['sub-plans'].x} 
            y={positions['sub-plans'].y} 
            width={positions['sub-plans'].width} 
            height={positions['sub-plans'].height} 
            fill="#fde68a" 
            stroke="#374151" 
            strokeWidth="2" 
            rx="5"
            onMouseDown={(e) => handleMouseDown(e, 'sub-plans')}
          />
          <text x={positions['sub-plans'].x + positions['sub-plans'].width / 2} y={positions['sub-plans'].y + 25} textAnchor="middle" className="text-sm font-bold fill-gray-800 pointer-events-none">
            Подпланы
          </text>
          <line x1={positions['sub-plans'].x} y1={positions['sub-plans'].y + 35} x2={positions['sub-plans'].x + positions['sub-plans'].width} y2={positions['sub-plans'].y + 35} stroke="#374151" strokeWidth="1" className="pointer-events-none"/>
          <text x={positions['sub-plans'].x + 10} y={positions['sub-plans'].y + 55} className="text-xs fill-gray-700 pointer-events-none">• ID подплана</text>
          <text x={positions['sub-plans'].x + 10} y={positions['sub-plans'].y + 70} className="text-xs fill-gray-700 pointer-events-none">• Название</text>
          <text x={positions['sub-plans'].x + 10} y={positions['sub-plans'].y + 85} className="text-xs fill-gray-700 pointer-events-none">• Привязка к группам</text>
          <text x={positions['sub-plans'].x + 10} y={positions['sub-plans'].y + 100} className="text-xs fill-gray-700 pointer-events-none">• Специализация</text>
        </g>

        {/* Группы студентов */}
        <g id="student-groups" style={{ cursor: dragging === 'student-groups' ? 'grabbing' : 'grab' }}>
          <rect 
            x={positions['student-groups'].x} 
            y={positions['student-groups'].y} 
            width={positions['student-groups'].width} 
            height={positions['student-groups'].height} 
            fill="#bfdbfe" 
            stroke="#374151" 
            strokeWidth="2" 
            rx="5"
            onMouseDown={(e) => handleMouseDown(e, 'student-groups')}
          />
          <text x={positions['student-groups'].x + positions['student-groups'].width / 2} y={positions['student-groups'].y + 25} textAnchor="middle" className="text-sm font-bold fill-gray-800 pointer-events-none">
            Группы студентов
          </text>
          <line x1={positions['student-groups'].x} y1={positions['student-groups'].y + 35} x2={positions['student-groups'].x + positions['student-groups'].width} y2={positions['student-groups'].y + 35} stroke="#374151" strokeWidth="1" className="pointer-events-none"/>
          <text x={positions['student-groups'].x + 10} y={positions['student-groups'].y + 55} className="text-xs fill-gray-700 pointer-events-none">• Номер группы</text>
          <text x={positions['student-groups'].x + 10} y={positions['student-groups'].y + 70} className="text-xs fill-gray-700 pointer-events-none">• Количество студентов</text>
          <text x={positions['student-groups'].x + 10} y={positions['student-groups'].y + 85} className="text-xs fill-gray-700 pointer-events-none">• Курс</text>
          <text x={positions['student-groups'].x + 10} y={positions['student-groups'].y + 100} className="text-xs fill-gray-700 pointer-events-none">• Факультет</text>
        </g>

        {/* Аудиторный фонд */}
        <g id="auditorium-fund" style={{ cursor: dragging === 'auditorium-fund' ? 'grabbing' : 'grab' }}>
          <rect 
            x={positions['auditorium-fund'].x} 
            y={positions['auditorium-fund'].y} 
            width={positions['auditorium-fund'].width} 
            height={positions['auditorium-fund'].height} 
            fill="#fed7d7" 
            stroke="#374151" 
            strokeWidth="2" 
            rx="5"
            onMouseDown={(e) => handleMouseDown(e, 'auditorium-fund')}
          />
          <text x={positions['auditorium-fund'].x + positions['auditorium-fund'].width / 2} y={positions['auditorium-fund'].y + 25} textAnchor="middle" className="text-sm font-bold fill-gray-800 pointer-events-none">
            Аудиторный фонд МГУ
          </text>
          <line x1={positions['auditorium-fund'].x} y1={positions['auditorium-fund'].y + 35} x2={positions['auditorium-fund'].x + positions['auditorium-fund'].width} y2={positions['auditorium-fund'].y + 35} stroke="#374151" strokeWidth="1" className="pointer-events-none"/>
          <text x={positions['auditorium-fund'].x + 10} y={positions['auditorium-fund'].y + 55} className="text-xs fill-gray-700 pointer-events-none">• Номер аудитории</text>
          <text x={positions['auditorium-fund'].x + 10} y={positions['auditorium-fund'].y + 70} className="text-xs fill-gray-700 pointer-events-none">• Здание (корпус)</text>
          <text x={positions['auditorium-fund'].x + 10} y={positions['auditorium-fund'].y + 85} className="text-xs fill-gray-700 pointer-events-none">• Вместимость</text>
          <text x={positions['auditorium-fund'].x + 10} y={positions['auditorium-fund'].y + 100} className="text-xs fill-gray-700 pointer-events-none">• Тип (лекц./сем./лаб.)</text>
          <text x={positions['auditorium-fund'].x + 10} y={positions['auditorium-fund'].y + 115} className="text-xs fill-gray-700 pointer-events-none">• Оборудование</text>
          <text x={positions['auditorium-fund'].x + 10} y={positions['auditorium-fund'].y + 130} className="text-xs fill-gray-700 pointer-events-none">• Факультет</text>
        </g>

        {/* Схемы звонков */}
        <g id="bell-schedule" style={{ cursor: dragging === 'bell-schedule' ? 'grabbing' : 'grab' }}>
          <rect 
            x={positions['bell-schedule'].x} 
            y={positions['bell-schedule'].y} 
            width={positions['bell-schedule'].width} 
            height={positions['bell-schedule'].height} 
            fill="#d1fae5" 
            stroke="#374151" 
            strokeWidth="2" 
            rx="5"
            onMouseDown={(e) => handleMouseDown(e, 'bell-schedule')}
          />
          <text x={positions['bell-schedule'].x + positions['bell-schedule'].width / 2} y={positions['bell-schedule'].y + 25} textAnchor="middle" className="text-sm font-bold fill-gray-800 pointer-events-none">
            Схемы звонков
          </text>
          <line x1={positions['bell-schedule'].x} y1={positions['bell-schedule'].y + 35} x2={positions['bell-schedule'].x + positions['bell-schedule'].width} y2={positions['bell-schedule'].y + 35} stroke="#374151" strokeWidth="1" className="pointer-events-none"/>
          <text x={positions['bell-schedule'].x + 10} y={positions['bell-schedule'].y + 55} className="text-xs fill-gray-700 pointer-events-none">• Здание (корпус)</text>
          <text x={positions['bell-schedule'].x + 10} y={positions['bell-schedule'].y + 70} className="text-xs fill-gray-700 pointer-events-none">• Время начала пары</text>
          <text x={positions['bell-schedule'].x + 10} y={positions['bell-schedule'].y + 85} className="text-xs fill-gray-700 pointer-events-none">• Время окончания</text>
          <text x={positions['bell-schedule'].x + 10} y={positions['bell-schedule'].y + 100} className="text-xs fill-gray-700 pointer-events-none">• Смещение обеда</text>
          <text x={positions['bell-schedule'].x + 10} y={positions['bell-schedule'].y + 115} className="text-xs fill-gray-700 pointer-events-none">• Номер пары</text>
          <text x={positions['bell-schedule'].x + 10} y={positions['bell-schedule'].y + 130} className="text-xs fill-gray-700 pointer-events-none">• Тип расписания</text>
        </g>

        {/* Назначение занятий */}
        <g id="class-assignment" style={{ cursor: dragging === 'class-assignment' ? 'grabbing' : 'grab' }}>
          <rect 
            x={positions['class-assignment'].x} 
            y={positions['class-assignment'].y} 
            width={positions['class-assignment'].width} 
            height={positions['class-assignment'].height} 
            fill="#fbbf24" 
            stroke="#374151" 
            strokeWidth="2" 
            rx="5"
            onMouseDown={(e) => handleMouseDown(e, 'class-assignment')}
          />
          <text x={positions['class-assignment'].x + positions['class-assignment'].width / 2} y={positions['class-assignment'].y + 25} textAnchor="middle" className="text-sm font-bold fill-gray-800 pointer-events-none">
            Назначение занятий
          </text>
          <line x1={positions['class-assignment'].x} y1={positions['class-assignment'].y + 35} x2={positions['class-assignment'].x + positions['class-assignment'].width} y2={positions['class-assignment'].y + 35} stroke="#374151" strokeWidth="1" className="pointer-events-none"/>
          <text x={positions['class-assignment'].x + 10} y={positions['class-assignment'].y + 55} className="text-xs fill-gray-700 pointer-events-none">• Предмет + тип занятия</text>
          <text x={positions['class-assignment'].x + 10} y={positions['class-assignment'].y + 70} className="text-xs fill-gray-700 pointer-events-none">• Группа студентов</text>
          <text x={positions['class-assignment'].x + 10} y={positions['class-assignment'].y + 85} className="text-xs fill-gray-700 pointer-events-none">• Аудитория</text>
          <text x={positions['class-assignment'].x + 10} y={positions['class-assignment'].y + 100} className="text-xs fill-gray-700 pointer-events-none">• Время (день недели + пара)</text>
          <text x={positions['class-assignment'].x + 10} y={positions['class-assignment'].y + 115} className="text-xs fill-gray-700 pointer-events-none">• Преподаватель</text>
          <text x={positions['class-assignment'].x + 10} y={positions['class-assignment'].y + 130} className="text-xs fill-gray-700 pointer-events-none">• Период проведения</text>
        </g>

        {/* АИС Педагогическая нагрузка */}
        <g id="teaching-load-system" style={{ cursor: dragging === 'teaching-load-system' ? 'grabbing' : 'grab' }}>
          <rect 
            x={positions['teaching-load-system'].x} 
            y={positions['teaching-load-system'].y} 
            width={positions['teaching-load-system'].width} 
            height={positions['teaching-load-system'].height} 
            fill="#c084fc" 
            stroke="#374151" 
            strokeWidth="2" 
            rx="5"
            onMouseDown={(e) => handleMouseDown(e, 'teaching-load-system')}
          />
          <text x={positions['teaching-load-system'].x + positions['teaching-load-system'].width / 2} y={positions['teaching-load-system'].y + 25} textAnchor="middle" className="text-sm font-bold fill-gray-800 pointer-events-none">
            АИС Пед. нагрузка
          </text>
          <line x1={positions['teaching-load-system'].x} y1={positions['teaching-load-system'].y + 35} x2={positions['teaching-load-system'].x + positions['teaching-load-system'].width} y2={positions['teaching-load-system'].y + 35} stroke="#374151" strokeWidth="1" className="pointer-events-none"/>
          <text x={positions['teaching-load-system'].x + 10} y={positions['teaching-load-system'].y + 55} className="text-xs fill-gray-700 pointer-events-none">• ID преподавателя</text>
          <text x={positions['teaching-load-system'].x + 10} y={positions['teaching-load-system'].y + 70} className="text-xs fill-gray-700 pointer-events-none">• Предмет</text>
          <text x={positions['teaching-load-system'].x + 10} y={positions['teaching-load-system'].y + 85} className="text-xs fill-gray-700 pointer-events-none">• Тип занятия</text>
          <text x={positions['teaching-load-system'].x + 10} y={positions['teaching-load-system'].y + 100} className="text-xs fill-gray-700 pointer-events-none">• Количество часов</text>
          <text x={positions['teaching-load-system'].x + 10} y={positions['teaching-load-system'].y + 115} className="text-xs fill-gray-700 pointer-events-none">• Группы</text>
          <text x={positions['teaching-load-system'].x + 10} y={positions['teaching-load-system'].y + 130} className="text-xs fill-gray-700 pointer-events-none">• Период</text>
        </g>

        {/* Стрелки связей - динамические с оптимальными точками соединения */}
        {(() => {
          // Учебный план -> Нагрузки
          const connection1 = getOptimalConnectionPoints('study-plan', 'subject-loads');
          const mid1 = getMidPoint(connection1.point1, connection1.point2);
          
          // Нагрузки -> Подпланы
          const connection2 = getOptimalConnectionPoints('subject-loads', 'sub-plans');
          const mid2 = getMidPoint(connection2.point1, connection2.point2);
          
          // Подпланы -> Группы
          const connection3 = getOptimalConnectionPoints('sub-plans', 'student-groups');
          const mid3 = getMidPoint(connection3.point1, connection3.point2);
          
          // Аудиторный фонд -> Назначение
          const connection4 = getOptimalConnectionPoints('auditorium-fund', 'class-assignment');
          const mid4 = getMidPoint(connection4.point1, connection4.point2);
          
          // Схемы звонков -> Назначение
          const connection5 = getOptimalConnectionPoints('bell-schedule', 'class-assignment');
          const mid5 = getMidPoint(connection5.point1, connection5.point2);
          
          // Аудиторный фонд -> Схемы звонков (связь по зданию)
          const connection6 = getOptimalConnectionPoints('auditorium-fund', 'bell-schedule');
          const mid6 = getMidPoint(connection6.point1, connection6.point2);
          
          // Группы -> Назначение
          const connection7 = getOptimalConnectionPoints('student-groups', 'class-assignment');
          const mid7 = getMidPoint(connection7.point1, connection7.point2);
          
          // Нагрузки -> Назначение
          const connection8 = getOptimalConnectionPoints('subject-loads', 'class-assignment');
          const mid8 = getMidPoint(connection8.point1, connection8.point2);
          
          // Назначение занятий -> АИС Педагогическая нагрузка
          const connection9 = getOptimalConnectionPoints('class-assignment', 'teaching-load-system');
          const mid9 = getMidPoint(connection9.point1, connection9.point2);
          
          return (
            <g>
              {/* Учебный план -> Нагрузки */}
              <line x1={connection1.point1.x} y1={connection1.point1.y} x2={connection1.point2.x} y2={connection1.point2.y} stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
              <text x={mid1.x} y={mid1.y - 5} textAnchor="middle" className="text-xs fill-gray-600">содержит</text>

              {/* Нагрузки -> Подпланы */}
              <line x1={connection2.point1.x} y1={connection2.point1.y} x2={connection2.point2.x} y2={connection2.point2.y} stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
              <text x={mid2.x} y={mid2.y - 5} textAnchor="middle" className="text-xs fill-gray-600">распределяет</text>

              {/* Подпланы -> Группы */}
              <line x1={connection3.point1.x} y1={connection3.point1.y} x2={connection3.point2.x} y2={connection3.point2.y} stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
              <text x={mid3.x} y={mid3.y - 5} textAnchor="middle" className="text-xs fill-gray-600">привязан к</text>

              {/* Аудиторный фонд -> Назначение */}
              <line x1={connection4.point1.x} y1={connection4.point1.y} x2={connection4.point2.x} y2={connection4.point2.y} stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
              <text x={mid4.x} y={mid4.y - 5} textAnchor="middle" className="text-xs fill-gray-600">предоставляет</text>

              {/* Схемы звонков -> Назначение */}
              <line x1={connection5.point1.x} y1={connection5.point1.y} x2={connection5.point2.x} y2={connection5.point2.y} stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
              <text x={mid5.x} y={mid5.y - 5} textAnchor="middle" className="text-xs fill-gray-600">определяет время</text>

              {/* Аудиторный фонд -> Схемы звонков (связь по зданию) */}
              <line x1={connection6.point1.x} y1={connection6.point1.y} x2={connection6.point2.x} y2={connection6.point2.y} stroke="#22c55e" strokeWidth="2" markerEnd="url(#arrowhead)"/>
              <text x={mid6.x} y={mid6.y - 5} textAnchor="middle" className="text-xs fill-green-600">связь по зданию</text>

              {/* Группы -> Назначение */}
              <line x1={connection7.point1.x} y1={connection7.point1.y} x2={connection7.point2.x} y2={connection7.point2.y} stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
              <text x={mid7.x} y={mid7.y - 5} textAnchor="middle" className="text-xs fill-gray-600">участвует в</text>

              {/* Нагрузки -> Назначение */}
              <line x1={connection8.point1.x} y1={connection8.point1.y} x2={connection8.point2.x} y2={connection8.point2.y} stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
              <text x={mid8.x} y={mid8.y - 5} textAnchor="middle" className="text-xs fill-gray-600">реализуется в</text>

              {/* Назначение занятий -> АИС Педагогическая нагрузка */}
              <line x1={connection9.point1.x} y1={connection9.point1.y} x2={connection9.point2.x} y2={connection9.point2.y} stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
              <text x={mid9.x} y={mid9.y - 10} textAnchor="middle" className="text-xs fill-gray-600">передает данные</text>
              <text x={mid9.x} y={mid9.y + 5} textAnchor="middle" className="text-xs fill-gray-600">о нагрузке</text>
            </g>
          );
        })()}

        {/* Заголовки этапов - динамические */}
        <text x={positions['study-plan'].x + positions['study-plan'].width / 2} y={positions['study-plan'].y - 20} textAnchor="middle" className="text-lg font-bold fill-blue-600">ПЛАНИРОВАНИЕ</text>
        <text x={positions['subject-loads'].x + positions['subject-loads'].width / 2} y={positions['subject-loads'].y - 20} textAnchor="middle" className="text-lg font-bold fill-purple-600">СТРУКТУРИРОВАНИЕ</text>
        <text x={positions['sub-plans'].x + positions['sub-plans'].width / 2} y={positions['sub-plans'].y - 20} textAnchor="middle" className="text-lg font-bold fill-yellow-600">ГРУППИРОВКА</text>
        <text x={positions['student-groups'].x + positions['student-groups'].width / 2} y={positions['student-groups'].y - 20} textAnchor="middle" className="text-lg font-bold fill-blue-500">КОНТИНГЕНТ</text>
        
        <text x={positions['auditorium-fund'].x + positions['auditorium-fund'].width / 2} y={positions['auditorium-fund'].y - 20} textAnchor="middle" className="text-lg font-bold fill-red-500">РЕСУРСЫ</text>
        <text x={positions['bell-schedule'].x + positions['bell-schedule'].width / 2} y={positions['bell-schedule'].y - 20} textAnchor="middle" className="text-lg font-bold fill-green-600">ВРЕМЕННЫЕ РАМКИ</text>
        
        <text x={positions['class-assignment'].x + positions['class-assignment'].width / 2} y={positions['class-assignment'].y - 20} textAnchor="middle" className="text-lg font-bold fill-orange-500">СОСТАВЛЕНИЕ РАСПИСАНИЯ</text>
        <text x={positions['teaching-load-system'].x + positions['teaching-load-system'].width / 2} y={positions['teaching-load-system'].y - 20} textAnchor="middle" className="text-lg font-bold fill-purple-500">ПРЕПОДАВАТЕЛИ</text>
      </svg>
    </div>
  );
}
