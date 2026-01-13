'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════
// TYPES & STATE MACHINE
// ═══════════════════════════════════════════════════════════════

type DemoStep = 'HOME' | 'UPLOAD_MODAL' | 'PROCESSING' | 'NOTE_READY';

interface ProcessingState {
  progress: number;
  phase: 'uploading' | 'understanding' | 'writing';
  eta: number;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const TOTAL_DURATION_SECONDS = 90;
const UPDATE_INTERVAL_MS = 250;

const PHASE_RANGES = {
  uploading: { start: 0, end: 20 },
  understanding: { start: 20, end: 70 },
  writing: { start: 70, end: 100 },
};

// Biology-focused note content from biologynotes.txt - properly structured
const SAMPLE_NOTE_CONTENT = `
<h2>📚 Cell Biology Overview</h2>
<p>Cell biology (cytology) is the study of cells as the fundamental structural and functional units of life. It investigates how cells are built, obtain and use energy, communicate, and maintain their internal environment.</p>

<h2>🔬 Key Concepts</h2>
<ul>
  <li><strong>Cell Theory</strong> — All organisms are composed of cells; the cell is the basic unit of life; all cells arise from pre-existing cells.</li>
  <li><strong>Prokaryotic vs Eukaryotic</strong> — Prokaryotes lack membrane-bound organelles and true nucleus; Eukaryotes contain nucleus and organelles like mitochondria, ER, and Golgi apparatus.</li>
  <li><strong>Plasma Membrane</strong> — Phospholipid bilayer with embedded proteins; selectively permeable; controls transport via diffusion, facilitated diffusion, and active transport.</li>
  <li><strong>Organelle Functions</strong> — Mitochondria (ATP production), Chloroplasts (photosynthesis), Ribosomes (protein synthesis), Lysosomes (intracellular digestion).</li>
  <li><strong>Cytoskeleton</strong> — Microfilaments (actin), microtubules, and intermediate filaments provide mechanical support and drive cell motility.</li>
</ul>

<h2>📝 Cell Cycle & Division</h2>
<ul>
  <li><strong>Interphase</strong> — G₁ (growth), S (DNA synthesis), G₂ (preparation for division)</li>
  <li><strong>Mitosis</strong> — Produces two genetically identical daughter cells for growth and tissue maintenance</li>
  <li><strong>Meiosis</strong> — Two divisions producing haploid gametes with genetic variation via recombination</li>
  <li><strong>Cell Cycle Regulation</strong> — Cyclin-dependent kinases (CDKs) and cyclins orchestrate progression through phases</li>
  <li><strong>Apoptosis</strong> — Programmed cell death via caspases; dysregulation contributes to cancer and disease</li>
</ul>

<h2>📖 Key Definitions</h2>
<ul>
  <li><strong>Mitochondria</strong> — "Powerhouse of the cell"; generates ATP via oxidative phosphorylation</li>
  <li><strong>Ribosome</strong> — Cellular machinery for protein synthesis (translation)</li>
  <li><strong>Endoplasmic Reticulum</strong> — Rough ER (protein processing), Smooth ER (lipid synthesis)</li>
  <li><strong>Golgi Apparatus</strong> — Processes and packages proteins for secretion or membrane insertion</li>
  <li><strong>Na⁺/K⁺-ATPase</strong> — Membrane pump maintaining ion gradients essential for cell function</li>
</ul>

<h2>🧬 Cell Signaling</h2>
<ul>
  <li><strong>Receptor Types</strong> — G protein-coupled receptors (GPCRs) and receptor tyrosine kinases (RTKs)</li>
  <li><strong>Second Messengers</strong> — Cyclic AMP, calcium ions; amplify signals intracellularly</li>
  <li><strong>MAPK Pathway</strong> — Key kinase cascade regulating gene expression and cell proliferation</li>
  <li><strong>Disease Relevance</strong> — Defects in signaling underlie cancer, neurodegeneration, and metabolic disorders</li>
</ul>

<h2>🎯 Exam Tips</h2>
<ul>
  <li>Memorise the stages of mitosis (PMAT) and meiosis I & II</li>
  <li>Know the differences between prokaryotic and eukaryotic cells</li>
  <li>Understand structure-function relationships in organelles</li>
  <li>Be able to explain active vs passive transport mechanisms</li>
  <li>Review the cell cycle checkpoints and their significance</li>
</ul>

<h2>📚 References</h2>
<ul>
  <li>Alberts B, et al. <em>Molecular Biology of the Cell</em>. 6th ed. Garland Science; 2015.</li>
  <li>Lodish H, et al. <em>Molecular Cell Biology</em>. 9th ed. W.H. Freeman; 2021.</li>
</ul>
`;

// ═══════════════════════════════════════════════════════════════
// ICONS (matching Heroicons used in the actual app)
// ═══════════════════════════════════════════════════════════════

const FolderIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const DocumentTextIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const CloudArrowUpIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
  </svg>
);

const XMarkIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const CogIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function HeroAppDemo() {
  const [step, setStep] = useState<DemoStep>('HOME');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState<ProcessingState>({
    progress: 0,
    phase: 'uploading',
    eta: TOTAL_DURATION_SECONDS,
  });
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const processingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const isVisibleRef = useRef(true);

  // Visibility handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Processing timer
  const getPhaseFromProgress = (progress: number): 'uploading' | 'understanding' | 'writing' => {
    if (progress < PHASE_RANGES.uploading.end) return 'uploading';
    if (progress < PHASE_RANGES.understanding.end) return 'understanding';
    return 'writing';
  };

  const getPhaseLabel = (phase: string): string => {
    switch (phase) {
      case 'uploading': return 'Uploading your lecture...';
      case 'understanding': return 'Reading & extracting key ideas';
      case 'writing': return 'Structuring your lecture notes';
      default: return 'Processing...';
    }
  };

  const startProcessing = useCallback(() => {
    startTimeRef.current = Date.now();
    setProcessing({ progress: 0, phase: 'uploading', eta: TOTAL_DURATION_SECONDS });
    setStep('PROCESSING');

    processingIntervalRef.current = setInterval(() => {
      if (!isVisibleRef.current) return;

      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const progress = Math.min((elapsed / TOTAL_DURATION_SECONDS) * 100, 100);
      const remaining = Math.max(TOTAL_DURATION_SECONDS - elapsed, 0);
      const phase = getPhaseFromProgress(progress);

      setProcessing({ progress, phase, eta: Math.ceil(remaining) });

      if (progress >= 100) {
        if (processingIntervalRef.current) {
          clearInterval(processingIntervalRef.current);
          processingIntervalRef.current = null;
        }
        setStep('NOTE_READY');
      }
    }, UPDATE_INTERVAL_MS);
  }, []);

  const skipProcessing = useCallback(() => {
    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current);
      processingIntervalRef.current = null;
    }
    setProcessing({ progress: 100, phase: 'writing', eta: 0 });
    setStep('NOTE_READY');
  }, []);

  const cancelProcessing = useCallback(() => {
    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current);
      processingIntervalRef.current = null;
    }
    setSelectedFile(null);
    setProcessing({ progress: 0, phase: 'uploading', eta: TOTAL_DURATION_SECONDS });
    setStep('HOME');
  }, []);

  useEffect(() => {
    return () => {
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
      }
    };
  }, []);

  const formatEta = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s remaining`;
    return `${secs}s remaining`;
  };

  const getStageIndex = (phase: string) => {
    if (phase === 'uploading') return 0;
    if (phase === 'understanding') return 1;
    return 2;
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER: SIDEBAR (Matching Sidebar.tsx)
  // ═══════════════════════════════════════════════════════════════

  const renderSidebar = () => (
    <div className={`flex flex-col h-full transition-all duration-300 ease-out ${
      sidebarExpanded ? 'w-44' : 'w-10'
    } bg-gray-50 dark:bg-[#0a0f1a] border-r border-gray-200 dark:border-white/[0.06]`}>
      
      {/* Header - Logo & Toggle */}
      <div className="flex items-center justify-between h-10 px-2">
        {sidebarExpanded && (
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">L</span>
          </div>
        )}
        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className={`p-1 rounded-md bg-gray-100 dark:bg-white/[0.04] hover:bg-gray-200 dark:hover:bg-white/[0.08] text-gray-500 dark:text-gray-400 transition-all ${!sidebarExpanded ? 'mx-auto' : ''}`}
        >
          <ChevronRightIcon />
        </button>
      </div>

      {/* New Note Button */}
      {sidebarExpanded && (
        <div className="px-2 pb-2">
          <button className="w-full h-7 rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 text-white font-medium text-[10px] flex items-center justify-center gap-1 shadow-lg shadow-blue-600/20">
            <PlusIcon />
            <span>New Note</span>
          </button>
        </div>
      )}

      {/* Divider */}
      {sidebarExpanded && <div className="mx-2 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-white/[0.08] to-transparent" />}

      {/* Modules Section */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {sidebarExpanded && (
          <div className="py-1">
            <span className="text-[8px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-medium">Modules</span>
          </div>
        )}
        
        {/* Module Items */}
        <div className="space-y-0.5">
          {[
            { name: 'Biology 101', color: '#10B981', notes: 4 },
            { name: 'Psychology', color: '#3B82F6', notes: 6 },
            { name: 'History', color: '#F59E0B', notes: 2 },
          ].map((module) => (
            <div key={module.name} className="group flex items-center gap-1.5 h-7 px-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-all cursor-pointer">
              <ChevronRightIcon />
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: module.color }}
              />
              {sidebarExpanded && (
                <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate flex-1">{module.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="p-2 border-t border-gray-200 dark:border-white/[0.06]">
        <button className={`flex items-center gap-2 h-7 px-2 rounded-md text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-all ${sidebarExpanded ? 'w-full' : 'justify-center'}`}>
          <CogIcon />
          {sidebarExpanded && <span className="text-[10px] font-medium">Settings</span>}
        </button>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  // RENDER: HOME STATE (Matches Homepage.tsx exactly)
  // ═══════════════════════════════════════════════════════════════

  const renderHome = () => (
    <div className="flex h-full bg-white dark:bg-gray-900">
      {/* Sidebar */}
      {renderSidebar()}
      
      {/* Main Content */}
      <div className="flex-1 p-3 flex flex-col overflow-hidden">
        {/* Stats Overview - Matching Homepage.tsx card-base pattern */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { label: 'Modules', value: '3', Icon: FolderIcon, gradient: 'from-blue-500 to-blue-600' },
            { label: 'Notes', value: '12', Icon: DocumentTextIcon, gradient: 'from-emerald-500 to-teal-500' },
            { label: 'This Week', value: '5', Icon: ClockIcon, gradient: 'from-blue-500 to-blue-600' },
            { label: 'Favorites', value: '4', Icon: HeartIcon, gradient: 'from-pink-500 to-rose-500' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-2 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-gray-500 dark:text-gray-400 mb-0.5">{stat.label}</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white`}>
                  <stat.Icon />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Your Modules Section - Matching Homepage.tsx */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <FolderIcon />
              <h2 className="text-xs font-semibold text-gray-900 dark:text-white">Your Modules</h2>
            </div>
            <button className="flex items-center gap-1 px-2 py-1 text-[9px] font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
              <PlusIcon />
              Create
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Biology 101 Module - with Upload button and pointer */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-2.5 cursor-pointer group relative overflow-hidden hover:border-blue-400 dark:hover:border-blue-500 transition-all">
              {/* Subtle pointer indicator */}
              <div className="absolute -top-1 -right-1 w-12 h-12 pointer-events-none">
                <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full animate-ping opacity-75" />
                <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full" />
              </div>
              
              {/* Left accent line */}
              <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-emerald-500" />
              <div className="pl-2">
                <h3 className="text-[11px] font-semibold text-gray-900 dark:text-white mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Biology 101
                </h3>
                <p className="text-[9px] text-gray-500 dark:text-gray-400 mb-1.5">
                  4 notes
                </p>
                <div className="flex gap-1">
                  <button className="flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded">
                    <PlusIcon />
                    Note
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setStep('UPLOAD_MODAL');
                    }}
                    className="flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors relative"
                  >
                    <CloudArrowUpIcon />
                    Upload
                    {/* Click here indicator */}
                    <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] text-blue-500 whitespace-nowrap opacity-70">
                      ↑ Click here
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Psychology Module */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-2.5 cursor-pointer group relative overflow-hidden">
              <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-blue-500" />
              <div className="pl-2">
                <h3 className="text-[11px] font-semibold text-gray-900 dark:text-white mb-0.5">
                  Psychology
                </h3>
                <p className="text-[9px] text-gray-500 dark:text-gray-400 mb-1.5">
                  6 notes
                </p>
                <div className="flex gap-1">
                  <button className="flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded">
                    <PlusIcon />
                    Note
                  </button>
                  <button className="flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] font-medium text-gray-600 dark:text-gray-400 rounded">
                    <CloudArrowUpIcon />
                    Upload
                  </button>
                </div>
              </div>
            </div>

            {/* History Module */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-2.5 cursor-pointer group relative overflow-hidden">
              <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-amber-500" />
              <div className="pl-2">
                <h3 className="text-[11px] font-semibold text-gray-900 dark:text-white mb-0.5">
                  History
                </h3>
                <p className="text-[9px] text-gray-500 dark:text-gray-400 mb-1.5">
                  2 notes
                </p>
                <div className="flex gap-1">
                  <button className="flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded">
                    <PlusIcon />
                    Note
                  </button>
                  <button className="flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] font-medium text-gray-600 dark:text-gray-400 rounded">
                    <CloudArrowUpIcon />
                    Upload
                  </button>
                </div>
              </div>
            </div>

            {/* Chemistry Module */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-2.5 cursor-pointer group relative overflow-hidden">
              <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-cyan-500" />
              <div className="pl-2">
                <h3 className="text-[11px] font-semibold text-gray-900 dark:text-white mb-0.5">
                  Chemistry
                </h3>
                <p className="text-[9px] text-gray-500 dark:text-gray-400 mb-1.5">
                  3 notes
                </p>
                <div className="flex gap-1">
                  <button className="flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded">
                    <PlusIcon />
                    Note
                  </button>
                  <button className="flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] font-medium text-gray-600 dark:text-gray-400 rounded">
                    <CloudArrowUpIcon />
                    Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  // RENDER: UPLOAD MODAL (Matches LectureUpload.tsx exactly)
  // ═══════════════════════════════════════════════════════════════

  const renderUploadModal = () => (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 z-10">
      <div className="relative w-full max-w-sm">
        {/* Background with gradient - matching LectureUpload.tsx */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-blue-50/90 dark:from-gray-800/90 dark:to-slate-800/90 backdrop-blur-sm rounded-2xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-400/10 dark:to-blue-500/10 rounded-2xl" />

        <div className="relative p-4 rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              Upload Lecture
            </h2>
            <button
              onClick={() => {
                setSelectedFile(null);
                setStep('HOME');
              }}
              className="p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all"
            >
              <XMarkIcon />
            </button>
          </div>

          {/* Lecture Title Input */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Lecture Title
            </label>
            <input
              type="text"
              defaultValue={selectedFile ? 'Lecture1' : ''}
              className="w-full px-3 py-2 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all backdrop-blur-sm"
              placeholder="Enter lecture title..."
            />
          </div>

          {/* File Drop Zone - matching LectureUpload.tsx */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Lecture PDF file
            </label>
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                const demoFile = new File(['demo'], 'Lecture1.pdf', { type: 'application/pdf' });
                Object.defineProperty(demoFile, 'size', { value: 2457600 });
                setSelectedFile(demoFile);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  const demoFile = new File(['demo'], 'Lecture1.pdf', { type: 'application/pdf' });
                  Object.defineProperty(demoFile, 'size', { value: 2457600 });
                  setSelectedFile(demoFile);
                }
              }}
              className="relative border-2 border-dashed border-blue-300/50 dark:border-blue-400/30 rounded-xl p-4 text-center bg-gradient-to-br from-blue-50/50 to-blue-50/30 dark:from-blue-900/20 dark:to-blue-900/10 hover:border-blue-400/70 dark:hover:border-blue-300/50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2">
                  <DocumentTextIcon />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <CloudArrowUpIcon />
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 font-medium">
                    Click to select demo file
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    PDF or PowerPoint (max 25MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - matching LectureUpload.tsx */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedFile(null);
                setStep('HOME');
              }}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={startProcessing}
              disabled={!selectedFile}
              className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                selectedFile
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              Upload & Generate Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  // RENDER: PROCESSING STATE (Matches LectureUpload.tsx processing UI)
  // ═══════════════════════════════════════════════════════════════

  const renderProcessing = () => (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 z-10">
      <div className="relative w-full max-w-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-blue-50/90 dark:from-gray-800/90 dark:to-slate-800/90 backdrop-blur-sm rounded-2xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-400/10 dark:to-blue-500/10 rounded-2xl" />

        <div className="relative p-4 rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              Upload Lecture
            </h2>
          </div>

          {/* Processing State UI - matching LectureUpload.tsx */}
          <div className="space-y-3">
            {/* Status row */}
            <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">{getPhaseLabel(processing.phase)}</span>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{formatEta(processing.eta)}</span>
                <span>{Math.round(processing.progress)}%</span>
              </div>
            </div>

            {/* Progress bar - matching LectureUpload.tsx */}
            <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-2.5 bg-gradient-to-r from-blue-500 via-blue-500 to-blue-600 transition-all duration-300"
                style={{ width: `${Math.max(8, processing.progress)}%` }}
              />
            </div>

            {/* 3-step mini timeline - matching LectureUpload.tsx */}
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              {[
                { label: 'Uploading', desc: 'Sending your file securely' },
                { label: 'Understanding', desc: 'Reading & extracting key ideas' },
                { label: 'Writing notes', desc: 'Structuring your lecture notes' },
              ].map((stepItem, index) => {
                const current = getStageIndex(processing.phase);
                const isActive = index === current;
                const isDone = index < current;
                return (
                  <div
                    key={stepItem.label}
                    className={`rounded-xl border px-2 py-1.5 transition-colors ${
                      isActive
                        ? 'border-blue-400/80 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                        : isDone
                        ? 'border-emerald-400/60 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-100/50 dark:bg-gray-900/20 text-gray-400'
                    }`}
                  >
                    <div className="font-semibold mb-0.5">{stepItem.label}</div>
                    <div className="opacity-75 leading-tight">{stepItem.desc}</div>
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              You can keep this window open while we process your lecture.
            </p>

            {/* Control Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={cancelProcessing}
                className="flex-1 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={skipProcessing}
                className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium transition-all hover:shadow-lg hover:shadow-blue-500/25"
              >
                Skip Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  // RENDER: NOTE READY STATE (Matches NoteEditor.tsx)
  // ═══════════════════════════════════════════════════════════════

  const renderNoteReady = () => (
    <div className="flex h-full bg-gradient-to-br from-slate-50 via-gray-50/30 to-gray-100/50 dark:from-gray-900 dark:via-slate-900/80 dark:to-gray-950/60">
      {/* Sidebar */}
      {renderSidebar()}
      
      {/* Note Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - matching NoteEditor.tsx */}
        <div className="relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-slate-800/80 backdrop-blur-sm" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300/50 to-transparent dark:via-slate-600/50" />

          <div className="relative px-3 py-2 flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedFile(null);
                setStep('HOME');
              }}
              className="flex-shrink-0 p-1.5 rounded-lg bg-gray-100/80 dark:bg-gray-700/80 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 transition-colors backdrop-blur-sm border border-gray-300/20 dark:border-gray-600/20 shadow-sm"
            >
              <ArrowLeftIcon />
            </button>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent truncate">
                Lecture1
              </h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Generated just now</p>
            </div>
            <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-medium rounded-full flex items-center gap-1">
              <CheckCircleIcon />
              Flashcards ready
            </span>
          </div>
        </div>

        {/* Note Content - matching NoteEditor.tsx editor styling */}
        <div className="flex-1 relative overflow-hidden min-h-0 p-2">
          <div className="h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-300/20 dark:border-gray-700/20 shadow-lg overflow-auto">
            <div
              className="p-4 prose prose-sm dark:prose-invert max-w-none
                prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:font-semibold prose-headings:mb-2 prose-headings:mt-3
                prose-h2:text-sm prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-gray-700 prose-h2:pb-1
                prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-xs
                prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:text-xs prose-li:my-0.5
                prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
                prose-ul:my-1 prose-ul:space-y-0.5"
              dangerouslySetInnerHTML={{ __html: SAMPLE_NOTE_CONTENT }}
            />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          <a
            href="https://app.luminnote.com"
            className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all"
          >
            Try it with your lectures →
          </a>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="relative w-full h-[520px] md:h-[480px] rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl">
      {/* App Chrome / Title Bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs text-gray-600 dark:text-gray-300">
            app.luminnote.com
          </div>
        </div>
        <div className="w-14" />
      </div>

      {/* Main Content Area */}
      <div className="relative h-[calc(100%-40px)]">
        {step === 'HOME' && renderHome()}
        {step === 'UPLOAD_MODAL' && (
          <>
            {renderHome()}
            {renderUploadModal()}
          </>
        )}
        {step === 'PROCESSING' && (
          <>
            {renderHome()}
            {renderProcessing()}
          </>
        )}
        {step === 'NOTE_READY' && renderNoteReady()}
      </div>
    </div>
  );
}
