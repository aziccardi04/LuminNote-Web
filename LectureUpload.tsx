import React, { useState, useRef, useCallback } from 'react';
import { useNotes } from '../contexts/NotesContext';
import { GPTModel } from '../types';
import { API_ENDPOINTS } from '../lib/api';
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';
import UpgradePrompt from './UpgradePrompt';

interface LectureUploadProps {
  isOpen: boolean;
  onClose: () => void;
  folderId?: string;
}

const LectureUpload: React.FC<LectureUploadProps> = ({ isOpen, onClose, folderId }) => {
  const {
    createNoteFromLecture,
    lectureProgress,
    lecturePhase,
    lectureEtaSeconds,
  } = useNotes();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [selectedModel, setSelectedModel] = useState<GPTModel>('gpt-5-mini'); // Default to Detailed Notes
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [progressId, setProgressId] = useState<string | null>(null);
  // Local progress state is kept for dev SSE / fallback, but UI primarily
  // reflects the live values from NotesContext (lectureProgress, lecturePhase, lectureEtaSeconds)
  const [progress, setProgress] = useState<number>(0);
  const [phase, setPhase] = useState<string>('');
  const [etaSeconds, setEtaSeconds] = useState<number | null>(null);
  const [upgradePrompt, setUpgradePrompt] = useState<{
    isOpen: boolean;
    featureName: string;
    featureDescription: string;
    hideUpgrade?: boolean;
  }>({ isOpen: false, featureName: '', featureDescription: '' });

  // SSE subscription
  const eventSourceRef = useRef<EventSource | null>(null);

  // Model options used in the select dropdown
  const modelOptions: { value: GPTModel; label: string; description: string }[] = [
    { value: 'gpt-5-mini', label: 'Detailed Notes', description: 'Structured with sections and key points' },
    { value: 'gpt-5', label: 'Expert Notes', description: 'Highly detailed, best for comprehensive lectures' },
    { value: 'gpt-5-nano', label: 'Summary Notes', description: 'Concise overview focusing on essentials' },
  ];

  // File input change handler with basic validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (!f) return;
    
    const nameLower = f.name.toLowerCase();
    const isPdf = f.type === 'application/pdf' || nameLower.endsWith('.pdf');
    const isPptx = f.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || nameLower.endsWith('.pptx');
    const isPpt = f.type === 'application/vnd.ms-powerpoint' || nameLower.endsWith('.ppt');

    if (!isPdf && !isPptx && !isPpt) {
      setError('Unsupported file type. Please upload a PDF or PowerPoint file (.pptx/.ppt).');
      setFile(null);
      return;
    }

    // 25MB size limit to match UI hint
    const MAX_BYTES = 25 * 1024 * 1024;
    if (f.size > MAX_BYTES) {
      setError('File too large (max 25MB)');
      setFile(null);
      return;
    }
    setError('');
    setFile(f);
    // Pre-fill title if empty
    setTitle(prev => prev || f.name.replace(/\.[^/.]+$/, ''));
  };

  const startProgressStream = useCallback((id: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    // Use shared API_ENDPOINTS config so dev uses localhost:3001 and prod uses relative /api/*
    const url = `${API_ENDPOINTS.PROGRESS.STREAM}?id=${encodeURIComponent(id)}`;
    const es = new EventSource(url);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setProgress(data.progress ?? 0);
        setPhase(data.phase ?? '');
        setEtaSeconds(typeof data.etaSeconds === 'number' ? data.etaSeconds : null);
        if (data.done) {
          setEtaSeconds(null);
          es.close();
          eventSourceRef.current = null;
        }
      } catch (err) {
        console.error('Progress parse error:', err);
      }
    };
    es.onerror = (e) => {
      console.error('Progress stream error:', e);
      setEtaSeconds(null);
      es.close();
      eventSourceRef.current = null;
    };
    eventSourceRef.current = es;
  }, []);

  const handleUpload = async () => {
    if (!file) return;
  
    setIsProcessing(true);
    setError('');
    setProgress(0);
    setPhase('Preparing your lecture...');
    setEtaSeconds(null);
  
    let newProgressId: string | null = null;
  
    try {
      // Best-effort: create a server-side progress id for streaming.
      // This MUST NOT break uploads if the endpoint is missing (e.g. Vercel without Express).
      try {
        // Only attempt progress endpoints when they are configured (local dev).
        if (API_ENDPOINTS.PROGRESS.CREATE) {
          const res = await fetch(API_ENDPOINTS.PROGRESS.CREATE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          });

          if (res.ok) {
            // Guard JSON parsing so HTML error pages don't throw.
            try {
              const json = await res.json();
              const id = json.progressId as string | undefined;
              if (id) {
                newProgressId = id;
                setProgressId(id);
                startProgressStream(id);
              }
            } catch (parseError) {
              console.warn('Progress create JSON parse failed, continuing without streaming:', parseError);
            }
          } else {
            console.warn('Progress create returned non-OK status, continuing without streaming:', res.status);
          }
        }
      } catch (progressError) {
        console.warn('Progress create request failed, continuing without streaming:', progressError);
      }

      // Convert PowerPoint to PDF if needed before processing
      let fileToProcess: File = file;
      const nameLower = file.name.toLowerCase();
      const isPdf = file.type === 'application/pdf' || nameLower.endsWith('.pdf');
      const isPptx = file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || nameLower.endsWith('.pptx');
      const isPpt = file.type === 'application/vnd.ms-powerpoint' || nameLower.endsWith('.ppt');

      if (!isPdf && (isPpt || isPptx)) {
        setPhase('Converting PowerPoint to PDF...');
        setProgress(8);
        if (!API_ENDPOINTS.CONVERT?.TO_PDF) {
          // Conversion endpoint not available (likely production serverless). Gracefully inform user.
          throw new Error('PowerPoint conversion is not available in this environment. Please export your slides to PDF and upload the PDF.');
        }
        const formData = new FormData();
        formData.append('file', file);
        const convRes = await fetch(API_ENDPOINTS.CONVERT.TO_PDF, {
          method: 'POST',
          body: formData,
        });
        if (!convRes.ok) {
          const errText = await convRes.text().catch(() => '');
          throw new Error(`Failed to convert PowerPoint to PDF. ${errText || ''}`.trim());
        }
        const pdfBlob = await convRes.blob();
        const pdfName = file.name.replace(/\.(pptx|ppt)$/i, '.pdf');
        fileToProcess = new File([pdfBlob], pdfName, { type: 'application/pdf' });
      }

      // Always attempt the actual lecture processing, even if progress setup failed.
      await createNoteFromLecture({
        file: fileToProcess,
        title: title.trim() || fileToProcess.name,
        folder_id: folderId,
        model: selectedModel,
        progressId: newProgressId || undefined,
      });
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1000);
    } catch (err: any) {
      console.error('Upload error:', err);

      // Handle quota exceeded error - show upgrade prompt inside this modal
      // Check multiple ways the quota error might manifest
      const errMessage = String(err?.message || '').toLowerCase();
      const isQuotaError = 
        err?.name === 'QuotaExceededError' || 
        errMessage.includes('quota') ||
        errMessage.includes('quota_exceeded') ||
        (err?.feature && err?.plan); // Has quota metadata
      
      if (isQuotaError) {
        console.log('LectureUpload: quota exceeded - showing internal UpgradePrompt', { plan: err?.plan, feature: err?.feature, limit: err?.limit, remaining: err?.remaining });
        const isProPlan = String(err?.plan) === 'pro';
        setUpgradePrompt({
          isOpen: true,
          featureName: 'Lecture Upload',
          featureDescription: isProPlan
            ? 'You\'ve used all of this month\'s AI usage for lecture uploads. It will reset next month. You can still view and edit your notes.'
            : "You've reached your monthly lecture upload limit. Upgrade to Pro for 50 AI-processed lecture uploads per month.",
          hideUpgrade: isProPlan,
        });
      } else {
        setError(err instanceof Error ? err.message : 'Upload failed');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setSelectedModel('gpt-5-mini');
    setError('');
    setSuccess(false);
    setIsProcessing(false);
    setEtaSeconds(null);
  };

  const formatEta = (secs: number | null) => {
    if (secs == null || secs < 0) return '';
    const m = Math.floor(secs / 60);
    const s = Math.max(0, secs % 60);
    return m > 0 ? `${m}m ${s}s remaining` : `${s}s remaining`;
  };

  // Map backend phase text to a simple 3-step stage index for the mini timeline
  const getStageIndex = (phaseText: string) => {
    const p = (phaseText || '').toLowerCase();
    if (p.includes('extract') || p.includes('file') || p.includes('creating')) return 1;         // Reading PDF / extracting
    if (p.includes('generating') || p.includes('finalizing') || p.includes('embedding')) return 2; // Writing notes
    return 0; // Upload / starting
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[5000]">
      <div className="relative w-full max-w-md mx-4">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-blue-50/90 dark:from-gray-800/90 dark:to-slate-800/90 backdrop-blur-sm rounded-2xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 dark:from-blue-400/10 dark:to-purple-500/10 rounded-2xl" />
        
        <div className="relative p-6 rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">Upload Lecture</h2>
            <button
              onClick={() => { onClose(); resetForm(); }}
              className="p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2">Success!</h3>
              <p className="text-gray-600 dark:text-gray-400">Your lecture has been processed and notes created.</p>
            </div>
          ) : (
          <>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lecture Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all backdrop-blur-sm"
                  placeholder="Enter lecture title..."
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Note Detail Level
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value as GPTModel)}
                  className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all backdrop-blur-sm"
                >
                  {modelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Choose how detailed you want your generated notes to be
                </p>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lecture PDF file
                </label>
                <div className="relative border-2 border-dashed border-blue-300/50 dark:border-blue-400/30 rounded-xl p-8 text-center bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:border-blue-400/70 dark:hover:border-blue-300/50 transition-all">
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <DocumentTextIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">{file.name}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <CloudArrowUpIcon className="w-12 h-12 text-blue-500 dark:text-blue-400 mx-auto mb-3" />
                      <p className="text-gray-700 dark:text-gray-300 mb-2 font-medium">Drop your file here or click to browse</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Upload a PDF or PowerPoint (.pptx/.ppt) file (max 25MB). PowerPoints are automatically converted to PDF.</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {error && (
                <div className="mb-5 p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border border-red-200 dark:border-red-500/50 rounded-xl flex items-center gap-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { onClose(); resetForm(); }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all font-medium disabled:opacity-50"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!file || isProcessing}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
                >
                  {isProcessing ? 'Processing...' : 'Upload & Generate Notes'}
                </button>
              </div>

              {isProcessing && (
                <div className="mt-5 space-y-3">
                  {/* Primary status row */}
                  <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">
                      {lecturePhase || phase || 'Preparing your lecture...'}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      {lectureEtaSeconds != null && (
                        <span>{formatEta(lectureEtaSeconds)}</span>
                      )}
                      {lectureEtaSeconds == null && etaSeconds != null && (
                        <span>{formatEta(etaSeconds)}</span>
                      )}
                      <span>
                        {Math.round(
                          Math.min(
                            100,
                            Math.max(0, lectureProgress || progress)
                          )
                        )}
                        %
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-2.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            8,
                            lectureProgress || progress || 10
                          )
                        )}%`,
                      }}
                    />
                  </div>

                  {/* 3‑step mini timeline for better perceived activity */}
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    {[
                      { label: 'Uploading', desc: 'Sending your file securely' },
                      { label: 'Understanding', desc: 'Reading & extracting key ideas' },
                      { label: 'Writing notes', desc: 'Structuring your lecture notes' },
                    ].map((step, index) => {
                      const current = getStageIndex(lecturePhase || phase);
                      const isActive = index === current;
                      const isDone = index < current;
                      return (
                        <div
                          key={step.label}
                          className={
                            'rounded-xl border px-2.5 py-1.5 transition-colors ' +
                            (isActive
                              ? 'border-blue-400/80 bg-blue-500/10 text-blue-100 dark:text-blue-100'
                              : isDone
                              ? 'border-emerald-400/60 bg-emerald-500/5 text-emerald-100 dark:text-emerald-100'
                              : 'border-gray-700/40 bg-gray-900/20 text-gray-400')
                          }
                        >
                          <div className="font-semibold mb-0.5">{step.label}</div>
                          <div className="opacity-75 leading-tight">{step.desc}</div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    You can keep this window open while we process your lecture. Once finished, your
                    generated note will open automatically.
                  </p>
                </div>
              )}
            </>
        )}
         </div>
       </div>

       {/* Pro upgrade dialog for quota exceeded (overlays this modal) */}
       <UpgradePrompt
         isOpen={upgradePrompt.isOpen}
         onClose={() => setUpgradePrompt({ isOpen: false, featureName: '', featureDescription: '' })}
         featureName={upgradePrompt.featureName}
         featureDescription={upgradePrompt.featureDescription}
         hideUpgrade={upgradePrompt.hideUpgrade}
       />
     </div>
   );
 };

export default LectureUpload;