import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Layers, Bell, Moon, Sun, 
  Plus, Edit, Eye, Trash2, TrendingUp, Activity, 
  Menu, Check, Zap, Globe, Smartphone, Cpu, 
  MessageCircle
  } from 'lucide-react';
import { Project, UserRole, UserTier } from '@/lib/types';
import SiteMap from '@/components/ui/SiteMap';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import CurrencySwitcher from '@/components/ui/CurrencySwitcher';
import { useTranslation } from 'react-i18next';
import WeUIModal from '@/components/modals/WeUIModal';
import ServiceFlowModal from '@/components/modals/ServiceFlowModal';
import PlanUpgradeModal from '@/components/modals/PlanUpgradeModal';
import { useChatbot } from '@/contexts/ChatbotContext';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useMedia } from '@/contexts/MediaContext';
import { useProjectManagement } from '@/contexts/ProjectManagementContext';
import { 
  DatabaseConnectionModal} from '@/components/database';
import FolderModal from '@/components/media/FolderModal';
import FilePreviewModal from '@/components/media/FilePreviewModal';
import TaskModal from '@/components/modals/TaskModal';
import {
  SecretKeyModal
} from '@/components/secret-management';
import { useSecretManagement } from '@/contexts/SecretManagementContext';
import NotesBoard from '@/components/ui/NotesBoard';
import { serviceAPI, ServiceResponse, componentAPI, ComponentData, ComponentStats, CreateComponentRequest, pageAPI, PageData, PageStats, CreatePageRequest, myProjectAPI, MyProjectData } from '@/lib/api';
import { CreateTaskRequest, UpdateTaskRequest } from '@/lib/api/tasks';
import { useAlertActions } from '@/hooks/useAlert';
import { useAlert } from '@/contexts/AlertContext';
import ComponentBuilderModal from '@/components/modals/ComponentBuilderModal';
import ComponentHistoryPanel from '@/components/panels/ComponentHistoryPanel';
import PageModal from '@/components/modals/PageModal';
import PageHistoryPanel from '@/components/panels/PageHistoryPanel';
import MyProjectModal from '@/components/modals/MyProjectModal';
import { useAuth } from '@/contexts/AuthContext';
import LogoutConfirmModal from '@/components/modals/LogoutConfirmModal';
import { DashboardSidebar } from '../dashboard';
import DashboardContent from '../dashboard/DashboardContent';

interface DashboardProps {
  projects: Project[];
  userRole: UserRole;
  userTier: UserTier;
  darkMode: boolean;
  mobileSidebarOpen: boolean;
  showCreateModal: boolean;
  selectedProject: Project | null;
  setMobileSidebarOpen: (open: boolean) => void;
  setDarkMode: (dark: boolean) => void;
  setShowCreateModal: (show: boolean) => void;
  setSelectedProject: (project: Project | null) => void;
  setIsAuthenticated: (auth: boolean) => void;
  onShowCreateSmartFlowModal?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  projects,
  userRole,
  userTier,
  darkMode,
  mobileSidebarOpen,
  showCreateModal,
  selectedProject: _selectedProject,
  setMobileSidebarOpen,
  setDarkMode,
  setShowCreateModal,
  setSelectedProject,
  setIsAuthenticated,
  onShowCreateSmartFlowModal
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { openChatbot } = useChatbot();
  const { alert } = useAlertActions();
  const { showConfirm } = useAlert();
  const { logout, user } = useAuth();
  const { 
    connections, 
    isLoading: dbLoading, 
    error: dbError,
    addConnection,
    updateConnection,
    deleteConnection,
    testConnection
  } = useDatabase();
  const {
    viewMode,
    currentFolder
  } = useMedia();
  const {
    currentProject,
    generateDemoData: generateDemoProjects
  } = useProjectManagement();
  const {
    secrets,
    addSecret,
    updateSecret,
    deleteSecret,
    generateDemoSecrets,
    getExpiredSecrets,
    getExpiringSoonSecrets
  } = useSecretManagement();
  
  const [showSiteMap, setShowSiteMap] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [showWeUIModal, setShowWeUIModal] = useState(false);
  const [showServiceFlowModal, setShowServiceFlowModal] = useState(false);
  const [showPlanUpgradeModal, setShowPlanUpgradeModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [flows, setFlows] = useState<ServiceResponse[]>([]);
  const [editingFlow, setEditingFlow] = useState<ServiceResponse | null>(null);
  
  // Load services when services view is active
  React.useEffect(() => {
    if (activeView === 'services') {
      loadServices();
    }
  }, [activeView]);

  const loadServices = async () => {
    setComponentsLoading(true);
    try {
      const [servicesData] = await Promise.all([
        serviceAPI.getAll()
      ])
      setFlows(servicesData);
    } catch (error) {
      console.error('Error loading services:', error);
      alert.error('Failed to load services');
    } finally {
      setComponentsLoading(false);
    }
  };

  // Component Management functions
  const loadComponents = async () => {
    setComponentsLoading(true);
    try {
      const [componentsData, statsData] = await Promise.all([
        componentAPI.getAll(),
        componentAPI.getStats()
      ]);
      setComponents(componentsData);
      setComponentStats(statsData);
    } catch (error) {
      console.error('Error loading components:', error);
      alert.error('Failed to load components');
    } finally {
      setComponentsLoading(false);
    }
  };

  const handleLogout = () => {
    logout(); 
    setIsAuthenticated(false); // Keep legacy support
    router.push('/landing'); 
  };

  const handleCreateComponent = () => {
    setEditingComponent(null);
    setShowComponentModal(true);
  };

  const handleEditComponent = (component: ComponentData) => {
    setEditingComponent(component);
    setShowComponentModal(true);
  };

  const handleSaveComponent = async (componentData: CreateComponentRequest) => {
    try {
      if (editingComponent) {
        await componentAPI.update(editingComponent.id!, { ...componentData, userId: user?.id || 1 });
        alert.success('Component updated successfully!');
      } else {
        await componentAPI.create({ ...componentData, userId: user?.id || 1 });
        alert.success('Component created successfully!');
      }
      await loadComponents();
    } catch (error) {
      console.error('Error saving component:', error);
      throw error;
    }
  };

  const handleDeleteComponent = async (componentId: number) => {
    const confirmed = await showConfirm(
      'Delete Component',
      'Are you sure you want to delete this component?',
      { confirmText: 'Delete', confirmType: 'danger' }
    );
    if (!confirmed) {
      return;
    }

    try {
      await componentAPI.delete(componentId);
      alert.success('Component deleted successfully!');
      await loadComponents();
    } catch (error) {
      console.error('Error deleting component:', error);
      alert.error('Failed to delete component');
    }
  };

  const handleShowComponentHistory = (component: ComponentData) => {
    setSelectedComponentForHistory(component);
    setShowComponentHistory(true);
  };

  const getFilteredComponents = () => {
    return components.filter(component => {
      const matchesSearch = component.name.toLowerCase().includes(componentSearchTerm.toLowerCase()) ||
                           component.description?.toLowerCase().includes(componentSearchTerm.toLowerCase()) ||
                           component.tags?.some(tag => tag.toLowerCase().includes(componentSearchTerm.toLowerCase()));
      
      const matchesCategory = componentCategoryFilter === 'all' || component.category === componentCategoryFilter;
      const matchesType = componentTypeFilter === 'all' || component.type === componentTypeFilter;
      
      return matchesSearch && matchesCategory && matchesType;
    });
  };

  useEffect(() => {
    if (activeView === 'components') {
      loadComponents();
    }
  }, [activeView]);

  // Page Management functions
  const loadPages = async () => {
    setPagesLoading(true);
    try {
      const [pagesData, statsData] = await Promise.all([
        pageAPI.getAll(),
        pageAPI.getStats()
      ]);
      setPages(pagesData);
      setPageStats(statsData);
    } catch (error) {
      console.error('Error loading pages:', error);
      alert.error('Failed to load pages');
    } finally {
      setPagesLoading(false);
    }
  };

  const handleCreatePage = () => {
    setEditingPage(null);
    setShowPageModal(true);
  };

  const handleEditPage = (page: PageData) => {
    setEditingPage(page);
    setShowPageModal(true);
  };

  const handleSavePage = async (pageData: CreatePageRequest) => {
    try {
      if (editingPage) {
        await pageAPI.update(editingPage.id!, { ...pageData, userId: user?.id || 1 });
        alert.success('Page updated successfully!');
      } else {
        await pageAPI.create({ ...pageData, userId: user?.id || 1 });
        alert.success('Page created successfully!');
      }
      await loadPages();
    } catch (error) {
      console.error('Error saving page:', error);
      throw error;
    }
  };

  const handleDeletePage = async (pageId: number) => {
    const confirmed = await showConfirm(
      'Delete Page',
      'Are you sure you want to delete this page?',
      { confirmText: 'Delete', confirmType: 'danger' }
    );
    if (!confirmed) {
      return;
    }

    try {
      await pageAPI.delete(pageId);
      alert.success('Page deleted successfully!');
      await loadPages();
    } catch (error) {
      console.error('Error deleting page:', error);
      alert.error('Failed to delete page');
    }
  };

  const handleShowPageHistory = (page: PageData) => {
    setSelectedPageForHistory(page);
    setShowPageHistory(true);
  };

  const getFilteredPages = () => {
    return pages.filter(page => {
      const matchesSearch = page.title.toLowerCase().includes(pageSearchTerm.toLowerCase()) ||
                           page.description?.toLowerCase().includes(pageSearchTerm.toLowerCase()) ||
                           page.tags?.some(tag => tag.toLowerCase().includes(pageSearchTerm.toLowerCase()));
      
      const matchesStatus = pageStatusFilter === 'all' || page.status === pageStatusFilter;
      const matchesType = pageTypeFilter === 'all' || page.pageType === pageTypeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  };

  useEffect(() => {
    if (activeView === 'pages') {
      loadPages();
    }
  }, [activeView]);

  // Load My Projects
  const loadMyProjects = async () => {
    try {
      const projectsData = await myProjectAPI.getAll();
      setMyProjects(projectsData);
    } catch (error: any) {
      console.error('Error loading projects:', error);
      alert.error('Failed to load projects');
    }
  };

  useEffect(() => {
    if (activeView === 'projects') {
      loadMyProjects();
    }
  }, [activeView]);

  // Delete project function
  const handleDeleteProject = async (projectId: number) => {
    const confirmed = await showConfirm(
      'Delete Project',
      'Are you sure you want to delete this project?',
      { confirmText: 'Delete', confirmType: 'danger' }
    );
    if (confirmed) {
      try {
        await myProjectAPI.delete(projectId);
        setMyProjects(prev => prev.filter(p => p.id !== projectId));
        alert.success('Project deleted successfully');
      } catch (error: any) {
        console.error('Error deleting project:', error);
        alert.error('Failed to delete project');
      }
    }
  };
  
  // Database states
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [editingConnection, setEditingConnection] = useState<any>(null);
  const [viewingTablesConnection, setViewingTablesConnection] = useState<any>(null);
  const [queryingConnection, setQueryingConnection] = useState<any>(null);
  
  // Media states
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);
  // const [editingFile, setEditingFile] = useState<any>(null);
  
  // Component Management states
  const [components, setComponents] = useState<ComponentData[]>([]);
  const [componentStats, setComponentStats] = useState<ComponentStats | null>(null);
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState<ComponentData | null>(null);
  const [showComponentHistory, setShowComponentHistory] = useState(false);
  const [selectedComponentForHistory, setSelectedComponentForHistory] = useState<ComponentData | null>(null);
  const [componentSearchTerm, setComponentSearchTerm] = useState('');
  const [componentCategoryFilter, setComponentCategoryFilter] = useState<string>('all');
  const [componentTypeFilter, setComponentTypeFilter] = useState<string>('all');
  const [componentsLoading, setComponentsLoading] = useState(false);
  
  // Page Management states
  const [pages, setPages] = useState<PageData[]>([]);
  const [pageStats, setPageStats] = useState<PageStats | null>(null);
  const [showPageModal, setShowPageModal] = useState(false);
  const [editingPage, setEditingPage] = useState<PageData | null>(null);
  const [showPageHistory, setShowPageHistory] = useState(false);
  const [selectedPageForHistory, setSelectedPageForHistory] = useState<PageData | null>(null);
  const [pageSearchTerm, setPageSearchTerm] = useState('');
  const [pageStatusFilter, setPageStatusFilter] = useState<string>('all');
  const [pageTypeFilter, setPageTypeFilter] = useState<string>('all');
  const [pagesLoading, setPagesLoading] = useState(false);
  
  // Project Management states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [projectManagementView, setProjectManagementView] = useState<'timeline' | 'table' | 'kanban' | 'summary'>('kanban');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Secret Management states
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [editingSecret, setEditingSecret] = useState<any>(null);
  const [secretSearchQuery, setSecretSearchQuery] = useState('');
  
  // My Project states
  const [showMyProjectModal, setShowMyProjectModal] = useState(false);
  const [myProjects, setMyProjects] = useState<MyProjectData[]>([]);
  const [secretTypeFilter, setSecretTypeFilter] = useState<string>('all');
  const stats = {
    totalProjects: projects.length,
    published: projects.filter(p => p.status === 'Published').length,
    totalTasks: projects.reduce((acc, p) => acc + p.tasks, 0),
    completedTasks: projects.reduce((acc, p) => acc + p.completed, 0),
  };

  return (
    <>
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative">
      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <DashboardSidebar
        mobileSidebarOpen={mobileSidebarOpen}
        activeView={activeView}
        userTier={userTier}
        userRole={userRole}
        projects={projects}
        setActiveView={setActiveView}
        setIsAuthenticated={setIsAuthenticated}
      />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center justify-center flex-1 h-full px-2">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-full h-full object-contain max-w-[200px] max-h-[40px]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <Bell className="h-5 w-5" />
            </button>
            <CurrencySwitcher />
            <LanguageSwitcher />
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-4">
          {/* Header - Desktop only */}
          <div className="hidden lg:flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {t("welcomeBack")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("whatsHappening")}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <Bell className="h-5 w-5" />
              </button>
              <button
                onClick={openChatbot}
                className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                title="เปิด AI Assistant"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
              <CurrencySwitcher />
              <LanguageSwitcher />
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="lg:hidden mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t("welcomeBack")}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {t("whatsHappeningMobile")}
            </p>
          </div>

          {/* Render content based on active view */}
          {activeView === "dashboard" && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Layers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      12%
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.totalProjects}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {t("totalProjects")}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      8%
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.published}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {t("published")}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      24%
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.totalTasks}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {t("totalTasks")}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-sm text-green-600 dark:text-green-400">
                      {Math.round(
                        (stats.completedTasks / stats.totalTasks) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.completedTasks}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {t("completedTasks")}
                  </div>
                </div>
              </div>

              {/* Notes Board */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mb-8">
                <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Quick Notes
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Sticky notes from your team
                  </p>
                </div>
                <div className="p-4 sm:p-6">
                  <NotesBoard />
                </div>
              </div>

              {/* Recent Projects */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {t("recentProjects")}
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("newProjectDemo")}
                    </button>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  {/* Mobile Cards View */}
                  <div className="lg:hidden space-y-4">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {project.name}
                            </div>
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-sm mt-1 inline-block">
                              {project.type}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-sm ${
                              project.status === "Published"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                            }`}
                          >
                            {project.status}
                          </span>
                        </div>
                        <div className="mb-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {t("progress")}:
                            </span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {project.completed}/{project.tasks}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                              style={{
                                width: `${
                                  (project.completed / project.tasks) * 100
                                }%`
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {project.lastModified}
                          </span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedProject(project)
                                router.push("/builder")
                              }}
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                            >
                              <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </button>
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                              <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </button>
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-slate-600 dark:text-slate-400">
                          <th className="pb-4">{t("projectName")}</th>
                          <th className="pb-4">{t("type")}</th>
                          <th className="pb-4">{t("status")}</th>
                          <th className="pb-4">{t("progress")}</th>
                          <th className="pb-4">{t("lastModified")}</th>
                          <th className="pb-4">{t("actions")}</th>
                        </tr>
                      </thead>
                      <tbody className="space-y-2">
                        {projects.map((project) => (
                          <tr
                            key={project.id}
                            className="border-t border-slate-100 dark:border-slate-700"
                          >
                            <td className="py-4">
                              <div className="font-medium text-slate-900 dark:text-white">
                                {project.name}
                              </div>
                            </td>
                            <td className="py-4">
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-sm">
                                {project.type}
                              </span>
                            </td>
                            <td className="py-4">
                              <span
                                className={`px-2 py-1 rounded text-sm ${
                                  project.status === "Published"
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                    : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                                }`}
                              >
                                {project.status}
                              </span>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                                    style={{
                                      width: `${
                                        (project.completed / project.tasks) *
                                        100
                                      }%`
                                    }}
                                  />
                                </div>
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  {project.completed}/{project.tasks}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 text-sm text-slate-600 dark:text-slate-400">
                              {project.lastModified}
                            </td>
                            <td className="py-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedProject(project)
                                    router.push("/builder")
                                  }}
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                                >
                                  <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                </button>
                                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                  <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                </button>
                                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                  <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Render other menu content */}
          <DashboardContent
            activeView={activeView}
            userRole={userRole}
            userTier={userTier}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            myProjects={myProjects}
            setShowMyProjectModal={setShowMyProjectModal}
            handleDeleteProject={handleDeleteProject}
            pages={pages}
            pagesLoading={pagesLoading}
            pageStats={pageStats}
            pageSearchTerm={pageSearchTerm}
            setPageSearchTerm={setPageSearchTerm}
            pageStatusFilter={pageStatusFilter}
            setPageStatusFilter={setPageStatusFilter}
            pageTypeFilter={pageTypeFilter}
            setPageTypeFilter={setPageTypeFilter}
            getFilteredPages={getFilteredPages}
            handleCreatePage={handleCreatePage}
            handleEditPage={handleEditPage}
            handleShowPageHistory={handleShowPageHistory}
            handleDeletePage={handleDeletePage}
            flows={flows}
            setShowServiceFlowModal={setShowServiceFlowModal}
            setEditingFlow={setEditingFlow}
            loadServices={loadServices}
            queryingConnection={queryingConnection}
            setQueryingConnection={setQueryingConnection}
            viewingTablesConnection={viewingTablesConnection}
            setViewingTablesConnection={setViewingTablesConnection}
            setShowConnectionModal={setShowConnectionModal}
            setEditingConnection={setEditingConnection}
            components={components}
            componentsLoading={componentsLoading}
            componentStats={componentStats}
            componentSearchTerm={componentSearchTerm}
            setComponentSearchTerm={setComponentSearchTerm}
            componentCategoryFilter={componentCategoryFilter}
            setComponentCategoryFilter={setComponentCategoryFilter}
            componentTypeFilter={componentTypeFilter}
            setComponentTypeFilter={setComponentTypeFilter}
            getFilteredComponents={getFilteredComponents}
            handleCreateComponent={handleCreateComponent}
            handleEditComponent={handleEditComponent}
            handleShowComponentHistory={handleShowComponentHistory}
            handleDeleteComponent={handleDeleteComponent}
            projectManagementView={projectManagementView}
            setProjectManagementView={(view: string) => setProjectManagementView(view as 'timeline' | 'table' | 'kanban' | 'summary')}
            setSelectedTask={setSelectedTask}
            setIsCreatingTask={setIsCreatingTask}
            setShowTaskModal={setShowTaskModal}
            refreshTrigger={refreshTrigger}
            generateDemoProjects={generateDemoProjects}
            secrets={secrets}
            secretSearchQuery={secretSearchQuery}
            setSecretSearchQuery={setSecretSearchQuery}
            secretTypeFilter={secretTypeFilter}
            setSecretTypeFilter={setSecretTypeFilter}
            setEditingSecret={setEditingSecret}
            setShowSecretModal={setShowSecretModal}
            deleteSecret={deleteSecret}
            generateDemoSecrets={generateDemoSecrets}
            getExpiredSecrets={getExpiredSecrets}
            getExpiringSoonSecrets={getExpiringSoonSecrets}
            setEditingFolder={setEditingFolder}
            setShowFolderModal={setShowFolderModal}
            setPreviewFile={setPreviewFile}
            setShowPreviewModal={setShowPreviewModal}
          />
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
              Create New Project
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="My Awesome App"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  rows={3}
                  placeholder="Describe your project..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Project Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      key: "Full-Stack",
                      label: t("fullStack"),
                      desc: t("fullStackDesc")
                    },
                    {
                      key: "Single Web",
                      label: t("singleWeb"),
                      desc: t("singleWebDesc")
                    },
                    {
                      key: "Microservice",
                      label: t("microservice"),
                      desc: t("microserviceDesc")
                    },
                    {
                      key: "Script Logic",
                      label: t("scriptLogic"),
                      desc: t("scriptLogicDesc")
                    }
                  ].map((type) => (
                    <button
                      key={type.key}
                      className="p-4 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition text-left"
                    >
                      <div className="font-medium text-slate-900 dark:text-white">
                        {type.label}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {type.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Target Platform
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button className="p-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition flex items-center justify-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Web
                  </button>
                  <button className="p-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition flex items-center justify-center">
                    <Smartphone className="h-5 w-5 mr-2" />
                    Mobile
                  </button>
                  <button className="p-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition flex items-center justify-center">
                    <Cpu className="h-5 w-5 mr-2" />
                    IoT
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  router.push("/builder")
                }}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Site Map Modal */}
      {showSiteMap && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <SiteMap
              userRole={userRole}
              isAuthenticated={true}
              onClose={() => setShowSiteMap(false)}
            />
          </div>
        </div>
      )}

      {/* WeUI Modal */}
      <WeUIModal
        isOpen={showWeUIModal}
        onClose={() => setShowWeUIModal(false)}
      />

      {/* Service Flow Modal */}
      <ServiceFlowModal
        isOpen={showServiceFlowModal}
        onClose={() => {
          setShowServiceFlowModal(false)
          setEditingFlow(null)
          if (activeView === "services") {
            loadServices() // Refresh services after modal closes
          }
        }}
        editingFlow={editingFlow}
      />

      {/* Database Connection Modal */}
      <DatabaseConnectionModal
        isOpen={showConnectionModal}
        onClose={() => {
          setShowConnectionModal(false)
          setEditingConnection(null)
        }}
        onSave={async (connectionData) => {
          if (editingConnection) {
            await updateConnection(editingConnection.id, connectionData)
          } else {
            await addConnection(connectionData)
          }
          setShowConnectionModal(false)
          setEditingConnection(null)
        }}
        editingConnection={editingConnection}
        isLoading={dbLoading}
      />

      {/* Media Modals */}
      <FolderModal
        isOpen={showFolderModal}
        onClose={() => {
          setShowFolderModal(false)
          setEditingFolder(null)
        }}
        folder={editingFolder}
      />

      <FilePreviewModal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false)
          setPreviewFile(null)
        }}
        file={previewFile}
        onEdit={(file) => {
          console.log("Edit file:", file)
          setShowPreviewModal(false)
          // Add file edit modal here if needed
        }}
        onDelete={async () => {
          // Handle file deletion
          setShowPreviewModal(false)
          setPreviewFile(null)
        }}
      />

      {/* Project Management Modals */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false)
          setSelectedTask(null)
          setIsCreatingTask(false)
        }}
        onSave={async (data) => {
          try {
            // Import taskAPI dynamically to avoid import issues
            const { taskAPI: dynamicTaskAPI } = await import("@/lib/api/tasks")

            if (isCreatingTask) {
              // Create new task
              await dynamicTaskAPI.create(data as CreateTaskRequest)
              alert.success("Task created successfully!")
            } else if (selectedTask) {
              // Update existing task
              await dynamicTaskAPI.update(
                selectedTask.id,
                data as UpdateTaskRequest
              )
              alert.success("Task updated successfully!")
            }
            setShowTaskModal(false)
            setSelectedTask(null)
            setIsCreatingTask(false)
            // Trigger refresh in KanbanView
            setRefreshTrigger((prev) => prev + 1)
          } catch (error) {
            console.error("Error saving task:", error)
            alert.error("Failed to save task")
          }
        }}
        editingTask={isCreatingTask ? null : selectedTask}
      />

      {/* Secret Management Modal */}
      <SecretKeyModal
        isOpen={showSecretModal}
        onClose={() => {
          setShowSecretModal(false)
          setEditingSecret(null)
        }}
        onSave={async (secretData) => {
          if (editingSecret) {
            await updateSecret(editingSecret.id, secretData)
          } else {
            await addSecret(secretData)
          }
        }}
        editingSecret={editingSecret}
      />

      {/* Component Management Modals */}
      <ComponentBuilderModal
        isOpen={showComponentModal}
        onClose={() => {
          setShowComponentModal(false)
          setEditingComponent(null)
        }}
        onSave={handleSaveComponent}
        editingComponent={editingComponent}
        userId={user?.id || 1}
      />

      <ComponentHistoryPanel
        isOpen={showComponentHistory}
        onClose={() => {
          setShowComponentHistory(false)
          setSelectedComponentForHistory(null)
        }}
        componentId={selectedComponentForHistory?.id || 0}
        componentName={selectedComponentForHistory?.name || ""}
        onRestore={() => {
          loadComponents()
        }}
        userId={user?.id || 1}
      />

      {/* Page Management Modals */}
      <PageModal
        isOpen={showPageModal}
        onClose={() => {
          setShowPageModal(false)
          setEditingPage(null)
        }}
        onSave={handleSavePage}
        editingPage={editingPage}
        userId={user?.id || 1}
      />

      <PageHistoryPanel
        isOpen={showPageHistory}
        onClose={() => {
          setShowPageHistory(false)
          setSelectedPageForHistory(null)
        }}
        pageId={selectedPageForHistory?.id || 0}
        pageTitle={selectedPageForHistory?.title || ""}
        onRestore={() => {
          loadPages()
        }}
        userId={user?.id || 1}
      />

      {/* My Project Modal */}
      <MyProjectModal
        isOpen={showMyProjectModal}
        onClose={() => setShowMyProjectModal(false)}
        onProjectCreated={(project) => {
          console.log("Project created:", project)
          setMyProjects((prev) => [...prev, project])
          // Route to reactflow page with the new project
          router.push(`/reactflow?projectId=${project.id}`)
        }}
      />

      {/* Plan Upgrade Modal */}
      <PlanUpgradeModal
        isOpen={showPlanUpgradeModal}
        onClose={() => setShowPlanUpgradeModal(false)}
        currentTier={userTier}
      />

    </div>

    {/* Logout Confirmation Modal - Outside main container for full screen overlay */}
    {showLogoutModal && (
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    )}
    </>
  );
};

export default Dashboard;