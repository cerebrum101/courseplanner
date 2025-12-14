#!/usr/bin/env ts-node
/**
 * Preprocesses courseData.json to add reverse dependency fields:
 * - ISPREREQTO: List of courses that require this course as a prerequisite
 * - ISCOREQTO: List of courses that require this course as a corequisite
 * - ISANTIREQTO: List of courses that list this course as an antirequisite
 * 
 * This eliminates the need for runtime computation - truly O(1) lookups!
 */

import * as fs from 'fs';
import * as path from 'path';

interface Course {
  courseCode?: string;
  PREREQNEW?: string;
  COREQNEW?: string;
  ANTIREQNEW?: string;
  prerequisites?: (string | { type: string; courses: string[] })[];
  corequisites?: (string | { type: string; courses: string[] })[];
  antirequisites?: (string | { type: string; courses: string[] })[];
  ISPREREQTO?: string[];
  ISCOREQTO?: string[];
  ISANTIREQTO?: string[];
  [key: string]: any;
}

interface CourseData {
  coursesData: Course[];
}

function extractCourseCodesFromString(reqString: string): string[] {
  if (!reqString) return [];
  const matches = reqString.match(/%([^%]+)%/g) || [];
  return matches.map(match => match.slice(1, -1).trim());
}

function extractCourseCodesFromArray(
  reqArray: (string | { type: string; courses: string[] })[]
): string[] {
  if (!reqArray) return [];
  
  const codes: string[] = [];
  
  reqArray.forEach(item => {
    if (typeof item === 'string') {
      // Skip special markers like !PERM
      if (!item.startsWith('!')) {
        codes.push(item.trim());
      }
    } else if (typeof item === 'object' && 'courses' in item) {
      // Handle OR groups: { type: 'or', courses: [...] }
      codes.push(...item.courses.map(c => c.trim()));
    }
  });
  
  return codes;
}

function preprocessCourseData(inputFile: string, outputFile: string): void {
  console.log(`📖 Reading ${inputFile}...`);
  
  const rawData = fs.readFileSync(inputFile, 'utf-8');
  const data: CourseData = JSON.parse(rawData);
  const courses = data.coursesData;
  
  console.log(`✓ Loaded ${courses.length} courses`);
  
  // Build reverse dependency maps
  console.log('🔄 Building reverse dependency maps...');
  
  const prereqMap = new Map<string, string[]>();
  const coreqMap = new Map<string, string[]>();
  const antireqMap = new Map<string, string[]>();
  
  courses.forEach(course => {
    const courseCode = course.courseCode;
    if (!courseCode) return;
    
    // Extract prerequisites
    let prereqCodes: string[] = [];
    if (course.PREREQNEW) {
      prereqCodes = extractCourseCodesFromString(course.PREREQNEW);
    } else if (course.prerequisites) {
      prereqCodes = extractCourseCodesFromArray(course.prerequisites);
    }
    
    prereqCodes.forEach(prereq => {
      if (!prereqMap.has(prereq)) {
        prereqMap.set(prereq, []);
      }
      const list = prereqMap.get(prereq)!;
      if (!list.includes(courseCode)) {
        list.push(courseCode);
      }
    });
    
    // Extract corequisites
    let coreqCodes: string[] = [];
    if (course.COREQNEW) {
      coreqCodes = extractCourseCodesFromString(course.COREQNEW);
    } else if (course.corequisites) {
      coreqCodes = extractCourseCodesFromArray(course.corequisites);
    }
    
    coreqCodes.forEach(coreq => {
      if (!coreqMap.has(coreq)) {
        coreqMap.set(coreq, []);
      }
      const list = coreqMap.get(coreq)!;
      if (!list.includes(courseCode)) {
        list.push(courseCode);
      }
    });
    
    // Extract antirequisites
    let antireqCodes: string[] = [];
    if (course.ANTIREQNEW) {
      antireqCodes = extractCourseCodesFromString(course.ANTIREQNEW);
    } else if (course.antirequisites) {
      antireqCodes = extractCourseCodesFromArray(course.antirequisites);
    }
    
    antireqCodes.forEach(antireq => {
      if (!antireqMap.has(antireq)) {
        antireqMap.set(antireq, []);
      }
      const list = antireqMap.get(antireq)!;
      if (!list.includes(courseCode)) {
        list.push(courseCode);
      }
    });
  });
  
  console.log('✓ Reverse dependency maps built');
  
  // Add reverse dependency fields to each course
  console.log('📝 Adding reverse dependency fields to courses...');
  
  courses.forEach(course => {
    const courseCode = course.courseCode;
    if (!courseCode) return;
    
    // Sort for consistent ordering
    course.ISPREREQTO = (prereqMap.get(courseCode) || []).sort();
    course.ISCOREQTO = (coreqMap.get(courseCode) || []).sort();
    course.ISANTIREQTO = (antireqMap.get(courseCode) || []).sort();
  });
  
  console.log('✓ Reverse dependency fields added');
  
  // Statistics
  const prereqCount = Array.from(prereqMap.values()).filter(v => v.length > 0).length;
  const coreqCount = Array.from(coreqMap.values()).filter(v => v.length > 0).length;
  const antireqCount = Array.from(antireqMap.values()).filter(v => v.length > 0).length;
  
  console.log('\n📊 Statistics:');
  console.log(`   Courses used as prerequisites: ${prereqCount}`);
  console.log(`   Courses used as corequisites: ${coreqCount}`);
  console.log(`   Courses used as antirequisites: ${antireqCount}`);
  
  // Write output
  console.log(`\n💾 Writing to ${outputFile}...`);
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf-8');
  
  console.log('✅ Done! Course data preprocessed successfully.');
  console.log('   Now you have TRUE O(1) lookups with no runtime computation! 🚀');
}

// Main execution
const scriptDir = __dirname;
const projectRoot = path.dirname(scriptDir);
const inputFile = path.join(projectRoot, 'src', 'data', 'courseData.json');
const outputFile = inputFile; // Overwrite the original file

if (!fs.existsSync(inputFile)) {
  console.error(`❌ Error: Input file not found: ${inputFile}`);
  process.exit(1);
}

console.log('⚠️  This will overwrite courseData.json with preprocessed data.');
console.log('   Make sure you have a backup if needed!\n');

preprocessCourseData(inputFile, outputFile);

