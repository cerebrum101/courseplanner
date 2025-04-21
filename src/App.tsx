import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import AllCoursesView from './archive/all-courses-view/AllCoursesView.tsx'
import UserPlanPage from './pages/PersonalPage.tsx'
import Hero from './pages/Hero.tsx'
import './styles/index.css';



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
    <Router> 
      <Routes>
        {/* <Route path="/all" element={<AllCoursesView />} /> */}
        <Route path="/planner" element={<UserPlanPage />} />
        <Route path="/" element={<Hero />} />
      </Routes>
    </Router>
  );
}
