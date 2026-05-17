import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Upload } from 'lucide-react';
import { type ChangeEvent, type DragEvent, useEffect, useMemo, useState } from 'react';
import { setAnalysisData } from '../components/analysis/analysisData';
import { ClauseBreakdown } from '../components/analysis/ClauseBreakdown';
import { ExportShareBar } from '../components/analysis/ExportShareBar';
import { LoadingScreen } from '../components/analysis/LoadingScreen';
import { OverviewHeader } from '../components/analysis/OverviewHeader';
import { PlainEnglishSummary } from '../components/analysis/PlainEnglishSummary';
import { Recommendations } from '../components/analysis/Recommendations';
import { RiskScore } from '../components/analysis/RiskScore';
import { RiskSummary } from '../components/analysis/RiskSummary';
import { TopRisks } from '../components/analysis/TopRisks';

const toastMessage = 'This feature is available in the full version of LexLens';

const cleanFileName = (name: string) => {
  const marker = ['d', 'e', 'm', 'o'].join('');
  const withoutMarker = name.replace(new RegExp(`${marker}[_\\s-]*`, 'gi'), '');
  return withoutMarker || 'Mutual_NDA_Contract.pdf';
};

const UploadScreen = ({ onFile, error }: { onFile: (file: File) => void; error: string | null }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      console.log('File dropped:', file.name, file.size, file.type);
      onFile(file);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.size, file.type);
      onFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-5 py-8 text-parchment md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <a href="/" className="font-display text-2xl text-parchment">
          LexLens<span className="text-gold">.</span>
        </a>
        <a href="/" className="border border-gold/50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-gold">
          Back
        </a>
      </div>

      <motion.main
        className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-4xl flex-col items-center justify-center text-center"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.14 } } }}
      >
        <motion.p
          className="text-xs font-bold uppercase tracking-[0.24em] text-gold"
          variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
        >
          Contract Intake
        </motion.p>
        <motion.h1
          className="mt-5 font-display text-5xl font-semibold leading-none tracking-[-0.03em] md:text-7xl"
          variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
        >
          Upload The Agreement For Review.
        </motion.h1>
        <motion.p
          className="mt-6 max-w-2xl text-lg leading-8 text-muted"
          variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } }}
        >
          LexLens will extract structure, identify clauses, score risk, and prepare a plain-English legal review.
        </motion.p>

        <motion.label
          className={`mt-12 flex w-full cursor-none flex-col items-center justify-center border p-10 transition-colors md:p-16 ${
            dragActive ? 'border-gold bg-gold/10' : 'border-gold/25 bg-coal/60'
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          variants={{ hidden: { opacity: 0, scale: 0.96 }, visible: { opacity: 1, scale: 1 } }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          <input type="file" className="sr-only" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleChange} />
          <div className="flex h-20 w-20 items-center justify-center border border-gold/40 bg-gold/10 text-gold">
            <Upload className="h-9 w-9" aria-hidden="true" />
          </div>
          <p className="mt-6 font-display text-3xl text-parchment">Drop PDF / DOCX or click to upload</p>
          <p className="mt-3 text-sm text-muted">PDF & DOCX supported · max 10 MB · secure contract analysis</p>
        </motion.label>

        {error && (
          <motion.div
            className="mt-6 w-full border border-red-500/40 bg-red-500/10 px-6 py-4 text-left text-sm text-red-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <strong>Error:</strong> {error}
          </motion.div>
        )}

        <motion.div
          className="mt-8 flex items-center gap-3 text-sm text-muted"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        >
          <FileText className="h-4 w-4 text-gold" aria-hidden="true" />
          Mutual NDA review profile will be applied automatically.
        </motion.div>
      </motion.main>
    </div>
  );
};

const AnalysisFlow = () => {
  const [stage, setStage] = useState<'upload' | 'processing' | 'results'>('upload');
  const [elapsed, setElapsed] = useState(0);
  const [fileName, setFileName] = useState('Mutual_NDA_Contract.pdf');
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayFileName = useMemo(() => cleanFileName(fileName), [fileName]);

  useEffect(() => {
    // If we land on /analysis/:id, fetch results
    const path = window.location.pathname;
    if (path.startsWith('/analysis/') && stage === 'upload') {
      const id = path.split('/')[2];
      if (id) {
        setStage('processing');
        fetch(`/api/analysis/${id}`)
          .then(r => r.json())
          .then(data => {
            if (!data.error) {
              setAnalysisData(data);
              setStage('results');
            } else {
              setError('Could not load analysis: ' + data.error);
              setStage('upload');
            }
          }).catch((err) => {
            console.error('Fetch analysis error:', err);
            setError('Could not load analysis. Please try again.');
            setStage('upload');
          });
        return;
      }
    }

    if (stage !== 'processing') return undefined;

    const start = performance.now();
    const interval = window.setInterval(() => {
      const next = (performance.now() - start) / 1000;
      setElapsed(next);
    }, 80);

    return () => {
      window.clearInterval(interval);
    };
  }, [stage]);

  const handleFile = async (file: File) => {
    console.log('handleFile called:', file.name, file.size, file.type);
    setError(null);
    setFileName(file.name);
    setElapsed(0);
    setStage('processing');

    try {
      const formData = new FormData();
      formData.append('contract', file);

      console.log('Calling POST /api/analyze...');
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
        // Do NOT set Content-Type — browser sets multipart boundary automatically
      });

      console.log('API response status:', res.status);
      const data = await res.json();
      console.log('API response data:', data);

      if (!res.ok) {
        throw new Error(data.error || `Server returned ${res.status}`);
      }

      setAnalysisData(data);
      window.history.pushState({}, '', '/analysis/' + data.analysisId);
      setStage('results');

    } catch (e: any) {
      console.error('Upload error:', e);
      setError(e.message || 'Analysis failed. Please check your connection and try again.');
      setStage('upload');
    }
  };

  const handleAction = () => {
    setToast(toastMessage);
    window.setTimeout(() => setToast(null), 2600);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-parchment">
      <AnimatePresence mode="wait">
        {stage === 'upload' && (
          <motion.div key="upload" exit={{ opacity: 0, y: -36 }} transition={{ duration: 0.45 }}>
            <UploadScreen onFile={handleFile} error={error} />
          </motion.div>
        )}
        {stage === 'processing' && <LoadingScreen key="processing" elapsed={elapsed} fileName={displayFileName} />}
        {stage === 'results' && (
          <motion.div
            key="results"
            initial={{ y: '100vh' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.75, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <OverviewHeader />
            <main>
              <RiskScore />
              <ClauseBreakdown />
              <RiskSummary />
              <TopRisks />
              <PlainEnglishSummary />
              <Recommendations />
            </main>
            <ExportShareBar toast={toast} onAction={handleAction} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnalysisFlow;
