export interface SampleImage {
  id: string;
  name: string;
  description: string;
  category: string;
  dataUrl: string;
  width: number;
  height: number;
}

// Helper to convert SVG string to data URL
function svgToDataUrl(svgString: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString.trim())}`;
}

const DASHBOARD_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <rect width="1200" height="800" fill="#0f172a" />
  <!-- Sidebar -->
  <rect x="0" y="0" width="220" height="800" fill="#1e293b" />
  <circle cx="45" cy="40" r="14" fill="#38bdf8" />
  <text x="70" y="46" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="bold" font-size="18">NexusCloud</text>
  
  <rect x="20" y="90" width="180" height="38" rx="8" fill="#334155" />
  <text x="55" y="114" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="14" font-weight="600">📊 Overview</text>
  <text x="55" y="156" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="14">⚡ Analytics</text>
  <text x="55" y="198" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="14">👥 Customers</text>
  <text x="55" y="240" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="14">⚙️ Settings</text>
  <text x="55" y="282" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="14">🔒 Security (Confidential)</text>

  <!-- Top bar -->
  <rect x="220" y="0" width="980" height="65" fill="#1e293b" />
  <text x="250" y="40" fill="#f1f5f9" font-family="system-ui, sans-serif" font-weight="bold" font-size="20">Production Telemetry Dashboard</text>
  <rect x="980" y="18" width="180" height="32" rx="16" fill="#334155" />
  <circle cx="1000" cy="34" r="10" fill="#10b981" />
  <text x="1020" y="39" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="12">user@corporate.corp</text>

  <!-- Metric Cards -->
  <rect x="250" y="90" width="220" height="110" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1" />
  <text x="270" y="122" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13">Active Workloads</text>
  <text x="270" y="162" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="30" font-weight="bold">1,842</text>
  <text x="375" y="162" fill="#10b981" font-family="system-ui, sans-serif" font-size="13">+14.2%</text>

  <rect x="495" y="90" width="220" height="110" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1" />
  <text x="515" y="122" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13">Latency (p99)</text>
  <text x="515" y="162" fill="#f43f5e" font-family="system-ui, sans-serif" font-size="30" font-weight="bold">428ms</text>
  <text x="635" y="162" fill="#f43f5e" font-family="system-ui, sans-serif" font-size="13">ALERT</text>

  <rect x="740" y="90" width="220" height="110" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1" />
  <text x="760" y="122" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13">API Secret Key (Sensitive)</text>
  <text x="760" y="160" fill="#fbbf24" font-family="monospace" font-size="15">sk_live_9948271x8a</text>

  <rect x="985" y="90" width="180" height="110" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1" />
  <text x="1005" y="122" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13">Uptime SLA</text>
  <text x="1005" y="162" fill="#10b981" font-family="system-ui, sans-serif" font-size="30" font-weight="bold">99.98%</text>

  <!-- Big Chart -->
  <rect x="250" y="230" width="670" height="340" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1" />
  <text x="275" y="270" fill="#f1f5f9" font-family="system-ui, sans-serif" font-weight="600" font-size="16">Network Ingress / Egress Traffic (Gbps)</text>
  <!-- Chart Grid -->
  <line x1="280" y1="310" x2="880" y2="310" stroke="#334155" stroke-dasharray="4 4" />
  <line x1="280" y1="370" x2="880" y2="370" stroke="#334155" stroke-dasharray="4 4" />
  <line x1="280" y1="430" x2="880" y2="430" stroke="#334155" stroke-dasharray="4 4" />
  <line x1="280" y1="490" x2="880" y2="490" stroke="#334155" />
  <!-- Wave Path -->
  <path d="M 280 470 Q 350 420 420 440 T 560 360 T 700 390 T 820 320 L 880 340" fill="none" stroke="#38bdf8" stroke-width="3" />
  <path d="M 280 480 Q 350 460 420 470 T 560 410 T 700 450 T 820 410 L 880 430" fill="none" stroke="#a855f7" stroke-width="2" stroke-dasharray="6 4" />

  <!-- Side Incident List -->
  <rect x="945" y="230" width="220" height="340" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1" />
  <text x="965" y="270" fill="#f1f5f9" font-family="system-ui, sans-serif" font-weight="600" font-size="16">Live Incidents</text>
  <rect x="965" y="295" width="180" height="60" rx="6" fill="#450a0a" stroke="#dc2626" stroke-width="1" />
  <text x="975" y="318" fill="#fca5a5" font-family="system-ui, sans-serif" font-size="12" font-weight="bold">#INC-492: High Mem Leak</text>
  <text x="975" y="338" fill="#f87171" font-family="system-ui, sans-serif" font-size="11">Pod worker-node-04</text>

  <rect x="965" y="370" width="180" height="60" rx="6" fill="#1c1917" stroke="#78716c" stroke-width="1" />
  <text x="975" y="393" fill="#d6d3d1" font-family="system-ui, sans-serif" font-size="12" font-weight="bold">#INC-490: Deploy Succeeded</text>
  <text x="975" y="413" fill="#a8a29e" font-family="system-ui, sans-serif" font-size="11">Region us-east-1</text>

  <!-- Bottom Table -->
  <rect x="250" y="595" width="915" height="175" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1" />
  <text x="275" y="630" fill="#f1f5f9" font-family="system-ui, sans-serif" font-weight="600" font-size="15">Recent Audit Log & IP Sign-ins</text>
  <text x="275" y="665" fill="#94a3b8" font-family="monospace" font-size="13">2026-09-21 04:12:08 | root_admin | 192.168.4.120 | Auth Success | Token: jwt_98df8s77a</text>
  <text x="275" y="695" fill="#94a3b8" font-family="monospace" font-size="13">2026-09-21 04:15:32 | deploy_bot | 10.0.84.19 | Certificate Rotate | Fingerprint: SHA256:4f82</text>
  <text x="275" y="725" fill="#f43f5e" font-family="monospace" font-size="13">2026-09-21 04:22:11 | unknown_ip | 203.0.113.88 | FAILED PASSWORD ATTEMPT (x5)</text>
</svg>
`;

const ARCHITECTURE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 700" width="1100" height="700">
  <rect width="1100" height="700" fill="#0f172a" />
  <text x="550" y="50" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="24" font-weight="bold">Microservices High-Availability Architecture</text>
  
  <!-- Client Zone -->
  <rect x="60" y="160" width="160" height="340" rx="14" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
  <text x="140" y="200" text-anchor="middle" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="18" font-weight="bold">Client Tier</text>
  <rect x="80" y="240" width="120" height="50" rx="8" fill="#334155" />
  <text x="140" y="270" text-anchor="middle" fill="#f1f5f9" font-family="system-ui, sans-serif" font-size="13">Web React SPA</text>
  <rect x="80" y="320" width="120" height="50" rx="8" fill="#334155" />
  <text x="140" y="350" text-anchor="middle" fill="#f1f5f9" font-family="system-ui, sans-serif" font-size="13">Mobile iOS/Android</text>
  <rect x="80" y="400" width="120" height="50" rx="8" fill="#334155" />
  <text x="140" y="430" text-anchor="middle" fill="#f1f5f9" font-family="system-ui, sans-serif" font-size="13">Partner REST API</text>

  <!-- Gateway -->
  <rect x="300" y="220" width="150" height="220" rx="12" fill="#1e293b" stroke="#a855f7" stroke-width="2" />
  <text x="375" y="260" text-anchor="middle" fill="#c084fc" font-family="system-ui, sans-serif" font-size="16" font-weight="bold">API Gateway</text>
  <text x="375" y="300" text-anchor="middle" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="12">Auth & JWT</text>
  <text x="375" y="330" text-anchor="middle" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="12">Rate Limiting</text>
  <text x="375" y="360" text-anchor="middle" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="12">Reverse Proxy</text>

  <!-- Connectors -->
  <line x1="220" y1="330" x2="300" y2="330" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 4" />

  <!-- Services -->
  <rect x="540" y="120" width="180" height="80" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="630" y="155" text-anchor="middle" fill="#34d399" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">Auth Service</text>
  <text x="630" y="175" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">Port: 8081</text>

  <rect x="540" y="240" width="180" height="80" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="630" y="275" text-anchor="middle" fill="#34d399" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">Order Engine</text>
  <text x="630" y="295" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">Port: 8082 (Bottleneck)</text>

  <rect x="540" y="360" width="180" height="80" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="630" y="395" text-anchor="middle" fill="#34d399" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">Payment Processor</text>
  <text x="630" y="415" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">Stripe / Webhook</text>

  <rect x="540" y="480" width="180" height="80" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="630" y="515" text-anchor="middle" fill="#34d399" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">Notification Queue</text>
  <text x="630" y="535" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">Kafka Consumer</text>

  <!-- Connectors from Gateway to Services -->
  <line x1="450" y1="330" x2="540" y2="160" stroke="#64748b" stroke-width="2" />
  <line x1="450" y1="330" x2="540" y2="280" stroke="#64748b" stroke-width="2" />
  <line x1="450" y1="330" x2="540" y2="400" stroke="#64748b" stroke-width="2" />
  <line x1="450" y1="330" x2="540" y2="520" stroke="#64748b" stroke-width="2" />

  <!-- Data Tier -->
  <rect x="830" y="160" width="190" height="340" rx="14" fill="#1e293b" stroke="#f59e0b" stroke-width="2" />
  <text x="925" y="200" text-anchor="middle" fill="#fbbf24" font-family="system-ui, sans-serif" font-size="18" font-weight="bold">Persistence Tier</text>
  <rect x="855" y="235" width="140" height="55" rx="8" fill="#334155" />
  <text x="925" y="265" text-anchor="middle" fill="#f1f5f9" font-family="system-ui, sans-serif" font-size="13">PostgreSQL (Primary)</text>
  <rect x="855" y="315" width="140" height="55" rx="8" fill="#334155" />
  <text x="925" y="345" text-anchor="middle" fill="#f1f5f9" font-family="system-ui, sans-serif" font-size="13">Redis Cache Cluster</text>
  <rect x="855" y="395" width="140" height="55" rx="8" fill="#334155" />
  <text x="925" y="425" text-anchor="middle" fill="#f1f5f9" font-family="system-ui, sans-serif" font-size="13">S3 Object Bucket</text>

  <line x1="720" y1="280" x2="855" y2="265" stroke="#fbbf24" stroke-width="2" />
  <line x1="720" y1="400" x2="855" y2="265" stroke="#fbbf24" stroke-width="2" />
</svg>
`;

const DOCUMENT_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1050" width="800" height="1050">
  <rect width="800" height="1050" fill="#ffffff" />
  <!-- Header -->
  <rect x="50" y="50" width="700" height="110" fill="#f8fafc" rx="8" />
  <text x="80" y="95" fill="#0f172a" font-family="sans-serif" font-size="24" font-weight="bold">STATEMENT OF CONFIDENTIAL ACCOUNT</text>
  <text x="80" y="125" fill="#64748b" font-family="sans-serif" font-size="14">Invoice Ref: INV-2026-88392-CORP | Date: Sept 21, 2026</text>
  <rect x="620" y="70" width="100" height="30" rx="4" fill="#fee2e2" />
  <text x="670" y="90" text-anchor="middle" fill="#991b1b" font-family="sans-serif" font-size="12" font-weight="bold">OVERDUE</text>

  <!-- Parties -->
  <text x="80" y="200" fill="#64748b" font-family="sans-serif" font-size="12" font-weight="bold">BILLED TO (CONFIDENTIAL CLIENT):</text>
  <text x="80" y="225" fill="#0f172a" font-family="sans-serif" font-size="15" font-weight="bold">Acme Global Holdings Inc.</text>
  <text x="80" y="245" fill="#334155" font-family="sans-serif" font-size="13">Attn: CFO Jonathan Vance</text>
  <text x="80" y="265" fill="#334155" font-family="sans-serif" font-size="13">Direct Phone: +1 (555) 019-2834</text>
  <text x="80" y="285" fill="#334155" font-family="sans-serif" font-size="13">Tax ID: 94-8291048-X</text>

  <!-- Itemized Table -->
  <rect x="80" y="330" width="640" height="35" fill="#e2e8f0" rx="4" />
  <text x="100" y="353" fill="#334155" font-family="sans-serif" font-size="12" font-weight="bold">DESCRIPTION</text>
  <text x="440" y="353" fill="#334155" font-family="sans-serif" font-size="12" font-weight="bold">HOURS</text>
  <text x="540" y="353" fill="#334155" font-family="sans-serif" font-size="12" font-weight="bold">RATE</text>
  <text x="650" y="353" fill="#334155" font-family="sans-serif" font-size="12" font-weight="bold">TOTAL</text>

  <text x="100" y="395" fill="#0f172a" font-family="sans-serif" font-size="13">Enterprise Architecture Security Audit</text>
  <text x="450" y="395" fill="#0f172a" font-family="sans-serif" font-size="13">80.0</text>
  <text x="540" y="395" fill="#0f172a" font-family="sans-serif" font-size="13">$250.00</text>
  <text x="640" y="395" fill="#0f172a" font-family="sans-serif" font-size="13">$20,000.00</text>
  <line x1="80" y1="415" x2="720" y2="415" stroke="#e2e8f0" />

  <text x="100" y="445" fill="#0f172a" font-family="sans-serif" font-size="13">Kubernetes Cluster Penetration Testing</text>
  <text x="450" y="445" fill="#0f172a" font-family="sans-serif" font-size="13">45.0</text>
  <text x="540" y="445" fill="#0f172a" font-family="sans-serif" font-size="13">$300.00</text>
  <text x="640" y="445" fill="#0f172a" font-family="sans-serif" font-size="13">$13,500.00</text>
  <line x1="80" y1="465" x2="720" y2="465" stroke="#e2e8f0" />

  <text x="100" y="495" fill="#0f172a" font-family="sans-serif" font-size="13">Incident Remediation (Critical CVE-2026)</text>
  <text x="450" y="495" fill="#0f172a" font-family="sans-serif" font-size="13">18.5</text>
  <text x="540" y="495" fill="#0f172a" font-family="sans-serif" font-size="13">$350.00</text>
  <text x="640" y="495" fill="#0f172a" font-family="sans-serif" font-size="13">$6,475.00</text>
  <line x1="80" y1="515" x2="720" y2="515" stroke="#e2e8f0" />

  <!-- Banking Wire Transfer Details (High Redaction Candidate) -->
  <rect x="80" y="560" width="640" height="150" fill="#f1f5f9" rx="8" stroke="#cbd5e1" stroke-width="1" />
  <text x="100" y="590" fill="#0f172a" font-family="sans-serif" font-size="13" font-weight="bold">WIRE PAYMENT INSTRUCTIONS (PRIVATE BANKING):</text>
  <text x="100" y="620" fill="#334155" font-family="sans-serif" font-size="13">Bank: First National Commercial Depository, New York</text>
  <text x="100" y="645" fill="#334155" font-family="sans-serif" font-size="13">Routing / ABA: 021000021</text>
  <text x="100" y="670" fill="#334155" font-family="sans-serif" font-size="13">Account Number: 8847-2918-4401-9284</text>
  <text x="100" y="695" fill="#334155" font-family="sans-serif" font-size="13">SWIFT / BIC: FNCDUS33NYC</text>

  <!-- Total Box -->
  <rect x="460" y="740" width="260" height="100" fill="#0f172a" rx="8" />
  <text x="480" y="775" fill="#94a3b8" font-family="sans-serif" font-size="14">TOTAL DUE (USD):</text>
  <text x="480" y="820" fill="#38bdf8" font-family="sans-serif" font-size="28" font-weight="bold">$39,975.00</text>

  <text x="80" y="920" fill="#64748b" font-family="sans-serif" font-size="12">Please markup or redact private financial identifiers before distributing externally.</text>
</svg>
`;

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'dashboard',
    name: 'Cloud Dashboard UI',
    description: 'SaaS metrics, charts, server logs, and API keys',
    category: 'Product & Tech',
    dataUrl: svgToDataUrl(DASHBOARD_SVG),
    width: 1200,
    height: 800,
  },
  {
    id: 'architecture',
    name: 'System Architecture',
    description: 'Microservices flow, client tier, gateway & databases',
    category: 'Diagrams',
    dataUrl: svgToDataUrl(ARCHITECTURE_SVG),
    width: 1100,
    height: 700,
  },
  {
    id: 'document',
    name: 'Confidential Invoice',
    description: 'Client invoice with sensitive wire & bank numbers',
    category: 'Documents',
    dataUrl: svgToDataUrl(DOCUMENT_SVG),
    width: 800,
    height: 1050,
  },
];
