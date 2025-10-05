# AI Portfolio Guardian (APG) 🛡️

> **AI-Powered On-Chain Risk Assessment for DeFi Portfolios**  
> Built for Polygon Buildathon: From Launch to Fundraising

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://portfolioguardian.coinsspor.com/)
[![Watch Video](https://img.shields.io/badge/Demo-Video-red)](https://www.youtube.com/watch?v=8j3u66Bi8W4)
[![Polygon](https://img.shields.io/badge/Polygon-PoS%20Mainnet-purple)](https://polygonscan.com/address/0x35d818492803865b20804C8D60a149519B215b37)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🚀 Live Product

- **Live Application**: [https://portfolioguardian.coinsspor.com/](https://portfolioguardian.coinsspor.com/)
- **Demo Video**: [YouTube Demo](https://www.youtube.com/watch?v=8j3u66Bi8W4)
- **Network**: Polygon PoS Mainnet (Chain ID: 137)
- **Registry Contract**: [`0x35d818492803865b20804C8D60a149519B215b37`](https://polygonscan.com/address/0x35d818492803865b20804C8D60a149519B215b37)

## 🎯 Executive Summary

AI Portfolio Guardian revolutionizes DeFi risk management by providing real-time, AI-driven risk assessment for any Polygon wallet. Our solution generates a transparent 0-100 risk score based on portfolio diversification, stable asset allocation, and trading activity - all verifiable on-chain through our innovative attestation system.

### Key Metrics
- **Risk Analysis Time**: < 3 seconds
- **On-chain Attestation**: 1-click process
- **Data Sources**: Covalent + Polygonscan APIs
- **Smart Contract**: Gas-optimized, EIP-712 compatible

## ✨ Core Features

### 🤖 AI-Powered Risk Analysis
- **Composite Risk Scoring**: Advanced algorithm combining concentration metrics (HHI-based), stable hedge ratios, and activity signals
- **Real-time Analysis**: Instant portfolio evaluation for any Polygon address
- **Multi-dimensional Assessment**: Concentration, stability, and activity components

### 📊 Advanced Visualization
- **Interactive Donut Chart**: USD-based asset breakdown with drill-down capabilities
- **Risk Radar Chart**: Multi-axis visualization of risk components
- **Trend Sparklines**: Historical risk score evolution
- **Responsive Design**: Mobile-first, production-ready UI

### 🔗 On-Chain Attestation
- **Verifiable Records**: Permanent, transparent risk scores on Polygon blockchain
- **Self-Sovereign**: Users control their own risk attestation
- **EIP-712 Support**: Secure, gas-efficient signature scheme
- **Public Access**: Open protocol for ecosystem integration

### 🛡️ Security & Trust
- **Self-Attestation Only**: Prevents score manipulation by third parties
- **Contract Guards**: Public mode, pause mechanism, fee management
- **Version Control**: Automatic versioning for score updates
- **Audit-Ready**: Clean, documented smart contract code

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface (Next.js)              │
│  - Wallet Connection (Wagmi)                            │
│  - Real-time Analysis                                   │
│  - Interactive Charts (Chart.js)                        │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   Backend API (Node.js)                  │
│  - Risk Calculation Engine                              │
│  - Data Aggregation (Covalent + Polygonscan)            │
│  - Caching Layer                                        │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Smart Contract (RiskRegistry V3)            │
│  - On-chain Attestation                                 │
│  - Version Management                                   │
│  - Access Control                                       │
└──────────────────────────────────────────────────────────┘
```

## 📦 Repository Structure

```
AI-Portfolio-Guardian/
├── backend/                 # Risk analysis engine
│   ├── src/
│   │   ├── index.ts        # Express server
│   │   ├── analyze.ts      # Core risk algorithm
│   │   ├── covalent.ts     # Covalent API integration
│   │   └── polygonscan.ts  # Polygonscan integration
│   └── .env.example
│
├── frontend/               # Next.js application
│   ├── app/
│   │   ├── page.tsx       # Landing page
│   │   ├── analyze/       # Analysis dashboard
│   │   └── providers.tsx  # Web3 providers
│   └── .env.local.example
│
└── contracts/             # Smart contracts
    ├── contracts/
    │   └── RiskRegistry.sol
    ├── scripts/
    │   ├── deploy.ts
    │   └── enablePublic.ts
    └── abi/
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MetaMask wallet
- Polygon (POL) for gas fees

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/AI-Portfolio-Guardian.git
cd AI-Portfolio-Guardian
```

2. **Setup Backend**
```bash
cd backend
cp .env.example .env
# Edit .env with your API keys
npm install
npm run build
npm start
```

3. **Setup Frontend**
```bash
cd ../frontend
cp .env.local.example .env.local
# Edit .env.local
npm install
npm run build
npm start
```

4. **Access the application**
```
Open https://localhost:3000
```

## 🔧 Configuration

### Backend Environment Variables
```env
PORT=4000
CORS_ORIGIN=https://portfolioguardian.coinsspor.com
RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
COVALENT_KEY=YOUR_COVALENT_API_KEY
POLYGONSCAN_KEY=YOUR_POLYGONSCAN_API_KEY
```

### Frontend Environment Variables
```env
NEXT_PUBLIC_BACKEND_URL=https://portfolioguardian.coinsspor.com/api
NEXT_PUBLIC_REGISTRY=0x35d818492803865b20804C8D60a149519B215b37
NEXT_PUBLIC_CHAIN_ID=137
```

## 📊 Risk Score Algorithm

Our proprietary risk scoring algorithm evaluates three key dimensions:

### 1. Concentration Risk (40% weight)
- Herfindahl-Hirschman Index (HHI) based calculation
- Measures portfolio diversification
- Higher concentration = Higher risk

### 2. Stable Hedge Ratio (35% weight)
- Percentage of portfolio in stable assets
- Identifies stablecoins (USDC, USDT, DAI, etc.)
- Lower stable ratio = Higher risk

### 3. Activity Score (25% weight)
- Recent transaction frequency
- 7-day activity window
- Inactive wallets = Higher risk

```javascript
riskScore = (concentration * 0.4) + (100 - stableRatio) * 0.35 + activityScore * 0.25
```

## 🔗 Smart Contract

### RiskRegistry V3 Features
- **Public Attestation**: `attestOpen()` for self-sovereign risk reporting
- **Allowlist Support**: `attest()` for authorized attestors
- **EIP-712 Signatures**: `attestSigned()` for backend attestation
- **Version Management**: Automatic versioning for updates
- **Fee Mechanism**: Optional fee collection (currently 0)

### Key Functions
```solidity
function attestOpen(
    address wallet,
    bytes32 modelId,
    uint16 version,
    uint16 score,
    uint16 confidence,
    uint16 concentration,
    uint16 stable,
    uint16 activity,
    string calldata tag
) external payable;
```

## 🌊 Polygon Buildathon Alignment

### 📈 Current Wave Support: **Wave 1-5 COMPLETE**

Our project is **fully production-ready** and supports all Phase 1 waves:

#### ✅ **Wave 1-2: Foundation & Setup** (COMPLETE)
- ✅ Polygon mainnet integration live
- ✅ Smart contract deployed: `0x35d818492803865b20804C8D60a149519B215b37`
- ✅ Technical infrastructure operational
- ✅ Product-market fit validated with live users

#### ✅ **Wave 3-4: Build & Optimize** (COMPLETE)
- ✅ Full feature set implemented (risk analysis + on-chain attestation)
- ✅ User acquisition started (live at portfolioguardian.coinsspor.com)
- ✅ Business model defined (B2B SaaS + Premium features)
- ✅ UI/UX optimized with interactive visualizations

#### ✅ **Wave 5: Pitch & Raise** (READY)
- ✅ Demo video published
- ✅ VC pitch deck prepared
- ✅ Live product demonstration available
- ✅ Metrics and traction documented

### 🚀 Phase 2 Readiness
We're prepared for immediate Phase 2 expansion based on funding outcomes:
- Scale existing AI risk analysis across multiple chains
- Expand into predictive analytics and automated alerts
- B2B enterprise integrations

### Business Model
- **B2B SaaS**: Risk API for DeFi protocols ($99-999/month)
- **Premium Features**: Advanced analytics, historical data, alerts
- **Token Integration**: Future governance token for protocol decisions

### Market Opportunity
- **TAM**: $50B+ DeFi TVL requires risk management
- **SAM**: $5B in actively managed DeFi portfolios
- **SOM**: 10,000 power users in first year

## 🎯 Roadmap

### Q1 2025 (Current)
- ✅ Launch on Polygon Mainnet
- ✅ Core risk analysis engine
- ✅ On-chain attestation system
- 🔄 Mobile app development (in progress)

### Q2 2025
- [ ] AI model improvements with ML training
- [ ] Multi-chain expansion (Ethereum, Arbitrum)
- [ ] B2B API launch with tiered pricing
- [ ] Series A fundraising ($3-5M target)

### Q3 2025
- [ ] Governance token launch
- [ ] Advanced analytics dashboard
- [ ] Institutional features
- [ ] Global expansion to Asian markets

## 🤝 Team

- **Project Lead**: DeFi risk analysis expert with 5+ years experience
- **Full-Stack Development**: Next.js, Node.js, Solidity specialist
- **Polygon Integration**: Mainnet optimization and scaling expert

## 🛡️ Security

- Smart contract reviewed for security best practices
- Self-attestation mechanism prevents score manipulation
- No custody of user funds or private keys
- Fully open-source for transparency

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- **Polygon Team**: For ecosystem support and mentorship
- **AKINDO**: For organizing the Buildathon
- **Covalent & Polygonscan**: For reliable blockchain data APIs
- **Community**: For feedback and testing

## 📞 Contact & Support

- **Live Demo**: [https://portfolioguardian.coinsspor.com/](https://portfolioguardian.coinsspor.com/)
- **GitHub**: [AI-Portfolio-Guardian](https://github.com/yourusername/AI-Portfolio-Guardian)
- **Email**: coinsspor@gmail.com
- **Twitter**: [@coinsspor](https://twitter.com/coinsspor)

---

**Built with ❤️ for Polygon Buildathon**

*From Launch to Fundraising - Building the Future of DeFi Risk Management*
