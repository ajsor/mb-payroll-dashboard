import React from 'react';
import { PayrollProvider, usePayroll } from './context/PayrollContext';
import FileUploadContainer from './components/upload/FileUploadContainer';
import Dashboard from './components/dashboard/Dashboard';
import './styles/Dashboard.css';

const AppContent = () => {
  const { currentView } = usePayroll();
  
  return (
    <div className="app">
      {currentView === 'upload' ? <FileUploadContainer /> : <Dashboard />}
    </div>
  );
};

const App = () => {
  return (
    <PayrollProvider>
      <AppContent />
    </PayrollProvider>
  );
};

export default App;