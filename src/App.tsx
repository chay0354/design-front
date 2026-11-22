import { useLayoutEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { AboutPage } from './pages/AboutPage'
import { FaqPage } from './pages/FaqPage'
import { AccountPage } from './pages/AccountPage'
import { AccountGrowPage } from './pages/AccountGrowPage'
import { AccountRoomsPage } from './pages/AccountRoomsPage'
import { AdminCollagePage } from './pages/AdminCollagePage'
import { CollageViewPage } from './pages/CollageViewPage'
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
import { ConsentBanner } from './components/ConsentBanner'
import { GiftVoucherPage } from './pages/GiftVoucherPage'
import { GiftVoucherViewPage } from './pages/GiftVoucherViewPage'
import { GiftRedeemPage } from './pages/GiftRedeemPage'
import { GuidePage } from './pages/GuidePage'
import { captureReferralFromUrl } from './utils/tracking'

captureReferralFromUrl()

function ScrollToTop() {
  const { pathname, search } = useLocation()
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname, search])
  return null
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <ScrollToTop />
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
              path="/faq"
              element={
                <BlockAdmin>
                  <FaqPage />
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
              path="/account/grow"
              element={
                <RequireUser>
                  <AccountGrowPage />
                </RequireUser>
              }
            />
            <Route
              path="/account/rooms"
              element={
                <RequireUser>
                  <AccountRoomsPage />
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
              path="/collage/:collageId"
              element={<CollageViewPage />}
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
            <Route
              path="/gift"
              element={
                <BlockAdmin>
                  <GiftVoucherPage />
                </BlockAdmin>
              }
            />
            <Route
              path="/gift/voucher/:voucherId"
              element={
                <RequireUser>
                  <GiftVoucherViewPage />
                </RequireUser>
              }
            />
            <Route
              path="/gift/redeem/:code"
              element={
                <BlockAdmin>
                  <GiftRedeemPage />
                </BlockAdmin>
              }
            />
            <Route
              path="/guides/:guideId"
              element={
                <RequireUser>
                  <GuidePage />
                </RequireUser>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ConsentBanner />
          </div>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  )
}
