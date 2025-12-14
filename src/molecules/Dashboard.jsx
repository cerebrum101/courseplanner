import React, { useState, useEffect, useMemo } from 'react';
import courseDataJSON from '../data/courseData.json';
import { findSuggestedCourses } from '../utils/findSuggestedCourses';

import '.././styles/index.css';


function Card({ code, name, credits, isAdded, toggleButton }) {
    return (
<div className="card p-4 bg-gray-800 border border-gray-600 rounded-lg flex flex-col space-y-2 shadow-md hover:shadow-lg transition-shadow">
        <div className="card-info">
        <p className="card-code text-blue-400 font-mono font-semibold">{code}</p>
<p className="card-name text-white font-medium">{name}</p>
<p className="card-credits text-yellow-300 font-mono">{credits}</p>
        </div>
        <button 
    className={`px-4 py-2 w-full rounded-lg transition-colors font-medium ${
        isAdded 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-green-500 hover:bg-green-600 text-white'
    }`}
    onClick={() => toggleButton(code)}
    aria-label={isAdded ? `Remove ${name}` : `Add ${name}`}
    aria-pressed={isAdded}
>
    {isAdded ? 'Remove' : 'Add'}
</button>
      </div>
    );
  }

export default function Dashboard({addedCardsCodes, setAddedCardsCodes, showOnlySpring2026, setShowOnlySpring2026}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestedOnly, setShowSuggestedOnly] = useState(false);

    function handleButtonClick() {
        setIsCollapsed((isCollapsed) => !isCollapsed);
    }

    function handleToggleSpring2026() {
        setShowOnlySpring2026(!showOnlySpring2026);
    }

    function toggleSuggestedFilter() {
        setShowSuggestedOnly(prev => !prev);
        setSearchTerm(''); // Clear search when toggling
    }

    function handleToggleCard(code) {
          if (!(addedCardsCodes.includes(code)))
          {
            setAddedCardsCodes([...addedCardsCodes, code])
          }
          else {
            setAddedCardsCodes(addedCardsCodes.filter(courseCode => courseCode !== code))
          }
    }

    // Compute suggested courses
    const suggestedCourses = useMemo(() => {
        let courses = findSuggestedCourses(courseDataJSON.coursesData, addedCardsCodes);
        // Filter by Spring 2026 if toggle is on
        if (showOnlySpring2026) {
            courses = courses.filter(c => c.AVAILABLE_SPRING_2026);
        }
        return courses;
    }, [addedCardsCodes, showOnlySpring2026]);

    const suggestedCourseCodes = useMemo(() => {
        return new Set(suggestedCourses.map(c => c.courseCode));
    }, [suggestedCourses]);

    // Filter courses based on search term, suggested filter, and Spring 2026 filter
    const filteredCards = courseDataJSON.coursesData
    .filter(course => {
        // First check Spring 2026 filter
        if (showOnlySpring2026 && !course.AVAILABLE_SPRING_2026) {
            return false;
        }

        // If showing suggested only, filter by suggested courses
        if (showSuggestedOnly) {
            return suggestedCourseCodes.has(course.courseCode);
        }
        
        // Otherwise use normal search filter
        return course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
               course.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .map((el) => (
        <Card 
            key={el.courseCode}
            code={el.courseCode}
            name={el.courseName}
            credits={`${el.credits} ECTS`}
            isAdded={addedCardsCodes.includes(el.courseCode)}
            toggleButton={handleToggleCard}
        />
    ));

    return (
        <>
        {/* Expand button when dashboard is collapsed */}
        <button 
        className={`${isCollapsed ? "block": "hidden"} absolute right-[20px] top-[30px] z-20  h-[40px] w-[40px] bg-gray-600 rounded-lg border border-gray-500 text-3xl text-white flex items-center justify-center transition-all duration-300 hover:bg-gray-500 mr-2`}
                        onClick={handleButtonClick}
                        aria-label={isCollapsed ? "Expand dashboard" : "Collapse dashboard"}
                    >
                        {isCollapsed ?  '‹' : '›'}
                    </button>

        {/* Spring 2026 Toggle Switch - positioned to the LEFT of RIGHT dashboard */}
        <div 
            className="fixed top-[100px] z-20 transition-all duration-300"
            style={{
                right: isCollapsed ? '10px' : 'calc(20% + 10px)'
            }}
        >
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
                <label className="flex flex-col items-center cursor-pointer">
                    <span className="text-xs text-gray-300 mb-2 text-center whitespace-nowrap">Spring 2026</span>
                    <div className="relative">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={showOnlySpring2026}
                            onChange={handleToggleSpring2026}
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                </label>
            </div>
        </div>

        <div className={`dashboard h-[90%] fixed rounded-bl-2xl bg-gray-900 right-0 flex flex-col z-9 transition-all duration-300 overflow-hidden max-w-[360px] ${isCollapsed ? "w-0" : "w-1/5 min-w-[250px]"}`}>
            <div className="wrapper h-full w-full mx-auto px-2">
                <div className="flex items-center mt-8 px-2">
                    <button 
                        className="h-[40px] w-[40px] bg-gray-600 rounded-lg border border-gray-500 text-3xl text-white flex items-center justify-center transition-all duration-300 hover:bg-gray-500 mr-2"
                        onClick={handleButtonClick}
                        aria-label={isCollapsed ? "Expand dashboard" : "Collapse dashboard"}
                    >
                        {isCollapsed ? '‹': '›'}
                    </button>
                    
                    <input 
                        type="text" 
                        className="input w-full h-10 rounded-lg z-10 bg-gray-100 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setSearchTerm(e.target.value)}
                        value={searchTerm}
                        id="course-search"
                        placeholder="Course name or code"
                        disabled={showSuggestedOnly}
                    />
                </div>

                {/* Suggested Courses Button */}
                <div className="px-2 mt-2">
                    <button
                        onClick={toggleSuggestedFilter}
                        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                            showSuggestedOnly
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                    >
                        {showSuggestedOnly ? 'Stop Showing Suggestions' : 'Show Suggested Courses'}
                    </button>
                </div>

                <div className="cards flex flex-col w-full overflow-y-auto max-h-[calc(100vh-8rem)] mt-4 space-y-4 pb-24">
                    {filteredCards}
                </div>
            </div>
        </div>
        </>
    );
}