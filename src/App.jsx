import { Navigate, Route, Routes } from 'react-router-dom'

import Layout from './components/Layout.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import RequireAdmin from './components/RequireAdmin.jsx'

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

import AdminLayout from './admin/AdminLayout.jsx'
import AdminDashboard from './admin/pages/Dashboard.jsx'
import AdminLevels from './admin/pages/Levels.jsx'
import AdminBooks from './admin/pages/Books.jsx'
import AdminBookEditor from './admin/pages/BookEditor.jsx'
import AdminBadges from './admin/pages/Badges.jsx'
import AdminAnnouncements from './admin/pages/Announcements.jsx'
import AdminSlides from './admin/pages/Slides.jsx'
import AdminCertificates from './admin/pages/Certificates.jsx'
import AdminUsers from './admin/pages/Users.jsx'

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

      {/* Admin dashboard */}
      <Route element={<RequireAdmin />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="levels" element={<AdminLevels />} />
          <Route path="books" element={<AdminBooks />} />
          <Route path="books/:bookId" element={<AdminBookEditor />} />
          <Route path="badges" element={<AdminBadges />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="slides" element={<AdminSlides />} />
          <Route path="certificates" element={<AdminCertificates />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Route>

      <Route path="404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
