import { Node } from '@xyflow/react';

export type CourseNode = Node & {
  data: {
    label: string;
    name: string;
    onNodeClick: (nodeId: string) => void;
  };
};

export interface RequirementItem {
  raw: string;
  codes: string[];
  grade: string | null;
  notes: { type: string; text?: string; subject?: string; from?: string; to?: string }[];
}

export interface ParsedRequirement {
  raw: string;
  alternatives: RequirementItem[][];
}

export interface Course {
  COURSEID?: string;
  courseId?: string;
  aliases?: string[];
  school?: string;
  schoolAbbr?: string;
  level?: string;
  creditsECTS?: string;
  description?: string;
  offeredTerms?: string[];
  lastTaughtTerm?: string;
  AVAILABLE_SPRING_2027?: boolean;
  legacy?: boolean;
  recent?: boolean;
  rawPrereq?: string;
  rawCoreq?: string;
  rawAntireq?: string;
  prerequisitesParsed?: ParsedRequirement;
  corequisitesParsed?: ParsedRequirement;
  antirequisitesParsed?: ParsedRequirement;
  ISPREREQTO?: string[];
  ISCOREQTO?: string[];
  ISANTIREQTO?: string[];
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
  PREREQNEW?: string;
  COREQNEW?: string;
  ANTIREQNEW?: string;
  courseCode: string;
  courseName: string;
  credits: number | string;
  prerequisites?: (string | { type: string; courses: string[] })[];
  corequisites?: (string | { type: string; courses: string[] })[];
  antirequisites?: (string | { type: string; courses: string[] })[];
} 
