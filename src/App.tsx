import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AboutPage } from './pages/AboutPage'
import { LandingPage } from './pages/LandingPage'
import { PackagePreviewPage } from './pages/PackagePreviewPage'
import { LoginPage } from './pages/LoginPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { QuestionnairePage } from './pages/QuestionnairePage'
import { PrivacyPage } from './pages/PrivacyPage'
import { TermsPage } from './pages/TermsPage'
import { TipsPage } from './pages/TipsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/questionnaire" element={<QuestionnairePage />} />
        <Route path="/preview/recommended" element={<PackagePreviewPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account" element={<PlaceholderPage title="החשבון שלי" />} />
        <Route path="/tips" element={<TipsPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/checkout/:packageId" element={<PlaceholderPage title="תשלום" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
