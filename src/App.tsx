import { PayrollProvider, usePayroll } from './context/PayrollContext'
import FileUploadContainer from './components/upload/FileUploadContainer'
import Dashboard from './components/dashboard/Dashboard'

function AppContent() {
  const { currentView } = usePayroll() as { currentView: 'upload' | 'dashboard' }
  return (
    <div className="min-h-screen">
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
