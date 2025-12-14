#!/usr/bin/env python3
"""
Adds Spring 2026 availability and priority data to courseData.json
Processes the CSV file with course offerings and registration priorities
"""

import json
import csv
import os
import sys

def parse_course_code(abbr):
    """
    Parse course code(s) from the Abbr column.
    Handles cross-listings like "WLL 235/WCS 260"
    Returns list of course codes
    """
    if not abbr or abbr.strip() == '':
        return []
    
    # Split by '/' for cross-listed courses
    codes = abbr.split('/')
    # Clean up whitespace
    codes = [code.strip() for code in codes]
    return codes

def parse_priority(priority_text):
    """
    Parse and clean priority text.
    Returns cleaned string or empty string if no priority.
    """
    if not priority_text or priority_text.strip() == '':
        return ''
    
    # Clean up the text
    cleaned = priority_text.strip()
    
    # Remove "Instructor's Permission Required..." text as it's not a priority group
    if "Instructor's Permission Required" in cleaned:
        return ''
    
    return cleaned

def add_spring_2026_data(csv_file_path, json_file_path, output_file_path):
    """
    Main function to add Spring 2026 data to courseData.json
    """
    
    print(f"📖 Reading CSV file: {csv_file_path}")
    
    # Read CSV and build map of Spring 2026 courses
    spring_2026_courses = {}
    
    try:
        with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            
            for row in reader:
                abbr = row.get('Abbr', '')
                course_codes = parse_course_code(abbr)
                
                if not course_codes:
                    continue
                
                # Parse priorities
                priority_data = {
                    'priority1': parse_priority(row.get('1st priority registration', '')),
                    'priority2': parse_priority(row.get('2nd priority registration', '')),
                    'priority3': parse_priority(row.get('3rd priority registration', '')),
                    'priority4': parse_priority(row.get('4th priority registration', ''))
                }
                
                # Add entry for each course code (handles cross-listings)
                for code in course_codes:
                    spring_2026_courses[code] = {
                        'available': True,
                        'priorities': priority_data
                    }
        
        print(f"✓ Found {len(spring_2026_courses)} unique course codes in CSV")
        
    except FileNotFoundError:
        print(f"❌ Error: CSV file not found: {csv_file_path}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error reading CSV: {e}")
        sys.exit(1)
    
    # Read courseData.json
    print(f"\n📖 Reading JSON file: {json_file_path}")
    
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"❌ Error: JSON file not found: {json_file_path}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error reading JSON: {e}")
        sys.exit(1)
    
    courses = data.get('coursesData', [])
    print(f"✓ Loaded {len(courses)} courses from JSON")
    
    # Update courses with Spring 2026 data
    print("\n🔄 Adding Spring 2026 availability and priorities...")
    
    available_count = 0
    not_available_count = 0
    
    for course in courses:
        course_code = course.get('courseCode', '')
        
        if course_code in spring_2026_courses:
            # Course is available in Spring 2026
            course['AVAILABLE_SPRING_2026'] = True
            course['SPRING_2026_PRIORITIES'] = spring_2026_courses[course_code]['priorities']
            available_count += 1
        else:
            # Course is NOT available in Spring 2026
            course['AVAILABLE_SPRING_2026'] = False
            course['SPRING_2026_PRIORITIES'] = None
            not_available_count += 1
    
    print(f"✓ Marked {available_count} courses as AVAILABLE")
    print(f"✓ Marked {not_available_count} courses as NOT AVAILABLE")
    
    # Write updated data
    print(f"\n💾 Writing updated data to: {output_file_path}")
    
    try:
        with open(output_file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print("✅ Done! Spring 2026 data added successfully.")
    except Exception as e:
        print(f"❌ Error writing JSON: {e}")
        sys.exit(1)
    
    # Print some statistics
    print("\n📊 Statistics:")
    print(f"   Total courses in database: {len(courses)}")
    print(f"   Available in Spring 2026: {available_count} ({available_count/len(courses)*100:.1f}%)")
    print(f"   Not available: {not_available_count} ({not_available_count/len(courses)*100:.1f}%)")
    
    # Show sample of courses with priorities
    print("\n📝 Sample courses with priorities:")
    sample_count = 0
    for course in courses:
        if course.get('AVAILABLE_SPRING_2026') and sample_count < 3:
            priorities = course.get('SPRING_2026_PRIORITIES', {})
            if priorities and any(priorities.values()):
                print(f"\n   {course.get('courseCode', 'N/A')} - {course.get('courseName', 'N/A')}")
                for i in range(1, 5):
                    priority_val = priorities.get(f'priority{i}', '')
                    if priority_val:
                        print(f"      Priority {i}: {priority_val[:60]}{'...' if len(priority_val) > 60 else ''}")
                sample_count += 1

if __name__ == '__main__':
    # Set up paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    # Check for --yes flag
    auto_confirm = '--yes' in sys.argv or '-y' in sys.argv
    
    # Default paths
    csv_file = os.path.join(os.path.expanduser('~'), 'Downloads', 
                            'Course Requirements and Registration Priorities- (Undergraduate), Spring 2026 - Table 1.csv')
    json_file = os.path.join(project_root, 'src', 'data', 'courseData.json')
    output_file = json_file  # Overwrite the original
    
    # Allow custom paths from command line (filter out flags)
    args = [arg for arg in sys.argv[1:] if not arg.startswith('-')]
    if len(args) > 0:
        csv_file = args[0]
    if len(args) > 1:
        json_file = args[1]
    if len(args) > 2:
        output_file = args[2]
    
    # Verify files exist
    if not os.path.exists(csv_file):
        print(f"❌ Error: CSV file not found: {csv_file}")
        print(f"\n💡 Usage: python {sys.argv[0]} [csv_file] [json_file] [output_file]")
        sys.exit(1)
    
    if not os.path.exists(json_file):
        print(f"❌ Error: JSON file not found: {json_file}")
        sys.exit(1)
    
    # Confirm before overwriting
    if output_file == json_file and not auto_confirm:
        print("⚠️  This will overwrite courseData.json with Spring 2026 data.")
        response = input("   Continue? (y/n): ")
        if response.lower() != 'y':
            print("Cancelled.")
            sys.exit(0)
    
    # Run the script
    add_spring_2026_data(csv_file, json_file, output_file)

