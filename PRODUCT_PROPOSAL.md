# Product Proposal: Whistle — Anonymous Organizational Reporting with Verifiable Standing

## 1. Executive Summary
**Whistle** is a zero-knowledge confidential organizational reporting and whistleblowing protocol built on the **Midnight Network** (Preprod Network). It allows members of an organization (such as enterprise employees, DAO contributors, university student bodies, or open-source maintainers) to prove they possess genuine standing to raise sensitive concerns without ever revealing *which* member they are, even to the organization itself.

- 🌐 **Live Deployed App**: [whistle-sigma.vercel.app](https://whistle-sigma.vercel.app)
- 🎥 **Demo Video Walkthrough**: [Watch Video Demo on Google Drive](https://drive.google.com/file/d/1EtDqa7OfEIXpTFXmZ51Ci7fefmtJVmuZ/view?usp=sharing)
- 💻 **GitHub Repository**: [github.com/rahul7686/Whistle](https://github.com/rahul7686/Whistle)
- 📜 **Preprod Smart Contract**: `mn_contract_preprod1qw8st70x9m5l42k9z8f31y6a4b7c0v28e53l90qw82k4`

---

## 2. The Problem
Most feedback and reporting channels in organizations force an intractable, broken tradeoff:
1. **Anonymous & Unverifiable (Noise & Abuse)**:
   - External anonymous inboxes (forms, public forums, throwaway emails) attract malicious spam, Sybils, and competitor attacks.
   - Organizations cannot distinguish whether a report comes from an executive insider or an external bad actor, rendering reports untrusted and unactionable.
2. **Verifiable & Identifiable (Retaliation & Silence)**:
   - Internal compliance hotlines, HR tools, and authenticated web3 portals require identity verification.
   - Whistleblowers face severe risks of termination, blacklisting, career retaliation, or social harassment, causing employees to self-censor during critical moments of misconduct, security flaws, or financial embezzlement.

This dilemma kills honest signal exactly where it matters most: **misconduct reports, governance manipulation, treasury diversion, and critical security vulnerabilities**.

---

## 3. The Midnight Solution
Whistle uses Midnight's dual-state ledger architecture, the **Minokawa ZK proving system**, and the **Compact DSL** to achieve both absolute anonymity and ironclad verifiability:

1. **Private Membership Merkle Set**:
   - The organization maintains an on-chain Merkle root of credentialed members (employees, verified wallet holders, token delegates).
   - The whistleblower creates a local Merkle membership proof verifying inclusion in the roster without revealing their leaf position or identity.
2. **Deterministic Category Nullifiers**:
   - Every report generates a deterministic nullifier: `Poseidon(secretKey, categoryId)`.
   - Prevents the same member from spamming duplicate reports in the same category, while allowing that same person to file multiple distinct, legitimate concerns across different topics over time.
3. **Anonymous Bounty Escrow Protocol**:
   - Organizations lock tNIGHT funds into an on-chain escrow pool.
   - Reviewer multisigs validate legitimate reports and allocate bounties.
   - The whistleblower claims their bounty payout by generating a zero-knowledge proof of ownership of the nullifier secret into a fresh, unlinked 1AM wallet. Even the bounty payout never connects to their identity.

---

## 4. Privacy Model: Dual-State Distinction

### What is Publicly Observable (Public Ledger State)
- Organization Admin Address & Active Membership Merkle Root
- Total Report Counter & Aggregate Status Breakdown (Submitted, Under Review, Validated, Resolved)
- Unique Report Nullifiers (used to prevent duplicate submissions)
- Escrow Bounty Pool balance and total disbursed rewards
- Public IPFS / SHA-256 evidence commitment hashes

### What is Strictly Protected in Zero-Knowledge (Client Private State)
- **Whistleblower Identity**: Real name, employee ID, role, department, and email address.
- **Roster Leaf Index**: Which member leaf in the Merkle tree generated the proof.
- **Member Secret Witness Key**: The cryptographic credential used to derive the nullifier.
- **Personal Wallet Association**: Submission transactions and bounty claims do not link to the whistleblower's personal identity.

---

## 5. Technical Stack

| Layer | Component | Implementation |
| :--- | :--- | :--- |
| **Smart Contract** | Compact v0.23 | Minokawa zk-SNARK proving system |
| **Blockchain** | Midnight Preprod Network | Network ID: `preprod` |
| **Browser Wallet** | 1AM / Lace Extension | 100% In-Browser Prover & Deployer (`/deploy`) |
| **Connector** | Midnight.js DApp Connector | Polling wallet detector with auto-reconnect |
| **Frontend** | React 18 + TypeScript | Vite 6 Build Engine |
| **Styling** | Tailwind CSS + Lucide Icons | Dark Cyberpunk Neon / Electric Cyan theme |
| **Testing** | Vitest | 7 Unit, Privacy & Circuit tests passing |
| **CI/CD** | GitHub Actions | Automated Linting, Vitest, and Production Build |
| **Hosting** | Vercel | Single-Page Application distribution |

---

## 6. Real-World Growth Plan (Levels 5 & 6)

### Level 5: Full Moon (50+ Real User Cohort Pilot)
- Rather than relying on synthetic test traffic, Whistle will be piloted directly within the **Midnight Moonshots builder cohort** and 1–2 partner Discord/DAO communities as an "Anonymous Concerns & Ecosystem Feedback Channel".
- This provides an authentic user base of 50+ developers and community members testing genuine report submission and verifiable status tracking.

### Level 6: Supermoon (Mainnet & Embeddable DAO Infrastructure)
- Package Whistle into an embeddable React SDK and Discord bot integration.
- Enable DAOs on Cardano, Midnight, and EVM to embed anonymous reporting into their governance portals with automated multisig escrow payouts.