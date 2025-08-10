'use client';

export default function SeriesPage() {
  return (
    <main className="p-5 bg-yellow-50 min-h-[80vh] rounded-xl shadow-md mt-3">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Создание серии занятий</h1>
          <button 
            onClick={() => window.history.back()} 
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors cursor-pointer flex items-center"
          >
            ← Назад
          </button>
        </div>
        {/* Здесь будет форма для создания серии занятий */}
      </div>
    </main>
  );
}