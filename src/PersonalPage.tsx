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

const initialNodes = [
  {
    id: 'welcome-1',
    type: 'default',
    data: { label: 'made by @ataywork' },
    position: { x: 0, y: -100 },
    style: {
      background: 'transparent',
      border: 'none',
      color: '#9CA3AF', // gray-400
      fontSize: '0.875rem' // text-sm
    }
  },
  {
    id: 'welcome-2',
    type: 'default',
    data: { label: 'Search and add courses from the Dashboard' },
    position: { x: -200, y: 0 },
    style: {
      backgroundColor: 'rgba(31, 41, 55, 0.9)', // gray-900 with opacity
      color: 'white',
      border: '1px solid rgba(75, 85, 99, 0.5)', // gray-600 border
      borderRadius: '0.5rem', // rounded-lg
      padding: '0.75rem 1rem', // p-3
      width: '280px',
      fontSize: '0.875rem' // text-sm
    }
  },
  {
    id: 'welcome-3',
    type: 'default',
    data: { label: 'Prerequisites will automatically connect' },
    position: { x: 0, y: 100 },
    style: {
      backgroundColor: 'rgba(31, 41, 55, 0.9)',
      color: 'white',
      border: '1px solid rgba(75, 85, 99, 0.5)',
      borderRadius: '0.5rem',
      padding: '0.75rem 1rem',
      width: '280px',
      fontSize: '0.875rem'
    }
  }
];

export default function UserPlanPage() {
  const [addedCardsCodes, setAddedCardsCodes] = useState<string[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<CourseNode>(initialNodes);
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
    const courseNodes = addedCardsCodes.map((code) => {
      const existingNode = nodes.find(n => n.id === code);
      return {
        id: code,
        position: existingNode?.position || { 
          x: Math.random() * 500, 
          y: Math.random() * 500 
        },
        data: { label: code },
        draggable: true,
        type: 'default'
      } as CourseNode;
    });
    
    // Keep initial nodes and merge with course nodes
    setNodes([...initialNodes, ...courseNodes]);
  }, [addedCardsCodes]);
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