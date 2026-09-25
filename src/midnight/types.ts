export type ReportCategory = 'misconduct' | 'financial_fraud' | 'security' | 'governance';

export type ReportSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ReportStatus = 'submitted' | 'under_review' | 'validated' | 'resolved' | 'dismissed';

export interface CategoryMetadata {
  id: number;
  slug: ReportCategory;
  name: string;
  description: string;
  iconName: string;
  defaultBountyTier: number; // in tNIGHT
}

export interface MemberIdentity {
  id: string;
  name: string;
  role: string;
  department: string;
  secretKey: string;
  commitment: string;
  isRegisteredOnChain: boolean;
}

export interface MerkleProof {
  leaf: string;
  index: number;
  path: string[];
  root: string;
}

export interface WhistleReport {
  id: string;
  reportNumber: number;
  categoryId: number;
  category: ReportCategory;
  severity: ReportSeverity;
  title: string;
  encryptedSummary: string;
  evidenceHash: string;
  nullifier: string;
  merkleRootSnapshot: string;
  timestamp: number;
  status: ReportStatus;
  bountyAmount: number; // in tNIGHT
  isBountyClaimed: boolean;
  bountyClaimTxHash?: string;
  txHash: string;
}

export interface ClaimReceipt {
  reportId: string;
  reportNumber: number;
  category: ReportCategory;
  nullifier: string;
  secretKey: string;
  timestamp: number;
  txHash: string;
}

export interface LaceWalletState {
  isConnected: boolean;
  address: string | null;
  coinPublicKey: string | null;
  encryptionPublicKey: string | null;
  networkId: 'preprod' | 'preview';
  balance: bigint; // in smallest unit (tNIGHT)
}

export interface WhistleContractLedgerState {
  contractAddress: string;
  adminAddress: string;
  membershipRoot: string;
  totalMembers: number;
  reportCount: number;
  validatedCount: number;
  resolvedCount: number;
  totalBountyEscrow: number; // in tNIGHT
  bountiesClaimedCount: number;
  networkId: 'preprod' | 'preview';
}

export interface ZKCircuitLog {
  timestamp: string;
  circuitName: string;
  status: 'generating_proof' | 'witness_verified' | 'ledger_committed' | 'failed';
  proofDurationMs: number;
  constraintsCount: number;
  publicInputs: Record<string, any>;
  privateWitnessKeys: string[];
  details: string;
}
