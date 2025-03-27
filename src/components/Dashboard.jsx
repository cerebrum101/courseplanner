import React from "react";
import { useState, useEffect } from "react";
import courseDataJSON from '../data/completeCourses1.json';

import '../styles/index.css';


function Card({ code, name, credits, isAdded, toggleButton }) {
    return (
      <div className="card p-4 my-5 bg-gray-800 border-gray-600 border-2 rounded flex-col">
        <div className="card-info">
          <p className="card-code text-blue-600 font-mono">{code}</p>
          <p className="card-name text-white">{name}</p>
          <p className="card-credits text-yellow-400">{credits}</p>
        </div>
        <button 
          className={`px-4 py-2 mt-3 w-auto h-10 rounded transition-colors ${isAdded ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
          onClick={() => toggleButton(code)}
        //   code={code}
          aria-label={isAdded ? `Remove ${name}` : `Add ${name}`}
          aria-pressed={isAdded}
        >
          {isAdded ? 'Remove' : 'Add'}
        </button>
      </div>
    );
  }

export default function Dashboard({addedCards, setAddedCards}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // const [addedCards, setAddedCards] = useState([])


    function handleButtonClick() {
        setIsCollapsed((isCollapsed) => !isCollapsed);
    }

    function handleToggleCard(code) {
          if (!(addedCards.includes(code)))
          {
            setAddedCards([...addedCards, code])
          }
          else {
            setAddedCards(addedCards.filter(courseCode => courseCode !== code))
          }

    }


    const filteredCards = courseDataJSON.coursesData
    .filter(course => 
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||  
        course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()))
    .map((el) => (
        <Card 
            key={el.courseCode}
            code={el.courseCode}
            name={el.courseName}
            credits={el.credits || "6/8"}  
            isAdded={ addedCards.includes((el.courseCode))}
            toggleButton={handleToggleCard}
        />
    ));


    return (
        <>
            <button className={`button absolute top-5 right-20 h-20 w-10 bg-gray-400 z-10 rounded border-black border-1 text-3xl transition-all duration-300 overflow-hidden ${ isCollapsed ? "right-[20px]" : "right-[calc(20%+2.5rem)]" }`} 
                onClick={handleButtonClick}>
                    {isCollapsed ? '‹' : '›'}
                    
            </button>

            <div className={`dashboard h-screen absolute bg-gray-900 right-0 flex-col z-9 justify-items-center transition-all duration-300 overflow-hidden ${ isCollapsed ? "w-0" : "min-w-[20%] w-1/5" }`}>
            <div className="wrapper h-full w-[80%]">
            <input 
                type="text" 
                className="input w-full h-[2rem] mx-auto mt-[2rem] rounded z-10 bg-white"
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
                id="course-search"
            />

                <div className="cards flex-col align-middle w-full max-h-none">  
            

                    <div className="cards flex-col w-full overflow-y-scroll max-h-[calc(100vh-5rem)] ">
                        {filteredCards}
                    </div>

                </div>

                </div>
            </div>
          
        </>

    );
}


