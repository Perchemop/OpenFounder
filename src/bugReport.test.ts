import { describe, it, expect } from 'vitest';
import {
  buildBugReport,
  buildBugReportBody,
  buildBugReportTitle,
  buildIssueUrl,
  extractRepository,
} from './bugReport';

const base = {
  appVersion: '1.0.0',
  summary: 'Promoting a claim to customer_confirmed froze the page',
  origin: 'error_boundary' as const,
};

describe('buildBugReportTitle', () => {
  it('prefixes the origin and keeps the summary on one line', () => {
    expect(buildBugReportTitle({ ...base, summary: '  spaced   summary  ' })).toBe(
      'Crash: spaced summary'
    );
    expect(buildBugReportTitle({ ...base, origin: 'manual' })).toContain('Bug:');
  });

  it('truncates very long summaries', () => {
    const title = buildBugReportTitle({ ...base, summary: 'x'.repeat(200) });
    expect(title.length).toBeLessThan(120);
    expect(title.endsWith('…')).toBe(true);
  });

  it('falls back when nothing was described', () => {
    expect(buildBugReportTitle({ ...base, summary: '   ' })).toBe(
      'Unexpected problem in OpenFounder'
    );
  });
});

describe('buildBugReportBody', () => {
  it('includes what happened, steps, environment, and technical detail, in that order', () => {
    const body = buildBugReportBody({
      ...base,
      userNotes: 'I had three claims open.',
      stepsToReproduce: ['Open ledger', 'Promote claim'],
      technicalDetail: 'TypeError: cannot read\nat promote (/home/leo/app/src/x.ts:1:1)',
    });

    const sections = ['### What happened', '### Steps to reproduce', '### Environment', '### Technical detail'];
    const indexes = sections.map((section) => body.indexOf(section));
    expect(indexes.every((index) => index >= 0)).toBe(true);
    expect([...indexes].sort((a, b) => a - b)).toEqual(indexes);
    expect(body).toContain('1. Open ledger');
    expect(body).toContain('2. Promote claim');
    expect(body).toContain('**App version:** 1.0.0');
  });

  it('says steps are missing rather than inventing them', () => {
    expect(buildBugReportBody({ ...base })).toContain('_Not recorded._');
  });

  it('omits the environment when diagnostics are switched off', () => {
    const body = buildBugReportBody({ ...base, includeDiagnostics: false });
    expect(body).not.toContain('### Environment');
    expect(body).not.toContain('UserAgent');
  });

  it('merges caller-supplied diagnostics', () => {
    const body = buildBugReportBody({
      ...base,
      diagnostics: { 'Claims in ledger': '12' },
    });
    expect(body).toContain('**Claims in ledger:** 12');
  });

  it('scrubs home paths and long hex ids, and caps stack lines', () => {
    const detail = Array.from({ length: 40 }, (_, index) =>
      `at fn${index} (/home/leo/x.ts:${index}:1) id=abcdef0123456789abcdef0123456789`
    ).join('\n');
    const body = buildBugReportBody({ ...base, technicalDetail: detail });
    const block = body.slice(body.indexOf('### Technical detail'));

    expect(block).not.toContain('/home/leo');
    expect(block).toContain('~');
    expect(block).not.toContain('abcdef0123456789');
    expect(block).toContain('<id>');
    expect(block.match(/at fn/g)?.length).toBe(12);
  });

  it('bounds the whole body', () => {
    const body = buildBugReportBody({
      ...base,
      userNotes: 'y'.repeat(9000),
    });
    expect(body.length).toBeLessThanOrEqual(6000);
  });

  it('does not claim a description the user never gave', () => {
    expect(buildBugReportBody({ ...base, summary: '' })).toContain(
      'The user did not describe the problem.'
    );
  });
});

describe('buildIssueUrl', () => {
  it('builds a prefilled URL with title and body', () => {
    const url = new URL(buildIssueUrl(buildBugReport(base), 'Perchemop/OpenFounder', ['bug']));
    expect(url.origin).toBe('https://github.com');
    expect(url.pathname).toBe('/Perchemop/OpenFounder/issues/new');
    expect(url.searchParams.get('title')).toBe('Crash: Promoting a claim to customer_confirmed froze the page');
    expect(url.searchParams.get('body')).toContain('App version');
    expect(url.searchParams.get('labels')).toBe('bug');
  });

  it('omits labels when none are given', () => {
    const url = buildIssueUrl(buildBugReport(base), 'Perchemop/OpenFounder');
    expect(url).not.toContain('labels=');
  });
});

describe('extractRepository', () => {
  it('accepts https and ssh remotes, with and without .git', () => {
    expect(extractRepository('https://github.com/Perchemop/OpenFounder.git')).toBe(
      'Perchemop/OpenFounder'
    );
    expect(extractRepository('https://github.com/Perchemop/OpenFounder')).toBe(
      'Perchemop/OpenFounder'
    );
    expect(extractRepository('git@github.com:Perchemop/OpenFounder.git')).toBe(
      'Perchemop/OpenFounder'
    );
  });

  it('rejects anything else', () => {
    expect(extractRepository('https://gitlab.com/a/b')).toBeNull();
    expect(extractRepository('')).toBeNull();
  });
});
