import type { Project, EvidenceItem, ResearchSource, Competitor, Experiment, FeatureItem, RoadmapItem, CanvasNode, CanvasEdge, BusinessModelData, GTMPlan, LandingPageSpec } from '../types';
import { db, setActiveProjectId } from './index';

export const SAMPLE_PROJECT_ID = 'proj_contractor_market_01';

export async function seedSampleContractorMarketplace(): Promise<void> {
  const existing = await db.projects.get(SAMPLE_PROJECT_ID);
  if (existing) return;

  const now = Date.now();

  const project: Project = {
    id: SAMPLE_PROJECT_ID,
    name: 'Local Contractor Marketplace',
    oneSentenceIdea: 'Direct, transparent booking platform connecting verified residential trade contractors with local property owners.',
    category: 'Marketplace / Services',
    stage: 'validating',
    targetMarket: 'Residential Property Owners & Solo General Contractors',
    location: 'Austin, TX & surrounding metro',
    website: 'https://openfounder.github.io/sample',
    existingResearch: 'Interviewed 4 local remodelers; reviewed BBB complaint trends regarding lead generation paywalls.',
    problemStatement: 'Homeowners struggle to find reliable, licensed specialty contractors quickly, while independent tradespeople waste 30%+ of revenue on predatory lead-gen platforms that sell identical stale leads to 5 competitors.',
    targetUserGroup: 'Solo & micro plumbing, electrical, and HVAC contractors (1-3 person crews)',
    problemFrequency: 'weekly',
    problemSeverity: 'severe',
    currentAlternatives: 'Angi / HomeAdvisor (pay-per-lead), Thumbtack, Craigslist, fragmented word-of-mouth WhatsApp groups.',
    successDefinition: 'Contractors fill 3+ open schedule slots per month with zero upfront lead purchasing fees, paying only on completed jobs.',
    behavioralChange: 'Contractors switch from speculative ad buying to a success-fee verified calendar booking workflow.',
    willingnessToPayTrigger: 'Guarantee of qualified jobs without paying upfront for unverified leads.',
    founderSkills: 'Full-stack TypeScript developer with past family construction business background.',
    availableResources: '20 hours/week, $2,000 self-funded validation budget.',
    budget: '$2,000',
    timeline: '6 weeks to validated prototype',
    existingAudience: 'Personal network of 12 local tradespeople.',
    startingPoint: 'problem_identified',
    currentPhaseIndex: 3, // Validating
    createdAt: now - 86400000 * 5,
    updatedAt: now,
  };

  const evidenceItems: EvidenceItem[] = [
    {
      id: 'ev-1',
      projectId: SAMPLE_PROJECT_ID,
      claim: 'Independent trade contractors hate pay-per-lead platforms because leads are shared and frequently cold.',
      type: 'customer',
      status: 'customer_confirmed',
      evidenceNotes: 'Confirmed in 4 in-person interviews with Austin plumbers and electricians. All 4 reported under 15% conversion on bought leads.',
      sourceTitle: 'Contractor Interview Logs (Batch 1)',
      confidence: 'high',
      nextTest: 'Test willingness to deposit $50 escrow for qualified inbound calls.',
      createdAt: now - 86400000 * 4,
      updatedAt: now - 86400000 * 3,
    },
    {
      id: 'ev-2',
      projectId: SAMPLE_PROJECT_ID,
      claim: 'Homeowners will pay a 5% platform escrow fee if licensed status and background checks are independently verified.',
      type: 'pricing',
      status: 'assumption',
      evidenceNotes: 'Untested hypothesis. Homeowners may expect the platform to be completely free on the consumer side.',
      confidence: 'medium',
      nextTest: 'Run smoke test on landing page with price variant A (0% homeowner fee) vs variant B (5% escrow guarantee fee).',
      createdAt: now - 86400000 * 3,
      updatedAt: now - 86400000 * 2,
    },
    {
      id: 'ev-3',
      projectId: SAMPLE_PROJECT_ID,
      claim: 'Solo contractors will reliably update an in-app availability calendar.',
      type: 'retention',
      status: 'unverified',
      evidenceNotes: 'Tradespeople primarily use paper pads or basic Google Calendar on mobile while driving between job sites.',
      confidence: 'low',
      nextTest: 'Test SMS-based two-way availability ping ("Are you free Thursday morning? Reply YES/NO").',
      createdAt: now - 86400000 * 2,
      updatedAt: now - 86400000 * 1,
    },
  ];

  const researchSources: ResearchSource[] = [
    {
      id: 'res-1',
      projectId: SAMPLE_PROJECT_ID,
      title: 'FTC Action & Consumer Feedback on Angi / HomeAdvisor Lead Allocation',
      url: 'https://www.ftc.gov/news-events/news/press-releases/2022/03/ftc-takes-action-against-homeadvisor',
      category: 'regulations',
      dateAccessed: '2026-09-01',
      summary: 'FTC challenged deceptive marketing practices regarding win rates and customer lead exclusivity.',
      keyFindings: [
        'Contractors were charged for leads that were invalid or disconnected.',
        'High dissatisfaction creates an opening for transparent pay-on-completion models.',
      ],
      relevance: 'high',
      confidence: 'high',
      notes: 'Key talking point during contractor acquisition.',
      createdAt: now - 86400000 * 4,
    },
    {
      id: 'res-2',
      projectId: SAMPLE_PROJECT_ID,
      title: 'US Census Bureau — Nonemployer Statistics for Specialty Trade Contractors',
      url: 'https://www.census.gov/programs-surveys/nonemployer-statistics.html',
      category: 'market',
      dateAccessed: '2026-09-02',
      summary: 'Over 2.8 million solo specialty trade contractors operate in the US, with average revenues of $68,000/yr.',
      keyFindings: [
        'Massive fragmented long tail of operators without marketing staff.',
        'Primary marketing remains fragmented referrals and local physical signage.',
      ],
      relevance: 'high',
      confidence: 'high',
      createdAt: now - 86400000 * 4,
    },
    {
      id: 'res-3',
      projectId: SAMPLE_PROJECT_ID,
      title: 'r/Contractor Discussion on Thumbtack Pricing Hikes',
      url: 'https://reddit.com/r/Contractor/comments/sample_discussion',
      category: 'customers',
      dateAccessed: '2026-09-03',
      summary: 'Dozens of contractors sharing frustration over automatic instant match charges for tire-kicker leads.',
      keyFindings: [
        'Average contractor spending $600-$1500/month with negative ROI perception.',
        'Desire for direct SMS dispatch rather than complex portals.',
      ],
      relevance: 'high',
      confidence: 'medium',
      notes: 'Customer language to reuse in messaging.',
      createdAt: now - 86400000 * 3,
    },
  ];

  const competitors: Competitor[] = [
    {
      id: 'comp-1',
      projectId: SAMPLE_PROJECT_ID,
      name: 'Angi (formerly HomeAdvisor / Angie\'s List)',
      url: 'https://www.angi.com',
      productDescription: 'Massive national directory charging contractors $20-$120 per lead, sold simultaneously to 3-5 competitors.',
      pricingModel: 'Pay-per-lead + annual membership fee ($300+)',
      targetAudience: 'Medium to large contracting firms with dedicated sales reps',
      positioning: 'Largest nationwide brand name',
      strengths: ['Massive SEO dominance', 'High brand awareness among homeowners'],
      weaknesses: ['High lead churn', 'Unfiltered inquiries', 'Aggressive multi-year sales contracts'],
      customerComplaints: ['Contractors pay for phantom leads', 'Homeowners spammed by 5 contractors within seconds'],
      keyDifferentiators: 'We charge zero upfront fees; only a transparent 8% platform fee on completed payment.',
      evidenceNotes: 'Public BBB rating of 1.4/5 and FTC settlements.',
      createdAt: now - 86400000 * 4,
      updatedAt: now - 86400000 * 2,
    },
    {
      id: 'comp-2',
      projectId: SAMPLE_PROJECT_ID,
      name: 'Thumbtack',
      url: 'https://www.thumbtack.com',
      productDescription: 'Local service marketplace using instant matching and direct booking credits.',
      pricingModel: 'Cost per direct lead inquiry ($15-$75)',
      targetAudience: 'Small independent service providers and freelancers',
      positioning: 'Instant booking for everyday home repairs',
      strengths: ['Modern mobile app UX', 'Instant match algorithm'],
      weaknesses: ['Autopay fees charged even when homeowner never replies'],
      customerComplaints: ['Sudden budget depletion from unvetted price-shoppers'],
      keyDifferentiators: 'Escrow-backed milestones with homeowner phone verification before connection.',
      evidenceNotes: 'Analyzed vendor terms of service updated 2024.',
      createdAt: now - 86400000 * 4,
      updatedAt: now - 86400000 * 2,
    },
  ];

  const experiments: Experiment[] = [
    {
      id: 'exp-1',
      projectId: SAMPLE_PROJECT_ID,
      hypothesis: 'If offered guaranteed exclusive local jobs with zero upfront lead cost, 5 of 10 contacted solo plumbers will agree to join an initial pilot cohort.',
      targetAudience: 'Solo residential plumbers in Austin area',
      method: 'customer_interview',
      requiredSampleSize: 10,
      currentSampleSize: 10,
      successCriteria: '5 or more contractors sign a written pilot letter of intent (LOI).',
      failureCriteria: 'Fewer than 3 sign, or main objection is platform brand skepticism.',
      timeframeWeeks: 2,
      status: 'completed',
      resultSummary: '7 of 10 plumbers signed the pilot LOI. The unanimous feedback was relief at avoiding pay-per-lead charges.',
      decisionTaken: 'Proceed with concierge MVP focusing purely on residential plumbing in 3 target zip codes.',
      createdAt: now - 86400000 * 3,
      updatedAt: now - 86400000 * 1,
    },
    {
      id: 'exp-2',
      projectId: SAMPLE_PROJECT_ID,
      hypothesis: 'A targeted local Facebook/Nextdoor landing page will convert Austin homeowners into verified job requests at under $25 CAC.',
      targetAudience: 'Austin homeowners needing water heater or pipe repair',
      method: 'smoke_landing_page',
      requiredSampleSize: 20,
      currentSampleSize: 8,
      successCriteria: '20 submitted repair requests with photos and phone numbers at <$25 per submission.',
      failureCriteria: 'CAC > $45 or high bounce rate (>80%).',
      timeframeWeeks: 2,
      status: 'running',
      resultSummary: 'Currently 8 submissions received at $19.40 cost per completed job inquiry.',
      createdAt: now - 86400000 * 2,
      updatedAt: now,
    },
  ];

  const features: FeatureItem[] = [
    {
      id: 'feat-1',
      projectId: SAMPLE_PROJECT_ID,
      title: 'Homeowner Job Request Form with Photo Upload',
      description: 'Simple 3-step mobile form allowing homeowners to describe the issue and upload 1-3 photos.',
      priority: 'must',
      solvesProblem: 'Contractors need visual context to estimate accurately without wasted truck rolls.',
      technicalComplexity: 'low',
      estimatedDays: 2,
      status: 'in_progress',
      createdAt: now - 86400000 * 2,
    },
    {
      id: 'feat-2',
      projectId: SAMPLE_PROJECT_ID,
      title: 'SMS Job Dispatch to Single Available Contractor',
      description: 'Sends incoming job details to verified contractor via SMS with 1-click Accept / Decline link.',
      priority: 'must',
      solvesProblem: 'Contractors will not check a dashboard while working with tools.',
      technicalComplexity: 'medium',
      estimatedDays: 3,
      status: 'planned',
      createdAt: now - 86400000 * 2,
    },
    {
      id: 'feat-3',
      projectId: SAMPLE_PROJECT_ID,
      title: 'Stripe Escrow Milestone Payment',
      description: 'Authorizes payment upon job booking and captures funds only upon customer sign-off.',
      priority: 'must',
      solvesProblem: 'Protects contractor from non-payment and homeowner from incomplete work.',
      technicalComplexity: 'medium',
      estimatedDays: 4,
      status: 'planned',
      createdAt: now - 86400000 * 2,
    },
    {
      id: 'feat-4',
      projectId: SAMPLE_PROJECT_ID,
      title: 'Automated Contractor License & Insurance Verification',
      description: 'OCR verification of Texas TDLR license numbers and general liability certificates.',
      priority: 'should',
      solvesProblem: 'Ensures quality and consumer trust at scale.',
      technicalComplexity: 'high',
      estimatedDays: 7,
      status: 'idea',
      createdAt: now - 86400000 * 2,
    },
    {
      id: 'feat-5',
      projectId: SAMPLE_PROJECT_ID,
      title: 'Contractor Route Optimization & Multi-Stop Dispatch',
      description: 'Algorithms clustering nearby service calls based on GPS coordinates.',
      priority: 'could',
      solvesProblem: 'Reduces transit time between plumbing calls.',
      technicalComplexity: 'high',
      estimatedDays: 14,
      status: 'idea',
      createdAt: now - 86400000 * 2,
    },
  ];

  const roadmap: RoadmapItem[] = [
    {
      id: 'rd-1',
      projectId: SAMPLE_PROJECT_ID,
      title: 'Contractor Pilot Cohort Onboarding (10 Plumbers)',
      objective: 'Secure 10 verified, licensed plumbers committed to accepting jobs via SMS dispatch.',
      status: 'completed',
      priority: 'urgent',
      owner: 'Founder',
      evidenceRequired: 'Signed pilot LOI and copies of state licenses.',
      estimatedEffort: '10 days',
      orderIndex: 0,
      createdAt: now - 86400000 * 4,
      updatedAt: now - 86400000 * 1,
    },
    {
      id: 'rd-2',
      projectId: SAMPLE_PROJECT_ID,
      title: 'Manual Concierge Dispatch in Austin 78704 & 78745',
      objective: 'Generate first 15 homeowner repair matches manually via phone/SMS before automating software.',
      status: 'in_progress',
      priority: 'high',
      owner: 'Founder',
      evidenceRequired: 'At least 10 completed jobs with >4.5 average customer rating.',
      estimatedEffort: '2 weeks',
      orderIndex: 1,
      createdAt: now - 86400000 * 2,
      updatedAt: now,
    },
    {
      id: 'rd-3',
      projectId: SAMPLE_PROJECT_ID,
      title: 'Release Self-Serve Booking Web Prototype',
      objective: 'Launch minimal web application replacing manual text message routing with automated dispatch.',
      status: 'not_started',
      priority: 'medium',
      owner: 'Founder',
      evidenceRequired: 'Zero drop-off on booking flow across 25 consecutive transactions.',
      estimatedEffort: '3 weeks',
      orderIndex: 2,
      createdAt: now - 86400000 * 1,
      updatedAt: now,
    },
  ];

  const canvasNodes: CanvasNode[] = [
    {
      id: 'cn-prob',
      projectId: SAMPLE_PROJECT_ID,
      type: 'problem',
      title: 'Predatory Pay-Per-Lead Models',
      description: 'Solo contractors waste $800+/mo buying stale, shared leads with <15% close rate.',
      x: 80,
      y: 120,
    },
    {
      id: 'cn-cust',
      projectId: SAMPLE_PROJECT_ID,
      type: 'customer',
      title: 'Solo Residential Plumbers',
      description: '1-2 person trade crews in Austin wanting steady work without marketing overhead.',
      x: 340,
      y: 120,
    },
    {
      id: 'cn-sol',
      projectId: SAMPLE_PROJECT_ID,
      type: 'solution',
      title: 'Pay-on-Completion Dispatch',
      description: 'Zero upfront lead fees. Exclusive jobs routed via SMS with 8% commission on finished work.',
      x: 600,
      y: 120,
    },
    {
      id: 'cn-exp',
      projectId: SAMPLE_PROJECT_ID,
      type: 'experiment',
      title: '10 Plumber Pilot LOIs',
      description: '7 of 10 plumbers signed exclusive job acceptance commitment.',
      x: 600,
      y: 320,
    },
    {
      id: 'cn-ev',
      projectId: SAMPLE_PROJECT_ID,
      type: 'evidence',
      title: 'Customer-Confirmed Pain',
      description: 'All 10 interviewed contractors confirmed frustration with Angi & Thumbtack charges.',
      x: 340,
      y: 320,
    },
  ];

  const canvasEdges: CanvasEdge[] = [
    { id: 'ce-1', projectId: SAMPLE_PROJECT_ID, fromNodeId: 'cn-prob', toNodeId: 'cn-cust', label: 'affects' },
    { id: 'ce-2', projectId: SAMPLE_PROJECT_ID, fromNodeId: 'cn-cust', toNodeId: 'cn-sol', label: 'adopts' },
    { id: 'ce-3', projectId: SAMPLE_PROJECT_ID, fromNodeId: 'cn-sol', toNodeId: 'cn-exp', label: 'tested by' },
    { id: 'ce-4', projectId: SAMPLE_PROJECT_ID, fromNodeId: 'cn-exp', toNodeId: 'cn-ev', label: 'proves' },
  ];

  const businessModel: BusinessModelData = {
    id: 'bm-1',
    projectId: SAMPLE_PROJECT_ID,
    customerSegments: '1. Primary: Solo licensed plumbers & HVAC technicians in high-density zip codes.\n2. Secondary: Suburban homeowners needing urgent or scheduled maintenance.',
    valueProposition: 'For contractors: Guaranteed exclusive jobs with zero upfront lead risk. Pay only when you get paid.\nFor homeowners: Vetted local tradespeople dispatched in 15 minutes without phone tag.',
    channels: 'Contractor side: Direct phone/in-person supply acquisition at local supply houses (Ferguson, Home Depot PRO desk).\nHomeowner side: Local Google LSA (Local Services Ads), Nextdoor recommendations, yard signs.',
    customerRelationships: 'High-touch SMS dispatch assistant, automated payout notifications, transparent dispute escrow.',
    revenueStreams: '8% platform fee deducted from total invoice upon customer completion confirmation.',
    keyResources: 'Direct contractor roster, dispatch matching logic, SMS gateway integration.',
    keyActivities: 'Vetting contractor licenses, matching homeowner requests, processing escrow payouts, customer service.',
    keyPartners: 'Texas Department of Licensing & Regulation (verification API), wholesale supply distributors.',
    costStructure: 'SMS/Twilio messaging, Stripe Connect transaction fees (2.9% + 30c), targeted local ads ($20/day).',
    pricingHypothesis: '8% take rate on an average $350 service ticket yields $28 net revenue per completed job.',
    estimatedCAC: '$40 per contractor, $18 per homeowner request',
    estimatedLTV: '$336/yr per active contractor (12 jobs/yr)',
    breakEvenMonthlyUsers: '60 completed jobs/month',
    updatedAt: now,
  };

  const gtmPlan: GTMPlan = {
    id: 'gtm-1',
    projectId: SAMPLE_PROJECT_ID,
    targetSegment: 'Homeowners in 78704 & 78745 zip codes with homes built between 1970-2005.',
    positioningStatement: 'For homeowners seeking honest repairs, Local Contractor Marketplace is the community service network that matches you with verified independent tradespeople with zero lead markups.',
    coreMessaging: 'Stop getting spammed by 5 contractors. Get one verified, licensed local pro who actually shows up.',
    assumedChannels: ['Organic Facebook neighborhood groups', 'Postcards in utility bills'],
    validatedChannels: ['Nextdoor local recommendations', 'Direct in-person visits to contractor supply houses'],
    launchStrategy: 'Concierge roll-out: hand-match the first 25 jobs personally to guarantee 100% 5-star service satisfaction.',
    contentPlan: 'Before/after plumbing repair transparency guides with real pricing breakdowns.',
    outreachStrategy: 'Visit plumbing supply counters at 6:30 AM with coffee and 1-page pilot agreements.',
    launchChecklist: [
      { task: 'Verify 10 active contractor phone numbers and licenses', done: true },
      { task: 'Test SMS dispatch link on iOS and Android', done: true },
      { task: 'Set up Stripe Connect test payouts', done: true },
      { task: 'Publish static landing page with Austin coverage zip codes', done: false },
      { task: 'Print 100 magnetic vehicle decals for pilot contractors', done: false },
    ],
    keySuccessMetrics: '15 completed matches within 30 days of launch; zero contractor churn.',
    updatedAt: now,
  };

  const landingPage: LandingPageSpec = {
    id: 'lp-1',
    projectId: SAMPLE_PROJECT_ID,
    headline: 'Real Local Contractors. No Lead-Gen Games.',
    subheadline: 'Book licensed Austin plumbers & electricians who show up on time. No upfront fees, no spam calls from 5 different companies.',
    problemStatement: 'Tired of filling out a form on Angi and getting 10 unsolicited calls in 3 minutes? Most platforms sell your contact information to the highest bidder.',
    solutionSummary: 'We match you with exactly ONE vetted local contractor whose schedule matches your needs, backed by platform payment protection.',
    keyBenefits: [
      { title: 'Verified Licenses & Insurance', desc: 'Every contractor is manually verified against state trade records.' },
      { title: 'Zero Spam Guarantee', desc: 'Your phone number is never sold or shared with competing firms.' },
      { title: 'Pay Only When Satisfied', desc: 'Funds are held in secure escrow until you sign off on the repair.' },
    ],
    socialProofOrSignals: 'Trusted by 14 Austin homeowners during our summer pilot program with a 4.9-star average review.',
    features: [
      { title: 'Instant Photo Estimating', desc: 'Upload a quick photo of your water heater or leak for rapid quote ranges.' },
      { title: 'SMS Direct Communication', desc: 'Chat directly with your assigned pro without downloading another heavy app.' },
      { title: 'Transparent Flat Pricing', desc: 'See typical hourly rates and parts markups before agreeing to work.' },
    ],
    faqs: [
      { question: 'Is it free for homeowners?', answer: 'Yes! Homeowners pay only for the contractor’s agreed invoice amount. There are no search or match fees.' },
      { question: 'How quickly does a contractor respond?', answer: 'Most requests in our Austin coverage area receive an SMS confirmation within 20 minutes.' },
      { question: 'What trades do you support?', answer: 'Currently residential plumbing, drain cleaning, water heaters, and licensed electrical repairs.' },
    ],
    callToAction: 'Find an Available Contractor',
    secondaryCTA: 'Are you a licensed contractor? Apply for our pilot cohort',
    updatedAt: now,
  };

  await db.transaction('rw', [
    db.projects,
    db.evidence,
    db.research,
    db.competitors,
    db.experiments,
    db.features,
    db.roadmap,
    db.canvasNodes,
    db.canvasEdges,
    db.businessModel,
    db.gtmPlan,
    db.landingPage,
  ], async () => {
    await db.projects.put(project);
    await db.evidence.bulkPut(evidenceItems);
    await db.research.bulkPut(researchSources);
    await db.competitors.bulkPut(competitors);
    await db.experiments.bulkPut(experiments);
    await db.features.bulkPut(features);
    await db.roadmap.bulkPut(roadmap);
    await db.canvasNodes.bulkPut(canvasNodes);
    await db.canvasEdges.bulkPut(canvasEdges);
    await db.businessModel.put(businessModel);
    await db.gtmPlan.put(gtmPlan);
    await db.landingPage.put(landingPage);
  });

  setActiveProjectId(SAMPLE_PROJECT_ID);
}
