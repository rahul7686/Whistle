import {
  MemberIdentity,
  MerkleProof,
  WhistleReport,
  WhistleContractLedgerState,
  ZKCircuitLog,
  ReportCategory,
  ReportSeverity,
  ReportStatus,
  ClaimReceipt,
} from './types';
import { MIDNIGHT_NETWORK_CONFIG } from './dappConnector';

// Deterministic cryptographic hash function (representing Poseidon hash in Compact)
export function poseidonHash(input: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const part3 = ((h1 ^ h2) >>> 0).toString(16).padStart(8, '0');
  const part4 = ((h1 + h2) >>> 0).toString(16).padStart(8, '0');
  return `0x${part1}${part2}${part3}${part4}`;
}

export function computeLeafCommitment(secretKey: string): string {
  return poseidonHash(`whistle:member:leaf:${secretKey}`);
}

export function computeCategoryNullifier(secretKey: string, categoryId: number): string {
  return poseidonHash(`whistle:nullifier:${secretKey}:category:${categoryId}`);
}

// Fixed-depth binary Merkle tree engine
export class WhistleMerkleTree {
  private leaves: string[] = [];

  constructor(memberSecrets: string[]) {
    this.leaves = memberSecrets.map((s) => computeLeafCommitment(s));
    while (this.leaves.length < 8) {
      this.leaves.push(poseidonHash(`whistle:empty_leaf:${this.leaves.length}`));
    }
  }

  public getRoot(): string {
    let currentLevel = [...this.leaves];
    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
        nextLevel.push(poseidonHash(`${left}:${right}`));
      }
      currentLevel = nextLevel;
    }
    return currentLevel[0];
  }

  public getProof(secretKey: string): MerkleProof | null {
    const leaf = computeLeafCommitment(secretKey);
    const index = this.leaves.indexOf(leaf);
    if (index === -1) return null;

    let currentIndex = index;
    let currentLevel = [...this.leaves];
    const path: string[] = [];

    while (currentLevel.length > 1) {
      const isEven = currentIndex % 2 === 0;
      const siblingIndex = isEven ? currentIndex + 1 : currentIndex - 1;
      const sibling = siblingIndex < currentLevel.length ? currentLevel[siblingIndex] : currentLevel[currentIndex];
      path.push(sibling);

      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
        nextLevel.push(poseidonHash(`${left}:${right}`));
      }
      currentLevel = nextLevel;
      currentIndex = Math.floor(currentIndex / 2);
    }

    return {
      leaf,
      index,
      path,
      root: currentLevel[0],
    };
  }

  public static verifyProof(leaf: string, path: string[], index: number, expectedRoot: string): boolean {
    let current = leaf;
    let idx = index;
    for (const sibling of path) {
      const isLeft = idx % 2 === 0;
      current = isLeft ? poseidonHash(`${current}:${sibling}`) : poseidonHash(`${sibling}:${current}`);
      idx = Math.floor(idx / 2);
    }
    return current.toLowerCase() === expectedRoot.toLowerCase();
  }
}

// Initial default roster
export const INITIAL_MEMBERS: MemberIdentity[] = [
  {
    id: 'mem_01',
    name: 'Senior Core Protocol Dev',
    role: 'Core Engineering',
    department: 'Protocol Architecture',
    secretKey: 'whistle_secret_alpha_89f02c4',
    commitment: computeLeafCommitment('whistle_secret_alpha_89f02c4'),
    isRegisteredOnChain: true,
  },
  {
    id: 'mem_02',
    name: 'DAO Treasury Lead',
    role: 'Treasury & Finance',
    department: 'Operations',
    secretKey: 'whistle_secret_beta_31a77d1',
    commitment: computeLeafCommitment('whistle_secret_beta_31a77d1'),
    isRegisteredOnChain: true,
  },
  {
    id: 'mem_03',
    name: 'Smart Contract Auditor',
    role: 'Security Research',
    department: 'Risk Management',
    secretKey: 'whistle_secret_gamma_65b44e9',
    commitment: computeLeafCommitment('whistle_secret_gamma_65b44e9'),
    isRegisteredOnChain: true,
  },
  {
    id: 'mem_04',
    name: 'Community Governance Steward',
    role: 'Governance Council',
    department: 'Ecosystem Growth',
    secretKey: 'whistle_secret_delta_18c99f0',
    commitment: computeLeafCommitment('whistle_secret_delta_18c99f0'),
    isRegisteredOnChain: true,
  },
];

export const CATEGORIES_LIST = [
  {
    id: 1,
    slug: 'financial_fraud' as ReportCategory,
    name: 'Financial Fraud & Misappropriation',
    description: 'Unauthorized fund diversion, secret compensations, treasury misuse, or falsified invoices.',
    iconName: 'DollarSign',
    defaultBountyTier: 1500,
  },
  {
    id: 2,
    slug: 'security' as ReportCategory,
    name: 'Security Vulnerability & Exploits',
    description: 'Smart contract exploits, compromised private keys, backdoors, or critical infrastructure flaws.',
    iconName: 'ShieldAlert',
    defaultBountyTier: 2500,
  },
  {
    id: 3,
    slug: 'misconduct' as ReportCategory,
    name: 'Workplace Misconduct & Harassment',
    description: 'Executive harassment, retaliation threats, discrimination, or abusive leadership conduct.',
    iconName: 'AlertTriangle',
    defaultBountyTier: 1000,
  },
  {
    id: 4,
    slug: 'governance' as ReportCategory,
    name: 'Governance Bribery & Sybil Attacks',
    description: 'Off-chain vote buying, collusion among multisig signers, or backroom proposal manipulation.',
    iconName: 'Vote',
    defaultBountyTier: 1200,
  },
];

export class WhistleSimulator {
  private static instance: WhistleSimulator;
  private members: MemberIdentity[] = [];
  private reports: WhistleReport[] = [];
  private circuitLogs: ZKCircuitLog[] = [];
  private tree: WhistleMerkleTree;

  private constructor() {
    this.members = [...INITIAL_MEMBERS];
    this.tree = new WhistleMerkleTree(this.members.map((m) => m.secretKey));
    this.loadState();
    if (this.reports.length === 0) {
      this.seedInitialReports();
    }
  }

  public static getInstance(): WhistleSimulator {
    if (!WhistleSimulator.instance) {
      WhistleSimulator.instance = new WhistleSimulator();
    }
    return WhistleSimulator.instance;
  }

  private loadState() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const savedMembers = localStorage.getItem('whistle_roster_members');
      if (savedMembers) {
        this.members = JSON.parse(savedMembers);
        this.tree = new WhistleMerkleTree(this.members.map((m) => m.secretKey));
      }
      const savedReports = localStorage.getItem('whistle_reports_list');
      if (savedReports) {
        this.reports = JSON.parse(savedReports);
      }
    } catch (e) {
      console.warn('Failed to load Whistle local state:', e);
    }
  }

  private saveState() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.setItem('whistle_roster_members', JSON.stringify(this.members));
      localStorage.setItem('whistle_reports_list', JSON.stringify(this.reports));
    } catch (e) {
      console.warn('Failed to save Whistle state:', e);
    }
  }

  private seedInitialReports() {
    const root = this.tree.getRoot();
    this.reports = [
      {
        id: 'rep_init_01',
        reportNumber: 101,
        categoryId: 1,
        category: 'financial_fraud',
        severity: 'critical',
        title: 'Unreported Multisig Re-routing of Foundation Grant Funds',
        encryptedSummary: 'Observed 45,000 USD equivalent shifted from operations pool to unannounced personal address right before quarterly audit.',
        evidenceHash: '0x8f72a1b9c3e4d5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
        nullifier: computeCategoryNullifier(INITIAL_MEMBERS[1].secretKey, 1),
        merkleRootSnapshot: root,
        timestamp: Date.now() - 86400000 * 3,
        status: 'validated',
        bountyAmount: 1500,
        isBountyClaimed: false,
        txHash: '0x858f350b66a846f90ddf66e9be97ca4c84940aaaaa1bb49c4d0e555fe08793fb',
      },
      {
        id: 'rep_init_02',
        reportNumber: 102,
        categoryId: 2,
        category: 'security',
        severity: 'high',
        title: 'Hardcoded Sibling Node Auth Token in Public CI Pipeline',
        encryptedSummary: 'Deploy action exposes admin token capable of triggering state synchronization rewrites in staging preprod relay.',
        evidenceHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
        nullifier: computeCategoryNullifier(INITIAL_MEMBERS[2].secretKey, 2),
        merkleRootSnapshot: root,
        timestamp: Date.now() - 86400000 * 1,
        status: 'resolved',
        bountyAmount: 2500,
        isBountyClaimed: true,
        bountyClaimTxHash: '0x858f350b66a846f90ddf66e9be97ca4c84940aaaaa1bb49c4d0e555fe08793fb',
        txHash: '0x858f350b66a846f90ddf66e9be97ca4c84940aaaaa1bb49c4d0e555fe08793fb',
      },
      {
        id: 'rep_init_03',
        reportNumber: 103,
        categoryId: 4,
        category: 'governance',
        severity: 'medium',
        title: 'Off-Chain Incentive Agreement Behind Proposal #14',
        encryptedSummary: 'Two delegates entered conditional OTC agreement for voting power centralization prior to snapshot cutoff.',
        evidenceHash: '0x7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
        nullifier: computeCategoryNullifier(INITIAL_MEMBERS[3].secretKey, 4),
        merkleRootSnapshot: root,
        timestamp: Date.now() - 3600000 * 5,
        status: 'under_review',
        bountyAmount: 0,
        isBountyClaimed: false,
        txHash: '0x858f350b66a846f90ddf66e9be97ca4c84940aaaaa1bb49c4d0e555fe08793fb',
      },
    ];
    this.saveState();
  }

  public getMembershipRoot(): string {
    return this.tree.getRoot();
  }

  public getMembers(): MemberIdentity[] {
    return [...this.members];
  }

  public getReports(): WhistleReport[] {
    return [...this.reports].sort((a, b) => b.timestamp - a.timestamp);
  }

  public getCircuitLogs(): ZKCircuitLog[] {
    return [...this.circuitLogs];
  }

  public getLedgerState(): WhistleContractLedgerState {
    const validated = this.reports.filter((r) => r.status === 'validated' || r.status === 'resolved');
    const resolved = this.reports.filter((r) => r.status === 'resolved');
    const claimed = this.reports.filter((r) => r.isBountyClaimed);
    const totalEscrow = this.reports.reduce((acc, r) => acc + (r.status === 'validated' ? r.bountyAmount : 0), 0);

    return {
      contractAddress: MIDNIGHT_NETWORK_CONFIG.contractAddress,
      adminAddress: 'mn_addr_preprod1qadminorg7686midnightverifier99',
      membershipRoot: this.getMembershipRoot(),
      totalMembers: this.members.length,
      reportCount: this.reports.length,
      validatedCount: validated.length,
      resolvedCount: resolved.length,
      totalBountyEscrow: totalEscrow,
      bountiesClaimedCount: claimed.length,
      networkId: 'preprod',
    };
  }

  // Admin: add member to roster and recompute root
  public addMember(name: string, role: string, department: string): { newMember: MemberIdentity; newRoot: string } {
    const secretKey = `whistle_secret_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString().slice(-4)}`;
    const newMember: MemberIdentity = {
      id: `mem_${Date.now().toString().slice(-5)}`,
      name,
      role,
      department,
      secretKey,
      commitment: computeLeafCommitment(secretKey),
      isRegisteredOnChain: true,
    };

    this.members.push(newMember);
    this.tree = new WhistleMerkleTree(this.members.map((m) => m.secretKey));
    const newRoot = this.tree.getRoot();
    this.saveState();

    this.circuitLogs.unshift({
      timestamp: new Date().toLocaleTimeString(),
      circuitName: 'update_membership_root',
      status: 'ledger_committed',
      proofDurationMs: 420,
      constraintsCount: 3120,
      publicInputs: { newMembershipRoot: newRoot, memberCount: this.members.length },
      privateWitnessKeys: ['admin_signature'],
      details: `Added "${name}" (${role}) to private membership set. Merkle root updated on-chain.`,
    });

    return { newMember, newRoot };
  }

  // Whistleblower: submit anonymous report with ZK standing
  public async submitReport(
    secretKey: string,
    categoryId: number,
    severity: ReportSeverity,
    title: string,
    encryptedSummary: string,
    evidenceText: string
  ): Promise<{ report: WhistleReport; receipt: ClaimReceipt }> {
    const proof = this.tree.getProof(secretKey);
    if (!proof) {
      this.circuitLogs.unshift({
        timestamp: new Date().toLocaleTimeString(),
        circuitName: 'submit_anonymous_report',
        status: 'failed',
        proofDurationMs: 180,
        constraintsCount: 14850,
        publicInputs: { categoryId, membershipRoot: this.getMembershipRoot() },
        privateWitnessKeys: ['memberSecretKey', 'membershipMerklePath'],
        details: 'Zero-Knowledge constraint failed: Secret witness key is not present in organization membership set.',
      });
      throw new Error('Verification Error: You do not possess verifiable membership standing in this organization.');
    }

    const currentRoot = this.tree.getRoot();
    const isValidMember = WhistleMerkleTree.verifyProof(proof.leaf, proof.path, proof.index, currentRoot);
    if (!isValidMember) {
      throw new Error('Zero-Knowledge verification failed: Corrupted Merkle proof path.');
    }

    const nullifier = computeCategoryNullifier(secretKey, categoryId);

    const existingSameCategory = this.reports.find((r) => r.nullifier === nullifier && r.categoryId === categoryId);
    if (existingSameCategory) {
      this.circuitLogs.unshift({
        timestamp: new Date().toLocaleTimeString(),
        circuitName: 'submit_anonymous_report',
        status: 'failed',
        proofDurationMs: 310,
        constraintsCount: 14850,
        publicInputs: { nullifier, categoryId },
        privateWitnessKeys: ['memberSecretKey'],
        details: 'Nullifier collision: A report has already been filed by this standing member under this specific category.',
      });
      throw new Error(
        `Anti-Spam Collision: A verified report under category "${CATEGORIES_LIST.find((c) => c.id === categoryId)?.name}" has already been submitted using your credentials. Please submit under another category or wait for review.`
      );
    }

    const categoryObj = CATEGORIES_LIST.find((c) => c.id === categoryId) || CATEGORIES_LIST[0];
    const reportNumber = 100 + this.reports.length + 1;
    const reportId = `rep_${Date.now().toString().slice(-6)}`;
    const txHash = MIDNIGHT_NETWORK_CONFIG.deploymentTxHash;
    const evidenceHash = poseidonHash(evidenceText || title);

    const newReport: WhistleReport = {
      id: reportId,
      reportNumber,
      categoryId,
      category: categoryObj.slug,
      severity,
      title,
      encryptedSummary,
      evidenceHash,
      nullifier,
      merkleRootSnapshot: currentRoot,
      timestamp: Date.now(),
      status: 'submitted',
      bountyAmount: 0,
      isBountyClaimed: false,
      txHash,
    };

    this.reports.unshift(newReport);
    this.saveState();

    this.circuitLogs.unshift({
      timestamp: new Date().toLocaleTimeString(),
      circuitName: 'submit_anonymous_report',
      status: 'ledger_committed',
      proofDurationMs: 1420,
      constraintsCount: 22400,
      publicInputs: {
        reportNumber,
        categoryId,
        categoryName: categoryObj.name,
        nullifier,
        membershipRootSnapshot: currentRoot,
        txHash,
      },
      privateWitnessKeys: ['memberSecretKey', 'membershipMerklePath', 'reportEvidenceSalt'],
      details: 'Minokawa circuit proven: Verified membership standing in Merkle root without disclosing leaf index. Nullifier registered.',
    });

    const receipt: ClaimReceipt = {
      reportId,
      reportNumber,
      category: categoryObj.slug,
      nullifier,
      secretKey,
      timestamp: newReport.timestamp,
      txHash,
    };

    return { report: newReport, receipt };
  }

  public reviewReport(reportId: string, newStatus: ReportStatus, bountyAmount: number): WhistleReport {
    const report = this.reports.find((r) => r.id === reportId);
    if (!report) throw new Error('Report not found');

    report.status = newStatus;
    if (newStatus === 'validated') {
      report.bountyAmount = bountyAmount;
    } else if (newStatus === 'dismissed') {
      report.bountyAmount = 0;
    }

    this.saveState();

    this.circuitLogs.unshift({
      timestamp: new Date().toLocaleTimeString(),
      circuitName: 'review_report',
      status: 'ledger_committed',
      proofDurationMs: 380,
      constraintsCount: 2180,
      publicInputs: { reportId, reportNumber: report.reportNumber, newStatus, bountyAmount },
      privateWitnessKeys: ['reviewer_multisig_sig'],
      details: `Report #${report.reportNumber} transitioned to status "${newStatus.toUpperCase()}" with ${bountyAmount} tNIGHT bounty.`,
    });

    return report;
  }

  public claimBounty(
    reportId: string,
    secretKey: string,
    recipientAddress: string
  ): { txHash: string; amountClaimed: number } {
    const report = this.reports.find((r) => r.id === reportId);
    if (!report) throw new Error('Report does not exist');
    if (report.status !== 'validated') {
      throw new Error(`Report #${report.reportNumber} is not yet validated. Current status: ${report.status}`);
    }
    if (report.isBountyClaimed) {
      throw new Error(`Bounty for report #${report.reportNumber} has already been claimed.`);
    }

    const derived = computeCategoryNullifier(secretKey, report.categoryId);
    if (derived !== report.nullifier) {
      this.circuitLogs.unshift({
        timestamp: new Date().toLocaleTimeString(),
        circuitName: 'claim_anonymous_bounty',
        status: 'failed',
        proofDurationMs: 250,
        constraintsCount: 8900,
        publicInputs: { reportId, expectedNullifier: report.nullifier },
        privateWitnessKeys: ['memberSecretKey'],
        details: 'Unauthorized claim: Secret witness key does not match the report nullifier.',
      });
      throw new Error('Unauthorized: Secret key does not match this report nullifier.');
    }

    const txHash = MIDNIGHT_NETWORK_CONFIG.deploymentTxHash;
    report.isBountyClaimed = true;
    report.status = 'resolved';
    report.bountyClaimTxHash = txHash;
    this.saveState();

    this.circuitLogs.unshift({
      timestamp: new Date().toLocaleTimeString(),
      circuitName: 'claim_anonymous_bounty',
      status: 'ledger_committed',
      proofDurationMs: 1190,
      constraintsCount: 16400,
      publicInputs: {
        reportNumber: report.reportNumber,
        reportNullifier: report.nullifier,
        disbursedAmount: report.bountyAmount,
        destinationAddress: recipientAddress,
        claimTxHash: txHash,
      },
      privateWitnessKeys: ['memberSecretKey', 'claimAuthorizationWitness'],
      details: `Bounty of ${report.bountyAmount} tNIGHT disbursed anonymously to recipient wallet without revealing member identity.`,
    });

    return { txHash, amountClaimed: report.bountyAmount };
  }
}