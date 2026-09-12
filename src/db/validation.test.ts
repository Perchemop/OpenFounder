import { describe, it, expect } from 'vitest';
import {
  SafeIdSchema,
  SafeUrlSchema,
  validateExportPackage,
} from './validation';
import { validateWorkspaceReferences } from './index';
import type { CanvasNode, CanvasEdge, EvidenceItem, Experiment, RoadmapItem } from '../types';

describe('Validation Schemas & Hardening', () => {
  describe('SafeIdSchema', () => {
    it('accepts valid alphanumeric, dashed, and underscored IDs', () => {
      expect(SafeIdSchema.safeParse('proj_12345').success).toBe(true);
      expect(SafeIdSchema.safeParse('node-abc-99').success).toBe(true);
      expect(SafeIdSchema.safeParse('standardId123').success).toBe(true);
    });

    it('rejects dangerous or illegal ID characters', () => {
      expect(SafeIdSchema.safeParse('<script>alert(1)</script>').success).toBe(false);
      expect(SafeIdSchema.safeParse('../../../etc/passwd').success).toBe(false);
      expect(SafeIdSchema.safeParse('id with spaces').success).toBe(false);
      expect(SafeIdSchema.safeParse('').success).toBe(false);
    });
  });

  describe('SafeUrlSchema', () => {
    it('accepts valid http, https, and empty urls', () => {
      expect(SafeUrlSchema.safeParse('https://example.com/article').success).toBe(true);
      expect(SafeUrlSchema.safeParse('http://localhost:3000').success).toBe(true);
      expect(SafeUrlSchema.safeParse('').success).toBe(true);
      expect(SafeUrlSchema.safeParse(undefined).success).toBe(true);
    });

    it('rejects dangerous javascript pseudo-protocol URLs', () => {
      expect(SafeUrlSchema.safeParse('javascript:alert(1)').success).toBe(false);
      expect(SafeUrlSchema.safeParse('data:text/html,<script>alert(1)</script>').success).toBe(false);
    });
  });

  describe('Workspace Referential Integrity', () => {
    it('detects orphan canvas edges with nonexistent source or target nodes', () => {
      const nodes: CanvasNode[] = [
        {
          id: 'node_1',
          projectId: 'proj_1',
          type: 'problem',
          title: 'Problem 1',
          description: '',
          x: 0,
          y: 0,
        },
      ];

      const edges: CanvasEdge[] = [
        {
          id: 'edge_1',
          projectId: 'proj_1',
          fromNodeId: 'node_1',
          toNodeId: 'node_missing',
        },
      ];

      const result = validateWorkspaceReferences({ nodes, edges });
      expect(result.valid).toBe(false);
      expect(result.warnings.length).toBe(1);
      expect(result.warnings[0]).toContain('node_missing');
    });

    it('detects experiment linking to missing evidence claim', () => {
      const evidence: EvidenceItem[] = [
        {
          id: 'ev_1',
          projectId: 'proj_1',
          claim: 'Founders need customer discovery',
          type: 'problem',
          status: 'research_backed',
          evidenceNotes: '',
          confidence: 'high',
          nextTest: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const experiments: Experiment[] = [
        {
          id: 'exp_1',
          projectId: 'proj_1',
          hypothesis: '50% of founders will use local dossiers',
          method: 'smoke_landing_page',
          status: 'running',
          currentSampleSize: 10,
          successCriteria: '10 signups',
          failureCriteria: '< 2 signups',
          evidenceId: 'ev_nonexistent',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const result = validateWorkspaceReferences({ evidence, experiments });
      expect(result.valid).toBe(false);
      expect(result.warnings[0]).toContain('ev_nonexistent');
    });

    it('detects broken roadmap dependency references', () => {
      const roadmap: RoadmapItem[] = [
        {
          id: 'rm_1',
          projectId: 'proj_1',
          title: 'MVP Launch',
          objective: 'Launch initial prototype',
          status: 'in_progress',
          priority: 'urgent',
          owner: 'Founder',
          evidenceRequired: '',
          estimatedEffort: '2 weeks',
          orderIndex: 0,
          dependencies: ['rm_ghost_dependency'],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const result = validateWorkspaceReferences({ roadmap });
      expect(result.valid).toBe(false);
      expect(result.warnings[0]).toContain('rm_ghost_dependency');
    });

    it('passes when all referential relations are sound', () => {
      const nodes: CanvasNode[] = [
        { id: 'node_1', projectId: 'p1', type: 'problem', title: 'P1', description: '', x: 0, y: 0 },
        { id: 'node_2', projectId: 'p1', type: 'solution', title: 'S1', description: '', x: 100, y: 100 },
      ];
      const edges: CanvasEdge[] = [
        { id: 'edge_1', projectId: 'p1', fromNodeId: 'node_1', toNodeId: 'node_2' },
      ];
      const evidence: EvidenceItem[] = [
        {
          id: 'ev_1',
          projectId: 'p1',
          claim: 'Valid claim',
          type: 'customer',
          status: 'customer_confirmed',
          evidenceNotes: '',
          confidence: 'high',
          nextTest: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];
      const experiments: Experiment[] = [
        {
          id: 'exp_1',
          projectId: 'p1',
          hypothesis: 'Test hypothesis',
          method: 'customer_interview',
          status: 'passed',
          currentSampleSize: 5,
          successCriteria: 'Pass',
          failureCriteria: 'Fail',
          evidenceId: 'ev_1',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const result = validateWorkspaceReferences({ nodes, edges, evidence, experiments });
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBe(0);
    });
  });

  describe('ExportPackage Validation', () => {
    it('validates a complete project package successfully', () => {
      const samplePackage = {
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        appVersion: '1.0.0',
        project: {
          id: 'proj_demo_1',
          name: 'Demo Project',
          tagline: 'A validated startup idea',
          stage: 'validating',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        evidence: [],
        research: [],
        communityInsights: [],
        competitors: [],
        experiments: [],
        interviews: [],
        features: [],
        roadmap: [],
        canvasNodes: [],
        canvasEdges: [],
        decisions: [],
      };

      const result = validateExportPackage(samplePackage);
      expect(result.valid).toBe(true);
      expect(result.data?.project.name).toBe('Demo Project');
    });

    it('rejects payload with missing project or invalid schema version', () => {
      const invalidPackage = {
        schemaVersion: 99,
        project: { id: '' },
      };

      const result = validateExportPackage(invalidPackage);
      expect(result.valid).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(0);
    });
  });
});
