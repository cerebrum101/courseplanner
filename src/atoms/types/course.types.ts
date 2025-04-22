import { Node } from '@xyflow/react';

export type CourseNode = Node & {
  data: {
    label: string;
    name: string;
    onNodeClick: (nodeId: string) => void;
  };
};

export interface Course {
  COURSEID?: string;
  CRUS?: string;
  LASTTAUGHT?: string;
  SCHOOL?: string;
  SCHOOLABBR?: string;
  SCHOOLID?: string;
  DEPARTMENT?: string;
  SHORTDESC?: string;
  ACADEMICLEVEL?: string;
  ACADEMICLEVELID?: string;
  BREADTH?: string;
  CCDISPLAY?: string;
  TERMNAME?: string;
  RNO?: string;
  PREREQ?: string;
  COREQ?: string;
  ANTIREQ?: string;
  courseCode: string;
  courseName: string;
  credits: number;
  prerequisites: (string | { type: string; courses: string[] })[];
  corequisites: (string | { type: string; courses: string[] })[];
  antirequisites: (string | { type: string; courses: string[] })[];
} 