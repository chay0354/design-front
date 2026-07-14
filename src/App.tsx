import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { AboutPage } from './pages/AboutPage'
import { AccountPage } from './pages/AccountPage'
import { AdminCollagePage } from './pages/AdminCollagePage'
import { AdminPage } from './pages/AdminPage'
import { LandingPage } from './pages/LandingPage'
import { PackageDetailPage } from './pages/PackageDetailPage'
import { PackagePreviewPage } from './pages/PackagePreviewPage'
import { LoginPage } from './pages/LoginPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { QuestionnairePage } from './pages/QuestionnairePage'
import { PrivacyPage } from './pages/PrivacyPage'
import { TermsPage } from './pages/TermsPage'
import { TipsPage } from './pages/TipsPage'
import { BlockAdmin, RequireAdmin, RequireUser } from './components/RouteGuards'

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-[#FDFCFB] text-[#4A4A4A]">
            <Routes>
            <Route
              path="/"
              element={
                <BlockAdmin>
                  <LandingPage />
                </BlockAdmin>
              }
            />
            <Route
              path="/questionnaire"
              element={
                <BlockAdmin>
                  <QuestionnairePage />
                </BlockAdmin>
              }
            />
            <Route
              path="/preview/recommended"
              element={
                <BlockAdmin>
                  <PackagePreviewPage />
                </BlockAdmin>
              }
            />
            <Route
              path="/about"
              element={
                <BlockAdmin>
                  <AboutPage />
                </BlockAdmin>
              }
            />
            <Route
              path="/login"
              element={
                <BlockAdmin>
                  <LoginPage />
                </BlockAdmin>
              }
            />
            <Route
              path="/account"
              element={
                <RequireUser>
                  <AccountPage />
                </RequireUser>
              }
            />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/collage"
              element={
                <RequireAdmin>
                  <AdminCollagePage />
                </RequireAdmin>
              }
            />
            <Route
              path="/package/:packageId"
              element={
                <RequireUser>
                  <PackageDetailPage />
                </RequireUser>
              }
            />
            <Route
              path="/tips"
              element={
                <BlockAdmin>
                  <TipsPage />
                </BlockAdmin>
              }
            />
            <Route
              path="/terms"
              element={
                <BlockAdmin>
                  <TermsPage />
                </BlockAdmin>
              }
            />
            <Route
              path="/privacy"
              element={
                <BlockAdmin>
                  <PrivacyPage />
                </BlockAdmin>
              }
            />
            <Route
              path="/checkout/:packageId"
              element={
                <RequireUser>
                  <CheckoutPage />
                </RequireUser>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  )
}
