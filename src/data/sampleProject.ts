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
} from '../types';

export async function seedDemoProjectIfNeeded(): Promise<string> {
  const existingProjects = await db.projects.toArray();
  if (existingProjects.length > 0) {
    const active = getActiveProjectId();
    if (active && existingProjects.some((p) => p.id === active)) {
      return active;
    }
    return existingProjects[0].id;
  }

  const projectId = 'proj-tradealert-demo';
  const now = Date.now();

  const demoProject: Project = {
    id: projectId,
    name: 'TradePulse',
    oneSentenceIdea:
      'Exclusive SMS job dispatch alerts with 1-click booking for solo plumbing and HVAC contractors.',
    category: 'B2B Workflow / Marketplace',
    stage: 'validating',
    targetMarket: 'Solo trade contractors (1-3 crew) in Austin & Dallas TX',
    location: 'Austin, TX',
    website: 'https://tradepulse.example.com',
    problemStatement:
      'Solo contractors waste $600-$1,200/mo on shared lead brokers like Angi and Thumbtack that sell the same unvetted lead to 5 contractors simultaneously, resulting in a <15% win rate and hours wasted on phone tag.',
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
    createdAt: now - 86400000 * 7,
    updatedAt: now,
  };

  const demoEvidence: EvidenceItem[] = [
    {
      id: 'ev-1',
      projectId,
      claim: 'Solo trade contractors lose over 6 hours every week calling shared leads that never pick up.',
      type: 'problem',
      status: 'customer_confirmed',
      evidenceNotes:
        'Confirmed across 6 separate discovery calls with local plumbers. Average reported callback rate on Angi is 14%.',
      confidence: 'high',
      nextTest: 'Collect call logs from 3 pilot contractors over 1 week.',
      createdAt: now - 86400000 * 5,
      updatedAt: now - 86400000 * 2,
    },
    {
      id: 'ev-2',
      projectId,
      claim: 'Contractors are willing to pay a flat fee per completed booking rather than upfront lead bidding.',
      type: 'pricing',
      status: 'customer_confirmed',
      evidenceNotes:
        '4 out of 5 contractors interviewed agreed they would gladly pay $25-$40 per pre-scheduled job.',
      confidence: 'high',
      nextTest: 'Pre-sell 5 paid test bookings via concierge manual dispatch.',
      createdAt: now - 86400000 * 4,
      updatedAt: now - 86400000 * 2,
    },
    {
      id: 'ev-3',
      projectId,
      claim: 'Homeowners will input credit cards to book emergency plumbing visits online.',
      type: 'customer',
      status: 'assumption',
      evidenceNotes:
        'Untested hypothesis. Homeowners may hesitate to pre-authorize payment before speaking to a technician.',
      confidence: 'low',
      nextTest: 'Run a simple smoke test page offering $50 diagnostic deposit.',
      createdAt: now - 86400000 * 3,
      updatedAt: now - 86400000 * 3,
    },
    {
      id: 'ev-4',
      projectId,
      claim: 'Contractors can respond to incoming SMS alerts in under 90 seconds while on job sites.',
      type: 'feasibility',
      status: 'unverified',
      evidenceNotes:
        'Critical assumption: If response time is >10 mins, homeowners will cancel or call a competitor.',
      confidence: 'medium',
      nextTest: 'Simulate 10 mock SMS alerts during work hours and measure response latency.',
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
        '"Paid $1,200 this month and got 1 real job"',
        '"Leads are cold or already hired someone else 3 days ago"',
      ],
      keyDifferentiators:
        '100% exclusive dispatches, zero monthly subscription, pay only on confirmed bookings.',
      evidenceNotes: 'Examined 45 1-star Trustpilot reviews from contractors in Q3 2025.',
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
        '"Charged $35 for an inquiry that never replied to my quote"',
        '"Race to the bottom on pricing"',
      ],
      keyDifferentiators:
        'Pre-vetted jobs with price minimums; no charges for unconfirmed inquiries.',
      evidenceNotes: 'Direct feedback from 3 interviewed local HVAC pros.',
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
        'If we text 20 local plumbers offering 2 free exclusive pre-booked jobs with no upfront fee, at least 6 (30%) will agree to test our dispatch link.',
      targetAudience: 'Austin solo licensed plumbers on Texas RRC registry',
      method: 'cold_outreach',
      targetSampleSize: 20,
      currentSampleSize: 20,
      successCriteria: '>= 6 positive contractor replies (30%)',
      failureCriteria: '< 3 positive replies (15%)',
      timeframeWeeks: 1,
      status: 'passed',
      resultSummary:
        '9 contractors replied with interest; 7 signed up for the pilot SMS phone tree. Hypothesis validated!',
      decisionTaken: 'Proceed to concierge dispatch test with first 5 contractors.',
      startDate: new Date(now - 86400000 * 7).toISOString().split('T')[0],
      endDate: new Date(now - 86400000 * 2).toISOString().split('T')[0],
      createdAt: now - 86400000 * 7,
      updatedAt: now - 86400000 * 2,
    },
    {
      id: 'exp-2',
      projectId,
      dimension: 'solution',
      hypothesis:
        'Local homeowners needing emergency drain clearing will complete a 2-minute booking form with address and credit card pre-authorization.',
      targetAudience: 'Homeowners in North Austin zip codes (78757, 78758)',
      method: 'smoke_landing_page',
      targetSampleSize: 15,
      currentSampleSize: 6,
      successCriteria: 'At least 3 completed bookings out of 15 form starts (20%)',
      failureCriteria: '0 completed bookings from 15 starts',
      timeframeWeeks: 2,
      status: 'running',
      resultSummary: 'Currently running local neighborhood flyer & Nextdoor test. 6 starts, 2 booked.',
      startDate: new Date(now - 86400000 * 3).toISOString().split('T')[0],
      createdAt: now - 86400000 * 3,
      updatedAt: now,
    },
  ];

  const demoInterviews: CustomerInterview[] = [
    {
      id: 'int-1',
      projectId,
      intervieweeIdentifier: 'Marcus D. (Texas Master Plumber #48102)',
      participantRole: 'Solo owner-operator (1 helper, 2 vans), 11 years in business',
      date: new Date(now - 86400000 * 4).toISOString().split('T')[0],
      objectives: 'Understand lead acquisition pain and current spend on Angi / Google LSA.',
      notesOrTranscript:
        'Marcus spends $950/month on Angi. Says he wins maybe 2 jobs a month from it because 4 other guys get the same lead. He is on a job site with his head under a sink and can\'t stop to text people within 30 seconds.',
      recurringPainPoints: ['Phone tag while physically doing labor', 'Paying for dead leads', 'Customer ghosting'],
      severityRating: 'dealbreaker',
      existingWorkarounds: 'Hired part-time virtual assistant to reply to Angi texts ($400/mo), but still loses jobs.',
      willingnessToPayNotes:
        'Stated directly: "If you give me a job that\'s already scheduled for tomorrow at 10am with a card on file, take $40 right out of the top, I don\'t care."',
      verbatimQuotes: [
        'I am paying Angi $950 a month just to get ghosted by people looking for a $20 handyman.',
        'If the job is locked in and exclusive, take your cut. Just don\'t sell it to Dave down the street too.',
      ],
      surprisesOrObjections: 'Contractor prefers SMS only; will not download another heavy app on his phone.',
      createdAt: now - 86400000 * 4,
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
      createdAt: now - 86400000 * 3,
    },
    {
      id: 'feat-3',
      projectId,
      title: 'Automated Calendar Sync (Google / Apple)',
      description: 'Pushes booked appointment directly into contractor\'s existing Google Calendar.',
      priority: 'should',
      solvesProblem: 'Prevents double-booking without requiring new CRM software.',
      technicalComplexity: 'medium',
      status: 'idea',
      createdAt: now - 86400000 * 2,
    },
    {
      id: 'feat-4',
      projectId,
      title: 'Native iOS/Android App with Push Notifications',
      description: 'Full custom mobile application for technicians.',
      priority: 'wont',
      solvesProblem: 'Deferred. Contractors explicitly requested SMS to avoid downloading new apps.',
      technicalComplexity: 'high',
      status: 'idea',
      createdAt: now - 86400000 * 2,
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
      createdAt: now - 86400000 * 3,
      updatedAt: now,
    },
    {
      id: 'road-2',
      projectId,
      title: 'Automated Twilio SMS Engine',
      objective: 'Replace manual texts with webhook-triggered SMS dispatch upon homeowner form submit.',
      status: 'not_started',
      priority: 'high',
      owner: 'Founder',
      evidenceRequired: 'Average contractor accept latency under 120 seconds.',
      estimatedEffort: '1 week',
      orderIndex: 1,
      createdAt: now - 86400000 * 3,
      updatedAt: now,
    },
  ];

  const demoResearch: ResearchSource[] = [
    {
      id: 'res-1',
      projectId,
      title: 'IBISWorld US Plumbers Industry Report 2025',
      url: 'https://ibisworld.com',
      category: 'market',
      dateAccessed: new Date(now - 86400000 * 6).toISOString().split('T')[0],
      summary: 'US plumbing industry is $134B, with 68% of firms having fewer than 4 employees.',
      keyFindings: [
        'Average job ticket for residential emergency is $340-$550.',
        'High fragmentation: solo operators rely primarily on referral and local lead brokers.',
      ],
      relevance: 'high',
      confidence: 'high',
      createdAt: now - 86400000 * 6,
    },
  ];

  // Save all to database
  await db.projects.put(demoProject);
  await db.evidence.bulkPut(demoEvidence);
  await db.competitors.bulkPut(demoCompetitors);
  await db.experiments.bulkPut(demoExperiments);
  await db.interviews.bulkPut(demoInterviews);
  await db.features.bulkPut(demoFeatures);
  await db.roadmap.bulkPut(demoRoadmap);
  await db.research.bulkPut(demoResearch);

  setActiveProjectId(projectId);
  return projectId;
}
