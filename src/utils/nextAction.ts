import type { Competitor, EvidenceItem, Experiment, FeatureItem, RiskItem } from '../types';
import type { WorkspaceTab } from '../components/layout/Sidebar';
import { isHotRisk, isOpenRisk, riskScore, sortRisksByScore } from './riskScoring';

export interface NextAction {
  title: string;
  description: string;
  tab: WorkspaceTab;
  btnLabel: string;
}

export interface NextActionInput {
  evidence?: EvidenceItem[];
  experiments?: Experiment[];
  competitors?: Competitor[];
  features?: FeatureItem[];
  risks?: RiskItem[];
}

/**
 * Single highest-value next action for the dashboard.
 *
 * Precedence is deliberate: an unmitigated hot risk outranks an untested
 * assumption, a running experiment outranks new scoping work, and MVP scoping
 * only appears once the customer-facing gaps are covered.
 */
export function deriveNextAction({
  evidence = [],
  experiments = [],
  competitors = [],
  features = [],
  risks = [],
}: NextActionInput): NextAction {
  const unverifiedAssumptions = evidence.filter(
    (item) => item.status === 'unverified' || item.status === 'assumption',
  );
  const runningExperiments = experiments.filter((item) => item.status === 'running');
  const openRisks = risks.filter(isOpenRisk);
  const hotRisks = sortRisksByScore(openRisks.filter(isHotRisk));
  const mustFeatures = features.filter((item) => item.priority === 'must');

  if (hotRisks.length > 0 && runningExperiments.length === 0) {
    return {
      title: 'Address Your Highest Risk',
      description: `"${hotRisks[0].title}" scores ${riskScore(
        hotRisks[0].probability,
        hotRisks[0].impact,
      )}/9. Design a test or mitigation before expanding scope.`,
      tab: 'risks',
      btnLabel: 'Open Risk Register',
    };
  }

  if (unverifiedAssumptions.length > 0 && runningExperiments.length === 0) {
    return {
      title: 'Test Your Riskiest Assumption',
      description: `You have ${unverifiedAssumptions.length} untested assumptions. Design an experiment or conduct customer interviews before writing code.`,
      tab: 'validation',
      btnLabel: 'Launch Experiment',
    };
  }

  if (runningExperiments.length > 0) {
    return {
      title: 'Collect Experiment Results',
      description: `Experiment "${runningExperiments[0].hypothesis.slice(
        0,
        45,
      )}..." is currently running. Record your findings and update evidence confidence.`,
      tab: 'validation',
      btnLabel: 'Update Experiment',
    };
  }

  if (competitors.length < 2) {
    return {
      title: 'Map Competitor Landscape',
      description:
        'Document at least 2 direct or indirect competitor workarounds to understand existing customer friction.',
      tab: 'competitors',
      btnLabel: 'Add Competitors',
    };
  }

  if (mustFeatures.length === 0) {
    return {
      title: 'Scope Your MVP Backlog',
      description: 'Select fewer than 4 "Must-Have" features to prove value without scope creep.',
      tab: 'mvp',
      btnLabel: 'Prioritize MVP',
    };
  }

  return {
    title: 'Define Foundational Assumptions',
    description: 'Log your baseline assumptions regarding customer behavior into the Evidence Ledger.',
    tab: 'evidence',
    btnLabel: 'Open Evidence Ledger',
  };
}
