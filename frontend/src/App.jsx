import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';
import FloatingChatbot from './components/chat/FloatingChatbot';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import ResumeAnalysisPage from './pages/ResumeAnalysisPage';
import JobMatchingPage from './pages/JobMatchingPage';
import InterviewConfigPage from './pages/InterviewConfigPage';
import LiveInterviewRoom from './pages/LiveInterviewRoom';
import InterviewCompletionPage from './pages/InterviewCompletionPage';
import InterviewReportPage from './pages/InterviewReportPage';
import InterviewHistoryPage from './pages/InterviewHistoryPage';
import PerformanceAnalyticsPage from './pages/PerformanceAnalyticsPage';
import PreparationRecommendationsPage from './pages/PreparationRecommendationsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="flex flex-col min-h-screen bg-dark-900 text-slate-100 font-sans">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Protected Candidate Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/resumes"
                  element={
                    <ProtectedRoute>
                      <ResumeUploadPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/resume/:id"
                  element={
                    <ProtectedRoute>
                      <ResumeAnalysisPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/job-match"
                  element={
                    <ProtectedRoute>
                      <JobMatchingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interview/config"
                  element={
                    <ProtectedRoute>
                      <InterviewConfigPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interview/:id"
                  element={
                    <ProtectedRoute>
                      <LiveInterviewRoom />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interview/completed/:id"
                  element={
                    <ProtectedRoute>
                      <InterviewCompletionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/report/:sessionId"
                  element={
                    <ProtectedRoute>
                      <InterviewReportPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <InterviewHistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <PerformanceAnalyticsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recommendations"
                  element={
                    <ProtectedRoute>
                      <PreparationRecommendationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <FloatingChatbot />
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

