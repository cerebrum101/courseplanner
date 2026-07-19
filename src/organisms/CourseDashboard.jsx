import React, { useEffect } from "react";
import courseDataJSON from '../data/courseData.json';
import '../styles/index.css';

export default function CourseDashboard({ selctedCourseData, reverseDependencyMap, addedCardsCodes, setAddedCardsCodes, isOpen, setIsOpen }) {
  function handleButtonClick() { setIsOpen(!isOpen); }

  function handleAddCourse(courseCode) {
    if (!addedCardsCodes.includes(courseCode)) {
      setAddedCardsCodes([...addedCardsCodes, courseCode]);
    }
  }

  useEffect(() => {
    if (selctedCourseData && reverseDependencyMap) {
      const reverseDeps = reverseDependencyMap.get(selctedCourseData.courseCode);
    }
  }, [selctedCourseData, reverseDependencyMap]);

  return (
    <>
      <button
        onClick={handleButtonClick}
        className={`fixed top-4 z-30 bg-gray-800 text-white p-2.5 sm:p-2 rounded-r-lg shadow-lg transition-all duration-300 touch-manipulation ${
          isOpen ? 'right-0 md:right-auto md:left-[25%]' : 'left-0'
        }`}
        aria-label={isOpen ? 'Close course details' : 'Open course details'}
      >
        {!isOpen ? '›' : '‹'}
      </button>

      <div className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-xl transition-all duration-300 z-20 flex flex-col ${
        isOpen ? 'w-full sm:w-[min(85vw,360px)] md:w-1/4 md:min-w-[300px]' : 'w-0 overflow-hidden'
      }`}>
        <div className="p-3 sm:p-4 flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar min-w-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Course Details</h2>
          
          {selctedCourseData ? (
            <>
              <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">{selctedCourseData.courseCode}</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{selctedCourseData.courseName}</p>
              </div>

              <div className="space-y-2 text-sm">
                <p><span className="font-semibold text-gray-600 dark:text-gray-400">School:</span> {selctedCourseData.SCHOOL}</p>
                <p><span className="font-semibold text-gray-600 dark:text-gray-400">Department:</span> {selctedCourseData.DEPARTMENT}</p>
                <p><span className="font-semibold text-gray-600 dark:text-gray-400">Prerequisites:</span> {selctedCourseData.PREREQ || 'None'}</p>
                <p><span className="font-semibold text-gray-600 dark:text-gray-400">Corequisites:</span> {selctedCourseData.COREQ || 'None'}</p>
                <p><span className="font-semibold text-gray-600 dark:text-gray-400">Antirequisites:</span> {selctedCourseData.ANTIREQ || 'None'}</p>
                <p><span className="font-semibold text-gray-600 dark:text-gray-400">Credits:</span> {selctedCourseData.credits} ECTS</p>
                <p><span className="font-semibold text-gray-600 dark:text-gray-400">Last Available:</span> {selctedCourseData.TERMNAME || 'n/a'}</p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <p className="text-sm">
                  <span className="font-semibold text-gray-600 dark:text-gray-400">Is available in Fall 2026:</span>{' '}
                  <span className={selctedCourseData.AVAILABLE_FALL_2026 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                    {selctedCourseData.AVAILABLE_FALL_2026 ? 'Yes' : 'No'}
                  </span>
                </p>
              </div>

              {reverseDependencyMap && (() => {
                const reverseDeps = reverseDependencyMap.get(selctedCourseData.courseCode);
                if (!reverseDeps) return null;

                const renderCourseList = (courses) => {
                  if (!courses || courses.length === 0) return <span className="text-gray-500">None</span>;
                  return (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {courses.map(courseCode => {
                        const isAdded = addedCardsCodes?.includes(courseCode);
                        return (
                          <div key={courseCode} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            <span className="text-xs font-mono">{courseCode}</span>
                            <button
                              onClick={() => handleAddCourse(courseCode)}
                              disabled={isAdded}
                              className={`px-2 py-0.5 text-xs rounded transition-colors ${isAdded ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'}`}
                            >
                              {isAdded ? 'Added' : 'Add'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                };

                return (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Is prerequisite to:</p>
                      {renderCourseList(reverseDeps.prerequisiteFor)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Is corequisite to:</p>
                      {renderCourseList(reverseDeps.corequisiteFor)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Is antirequisite to:</p>
                      {renderCourseList(reverseDeps.antirequisiteFor)}
                    </div>
                  </div>
                );
              })()}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <p className="text-sm"><span className="font-semibold text-gray-600 dark:text-gray-400">Description:</span> {selctedCourseData.SHORTDESC}</p>
              </div>

              {selctedCourseData.AVAILABLE_FALL_2026 && selctedCourseData.FALL_2026_PRIORITIES && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">Fall 2026 Priorities</h4>
                  <div className="space-y-1 text-xs">
                    <p><span className="font-semibold">Priority 1:</span> {selctedCourseData.FALL_2026_PRIORITIES.priority1 || '—'}</p>
                    <p><span className="font-semibold">Priority 2:</span> {selctedCourseData.FALL_2026_PRIORITIES.priority2 || '—'}</p>
                    <p><span className="font-semibold">Priority 3:</span> {selctedCourseData.FALL_2026_PRIORITIES.priority3 || '—'}</p>
                    <p><span className="font-semibold">Priority 4:</span> {selctedCourseData.FALL_2026_PRIORITIES.priority4 || '—'}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-center mt-10">No course selected</p>
          )}
        </div>
      </div>
    </>
  );
}