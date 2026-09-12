import type {
  Project,
  EvidenceItem,
  Experiment,
  CustomerInterview,
  Competitor,
  BusinessModelData,
  GTMPlan,
  LandingPageSpec,
  FeatureItem,
  RoadmapItem,
  CanvasNode,
} from '../types';

// Generic fetch wrapper with robust error fallback
async function callServerAutocomplete<T>(
  task: string,
  seedText: string,
  context: Record<string, any>,
  fields: string[]
): Promise<T | null> {
  try {
    const res = await fetch('/api/ai/autocomplete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, seedText, context, fields }),
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data as T;
  } catch (err) {
    return null;
  }
}

// -------------------------------------------------------------
// 1. FULL PROJECT ONBOARDING SETUP AUTOMATION
// -------------------------------------------------------------
export async function autoCompleteFullProject(
  seedIdea?: string,
  selectedCategory?: string
): Promise<Partial<Project>> {
  const fields = [
    'name',
    'oneSentenceIdea',
    'category',
    'stage',
    'targetMarket',
    'location',
    'problemStatement',
    'targetUserGroup',
    'problemFrequency',
    'problemSeverity',
    'currentAlternatives',
    'successDefinition',
    'behavioralChange',
    'willingnessToPayTrigger',
    'founderSkills',
    'budget',
    'timeline',
  ];

  const serverResult = await callServerAutocomplete<Partial<Project>>(
    'full_project_setup',
    seedIdea || 'AI developer tool for micro-founders',
    { category: selectedCategory },
    fields
  );

  if (serverResult && serverResult.name && serverResult.problemStatement) {
    return {
      ...serverResult,
      stage: 'idea',
      problemFrequency: serverResult.problemFrequency || 'daily',
      problemSeverity: serverResult.problemSeverity || 'severe',
      startingPoint: 'idea_only',
    };
  }

  // High-craft Offline Deterministic Generator
  const cleanSeed = (seedIdea || '').trim();
  const lowerSeed = cleanSeed.toLowerCase();

  if (lowerSeed.includes('contractor') || lowerSeed.includes('invoice') || lowerSeed.includes('lien') || lowerSeed.includes('construction')) {
    return {
      name: cleanSeed.length > 3 ? cleanSeed.split(' ')[0] + 'Lien' : 'SubContractLien',
      oneSentenceIdea: 'Instant automated lien-waiver exchange and progress-billing invoicing for trade subcontractors.',
      category: 'Vertical SaaS / ConstructionTech',
      stage: 'idea',
      targetMarket: 'Specialty trade subcontractors (HVAC, plumbing, electrical) with 2-15 employees.',
      location: 'United States',
      problemStatement: 'Subcontractors wait 60 to 90 days to receive progress payments because general contractors require notarized unconditional lien waivers before releasing retainage.',
      targetUserGroup: 'Subcontractor office managers and solo trade business owners',
      problemFrequency: 'weekly',
      problemSeverity: 'critical',
      currentAlternatives: 'Printed PDFs, postal mail, manual notarization stamps, and spreadsheets',
      successDefinition: 'Cutting payment delay from 75 days down to 14 days and eliminating uncollectible receivables',
      behavioralChange: 'Uploading invoice line-items through a mobile-friendly link rather than mailing physical waivers',
      willingnessToPayTrigger: 'Charging a $79/mo subscription or 0.8% per expedited milestone payout',
      founderSkills: 'B2B software engineering, basic construction compliance knowledge',
      budget: '$1,000 - $3,000 bootstrapping capital',
      timeline: '6 weeks to closed beta with 3 local trade subs',
      startingPoint: 'problem_identified',
    };
  }

  if (lowerSeed.includes('health') || lowerSeed.includes('therap') || lowerSeed.includes('clinic') || lowerSeed.includes('patient')) {
    return {
      name: cleanSeed.length > 3 ? cleanSeed.split(' ')[0] + 'Doc' : 'OrthoNotes AI',
      oneSentenceIdea: 'Ambient clinical documentation and SOAP note generation for solo physical therapists and chiropractors.',
      category: 'HealthTech / Practitioner Workflow',
      stage: 'idea',
      targetMarket: 'Solo physical therapists, sports chiropractors, and private clinic owners.',
      location: 'North America / English-speaking',
      problemStatement: 'Physical therapists spend 2.5 unpaid hours every evening writing compliant clinical SOAP notes to satisfy Medicare and insurer billing audits.',
      targetUserGroup: 'Independent physical therapy practitioners',
      problemFrequency: 'daily',
      problemSeverity: 'severe',
      currentAlternatives: 'Legacy desktop EHR dropdowns, generic voice recorders, and manual typing at home',
      successDefinition: 'Zero documentation backlog at the end of clinic hours with 100% insurance audit compliance',
      behavioralChange: 'Speaking naturally with patients during the session while background audio generates structured charts',
      willingnessToPayTrigger: 'Paying $99/mo to reclaim 12 hours of personal evening time per week',
      founderSkills: 'Full-stack development, HIPAA compliance awareness, audio processing',
      budget: '$500 - $1,500',
      timeline: '4 weeks to live prototype test with 2 clinics',
      startingPoint: 'idea_only',
    };
  }

  if (lowerSeed.includes('food') || lowerSeed.includes('farm') || lowerSeed.includes('restaurant') || lowerSeed.includes('market')) {
    return {
      name: cleanSeed.length > 3 ? cleanSeed.split(' ')[0] + 'Harvest' : 'FarmDirect Route',
      oneSentenceIdea: 'Decentralized wholesale ordering and scheduled aggregate delivery for local organic farms and restaurants.',
      category: 'B2B Marketplace & Logistics',
      stage: 'idea',
      targetMarket: 'Farm-to-table independent restaurants and regional regenerative vegetable/dairy farms.',
      location: 'Regional metro areas',
      problemStatement: 'Chefs spend hours texting 8 separate farm vendors at midnight, resulting in out-of-stock surprises, chaotic delivery times, and missed orders.',
      targetUserGroup: 'Head chefs, restaurant general managers, and independent farm owners',
      problemFrequency: 'daily',
      problemSeverity: 'severe',
      currentAlternatives: 'Late night SMS messages, whiteboards, paper wholesale order sheets, and Sysco/broadline reps',
      successDefinition: 'Single 2-minute order checkout consolidating all regional farm deliveries onto one morning invoice',
      behavioralChange: 'Reviewing seasonal local farm harvest availability on a mobile catalog rather than texting individual growers',
      willingnessToPayTrigger: '3-5% transaction take-rate or $89/mo subscription for wholesale catalog management',
      founderSkills: 'Marketplace design, regional distribution logistics',
      budget: '$1,000 bootstrapping',
      timeline: '4 weeks to 5 chef pilot accounts',
      startingPoint: 'idea_only',
    };
  }

  // Default smart template
  const defaultName = cleanSeed
    ? cleanSeed.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('').slice(0, 20)
    : 'OmniFlow';

  return {
    name: defaultName,
    oneSentenceIdea: cleanSeed
      ? `High-leverage automated workflow for ${cleanSeed}`
      : 'Privacy-focused automated ledger and operations hub for lean software founders.',
    category: selectedCategory || 'B2B SaaS / Workflow Automation',
    stage: 'idea',
    targetMarket: 'Solo entrepreneurs, indie developers, and boutique agency owners.',
    location: 'Global / Remote',
    problemStatement: cleanSeed
      ? `Target users waste excessive time managing manual fragmented processes around ${cleanSeed}.`
      : 'Founders build complex product features for months without validating whether target customers genuinely care or have budget.',
    targetUserGroup: 'Early-stage startup founders and product managers',
    problemFrequency: 'daily',
    problemSeverity: 'severe',
    currentAlternatives: 'Disconnected spreadsheets, Notion documents, loose bookmarks, and mental notes',
    successDefinition: 'Cutting time-to-first-validated-paying-customer by 70% with systematic empirical evidence',
    behavioralChange: 'Logging customer evidence and running falsifiable experiments before writing application code',
    willingnessToPayTrigger: 'Paying $29 to $79/mo for an evidence-backed roadmap and investor-ready dossier',
    founderSkills: 'TypeScript, React, product strategy, customer discovery',
    budget: '$500 - $2,000 bootstrapping',
    timeline: '4 weeks to initial smoke-test and 10 discovery calls',
    startingPoint: 'idea_only',
  };
}

// -------------------------------------------------------------
// 2. INDIVIDUAL FIELD SUGGESTION
// -------------------------------------------------------------
export async function suggestProjectField(
  fieldName: string,
  context: {
    name?: string;
    oneSentenceIdea?: string;
    category?: string;
    problemStatement?: string;
    targetMarket?: string;
  }
): Promise<string> {
  const serverResult = await callServerAutocomplete<{ suggestion: string }>(
    'suggest_field',
    fieldName,
    context,
    [fieldName]
  );

  if (serverResult?.suggestion) return serverResult.suggestion;

  // Offline fallback
  const idea = context.oneSentenceIdea || context.name || 'this workflow';
  switch (fieldName) {
    case 'problemStatement':
      return `Target users currently lose 5-10 hours weekly coordinating ${idea} across disorganized spreadsheets and email threads, leading to costly omissions.`;
    case 'targetUserGroup':
      return `Mid-level operations leads and solo operators managing ${context.category || 'workflows'} in teams under 50 people.`;
    case 'currentAlternatives':
      return 'Ad-hoc Google Sheets, manual copy-pasting across Slack, and expensive enterprise platforms with 6-month sales cycles.';
    case 'successDefinition':
      return 'Automating the repetitive manual steps down to under 5 minutes per cycle with 100% verifiable data accuracy.';
    case 'behavioralChange':
      return 'Replacing manual end-of-week reconciliation with real-time automated status logging.';
    case 'willingnessToPayTrigger':
      return 'Willing to pay $49-$149/mo when shown measurable reduction in overtime hours and eliminated error fines.';
    case 'nextTest':
      return 'Conduct 5 structured 20-minute discovery interviews asking about the last time this workflow broke.';
    default:
      return `Evidence-backed hypothesis regarding ${fieldName.toLowerCase()} for ${idea}.`;
  }
}

// -------------------------------------------------------------
// 3. EVIDENCE MATRIX AUTOMATION
// -------------------------------------------------------------
export async function generateEvidenceMatrix(
  project: Partial<Project>
): Promise<Array<Omit<EvidenceItem, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>> {
  const serverResult = await callServerAutocomplete<{
    claims: Array<Omit<EvidenceItem, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>;
  }>('evidence_claims', project.oneSentenceIdea || '', project, ['claims']);

  if (serverResult?.claims && Array.isArray(serverResult.claims) && serverResult.claims.length > 0) {
    return serverResult.claims;
  }

  const problem = project.problemStatement || 'Target workflow bottleneck causes measurable friction.';
  const user = project.targetUserGroup || 'Target customers';
  const target = project.targetMarket || 'Primary market segment';

  return [
    {
      claim: `${user} encounter this specific pain at least weekly and rate it as severe or critical.`,
      type: 'problem',
      status: 'assumption',
      evidenceNotes: 'Foundational desirability premise; unverified until 10 target users confirm without prompt prompting.',
      confidence: 'low',
      nextTest: 'Conduct 5 customer discovery interviews focusing strictly on past weekly pain incidents.',
    },
    {
      claim: `${user} are actively dissatisfied with existing alternatives (${project.currentAlternatives || 'manual workarounds'}).`,
      type: 'problem',
      status: 'assumption',
      evidenceNotes: 'If users are content with existing free tools or spreadsheets, switching friction will be prohibitive.',
      confidence: 'medium',
      nextTest: 'Ask interviewees: "What did you dislike most the last time you used your current workaround?"',
    },
    {
      claim: `${target} have authority and dedicated budget to pay ${project.willingnessToPayTrigger || '$49+/month'} for a dedicated solution.`,
      type: 'pricing',
      status: 'assumption',
      evidenceNotes: 'Commercial viability risk; willingness to say "nice idea" is not willingness to pay.',
      confidence: 'low',
      nextTest: 'Run a pre-order commitment test or request a signed non-binding letter of intent.',
    },
    {
      claim: `We can acquire qualified ${user} leads for under $50 CAC through direct outbound or niche community channels.`,
      type: 'distribution',
      status: 'assumption',
      evidenceNotes: 'Distribution viability risk; product cannot scale if customer acquisition cost exceeds lifetime value.',
      confidence: 'low',
      nextTest: 'Send 30 personalized LinkedIn/email messages with high-value framework to measure reply rate.',
    },
  ];
}

// -------------------------------------------------------------
// 4. EXPERIMENTS SUITE AUTOMATION
// -------------------------------------------------------------
export async function generateExperimentSuite(
  project: Partial<Project>
): Promise<Array<Omit<Experiment, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>> {
  const serverResult = await callServerAutocomplete<{
    experiments: Array<Omit<Experiment, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>;
  }>('experiment_suite', project.oneSentenceIdea || '', project, ['experiments']);

  if (serverResult?.experiments && Array.isArray(serverResult.experiments) && serverResult.experiments.length > 0) {
    return serverResult.experiments;
  }

  const user = project.targetUserGroup || 'target customers';

  return [
    {
      hypothesis: `At least 6 out of 10 interviewed ${user} will spontaneously cite this problem as a top-3 operational frustration when asked about their workflow.`,
      dimension: 'problem',
      method: 'customer_interview',
      targetSampleSize: 10,
      currentSampleSize: 0,
      successCriteria: '6+ participants independently confirm high severity and describe a recent painful incident.',
      failureCriteria: 'Fewer than 4 participants care, or they consider the issue minor/tolerable.',
      status: 'planned',
      results: '',
    },
    {
      hypothesis: `A focused 1-page smoke test landing page explaining the core value proposition will convert at >= 8% email signup rate from cold targeted traffic.`,
      dimension: 'solution',
      method: 'smoke_landing_page',
      targetSampleSize: 100,
      currentSampleSize: 0,
      successCriteria: '>= 8 verified waitlist signups with company email addresses out of 100 unique visitors.',
      failureCriteria: 'Conversion rate under 3% after 150 qualified visitors.',
      status: 'planned',
      results: '',
    },
    {
      hypothesis: `When offered an early-bird pilot discount, at least 3 out of 15 qualified prospects will commit a deposit or written letter of intent.`,
      dimension: 'commercial',
      method: 'pre_order',
      targetSampleSize: 15,
      currentSampleSize: 0,
      successCriteria: '>= 3 signed LOIs or pre-payment deposits collected before building backend code.',
      failureCriteria: 'Zero prospects willing to commit financially even after expressing verbal enthusiasm.',
      status: 'planned',
      results: '',
    },
  ];
}

// -------------------------------------------------------------
// 5. THE MOM TEST QUESTIONS GENERATOR
// -------------------------------------------------------------
export async function generateMomTestQuestions(project: Partial<Project>): Promise<string[]> {
  const serverResult = await callServerAutocomplete<{ questions: string[] }>(
    'interview_questions',
    project.problemStatement || '',
    project,
    ['questions']
  );

  if (serverResult?.questions && Array.isArray(serverResult.questions) && serverResult.questions.length > 0) {
    return serverResult.questions;
  }

  return [
    'When was the last time this specific problem happened to you? Walk me through what happened step by step.',
    'What did you do to solve or work around it at that moment? Why that specific approach?',
    'What did you dislike or find most frustrating about the current workaround you used?',
    'What other software or services have you tried or researched to fix this? Why did you stop using them?',
    'How much budget or time does your team currently spend dealing with the consequences of this issue every month?',
  ];
}

// -------------------------------------------------------------
// 6. REALISTIC INTERVIEW SAMPLE GENERATOR
// -------------------------------------------------------------
export async function generateInterviewSample(project: Partial<Project>): Promise<Partial<CustomerInterview>> {
  const serverResult = await callServerAutocomplete<Partial<CustomerInterview>>(
    'interview_sample',
    project.targetUserGroup || '',
    project,
    ['participantRole', 'existingWorkarounds', 'willingnessToPayNotes', 'verbatimQuotes', 'surprisesOrObjections']
  );

  if (serverResult?.participantRole && serverResult?.verbatimQuotes) {
    return serverResult;
  }

  const role = project.targetUserGroup?.split(' ')[0] || 'Operations Lead';
  return {
    intervieweeIdentifier: `${role} - Midsize Regional Firm`,
    participantRole: `${role} / Team Lead (8 years experience)`,
    date: new Date().toISOString().split('T')[0],
    severityRating: 'severe',
    existingWorkarounds: 'They currently manage this with two nested Google Sheets and a manual Friday afternoon reconciliation checklist.',
    willingnessToPayNotes: 'Confirmed they already spend $120/mo on another software that only handles 20% of this problem, and would happily reallocate budget if automated.',
    verbatimQuotes: [
      '“Every Friday we lose at least two hours just double-checking entries because one broken formula ruined a report.”',
      '“I tried setting up Zapier, but when the webhook failed silently, nobody noticed until the client called complaining.”',
      '“If something could guarantee this runs without me having to babysit it, I would pay out of my own departmental card today.”',
    ],
    notesOrTranscript: 'Participant was visibly animated when discussing the frustration of legacy manual workarounds. Emphasized that reliability and simple audit trails matter more than fancy UI.',
    surprisesOrObjections: 'Surprised to learn they do not care about mobile access—their entire workflow happens on dual-monitor desktop setups during business hours.',
  };
}

// -------------------------------------------------------------
// 7. COMPETITOR DISCOVERY AUTOMATION
// -------------------------------------------------------------
export async function discoverCompetitors(
  project: Partial<Project>
): Promise<Array<Omit<Competitor, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>> {
  const serverResult = await callServerAutocomplete<{
    competitors: Array<Omit<Competitor, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>;
  }>('competitor_discovery', project.oneSentenceIdea || '', project, ['competitors']);

  if (serverResult?.competitors && Array.isArray(serverResult.competitors) && serverResult.competitors.length > 0) {
    return serverResult.competitors;
  }

  const cat = project.category || 'B2B Software';

  return [
    {
      name: 'Legacy Spreadsheets & Manual Docs',
      url: 'https://workspace.google.com/sheets',
      productDescription: 'The ubiquitous default workaround: custom Google Sheets, Excel workbooks, and email threads.',
      pricingModel: 'Free / Bundled in office suites',
      targetAudience: 'Everyone, from solo founders to enterprise teams',
      positioning: 'Universal, flexible, zero incremental cost',
      strengths: ['Zero cost barrier', 'Infinite customization flexibility', 'Familiar to every employee'],
      weaknesses: ['Prone to manual human errors', 'Silent formula breaks', 'No audit trail or automated alerts'],
      customerComplaints: ['Too much manual data re-entry', 'Breaks when team scales past 3 people', 'No mobile automation'],
      keyDifferentiators: 'We provide structured automation, real-time validations, and zero maintenance overhead.',
      evidenceNotes: 'The primary incumbent in 80% of customer discovery calls is not another startup, but spreadsheet inertia.',
    },
    {
      name: 'Enterprise Market Incumbent',
      url: 'https://example.com/enterprise-suite',
      productDescription: 'Complex legacy enterprise suite built for Fortune 500 organizations with extensive custom modules.',
      pricingModel: '$800 - $3,000/month + annual contract',
      targetAudience: 'Enterprise departments and corporate IT buyers',
      positioning: 'Heavyweight all-in-one corporate governance platform',
      strengths: ['Established brand credibility', 'SOC2/ISO compliance certifications', 'Deep vendor integrations'],
      weaknesses: ['Bloated complicated UI', 'Requires 3-month onboarding consultant', 'Prohibitive price for small teams'],
      customerComplaints: ['Slow and clunky', 'Requires mandatory multi-year contracts', 'Poor customer support for non-VIPs'],
      keyDifferentiators: 'We launch in 2 minutes with zero IT configuration, designed specifically for lean, agile operators.',
      evidenceNotes: 'Customers resent paying five figures for software when they only use 10% of the features.',
    },
    {
      name: 'Point-Solution Startup Alternative',
      url: 'https://example.com/niche-tool',
      productDescription: 'Modern VC-funded SaaS focusing on a narrow slice of this workflow.',
      pricingModel: '$29 - $99/user/month',
      targetAudience: 'Tech-forward SMBs and modern startups',
      positioning: 'Sleek, lightweight point tool',
      strengths: ['Clean UI design', 'Modern API webhooks', 'Fast self-serve signup'],
      weaknesses: ['Shallow depth on edge cases', 'Aggressive price increases after funding rounds', 'Locked proprietary ecosystem'],
      customerComplaints: ['Expensive per-seat pricing', 'Feature requests ignored', 'Lacks native local-first privacy'],
      keyDifferentiators: 'Privacy-driven, transparent flat pricing, and designed for rigorous evidence-backed execution.',
      evidenceNotes: 'Users complain that modern point solutions nickel-and-dime for basic team seats.',
    },
  ];
}

// -------------------------------------------------------------
// 8. LEAN CANVAS & BUSINESS MODEL AUTOMATION
// -------------------------------------------------------------
export async function generateLeanCanvas(project: Partial<Project>): Promise<Partial<BusinessModelData>> {
  const serverResult = await callServerAutocomplete<Partial<BusinessModelData>>(
    'lean_canvas',
    project.oneSentenceIdea || '',
    project,
    [
      'problem',
      'customerSegments',
      'uniqueValue',
      'solution',
      'channels',
      'revenueStreams',
      'costStructure',
      'keyMetrics',
      'unfairAdvantage',
      'monthlyPrice',
      'grossMarginPct',
      'monthlyChurnPct',
      'cac',
      'fixedMonthlyCost',
    ]
  );

  if (serverResult?.problem && serverResult?.uniqueValue) {
    return serverResult;
  }

  return {
    problem: project.problemStatement || 'Target customers lose hours on fragmented, error-prone manual workarounds without real-time oversight.',
    customerSegments: project.targetMarket || 'Solo practitioners, boutique operators, and agile team leads.',
    uniqueValue: project.oneSentenceIdea || 'High-leverage automated operations platform delivering verifiable 10x time savings.',
    solution: 'Single unified dashboard that automates primary data inputs, runs integrity checks, and syncs status instantly.',
    channels: 'Targeted cold email outreach, active niche subreddits/Discord groups, and direct high-value framework lead magnets.',
    revenueStreams: '$49 to $99/month recurring flat subscription with unlimited local projects and annual discount.',
    costStructure: 'Hosting infrastructure ($25/mo), transactional emails ($15/mo), payment gateway fees (2.9% + $0.30), domain.',
    keyMetrics: 'Customer acquisition cost (CAC), 30-day retention, daily active workflows completed, organic referral rate.',
    unfairAdvantage: project.founderSkills || 'Direct founder access, specialized domain empathy, and lightweight local-first architecture.',
    monthlyPrice: 49,
    grossMarginPct: 85,
    monthlyChurnPct: 5,
    cac: 95,
    fixedMonthlyCost: 250,
  };
}

// -------------------------------------------------------------
// 9. GO-TO-MARKET STRATEGY AUTOMATION
// -------------------------------------------------------------
export async function generateGTMStrategy(project: Partial<Project>): Promise<Partial<GTMPlan>> {
  const serverResult = await callServerAutocomplete<Partial<GTMPlan>>(
    'gtm_strategy',
    project.oneSentenceIdea || '',
    project,
    ['targetUser', 'need', 'productName', 'category', 'benefit', 'competitor', 'differentiator', 'channels']
  );

  if (serverResult?.targetUser && serverResult?.benefit) {
    return serverResult;
  }

  return {
    targetUser: project.targetMarket || 'ambitious early-stage founders and small team operators',
    need: project.problemStatement?.slice(0, 100) || 'struggle with chaotic fragmented manual processes',
    productName: project.name || 'Our Platform',
    category: project.category || 'evidence-driven productivity software',
    benefit: 'eliminates 80% of repetitive operational overhead with verifiable accuracy',
    competitor: project.currentAlternatives || 'clunky spreadsheets and high-priced enterprise suites',
    differentiator: 'is built local-first, charges transparent flat pricing, and requires zero complex onboarding',
    channels: [
      {
        name: 'Personalized Cold Outreach (LinkedIn & Email)',
        type: 'Outbound',
        status: 'testing',
        notes: 'Targeting 30 hand-selected operators with a 3-sentence non-salesy message offering a tailored audit.',
      },
      {
        name: 'High-Intent Community Value Posts',
        type: 'Inbound Community',
        status: 'assumed',
        notes: 'Sharing transparent teardowns and free open-source templates on Reddit, Hacker News, and Indie Hackers.',
      },
      {
        name: 'Micro-Influencer & Newsletter Partnerships',
        type: 'Partnerships',
        status: 'assumed',
        notes: 'Sponsoring niche curated industry newsletters reaching 2,000-5,000 verified target professionals.',
      },
    ],
  };
}

// -------------------------------------------------------------
// 10. LANDING PAGE SMOKE TEST COPY AUTOMATION
// -------------------------------------------------------------
export async function generateLandingPageCopy(project: Partial<Project>): Promise<Partial<LandingPageSpec>> {
  const serverResult = await callServerAutocomplete<Partial<LandingPageSpec>>(
    'landing_page_copy',
    project.oneSentenceIdea || '',
    project,
    ['headline', 'subheadline', 'ctaText', 'problemHeadline', 'problemBody', 'step1', 'step2', 'step3', 'faq1Q', 'faq1A', 'faq2Q', 'faq2A']
  );

  if (serverResult?.headline && serverResult?.subheadline) {
    return serverResult;
  }

  const name = project.name || 'OpenFounder';
  return {
    headline: `Stop Wasting Hours on Broken Workarounds. Validate & Execute with Confidence.`,
    subheadline: project.oneSentenceIdea || 'The privacy-first, evidence-driven workspace designed to take your workflow from idea to validated launch.',
    ctaText: 'Claim Early Access (Free Pilot)',
    problemHeadline: 'Existing alternatives leave founders overwhelmed, slowed down, and guessing.',
    problemBody: project.problemStatement || 'Disconnected spreadsheets, messy notes, and vague advice waste hundreds of hours before you even know if customers will pay.',
    step1: 'Set up your project profile in under 60 seconds with guided AI assistance.',
    step2: 'Map your core assumptions, interview target users, and test quantifiable demand.',
    step3: 'Export clean investor-ready dossiers, lean roadmaps, and validated launch plans.',
    faq1Q: 'How does the free early pilot work?',
    faq1A: 'You get full access to all validation tools, AI co-founder assistants, and exportable dossiers with zero credit card required.',
    faq2Q: 'Is my proprietary startup data safe and private?',
    faq2A: 'Yes. Your workspace is stored locally in your browser with full JSON exportability. We never sell or train public models on your data.',
  };
}

// -------------------------------------------------------------
// 11. MVP FEATURE BACKLOG AUTOMATION
// -------------------------------------------------------------
export async function generateMVPBacklog(
  project: Partial<Project>
): Promise<Array<Omit<FeatureItem, 'id' | 'projectId' | 'createdAt'>>> {
  const serverResult = await callServerAutocomplete<{
    features: Array<Omit<FeatureItem, 'id' | 'projectId' | 'createdAt'>>;
  }>('mvp_features', project.oneSentenceIdea || '', project, ['features']);

  if (serverResult?.features && Array.isArray(serverResult.features) && serverResult.features.length > 0) {
    return serverResult.features;
  }

  return [
    {
      title: 'Core Workflow Automated Input Form',
      description: 'Single-screen form allowing users to submit data and receive processed output in under 10 seconds.',
      priority: 'must',
      solvesProblem: 'Solves the primary time bottleneck directly with zero extraneous friction.',
      technicalComplexity: 'low',
      status: 'planned',
    },
    {
      title: 'Immediate Results & Actionable Status View',
      description: 'Clean visual summary presenting verified outcomes with one-click copy and download.',
      priority: 'must',
      solvesProblem: 'Gives users instant confirmation that their task succeeded without manual checking.',
      technicalComplexity: 'low',
      status: 'planned',
    },
    {
      title: 'JSON / CSV Import & Export Capabilities',
      description: 'Permits full data portability so users can import from spreadsheets and export reports.',
      priority: 'must',
      solvesProblem: 'Removes platform lock-in fear and accelerates adoption from current workarounds.',
      technicalComplexity: 'medium',
      status: 'planned',
    },
    {
      title: 'Automated Email & Webhook Notifications',
      description: 'Sends summary alert to Slack or email whenever a batch finishes processing.',
      priority: 'should',
      solvesProblem: 'Keeps team members updated without requiring them to stay logged in.',
      technicalComplexity: 'medium',
      status: 'planned',
    },
    {
      title: 'Custom White-Label Team Branding',
      description: 'Custom logos, domain CNAME mapping, and custom email footer templates.',
      priority: 'wont',
      solvesProblem: 'Excluded from day 1 MVP to prevent scope creep before value is proven.',
      technicalComplexity: 'high',
      status: 'planned',
    },
  ];
}

// -------------------------------------------------------------
// 12. ROADMAP MILESTONES AUTOMATION
// -------------------------------------------------------------
export async function generateRoadmapMilestones(
  project: Partial<Project>
): Promise<Array<Omit<RoadmapItem, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>> {
  const serverResult = await callServerAutocomplete<{
    milestones: Array<Omit<RoadmapItem, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>;
  }>('roadmap_milestones', project.oneSentenceIdea || '', project, ['milestones']);

  if (serverResult?.milestones && Array.isArray(serverResult.milestones) && serverResult.milestones.length > 0) {
    return serverResult.milestones;
  }

  return [
    {
      title: 'Gate 1: Problem & Customer Discovery',
      objective: 'Conduct 10 unbiased Mom Test customer interviews to confirm problem severity >= 7/10.',
      status: 'in_progress',
      priority: 'urgent',
      owner: 'Founder',
      evidenceRequired: '10 logged interview records with verbatim quotes detailing past painful incidents.',
      estimatedEffort: '1 week',
      orderIndex: 0,
    },
    {
      title: 'Gate 2: Smoke Test & Demand Verification',
      objective: 'Deploy a high-converting landing page and validate >= 8% conversion rate from 100 targeted visitors.',
      status: 'not_started',
      priority: 'high',
      owner: 'Growth / Tech',
      evidenceRequired: '15 verified waitlist signups and 3 prospective pilot interview commitments.',
      estimatedEffort: '1-2 weeks',
      orderIndex: 1,
    },
    {
      title: 'Gate 3: Ruthless Concierge / Pilot MVP',
      objective: 'Deliver the core value manually or via lightweight prototype to 3 pilot customers.',
      status: 'not_started',
      priority: 'high',
      owner: 'Founder & Tech',
      evidenceRequired: 'At least 2 out of 3 pilot users express willingness to pay recurring subscription.',
      estimatedEffort: '2-3 weeks',
      orderIndex: 2,
    },
    {
      title: 'Gate 4: Paid Launch & Initial Unit Economics',
      objective: 'Charge the first 5 paying customers and calculate initial CAC and payback timeline.',
      status: 'not_started',
      priority: 'medium',
      owner: 'Founder',
      evidenceRequired: 'First $500 MRR processed through payment gateway with positive user reviews.',
      estimatedEffort: '3-4 weeks',
      orderIndex: 3,
    },
  ];
}

// -------------------------------------------------------------
// 13. DISCOVERY CANVAS GRAPH AUTOMATION
// -------------------------------------------------------------
export async function generateCanvasGraph(
  project: Partial<Project>
): Promise<{
  nodes: Omit<CanvasNode, 'id' | 'projectId'>[];
  edges: { fromIdx: number; toIdx: number; label: string }[];
}> {
  const user = project.targetUserGroup || 'Ideal Customer Profile';
  const problem = project.problemStatement || 'Acute workflow friction';
  const idea = project.oneSentenceIdea || 'Automated high-leverage solution';

  return {
    nodes: [
      {
        type: 'customer',
        title: 'Target Customer',
        description: user.slice(0, 100),
        x: 80,
        y: 100,
      },
      {
        type: 'problem',
        title: 'Core Bottleneck',
        description: problem.slice(0, 120),
        x: 380,
        y: 100,
      },
      {
        type: 'solution',
        title: 'Value Proposition',
        description: idea.slice(0, 120),
        x: 680,
        y: 100,
      },
      {
        type: 'experiment',
        title: 'Falsification Test',
        description: 'Interview 10 target users before building code',
        x: 380,
        y: 280,
      },
      {
        type: 'evidence',
        title: 'Evidence Threshold',
        description: '>= 6 users confirm acute weekly pain and willing to pilot',
        x: 680,
        y: 280,
      },
    ],
    edges: [
      { fromIdx: 0, toIdx: 1, label: 'Suffers from' },
      { fromIdx: 1, toIdx: 2, label: 'Resolved by' },
      { fromIdx: 1, toIdx: 3, label: 'Tested by' },
      { fromIdx: 3, toIdx: 4, label: 'Proves' },
    ],
  };
}
