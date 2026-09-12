import { db, setActiveProjectId, getActiveProjectId } from '../db';
import type {
  Project,
  EvidenceItem,
  Competitor,
  Experiment,
  CustomerInterview,
  FeatureItem,
  RoadmapItem,
  CanvasNode,
  CanvasEdge,
  ResearchSource,
  ProjectDecision,
  RiskItem,
  BusinessModelData,
  GTMPlan,
  LandingPageSpec,
} from '../types';

export async function seedDemoProjectIfNeeded(): Promise<string | null> {
  const existingProjects = await db.projects.toArray();
  if (existingProjects.length > 0) {
    const active = getActiveProjectId();
    if (active && existingProjects.some((p) => p.id === active)) {
      return active;
    }
    return existingProjects[0].id;
  }
  // Zero projects exist: do NOT automatically seed synthetic data without user consent.
  return null;
}

export async function createSyntheticDemoProject(): Promise<string> {
  const projectId = 'proj-tradepulse-demo';
  const now = Date.now();

  const demoProject: Project = {
    id: projectId,
    name: 'TradePulse (Synthetic Demo)',
    oneSentenceIdea:
      '[SYNTHETIC EXAMPLE] Exclusive SMS job dispatch alerts with 1-click booking for solo plumbing and HVAC contractors.',
    category: 'B2B Workflow / Marketplace',
    stage: 'validating',
    targetMarket: 'Solo trade contractors (1-3 crew) in Austin & Dallas TX (Synthetic Cohort)',
    location: 'Austin, TX',
    website: 'https://tradepulse.example.com',
    problemStatement:
      '[SYNTHETIC EXAMPLE] Solo contractors waste $600-$1,200/mo on shared lead brokers like Angi and Thumbtack that sell the same unvetted lead to 5 contractors simultaneously, resulting in a <15% win rate and hours wasted on phone tag.',
    targetUserGroup: 'Licensed residential plumbers & HVAC technicians with 1-3 vans',
    problemFrequency: 'daily',
    problemSeverity: 'critical',
    currentAlternatives:
      'Angi leads ($80/lead, non-exclusive), Google Local Service Ads, manual word-of-mouth texts, Craigslist postings.',
    successDefinition:
      'Contractors receive guaranteed pre-booked appointments directly to their calendar with customer payment method pre-authorized on file.',
    behavioralChange:
      'Contractors stop manually cold-calling leads between jobs and instead accept dispatches with a single SMS reply "1".',
    willingnessToPayTrigger:
      'Contractors will pay $25 per booked dispatch, or 8% of completed invoice, because it guarantees zero bidding time.',
    founderSkills:
      'Ex-field service dispatcher (5 yrs) + full-stack web developer. Direct access to 25 local contractor contacts.',
    availableResources: '15 hours/week nights & weekends; $2,500 validation budget',
    budget: '$2,500',
    timeline: '6 weeks to 5 paying beta contractors',
    startingPoint: 'problem_identified',
    currentPhaseIndex: 3, // Validating phase
    completedTaskIds: ['def-1', 'def-2', 'def-4', 'prob-1', 'prob-2', 'res-1', 'res-2'],
    isSynthetic: true,
    createdAt: now - 86400000 * 7,
    updatedAt: now,
  };

  const demoEvidence: EvidenceItem[] = [
    {
      id: 'ev-1',
      projectId,
      claim: '[SYNTHETIC DEMO CLAIM] Solo trade contractors lose over 6 hours every week calling shared leads that never pick up.',
      type: 'problem',
      status: 'customer_confirmed',
      evidenceNotes:
        '[SYNTHETIC DEMO NOTES] Simulated discovery data: 6 synthetic discovery calls with plumbers reporting 14% callback rates.',
      confidence: 'high',
      nextTest: 'Collect call logs from 3 pilot contractors over 1 week.',
      isSynthetic: true,
      createdAt: now - 86400000 * 5,
      updatedAt: now - 86400000 * 2,
    },
    {
      id: 'ev-2',
      projectId,
      claim: '[SYNTHETIC DEMO CLAIM] Contractors are willing to pay a flat fee per completed booking rather than upfront lead bidding.',
      type: 'pricing',
      status: 'customer_confirmed',
      evidenceNotes:
        '[SYNTHETIC DEMO NOTES] 4 out of 5 synthetic contractor profiles agreed they would pay $25-$40 per pre-scheduled job.',
      confidence: 'high',
      nextTest: 'Pre-sell 5 paid test bookings via concierge manual dispatch.',
      isSynthetic: true,
      createdAt: now - 86400000 * 4,
      updatedAt: now - 86400000 * 2,
    },
    {
      id: 'ev-3',
      projectId,
      claim: '[SYNTHETIC DEMO CLAIM] Homeowners will input credit cards to book emergency plumbing visits online.',
      type: 'customer',
      status: 'assumption',
      evidenceNotes:
        '[SYNTHETIC DEMO NOTES] Untested hypothesis. Homeowners may hesitate to pre-authorize payment before speaking to a technician.',
      confidence: 'low',
      nextTest: 'Run a simple smoke test page offering $50 diagnostic deposit.',
      isSynthetic: true,
      createdAt: now - 86400000 * 3,
      updatedAt: now - 86400000 * 3,
    },
    {
      id: 'ev-4',
      projectId,
      claim: '[SYNTHETIC DEMO CLAIM] Contractors can respond to incoming SMS alerts in under 90 seconds while on job sites.',
      type: 'feasibility',
      status: 'unverified',
      evidenceNotes:
        '[SYNTHETIC DEMO NOTES] Critical assumption: If response time is >10 mins, homeowners will cancel or call a competitor.',
      confidence: 'medium',
      nextTest: 'Simulate 10 mock SMS alerts during work hours and measure response latency.',
      isSynthetic: true,
      createdAt: now - 86400000 * 2,
      updatedAt: now - 86400000 * 2,
    },
  ];

  const demoCompetitors: Competitor[] = [
    {
      id: 'comp-1',
      projectId,
      name: 'Angi (formerly Angie\'s List)',
      url: 'https://angi.com',
      productDescription: 'Massive home service directory selling leads to multiple contractors.',
      pricingModel: 'Pay-per-lead ($50-$150/lead) + annual membership fee',
      targetAudience: 'Medium to large contracting firms with dedicated sales reps',
      positioning: 'Largest brand name in homeowner service discovery',
      strengths: ['Huge consumer search volume', 'Massive brand recognition', 'SEO dominance'],
      weaknesses: [
        'Non-exclusive leads sold to 5 competitors',
        'Aggressive annual lock-in contracts',
        'Tons of tire-kicker leads that never answer',
      ],
      customerComplaints: [
        '"[DEMO QUOTE — SYNTHETIC] Paid $1,200 this month and got 1 real job"',
        '"[DEMO QUOTE — SYNTHETIC] Leads are cold or already hired someone else 3 days ago"',
      ],
      keyDifferentiators:
        '100% exclusive dispatches, zero monthly subscription, pay only on confirmed bookings.',
      evidenceNotes: '[SYNTHETIC DEMO NOTES] Examined 45 1-star Trustpilot reviews from contractors in Q3 2025.',
      isSynthetic: true,
      createdAt: now - 86400000 * 6,
      updatedAt: now - 86400000 * 6,
    },
    {
      id: 'comp-2',
      projectId,
      name: 'Thumbtack',
      url: 'https://thumbtack.com',
      productDescription: 'Bidding marketplace where contractors pay when customers reach out.',
      pricingModel: 'Pay-per-contact ($20-$60/inquiry)',
      targetAudience: 'Solo freelancers and local trade businesses',
      positioning: 'Flexible quote marketplace with instant matching',
      strengths: ['Modern mobile app', 'Instant match feature', 'Broad category coverage'],
      weaknesses: [
        'Contractors pay even if customer ghosted after first text',
        'Customer price shopping drives margins down',
      ],
      customerComplaints: [
        '"[DEMO QUOTE — SYNTHETIC] Charged $35 for an inquiry that never replied to my quote"',
        '"[DEMO QUOTE — SYNTHETIC] Race to the bottom on pricing"',
      ],
      keyDifferentiators:
        'Pre-vetted jobs with price minimums; no charges for unconfirmed inquiries.',
      evidenceNotes: '[SYNTHETIC DEMO NOTES] Feedback aggregated from synthetic contractor interview scripts.',
      isSynthetic: true,
      createdAt: now - 86400000 * 5,
      updatedAt: now - 86400000 * 5,
    },
  ];

  const demoExperiments: Experiment[] = [
    {
      id: 'exp-1',
      projectId,
      dimension: 'customer',
      hypothesis:
        '[SYNTHETIC DEMO] If we text 20 local plumbers offering 2 free exclusive pre-booked jobs with no upfront fee, at least 6 (30%) will agree to test our dispatch link.',
      targetAudience: 'Austin solo licensed plumbers on Texas RRC registry (Synthetic Cohort)',
      method: 'cold_outreach',
      targetSampleSize: 20,
      currentSampleSize: 20,
      successCriteria: '>= 6 positive contractor replies (30%)',
      failureCriteria: '< 3 positive replies (15%)',
      timeframeWeeks: 1,
      status: 'passed',
      resultSummary:
        '[SYNTHETIC OUTCOME] 9 contractors replied with interest; 7 signed up for the pilot SMS phone tree. Hypothesis validated!',
      decisionTaken: 'Proceed to concierge dispatch test with first 5 contractors.',
      startDate: new Date(now - 86400000 * 7).toISOString().split('T')[0],
      endDate: new Date(now - 86400000 * 2).toISOString().split('T')[0],
      isSynthetic: true,
      createdAt: now - 86400000 * 7,
      updatedAt: now - 86400000 * 2,
    },
    {
      id: 'exp-2',
      projectId,
      dimension: 'solution',
      hypothesis:
        '[SYNTHETIC DEMO] Local homeowners needing emergency drain clearing will complete a 2-minute booking form with address and credit card pre-authorization.',
      targetAudience: 'Homeowners in North Austin zip codes (78757, 78758)',
      method: 'smoke_landing_page',
      targetSampleSize: 15,
      currentSampleSize: 6,
      successCriteria: 'At least 3 completed bookings out of 15 form starts (20%)',
      failureCriteria: '0 completed bookings from 15 starts',
      timeframeWeeks: 2,
      status: 'running',
      resultSummary: '[SYNTHETIC OUTCOME] Currently running local neighborhood flyer & Nextdoor test. 6 starts, 2 booked.',
      startDate: new Date(now - 86400000 * 3).toISOString().split('T')[0],
      isSynthetic: true,
      createdAt: now - 86400000 * 3,
      updatedAt: now,
    },
  ];

  const demoInterviews: CustomerInterview[] = [
    {
      id: 'int-1',
      projectId,
      intervieweeIdentifier: 'Marcus D. (Texas Master Plumber #48102) [SYNTHETIC PROFILE]',
      participantRole: 'Solo owner-operator (1 helper, 2 vans), 11 years in business',
      date: new Date(now - 86400000 * 4).toISOString().split('T')[0],
      objectives: 'Understand lead acquisition pain and current spend on Angi / Google LSA.',
      notesOrTranscript:
        '[SYNTHETIC TRANSCRIPT] Marcus spends $950/month on Angi. Says he wins maybe 2 jobs a month from it because 4 other guys get the same lead. He is on a job site with his head under a sink and can\'t stop to text people within 30 seconds.',
      recurringPainPoints: ['Phone tag while physically doing labor', 'Paying for dead leads', 'Customer ghosting'],
      severityRating: 'dealbreaker',
      existingWorkarounds: 'Hired part-time virtual assistant to reply to Angi texts ($400/mo), but still loses jobs.',
      willingnessToPayNotes:
        'Stated directly: "If you give me a job that\'s already scheduled for tomorrow at 10am with a card on file, take $40 right out of the top, I don\'t care."',
      verbatimQuotes: [
        '[DEMO QUOTE — SYNTHETIC] "I am paying Angi $950 a month just to get ghosted by people looking for a $20 handyman."',
        '[DEMO QUOTE — SYNTHETIC] "If the job is locked in and exclusive, take your cut. Just don\'t sell it to Dave down the street too."',
      ],
      surprisesOrObjections: 'Contractor prefers SMS only; will not download another heavy app on his phone.',
      isSynthetic: true,
      createdAt: now - 86400000 * 4,
    },
  ];

  const demoRisks: RiskItem[] = [
    {
      id: 'risk-1',
      projectId,
      title: '[SYNTHETIC RISK] Homeowner cancellation if dispatch takes >15 minutes',
      category: 'operational',
      probability: 'high',
      impact: 'high',
      evidenceNotes: 'Emergency plumbing buyers call the next plumber if no confirmation is received quickly.',
      mitigation: 'Implement tiered SMS broadcast: alert 3 contractors simultaneously in a 5-mile radius, first to reply gets it.',
      status: 'testing',
      nextTest: 'Simulate contractor SMS reply speeds during working hours.',
      isSynthetic: true,
      createdAt: now - 86400000 * 4,
      updatedAt: now,
    },
    {
      id: 'risk-2',
      projectId,
      title: '[SYNTHETIC RISK] Disintermediation (contractor and homeowner deal off-platform)',
      category: 'financial',
      probability: 'medium',
      impact: 'high',
      evidenceNotes: 'Once contractor has homeowner contact, future repeat work bypasses TradePulse.',
      mitigation: 'Charge flat fee on initial dispatch rather than ongoing maintenance commissions.',
      status: 'open',
      nextTest: 'Survey pilot contractors on preferred billing model.',
      isSynthetic: true,
      createdAt: now - 86400000 * 3,
      updatedAt: now,
    },
  ];

  const demoDecisions: ProjectDecision[] = [
    {
      id: 'dec-1',
      projectId,
      title: '[SYNTHETIC DECISION] Reject native mobile app in favor of Twilio SMS',
      rationale:
        'Contractor interviews demonstrated refusal to download and login to mobile apps while wearing work gloves. SMS has 98% open rate in <3 minutes.',
      rejectedAlternatives: 'React Native mobile app with push notifications; web portal.',
      date: new Date(now - 86400000 * 3).toISOString().split('T')[0],
      phaseKey: 'solution',
      confidence: 'high',
      status: 'active',
      isSynthetic: true,
      createdAt: now - 86400000 * 3,
    },
  ];

  const demoFeatures: FeatureItem[] = [
    {
      id: 'feat-1',
      projectId,
      title: '1-Click SMS Dispatch & Accept Link',
      description: 'Incoming job alert via SMS; reply "1" to lock reservation instantly.',
      priority: 'must',
      solvesProblem: 'Contractors cannot fiddle with complex login screens while on ladders or plumbing jobs.',
      technicalComplexity: 'low',
      status: 'planned',
      isSynthetic: true,
      createdAt: now - 86400000 * 3,
    },
    {
      id: 'feat-2',
      projectId,
      title: 'Homeowner Address & Emergency Job Request Form',
      description: 'Clean mobile form with photo upload and credit card pre-authorization.',
      priority: 'must',
      solvesProblem: 'Eliminates tire-kickers and verifies genuine intent to pay standard diagnostic fee.',
      technicalComplexity: 'medium',
      status: 'planned',
      isSynthetic: true,
      createdAt: now - 86400000 * 3,
    },
  ];

  const demoRoadmap: RoadmapItem[] = [
    {
      id: 'road-1',
      projectId,
      title: 'Concierge Dispatch Test (5 Plumbers)',
      objective: 'Manually broker 10 emergency jobs via direct phone and SMS to verify speed & payment.',
      status: 'in_progress',
      priority: 'urgent',
      owner: 'Founder',
      evidenceRequired: '10 completed dispatches with $0 cancellation rate.',
      estimatedEffort: '2 weeks',
      orderIndex: 0,
      isSynthetic: true,
      createdAt: now - 86400000 * 3,
      updatedAt: now,
    },
  ];

  const demoResearch: ResearchSource[] = [
    {
      id: 'res-1',
      projectId,
      title: '[SYNTHETIC DEMO SOURCE] IBISWorld US Plumbers Industry Report 2025',
      url: 'https://ibisworld.com',
      publisherOrDomain: 'ibisworld.com',
      sourceType: 'industry_report',
      category: 'market',
      dateAccessed: new Date(now - 86400000 * 6).toISOString().split('T')[0],
      summary: '[SYNTHETIC SUMMARY] US plumbing industry is $134B, with 68% of firms having fewer than 4 employees.',
      keyFindings: [
        'Average job ticket for residential emergency is $340-$550.',
        'High fragmentation: solo operators rely primarily on referral and local lead brokers.',
      ],
      relevance: 'high',
      confidence: 'high',
      isSynthetic: true,
      createdAt: now - 86400000 * 6,
    },
  ];

  const demoCanvasNodes: CanvasNode[] = [
    {
      id: 'cnode-1',
      projectId,
      type: 'problem',
      title: '6 hrs/week on Dead Leads',
      description: 'Solo plumbers lose hours calling shared leads that never pick up.',
      x: 100,
      y: 120,
    },
    {
      id: 'cnode-2',
      projectId,
      type: 'customer',
      title: 'Solo Plumbers & HVAC',
      description: '1-3 van owner-operators in Austin TX.',
      x: 380,
      y: 120,
    },
    {
      id: 'cnode-3',
      projectId,
      type: 'solution',
      title: 'Exclusive SMS Dispatch',
      description: 'Pre-booked appointments confirmed via single SMS reply.',
      x: 660,
      y: 120,
    },
  ];

  const demoCanvasEdges: CanvasEdge[] = [
    {
      id: 'cedge-1',
      projectId,
      fromNodeId: 'cnode-1',
      toNodeId: 'cnode-2',
      label: 'afflicts',
    },
    {
      id: 'cedge-2',
      projectId,
      fromNodeId: 'cnode-2',
      toNodeId: 'cnode-3',
      label: 'relieved by',
    },
  ];

  const demoBusinessModel: BusinessModelData = {
    id: `bm_${projectId}`,
    projectId,
    monthlyPrice: 25,
    grossMarginPct: 85,
    monthlyChurnPct: 4,
    cac: 60,
    fixedMonthlyCost: 150,
    problem: 'Shared lead bidding waste and tire-kickers.',
    customerSegments: 'Licensed residential plumbers with 1-3 vans.',
    uniqueValue: 'Guaranteed exclusive dispatches directly to SMS without bidding.',
    solution: '1-click SMS dispatch system with card on file.',
    channels: 'Direct SMS outreach from Texas licensing directory; supply-side wholesale partnership.',
    revenueStreams: '$25-$40 flat fee per completed dispatch.',
    costStructure: 'Twilio SMS ($0.0079/msg), Stripe fees (2.9% + 30c), customer acquisition ($60/contractor).',
    keyMetrics: 'Contractor reply latency (<90s), completion rate (>85%).',
    unfairAdvantage: 'Ex-dispatcher domain network of 25 local contractors.',
    updatedAt: now,
  };

  const demoGTM: GTMPlan = {
    id: `gtm_${projectId}`,
    projectId,
    targetUser: 'Solo licensed residential plumbers in Austin TX',
    need: 'Stop wasting money and hours bidding on non-exclusive Angi leads',
    productName: 'TradePulse',
    category: 'SMS Dispatch Automation',
    benefit: 'get pre-booked exclusive appointments on your calendar without phone tag',
    competitor: 'Angi and Thumbtack',
    differentiator: 'dispatches are 100% exclusive and you pay only after the job is locked in',
    channels: [
      {
        name: 'Direct SMS to Texas Licensing Registry',
        type: 'Outbound',
        status: 'validated',
        notes: 'Passed initial outreach test with 35% response rate.',
      },
      {
        name: 'Plumbing Supply Counter Flyer (Reece & Ferguson)',
        type: 'Physical Partnership',
        status: 'assumed',
        notes: 'Targeting 3 local wholesale supply houses where contractors buy parts daily.',
      },
    ],
    updatedAt: now,
  };

  const demoLandingPage: LandingPageSpec = {
    id: `lp_${projectId}`,
    projectId,
    headline: 'Stop Chasing Dead Leads. Get Booked Jobs Sent to Your Phone via SMS.',
    subheadline:
      'Exclusive emergency plumbing jobs dispatched directly to your SMS. No bidding against 5 other plumbers. No monthly fees. Reply "1" to claim.',
    ctaText: 'Join the Austin Beta Cohort',
    problemHeadline: 'Angi Charges You $80 Just to Play Phone Tag With Ghost Leads',
    problemBody:
      'You are with your head under a sink doing actual labor. By the time you wipe your hands to text an Angi lead, four other guys already called them, or they were just looking for a $20 handyman. TradePulse only alerts you when a customer has a credit card authorized and a confirmed address.',
    step1: 'Homeowner requests emergency help with card on file.',
    step2: 'We text the job details to your phone. Reply "1" to accept.',
    step3: 'Job is booked exclusively to your calendar. You keep 100% of your labor fee.',
    faq1Q: 'How is this different from Angi or Thumbtack?',
    faq1A:
      'We never sell the same lead to multiple contractors. When you get an alert, you are the only technician with the reservation window.',
    faq2Q: 'What does it cost?',
    faq2A:
      'Zero monthly subscription. You only pay a flat $25 dispatch fee when you successfully confirm a scheduled job.',
    updatedAt: now,
  };

  // Atomic database save
  await db.transaction(
    'rw',
    [
      db.projects,
      db.evidence,
      db.competitors,
      db.experiments,
      db.interviews,
      db.risks,
      db.decisions,
      db.features,
      db.roadmap,
      db.research,
      db.canvasNodes,
      db.canvasEdges,
      db.businessModel,
      db.gtmPlan,
      db.landingPage,
    ],
    async () => {
      await db.projects.put(demoProject);
      await db.evidence.bulkPut(demoEvidence);
      await db.competitors.bulkPut(demoCompetitors);
      await db.experiments.bulkPut(demoExperiments);
      await db.interviews.bulkPut(demoInterviews);
      await db.risks.bulkPut(demoRisks);
      await db.decisions.bulkPut(demoDecisions);
      await db.features.bulkPut(demoFeatures);
      await db.roadmap.bulkPut(demoRoadmap);
      await db.research.bulkPut(demoResearch);
      await db.canvasNodes.bulkPut(demoCanvasNodes);
      await db.canvasEdges.bulkPut(demoCanvasEdges);
      await db.businessModel.put(demoBusinessModel);
      await db.gtmPlan.put(demoGTM);
      await db.landingPage.put(demoLandingPage);
    }
  );

  setActiveProjectId(projectId);
  return projectId;
}
