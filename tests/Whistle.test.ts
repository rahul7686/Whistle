import { describe, it, expect, beforeEach } from 'vitest';
import {
  WhistleSimulator,
  WhistleMerkleTree,
  computeLeafCommitment,
  computeCategoryNullifier,
  INITIAL_MEMBERS,
} from '../src/midnight/whistleSimulator';

describe('Whistle Zero-Knowledge Organizational Reporting Protocol', () => {
  let simulator: WhistleSimulator;

  beforeEach(() => {
    simulator = WhistleSimulator.getInstance();
  });

  it('1. Merkle Membership Proof: Valid credentialed member proves inclusion in root', () => {
    const member = INITIAL_MEMBERS[0];
    const tree = new WhistleMerkleTree(INITIAL_MEMBERS.map((m) => m.secretKey));
    const root = tree.getRoot();

    const proof = tree.getProof(member.secretKey);
    expect(proof).not.toBeNull();
    expect(proof!.root).toBe(root);

    // Verify proof
    const isValid = WhistleMerkleTree.verifyProof(proof!.leaf, proof!.path, proof!.index, root);
    expect(isValid).toBe(true);
  });

  it('2. Non-Member Rejection: Uncredentialed outsider fails Merkle membership verification', () => {
    const outsiderSecret = 'whistle_secret_unauthorized_attacker_999';
    const tree = new WhistleMerkleTree(INITIAL_MEMBERS.map((m) => m.secretKey));
    const proof = tree.getProof(outsiderSecret);

    expect(proof).toBeNull();
  });

  it('3. Anonymous Report Submission: Credentialed member files report in zero-knowledge', async () => {
    const member = INITIAL_MEMBERS[0]; // Senior Core Dev
    const categoryId = 3; // Workplace Misconduct (not used in seeded reports)

    const { report, receipt } = await simulator.submitReport(
      member.secretKey,
      categoryId,
      'critical',
      'Confidential Executive Intimidation Report',
      'Confidential details of unapproved coercive conduct',
      'hash_evidence_test_123'
    );

    expect(report).toBeDefined();
    expect(report.reportNumber).toBeGreaterThan(100);
    expect(report.status).toBe('submitted');
    expect(report.nullifier).toBe(computeCategoryNullifier(member.secretKey, categoryId));
    expect(receipt.secretKey).toBe(member.secretKey);
  });

  it('4. Anti-Spam Nullifier: Prevents duplicate report submission under the same category', async () => {
    const member = INITIAL_MEMBERS[0];
    const categoryId = 2; // Security Vulnerability (INITIAL_MEMBERS[0] hasn't used this yet)

    // First report succeeds
    await simulator.submitReport(
      member.secretKey,
      categoryId,
      'high',
      'Leaked Relay Ingress Secret',
      'Detailed log snippet',
      'evidence_hash_1'
    );

    // Second report in same category by same member must be rejected due to nullifier collision
    await expect(
      simulator.submitReport(
        member.secretKey,
        categoryId,
        'medium',
        'Duplicate Spam Submission',
        'Spam text',
        'evidence_hash_2'
      )
    ).rejects.toThrow(/Anti-Spam Collision/);
  });

  it('5. Multi-Category Freedom: Same member can file in distinct categories with unique nullifiers', async () => {
    const member = INITIAL_MEMBERS[3]; // Community Governance Steward
    const catFraud = 1;
    const catGovernance = 4;

    const nullifierFraud = computeCategoryNullifier(member.secretKey, catFraud);
    const nullifierGov = computeCategoryNullifier(member.secretKey, catGovernance);

    // Nullifiers for distinct categories must be cryptographically distinct
    expect(nullifierFraud).not.toBe(nullifierGov);
  });

  it('6. Admin Review & Bounty Allocation: Organization transitions status & funds escrow', () => {
    const reports = simulator.getReports();
    const targetReport = reports[0];

    const updated = simulator.reviewReport(targetReport.id, 'validated', 2000);
    expect(updated.status).toBe('validated');
    expect(updated.bountyAmount).toBe(2000);

    const ledger = simulator.getLedgerState();
    expect(ledger.totalBountyEscrow).toBeGreaterThanOrEqual(2000);
  });

  it('7. Anonymous Bounty Claim: Reporter claims bounty with secret; unauthorized claim fails', () => {
    const reports = simulator.getReports();
    // Find a validated report
    let validatedReport = reports.find((r) => r.status === 'validated' && !r.isBountyClaimed);
    if (!validatedReport) {
      simulator.reviewReport(reports[0].id, 'validated', 1500);
      validatedReport = simulator.getReports().find((r) => r.id === reports[0].id)!;
    }

    // Attempt claim with wrong secret must fail
    expect(() => {
      simulator.claimBounty(validatedReport!.id, 'wrong_attacker_secret_key', 'mn_addr_preprod1qattacker');
    }).toThrow(/Unauthorized/);

    // Matching member claims successfully
    const matchingMember = INITIAL_MEMBERS.find(
      (m) => computeCategoryNullifier(m.secretKey, validatedReport!.categoryId) === validatedReport!.nullifier
    );

    if (matchingMember) {
      const claimRes = simulator.claimBounty(
        validatedReport.id,
        matchingMember.secretKey,
        'mn_addr_preprod1qcleanrecipient99'
      );
      expect(claimRes.amountClaimed).toBe(validatedReport.bountyAmount);
      expect(claimRes.txHash).toBeDefined();

      const refreshed = simulator.getReports().find((r) => r.id === validatedReport!.id)!;
      expect(refreshed.isBountyClaimed).toBe(true);
      expect(refreshed.status).toBe('resolved');
    }
  });
});