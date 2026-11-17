import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "@/lib/auth";
import { RealtimeSync } from "@/lib/realtime";
import Layout from "@/components/Layout";
import { Spinner } from "@/components/ui";
import Login from "@/pages/Login";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Leads from "@/pages/Leads";
import LeadDetail from "@/pages/LeadDetail";
import Clients from "@/pages/Clients";
import ClientDetail from "@/pages/ClientDetail";
import FollowUps from "@/pages/FollowUps";
import Tasks from "@/pages/Tasks";
import Employees from "@/pages/Employees";
import Settings from "@/pages/Settings";
import HomePage from "@/pages/Home";
import { Reminders, Meetings } from "@/pages/Scheduled";
import TodoPage from "@/pages/Todo";
import NotesPage from "@/pages/Notes";
import ChatPage from "@/pages/Chat";
import CalendarPage from "@/pages/Calendar";
import IntegrationsPage from "@/pages/Integrations";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 15_000, retry: 1, refetchOnWindowFocus: true },
  },
});

function RequireAuth() {
  const { session, loading, profile } = useAuth();
  if (loading) return <Spinner className="min-h-screen" />;
  if (!session) return <Navigate to="/login" replace />;
  if (profile && !profile.is_active)
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center text-slate-600">
        Your account has been deactivated. Contact your administrator.
      </div>
    );
  return <Outlet />;
}
function RequireAdmin() {
  const { isAdmin, profile } = useAuth();
  if (!profile) return <Spinner />;
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}
function RequireSuperAdmin() {
  const { isSuperAdmin, profile } = useAuth();
  if (!profile) return <Spinner />;
  return isSuperAdmin ? <Outlet /> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RealtimeSync />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<RequireAuth />}>
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="overview" element={<Dashboard />} />
                <Route path="reminders" element={<Reminders />} />
                <Route path="meetings" element={<Meetings />} />
                <Route path="todo" element={<TodoPage />} />
                <Route path="notes" element={<NotesPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route element={<RequireSuperAdmin />}>
                  <Route path="integrations" element={<IntegrationsPage />} />
                </Route>
                <Route path="leads" element={<Leads />} />
                <Route path="leads/:id" element={<LeadDetail />} />
                <Route path="clients" element={<Clients />} />
                <Route path="clients/:id" element={<ClientDetail />} />
                <Route path="follow-ups" element={<FollowUps />} />
                <Route path="tasks" element={<Tasks />} />
                <Route element={<RequireAdmin />}>
                  <Route path="employees" element={<Employees />} />
                </Route>
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{ style: { fontSize: 14 } }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
