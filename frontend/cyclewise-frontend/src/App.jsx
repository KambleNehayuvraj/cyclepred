import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { ToastContainer } from './components/common/Toast.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'

import LandingPage    from './pages/LandingPage.jsx'
import LoginPage      from './pages/LoginPage.jsx'
import RegisterPage   from './pages/RegisterPage.jsx'
import OnboardingPage from './pages/OnboardingPage.jsx'
import DashboardPage  from './pages/DashboardPage.jsx'
import PCOSPage       from './pages/PCOSResultPage.jsx'
import RecommendationsPage from './pages/RecommendationsPage.jsx'
import ReportAnalyzerPage from './pages/ReportAnalyzerPage.jsx'
import LowRiskPage      from './pages/lowrisk_page.jsx'
import ModerateRiskPage from './pages/moderaterisk_page.jsx'
import HighRiskPage     from './pages/high_risk.jsx'

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth()
  if (isAuthenticated) {
    return <Navigate to={user?.onboarding_completed ? '/dashboard' : '/onboarding'} replace />
  }
  return children
}

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/"         element={<LandingPage />} />
    <Route path="/login"    element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
    <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

    {/* Protected */}
    <Route path="/onboarding"    element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
    <Route path="/dashboard"     element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/pcos"          element={<ProtectedRoute><PCOSPage /></ProtectedRoute>} />

    {/* Placeholder routes for future pages */}
    <Route path="/recommendations" element={<RecommendationsPage />} />
    <Route path="/report" element={<ReportAnalyzerPage />} />
    <Route path="/lowrisk"      element={<LowRiskPage />} />
    <Route path="/moderaterisk" element={<ModerateRiskPage />} />
    <Route path="/highrisk"     element={<HighRiskPage />} />

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastContainer />
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
)

export default App
