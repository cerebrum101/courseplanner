#!/usr/bin/env python3
"""
Preprocesses courseData.json to add reverse dependency fields:
- ISPREREQTO: List of courses that require this course as a prerequisite
- ISCOREQTO: List of courses that require this course as a corequisite
- ISANTIREQTO: List of courses that list this course as an antirequisite

This eliminates the need for runtime computation - truly O(1) lookups!
"""

import json
import re
from collections import defaultdict

def extract_course_codes_from_string(req_string):
    """Extract course codes from %COURSE% format."""
    if not req_string:
        return []
    matches = re.findall(r'%([^%]+)%', req_string)
    return [match.strip() for match in matches]

def extract_course_codes_from_array(req_array):
    """Extract course codes from legacy array format."""
    if not req_array:
        return []
    
    codes = []
    for item in req_array:
        if isinstance(item, str):
            # Skip special markers like !PERM
            if not item.startswith('!'):
                codes.append(item.strip())
        elif isinstance(item, dict) and 'courses' in item:
            # Handle OR groups: { type: 'or', courses: [...] }
            codes.extend([c.strip() for c in item['courses']])
    
    return codes

def preprocess_course_data(input_file, output_file):
    """Add reverse dependency fields to course data."""
    
    print(f"📖 Reading {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    courses = data['coursesData']
    print(f"✓ Loaded {len(courses)} courses")
    
    # Build reverse dependency maps
    print("🔄 Building reverse dependency maps...")
    prereq_map = defaultdict(list)
    coreq_map = defaultdict(list)
    antireq_map = defaultdict(list)
    
    for course in courses:
        course_code = course.get('courseCode')
        if not course_code:
            continue
        
        # Extract prerequisites
        prereq_codes = []
        if course.get('PREREQNEW'):
            prereq_codes = extract_course_codes_from_string(course['PREREQNEW'])
        elif course.get('prerequisites'):
            prereq_codes = extract_course_codes_from_array(course['prerequisites'])
        
        for prereq in prereq_codes:
            if prereq and prereq not in prereq_map[prereq]:
                prereq_map[prereq].append(course_code)
        
        # Extract corequisites
        coreq_codes = []
        if course.get('COREQNEW'):
            coreq_codes = extract_course_codes_from_string(course['COREQNEW'])
        elif course.get('corequisites'):
            coreq_codes = extract_course_codes_from_array(course['corequisites'])
        
        for coreq in coreq_codes:
            if coreq and coreq not in coreq_map[coreq]:
                coreq_map[coreq].append(course_code)
        
        # Extract antirequisites
        antireq_codes = []
        if course.get('ANTIREQNEW'):
            antireq_codes = extract_course_codes_from_string(course['ANTIREQNEW'])
        elif course.get('antirequisites'):
            antireq_codes = extract_course_codes_from_array(course['antirequisites'])
        
        for antireq in antireq_codes:
            if antireq and antireq not in antireq_map[antireq]:
                antireq_map[antireq].append(course_code)
    
    print("✓ Reverse dependency maps built")
    
    # Add reverse dependency fields to each course
    print("📝 Adding reverse dependency fields to courses...")
    for course in courses:
        course_code = course.get('courseCode')
        if not course_code:
            continue
        
        # Sort for consistent ordering
        course['ISPREREQTO'] = sorted(prereq_map.get(course_code, []))
        course['ISCOREQTO'] = sorted(coreq_map.get(course_code, []))
        course['ISANTIREQTO'] = sorted(antireq_map.get(course_code, []))
    
    print("✓ Reverse dependency fields added")
    
    # Statistics
    prereq_count = sum(1 for v in prereq_map.values() if v)
    coreq_count = sum(1 for v in coreq_map.values() if v)
    antireq_count = sum(1 for v in antireq_map.values() if v)
    
    print(f"\n📊 Statistics:")
    print(f"   Courses used as prerequisites: {prereq_count}")
    print(f"   Courses used as corequisites: {coreq_count}")
    print(f"   Courses used as antirequisites: {antireq_count}")
    
    # Write output
    print(f"\n💾 Writing to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print("✅ Done! Course data preprocessed successfully.")
    print(f"   Now you have TRUE O(1) lookups with no runtime computation! 🚀")

if __name__ == '__main__':
    import sys
    import os
    
    # Default paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    input_file = os.path.join(project_root, 'src', 'data', 'courseData.json')
    output_file = input_file  # Overwrite the original file
    
    # Allow custom paths from command line
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    if len(sys.argv) > 2:
        output_file = sys.argv[2]
    
    if not os.path.exists(input_file):
        print(f"❌ Error: Input file not found: {input_file}")
        sys.exit(1)
    
    # Confirm before overwriting
    if input_file == output_file:
        response = input(f"⚠️  This will overwrite {input_file}. Continue? (y/n): ")
        if response.lower() != 'y':
            print("Cancelled.")
            sys.exit(0)
    
    preprocess_course_data(input_file, output_file)

