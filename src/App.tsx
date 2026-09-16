import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute, { FullScreenLoader } from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

// The management system is loaded on demand so public visitors only download the website.
const Auth = lazy(() => import("./pages/Auth.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Projects = lazy(() => import("./pages/Projects.tsx"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail.tsx"));
const Tasks = lazy(() => import("./pages/Tasks.tsx"));
const Finance = lazy(() => import("./pages/Finance.tsx"));
const Team = lazy(() => import("./pages/Team.tsx"));
const Reports = lazy(() => import("./pages/Reports.tsx"));
const Account = lazy(() => import("./pages/Account.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<FullScreenLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
              <Route path="/dashboard/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
              <Route path="/dashboard/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
              <Route path="/dashboard/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
              <Route path="/dashboard/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
              <Route path="/dashboard/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/dashboard/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
