import { useEffect, useMemo, useState } from 'react';
import Dashboard from './components/Dashboard.jsx'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './styles/index.css';
import courseDataJSON from './data/completeCourses1.json';

type CourseNode = Node & {
  data: {
    label: string;
  };
};

interface CoursePrereq {
  courseCode: string;
  courseName: string;
  gradeRequired: string;
}

interface Course {
  courseCode: string;
  courseName: string;
  prerequisites: Array<CoursePrereq | string>;
  corequisites: any[];
  antirequisites: any[];
}

// interface CoursesData {
//   coursesData: Course[];
// }

export default function UserPlanPage() {
  const [addedCardsCodes, setAddedCardsCodes] = useState<string[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<CourseNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Create a course map for quick lookup
  const courseMap = useMemo(() => {
    const map = new Map<string, Course>();
    courseDataJSON.coursesData.forEach(course => {
      map.set(course.courseCode, course);
    });
    return map;
  }, []);

  // Update nodes when addedCardsCodes changes
  useMemo(() => {
    setNodes(addedCardsCodes.map((code) => {
      // Try to find existing node to preserve its position
      const existingNode = nodes.find(n => n.id === code);
      
      return {
        id: code,
        position: existingNode?.position || { x: 0, y: 0 }, // Use existing position or default
        data: { label: code },
        draggable: true,
        type: 'default'
      } as CourseNode;
    }));
  }, [addedCardsCodes]); // Only trigger when addedCardsCodes changes
  // Generate edges based on prerequisites
  useEffect(() => {
    const newEdges: Edge[] = [];
    
    addedCardsCodes.forEach(courseCode => {
      const course = courseMap.get(courseCode);
      if (!course) return;

      // Process prerequisites
      course.prerequisites.forEach(prereq => {
        // Skip string prerequisites (like "!PERM")
        if (typeof prereq !== 'object') return;
        
        const prereqCode = prereq.courseCode;
        if (addedCardsCodes.includes(prereqCode)) {
          newEdges.push({
            id: `${prereqCode}->${courseCode}`,
            source: prereqCode,
            target: courseCode,
            type: 'default',
            style: { stroke: '#3b82f6' }, // Blue for prerequisites
            markerEnd: 'arrowclosed'
          });
        }
      });
    });

    setEdges(newEdges);
  }, [addedCardsCodes, courseMap, setEdges]);

  // Clean up edges when courses are removed
  useEffect(() => {
    setEdges(edges => edges.filter(edge => 
      addedCardsCodes.includes(edge.source) && 
      addedCardsCodes.includes(edge.target)
    ));
  }, [addedCardsCodes]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
      nodesDraggable={true}
    >
      <Background />
      <Controls />
      <Dashboard 
        addedCardsCodes={addedCardsCodes}
        setAddedCardsCodes={setAddedCardsCodes}
      />
    </ReactFlow>
  );
}