import pandas as pd
import json
import os
import sys

def main():
    # Update this path if your file is saved somewhere else
    xlsx_path = os.path.expanduser('~/Desktop/course-planner/new-courseplanner/courseplanner/src/data/course_req.xlsx')
    
    if not os.path.exists(xlsx_path):
        print(f"❌ File not found at: {xlsx_path}")
        print("Please update the 'xlsx_path' variable in this script to point to your downloaded file.")
        sys.exit(1)

    print(f"📖 Reading XLSX file: {xlsx_path}")
    try:
        # Dynamically find the header row that contains 'Abbr'
        df_raw = pd.read_excel(xlsx_path, header=None)
        header_idx = df_raw[df_raw[1] == 'Abbr'].index[0]
        df = pd.read_excel(xlsx_path, header=header_idx)
        
        df.columns = df.columns.str.strip()
        fall_2026_courses = {}
        
        for _, row in df.iterrows():
            abbr = str(row.get('Abbr', '')).strip()
            
            # Skip department/school header rows
            skip_words = ['GSB', 'SoM', 'SSH', 'SoE', 'SMG', 'SCAI', 'Bachelor', 'Economics', 'Biological', 'Medical', 'Nursing', 'Chemistry', 'Communication', 'History', 'Kazakh', 'Languages', 'Political', 'Sociology', 'Computer', 'Mathematics', 'Robotics', 'Civil', 'Mechanical', 'Mining', 'Petroleum', 'Geosciences', 'Electrical']
            if not abbr or any(word in abbr for word in skip_words):
                continue
                
            # Handle multiple courses in one cell (e.g., "CSCI 115 / CSCI 151")
            courses = [c.strip() for c in str(abbr).split('/')]
            
            for code in courses:
                # Basic validation: should look like a course code (e.g., "CSCI 101")
                if len(code) >= 6 and any(char.isdigit() for char in code):
                    fall_2026_courses[code] = {
                        'available': True,
                        'priorities': {
                            'priority1': str(row.get('1st priority registration', '')).strip(),
                            'priority2': str(row.get('2nd priority registration', '')).strip(),
                            'priority3': str(row.get('3rd priority registration', '')).strip(),
                            'priority4': str(row.get('4th priority registration', '')).strip()
                        }
                    }
                    
        print(f"✅ Found {len(fall_2026_courses)} unique Fall 2026 courses.")
        
    except Exception as e:
        print(f"❌ Error reading XLSX: {e}")
        sys.exit(1)

    # Locate courseData.json
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, '..', 'src', 'data', 'courseData.json')
    
    if not os.path.exists(json_path):
        print(f"❌ Could not find courseData.json at {json_path}")
        sys.exit(1)
        
    print(f"💾 Updating {json_path}...")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    courses = data.get("coursesData", [])
    updated_count = 0
    
    for course in courses:
        code = course.get("courseCode", "")
        if code in fall_2026_courses:
            course["AVAILABLE_FALL_2026"] = True
            course["FALL_2026_PRIORITIES"] = fall_2026_courses[code]["priorities"]
            updated_count += 1
        else:
            course["AVAILABLE_FALL_2026"] = False
            course["FALL_2026_PRIORITIES"] = None
            
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"🎉 Done! Marked {updated_count} courses as AVAILABLE_FALL_2026.")

if __name__ == "__main__":
    main()