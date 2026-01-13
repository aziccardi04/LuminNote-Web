import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNotes } from '../contexts/NotesContext';
import { supabase } from '../lib/supabase';
import RichTextEditor from './RichTextEditor';
import ReferenceSidebar from './ReferenceSidebar';
import ReferenceTooltip from './ReferenceTooltip';
import UpgradePrompt from './UpgradePrompt';
import { QUOTA_EXHAUSTED_MESSAGE } from '../lib/upgradeCopy';
import { Reference, CitationStyle } from '../types'; // Add CitationStyle import
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'

interface NoteEditorProps {
  note: any;
  onNavigateBack?: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onNavigateBack }) => {
  const { updateNote, fetchReferences, uploadingLecture, lectureProgress, lecturePhase, lectureEtaSeconds, toggleNoteFavorite } = useNotes();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  // Fix: Use note.note_references instead of note.references
  const [references, setReferences] = useState<Reference[]>(note.note_references || []);
  const [isReferencesSidebarOpen, setIsReferencesSidebarOpen] = useState(false);
  const [referencesLoading, setReferencesLoading] = useState(false);
  const [referencesError, setReferencesError] = useState<string | null>(null);
  const [upgradePrompt, setUpgradePrompt] = useState<{
    isOpen: boolean;
    featureName: string;
    featureDescription: string;
  }>({ isOpen: false, featureName: '', featureDescription: '' });
  const [tooltipState, setTooltipState] = useState<{
    reference: Reference | null;
    position: { x: number; y: number } | null;
    isVisible: boolean;
  }>({
    reference: null,
    position: null,
    isVisible: false
  });

  // ADD THIS: Sync local state with prop changes (for streaming updates)
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.title, note.content]);

  // True debounce with cancellation; suppress during lecture upload streaming
  const autosaveTimerRef = useRef<number | null>(null);
  const debouncedSave = useCallback(
    (id: string, updates: any) => {
      // Suppress autosave while lecture notes are streaming to avoid PATCH storms
      if (uploadingLecture && note?.type === 'lecture') return;
      // Cancel any pending autosave
      if (autosaveTimerRef.current !== null) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
      // Schedule next autosave
      autosaveTimerRef.current = window.setTimeout(() => {
        // Skip embedding for autosaves - only embed when user navigates away
        updateNote(id, updates, true);
        autosaveTimerRef.current = null;
      }, 1000);
    },
    [updateNote, uploadingLecture, note?.type]
  );

  useEffect(() => {
    // Cleanup any pending autosave when unmounting or switching notes
    return () => {
      if (autosaveTimerRef.current !== null) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
  }, [note.id]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    debouncedSave(note.id, { title: newTitle });
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    debouncedSave(note.id, { content: newContent });
  };

  const handleReferenceHover = (reference: Reference, position: { x: number; y: number }) => {
    setTooltipState({ reference, position, isVisible: true });
  };

  const handleReferenceLeave = () => {
    setTooltipState({ reference: null, position: null, isVisible: false });
  };

  const handleFetchReferences = async (citationStyle: CitationStyle) => {
    try {
      setReferencesError(null);
      setReferencesLoading(true);
      await fetchReferences(note.id, citationStyle);
      // The fetchReferences function in NotesContext already updates the note state
      // So we just need to reload from the database to get the latest references
      const { data: updatedReferences } = await supabase
        .from('note_references')
        .select('*')
        .eq('note_id', note.id)
        .order('created_at', { ascending: true });
      
      if (updatedReferences) {
        setReferences(updatedReferences);
      }
    } catch (error: any) {
      console.error('Error fetching references:', error);
      if (error?.name === 'QuotaExceededError' || String(error?.message || '').includes('quota_exceeded')) {
        setUpgradePrompt({
          isOpen: true,
          featureName: 'Academic References',
          featureDescription: QUOTA_EXHAUSTED_MESSAGE,
        });
      } else {
        setReferencesError('Could not generate references. Please try again.');
      }
    } finally {
      setReferencesLoading(false);
    }
  };

  const handleOpenReferences = () => {
    setIsReferencesSidebarOpen(true);
  };

  const handleToggleFavorite = async () => {
    if (!note?.id) return;
    await toggleNoteFavorite(note.id);
  };
  // Handle navigation back with embedding
  const handleNavigateBack = useCallback(async () => {
    if (note.id && (title !== note.title || content !== note.content)) {
      // Save final changes and trigger embedding
      await updateNote(note.id, { title, content }, false);
    }
    if (onNavigateBack) {
      onNavigateBack();
    }
  }, [note.id, note.title, note.content, title, content, updateNote, onNavigateBack]);

  // Debug logs removed to prevent performance issues

  // Add this useEffect after the existing debug useEffect
  useEffect(() => {
    // Load references from database when note changes
    const loadReferences = async () => {
      if (note.id) {
        const { data: existingReferences } = await supabase
          .from('note_references')
          .select('*')
          .eq('note_id', note.id)
          .order('created_at', { ascending: true });
        
        if (existingReferences && existingReferences.length > 0) {
          setReferences(existingReferences);
        } else {
          // Fallback to note.note_references if available
          setReferences(note.note_references || []);
        }
      }
    };
    
    loadReferences();
  }, [note.id, note.note_references]);

  return (
    <div className="flex h-full relative">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50/30 to-gray-100/50 dark:from-gray-900 dark:via-slate-900/80 dark:to-gray-950/60" />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-32 h-32 bg-gradient-to-r from-gray-200/20 to-gray-300/20 dark:from-gray-800/10 dark:to-gray-700/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-gradient-to-r from-purple-200/20 to-pink-200/20 dark:from-purple-800/10 dark:to-pink-800/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <div className="relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-slate-800/80 backdrop-blur-sm" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300/50 to-transparent dark:via-slate-600/50" />
          
          <div className="relative px-3 py-1.5 flex items-center gap-2">
            {onNavigateBack && (
              <button
                onClick={handleNavigateBack}
                className="flex-shrink-0 p-1.5 rounded-lg bg-gray-100/80 dark:bg-gray-700/80 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 transition-colors backdrop-blur-sm border border-gray-300/20 dark:border-gray-600/20 shadow-sm"
                title="Back to Module"
              >
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="flex-1 text-lg font-bold bg-transparent border-none outline-none bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent placeholder-gray-500 dark:placeholder-gray-400 focus:placeholder-gray-400 dark:focus:placeholder-gray-300 transition-colors"
              placeholder="Untitled Note"
            />
            <button
              onClick={handleToggleFavorite}
              aria-pressed={!!note?.is_favorite}
              title={note?.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
              className={`flex-shrink-0 p-1.5 rounded-lg transition-colors backdrop-blur-sm border shadow-sm
                ${note?.is_favorite
                  ? 'border-red-300/40 bg-red-100/70 text-red-600 hover:bg-red-200/80 dark:border-red-700/40 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-800/50'
                  : 'border-gray-300/20 bg-gray-100/80 text-gray-600 hover:bg-gray-200/80 dark:border-gray-600/20 dark:bg-gray-700/80 dark:text-gray-300 dark:hover:bg-gray-600/80'}
              `}
            >
              {note?.is_favorite ? (
                <HeartIconSolid className="w-4 h-4" />
              ) : (
                <HeartIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 relative overflow-hidden min-h-0">
          <div className="absolute inset-0 bg-gray-100/60 dark:bg-gray-800/60 backdrop-blur-sm" />
          <div className="relative h-full p-2">
            {/* Streaming overlay to hide messy content until final structured notes are ready */}
            {uploadingLecture && note?.type === 'lecture' && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/85 dark:bg-gray-900/85 backdrop-blur-md rounded-2xl border border-gray-300/30 dark:border-gray-700/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Generating your notes…</span>
                </div>
                {/* Progress Bar + ETA */}
                <div className="w-11/12 max-w-2xl">
                  <div className="flex items-center justify-between mb-1 text-xs text-gray-600 dark:text-gray-400">
                    <span>{lecturePhase || 'Preparing'}</span>
                    <span>{Math.min(100, Math.max(0, Math.round(lectureProgress)))}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, Math.round(lectureProgress)))}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 h-4">
                    {lectureEtaSeconds != null && lectureEtaSeconds >= 0 ? (
                      <span>
                        {(() => { const m = Math.floor(lectureEtaSeconds / 60); const s = lectureEtaSeconds % 60; return m > 0 ? `${m}m ${s}s remaining` : `${s}s remaining`; })()}
                      </span>
                    ) : (
                      <span>&nbsp;</span>
                    )}
                  </div>
                </div>
                {/* Skeleton lines below the progress bar */}
                <div className="w-11/12 max-w-2xl space-y-2 mt-3">
                  <div className="h-3 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div className="h-3 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div className="h-3 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div className="h-3 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div className="h-3 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div className="h-3 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                </div>
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">We’ll show headings and paragraphs once the content is fully structured.</div>
              </div>
            )}
            <div className={`h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-300/20 dark:border-gray-700/20 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-2 overflow-hidden ${uploadingLecture && note?.type === 'lecture' ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity`}> 
              <RichTextEditor
                content={content}
                onChange={handleContentChange}
                placeholder="Start writing your note..."
                className="h-full"
                onReferenceHover={handleReferenceHover}
                onReferenceLeave={handleReferenceLeave}
                references={references}
                onOpenReferences={handleOpenReferences}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* References Sidebar */}
      <ReferenceSidebar
        isOpen={isReferencesSidebarOpen}
        onClose={() => setIsReferencesSidebarOpen(false)}
        references={references}
        loading={referencesLoading}
        error={referencesError}
        onFetchReferences={handleFetchReferences}
      />
      
      {/* Reference Tooltip */}
      {tooltipState.position && (
        <ReferenceTooltip
          reference={tooltipState.reference}
          position={tooltipState.position}
          isVisible={tooltipState.isVisible}
          onClose={handleReferenceLeave}
        />
      )}

      {/* Pro upgrade dialog for references */}
      <UpgradePrompt
        isOpen={upgradePrompt.isOpen}
        onClose={() => setUpgradePrompt({ isOpen: false, featureName: '', featureDescription: '' })}
        featureName={upgradePrompt.featureName}
        featureDescription={upgradePrompt.featureDescription}
      />
    </div>
  );
};

export default NoteEditor;