import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Download,
  Smartphone,
  Monitor,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Clock,
} from 'lucide-react';
import type { Project, LandingPageSpec } from '../types';
import { db } from '../db';

interface LandingPageStudioProps {
  project: Project | null;
  onOpenAICofounderWithPrompt: (prompt: string) => void;
}

export const LandingPageStudio: React.FC<LandingPageStudioProps> = ({
  project,
  onOpenAICofounderWithPrompt,
}) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);

  // Landing page copy state
  const [headline, setHeadline] = useState(
    project ? `Stop Wasting Time on Inefficient Workflows.` : 'The Modern Solution for Modern Teams.'
  );
  const [subheadline, setSubheadline] = useState(
    project?.oneSentenceIdea ||
      'Deliver high-leverage outcomes with verified speed and complete transparency.'
  );
  const [ctaText, setCtaText] = useState('Claim Free Pilot Access');
  const [problemHeadline, setProblemHeadline] = useState(
    'Existing alternatives leave founders and teams frustrated and slowed down.'
  );
  const [problemBody, setProblemBody] = useState(
    project?.problemStatement ||
      'Legacy tools are expensive, fragmented, and force manual busywork. You waste hours coordinating rather than making progress.'
  );
  const [step1, setStep1] = useState('Sign up in 30 seconds with zero credit card required');
  const [step2, setStep2] = useState('Connect your workflow and automate your primary bottleneck');
  const [step3, setStep3] = useState('Track verified outcomes and scale with confidence');
  const [faq1Q, setFaq1Q] = useState('How much does it cost?');
  const [faq1A, setFaq1A] = useState('We offer a generous free tier during early access. Paid tiers start at straightforward transparent rates.');
  const [faq2Q, setFaq2Q] = useState('How does this protect my data?');
  const [faq2A, setFaq2A] = useState('Zero third-party trackers, local-first storage options, and strict privacy boundaries.');

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const isLoadedRef = useRef(false);
  const saveTimeoutRef = useRef<any>(null);

  // Load from IndexedDB
  useEffect(() => {
    if (!project?.id) return;
    isLoadedRef.current = false;

    async function loadData() {
      try {
        const stored = await db.landingPage.where('projectId').equals(project!.id).first();
        if (stored) {
          if (stored.headline) setHeadline(stored.headline);
          if (stored.subheadline) setSubheadline(stored.subheadline);
          if (stored.ctaText) setCtaText(stored.ctaText);
          if (stored.problemHeadline) setProblemHeadline(stored.problemHeadline);
          if (stored.problemBody) setProblemBody(stored.problemBody);
          if (stored.step1) setStep1(stored.step1);
          if (stored.step2) setStep2(stored.step2);
          if (stored.step3) setStep3(stored.step3);
          if (stored.faq1Q) setFaq1Q(stored.faq1Q);
          if (stored.faq1A) setFaq1A(stored.faq1A);
          if (stored.faq2Q) setFaq2Q(stored.faq2Q);
          if (stored.faq2A) setFaq2A(stored.faq2A);
          setLastSaved(new Date(stored.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } else if (project) {
          if (project.oneSentenceIdea) setSubheadline(project.oneSentenceIdea);
          if (project.problemStatement) setProblemBody(project.problemStatement);
        }
      } catch (err) {
        console.error('Failed to load landing page from database:', err);
      } finally {
        isLoadedRef.current = true;
      }
    }

    loadData();
  }, [project?.id]);

  // Debounced autosave
  useEffect(() => {
    if (!project?.id || !isLoadedRef.current) return;

    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const now = Date.now();
        const dataToSave: LandingPageSpec = {
          id: `lp_${project.id}`,
          projectId: project.id,
          headline,
          subheadline,
          ctaText,
          problemHeadline,
          problemBody,
          step1,
          step2,
          step3,
          faq1Q,
          faq1A,
          faq2Q,
          faq2A,
          updatedAt: now,
        };

        await db.landingPage.put(dataToSave);
        setSaveStatus('saved');
        setLastSaved(new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        console.error('Failed to autosave landing page spec:', err);
        setSaveStatus('idle');
      }
    }, 600);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [
    project?.id,
    headline,
    subheadline,
    ctaText,
    problemHeadline,
    problemBody,
    step1,
    step2,
    step3,
    faq1Q,
    faq1A,
    faq2Q,
    faq2A,
  ]);

  // Generate pure standalone semantic HTML/CSS file
  const generateStaticHtml = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project?.name || 'Product'} — ${headline}</title>
  <style>
    :root {
      --bg: #ffffff;
      --text: #18181b;
      --muted: #71717a;
      --border: #e4e4e7;
      --card-bg: #fafafa;
      --primary: #18181b;
      --primary-text: #ffffff;
      --accent: #10b981;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #09090b;
        --text: #f4f4f5;
        --muted: #a1a1aa;
        --border: #27272a;
        --card-bg: #18181b;
        --primary: #f4f4f5;
        --primary-text: #09090b;
        --accent: #34d399;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 0 1.5rem;
    }
    .container { max-width: 900px; margin: 0 auto; }
    header { padding: 2rem 0; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-weight: 700; font-size: 1.25rem; letter-spacing: -0.02em; }
    .hero { padding: 4rem 0 3rem; text-align: center; }
    .hero h1 { font-size: 2.75rem; font-weight: 800; letter-spacing: -0.03em; line-height: 1.15; margin-bottom: 1.25rem; }
    .hero p { font-size: 1.15rem; color: var(--muted); max-width: 650px; margin: 0 auto 2rem; }
    .btn {
      display: inline-block;
      background: var(--primary);
      color: var(--primary-text);
      padding: 0.85rem 2rem;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      font-size: 1rem;
      transition: opacity 0.2s;
    }
    .btn:hover { opacity: 0.9; }
    .section { padding: 4rem 0; border-top: 1px solid var(--border); }
    .section-title { font-size: 1.75rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 1rem; text-align: center; }
    .section-subtitle { text-align: center; color: var(--muted); max-width: 600px; margin: 0 auto 2.5rem; font-size: 1rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
    .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 1.75rem; }
    .card h3 { font-size: 1.1rem; margin-bottom: 0.5rem; }
    .card p { color: var(--muted); font-size: 0.95rem; }
    .step-number { font-size: 0.85rem; font-family: monospace; color: var(--accent); font-weight: 700; margin-bottom: 0.5rem; }
    .faq-item { margin-bottom: 1.5rem; }
    .faq-item h4 { font-size: 1.05rem; margin-bottom: 0.25rem; }
    .faq-item p { color: var(--muted); font-size: 0.95rem; }
    footer { padding: 3rem 0; text-align: center; color: var(--muted); font-size: 0.85rem; border-top: 1px solid var(--border); }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand">${project?.name || 'Product'}</div>
      <a href="#cta" class="btn" style="padding: 0.5rem 1.25rem; font-size: 0.85rem;">${ctaText}</a>
    </header>

    <main>
      <section class="hero">
        <h1>${headline}</h1>
        <p>${subheadline}</p>
        <a id="cta" href="mailto:founder@example.com?subject=Pilot%20Inquiry" class="btn">${ctaText}</a>
      </section>

      <section class="section">
        <h2 class="section-title">The Problem We Fix</h2>
        <p class="section-subtitle">${problemHeadline}</p>
        <div class="card" style="max-width: 700px; margin: 0 auto; text-align: center;">
          <p style="font-size: 1.05rem; line-height: 1.7;">${problemBody}</p>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">How It Works</h2>
        <p class="section-subtitle">No bidding wars. Three simple steps to guaranteed work.</p>
        <div class="grid">
          <div class="card">
            <div class="step-number">STEP 01</div>
            <h3>Instant Alert</h3>
            <p>${step1}</p>
          </div>
          <div class="card">
            <div class="step-number">STEP 02</div>
            <h3>1-Click Acceptance</h3>
            <p>${step2}</p>
          </div>
          <div class="card">
            <div class="step-number">STEP 03</div>
            <h3>Guaranteed Pay</h3>
            <p>${step3}</p>
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Frequently Asked Questions</h2>
        <div style="max-width: 650px; margin: 0 auto;">
          <div class="faq-item">
            <h4>${faq1Q}</h4>
            <p>${faq1A}</p>
          </div>
          <div class="faq-item">
            <h4>${faq2Q}</h4>
            <p>${faq2A}</p>
          </div>
        </div>
      </section>

      <section class="hero" style="padding: 3rem 0 5rem;">
        <h2>Ready for predictable local work?</h2>
        <p style="margin-top: 0.5rem;">Join our early access group today.</p>
        <a href="mailto:founder@example.com?subject=Pilot%20Inquiry" class="btn">${ctaText}</a>
      </section>
    </main>

    <footer>
      <p>&copy; ${new Date().getFullYear()} ${project?.name || 'Company'}. Privacy First · Zero Trackers.</p>
    </footer>
  </div>
</body>
</html>`;
  };

  const handleDownload = () => {
    const htmlContent = generateStaticHtml();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.name.toLowerCase().replace(/\s+/g, '_') || 'landing'}_index.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateStaticHtml());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
              <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Landing Page Studio & Exporter</span>
            </h1>
            {saveStatus === 'saving' && (
              <span className="flex items-center space-x-1 text-[11px] text-amber-500 font-medium px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <Clock className="w-3 h-3 animate-spin" />
                <span>Saving...</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center space-x-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                <span>Autosaved {lastSaved ? `at ${lastSaved}` : 'locally'}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Craft high-converting proposition copy and export a 100% tracker-free, production-ready static HTML file. Persisted locally in IndexedDB.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-semibold hover:bg-zinc-200 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied HTML!' : 'Copy Code'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download Static index.html</span>
          </button>
        </div>
      </div>

      {/* 2-Column Studio: Editor Left, Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Form */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4 max-h-[750px] overflow-y-auto text-xs">
          <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            Proposition Copywriting Editor
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Hero Headline (Outcome-focused)
              </label>
              <textarea
                rows={2}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-medium"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Hero Subheadline (Specific mechanism & audience)
              </label>
              <textarea
                rows={2}
                value={subheadline}
                onChange={(e) => setSubheadline(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Primary Call-To-Action (CTA) Button Text
              </label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-semibold"
              />
            </div>

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <label className="block font-semibold text-zinc-800 dark:text-zinc-200">
                Problem Statement Section
              </label>
              <input
                type="text"
                value={problemHeadline}
                onChange={(e) => setProblemHeadline(e.target.value)}
                placeholder="Section title"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 mb-2"
              />
              <textarea
                rows={3}
                value={problemBody}
                onChange={(e) => setProblemBody(e.target.value)}
                placeholder="Pain point description"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
              />
            </div>

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <label className="block font-semibold text-zinc-800 dark:text-zinc-200">
                How It Works (3 Steps)
              </label>
              <input
                type="text"
                value={step1}
                onChange={(e) => setStep1(e.target.value)}
                placeholder="Step 1"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
              />
              <input
                type="text"
                value={step2}
                onChange={(e) => setStep2(e.target.value)}
                placeholder="Step 2"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
              />
              <input
                type="text"
                value={step3}
                onChange={(e) => setStep3(e.target.value)}
                placeholder="Step 3"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
              />
            </div>

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <label className="block font-semibold text-zinc-800 dark:text-zinc-200">
                Frequently Asked Questions (Objections)
              </label>
              <input
                type="text"
                value={faq1Q}
                onChange={(e) => setFaq1Q(e.target.value)}
                placeholder="Question 1"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-medium"
              />
              <textarea
                rows={2}
                value={faq1A}
                onChange={(e) => setFaq1A(e.target.value)}
                placeholder="Answer 1"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 mb-2"
              />
              <input
                type="text"
                value={faq2Q}
                onChange={(e) => setFaq2Q(e.target.value)}
                placeholder="Question 2"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-medium"
              />
              <textarea
                rows={2}
                value={faq2A}
                onChange={(e) => setFaq2A(e.target.value)}
                placeholder="Answer 2"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2"
              />
            </div>
          </div>
        </div>

        {/* Live Device Preview */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Live Preview
            </span>
            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`p-1.5 rounded text-xs transition-colors ${
                  deviceMode === 'desktop'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`p-1.5 rounded text-xs transition-colors ${
                  deviceMode === 'mobile'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Iframe Preview Container */}
          <div
            className={`border border-zinc-300 dark:border-zinc-700 rounded-xl overflow-hidden bg-white shadow-md mx-auto transition-all h-[700px] ${
              deviceMode === 'mobile' ? 'w-[375px]' : 'w-full'
            }`}
          >
            <iframe
              title="Landing Page Preview"
              srcDoc={generateStaticHtml()}
              className="w-full h-full border-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
