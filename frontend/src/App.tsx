import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { OnboardingPage } from './pages/OnboardingPage'
import { DashboardPage } from './pages/DashboardPage'
import { CoachPage } from './pages/CoachPage'
import { useFitGuideStore } from './store/fitguide.store'
import './styles/globals.css'

export default function App() {
  const { plan } = useFitGuideStore()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OnboardingPage />} />
        <Route
          path="/dashboard"
          element={plan ? <DashboardPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/coach"
          element={plan ? <CoachPage /> : <Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}
