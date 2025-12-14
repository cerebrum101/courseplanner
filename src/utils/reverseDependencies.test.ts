import { buildReverseDependencyMap } from './reverseDependencies';
import { Course } from '../atoms/types/course.types';

/**
 * Simple test/verification script for reverse dependencies
 * Run this to verify the logic works as expected
 */

// Sample test data
const testCourses: Course[] = [
  {
    courseCode: 'CS 101',
    courseName: 'Intro to CS',
    credits: 3,
    prerequisites: [],
    corequisites: [],
    antirequisites: [],
    PREREQNEW: '',
    COREQNEW: '',
    ANTIREQNEW: '',
  },
  {
    courseCode: 'CS 201',
    courseName: 'Data Structures',
    credits: 3,
    prerequisites: ['CS 101'],
    corequisites: [],
    antirequisites: [],
    PREREQNEW: '%CS 101%',
    COREQNEW: '',
    ANTIREQNEW: '',
  },
  {
    courseCode: 'CS 301',
    courseName: 'Algorithms',
    credits: 3,
    prerequisites: [],
    corequisites: [],
    antirequisites: [],
    PREREQNEW: '%CS 201%',
    COREQNEW: '',
    ANTIREQNEW: '',
  },
  {
    courseCode: 'CS 202',
    courseName: 'Computer Organization',
    credits: 3,
    prerequisites: [],
    corequisites: [],
    antirequisites: [],
    PREREQNEW: '%CS 101%',
    COREQNEW: '',
    ANTIREQNEW: '',
  },
];

// Run test
export const testReverseDependencies = () => {
  console.log('=== Testing Reverse Dependencies ===\n');
  
  const reverseMap = buildReverseDependencyMap(testCourses);
  
  console.log('Test 1: CS 101 should be prerequisite for CS 201 and CS 202');
  const cs101Deps = reverseMap.get('CS 101');
  console.log('CS 101 is prerequisite for:', cs101Deps?.prerequisiteFor);
  console.log('Expected: ["CS 201", "CS 202"]');
  console.log('Pass:', JSON.stringify(cs101Deps?.prerequisiteFor) === JSON.stringify(['CS 201', 'CS 202']));
  
  console.log('\nTest 2: CS 201 should be prerequisite for CS 301');
  const cs201Deps = reverseMap.get('CS 201');
  console.log('CS 201 is prerequisite for:', cs201Deps?.prerequisiteFor);
  console.log('Expected: ["CS 301"]');
  console.log('Pass:', JSON.stringify(cs201Deps?.prerequisiteFor) === JSON.stringify(['CS 301']));
  
  console.log('\nTest 3: CS 301 should not be prerequisite for any course');
  const cs301Deps = reverseMap.get('CS 301');
  console.log('CS 301 is prerequisite for:', cs301Deps?.prerequisiteFor);
  console.log('Expected: []');
  console.log('Pass:', cs301Deps?.prerequisiteFor.length === 0);
  
  console.log('\n=== Test Complete ===');
};

// Uncomment to run:
// testReverseDependencies();

