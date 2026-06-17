import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AppFrame } from './components/Layout/AppFrame';
import { Dashboard } from './routes/Dashboard';
import { RuleEditor } from './routes/RuleEditor';
import  ActivityLog from './routes/ActivityLog';
import { Settings } from './routes/Settings';
import { GroupBuysList } from './routes/GroupBuysList';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <AppFrame>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/group-buys" element={<GroupBuysList />} />
          <Route path="/group-buys/new" element={<RuleEditor />} />
          <Route path="/group-buys/:id/edit" element={<RuleEditor />} />
          <Route path="/activity" element={<ActivityLog />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppFrame>
    </BrowserRouter>
  );
}