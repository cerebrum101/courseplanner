import React, { useState, useEffect } from 'react';
import courseDataJSON from '../data/courseData.json';

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

export default function Dashboard({addedCardsCodes, setAddedCardsCodes}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    function handleButtonClick() {
        setIsCollapsed((isCollapsed) => !isCollapsed);
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

    const filteredCards = courseDataJSON.coursesData
    .filter(course => 
        course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) 
    )
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
        <button 
        className={`${isCollapsed ? "block": "hidden"} absolute right-[20px] top-[30px] z-20  h-[40px] w-[40px] bg-gray-600 rounded-lg border border-gray-500 text-3xl text-white flex items-center justify-center transition-all duration-300 hover:bg-gray-500 mr-2`}
                        onClick={handleButtonClick}
                        aria-label={isCollapsed ? "Expand dashboard" : "Collapse dashboard"}
                    >
                        {isCollapsed ?  '‹' : '›'}
                    </button>
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
                    />
                </div>

                <div className="cards flex flex-col w-full overflow-y-auto max-h-[calc(100vh-8rem)] mt-4 space-y-4 pb-12">
                    {filteredCards}
                </div>
            </div>
        </div>
        </>
    );
}