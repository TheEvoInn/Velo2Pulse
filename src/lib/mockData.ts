// VELO 2.0 - Mock Data & localStorage persistence

import type {
  User, ProfitEngine, Autopilot, Opportunity, Task, WalletTransaction,
  Credential, WalletSummary, CryptoTask, WalletAddress, DropshipProduct,
  DropshipOrder, DropshipSupplier, AutomationSession, MatchScore
} from '@/types';

// ─── Auth ────────────────────────────────────────────────────────────────────
export const MOCK_USER: User = {
  id: 'usr_001',
  email: 'commander@velo2.io',
  name: 'Commander Rex',
  role: 'owner',
  inviteCode: 'VELO-ALPHA-7',
  createdAt: '2026-01-01T00:00:00Z',
};

const VALID_INVITE_CODES = ['VELO-ALPHA-7', 'VELO-BETA-9', 'VELO-GAMMA-3'];

export function checkInviteCode(code: string): boolean {
  return VALID_INVITE_CODES.includes(code.toUpperCase().trim());
}

export function getStoredAuth(): User | null {
  try {
    const raw = localStorage.getItem('velo_auth');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function storeAuth(user: User): void {
  localStorage.setItem('velo_auth', JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem('velo_auth');
}

// ─── Profit Engines ────────────────────────────────────────────────────────
const DEFAULT_ENGINES: ProfitEngine[] = [
  {
    id: 'eng_001',
    name: 'Freelance Blitz',
    goal: 'Win 5 writing gigs per week on Upwork and Fiverr',
    config: { platforms: ['upwork', 'fiverr'], maxBid: 50 },
    audience: 'Small businesses needing content',
    channels: ['upwork', 'fiverr'],
    status: 'active',
    totalEarned: 1247.50,
    runsCompleted: 34,
    lastRun: new Date(Date.now() - 3600000).toISOString(),
    createdAt: '2026-01-15T00:00:00Z',
    category: 'freelance',
  },
  {
    id: 'eng_002',
    name: 'Crypto Airdrop Hunter',
    goal: 'Claim all eligible airdrops and testnet rewards',
    config: { networks: ['ethereum', 'solana', 'arbitrum'], minValue: 10 },
    audience: 'DeFi protocols launching tokens',
    channels: ['twitter', 'discord', 'on-chain'],
    status: 'running',
    totalEarned: 892.00,
    runsCompleted: 21,
    lastRun: new Date(Date.now() - 900000).toISOString(),
    createdAt: '2026-02-01T00:00:00Z',
    category: 'crypto',
  },
  {
    id: 'eng_003',
    name: 'Micro-Task Grinder',
    goal: 'Complete 20+ micro-tasks daily across platforms',
    config: { platforms: ['amazon_mturk', 'clickworker'], minPay: 0.5 },
    audience: 'Task requesters on micro-platforms',
    channels: ['mturk', 'clickworker'],
    status: 'paused',
    totalEarned: 456.25,
    runsCompleted: 89,
    lastRun: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdAt: '2026-02-10T00:00:00Z',
    category: 'gig',
  },
  {
    id: 'eng_004',
    name: 'DropShip Nexus',
    goal: 'Research, list, and sell 10+ products on Shopify/eBay',
    config: { platforms: ['shopify', 'ebay'], maxCost: 25 },
    audience: 'Online shoppers seeking deals',
    channels: ['shopify', 'ebay', 'amazon'],
    status: 'active',
    totalEarned: 743.80,
    runsCompleted: 17,
    lastRun: new Date(Date.now() - 7200000).toISOString(),
    createdAt: '2026-03-01T00:00:00Z',
    category: 'dropshipping',
  },
];

export function getEngines(): ProfitEngine[] {
  try {
    const raw = localStorage.getItem('velo_engines');
    return raw ? JSON.parse(raw) : DEFAULT_ENGINES;
  } catch { return DEFAULT_ENGINES; }
}

export function saveEngines(engines: ProfitEngine[]): void {
  localStorage.setItem('velo_engines', JSON.stringify(engines));
}

// ─── Autopilots ────────────────────────────────────────────────────────────
const DEFAULT_AUTOPILOTS: Autopilot[] = [
  {
    id: 'apt_001',
    name: 'ARIA-7',
    avatar: '🤖',
    persona: 'Senior copywriter with 8 years experience in B2B SaaS',
    tone: 'professional',
    status: 'active',
    engineId: 'eng_001',
    skills: ['copywriting', 'SEO', 'email marketing', 'content strategy'],
    allowedCategories: ['freelance', 'gig'],
    workloadLimit: 8,
    currentWorkload: 3,
    totalEarned: 847.50,
    tasksCompleted: 23,
    createdAt: '2026-01-15T00:00:00Z',
    behaviorRules: ['Never accept fixed-price < $30', 'Always request milestone payments'],
  },
  {
    id: 'apt_002',
    name: 'CRYPTO-X',
    avatar: '🛸',
    persona: 'Blockchain enthusiast and DeFi researcher',
    tone: 'technical',
    status: 'running',
    engineId: 'eng_002',
    skills: ['blockchain', 'defi', 'smart contracts', 'web3'],
    allowedCategories: ['crypto', 'bounty'],
    workloadLimit: 15,
    currentWorkload: 7,
    totalEarned: 892.00,
    tasksCompleted: 21,
    createdAt: '2026-02-01T00:00:00Z',
    behaviorRules: ['Only interact with audited contracts', 'Max gas: 0.01 ETH'],
  },
  {
    id: 'apt_003',
    name: 'MERCH-BOT',
    avatar: '🚀',
    persona: 'E-commerce specialist and product sourcing expert',
    tone: 'friendly',
    status: 'idle',
    engineId: 'eng_004',
    skills: ['product research', 'e-commerce', 'supplier negotiation', 'listing optimization'],
    allowedCategories: ['dropshipping', 'gig'],
    workloadLimit: 12,
    currentWorkload: 2,
    totalEarned: 743.80,
    tasksCompleted: 17,
    createdAt: '2026-03-01T00:00:00Z',
    behaviorRules: ['Min margin 30%', 'Only verified suppliers', 'Max product cost $25'],
  },
];

export function getAutopilots(): Autopilot[] {
  try {
    const raw = localStorage.getItem('velo_autopilots');
    return raw ? JSON.parse(raw) : DEFAULT_AUTOPILOTS;
  } catch { return DEFAULT_AUTOPILOTS; }
}

export function saveAutopilots(autopilots: Autopilot[]): void {
  localStorage.setItem('velo_autopilots', JSON.stringify(autopilots));
}

// ─── Opportunities ─────────────────────────────────────────────────────────
export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp_001',
    title: 'Blog Writer for SaaS Company — 5 articles/week',
    platform: 'Upwork',
    category: 'freelance',
    estimatedValue: 200,
    currency: 'USD',
    effort: 'medium',
    deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
    requirements: ['Writing samples', 'SEO knowledge', 'English native'],
    confidence: 'high',
    url: 'https://upwork.com',
    status: 'matched',
    matchedAutopilotId: 'apt_001',
    scannedAt: new Date(Date.now() - 1800000).toISOString(),
    description: 'Looking for experienced blog writer to create 5 SEO-optimized articles per week about SaaS tools.',
  },
  {
    id: 'opp_002',
    title: 'Arbitrum Odyssey Testnet — 45 USDC Reward',
    platform: 'Arbitrum Foundation',
    category: 'crypto',
    estimatedValue: 45,
    currency: 'USDC',
    effort: 'low',
    deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
    requirements: ['ETH wallet', 'Testnet ETH', 'Discord account'],
    confidence: 'high',
    url: 'https://arbitrum.io',
    status: 'applied',
    matchedAutopilotId: 'apt_002',
    scannedAt: new Date(Date.now() - 3600000).toISOString(),
    description: 'Complete 3 testnet transactions on Arbitrum Odyssey to claim USDC rewards.',
  },
  {
    id: 'opp_003',
    title: 'Product Description Writer — Shopify Store',
    platform: 'Fiverr',
    category: 'freelance',
    estimatedValue: 75,
    currency: 'USD',
    effort: 'low',
    requirements: ['E-commerce experience', 'Copywriting'],
    confidence: 'high',
    url: 'https://fiverr.com',
    status: 'new',
    scannedAt: new Date(Date.now() - 600000).toISOString(),
    description: 'Need 20 product descriptions for a Shopify fashion store.',
  },
  {
    id: 'opp_004',
    title: 'LayerZero Airdrop — Complete Bridge Tasks',
    platform: 'LayerZero',
    category: 'crypto',
    estimatedValue: 120,
    currency: 'USD',
    effort: 'medium',
    requirements: ['EVM wallet', 'Min 0.01 ETH'],
    confidence: 'medium',
    url: 'https://layerzero.network',
    status: 'new',
    scannedAt: new Date(Date.now() - 900000).toISOString(),
    description: 'Potential airdrop for users who bridge assets across 5+ chains using LayerZero protocol.',
  },
  {
    id: 'opp_005',
    title: 'Remote Content Moderator — $18/hr',
    platform: 'RemoteOK',
    category: 'remote_job',
    estimatedValue: 18,
    currency: 'USD/hr',
    effort: 'medium',
    requirements: ['English proficiency', '2+ years experience'],
    confidence: 'medium',
    url: 'https://remoteok.com',
    status: 'new',
    scannedAt: new Date(Date.now() - 1200000).toISOString(),
    description: 'Part-time content moderation for a social media platform. 20 hrs/week.',
  },
  {
    id: 'opp_006',
    title: 'ClickWorker Image Labeling Batch',
    platform: 'ClickWorker',
    category: 'gig',
    estimatedValue: 12,
    currency: 'USD',
    effort: 'low',
    requirements: ['ClickWorker account'],
    confidence: 'high',
    url: 'https://clickworker.com',
    status: 'in_progress',
    matchedAutopilotId: 'apt_001',
    scannedAt: new Date(Date.now() - 7200000).toISOString(),
    description: '500 image labeling tasks at $0.024 each.',
  },
  {
    id: 'opp_007',
    title: 'Winning Product Research — $35 Bounty',
    platform: 'Bounty Hunt',
    category: 'dropshipping',
    estimatedValue: 35,
    currency: 'USD',
    effort: 'low',
    requirements: ['AliExpress account', 'Market research skills'],
    confidence: 'high',
    url: 'https://bountyhunt.io',
    status: 'new',
    scannedAt: new Date(Date.now() - 2400000).toISOString(),
    description: 'Research 5 winning products in the fitness niche using Aliexpress and Google Trends.',
  },
  {
    id: 'opp_008',
    title: 'zkSync Era Testnet Campaign',
    platform: 'zkSync',
    category: 'crypto',
    estimatedValue: 200,
    currency: 'USD',
    effort: 'medium',
    requirements: ['EVM wallet', 'ETH for bridging'],
    confidence: 'high',
    url: 'https://zksync.io',
    status: 'new',
    scannedAt: new Date(Date.now() - 5400000).toISOString(),
    description: 'Complete 10+ transactions on zkSync Era testnet for eligibility in upcoming ZK token airdrop.',
  },
];

export function getOpportunities(): Opportunity[] {
  try {
    const raw = localStorage.getItem('velo_opportunities');
    return raw ? JSON.parse(raw) : MOCK_OPPORTUNITIES;
  } catch { return MOCK_OPPORTUNITIES; }
}

export function saveOpportunities(opportunities: Opportunity[]): void {
  localStorage.setItem('velo_opportunities', JSON.stringify(opportunities));
}

// ─── Tasks ─────────────────────────────────────────────────────────────────
export const DEFAULT_TASKS: Task[] = [
  {
    id: 'task_001',
    name: 'Apply to Upwork Blog Writing Gig',
    type: 'application',
    status: 'completed',
    autopilotId: 'apt_001',
    opportunityId: 'opp_001',
    priority: 1,
    progress: 100,
    logs: [
      { timestamp: new Date(Date.now() - 7200000).toISOString(), level: 'info', message: 'Navigating to Upwork opportunity page...' },
      { timestamp: new Date(Date.now() - 7100000).toISOString(), level: 'info', message: 'Generating cover letter with ARIA-7 persona...' },
      { timestamp: new Date(Date.now() - 7000000).toISOString(), level: 'success', message: 'Application submitted successfully. Bid: $45' },
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    startedAt: new Date(Date.now() - 7200000).toISOString(),
    completedAt: new Date(Date.now() - 7000000).toISOString(),
    retries: 0,
  },
  {
    id: 'task_002',
    name: 'Arbitrum Testnet Bridge Transaction',
    type: 'crypto_task',
    status: 'running',
    autopilotId: 'apt_002',
    opportunityId: 'opp_002',
    priority: 1,
    progress: 60,
    logs: [
      { timestamp: new Date(Date.now() - 900000).toISOString(), level: 'info', message: 'Connecting to Arbitrum testnet...' },
      { timestamp: new Date(Date.now() - 850000).toISOString(), level: 'info', message: 'Initiating bridge transaction...' },
      { timestamp: new Date(Date.now() - 800000).toISOString(), level: 'info', message: 'Transaction 1/3 confirmed. TX: 0xabc...def' },
    ],
    createdAt: new Date(Date.now() - 900000).toISOString(),
    startedAt: new Date(Date.now() - 900000).toISOString(),
    retries: 0,
  },
  {
    id: 'task_003',
    name: 'Scan Freelance Platforms for New Opportunities',
    type: 'scan',
    status: 'queued',
    priority: 2,
    progress: 0,
    logs: [],
    createdAt: new Date(Date.now() - 300000).toISOString(),
    retries: 0,
  },
  {
    id: 'task_004',
    name: 'Generate Resume for Remote Job Application',
    type: 'content_generation',
    status: 'queued',
    autopilotId: 'apt_001',
    priority: 3,
    progress: 0,
    logs: [],
    createdAt: new Date(Date.now() - 600000).toISOString(),
    retries: 0,
  },
  {
    id: 'task_005',
    name: 'AliExpress Product Research — Fitness Niche',
    type: 'research',
    status: 'completed',
    autopilotId: 'apt_003',
    opportunityId: 'opp_007',
    priority: 2,
    progress: 100,
    logs: [
      { timestamp: new Date(Date.now() - 3600000).toISOString(), level: 'info', message: 'Navigating to AliExpress fitness category...' },
      { timestamp: new Date(Date.now() - 3400000).toISOString(), level: 'info', message: 'Scanning top 100 products by orders...' },
      { timestamp: new Date(Date.now() - 3200000).toISOString(), level: 'info', message: 'Extracting: price, supplier rating, shipping time...' },
      { timestamp: new Date(Date.now() - 3000000).toISOString(), level: 'success', message: '12 winning products identified. Avg margin: 68%' },
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: new Date(Date.now() - 3000000).toISOString(),
    retries: 0,
  },
  {
    id: 'task_006',
    name: 'zkSync Era — Execute Testnet Transactions',
    type: 'crypto_task',
    status: 'queued',
    autopilotId: 'apt_002',
    opportunityId: 'opp_008',
    priority: 2,
    progress: 0,
    logs: [],
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    retries: 0,
  },
];

export function getTasks(): Task[] {
  try {
    const raw = localStorage.getItem('velo_tasks');
    return raw ? JSON.parse(raw) : DEFAULT_TASKS;
  } catch { return DEFAULT_TASKS; }
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem('velo_tasks', JSON.stringify(tasks));
}

// ─── Wallet ────────────────────────────────────────────────────────────────
export const DEFAULT_TRANSACTIONS: WalletTransaction[] = [
  { id: 'tx_001', type: 'earning', amount: 200, currency: 'USD', description: 'Upwork Blog Writing - Client: TechStartup Inc', status: 'confirmed', relatedTaskId: 'task_001', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'tx_002', type: 'earning', amount: 45, currency: 'USDC', description: 'Arbitrum Odyssey Testnet Reward', status: 'confirmed', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'tx_003', type: 'earning', amount: 75, currency: 'USD', description: 'Fiverr Product Descriptions - 20 items', status: 'confirmed', createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: 'tx_004', type: 'withdrawal', amount: -100, currency: 'USD', description: 'Withdrawal to Bank Account', status: 'confirmed', createdAt: new Date(Date.now() - 432000000).toISOString() },
  { id: 'tx_005', type: 'earning', amount: 120, currency: 'USD', description: 'LayerZero Airdrop Claim', status: 'pending', createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'tx_006', type: 'earning', amount: 12, currency: 'USD', description: 'ClickWorker Image Labeling Batch', status: 'confirmed', createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: 'tx_007', type: 'earning', amount: 248.50, currency: 'USD', description: 'DropShip Nexus — 8 orders fulfilled', status: 'confirmed', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'tx_008', type: 'bonus', amount: 50, currency: 'USD', description: 'Platform reward: 100 tasks milestone bonus', status: 'confirmed', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
];

export const DEFAULT_WALLET: WalletSummary = {
  totalEarned: 3339.55,
  availableBalance: 3239.55,
  pendingEarnings: 120,
  totalWithdrawn: 100,
  currency: 'USD',
};

export function getWallet(): WalletSummary {
  try {
    const raw = localStorage.getItem('velo_wallet');
    return raw ? JSON.parse(raw) : DEFAULT_WALLET;
  } catch { return DEFAULT_WALLET; }
}

export function getTransactions(): WalletTransaction[] {
  try {
    const raw = localStorage.getItem('velo_transactions');
    return raw ? JSON.parse(raw) : DEFAULT_TRANSACTIONS;
  } catch { return DEFAULT_TRANSACTIONS; }
}

export function saveWallet(wallet: WalletSummary): void {
  localStorage.setItem('velo_wallet', JSON.stringify(wallet));
}

export function saveTransactions(txs: WalletTransaction[]): void {
  localStorage.setItem('velo_transactions', JSON.stringify(txs));
}

// ─── Credentials ──────────────────────────────────────────────────────────
export const DEFAULT_CREDENTIALS = [
  { id: 'cred_001', name: 'Upwork Account', type: 'login' as const, platform: 'Upwork', isEncrypted: true, lastAccessed: new Date(Date.now() - 3600000).toISOString(), createdAt: '2026-01-15T00:00:00Z' },
  { id: 'cred_002', name: 'Fiverr Account', type: 'login' as const, platform: 'Fiverr', isEncrypted: true, lastAccessed: new Date(Date.now() - 7200000).toISOString(), createdAt: '2026-01-15T00:00:00Z' },
  { id: 'cred_003', name: 'MetaMask Wallet Key', type: 'wallet_key' as const, platform: 'Ethereum', isEncrypted: true, lastAccessed: new Date(Date.now() - 900000).toISOString(), createdAt: '2026-02-01T00:00:00Z' },
  { id: 'cred_004', name: 'Portfolio PDF', type: 'work_sample' as const, isEncrypted: false, createdAt: '2026-01-20T00:00:00Z' },
  { id: 'cred_005', name: 'ClickWorker API Key', type: 'api_key' as const, platform: 'ClickWorker', isEncrypted: true, createdAt: '2026-02-10T00:00:00Z' },
  { id: 'cred_006', name: 'Shopify Store Key', type: 'api_key' as const, platform: 'Shopify', isEncrypted: true, lastAccessed: new Date(Date.now() - 1800000).toISOString(), createdAt: '2026-03-01T00:00:00Z' },
  { id: 'cred_007', name: 'zkSync Wallet', type: 'wallet_key' as const, platform: 'zkSync', isEncrypted: true, createdAt: '2026-03-05T00:00:00Z' },
];

export function getCredentials() {
  try {
    const raw = localStorage.getItem('velo_credentials');
    return raw ? JSON.parse(raw) : DEFAULT_CREDENTIALS;
  } catch { return DEFAULT_CREDENTIALS; }
}

export function saveCredentials(creds: unknown[]): void {
  localStorage.setItem('velo_credentials', JSON.stringify(creds));
}

// ─── Crypto Tasks ─────────────────────────────────────────────────────────
export const DEFAULT_CRYPTO_TASKS: CryptoTask[] = [
  {
    id: 'ct_001',
    title: 'Arbitrum Odyssey Season 3',
    protocol: 'Arbitrum Foundation',
    network: 'Arbitrum One',
    type: 'testnet',
    estimatedValue: 450,
    currency: 'ARB',
    status: 'in_progress',
    requirements: ['ETH wallet', 'Arbitrum ETH', 'Discord role'],
    steps: ['Bridge ETH to Arbitrum', 'Swap tokens on GMX', 'Provide liquidity on Camelot', 'Claim NFT badge'],
    deadline: new Date(Date.now() + 86400000 * 12).toISOString(),
    eligibility: 'eligible',
    walletRequired: true,
    gasRequired: '~0.005 ETH',
    confidence: 'high',
    description: 'Complete the Season 3 Odyssey campaign to qualify for ARB token distribution.',
    url: 'https://arbitrum.io/odyssey',
  },
  {
    id: 'ct_002',
    title: 'zkSync Era Airdrop Campaign',
    protocol: 'zkSync / Matter Labs',
    network: 'zkSync Era',
    type: 'airdrop',
    estimatedValue: 800,
    currency: 'ZK',
    status: 'active',
    requirements: ['EVM wallet', '0.01+ ETH', 'Bridge activity'],
    steps: ['Bridge ETH via official bridge', 'Mint zkSync domain', 'Swap on SyncSwap', 'Interact with 5+ protocols'],
    deadline: new Date(Date.now() + 86400000 * 25).toISOString(),
    eligibility: 'eligible',
    walletRequired: true,
    gasRequired: '~0.015 ETH',
    confidence: 'high',
    description: 'High-confidence airdrop for users with significant zkSync Era activity.',
    url: 'https://zksync.io',
  },
  {
    id: 'ct_003',
    title: 'Starknet Alpha Airdrop',
    protocol: 'StarkWare',
    network: 'Starknet',
    type: 'airdrop',
    estimatedValue: 300,
    currency: 'STRK',
    status: 'active',
    requirements: ['Starknet wallet', 'Cairo contract interaction'],
    steps: ['Deploy Argent X wallet', 'Bridge via StarkGate', 'Use Avnu DEX', 'Mint a Starknet ID'],
    deadline: new Date(Date.now() + 86400000 * 18).toISOString(),
    eligibility: 'checking',
    walletRequired: true,
    gasRequired: '~$2-5',
    confidence: 'medium',
    description: 'Interact with Starknet ecosystem to qualify for STRK token airdrop.',
    url: 'https://starknet.io',
  },
  {
    id: 'ct_004',
    title: 'Lens Protocol Social Quest',
    protocol: 'Lens Protocol',
    network: 'Polygon',
    type: 'quest',
    estimatedValue: 50,
    currency: 'MATIC',
    status: 'active',
    requirements: ['Lens profile', 'MATIC for gas'],
    steps: ['Create Lens profile', 'Post 5 times', 'Follow 10 accounts', 'Mirror 3 posts'],
    eligibility: 'eligible',
    walletRequired: true,
    gasRequired: '~$1',
    confidence: 'high',
    description: 'Social engagement quest on Lens Protocol with MATIC rewards.',
    url: 'https://lens.xyz',
  },
  {
    id: 'ct_005',
    title: 'Optimism Superchain Free Mint',
    protocol: 'Optimism Collective',
    network: 'Optimism',
    type: 'free_mint',
    estimatedValue: 30,
    currency: 'OP',
    status: 'upcoming',
    requirements: ['OP wallet', 'Optimism ETH'],
    steps: ['Connect wallet', 'Mint Superchain NFT', 'Share on X'],
    deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
    eligibility: 'unknown',
    walletRequired: true,
    gasRequired: '~0.001 ETH',
    confidence: 'medium',
    description: 'Free mint for early Optimism community members.',
    url: 'https://optimism.io',
  },
  {
    id: 'ct_006',
    title: 'LayerZero OFT Bounty',
    protocol: 'LayerZero',
    network: 'Multi-chain',
    type: 'bounty',
    estimatedValue: 150,
    currency: 'USD',
    status: 'active',
    requirements: ['Developer skills', 'OFT deployment'],
    steps: ['Deploy OFT token', 'Enable 3+ chains', 'Document deployment', 'Submit for review'],
    eligibility: 'eligible',
    walletRequired: true,
    confidence: 'high',
    description: 'Build and deploy an OFT (Omnichain Fungible Token) across 3+ chains.',
    url: 'https://layerzero.network/bounties',
  },
];

export function getCryptoTasks(): CryptoTask[] {
  try {
    const raw = localStorage.getItem('velo_crypto_tasks');
    return raw ? JSON.parse(raw) : DEFAULT_CRYPTO_TASKS;
  } catch { return DEFAULT_CRYPTO_TASKS; }
}

export function saveCryptoTasks(tasks: CryptoTask[]): void {
  localStorage.setItem('velo_crypto_tasks', JSON.stringify(tasks));
}

// ─── Wallet Addresses ─────────────────────────────────────────────────────
export const DEFAULT_WALLET_ADDRESSES: WalletAddress[] = [
  { id: 'wa_001', label: 'Main ETH Wallet', address: '0x1a2b3c4d5e6f...7890', network: 'Ethereum', balance: '0.847 ETH', isDefault: true },
  { id: 'wa_002', label: 'Arbitrum Wallet', address: '0x1a2b3c4d5e6f...7890', network: 'Arbitrum', balance: '0.234 ETH', isDefault: false },
  { id: 'wa_003', label: 'zkSync Wallet', address: '0xabc123def456...9012', network: 'zkSync Era', balance: '0.052 ETH', isDefault: false },
  { id: 'wa_004', label: 'Polygon Wallet', address: '0xdef456abc789...3456', network: 'Polygon', balance: '245 MATIC', isDefault: false },
];

export function getWalletAddresses(): WalletAddress[] {
  try {
    const raw = localStorage.getItem('velo_wallet_addresses');
    return raw ? JSON.parse(raw) : DEFAULT_WALLET_ADDRESSES;
  } catch { return DEFAULT_WALLET_ADDRESSES; }
}

export function saveWalletAddresses(addresses: WalletAddress[]): void {
  localStorage.setItem('velo_wallet_addresses', JSON.stringify(addresses));
}

// ─── Dropship Products ────────────────────────────────────────────────────
export const DEFAULT_DROPSHIP_PRODUCTS: DropshipProduct[] = [
  {
    id: 'dp_001',
    name: 'Resistance Band Set (11-piece)',
    category: 'Fitness',
    supplier: 'FitGear Pro',
    supplierUrl: 'https://aliexpress.com',
    costPrice: 4.80,
    sellingPrice: 19.99,
    margin: 75,
    platform: 'Shopify',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    salesCount: 47,
    revenue: 939.53,
    description: 'Premium 11-piece resistance band set for home workouts. Includes door anchor and handles.',
    tags: ['fitness', 'home gym', 'resistance training'],
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'dp_002',
    name: 'LED Ring Light 10 inch',
    category: 'Photography',
    supplier: 'TechSource',
    supplierUrl: 'https://aliexpress.com',
    costPrice: 8.50,
    sellingPrice: 34.99,
    margin: 75,
    platform: 'eBay',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1516724562728-afc824a36e84?w=200&h=200&fit=crop',
    salesCount: 31,
    revenue: 1084.69,
    description: '10-inch LED ring light with adjustable brightness and color temperature for content creators.',
    tags: ['photography', 'content creator', 'lighting'],
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 'dp_003',
    name: 'Posture Corrector Belt',
    category: 'Health',
    supplier: 'WellnessPlus',
    supplierUrl: 'https://aliexpress.com',
    costPrice: 3.20,
    sellingPrice: 15.99,
    margin: 79,
    platform: 'Shopify',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop',
    salesCount: 62,
    revenue: 991.38,
    description: 'Adjustable posture corrector for back and shoulder support during work hours.',
    tags: ['health', 'posture', 'office'],
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'dp_004',
    name: 'Wireless Charging Pad 15W',
    category: 'Electronics',
    supplier: 'ChargeTech HK',
    supplierUrl: 'https://aliexpress.com',
    costPrice: 5.10,
    sellingPrice: 22.99,
    margin: 77,
    platform: 'Amazon',
    status: 'researching',
    imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&h=200&fit=crop',
    salesCount: 0,
    revenue: 0,
    description: 'Fast wireless charging pad compatible with all Qi-enabled devices.',
    tags: ['electronics', 'wireless', 'charging'],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export function getDropshipProducts(): DropshipProduct[] {
  try {
    const raw = localStorage.getItem('velo_dropship_products');
    return raw ? JSON.parse(raw) : DEFAULT_DROPSHIP_PRODUCTS;
  } catch { return DEFAULT_DROPSHIP_PRODUCTS; }
}

export function saveDropshipProducts(products: DropshipProduct[]): void {
  localStorage.setItem('velo_dropship_products', JSON.stringify(products));
}

// ─── Dropship Orders ──────────────────────────────────────────────────────
export const DEFAULT_DROPSHIP_ORDERS: DropshipOrder[] = [
  { id: 'do_001', productId: 'dp_001', productName: 'Resistance Band Set', customer: 'John D.', quantity: 2, revenue: 39.98, cost: 9.60, profit: 30.38, status: 'delivered', platform: 'Shopify', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), shippedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'do_002', productId: 'dp_002', productName: 'LED Ring Light', customer: 'Sarah M.', quantity: 1, revenue: 34.99, cost: 8.50, profit: 26.49, status: 'shipped', platform: 'eBay', createdAt: new Date(Date.now() - 86400000).toISOString(), shippedAt: new Date(Date.now() - 43200000).toISOString() },
  { id: 'do_003', productId: 'dp_003', productName: 'Posture Corrector', customer: 'Mike R.', quantity: 1, revenue: 15.99, cost: 3.20, profit: 12.79, status: 'processing', platform: 'Shopify', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'do_004', productId: 'dp_001', productName: 'Resistance Band Set', customer: 'Emily K.', quantity: 1, revenue: 19.99, cost: 4.80, profit: 15.19, status: 'pending', platform: 'Shopify', createdAt: new Date(Date.now() - 1800000).toISOString() },
];

export function getDropshipOrders(): DropshipOrder[] {
  try {
    const raw = localStorage.getItem('velo_dropship_orders');
    return raw ? JSON.parse(raw) : DEFAULT_DROPSHIP_ORDERS;
  } catch { return DEFAULT_DROPSHIP_ORDERS; }
}

export function saveDropshipOrders(orders: DropshipOrder[]): void {
  localStorage.setItem('velo_dropship_orders', JSON.stringify(orders));
}

// ─── Dropship Suppliers ───────────────────────────────────────────────────
export const DEFAULT_SUPPLIERS: DropshipSupplier[] = [
  { id: 'sup_001', name: 'FitGear Pro', url: 'https://aliexpress.com/store/fitgearpro', country: 'China', rating: 4.8, minOrder: 1, shippingTime: '7-15 days', categories: ['Fitness', 'Sports', 'Health'], productsFound: 847 },
  { id: 'sup_002', name: 'TechSource HK', url: 'https://aliexpress.com/store/techsource', country: 'Hong Kong', rating: 4.9, minOrder: 1, shippingTime: '5-12 days', categories: ['Electronics', 'Gadgets', 'Photography'], productsFound: 1243 },
  { id: 'sup_003', name: 'WellnessPlus', url: 'https://aliexpress.com/store/wellness', country: 'China', rating: 4.7, minOrder: 1, shippingTime: '8-18 days', categories: ['Health', 'Beauty', 'Home'], productsFound: 523 },
  { id: 'sup_004', name: 'HomeDecor Co', url: 'https://aliexpress.com/store/homedecor', country: 'China', rating: 4.6, minOrder: 2, shippingTime: '10-20 days', categories: ['Home', 'Kitchen', 'Office'], productsFound: 2100 },
];

export function getSuppliers(): DropshipSupplier[] {
  return DEFAULT_SUPPLIERS;
}

// ─── Match Scores ─────────────────────────────────────────────────────────
export const DEFAULT_MATCH_SCORES: MatchScore[] = [
  {
    opportunityId: 'opp_001',
    autopilotId: 'apt_001',
    totalScore: 94,
    skillScore: 95,
    categoryScore: 100,
    effortScore: 90,
    deadlineScore: 90,
    confidence: 'high',
    recommendation: 'top',
    reasons: ['Perfect skill match: copywriting, SEO', 'Category alignment: freelance', 'Workload available (3/8)', 'Deadline within 3 days — urgent'],
  },
  {
    opportunityId: 'opp_002',
    autopilotId: 'apt_002',
    totalScore: 98,
    skillScore: 100,
    categoryScore: 100,
    effortScore: 100,
    deadlineScore: 90,
    confidence: 'high',
    recommendation: 'top',
    reasons: ['Perfect match: blockchain, DeFi skills', 'Category: crypto — exclusive to CRYPTO-X', 'Low effort task — ideal for current workload', 'High ROI: 45 USDC for ~30min work'],
  },
  {
    opportunityId: 'opp_004',
    autopilotId: 'apt_002',
    totalScore: 82,
    skillScore: 90,
    categoryScore: 100,
    effortScore: 70,
    deadlineScore: 80,
    confidence: 'medium',
    recommendation: 'secondary',
    reasons: ['Good crypto match', 'Medium effort — manageable', 'Requires ETH capital for gas', 'Unconfirmed airdrop timeline'],
  },
  {
    opportunityId: 'opp_007',
    autopilotId: 'apt_003',
    totalScore: 91,
    skillScore: 95,
    categoryScore: 100,
    effortScore: 95,
    deadlineScore: 75,
    confidence: 'high',
    recommendation: 'top',
    reasons: ['MERCH-BOT specializes in product research', 'Low effort — quick bounty', 'Dropshipping category match', 'Builds supplier database for future use'],
  },
];

export function getMatchScores(): MatchScore[] {
  return DEFAULT_MATCH_SCORES;
}

// ─── Browser Automation Sessions ──────────────────────────────────────────
export const DEFAULT_AUTOMATION_SESSIONS: AutomationSession[] = [
  {
    id: 'as_001',
    name: 'Upwork Application — Blog Writer',
    platform: 'Upwork',
    status: 'completed',
    steps: [
      { id: 's1', description: 'Navigate to opportunity URL', status: 'completed', action: 'navigate', target: 'https://upwork.com/jobs/...', completedAt: new Date(Date.now() - 7000000).toISOString() },
      { id: 's2', description: 'Click "Apply Now" button', status: 'completed', action: 'click', target: '[data-test="apply-button"]', completedAt: new Date(Date.now() - 6990000).toISOString() },
      { id: 's3', description: 'Fill cover letter', status: 'completed', action: 'fill', target: '#cover-letter', value: 'ARIA-7 generated cover letter...', completedAt: new Date(Date.now() - 6980000).toISOString() },
      { id: 's4', description: 'Set bid amount: $45', status: 'completed', action: 'fill', target: '#bid-amount', value: '45', completedAt: new Date(Date.now() - 6970000).toISOString() },
      { id: 's5', description: 'Submit application', status: 'completed', action: 'submit', target: 'form#proposal-form', completedAt: new Date(Date.now() - 6960000).toISOString() },
    ],
    currentStep: 5,
    startedAt: new Date(Date.now() - 7200000).toISOString(),
    completedAt: new Date(Date.now() - 6960000).toISOString(),
    retries: 0,
  },
  {
    id: 'as_002',
    name: 'Arbitrum Bridge Transaction #2',
    platform: 'Arbitrum Bridge',
    status: 'running',
    steps: [
      { id: 's1', description: 'Navigate to Arbitrum bridge', status: 'completed', action: 'navigate', target: 'https://bridge.arbitrum.io', completedAt: new Date(Date.now() - 800000).toISOString() },
      { id: 's2', description: 'Connect MetaMask wallet', status: 'completed', action: 'click', target: '#connect-wallet', completedAt: new Date(Date.now() - 780000).toISOString() },
      { id: 's3', description: 'Enter bridge amount: 0.01 ETH', status: 'completed', action: 'fill', target: '#amount-input', completedAt: new Date(Date.now() - 760000).toISOString() },
      { id: 's4', description: 'Confirm transaction in MetaMask', status: 'running', action: 'click', target: '#confirm-bridge' },
      { id: 's5', description: 'Wait for transaction confirmation', status: 'pending', action: 'wait', value: '60000' },
      { id: 's6', description: 'Take confirmation screenshot', status: 'pending', action: 'screenshot' },
    ],
    currentStep: 3,
    startedAt: new Date(Date.now() - 900000).toISOString(),
    retries: 0,
  },
  {
    id: 'as_003',
    name: 'AliExpress Product Scraper',
    platform: 'AliExpress',
    status: 'completed',
    steps: [
      { id: 's1', description: 'Navigate to fitness category', status: 'completed', action: 'navigate', target: 'https://aliexpress.com/category/fitness', completedAt: new Date(Date.now() - 3200000).toISOString() },
      { id: 's2', description: 'Sort by orders (descending)', status: 'completed', action: 'click', completedAt: new Date(Date.now() - 3190000).toISOString() },
      { id: 's3', description: 'Extract top 50 products', status: 'completed', action: 'extract', completedAt: new Date(Date.now() - 3100000).toISOString() },
      { id: 's4', description: 'Filter: rating > 4.5, margin > 60%', status: 'completed', action: 'extract', completedAt: new Date(Date.now() - 3050000).toISOString() },
    ],
    currentStep: 4,
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: new Date(Date.now() - 3000000).toISOString(),
    retries: 0,
  },
];

export function getAutomationSessions(): AutomationSession[] {
  try {
    const raw = localStorage.getItem('velo_automation_sessions');
    return raw ? JSON.parse(raw) : DEFAULT_AUTOMATION_SESSIONS;
  } catch { return DEFAULT_AUTOMATION_SESSIONS; }
}

export function saveAutomationSessions(sessions: AutomationSession[]): void {
  localStorage.setItem('velo_automation_sessions', JSON.stringify(sessions));
}

// ─── Formatting helpers ───────────────────────────────────────────────────
export function formatCurrency(amount: number, currency = 'USD'): string {
  if (currency === 'USD' || currency === 'USD/hr') {
    return `$${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${Math.abs(amount).toFixed(2)} ${currency}`;
}

export function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function randomId(): string {
  return Math.random().toString(36).substring(2, 10);
}
