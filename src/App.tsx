import { PayrollProvider, usePayroll } from './context/PayrollContext'
import FileUploadContainer from './components/upload/FileUploadContainer'
import Dashboard from './components/dashboard/Dashboard'
import './styles/Dashboard.css'

function AppContent() {
  const { currentView } = usePayroll() as { currentView: 'upload' | 'dashboard' }
  return (
    <div className="app">
      {currentView === 'upload' ? <FileUploadContainer /> : <Dashboard />}
    </div>
  )
}

export default function App() {
  return (
    <PayrollProvider>
      <AppContent />
    </PayrollProvider>
  )
}
