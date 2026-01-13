import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNotes } from '../contexts/NotesContext';
import { Folder, Note } from '../types';
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronRightIcon as ChevronRightSmallIcon,
  CogIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import LectureUpload from './LectureUpload';
import Settings from './Settings';
import ConfirmDialog from './ConfirmDialog';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onModuleSelect?: (module: Folder) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, onModuleSelect }) => {
  const { folders, notes, createEmptyNote, createFolder, deleteFolder, loading, selectNote, toggleNoteFavorite, getUnassignedNotes, updateNote } = useNotes();
  const { theme } = useTheme();
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showLectureUpload, setShowLectureUpload] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showUnassignedNotes, setShowUnassignedNotes] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; folderId: string | null }>({ isOpen: false, folderId: null });

  React.useEffect(() => {
    if (!loading && !initialized) {
      setInitialized(true);
    }
  }, [loading, initialized]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        document.querySelectorAll('.dropdown-menu').forEach(dropdown => {
          dropdown.classList.add('hidden');
        });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolder(false);
    }
  };

  const handleCreateNote = async (folderId?: string) => {
    try {
      await createEmptyNote(folderId);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleDeleteFolder = async (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    setDeleteConfirm({ isOpen: true, folderId });
  };

  const confirmDeleteFolder = async () => {
    if (deleteConfirm.folderId) {
      try {
        await deleteFolder(deleteConfirm.folderId);
      } catch (error) {
        console.error('Error deleting folder:', error);
      }
    }
    setDeleteConfirm({ isOpen: false, folderId: null });
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  return (
    <div className={`relative flex flex-col h-screen transition-all duration-300 ease-out ${
      isOpen ? 'w-64' : 'w-16'
    } bg-gray-50 dark:bg-[#0a0f1a] border-r border-gray-200 dark:border-white/[0.06]`}>
      
      {/* ═══════════════════════════════════════════════════════════
          HEADER - Logo & Toggle
          ═══════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between h-14 px-4">
        {isOpen && (
          <img 
            src="/logo-glass.png" 
            alt="LuminNote" 
            className="w-7 h-7 object-contain"
          />
        )}
        <button
          onClick={onToggle}
          className={`p-2 rounded-xl bg-gray-100 dark:bg-white/[0.04] hover:bg-gray-200 dark:hover:bg-white/[0.08] border border-gray-200 dark:border-white/[0.06] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-all duration-200 ${!isOpen ? 'mx-auto' : ''}`}
        >
          {isOpen ? (
            <ChevronLeftIcon className="w-4 h-4" />
          ) : (
            <ChevronRightIcon className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          NEW NOTE BUTTON
          ═══════════════════════════════════════════════════════════ */}
      {isOpen && (
        <div className="px-3 pb-3">
          <button
            onClick={() => handleCreateNote()}
            className="w-full h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
          >
            <PlusIcon className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          FAVORITES TOGGLE
          ═══════════════════════════════════════════════════════════ */}
      {isOpen && (
        <div className="px-3 pb-2">
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`w-full h-9 rounded-lg flex items-center justify-center gap-2 text-sm transition-all duration-200 ${
              showFavorites 
                ? 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-500/20' 
                : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.04]'
            }`}
          >
            <HeartIcon className="w-4 h-4" />
            <span>Favorites</span>
          </button>
        </div>
      )}

      {/* Favorites Dropdown */}
      {isOpen && showFavorites && (
        <div className="px-3 pb-3">
          <div className="bg-gray-100 dark:bg-white/[0.02] rounded-xl border border-gray-200 dark:border-white/[0.06] p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-medium">Favorites</span>
              <button 
                onClick={() => setShowFavorites(false)}
                className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-white/[0.06] text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <ChevronLeftIcon className="w-3 h-3" />
              </button>
            </div>
            
            {notes.filter((note: Note) => note.is_favorite).length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-600 py-3 text-center">No favorites yet</p>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {notes
                  .filter((note: Note) => note.is_favorite)
                  .sort((a: Note, b: Note) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                  .map((note: Note) => (
                    <div
                      key={note.id}
                      onClick={() => selectNote(note)}
                      className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/[0.04] cursor-pointer transition-colors group"
                    >
                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1 mr-2">
                        {note.title || 'Untitled'}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleNoteFavorite(note.id);
                        }}
                        className="p-1 rounded-md hover:bg-gray-300 dark:hover:bg-white/[0.06] transition-colors"
                      >
                        <HeartIconSolid className="w-3 h-3 text-red-500 dark:text-red-400" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* ═══════════════════════════════════════════════════════════
          DIVIDER
          ═══════════════════════════════════════════════════════════ */}
      {isOpen && <div className="mx-4 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-white/[0.08] to-transparent" />}

      {/* ═══════════════════════════════════════════════════════════
          UNASSIGNED NOTES
          ═══════════════════════════════════════════════════════════ */}
      {isOpen && (
        <div className="px-3 py-3">
          <div className="rounded-xl bg-gray-100 dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06] overflow-hidden">
            <button
              onClick={() => setShowUnassignedNotes(!showUnassignedNotes)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-200 dark:hover:bg-white/[0.02] transition-colors group"
            >
              <ChevronRightSmallIcon className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${showUnassignedNotes ? 'rotate-90' : ''}`} />
              <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1 text-left">Unassigned Notes</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">{getUnassignedNotes().length}</span>
            </button>
            
            {showUnassignedNotes && (
              <div className="px-3 pb-3 space-y-1 max-h-36 overflow-y-auto">
                {getUnassignedNotes().length === 0 ? (
                  <div className="text-xs text-gray-400 dark:text-gray-600 py-2 text-center">No unassigned notes</div>
                ) : (
                  getUnassignedNotes()
                    .sort((a: Note, b: Note) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                    .map((note: Note) => (
                      <div
                        key={note.id}
                        onClick={() => selectNote(note)}
                        className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-white dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer transition-colors group border border-gray-200 dark:border-white/[0.04]"
                      >
                        <div className="flex-1 min-w-0 mr-2">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{note.title || 'Untitled'}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-600">{new Date(note.updated_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="relative dropdown-container">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                document.querySelectorAll('.dropdown-menu').forEach(dropdown => dropdown.classList.add('hidden'));
                                const dropdown = e.currentTarget.nextElementSibling as HTMLElement;
                                if (dropdown) dropdown.classList.toggle('hidden');
                              }}
                              className="p-1 rounded-md bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-500 dark:text-blue-400 transition-colors"
                              title="Move to module"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25H11.69Z" />
                              </svg>
                            </button>
                            <div className="dropdown-menu hidden absolute right-0 top-7 z-[60] bg-white dark:bg-[#0f1420] border border-gray-200 dark:border-white/[0.08] rounded-lg shadow-2xl min-w-[140px] max-h-40 overflow-y-auto">
                              {folders.map((folder) => (
                                <button
                                  key={folder.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateNote(note.id, { folder_id: folder.id });
                                    const dropdown = e.currentTarget.parentElement as HTMLElement;
                                    if (dropdown) dropdown.classList.add('hidden');
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300"
                                >
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: folder.color || '#6B7280' }} />
                                  <span className="truncate">{folder.name}</span>
                                </button>
                              ))}
                              {folders.length === 0 && (
                                <div className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500">No modules available</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODULES SECTION
          ═══════════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto px-3">
        {!initialized ? (
          <div className="py-8 text-center">
            <div className="text-sm text-gray-400 dark:text-gray-500">Loading...</div>
          </div>
        ) : (
          <>
            {isOpen && (
              <div className="py-2 px-1">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-medium">Modules</span>
              </div>
            )}
            
            {/* New Folder Input */}
            {showNewFolder && isOpen && (
              <div className="mb-3 p-3 rounded-xl bg-gray-100 dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06]">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Module name"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                  autoFocus
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleCreateFolder}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-white rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 transition-all"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => { setShowNewFolder(false); setNewFolderName(''); }}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 rounded-lg bg-gray-200 dark:bg-white/[0.04] hover:bg-gray-300 dark:hover:bg-white/[0.08] border border-gray-300 dark:border-white/[0.06] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Folders List */}
            <div className="space-y-0.5">
              {folders.map((folder: Folder) => {
                const isExpanded = expandedFolders.has(folder.id);
                return (
                  <div key={folder.id}>
                    <div className="group flex items-center gap-2 h-10 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-all duration-150">
                      <button
                        onClick={() => { toggleFolder(folder.id); onModuleSelect?.(folder); }}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        <ChevronRightSmallIcon className={`w-4 h-4 text-gray-400 dark:text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                        <div
                          className="w-2 h-2 rounded-full border-2 bg-transparent"
                          style={{ borderColor: folder.color || '#3B82F6' }}
                        />
                        {isOpen && (
                          <span className="text-[14px] font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white truncate transition-colors">{folder.name}</span>
                        )}
                      </button>
                      {isOpen && (
                        <button
                          onClick={() => handleCreateNote(folder.id)}
                          className="p-1.5 rounded-md text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-all duration-150"
                          title="New Note"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SETTINGS
          ═══════════════════════════════════════════════════════════ */}
      <div className="p-3 border-t border-gray-200 dark:border-white/[0.06]">
        <button
          onClick={() => setShowSettings(true)}
          className={`flex items-center gap-3 h-10 px-3 rounded-lg text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-all duration-200 ${isOpen ? 'w-full' : 'justify-center'}`}
        >
          <CogIcon className="w-5 h-5" />
          {isOpen && <span className="text-sm font-medium">Settings</span>}
        </button>
      </div>
      
      {/* Modals */}
      {showLectureUpload && (
        <LectureUpload 
          isOpen={showLectureUpload}
          onClose={() => setShowLectureUpload(false)} 
        />
      )}
      
      {showSettings && (
        <Settings 
          isOpen={showSettings}
          onClose={() => setShowSettings(false)} 
        />
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, folderId: null })}
        onConfirm={confirmDeleteFolder}
        title="Delete Module"
        message="Are you sure you want to delete this module and all its notes?"
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default Sidebar;
