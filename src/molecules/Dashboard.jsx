import React, { useState, useMemo } from 'react';
import courseDataJSON from '../data/courseData.json';
import { findSuggestedCourses } from '../utils/findSuggestedCourses';
import '../styles/index.css';

function Card({ code, name, credits, isAdded, toggleButton }) {
  return (
    <div className="flex flex-col p-3 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">{code}</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{name}</p>
        </div>
        <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
          {credits}
        </span>
      </div>
      <button
        onClick={() => toggleButton(code)}
        aria-label={isAdded ? `Remove ${name}` : `Add ${name}`}
        aria-pressed={isAdded}
        className={`mt-3 w-full py-1.5 text-xs font-medium rounded transition-colors ${
          isAdded ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isAdded ? 'Remove' : 'Add'}
      </button>
    </div>
  );
}

export default function Dashboard({ addedCardsCodes, setAddedCardsCodes, showOnlyFall2026, setShowOnlyFall2026, isOpen, setIsOpen }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestedOnly, setShowSuggestedOnly] = useState(false);

  function handleButtonClick() { setIsOpen(!isOpen); }
  function handleToggleFall2026() { setShowOnlyFall2026(!showOnlyFall2026); }
  function toggleSuggestedFilter() { setShowSuggestedOnly((prev) => !prev); setSearchTerm(''); }

  function handleToggleCard(code) {
    if (!addedCardsCodes.includes(code)) {
      setAddedCardsCodes([...addedCardsCodes, code]);
    } else {
      setAddedCardsCodes(addedCardsCodes.filter((courseCode) => courseCode !== code));
    }
  }

  const suggestedCourses = useMemo(() => {
    let courses = findSuggestedCourses(courseDataJSON.coursesData, addedCardsCodes);
    if (showOnlyFall2026) courses = courses.filter((c) => c.AVAILABLE_FALL_2026);
    return courses;
  }, [addedCardsCodes, showOnlyFall2026]);

  const suggestedCourseCodes = useMemo(() => new Set(suggestedCourses.map((c) => c.courseCode)), [suggestedCourses]);

  const filteredCards = courseDataJSON.coursesData
    .filter((course) => {
      if (showOnlyFall2026 && !course.AVAILABLE_FALL_2026) return false;
      if (showSuggestedOnly) return suggestedCourseCodes.has(course.courseCode);
      return course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
             course.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .map((el) => (
      <Card
        key={el.courseCode}
        code={el.courseCode}
        name={el.courseName}
        credits={el.credits}
        isAdded={addedCardsCodes.includes(el.courseCode)}
        toggleButton={handleToggleCard}
      />
    ));

  return (
    <>
      <button
        onClick={handleButtonClick}
        className={`fixed top-4 z-30 bg-gray-800 text-white p-2.5 sm:p-2 rounded-l-lg shadow-lg transition-all duration-300 touch-manipulation ${
          isOpen ? 'left-0 md:left-auto md:right-[25%]' : 'right-0'
        }`}
        aria-label={isOpen ? 'Close course list' : 'Open course list'}
      >
        {isOpen ? '‹' : '›'}
      </button>

      <div className={`fixed top-0 right-0 h-full bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl transition-all duration-300 z-20 flex flex-col ${
        isOpen ? 'w-full sm:w-[min(85vw,360px)] md:w-1/4 md:min-w-[300px]' : 'w-0 overflow-hidden'
      }`}>
        <div className="p-3 sm:p-4 flex flex-col gap-3 h-full min-w-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Course Dashboard</h2>
          
          <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fall 2026</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={showOnlyFall2026} onChange={handleToggleFall2026} />
              <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <input
            type="text"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
            id="course-search"
            placeholder="Course name or code"
            disabled={showSuggestedOnly}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
          />

          <button
            onClick={toggleSuggestedFilter}
            className={`w-full py-2 text-sm font-medium rounded-md transition-colors ${showSuggestedOnly ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'}`}
          >
            {showSuggestedOnly ? 'Stop Showing Suggestions' : 'Show Suggested Courses'}
          </button>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {filteredCards}
          </div>
        </div>
      </div>
    </>
  );
}