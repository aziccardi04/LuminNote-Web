import React, { useEffect, useState } from 'react';
import { useNotes } from '../contexts/NotesContext';
import { Note, Folder, SimilaritySearchResult } from '../types';
import {
  PlusIcon,
  FolderIcon,
  DocumentTextIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  CloudArrowUpIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid
} from '@heroicons/react/24/solid';
import LectureUpload from './LectureUpload';
import DirectSearch from './DirectSearch';
import { SearchResult } from '../lib/directSearch';


// Define props interface
interface HomepageProps {
  onModuleSelect?: (module: Folder) => void;
}

// Module colors array
const moduleColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#FF69B4', // Hot Pink
  '#FFB6C1', // Light Pink
  '#FFC0CB', // Pink
  '#FF1493', // Deep Pink
  '#DA70D6', // Orchid
  '#DDA0DD', // Plum
  '#E6E6FA', // Lavender
  '#F0E68C', // Khaki
  '#FFE4E1', // Misty Rose
  '#FFEFD5', // Papaya Whip
  '#F5DEB3', // Wheat
  '#D8BFD8', // Thistle
  '#B19CD9', // Light Purple
  '#C8A2C8', // Lilac
];

const Homepage: React.FC<HomepageProps> = ({ onModuleSelect }) => {
  const { 
    notes, 
    folders, 
    createFolder, 
    createEmptyNote, 
    selectNote, 
    toggleNoteFavorite,
  } = useNotes();
  
  const [showCreateModule, setShowCreateModule] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');
  const [newModuleDescription, setNewModuleDescription] = useState('');
  const [selectedModuleColor, setSelectedModuleColor] = useState('#3B82F6');
  const [createModuleError, setCreateModuleError] = useState<string | null>(null);
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [showLectureUpload, setShowLectureUpload] = useState<string | null>(null);
  // Search is now always visible with DirectSearch component // Add this line

  // Helper function to format dates
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get notes from this week
  const getNotesThisWeek = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return notes.filter((note: Note) => new Date(note.updated_at) > weekAgo).length;
  };

  // Get recent notes (last 7 days)
  const getRecentNotes = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return notes
      .filter((note: Note) => new Date(note.updated_at) > weekAgo)
      .sort((a: Note, b: Note) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);
  };

  const getFavoriteNotes = () => {
    return notes
      .filter((note: Note) => note.is_favorite)
      .sort((a: Note, b: Note) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);
  };

  const handleSearchResultClick = (result: SimilaritySearchResult | SearchResult) => {
    // Find the note by ID and select it
    // Both SimilaritySearchResult and SearchResult have note_id property
    const noteId = result.note_id;
    
    const note = notes.find((n: Note) => n.id === noteId);
    if (note) {
      selectNote(note);
    }
  };

  // Add the missing handleToggleFavorite function
  const handleToggleFavorite = async (e: React.MouseEvent, noteId: string) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleNoteFavorite(noteId);
  };

  // Add the missing handleFormSubmit function
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newModuleName.trim()) {
      setCreateModuleError('Module name is required');
      return;
    }

    setIsCreatingModule(true);
    setCreateModuleError(null);

    try {
      await createFolder(newModuleName.trim(), selectedModuleColor, newModuleDescription.trim());
      
      // Reset form
      setNewModuleName('');
      setNewModuleDescription('');
      setSelectedModuleColor('#3B82F6');
      setShowCreateModule(false);
    } catch (error) {
      console.error('Error creating module:', error);
      setCreateModuleError('Failed to create module. Please try again.');
    } finally {
      setIsCreatingModule(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="page-container max-w-7xl mx-auto">

      {/* Stats Overview - Compact, unified cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Modules', value: folders.length, icon: FolderIcon, color: 'from-blue-500 to-indigo-500' },
          { label: 'Notes', value: notes.length, icon: DocumentTextIcon, color: 'from-emerald-500 to-teal-500' },
          { label: 'This Week', value: getNotesThisWeek(), icon: ClockIcon, color: 'from-violet-500 to-purple-500' },
          { label: 'Favorites', value: getFavoriteNotes().length, icon: HeartIconSolid, color: 'from-pink-500 to-rose-500' },
        ].map((stat) => (
          <div key={stat.label} className="card-base card-light dark:card-dark p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption mb-0.5">{stat.label}</p>
                <p className="text-h2 text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Direct Search Section - Cleaner */}
      <div className="card-base card-light dark:card-dark p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
          <h2 className="text-h3 text-gray-900 dark:text-white">Search Notes</h2>
        </div>
        <DirectSearch onResultClick={handleSearchResultClick} />
      </div>

      {/* Your Modules Section */}
      <div className="card-base card-light dark:card-dark p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderIcon className="w-4 h-4 text-gray-400" />
            <h2 className="text-h3 text-gray-900 dark:text-white">Your Modules</h2>
          </div>
          <button
            onClick={() => setShowCreateModule(true)}
            className="btn-primary text-xs h-8 px-3"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Create Module
          </button>
        </div>

        {folders.length === 0 ? (
          <div className="text-center py-10">
            <FolderIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-h3 text-gray-900 dark:text-white mb-1">
              Create your first module
            </h3>
            <p className="text-caption mb-4">
              Organize your notes by subject or topic
            </p>
            <button
              onClick={() => setShowCreateModule(true)}
              className="btn-primary text-xs h-8"
            >
              Create Module
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {folders.map((folder: Folder) => {
              const folderNotes = notes.filter((note: Note) => note.folder_id === folder.id);
              const recentNotes = folderNotes
                .sort((a: Note, b: Note) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                .slice(0, 2);

              return (
                <div
                  key={folder.id}
                  className="card-base card-light dark:card-dark cursor-pointer group relative overflow-hidden"
                  onClick={() => onModuleSelect && onModuleSelect(folder)}
                >
                  {/* Subtle left accent line - Notion style */}
                  <div 
                    className="absolute left-0 top-5 bottom-5 w-0.5 rounded-full"
                    style={{ backgroundColor: folder.color || '#3B82F6' }}
                  />
                  
                  <div className="pl-4">
                    <h3 className="text-h3 text-gray-900 dark:text-white mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {folder.name}
                    </h3>
                    {folder.description && (
                      <p className="text-body text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {folder.description}
                      </p>
                    )}
                    <p className="text-caption">
                      {folderNotes.length} {folderNotes.length === 1 ? 'note' : 'notes'}
                    </p>
                  </div>

                  {recentNotes.length > 0 && (
                    <div className="pl-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/30">
                      <p className="text-label mb-1.5">Recent</p>
                      <div className="space-y-1">
                        {recentNotes.map((note: Note) => (
                          <p key={note.id} className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {note.title || 'Untitled'}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-1.5 mt-3 pl-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        createEmptyNote(folder.id);
                      }}
                      className="btn-secondary text-xs px-2.5 py-1.5 h-auto"
                    >
                      <PlusIcon className="w-3 h-3" />
                      Note
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowLectureUpload(folder.id);
                      }}
                      className="btn-ghost text-xs px-2.5 py-1.5 h-auto"
                    >
                      <CloudArrowUpIcon className="w-3 h-3" />
                      Upload
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
          </div>
        </div>

      {/* Recent & Favorites Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        {/* Recent Notes */}
        <div className="card-base card-light dark:card-dark p-4">
          <div className="flex items-center gap-2 mb-3">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <h3 className="text-h3 text-gray-900 dark:text-white">Recent</h3>
          </div>
          
          {getRecentNotes().length === 0 ? (
            <p className="text-caption">No recent notes</p>
          ) : (
            <div className="space-y-1.5">
              {getRecentNotes().slice(0, 4).map((note: Note) => (
                <div
                  key={note.id}
                  onClick={() => selectNote(note)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {note.title || 'Untitled'}
                    </p>
                    <p className="text-caption">{formatDate(note.updated_at)}</p>
                  </div>
                  <button
                    onClick={(e) => handleToggleFavorite(e, note.id)}
                    className="opacity-0 group-hover:opacity-100 btn-icon"
                  >
                    {note.is_favorite ? (
                      <HeartIconSolid className="w-3.5 h-3.5 text-red-500" />
                    ) : (
                      <HeartIcon className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Favorites */}
        <div className="card-base card-light dark:card-dark p-4">
          <div className="flex items-center gap-2 mb-3">
            <HeartIcon className="w-4 h-4 text-gray-400" />
            <h3 className="text-h3 text-gray-900 dark:text-white">Favorites</h3>
          </div>
          
          {getFavoriteNotes().length === 0 ? (
            <p className="text-caption">No favorites yet</p>
          ) : (
            <div className="space-y-1.5">
              {getFavoriteNotes().slice(0, 4).map((note: Note) => (
                <div
                  key={note.id}
                  onClick={() => selectNote(note)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {note.title || 'Untitled'}
                    </p>
                    <p className="text-caption">{formatDate(note.updated_at)}</p>
                  </div>
                  <button
                    onClick={(e) => handleToggleFavorite(e, note.id)}
                    className="btn-icon"
                  >
                    <HeartIconSolid className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Module Modal - Clean & Modern */}
      {showCreateModule && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 w-full max-w-md shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-h2 text-gray-900 dark:text-white mb-4">Create Module</h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-label mb-1.5 block">Module Name *</label>
                <input
                  type="text"
                  value={newModuleName}
                  onChange={(e) => {
                    setNewModuleName(e.target.value);
                    setCreateModuleError(null);
                  }}
                  placeholder="e.g., Computer Science 101"
                  className="input-base w-full"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="text-label mb-1.5 block">Description (Optional)</label>
                <textarea
                  value={newModuleDescription}
                  onChange={(e) => setNewModuleDescription(e.target.value)}
                  placeholder="Brief description..."
                  rows={2}
                  className="input-base w-full resize-none"
                />
              </div>

              <div>
                <label className="text-label mb-2 block">Color</label>
                <div className="flex gap-1.5 flex-wrap">
                  {moduleColors.slice(0, 12).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedModuleColor(color)}
                      className={`w-6 h-6 rounded-full transition-all ${
                        selectedModuleColor === color 
                          ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 scale-110' 
                          : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {createModuleError && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{createModuleError}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModule(false);
                    setCreateModuleError(null);
                    setNewModuleName('');
                    setNewModuleDescription('');
                    setSelectedModuleColor('#3B82F6');
                  }}
                  className="btn-ghost flex-1"
                  disabled={isCreatingModule}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newModuleName.trim() || isCreatingModule}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingModule ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lecture Upload Modal */}
      {showLectureUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upload Lecture
              </h3>
              <button
                onClick={() => setShowLectureUpload(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>
            <LectureUpload 
              isOpen={true}
              onClose={() => setShowLectureUpload(null)}
              folderId={showLectureUpload}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Homepage;