import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute, { FullScreenLoader } from "@/components/ProtectedRoute";
import SiteLayout from "@/components/site/SiteLayout";
import Home from "./pages/site/Home.tsx";
import About from "./pages/site/About.tsx";
import Services from "./pages/site/Services.tsx";
import ServiceDetail from "./pages/site/ServiceDetail.tsx";
import ProjectsPage from "./pages/site/Projects.tsx";
import ProjectCase from "./pages/site/ProjectCase.tsx";
import Contact from "./pages/site/Contact.tsx";
import SiteNotFound from "./pages/site/SiteNotFound.tsx";

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
              <Route element={<SiteLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/:slug" element={<ServiceDetail />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:slug" element={<ProjectCase />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<SiteNotFound />} />
              </Route>
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
              <Route path="/dashboard/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
              <Route path="/dashboard/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
              <Route path="/dashboard/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
              <Route path="/dashboard/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
              <Route path="/dashboard/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/dashboard/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
