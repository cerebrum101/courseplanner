import React from "react";
import { useState, useEffect } from "react";
import courseDataJSON from '../data/courseData.json';

import '.././styles/index.css';

export default function CourseDashboard({ selctedCourseData, isVisible, onToggleVisibility, reverseDependencyMap, addedCardsCodes, setAddedCardsCodes }) {
    function handleButtonClick() {
        onToggleVisibility();
    }

    function handleAddCourse(courseCode) {
        if (!addedCardsCodes.includes(courseCode)) {
            setAddedCardsCodes([...addedCardsCodes, courseCode]);
        }
    }

    // Log reverse dependencies when a course is selected (for debugging)
    React.useEffect(() => {
        if (selctedCourseData && reverseDependencyMap) {
            const reverseDeps = reverseDependencyMap.get(selctedCourseData.courseCode);
            console.log(`[Reverse Dependencies] For course: ${selctedCourseData.courseCode}`, reverseDeps);
        }
    }, [selctedCourseData, reverseDependencyMap]);

    function handleCourseReqs(Course) {
        let prereqs = '';
        let coreqs = '';
        let antireqs = '';


        if (Course.prerequisites) {
        Course.prerequisites.forEach( el => {
            if( el.type === "or") {
                prereqs += el.courses.join(' [OR] ');
            } 
            if (el === "!PERM") {
                prereqs = `Instructor's Permission Required. Registration through Add Course form only!`;
            }
            else {
                prereqs = prereqs?  `${prereqs} [AND] ${el}` : `${el}`;
            }
        });
    }

        if (Course.corequisites) { 
        Course.corequisites.forEach( el => {
            if( el.type === "or") {
                coreqs += el.courses.join(' [OR] ');
            } 
            else {
                coreqs = coreqs?  `${coreqs} [AND] ${el}` : `${el}`;
            }
        });
    }

    if (Course.antirequisites) { 
        Course.antirequisites.forEach( el => {
            if( el.type === "or") {
                antireqs += el.courses.join(' [OR] ');
            } 
            else {
                antireqs = antireqs?  `${antireqs} [AND] ${el}` : `${el}`;
            }
        });
    }

        return [prereqs, coreqs, antireqs];
    }


    
    return (
        <>
            <button 
                className={`${!isVisible ? "block" : "hidden"} absolute left-[20px] top-[30px] z-20 h-[40px] w-[40px] bg-gray-600 rounded-lg border border-gray-500 text-3xl text-white flex items-center justify-center transition-all duration-300 hover:bg-gray-500 text-center`}
                onClick={handleButtonClick}
                aria-label={!isVisible ? "Expand course details" : "Collapse course details"}
            >
                {!isVisible ? '›' : '‹'}
            </button>

            <div className={`dashboard h-[80%] rounded-br-2xl fixed bg-gray-900 left-0 flex flex-col z-9 transition-all duration-300 overflow-hidden max-w-[360px] text-white ${!isVisible ? "w-0" : "min-w-[25%]"}`}>
                <div className="wrapper h-full w-[80%] mx-auto px-2 flex flex-col">            
                    <div className="flex items-center justify-between mt-6 px-2">
                        <h1 className="text-2xl font-semibold text-white">Course Details</h1>
                        <button 
                            className="h-[40px] w-[40px] bg-gray-600 rounded-lg border border-gray-500 text-3xl text-white flex items-center justify-center transition-all duration-300 hover:bg-gray-500"
                            onClick={handleButtonClick}
                            aria-label={!isVisible ? "Expand course details" : "Collapse course details"}
                        >
                            {!isVisible ? '›' : '‹'}
                        </button>
                    </div>

                    <div className="cards flex-col align-middle w-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 mt-3">  
                        {selctedCourseData ? (
                            <div className="bg-gray-800 p-4 mb-4 rounded-lg border border-gray-600 space-y-3">
                                <div className="flex flex-col space-y-2">
                                    <p className="text-blue-400 font-mono font-semibold">
                                        {selctedCourseData.courseCode}
                                    </p>
                                    <p className="text-white font-medium">
                                        {selctedCourseData.courseName}
                                    </p>
                                </div>
                                
                                <div className="space-y-2 text-gray-300 mb-2">
                                    <p className="flex flex-col">
                                        <span className="text-sm text-gray-400">School:</span>
                                        <span>{selctedCourseData.SCHOOL}</span>
                                    </p>
                                    <p className="flex flex-col">
                                        <span className="text-sm text-gray-400">Department:</span>
                                        <span>{selctedCourseData.DEPARTMENT}</span>
                                    </p>
                                    {/* <p className="flex flex-col">
                                        <span className="text-sm text-gray-400">Academic Level:</span>
                                        <span>{selctedCourseData.ACADEMICLEVEL}</span>
                                    </p> */}
                                    {/* <p className="flex flex-col">
                                        <span className="text-sm text-gray-400">Term:</span>
                                        <span>{selctedCourseData.TERMNAME}</span>
                                    </p> */}
                                    <p className="flex flex-col">
                                        <span className="text-sm text-gray-400">Prerequisites:</span>
                                        <span>{selctedCourseData.PREREQ || 'None'}</span>
                                    </p>
                                    <p className="flex flex-col">
                                        <span className="text-sm text-gray-400">Corequisites:</span>
                                        <span>{selctedCourseData.COREQ || 'None'}</span>
                                    </p>
                                    <p className="flex flex-col">
                                        <span className="text-sm text-gray-400">Antirequisites:</span>
                                        <span>{selctedCourseData.ANTIREQ || 'None'}</span>
                                    </p>
                                    <p className="flex flex-col">
                                        <span className="text-sm text-gray-400">Credits:</span>
                                        <span>{selctedCourseData.credits} ECTS</span>
                                    </p>
                                    {/* Reverse Dependencies */}
                                    {reverseDependencyMap && (() => {
                                        const reverseDeps = reverseDependencyMap.get(selctedCourseData.courseCode);
                                        if (!reverseDeps) return null;
                                        
                                        const renderCourseList = (courses) => {
                                            if (!courses || courses.length === 0) return <span>None</span>;
                                            
                                            return (
                                                <div className="flex flex-col gap-1">
                                                    {courses.map(courseCode => {
                                                        const isAdded = addedCardsCodes?.includes(courseCode);
                                                        return (
                                                            <div key={courseCode} className="flex items-center justify-between gap-2">
                                                                <span className="text-sm">{courseCode}</span>
                                                                <button
                                                                    onClick={() => handleAddCourse(courseCode)}
                                                                    disabled={isAdded}
                                                                    className={`px-2 py-0.5 text-xs rounded transition-colors ${
                                                                        isAdded 
                                                                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                                                                            : 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
                                                                    }`}
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
                                            <>
                                                <p className="flex flex-col">
                                                    <span className="text-sm text-gray-400">Is prerequisite to:</span>
                                                    {renderCourseList(reverseDeps.prerequisiteFor)}
                                                </p>
                                                <p className="flex flex-col">
                                                    <span className="text-sm text-gray-400">Is corequisite to:</span>
                                                    {renderCourseList(reverseDeps.corequisiteFor)}
                                                </p>
                                                <p className="flex flex-col">
                                                    <span className="text-sm text-gray-400">Is antirequisite to:</span>
                                                    {renderCourseList(reverseDeps.antirequisiteFor)}
                                                </p>
                                            </>
                                        );
                                    })()}
                                    <p className="flex flex-col">
                                        <span className="text-sm text-gray-400">Description:</span>
                                        <span className="text-sm">{selctedCourseData.SHORTDESC}</span>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center">No course selected</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}