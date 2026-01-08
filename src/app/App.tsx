/**
 * MST App Component - 2026 Edition
 * 
 * Hlavní komponenta aplikace s tab navigací a PWA podporou.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  TabBar, 
  DEFAULT_TAB_ITEMS, 
  LoadingScreen, 
  ToastProvider, 
  useToast,
  NotificationProvider,
  useNotifications,
  ConnectivityBanner,
  type TabItem,
} from '../shared';
import {
  useNavigationShortcuts,
  useGlobalShortcuts,
  useHaptic,
} from '../shared/hooks';
import {
  AuthProvider,
  useAuth,
  LoginScreen,
  HomeScreen,
  ProjectsScreen,
  ProjectDetailScreen,
  ProjectFormScreen,
  FieldMapScreen,
  ChatScreen,
  SettingsScreen,
} from '../features';
import {
  usePWA,
  UpdatePrompt,
  InstallPrompt,
} from '../pwa';
import { isFirebaseConfigured, initializeFirebase, syncService } from '../firebase';

/**
 * Tab IDs
 */
type TabId = 'home' | 'projects' | 'work' | 'chat' | 'settings';

/**
 * Screen types for navigation
 */
type ScreenType = 
  | { type: 'tab'; tab: TabId }
  | { type: 'projectDetail'; projectId: string }
  | { type: 'projectForm'; projectId?: string }
  | { type: 'fieldMap'; projectId: string };

/**
 * App state
 */
interface AppState {
  activeTab: TabId;
  screen: ScreenType;
  navigationHistory: ScreenType[];
}

/**
 * Main App - vnitřní komponenta s auth logikou
 */
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [state, setState] = useState<AppState>({
    activeTab: 'home',
    screen: { type: 'tab', tab: 'home' },
    navigationHistory: [],
  });

  // PWA state
  const { state: pwaState, install, update } = usePWA();
  const [updateDismissed, setUpdateDismissed] = useState(false);

  // Haptic feedback
  const haptic = useHaptic();

  // Tab change handler
  const handleTabChange = useCallback((tabId: string) => {
    haptic.selection();
    setState((prev) => ({
      ...prev,
      activeTab: tabId as TabId,
      screen: { type: 'tab', tab: tabId as TabId },
      navigationHistory: [],
    }));
  }, [haptic]);

  // Navigate to project detail
  const handleSelectProject = useCallback((projectId: string) => {
    setState((prev) => ({
      ...prev,
      screen: { type: 'projectDetail', projectId },
      navigationHistory: [...prev.navigationHistory, prev.screen],
    }));
  }, []);

  // Create new project
  const handleCreateProject = useCallback(() => {
    setState((prev) => ({
      ...prev,
      screen: { type: 'projectForm' },
      navigationHistory: [...prev.navigationHistory, prev.screen],
    }));
  }, []);

  // Edit project
  const handleEditProject = useCallback((projectId: string) => {
    setState((prev) => ({
      ...prev,
      screen: { type: 'projectForm', projectId },
      navigationHistory: [...prev.navigationHistory, prev.screen],
    }));
  }, []);

  // Project form success - navigate to detail
  const handleProjectFormSuccess = useCallback((project: { id: string }) => {
    setState((prev) => ({
      ...prev,
      screen: { type: 'projectDetail', projectId: project.id },
      navigationHistory: prev.navigationHistory.filter(s => s.type !== 'projectForm'),
    }));
  }, []);

  // Start work on project (go to FieldMap)
  const handleStartWork = useCallback((projectId: string) => {
    setState((prev) => ({
      ...prev,
      activeTab: 'work',
      screen: { type: 'fieldMap', projectId },
      navigationHistory: [...prev.navigationHistory, prev.screen],
    }));
  }, []);

  // Go back
  const handleBack = useCallback(() => {
    setState((prev) => {
      if (prev.navigationHistory.length === 0) {
        // Fallback to projects tab
        return {
          ...prev,
          activeTab: 'projects',
          screen: { type: 'tab', tab: 'projects' },
        };
      }
      const newHistory = [...prev.navigationHistory];
      const previousScreen = newHistory.pop()!;
      return {
        ...prev,
        screen: previousScreen,
        activeTab: previousScreen.type === 'tab' ? previousScreen.tab : prev.activeTab,
        navigationHistory: newHistory,
      };
    });
  }, []);

  // Navigate to projects
  const handleNavigateToProjects = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activeTab: 'projects',
      screen: { type: 'tab', tab: 'projects' },
      navigationHistory: [],
    }));
  }, []);

  // Navigate to work
  const handleNavigateToWork = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activeTab: 'work',
      screen: { type: 'tab', tab: 'work' },
    }));
  }, []);

  // Theme toggle for keyboard shortcut
  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    root.classList.toggle('dark', !isDark);
    localStorage.setItem('mst-theme', isDark ? 'light' : 'dark');
    haptic.medium();
  }, [haptic]);

  // Keyboard shortcuts for navigation
  useNavigationShortcuts({
    onTab1: () => handleTabChange('home'),
    onTab2: () => handleTabChange('projects'),
    onTab3: () => handleTabChange('work'),
    onTab4: () => handleTabChange('chat'),
    onTab5: () => handleTabChange('settings'),
  });

  // Global keyboard shortcuts
  useGlobalShortcuts({
    onBack: state.navigationHistory.length > 0 ? handleBack : undefined,
    onToggleTheme: toggleTheme,
  });

  // Loading state
  if (isLoading) {
    return <LoadingScreen message="Načítám..." />;
  }

  // Not authenticated - show login
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Render current screen
  const renderScreen = () => {
    const { screen, activeTab } = state;

    // Handle specific screens first
    if (screen.type === 'projectDetail') {
      return (
        <ProjectDetailScreen
          projectId={screen.projectId}
          onBack={handleBack}
          onStartWork={handleStartWork}
          onEdit={handleEditProject}
        />
      );
    }

    if (screen.type === 'projectForm') {
      return (
        <ProjectFormScreen
          projectId={screen.projectId}
          onBack={handleBack}
          onSuccess={handleProjectFormSuccess}
        />
      );
    }

    if (screen.type === 'fieldMap') {
      return (
        <FieldMapScreen
          projectId={screen.projectId}
          onBack={handleBack}
        />
      );
    }

    // Tab screens
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onNavigateToProjects={handleNavigateToProjects}
            onNavigateToWork={handleNavigateToWork}
          />
        );

      case 'projects':
        return (
          <ProjectsScreen
            onSelectProject={handleSelectProject}
            onCreateProject={handleCreateProject}
          />
        );

      case 'work':
        // Pokud není vybraný projekt, zobrazíme projekty pro výběr
        return (
          <ProjectsScreen
            onSelectProject={handleStartWork}
          />
        );

      case 'chat':
        return <ChatScreen />;

      case 'settings':
        return <SettingsScreen appVersion="0.1.0" />;

      default:
        return <HomeScreen />;
    }
  };

  // Determine if we should show tab bar
  const showTabBar = state.screen.type === 'tab';

  // Get badges from notification context
  const { badges } = useNotifications();

  // Tab items with badges
  const tabItemsWithBadges: TabItem[] = useMemo(() => {
    return DEFAULT_TAB_ITEMS.map((item) => {
      const badgeKey = item.id as keyof typeof badges;
      return {
        ...item,
        badge: badges[badgeKey] ?? 0,
      };
    });
  }, [badges]);

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Connectivity banner */}
      <ConnectivityBanner position="top" />

      {/* Main content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {renderScreen()}
      </div>

      {/* Tab bar - only show on tab screens */}
      {showTabBar && (
        <TabBar
          items={tabItemsWithBadges}
          activeId={state.activeTab}
          onChange={handleTabChange}
          variant="floating"
        />
      )}

      {/* PWA Install prompt */}
      <InstallPrompt
        canInstall={pwaState.canInstall}
        isInstalled={pwaState.isInstalled || pwaState.isStandalone}
        onInstall={install}
      />

      {/* PWA Update prompt */}
      {!updateDismissed && (
        <UpdatePrompt
          isUpdateAvailable={pwaState.isUpdateAvailable}
          onUpdate={update}
          onDismiss={() => setUpdateDismissed(true)}
        />
      )}
    </div>
  );
}

/**
 * App Component - root s providery
 */
export function App() {
  // Inicializovat theme z localStorage
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('mst-theme') as 'light' | 'dark' | 'system' | null;
    const theme = savedTheme ?? 'system';
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
      
      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        const currentTheme = localStorage.getItem('mst-theme');
        if (currentTheme === 'system' || !currentTheme) {
          document.documentElement.classList.toggle('dark', e.matches);
        }
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, []);

  // Inicializovat Firebase pokud je nakonfigurován
  React.useEffect(() => {
    if (isFirebaseConfigured()) {
      try {
        initializeFirebase();
        syncService.initialize();
      } catch (error) {
        console.warn('[App] Firebase init failed:', error);
      }
    }
  }, []);

  return (
    <ToastProvider position="top">
      <NotificationProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </NotificationProvider>
    </ToastProvider>
  );
}

export default App;
