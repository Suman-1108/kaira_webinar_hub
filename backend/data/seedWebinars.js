const seedWebinars = [
  {
    id: "webinar-ai-agents",
    title: "Mastering Agentic AI & Autonomous LLM Systems",
    category: "AI & Machine Learning",
    tagline: "Build production-ready agent swarms and memory-augmented LLM architectures.",
    speaker: {
      name: "Dr. Ananya Raman",
      role: "Principal AI Research Scientist",
      company: "CognitiveScale Labs",
      bio: "Dr. Raman holds 8 patents in multi-agent orchestration and leads frontier autonomous reasoning frameworks for enterprise teams.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80"
    },
    date: "Saturday, Nov 14, 2026",
    time: "6:00 PM - 7:30 PM IST",
    duration: "90 Mins",
    price: 499,
    originalPrice: 1999,
    seatsAvailable: 42,
    maxSeats: 150,
    isFeatured: true,
    promoVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4",
    posterImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    outcomes: [
      "Understand multi-agent coordination protocols and state persistence",
      "Deploy localized vector embeddings with low-latency tool calling",
      "Live teardown of reasoning chains, guardrails and fallback agents",
      "Verified digital certificate & full session code repository"
    ],
    description: "Deep dive into production agentic systems. We deconstruct how autonomous agents plan, select tools, handle exceptions, and coordinate in real-world deployment scenarios."
  },
  {
    id: "webinar-react-19",
    title: "Modern React 19, Server Components & Micro-Frontends",
    category: "Web Development",
    tagline: "Architect blazing fast, zero-bundle overhead web apps with React 19 Actions and modern bundling.",
    speaker: {
      name: "Vikram Sengupta",
      role: "Staff Frontend Architect",
      company: "Nexify Cloud",
      bio: "Former tech lead at hyper-growth tech startups. Specialist in React compiler optimization, UI micro-interactions, and web performance.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
    },
    date: "Wednesday, Nov 18, 2026",
    time: "7:00 PM - 8:30 PM IST",
    duration: "90 Mins",
    price: 0,
    originalPrice: 999,
    seatsAvailable: 118,
    maxSeats: 300,
    isFeatured: false,
    promoVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-typing-on-a-laptop-keyboard-42838-large.mp4",
    posterImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    outcomes: [
      "Implement React 19 Actions and useActionState natively",
      "Demystify optimistic UI updates without extra client libraries",
      "Asset preloading and streaming server side rendering patterns",
      "Hands-on refactoring of legacy code into clean modern paradigms"
    ],
    description: "React 19 represents the biggest leap in developer experience and runtime performance. Master server actions, compiler improvements, and production deployment tricks."
  },
  {
    id: "webinar-cloud-k8s",
    title: "Zero-Downtime Kubernetes & Cloud-Native Security",
    category: "Cloud & DevOps",
    tagline: "Design fault-tolerant GitOps pipelines with automated rollback and runtime zero-trust policies.",
    speaker: {
      name: "Meera Krishnan",
      role: "Head of Infrastructure & SRE",
      company: "Aura Networks",
      bio: "Meera manages global clusters processing 40M+ daily events. CNCF speaker and mentor for women in cloud engineering.",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80"
    },
    date: "Sunday, Nov 22, 2026",
    time: "5:30 PM - 7:00 PM IST",
    duration: "90 Mins",
    price: 799,
    originalPrice: 2499,
    seatsAvailable: 19,
    maxSeats: 100,
    isFeatured: true,
    promoVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-data-31912-large.mp4",
    posterImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    outcomes: [
      "GitOps continuous delivery using ArgoCD and automated canary analysis",
      "Hardening pod security standards, secret vaults and eBPF network filtering",
      "Cost optimization blueprint for multi-cloud Kubernetes clusters",
      "Live chaos engineering experiment and auto-remediation demo"
    ],
    description: "Learn how top engineering teams build resilient cloud infrastructures that withstand regional outages and sophisticated attacks with zero human intervention."
  },
  {
    id: "webinar-b2b-growth",
    title: "B2B SaaS Growth Engine: From $0 to $1M ARR",
    category: "Business & Marketing",
    tagline: "Proven playbooks for product-led growth, outbound sequencing, and customer retention.",
    speaker: {
      name: "Rohan Varma",
      role: "VP of Growth & Revenue",
      company: "ScaleMetric",
      bio: "Rohan has scaled 3 enterprise SaaS startups through series A and B, scaling annual revenue by 400% through organic search and partner funnels.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
    },
    date: "Saturday, Nov 28, 2026",
    time: "6:00 PM - 7:30 PM IST",
    duration: "90 Mins",
    price: 349,
    originalPrice: 1499,
    seatsAvailable: 64,
    maxSeats: 200,
    isFeatured: false,
    promoVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-business-colleagues-discussing-a-project-in-an-office-42845-large.mp4",
    posterImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    outcomes: [
      "Crafting an irresistible high-conversion value proposition",
      "Designing inbound funnel loops that drive qualified enterprise leads",
      "Pricing tier psychology and friction-free checkout mechanics",
      "Actionable spreadsheet financial model & pitch template download"
    ],
    description: "Break down real go-to-market data, acquisition funnel economics, and conversion funnels that convert visitors into recurring annual enterprise contracts."
  }
];

module.exports = seedWebinars;
