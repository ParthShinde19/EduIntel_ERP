import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Attendance from "./pages/Attendance";
import Academic from "./pages/Academic";
import Library from "./pages/Library";
import NSS from "./pages/NSS";
import Placement from "./pages/Placement";
import Certificates from "./pages/Certificates";
import PlacementPortal from "./pages/PlacementPortal";
import About from "./pages/About";
import Notices from "./pages/Notices";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import Calendar from "./pages/Calendar";
import Contact from "./pages/Contact";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AdmissionDashboard from "./pages/AdmissionDashboard";
import ContentManagement from "./pages/ContentManagement";
import AboutCMS from "./pages/cms/AboutCMS";
import PrincipalCMS from "./pages/cms/PrincipalCMS";
import NoticesCMS from "./pages/cms/NoticesCMS";
import EventsCMS from "./pages/cms/EventsCMS";
import GalleryCMS from "./pages/cms/GalleryCMS";
import ContactCMS from "./pages/cms/ContactCMS";
import CalendarCMS from "./pages/cms/CalendarCMS";
import SettingsCMS from "./pages/cms/SettingsCMS";
import AcademicRiskDashboard from "./pages/AcademicRiskDashboard";
import StudentQRVerify from "./pages/StudentQRVerify";
import StudentDossier from "./pages/StudentDossier";
import ExamAdminDashboard from "./pages/ExamAdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/events" element={<Events />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/risk-dashboard" element={<AcademicRiskDashboard />} />
        <Route path="/student-profile" element={<StudentDossier />} />
        <Route path="/student-profile/:studentId" element={<StudentDossier />} />
        <Route path="/verify/student/:token" element={<StudentQRVerify />} />
        <Route path="/content-management" element={<ContentManagement />} />
{/* CMS Routes */}
<Route
  path="/content-management/about"
  element={
    <ProtectedRoute allowedRoles={["super_admin"]}>
      <AboutCMS />
    </ProtectedRoute>
  }
/>

<Route
  path="/content-management/principal-desk"
  element={
    <ProtectedRoute allowedRoles={["super_admin"]}>
      <PrincipalCMS />
    </ProtectedRoute>
  }
/>

<Route
  path="/content-management/notices"
  element={
    <ProtectedRoute allowedRoles={["super_admin"]}>
      <NoticesCMS />
    </ProtectedRoute>
  }
/>

<Route
  path="/content-management/events"
  element={
    <ProtectedRoute allowedRoles={["super_admin"]}>
      <EventsCMS />
    </ProtectedRoute>
  }
/>

<Route
  path="/content-management/gallery"
  element={
    <ProtectedRoute allowedRoles={["super_admin"]}>
      <GalleryCMS />
    </ProtectedRoute>
  }
/>

<Route
  path="/content-management/calendar"
  element={
    <ProtectedRoute allowedRoles={["super_admin"]}>
      <CalendarCMS />
    </ProtectedRoute>
  }
/>

<Route
  path="/content-management/contact"
  element={
    <ProtectedRoute allowedRoles={["super_admin"]}>
      <ContactCMS />
    </ProtectedRoute>
  }
/>

<Route
  path="/content-management/settings"
  element={
    <ProtectedRoute allowedRoles={["super_admin"]}>
      <SettingsCMS />
    </ProtectedRoute>
  }
/>

        {/* Super Admin */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />


        {/* Admission Admin */}
        <Route
          path="/admission-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admission_admin"]}>
              <AdmissionDashboard />
            </ProtectedRoute>
          }
        />

        {/* Library Admin */}
        <Route
          path="/library-dashboard"
          element={
            <ProtectedRoute allowedRoles={["library_admin"]}>
              <Library />
            </ProtectedRoute>
          }
        />

        {/* NSS Admin */}
        <Route
          path="/nss-dashboard"
          element={
            <ProtectedRoute allowedRoles={["nss_admin"]}>
              <NSS />
            </ProtectedRoute>
          }
        />

        {/* Placement Admin */}
        <Route
          path="/placement-dashboard"
          element={
            <ProtectedRoute allowedRoles={["placement_admin"]}>
              <Placement />
            </ProtectedRoute>
          }
        />

    
       <Route
  path="/placement-portal"
  element={
    <ProtectedRoute allowedRoles={["placement_student"]}>
      <PlacementPortal />
    </ProtectedRoute>
  }
/>

        {/* Exam Admin */}
        <Route
          path="/exam-dashboard"
          element={
            <ProtectedRoute allowedRoles={["exam_admin", "super_admin"]}>
              <ExamAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Teacher Dashboard */}
        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute allowedRoles={["teacher", "super_admin"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        {/* Other Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admission_admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/students"
          element={
            <ProtectedRoute allowedRoles={["admission_admin"]}>
              <Students />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute allowedRoles={["admission_admin"]}>
              <Attendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/academic"
          element={
            <ProtectedRoute allowedRoles={["admission_admin"]}>
              <Academic />
            </ProtectedRoute>
          }
        />

        <Route
          path="/certificates"
          element={
            <ProtectedRoute allowedRoles={["nss_admin", "admission_admin"]}>
              <Certificates />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;