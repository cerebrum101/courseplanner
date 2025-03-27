import react from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AllCoursesView from './AllCoursesView.tsx'
import UserPlanPage from './PersonalPage.js'


// import {
//   ReactFlow,
//   Background,
//   Controls,
//   MiniMap,
//   addEdge,
//   useNodesState,
//   useEdgesState,
//   type OnConnect,
// } from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import './styles/index.css';

// import { courseNodes, nodeTypes } from './nodes';
// import { courseEdges, edgeTypes } from './edges';


export default function App() {


    return (
    <BrowserRouter> 
      <Routes>
        <Route path="/" element={<AllCoursesView />} />
        <Route path="personal" element={<UserPlanPage />} />
      </Routes>
    </BrowserRouter>
  );
}
