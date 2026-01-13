import React, { useState, useEffect } from 'react';
import { useNotes } from '../contexts/NotesContext';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import NoteEditor from './NoteEditor';
import ModuleView from './ModuleView';
import Homepage from './Homepage';
import DirectSearch from './DirectSearch';
import { Note, Folder } from '../types';
import { SearchResult } from '../lib/directSearch';
import { XMarkIcon, Bars3Icon, HomeIcon, MagnifyingGlassIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import ThemeToggle from './ThemeToggle';
import { supabase } from '../lib/supabase';

const Dashboard: React.FC = () => {
  const { currentNote, loading: notesLoading, uploadingLecture, clearCurrentNote, selectNote, folders } = useNotes();
  const { user, profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showHomepage, setShowHomepage] = useState(() => !currentNote);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Folder | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    if (showSearch) setShowSearch(false);
  };

  const goToHomepage = () => {
    clearCurrentNote();
    setShowHomepage(true);
    setShowSearch(false);
    setSelectedModule(null);
  };

  const handleModuleSelect = (module: Folder) => {
    setSelectedModule(module);
    setShowHomepage(false);
    setShowSearch(false);
  };

  const handleBackToModules = () => {
    setSelectedModule(null);
    setShowHomepage(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigation will be handled by the route protection
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Keep local view state in sync with whether a note is selected
  useEffect(() => {
    if (currentNote) {
      setShowHomepage(false);
      setSelectedModule(null);
    }
  }, [currentNote]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        const target = event.target as Element;
        if (!target.closest('.user-menu-container')) {
          setShowUserMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden">
      {/* Sidebar - Fixed height with its own scrolling */}
      <div className="flex-shrink-0">
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} onModuleSelect={handleModuleSelect} />
      </div>
      
      {/* Main Content Area - Separate scrolling */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Show upload indicator if uploading */}
        {uploadingLecture && (
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative px-4 py-3 text-white text-center backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing lecture... Please wait.
              </div>
            </div>
          </div>
        )}
        
        {/* Top Navigation Bar - Slim & Fluid */}
        {!showSearch && (
          <div className="header-bar header-bar-light dark:header-bar-dark">
            <div className="relative flex items-center justify-between">
              {/* Left: Home + Breadcrumb */}
              <div className="flex items-center gap-2">
                <button
                  onClick={goToHomepage}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                    showHomepage && !selectedModule 
                      ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-700 dark:text-blue-300 border border-blue-300/30 dark:border-blue-500/30' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-white/5'
                  }`}
                >
                  <HomeIcon className="w-3.5 h-3.5" />
                  <span>Home</span>
                </button>
                {selectedModule && (
                  <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
                    <span className="text-xs">/</span>
                    <span className="px-2 py-0.5 bg-gray-100/80 dark:bg-gray-800/60 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                      {selectedModule.name}
                    </span>
                  </div>
                )}
                {currentNote && (
                  <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
                    <span className="text-xs">/</span>
                    <span className="px-2 py-0.5 bg-gray-100/80 dark:bg-gray-800/60 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 max-w-[150px] truncate">
                      {currentNote.title || 'Untitled'}
                    </span>
                  </div>
                )}
              </div>
              {/* Right: User Menu */}
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-white/5 transition-all duration-200"
                >
                  <UserCircleIcon className="w-4 h-4" />
                  <span className="hidden sm:block">
                    {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                  </span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-1.5 w-44 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 py-1 z-50 overflow-hidden">
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700/50">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
        {showSearch ? (
                <DirectSearch 
                  onResultClick={async (result: SearchResult) => {
                    try {
                      const { data } = await supabase
                        .from('notes')
                        .select('*')
                        .eq('id', result.note_id)
                        .single();
                      
                      if (data) {
                        selectNote(data as Note);
                        setShowSearch(false);
                        setShowHomepage(false);
                      }
                    } catch (error) {
                      console.error('Error fetching note:', error);
                    }
                  }} 
                />
           ) : selectedModule ? (
            <ModuleView 
              module={selectedModule}
              onBack={handleBackToModules}
              onNoteSelect={(note: Note) => {
                selectNote(note);
                setShowHomepage(false);
                setSelectedModule(null);
              }}
            />
          ) : showHomepage ? (
            <Homepage onModuleSelect={handleModuleSelect} />
          ) : currentNote ? (
            <NoteEditor 
              note={currentNote}
              onNavigateBack={() => {
                if (currentNote.folder_id) {
                  // If note belongs to a folder, go back to that module
                  const folder = folders.find((f: Folder) => f.id === currentNote.folder_id);
                  if (folder) {
                    setSelectedModule(folder);
                    setShowHomepage(false);
                  } else {
                    // Fallback to homepage if folder not found
                    setShowHomepage(true);
                    setSelectedModule(null);
                  }
                } else {
                  // If note doesn't belong to a folder, go to homepage
                  setShowHomepage(true);
                  setSelectedModule(null);
                }
                clearCurrentNote();
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full relative">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-gray-100/30 to-gray-200/50 dark:from-gray-950/30 dark:via-gray-900/20 dark:to-gray-800/30" />
              
              {/* Animated background elements */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gray-200/20 dark:bg-gray-800/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-200/20 dark:bg-purple-800/20 rounded-full blur-3xl animate-pulse delay-1000" />
              </div>
              
              <div className="relative text-center">
                <div className="mb-6">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-lg opacity-20" />
                    <div className="relative p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20">
                      <HomeIcon className="w-12 h-12 mx-auto text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                  No note selected
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                  Select a note from the sidebar to start editing
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;