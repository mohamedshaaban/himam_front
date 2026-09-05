import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import Layout from './components/Layout.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import RequireAdmin from './components/RequireAdmin.jsx'
import { Loading } from './components/PageState.jsx'

import Landing from './pages/Landing.jsx'
import Intro from './pages/Intro.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Home from './pages/Home.jsx'
import Progress from './pages/Progress.jsx'
import Books from './pages/Books.jsx'
import BookDetail from './pages/BookDetail.jsx'
import Read from './pages/Read.jsx'
import Quiz from './pages/Quiz.jsx'
import Badges from './pages/Badges.jsx'
import Certificates from './pages/Certificates.jsx'
import Honor from './pages/Honor.jsx'
import Notifications from './pages/Notifications.jsx'
import NotificationDetail from './pages/NotificationDetail.jsx'
import Account from './pages/Account.jsx'
import NotFound from './pages/NotFound.jsx'



/*
 * The admin area is loaded on demand.
 *
 * It pulls in AdminLTE and CKEditor, which together are larger than the entire
 * reader app. Importing them statically put both in the main bundle, so every
 * reader downloaded an editor and a dashboard theme they can never open.
 * Splitting here keeps the reader payload to what readers actually use.
 */
const AdminLogin = lazy(() => import('./admin/pages/Login.jsx'))
const AdminLayout = lazy(() => import('./admin/AdminLayout.jsx'))
const AdminDashboard = lazy(() => import('./admin/pages/Dashboard.jsx'))
const AdminLevels = lazy(() => import('./admin/pages/Levels.jsx'))
const AdminLocales = lazy(() => import('./admin/pages/Locales.jsx'))
const AdminBooks = lazy(() => import('./admin/pages/Books.jsx'))
const AdminBookEditor = lazy(() => import('./admin/pages/BookEditor.jsx'))
const AdminBadges = lazy(() => import('./admin/pages/Badges.jsx'))
const AdminAnnouncements = lazy(() => import('./admin/pages/Announcements.jsx'))
const AdminSlides = lazy(() => import('./admin/pages/Slides.jsx'))
const AdminCertificates = lazy(() => import('./admin/pages/Certificates.jsx'))
const AdminUsers = lazy(() => import('./admin/pages/Users.jsx'))
const AdminPages = lazy(() => import('./admin/pages/Pages.jsx'))
const AdminFaqs = lazy(() => import('./admin/pages/Faqs.jsx'))
const AdminContact = lazy(() => import('./admin/pages/Contact.jsx'))

export default function App() {
  return (
    <Routes>
      {/* Reader-facing app */}
      <Route element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="intro" element={<Intro />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Browsable without an account so the catalogue can be previewed. */}
        <Route path="books" element={<Books />} />
        <Route path="books/:bookId" element={<BookDetail />} />
        <Route path="badges" element={<Badges />} />
        <Route path="honor" element={<Honor />} />

        <Route element={<RequireAuth />}>
          <Route path="home" element={<Home />} />
          <Route path="progress" element={<Progress />} />
          <Route path="sections/:sectionId" element={<Read />} />
          <Route path="sections/:sectionId/quiz" element={<Quiz />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="notifications/:announcementId" element={<NotificationDetail />} />
          <Route path="account" element={<Account />} />
        </Route>
      </Route>

      {/* The dashboard's own sign-in. Outside RequireAdmin, since guarding it
          would redirect to itself. */}
      <Route
        path="admin/login"
        element={<Suspense fallback={<Loading />}><AdminLogin /></Suspense>}
      />

      {/* Admin dashboard */}
      <Route element={<RequireAdmin />}>
        <Route path="admin" element={<Suspense fallback={<Loading />}><AdminLayout /></Suspense>}>
          <Route index element={<AdminDashboard />} />
          <Route path="levels" element={<AdminLevels />} />
          <Route path="locales" element={<AdminLocales />} />
          <Route path="books" element={<AdminBooks />} />
          <Route path="books/:bookId" element={<AdminBookEditor />} />
          <Route path="badges" element={<AdminBadges />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="slides" element={<AdminSlides />} />
          <Route path="certificates" element={<AdminCertificates />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="faqs" element={<AdminFaqs />} />
          <Route path="contact" element={<AdminContact />} />
        </Route>
      </Route>

      <Route path="404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
