# How to Use Whistle

Whistle enables verified members of an organization (employees, DAO contributors, token holders) to submit sensitive concerns and claim rewards with mathematical standing—**without revealing their identity or linking to personal wallets**.

---

## What You Need

1. **A Chromium-based Browser**: Chrome, Brave, Edge, or Arc.
2. **The 1AM Browser Wallet**:
   - Install the extension from [1am.xyz](https://1am.xyz).
   - Set the active network to **Preprod**.
3. **Standing Credential**:
   - Your organization provides an authorized public key or private membership secret key included in the organization's Merkle tree.
4. **No Funds Required to Report**:
   - Reporting transactions and zero-knowledge proofs do not require spending personal funds.

---

## Step-by-Step Guide

### Step 1: Connect Your 1AM Wallet
1. Open the Whistle dApp at [whistle-sigma.vercel.app](https://whistle-sigma.vercel.app).
2. Click **Connect 1AM** in the top navigation bar.
3. Authorize the connection in the 1AM pop-up. The network indicator will turn green and display **Preprod**.

---

### Step 2: Submit an Anonymous Report
1. Navigate to the **Submit Report** tab.
2. **Select Your Credential**: Choose your roster identity or paste your custom 32-byte member secret witness.
3. **Select Concern Category**:
   - Financial Fraud & Embezzlement
   - Security Vulnerability & Exploit
   - Workplace Misconduct & Harassment
   - Governance Bribery & Collusion
4. **Provide Incident Details**: Enter a descriptive title, encrypted evidence summary, and threat severity (Low, Medium, High, Critical).
5. **Generate Proof & Submit**:
   - Click **Submit Anonymous Report**.
   - Your browser compiles the Minokawa zk-SNARK proof locally, confirming you are a valid roster member without revealing your leaf index.
6. **Save Your Secret Bounty Claim Receipt**:
   - Download the `.json` receipt or copy your Secret Claim Key. **Keep this secret**—it is required to claim any escrow bounty awarded to this report.

---

### Step 3: Organization Admin Review & Bounty Allocation
*(For Organization Governance & Review Councils)*
1. Navigate to the **Review Hub** tab.
2. Inspect the incoming reports queue. Each verified submission displays a **"Verified Standing"** cryptographic badge.
3. **Update Status**: Set the status to *Under Review*, *Validated*, or *Resolved*.
4. **Allocate Bounty**: For valid disclosures, allocate a reward in `tNIGHT` to the on-chain escrow pool.
5. **Manage Roster**: Add new team members or update the on-chain Merkle root seamlessly.

---

### Step 4: Claim Your Anonymous Bounty
1. Navigate to the **Claim Bounty** tab.
2. Connect a fresh, unlinked 1AM wallet (for maximum privacy, use a wallet address with no prior connection to your workplace identity).
3. Select the approved report and paste your **Secret Claim Receipt Key**.
4. Click **Claim Shielded Bounty via ZK Proof**.
5. The contract verifies that your secret matches the report's nullifier and releases the `tNIGHT` escrow directly into your clean wallet.

---

### Step 5: In-Browser Contract Deployment (For New Organizations)
1. Navigate to [`/deploy`](https://whistle-sigma.vercel.app/#deploy) and select **1AM Deploy**.
2. Connect your 1AM wallet on Preprod.
3. Click **Deploy Whistle Contract via 1AM Extension**.
4. The deployment transaction is synthesized and broadcast via 1AM ProofStation.
5. Once indexed, the confirmed Bech32m contract address is rendered on screen.

---

## What Gets Proved (and What Stays Private)

| Feature / Data Point | What Gets Proved On-Chain | What Stays Completely Private |
| :--- | :--- | :--- |
| **Whistleblower Identity** | Proves membership in the authorized Merkle tree root. | The member's specific name, ID, and leaf index are never revealed. |
| **Spam Prevention** | Proves that the per-category nullifier is uniquely derived. | The underlying secret key generating the nullifier is never revealed. |
| **Wallet Linkage** | None. The report transaction is untraceable to any personal wallet. | The whistleblower's personal identity and wallet are decoupled. |
| **Bounty Payout** | Proves ownership of the nullifier preimage. | The recipient identity remains shielded from the organization. |

---

## Troubleshooting

### 1. "1AM wallet extension not detected"
- Make sure the 1AM extension is installed from [1am.xyz](https://1am.xyz) and enabled in your browser extensions manager.
- Refresh the webpage after installing.

### 2. "Wrong Network / Please switch to Preprod"
- Open your 1AM wallet extension, click the network dropdown, and select **Midnight Preprod**.

### 3. "Nullifier collision / duplicate submission detected"
- You have already submitted a report in this specific category for this reporting cycle. Select a different category if you have distinct concerns to report.

### 4. "State not found on indexer"
- The Midnight Preprod GraphQL indexer can experience 10–30 seconds of indexing latency. Whistle automatically retries polling until the block is confirmed.