'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Faculty } from '../db/getFaculties';

interface FacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  faculties: Faculty[];
  currentFacultyId: number;
  onSelect: (facultyId: number) => void;
}

export default function FacultyModal({ 
  isOpen, 
  onClose, 
  faculties, 
  currentFacultyId, 
  onSelect 
}: FacultyModalProps) {
  // Состояния для позиции и размера
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('facultyModalPosition');
    return saved ? JSON.parse(saved) : { x: 0, y: 0 };
  });
  const [size, setSize] = useState(() => {
    const saved = localStorage.getItem('facultyModalSize');
    return saved ? JSON.parse(saved) : { width: 700, height: 500 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 700, height: 500 });
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSelect = (facultyId: number) => {
    onSelect(facultyId);
    onClose();
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      const modalRect = modalRef.current?.getBoundingClientRect();
      if (modalRect) {
        const maxX = window.innerWidth - modalRect.width;
        const maxY = window.innerHeight - modalRect.height;
        const pos = {
          x: Math.max(-modalRect.width / 2, Math.min(maxX / 2, newX)),
          y: Math.max(-modalRect.height / 2, Math.min(maxY / 2, newY))
        };
        setPosition(pos);
        localStorage.setItem('facultyModalPosition', JSON.stringify(pos));
      }
    } else if (isResizing) {
      let newWidth = Math.max(400, resizeStart.width + (e.clientX - resizeStart.x));
      let newHeight = Math.max(300, resizeStart.height + (e.clientY - resizeStart.y));
      // Ограничения по размеру окна
      newWidth = Math.min(newWidth, window.innerWidth - 40);
      newHeight = Math.min(newHeight, window.innerHeight - 40);
      const sz = { width: newWidth, height: newHeight };
      setSize(sz);
      localStorage.setItem('facultyModalSize', JSON.stringify(sz));
    }
  }, [isDragging, dragStart, isResizing, resizeStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Добавляем и удаляем глобальные обработчики событий
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  if (!isOpen) return null;

  // Обработчик начала ресайза
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Invisible backdrop for closing modal when clicking outside */}
      <div 
        className="absolute inset-0 pointer-events-auto" 
        onClick={onClose}
      />
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative bg-white rounded-lg shadow-xl flex flex-col pointer-events-auto"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'default',
          width: size.width,
          height: size.height,
          minWidth: 400,
          minHeight: 300,
          maxWidth: '90vw',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b cursor-grab active:cursor-grabbing select-none"
          style={{ background: '#ddddcc', height: 55 }}
          onMouseDown={handleMouseDown}
        >
          <div className="text-xl font-semibold text-gray-900 pointer-events-none">Выбор факультета</div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors pointer-events-auto"
          >
            <svg className="w-6 h-6 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Table */}
        <div className="flex-1 overflow-auto px-6 pb-6">
          <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-16 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="w-2/3 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Название
                </th>
                <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Short
                </th>
                <th className="w-16 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plans
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {faculties.map((faculty) => (
                <tr
                  key={faculty.Faculty_ID}
                  onClick={() => handleSelect(faculty.Faculty_ID)}
                  className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                    currentFacultyId === faculty.Faculty_ID 
                      ? 'bg-blue-50 border-blue-200' 
                      : ''
                  }`}
                >
                  <td className="w-16 px-4 py-4 text-sm text-gray-900 truncate">
                    {faculty.Faculty_ID}
                  </td>
                  <td className="w-2/3 px-4 py-4 text-sm text-gray-900 truncate" title={faculty.Faculty_Name}>
                    {faculty.Faculty_Name}
                  </td>
                  <td className="w-24 px-4 py-4 text-sm text-gray-500 truncate" title={faculty.Short_Name || '-'}>
                    {faculty.Short_Name || '-'}
                  </td>
                  <td className="w-16 px-4 py-4 text-sm text-gray-500 truncate">
                    {faculty.Plans}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <br />
        {/* Ресайзер */}
        <div
          onMouseDown={handleResizeMouseDown}
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: 18,
            height: 18,
            cursor: 'nwse-resize',
            zIndex: 10,
            background: 'transparent',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M2 16L16 2" stroke="#888" strokeWidth="2"/>
            <path d="M6 16L16 6" stroke="#888" strokeWidth="2"/>
            <path d="M10 16L16 10" stroke="#888" strokeWidth="2"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
