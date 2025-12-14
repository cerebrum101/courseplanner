# Course Data Preprocessing Scripts

These scripts preprocess `courseData.json` to add reverse dependency fields, eliminating the need for runtime computation.

## What It Does

Adds three new fields to each course:
- **`ISPREREQTO`**: Array of courses that require this course as a prerequisite
- **`ISCOREQTO`**: Array of courses that require this course as a corequisite  
- **`ISANTIREQTO`**: Array of courses that list this course as an antirequisite

## Why?

**Before:** Runtime computation using `buildReverseDependencyMap()` - iterates through all courses on app load  
**After:** Direct JSON reads - TRUE O(1) lookups with ZERO computation! 🚀

## Usage

Choose your preferred language:

### Option 1: Node.js (Recommended - No Dependencies)

```bash
node scripts/preprocessCourseData.js
```

### Option 2: Python

```bash
python3 scripts/preprocessCourseData.py
```

### Option 3: TypeScript (Requires ts-node)

```bash
npx ts-node scripts/preprocessCourseData.ts
```

## What Happens

1. Reads `src/data/courseData.json`
2. Builds reverse dependency maps
3. Adds `ISPREREQTO`, `ISCOREQTO`, `ISANTIREQTO` fields to each course
4. Overwrites `courseData.json` with the enhanced data
5. Shows statistics

## Example Output

```
📖 Reading src/data/courseData.json...
✓ Loaded 6234 courses
🔄 Building reverse dependency maps...
✓ Reverse dependency maps built
📝 Adding reverse dependency fields to courses...
✓ Reverse dependency fields added

📊 Statistics:
   Courses used as prerequisites: 1234
   Courses used as corequisites: 234
   Courses used as antirequisites: 123

💾 Writing to src/data/courseData.json...
✅ Done! Course data preprocessed successfully.
   Now you have TRUE O(1) lookups with no runtime computation! 🚀
```

## Before & After

### Before (Original JSON):
```json
{
  "courseCode": "CS 101",
  "courseName": "Intro to CS",
  "PREREQNEW": "",
  "COREQNEW": "",
  "ANTIREQNEW": ""
}
```

### After (Preprocessed JSON):
```json
{
  "courseCode": "CS 101",
  "courseName": "Intro to CS",
  "PREREQNEW": "",
  "COREQNEW": "",
  "ANTIREQNEW": "",
  "ISPREREQTO": ["CS 201", "CS 202", "CS 301"],
  "ISCOREQTO": [],
  "ISANTIREQTO": []
}
```

## Next Steps After Running

1. Update `CourseDashboard.jsx` to read from these fields directly instead of using `reverseDependencyMap`
2. Remove the `useReverseDependencyMap` hook (no longer needed!)
3. Remove `reverseDependencies.ts` utility (no longer needed!)
4. Enjoy instant O(1) lookups! 🎉

## Safety

⚠️ The script **overwrites** `courseData.json`. Make sure you have:
- A backup copy
- Version control (git)
- Or run on a copy first

## Maintenance

Run this script whenever:
- Course prerequisites change
- New courses are added
- Course relationships are updated

It only takes a few seconds to regenerate!

