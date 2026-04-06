/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import BoardView from './pages/BoardView';
import CalendarView from './pages/CalendarView';
import ClientsView from './pages/ClientsView';
import TaskDetails from './pages/TaskDetails';
import FinanceView from './pages/FinanceView';
import SettingsView from './pages/SettingsView';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="board" element={<BoardView />} />
              <Route path="calendar" element={<CalendarView />} />
              <Route path="clients" element={<ClientsView />} />
              <Route path="finance" element={<FinanceView />} />
              <Route path="settings" element={<SettingsView />} />
              <Route path="tasks/:id" element={<TaskDetails />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}
