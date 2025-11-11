import React, { useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, AuthContext, useAuth } from './auth/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LoginPage from './pages/LoginPage';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import CandidatesPage from './pages/CandidatesPage';
import CandidateDetailPage from './pages/CandidateDetailPage';
import CandidateFormPage from './pages/CreateCandidatePage';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import JobFormPage from './pages/JobFormPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectFormPage from './pages/ProjectFormPage';
import ReportsPage from './pages/ReportsPage';
import ActivityLogPage from './pages/ActivityLogPage';
import SettingsPage from './pages/SettingsPage';

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/dang-nhap" replace />;
    }
    return <MainLayout><Outlet /></MainLayout>;
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <ToastProvider>
                <AppRoutes />
            </ToastProvider>
        </AuthProvider>
    );
};

const AppRoutes: React.FC = () => {
    const { isAuthenticated } = useContext(AuthContext);

    return (
        <HashRouter>
            <Routes>
                <Route path="/dang-nhap" element={isAuthenticated ? <Navigate to="/bang-dieu-khien" /> : <LoginPage />} />
                
                <Route element={<ProtectedRoute />}>
                    <Route path="/bang-dieu-khien" element={<DashboardPage />} />
                    <Route path="/ung-vien" element={<CandidatesPage />} />
                    <Route path="/ung-vien/tao-moi" element={<CandidateFormPage />} />
                    <Route path="/ung-vien/sua/:id" element={<CandidateFormPage />} />
                    <Route path="/ung-vien/:id" element={<CandidateDetailPage />} />
                    <Route path="/tin-tuyen-dung" element={<JobsPage />} />
                    <Route path="/tin-tuyen-dung/tao-moi" element={<JobFormPage />} />
                    <Route path="/tin-tuyen-dung/sua/:id" element={<JobFormPage />} />
                    <Route path="/tin-tuyen-dung/:id" element={<JobDetailPage />} />
                    <Route path="/du-an" element={<ProjectsPage />} />
                    <Route path="/du-an/tao-moi" element={<ProjectFormPage />} />
                    <Route path="/du-an/sua/:id" element={<ProjectFormPage />} />
                    <Route path="/du-an/:id" element={<ProjectDetailPage />} />
                    <Route path="/bao-cao" element={<ReportsPage />} />
                    <Route path="/hoat-dong" element={<ActivityLogPage />} />
                    <Route path="/cai-dat" element={<SettingsPage />} />
                    <Route path="/cai-dat/:subpage" element={<SettingsPage />} />
                </Route>

                <Route path="*" element={<Navigate to={isAuthenticated ? "/bang-dieu-khien" : "/dang-nhap"} />} />
            </Routes>
        </HashRouter>
    );
};

export default App;