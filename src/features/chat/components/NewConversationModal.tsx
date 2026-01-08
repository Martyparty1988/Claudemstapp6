/**
 * MST New Conversation Modal
 * 
 * Modal pro vytvoření nové konverzace.
 * Podporuje:
 * - Direct message (1:1)
 * - Skupinový chat
 * - Projektový chat
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Input,
  Button,
  GradientButton,
  Avatar,
  LoadingSpinner,
  EmptyState,
} from '../../../shared';
import { useNewConversation } from '../../../application/hooks/useChat';
import { useProjects } from '../../../application';
import type { ChatUserVM } from '../../../application/view-models/chat-vm';

/**
 * Tab type
 */
type TabType = 'users' | 'project';

/**
 * Props
 */
export interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (conversationId: string) => void;
}

/**
 * NewConversationModal Component
 */
export function NewConversationModal({
  isOpen,
  onClose,
  onCreated,
}: NewConversationModalProps) {
  const {
    users,
    selectedUserIds,
    isCreating,
    isLoading: isLoadingUsers,
    loadUsers,
    toggleUser,
    createConversation,
    clearSelection,
  } = useNewConversation();

  const { projects, loadProjects } = useProjects();

  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Load data on open
  useEffect(() => {
    if (isOpen) {
      loadUsers();
      loadProjects();
    }
  }, [isOpen, loadUsers, loadProjects]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      clearSelection();
      setSearchQuery('');
      setGroupName('');
      setSelectedProjectId(null);
      setActiveTab('users');
    }
  }, [isOpen, clearSelection]);

  // Filter users by search
  const filteredUsers = useMemo(() => {
    if (!users || users.length === 0) return [];
    if (!searchQuery) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.role.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  // Filter projects by search
  const filteredProjects = useMemo(() => {
    if (!projects.data) return [];
    if (!searchQuery) return projects.data;
    
    const query = searchQuery.toLowerCase();
    return projects.data.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.location?.toLowerCase().includes(query))
    );
  }, [projects.data, searchQuery]);

  // Determine conversation type
  const conversationType = useMemo(() => {
    if (selectedProjectId) return 'project';
    if (selectedUserIds.length > 1) return 'group';
    return 'direct';
  }, [selectedUserIds.length, selectedProjectId]);

  // Can create?
  const canCreate = useMemo(() => {
    if (activeTab === 'project') {
      return selectedProjectId !== null;
    }
    if (selectedUserIds.length === 0) return false;
    if (selectedUserIds.length > 1 && !groupName.trim()) return false;
    return true;
  }, [activeTab, selectedUserIds.length, groupName, selectedProjectId]);

  // Handle create
  const handleCreate = async () => {
    let conversationId: string | null = null;

    if (activeTab === 'project' && selectedProjectId) {
      // Vytvoření projektového chatu
      conversationId = await createConversation('project', `Projekt`, selectedProjectId);
    } else {
      // Direct nebo group
      const type = selectedUserIds.length > 1 ? 'group' : 'direct';
      const name = selectedUserIds.length > 1 ? groupName.trim() : undefined;
      conversationId = await createConversation(type, name);
    }

    if (conversationId) {
      onCreated(conversationId);
      onClose();
    }
  };

  // Render user item
  const renderUserItem = (user: ChatUserVM) => {
    const isSelected = selectedUserIds.includes(user.id);

    return (
      <button
        key={user.id}
        onClick={() => toggleUser(user.id)}
        className={`
          w-full flex items-center gap-3 p-3 rounded-xl transition-all
          ${isSelected
            ? 'bg-brand-100 dark:bg-brand-900/30 ring-2 ring-brand-500'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          }
        `}
      >
        {/* Avatar */}
        <div className="relative">
          <Avatar
            name={user.name}
            size="md"
            status={user.isOnline ? 'online' : 'offline'}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 text-left">
          <p className="font-medium text-slate-900 dark:text-white truncate">
            {user.name}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
            {user.role}
            {!user.isOnline && user.lastSeen && ` · ${user.lastSeen}`}
          </p>
        </div>

        {/* Checkbox */}
        <div className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
          ${isSelected
            ? 'bg-brand-500 border-brand-500'
            : 'border-slate-300 dark:border-slate-600'
          }
        `}>
          {isSelected && (
            <CheckIcon className="w-4 h-4 text-white" />
          )}
        </div>
      </button>
    );
  };

  // Render project item
  const renderProjectItem = (project: { id: string; name: string; location?: string | null }) => {
    const isSelected = selectedProjectId === project.id;

    return (
      <button
        key={project.id}
        onClick={() => setSelectedProjectId(isSelected ? null : project.id)}
        className={`
          w-full flex items-center gap-3 p-3 rounded-xl transition-all
          ${isSelected
            ? 'bg-brand-100 dark:bg-brand-900/30 ring-2 ring-brand-500'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          }
        `}
      >
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
          <ProjectIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 text-left">
          <p className="font-medium text-slate-900 dark:text-white truncate">
            {project.name}
          </p>
          {project.location && (
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
              {project.location}
            </p>
          )}
        </div>

        {/* Radio */}
        <div className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
          ${isSelected
            ? 'bg-brand-500 border-brand-500'
            : 'border-slate-300 dark:border-slate-600'
          }
        `}>
          {isSelected && (
            <div className="w-2 h-2 bg-white rounded-full" />
          )}
        </div>
      </button>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
    >
      <ModalHeader
        title="Nová konverzace"
        onClose={onClose}
      />

      <ModalContent className="p-0">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('users')}
            className={`
              flex-1 py-3 text-sm font-medium transition-colors
              ${activeTab === 'users'
                ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-500'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }
            `}
          >
            <UsersIcon className="w-4 h-4 inline mr-2" />
            Uživatelé
          </button>
          <button
            onClick={() => setActiveTab('project')}
            className={`
              flex-1 py-3 text-sm font-medium transition-colors
              ${activeTab === 'project'
                ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-500'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }
            `}
          >
            <ProjectIcon className="w-4 h-4 inline mr-2" />
            Projekt
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <Input
            placeholder={activeTab === 'users' ? 'Hledat uživatele...' : 'Hledat projekt...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<SearchIcon className="w-5 h-5" />}
            variant="solid"
          />
        </div>

        {/* Selected users chips (for group) */}
        {activeTab === 'users' && selectedUserIds.length > 0 && (
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-2">
              {selectedUserIds.map((userId) => {
                const user = users.find((u) => u.id === userId);
                if (!user) return null;
                return (
                  <div
                    key={userId}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-100 dark:bg-brand-900/30 rounded-full"
                  >
                    <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
                      {user.name.split(' ')[0]}
                    </span>
                    <button
                      onClick={() => toggleUser(userId)}
                      className="w-4 h-4 rounded-full bg-brand-200 dark:bg-brand-800 hover:bg-brand-300 dark:hover:bg-brand-700 flex items-center justify-center"
                    >
                      <XIcon className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Group name input */}
        {activeTab === 'users' && selectedUserIds.length > 1 && (
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <Input
              label="Název skupiny"
              placeholder="např. Tým A, Ranní směna..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              variant="solid"
            />
          </div>
        )}

        {/* Content */}
        <div className="max-h-80 overflow-y-auto p-4">
          {activeTab === 'users' && (
            <>
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <EmptyState
                  title={searchQuery ? 'Nic nenalezeno' : 'Žádní uživatelé'}
                  description={searchQuery ? 'Zkuste jiný hledaný výraz' : 'Nejsou k dispozici žádní uživatelé'}
                  className="py-8"
                />
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map(renderUserItem)}
                </div>
              )}
            </>
          )}

          {activeTab === 'project' && (
            <>
              {projects.status === 'loading' ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : filteredProjects.length === 0 ? (
                <EmptyState
                  title={searchQuery ? 'Nic nenalezeno' : 'Žádné projekty'}
                  description={searchQuery ? 'Zkuste jiný hledaný výraz' : 'Nejsou k dispozici žádné projekty'}
                  className="py-8"
                />
              ) : (
                <div className="space-y-2">
                  {filteredProjects.map(renderProjectItem)}
                </div>
              )}
            </>
          )}
        </div>
      </ModalContent>

      <ModalFooter>
        <div className="flex items-center justify-between w-full">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {activeTab === 'users' && selectedUserIds.length > 0 && (
              <span>
                {selectedUserIds.length === 1
                  ? 'Přímá zpráva'
                  : `Skupina (${selectedUserIds.length} členů)`
                }
              </span>
            )}
            {activeTab === 'project' && selectedProjectId && (
              <span>Projektový chat</span>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
            >
              Zrušit
            </Button>
            <GradientButton
              gradient="brand"
              onClick={handleCreate}
              disabled={!canCreate}
              loading={isCreating}
            >
              {conversationType === 'direct' ? 'Napsat' : 'Vytvořit'}
            </GradientButton>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
}

/**
 * Icons
 */
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function ProjectIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default NewConversationModal;
