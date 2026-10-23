const seedWebinars = [
  {
    id: "webinar-ai-agents",
    slug: "mastering-agentic-ai-autonomous-llm-systems",
    title: "Mastering Agentic AI & Autonomous LLM Systems",
    category: "Artificial Intelligence",
    categoryId: "ai-ml",
    tagline: "Build production-ready agent swarms and memory-augmented LLM architectures.",
    summary: "A practical deep dive into autonomous multi-agent pipelines, MCP tools, reasoning guardrails, and real-time execution.",
    speaker: {
      name: "Dr. Ananya Raman",
      role: "Principal AI Research Scientist",
      company: "CognitiveScale Labs",
      bio: "Dr. Raman holds 8 patents in multi-agent orchestration and leads frontier autonomous reasoning frameworks for enterprise teams across Silicon Valley and Bengaluru.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      rating: 4.9,
      reviewsCount: 3840,
      studentCount: 42100
    },
    date: "Saturday, Nov 14, 2026",
    time: "6:00 PM - 7:30 PM IST",
    timeZone: "IST (UTC+05:30)",
    duration: "90 Mins",
    price: 499,
    originalPrice: 1999,
    currency: "INR",
    seatsAvailable: 42,
    maxSeats: 150,
    isFeatured: true,
    meetingUrl: "https://meet.google.com/kai-agnt-live",
    sampleNotice: "Sample webinar schedule — subject to final host confirmation before launch.",
    promoVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4",
    posterImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    level: "Intermediate to Advanced",
    language: "English",
    rating: 4.9,
    reviewsCount: 412,
    learnersCount: 3890,
    status: "published",
    outcomes: [
      "Understand multi-agent coordination protocols and state persistence",
      "Deploy localized vector embeddings with low-latency tool calling (MCP)",
      "Live teardown of reasoning chains, guardrails and fallback agent trees",
      "Verified digital certificate & full session code repository access"
    ],
    prerequisites: [
      "Basic familiarity with Python or modern JavaScript/TypeScript",
      "Conceptual understanding of REST APIs and prompt engineering"
    ],
    agenda: [
      {
        title: "Section 1: Foundations of Agentic Architecture",
        duration: "25 mins",
        description: "Deconstructing single-prompt LLMs vs. iterative ReAct reasoning loops.",
        points: ["Task decomposition", "Observation and reflection loops", "Stateful memory stores"]
      },
      {
        title: "Section 2: Multi-Agent Collaboration & MCP Tool Protocol",
        duration: "35 mins",
        description: "Hands-on implementation of specialized worker agents with unified tools.",
        points: ["Model Context Protocol (MCP) clients", "Subagent delegation", "Conflict resolution"]
      },
      {
        title: "Section 3: Production Guardrails & Observability",
        duration: "20 mins",
        description: "Handling hallucinations, token cost budgets, and automated fallback pathways.",
        points: ["Deterministic sanity checks", "Streaming responses", "Tracing and telemetry"]
      },
      {
        title: "Section 4: Live Interactive Q&A & Code Repository Walkthrough",
        duration: "10 mins",
        description: "Audience code review, open source templates distribution, and certificate issuance details.",
        points: ["GitHub repo fork", "Discord community join", "Live debugging"]
      }
    ],
    reviews: [
      {
        author: "Siddharth Verma",
        rating: 5,
        date: "2 days ago",
        comment: "Dr. Raman explained multi-agent loops clearer than any documentation online. The live coding demonstration alone was worth ten times the pass price!",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
      }
    ],
    description: "Deep dive into production agentic systems. We deconstruct how autonomous agents plan, select tools, handle exceptions, and coordinate in real-world deployment scenarios."
  },
  {
    id: "webinar-react-19",
    slug: "modern-react-19-server-components-micro-frontends",
    title: "Modern React 19, Server Components & Micro-Frontends",
    category: "Web Development",
    categoryId: "web-dev",
    tagline: "Architect blazing fast, zero-bundle overhead web apps with React 19 Actions and modern bundling.",
    summary: "Master React 19 server actions, compiler optimizations, optimistic UI updates, and scalable micro-frontend architectures.",
    speaker: {
      name: "Vikram Sengupta",
      role: "Staff Frontend Architect",
      company: "Nexify Cloud",
      bio: "Former tech lead at hyper-growth tech startups. Specialist in React compiler optimization, UI micro-interactions, and high-scale web performance.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      rating: 4.8,
      reviewsCount: 2190,
      studentCount: 29800
    },
    date: "Wednesday, Nov 18, 2026",
    time: "7:00 PM - 8:30 PM IST",
    timeZone: "IST (UTC+05:30)",
    duration: "90 Mins",
    price: 0,
    originalPrice: 999,
    currency: "INR",
    seatsAvailable: 118,
    maxSeats: 300,
    isFeatured: false,
    meetingUrl: "https://meet.google.com/kai-rct-live",
    sampleNotice: "Sample webinar schedule — subject to final host confirmation before launch.",
    promoVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-typing-on-a-laptop-keyboard-42838-large.mp4",
    posterImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    level: "All Levels",
    language: "English",
    rating: 4.8,
    reviewsCount: 256,
    learnersCount: 2840,
    status: "published",
    outcomes: [
      "Implement React 19 Actions and useActionState natively",
      "Demystify optimistic UI updates without extra client libraries",
      "Asset preloading and streaming server side rendering patterns",
      "Hands-on refactoring of legacy code into clean modern paradigms"
    ],
    prerequisites: [
      "Working knowledge of React components and modern ES6+ JavaScript"
    ],
    agenda: [
      {
        title: "Section 1: The React 19 Evolution",
        duration: "20 mins",
        description: "Breaking down what changed: React Compiler, automatic memoization, and new hooks.",
        points: ["useActionState", "useOptimistic", "use() API for promises"]
      },
      {
        title: "Section 2: Server Components & Actions in Practice",
        duration: "35 mins",
        description: "Eliminating boilerplate API layers and handling forms effortlessly.",
        points: ["Server actions form submission", "Pending state indicators", "Progressive enhancement"]
      },
      {
        title: "Section 3: Micro-Frontends & Module Federation",
        duration: "25 mins",
        description: "Decoupling large enterprise codebases without runtime friction.",
        points: ["Vite module federation", "Shared state strategies", "Version alignment"]
      },
      {
        title: "Section 4: Live Q&A and Boilerplate Handout",
        duration: "10 mins",
        description: "Open question forum and distribution of production-ready starter templates.",
        points: ["Starter kit demo", "Community links"]
      }
    ],
    reviews: [
      {
        author: "Devika Nair",
        rating: 5,
        date: "3 days ago",
        comment: "Finally someone explained useOptimistic without confusing abstractions. Free pass was full of premium insights!",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"
      }
    ],
    description: "React 19 represents the biggest leap in developer experience and runtime performance. Master server actions, compiler improvements, and production deployment tricks."
  },
  {
    id: "webinar-cloud-k8s",
    slug: "zero-downtime-kubernetes-cloud-native-security",
    title: "Zero-Downtime Kubernetes & Cloud-Native Security",
    category: "Cloud & DevOps",
    categoryId: "devops",
    tagline: "Design fault-tolerant GitOps pipelines with automated rollback and runtime zero-trust policies.",
    summary: "Architect self-healing cloud clusters using ArgoCD, Cilium eBPF, and automated canary deployments.",
    speaker: {
      name: "Meera Krishnan",
      role: "Head of Infrastructure & SRE",
      company: "Aura Networks",
      bio: "Meera manages global clusters processing 40M+ daily events. CNCF speaker and mentor for women in cloud engineering.",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
      rating: 4.9,
      reviewsCount: 1850,
      studentCount: 18400
    },
    date: "Sunday, Nov 22, 2026",
    time: "5:30 PM - 7:00 PM IST",
    timeZone: "IST (UTC+05:30)",
    duration: "90 Mins",
    price: 499,
    originalPrice: 2499,
    currency: "INR",
    seatsAvailable: 19,
    maxSeats: 100,
    isFeatured: true,
    meetingUrl: "https://meet.google.com/kai-k8s-live",
    sampleNotice: "Sample webinar schedule — subject to final host confirmation before launch.",
    promoVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-data-31912-large.mp4",
    posterImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    level: "Intermediate",
    language: "English",
    rating: 4.9,
    reviewsCount: 310,
    learnersCount: 1950,
    status: "published",
    outcomes: [
      "GitOps continuous delivery using ArgoCD and automated canary analysis",
      "Hardening pod security standards, secret vaults and eBPF network filtering",
      "Cost optimization blueprint for multi-cloud Kubernetes clusters",
      "Live chaos engineering experiment and auto-remediation demo"
    ],
    prerequisites: [
      "Basic Docker container and Linux command line experience"
    ],
    agenda: [
      {
        title: "Section 1: Architecture of Zero-Downtime Releases",
        duration: "25 mins",
        description: "Pod disruption budgets, graceful termination, and readiness probes.",
        points: ["Readiness probes vs liveness probes", "Canary rollouts with Argo Rollouts"]
      },
      {
        title: "Section 2: Runtime Cloud Security & eBPF",
        duration: "30 mins",
        description: "Protecting containers at the kernel layer without agent overhead.",
        points: ["Cilium network policies", "Tetragon runtime enforcement"]
      },
      {
        title: "Section 3: Chaos Engineering & Live Failure Injection",
        duration: "25 mins",
        description: "Injecting latency, killing nodes, and watching the control plane auto-recover.",
        points: ["Chaos Mesh setup", "Automated alert paging"]
      },
      {
        title: "Section 4: Q&A & Production Helm Charts Download",
        duration: "10 mins",
        description: "Interactive session with attendees and repository release.",
        points: ["Helm charts repo", "Private Discord Q&A"]
      }
    ],
    reviews: [
      {
        author: "Arjun Reddy",
        rating: 5,
        date: "5 days ago",
        comment: "Meera is unmatched in SRE insights. The chaos engineering live demo was mind-blowing!",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
      }
    ],
    description: "Learn how top engineering teams build resilient cloud infrastructures that withstand regional outages and sophisticated attacks with zero human intervention."
  },
  {
    id: "webinar-b2b-growth",
    slug: "b2b-saas-growth-engine-0-to-1m-arr",
    title: "B2B SaaS Growth Engine: From $0 to $1M ARR",
    category: "Business & Marketing",
    categoryId: "business",
    tagline: "Proven playbooks for product-led growth, outbound sequencing, and customer retention.",
    summary: "Real go-to-market data, acquisition funnel economics, and conversion funnels that convert visitors into recurring annual enterprise contracts.",
    speaker: {
      name: "Rohan Varma",
      role: "VP of Growth & Revenue",
      company: "ScaleMetric",
      bio: "Rohan has scaled 3 enterprise SaaS startups through series A and B, scaling annual revenue by 400% through organic search and partner funnels.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      rating: 4.7,
      reviewsCount: 1420,
      studentCount: 15200
    },
    date: "Saturday, Nov 28, 2026",
    time: "6:00 PM - 7:30 PM IST",
    timeZone: "IST (UTC+05:30)",
    duration: "90 Mins",
    price: 349,
    originalPrice: 1499,
    currency: "INR",
    seatsAvailable: 64,
    maxSeats: 200,
    isFeatured: false,
    meetingUrl: "https://meet.google.com/kai-saas-live",
    sampleNotice: "Sample webinar schedule — subject to final host confirmation before launch.",
    promoVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-business-colleagues-discussing-a-project-in-an-office-42845-large.mp4",
    posterImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    level: "All Levels",
    language: "English",
    rating: 4.7,
    reviewsCount: 178,
    learnersCount: 1650,
    status: "published",
    outcomes: [
      "Crafting an irresistible high-conversion value proposition",
      "Designing inbound funnel loops that drive qualified enterprise leads",
      "Pricing tier psychology and friction-free checkout mechanics",
      "Actionable spreadsheet financial model & pitch template download"
    ],
    prerequisites: [
      "Interest in SaaS business fundamentals or product management"
    ],
    agenda: [
      {
        title: "Section 1: The Product-Led Growth Blueprint",
        duration: "25 mins",
        description: "Reducing time-to-value from sign-up to aha-moment.",
        points: ["Self-serve onboarding", "Product analytics tracking"]
      },
      {
        title: "Section 2: High-Converting Enterprise Funnels",
        duration: "30 mins",
        description: "Sales-assisted PLG and qualification criteria for 5-figure ACV deals.",
        points: ["Automated email workflows", "Demo request friction reduction"]
      },
      {
        title: "Section 3: Retention & Churn Prevention",
        duration: "25 mins",
        description: "Identifying churn triggers before customers cancel.",
        points: ["Net revenue retention (NRR)", "Customer health scoring"]
      },
      {
        title: "Section 4: Open Q&A & Financial Model Spreadsheet Giveaway",
        duration: "10 mins",
        description: "Downloadable spreadsheet templates for attendee financial planning.",
        points: ["SaaS financial model download", "Direct founder Q&A"]
      }
    ],
    reviews: [
      {
        author: "Kavita Rao",
        rating: 5,
        date: "1 week ago",
        comment: "Rohan gave practical numbers, CAC to LTV ratios, and actual email copy that converted. Highly recommend!",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
      }
    ],
    description: "Break down real go-to-market data, acquisition funnel economics, and conversion funnels that convert visitors into recurring annual enterprise contracts."
  },
  {
    id: "webinar-fullstack-arch",
    slug: "full-stack-system-architecture-100k-concurrent-users",
    title: "Full-Stack System Architecture for 100k Concurrent Users",
    category: "Full-Stack Engineering",
    categoryId: "fullstack",
    tagline: "Design resilient distributed web apps with caching, queue processing, and database sharding.",
    summary: "From frontend hydration bottlenecks to database replication lag: learn how to build architectures that gracefully handle viral traffic surges.",
    speaker: {
      name: "Aditya Roy",
      role: "Chief Architect",
      company: "CloudScale Systems",
      bio: "Aditya has designed high-concurrency architectures powering e-commerce flash sales and streaming backends across Asia.",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
      rating: 4.9,
      reviewsCount: 1640,
      studentCount: 19400
    },
    date: "Tuesday, Dec 01, 2026",
    time: "7:00 PM - 8:30 PM IST",
    timeZone: "IST (UTC+05:30)",
    duration: "90 Mins",
    price: 499,
    originalPrice: 1999,
    currency: "INR",
    seatsAvailable: 35,
    maxSeats: 150,
    isFeatured: true,
    meetingUrl: "https://meet.google.com/kai-fsa-live",
    sampleNotice: "Sample webinar schedule — subject to final host confirmation before launch.",
    promoVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4",
    posterImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
    level: "Intermediate to Advanced",
    language: "English",
    rating: 4.9,
    reviewsCount: 284,
    learnersCount: 2210,
    status: "published",
    outcomes: [
      "Master multi-tier caching architectures (CDN, Redis, In-Memory)",
      "Decouple heavy tasks with asynchronous event queues (RabbitMQ, Redis Streams)",
      "Database read-write replica routing and connection pooling optimizations",
      "Full architecture diagram and performance benchmark templates included"
    ],
    prerequisites: [
      "Experience with modern web frameworks (React, Node.js, Python, or Go)"
    ],
    agenda: [
      {
        title: "Section 1: Bottlenecks at Scale",
        duration: "25 mins",
        description: "Diagnosing CPU saturation, event loop lag, and connection starvation.",
        points: ["APM profiling", "Connection exhaustion", "Thundering herd problem"]
      },
      {
        title: "Section 2: Distributed Caching & Queues",
        duration: "35 mins",
        description: "Implementing cache stampede prevention and idempotent consumer workers.",
        points: ["Redis cache patterns", "Worker pools", "Backpressure management"]
      },
      {
        title: "Section 3: Database Optimization & Read Replicas",
        duration: "20 mins",
        description: "Sharding concepts, compound indexing strategies, and read-replica routing.",
        points: ["Index selectivity", "Connection pool sizing", "Read/write split"]
      },
      {
        title: "Section 4: Live Architecture Review & Q&A",
        duration: "10 mins",
        description: "Reviewing audience system architectures live on screen.",
        points: ["Live critique", "Architecture blueprint download"]
      }
    ],
    reviews: [
      {
        author: "Manish Joshi",
        rating: 5,
        date: "4 days ago",
        comment: "The connection pooling teardown and cache stampede demo alone solved a production bug we were fighting all week.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
      }
    ],
    description: "Learn how top consumer applications handle 100k+ concurrent requests without degradation using modern Node.js, Redis, and cloud infrastructure."
  },
  {
    id: "webinar-nodejs-rest",
    slug: "high-performance-nodejs-resilient-rest-apis",
    title: "High-Performance Node.js & Resilient REST APIs",
    category: "Backend Development",
    categoryId: "backend",
    tagline: "Build enterprise REST APIs with zero memory leaks, rate limiting, and robust validation.",
    summary: "Discover advanced Express & Node.js patterns: stream processing, clustering, worker threads, and rate-limiting middleware that prevent DOS attacks.",
    speaker: {
      name: "Tanya Sen",
      role: "Backend Architect",
      company: "FinStack Global",
      bio: "Tanya designs financial transaction routing gateways processing millions of API calls per hour with 99.999% SLA.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      rating: 4.8,
      reviewsCount: 1980,
      studentCount: 22100
    },
    date: "Friday, Dec 04, 2026",
    time: "6:30 PM - 8:00 PM IST",
    timeZone: "IST (UTC+05:30)",
    duration: "90 Mins",
    price: 0,
    originalPrice: 1299,
    currency: "INR",
    seatsAvailable: 80,
    maxSeats: 250,
    isFeatured: false,
    meetingUrl: "https://meet.google.com/kai-node-live",
    sampleNotice: "Sample webinar schedule — subject to final host confirmation before launch.",
    promoVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-typing-on-a-laptop-keyboard-42838-large.mp4",
    posterImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    level: "Intermediate",
    language: "English",
    rating: 4.8,
    reviewsCount: 215,
    learnersCount: 2430,
    status: "published",
    outcomes: [
      "Avoid Node.js event-loop blocking with streams and worker threads",
      "Production-ready input validation with Joi/Zod and custom sanitize middleware",
      "Implement sliding-window rate limiting with Redis integration",
      "Graceful shutdown handling to ensure zero dropped transactions"
    ],
    prerequisites: [
      "Understanding of JavaScript promises, async/await, and Express middleware"
    ],
    agenda: [
      {
        title: "Section 1: Event Loop Mechanics & Stream Processing",
        duration: "25 mins",
        description: "Transform streams, backpressure handling, and memory allocation profiling.",
        points: ["V8 heap snapshots", "Backpressure handling", "Memory leak detection"]
      },
      {
        title: "Section 2: API Security & Defensive Middleware",
        duration: "30 mins",
        description: "Hardening headers, strict schema validation, and token verification.",
        points: ["Rate limiting", "CORS & Helmet", "JWT security best practices"]
      },
      {
        title: "Section 3: Resilient Error Handling & Logging",
        duration: "25 mins",
        description: "Centralized operational errors, unhandled rejections, and structured JSON logs.",
        points: ["Winston/Pino setup", "Correlation IDs", "Sentry integration"]
      },
      {
        title: "Section 4: Q&A and Production Middleware Starter",
        duration: "10 mins",
        description: "Live interactive discussion and GitHub starter repository release.",
        points: ["Boilerplate download", "Q&A"]
      }
    ],
    reviews: [
      {
        author: "Kunal Bansal",
        rating: 5,
        date: "6 days ago",
        comment: "Free webinar with unmatched production advice. The stream processing code example was directly applicable to our export service.",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
      }
    ],
    description: "Build robust, industrial-strength backend services with Node.js that never drop requests, leak memory, or freeze the single thread under peak stress."
  },
  {
    id: "webinar-python-automation",
    slug: "python-for-enterprise-automation-scripting",
    title: "Python for Enterprise Automation & Scripting",
    category: "Software Development",
    categoryId: "python",
    tagline: "Automate repetitive workflows, ETL pipelines, and API integrations with elegant Python.",
    summary: "Master Python automation from zero to hero: data scraping, automated PDF generation, cloud cron tasks, and Excel/spreadsheet workflows.",
    speaker: {
      name: "Neha Kulkarni",
      role: "Lead Automation Engineer",
      company: "DataMinds Tech",
      bio: "Neha builds enterprise automation tooling saving over 10,000 engineering hours annually across Fortune 500 financial clients.",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
      rating: 4.9,
      reviewsCount: 1410,
      studentCount: 16700
    },
    date: "Wednesday, Dec 09, 2026",
    time: "7:00 PM - 8:30 PM IST",
    timeZone: "IST (UTC+05:30)",
    duration: "90 Mins",
    price: 349,
    originalPrice: 1499,
    currency: "INR",
    seatsAvailable: 45,
    maxSeats: 150,
    isFeatured: false,
    meetingUrl: "https://meet.google.com/kai-py-live",
    sampleNotice: "Sample webinar schedule — subject to final host confirmation before launch.",
    promoVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4",
    posterImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    level: "Beginner to Intermediate",
    language: "English",
    rating: 4.9,
    reviewsCount: 198,
    learnersCount: 1820,
    status: "published",
    outcomes: [
      "Automate complex Excel, CSV, and PDF report creation with Python",
      "Interact with modern REST and GraphQL APIs using requests and httpx",
      "Build command-line automation utilities with Click and Rich",
      "Downloadable library of 20+ ready-to-run automation scripts"
    ],
    prerequisites: [
      "Basic understanding of programming fundamentals in any language"
    ],
    agenda: [
      {
        title: "Section 1: The Automation Mindset",
        duration: "20 mins",
        description: "Identifying high-ROI tasks to script and setting up virtual environments.",
        points: ["Virtual environments", "Package management with uv/pip", "Script design"]
      },
      {
        title: "Section 2: Data Extraction & API Integration",
        duration: "35 mins",
        description: "Fetching API data, parsing JSON/HTML, and error-tolerant web scraping.",
        points: ["BeautifulSoup & Playwright", "API retries", "Authentication tokens"]
      },
      {
        title: "Section 3: Document Generation & Email Alerts",
        duration: "25 mins",
        description: "Building automated email digests with PDF attachments and Slack webhooks.",
        points: ["ReportLab PDF generation", "SMTP/SendGrid alerts", "Slack webhook bot"]
      },
      {
        title: "Section 4: Q&A and Script Pack Delivery",
        duration: "10 mins",
        description: "Attendee questions and distribution of automation templates repository.",
        points: ["Code repo access", "Community support"]
      }
    ],
    reviews: [
      {
        author: "Pooja Hegde",
        rating: 5,
        date: "1 week ago",
        comment: "Clear, practical, and incredibly useful. The Slack bot script alone automated half of our daily standup reminders.",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"
      }
    ],
    description: "Discover how to replace hours of manual reporting, spreadsheet formatting, and repetitive API queries with battle-tested Python scripts."
  },
  {
    id: "webinar-cloud-cost",
    slug: "cloud-computing-finops-architecting-aws-gcp-for-efficiency",
    title: "Cloud Computing & FinOps: Architecting AWS & GCP for Efficiency",
    category: "Cloud Architecture",
    categoryId: "cloud",
    tagline: "Slash cloud bills by 40% while enhancing reliability, security, and elasticity.",
    summary: "Learn FinOps best practices, reserved instance strategies, serverless trade-offs, and multi-region failover design on AWS and Google Cloud.",
    speaker: {
      name: "Rajesh Kannan",
      role: "VP of Cloud Strategy",
      company: "FinOps Enterprise",
      bio: "Rajesh has audited over $50M in enterprise cloud spending across AWS, Azure, and GCP, optimizing unit economics for high-growth tech firms.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      rating: 4.9,
      reviewsCount: 1560,
      studentCount: 17200
    },
    date: "Saturday, Dec 12, 2026",
    time: "6:00 PM - 7:30 PM IST",
    timeZone: "IST (UTC+05:30)",
    duration: "90 Mins",
    price: 499,
    originalPrice: 1999,
    currency: "INR",
    seatsAvailable: 28,
    maxSeats: 120,
    isFeatured: true,
    meetingUrl: "https://meet.google.com/kai-cld-live",
    sampleNotice: "Sample webinar schedule — subject to final host confirmation before launch.",
    promoVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-data-31912-large.mp4",
    posterImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    level: "Intermediate",
    language: "English",
    rating: 4.9,
    reviewsCount: 240,
    learnersCount: 2010,
    status: "published",
    outcomes: [
      "Identify idle cloud resources, unattached EBS volumes, and oversized compute instances",
      "Design serverless vs container cost trade-off models for predictable budgeting",
      "Deploy automated cost alert budgets with AWS Cost Explorer and GCP Billing APIs",
      "Exclusive FinOps audit checklist & pricing calculator spreadsheet"
    ],
    prerequisites: [
      "Basic familiarity with AWS EC2/S3 or Google Cloud Compute Engine"
    ],
    agenda: [
      {
        title: "Section 1: The Anatomy of Cloud Waste",
        duration: "25 mins",
        description: "Where enterprise cloud budgets leak: egress fees, snapshot sprawl, and unoptimized tiers.",
        points: ["Data egress pitfalls", "EBS volume lifecycle", "NAT gateway charges"]
      },
      {
        title: "Section 2: Spot Instances & Savings Plans",
        duration: "30 mins",
        description: "Leveraging spot compute safely for fault-tolerant microservices.",
        points: ["Spot instance termination hooks", "Compute savings plans", "Graviton/ARM savings"]
      },
      {
        title: "Section 3: Architecting for Cost Efficiency",
        duration: "25 mins",
        description: "S3 Intelligent-Tiering, multi-AZ networking costs, and serverless compute tuning.",
        points: ["S3 storage classes", "VPC peering vs transit gateway", "Lambda memory sizing"]
      },
      {
        title: "Section 4: Q&A and FinOps Spreadsheet Template",
        duration: "10 mins",
        description: "Interactive session with attendees and audit checklist distribution.",
        points: ["Spreadsheet download", "Live case study"]
      }
    ],
    reviews: [
      {
        author: "Harish Murthy",
        rating: 5,
        date: "3 days ago",
        comment: "We applied the NAT gateway and S3 tiering advice the very next day and immediately saw an 18% reduction in our AWS monthly bill.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
      }
    ],
    description: "Learn how modern cloud architects audit infrastructure, eliminate resource sprawl, and optimize enterprise cloud bills without compromising uptime or speed."
  },
  {
    id: "webinar-devops-cicd",
    slug: "modern-devops-github-actions-cicd-mastery",
    title: "Modern DevOps & GitHub Actions CI/CD Mastery",
    category: "DevOps & Cloud",
    categoryId: "devops",
    tagline: "Build lightning-fast automated build, test, and release pipelines with security gating.",
    summary: "From commit to Kubernetes production: master GitHub Actions workflows, matrix builds, artifact caching, environment secrets, and automated releases.",
    speaker: {
      name: "Saurabh Nanda",
      role: "Staff DevOps Engineer",
      company: "InfraVelocity",
      bio: "Saurabh has built CI/CD pipelines for hundreds of microservices, cutting deployment times from 45 minutes to under 4 minutes.",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
      rating: 4.8,
      reviewsCount: 1620,
      studentCount: 19100
    },
    date: "Tuesday, Dec 15, 2026",
    time: "7:00 PM - 8:30 PM IST",
    timeZone: "IST (UTC+05:30)",
    duration: "90 Mins",
    price: 0,
    originalPrice: 999,
    currency: "INR",
    seatsAvailable: 95,
    maxSeats: 300,
    isFeatured: false,
    meetingUrl: "https://meet.google.com/kai-ops-live",
    sampleNotice: "Sample webinar schedule — subject to final host confirmation before launch.",
    promoVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4",
    posterImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    level: "All Levels",
    language: "English",
    rating: 4.8,
    reviewsCount: 228,
    learnersCount: 2540,
    status: "published",
    outcomes: [
      "Build production CI pipelines with dependency caching and parallel test runners",
      "Enforce code quality with SonarQube, security audits, and secret scanning",
      "Deploy container images to Amazon ECR and DigitalOcean container registry automatically",
      "Complete workflow repository template ready for any Node/React/Python project"
    ],
    prerequisites: [
      "Familiarity with Git branching and command line operations"
    ],
    agenda: [
      {
        title: "Section 1: Workflow Syntax & Runner Optimization",
        duration: "25 mins",
        description: "Understanding trigger events, job matrices, and multi-platform runners.",
        points: ["Trigger filters", "Matrix builds", "Self-hosted runners"]
      },
      {
        title: "Section 2: Caching & Fast Build Strategies",
        duration: "30 mins",
        description: "Using action/cache effectively for node_modules, pip, and Docker layers.",
        points: ["Docker layer cache (Buildx)", "Dependency cache keys", "Test sharding"]
      },
      {
        title: "Section 3: Secure Deployments & OIDC Tokens",
        duration: "25 mins",
        description: "Eliminating static AWS keys using OpenID Connect and temporary credentials.",
        points: ["OIDC role assumption", "Secret scanning", "Branch protection rules"]
      },
      {
        title: "Section 4: Q&A and Ready-to-Use Workflow Templates",
        duration: "10 mins",
        description: "Attendee questions and starter YAML workflow templates.",
        points: ["YAML repo link", "Discord developer chat"]
      }
    ],
    reviews: [
      {
        author: "Aakash Tiwari",
        rating: 5,
        date: "5 days ago",
        comment: "The OIDC AWS deployment setup was crystal clear. We replaced all our hardcoded IAM user keys in 15 minutes.",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
      }
    ],
    description: "Transform your team's deployment velocity. Master GitHub Actions from matrix testing to zero-trust cloud deployments with real-world examples."
  },
  {
    id: "webinar-data-analytics",
    slug: "data-analytics-predictive-modeling-with-python",
    title: "Data Analytics & Predictive Modeling with Python",
    category: "Data Science",
    categoryId: "data-science",
    tagline: "Turn complex raw datasets into predictive insights and interactive dashboards.",
    summary: "Hands-on data analytics masterclass: data wrangling with Pandas 2.0, exploratory visual storytelling with Seaborn, and machine learning classification.",
    speaker: {
      name: "Dr. Sandeep Patel",
      role: "Lead Data Scientist",
      company: "QuantVantage Analytics",
      bio: "Dr. Patel has published 15 papers in predictive analytics and advises fintech companies on customer churn and fraud detection models.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      rating: 4.9,
      reviewsCount: 1750,
      studentCount: 20400
    },
    date: "Saturday, Dec 19, 2026",
    time: "6:00 PM - 7:30 PM IST",
    timeZone: "IST (UTC+05:30)",
    duration: "90 Mins",
    price: 499,
    originalPrice: 1999,
    currency: "INR",
    seatsAvailable: 31,
    maxSeats: 150,
    isFeatured: true,
    meetingUrl: "https://meet.google.com/kai-data-live",
    sampleNotice: "Sample webinar schedule — subject to final host confirmation before launch.",
    promoVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-business-colleagues-discussing-a-project-in-an-office-42845-large.mp4",
    posterImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    level: "All Levels",
    language: "English",
    rating: 4.9,
    reviewsCount: 265,
    learnersCount: 2310,
    status: "published",
    outcomes: [
      "Perform exploratory data analysis (EDA) with Pandas 2.0 and PyArrow backend",
      "Build stunning data visualizations that communicate actionable business insights",
      "Train, evaluate, and interpret predictive classification models using Scikit-Learn",
      "Full Jupyter notebook with real-world customer churn dataset included"
    ],
    prerequisites: [
      "Basic understanding of Python variables, lists, and functions"
    ],
    agenda: [
      {
        title: "Section 1: Fast Data Wrangling with Pandas 2.0",
        duration: "25 mins",
        description: "Speeding up computations, handling missing values, and vectorization.",
        points: ["PyArrow integration", "Vectorized operations", "Memory footprint optimization"]
      },
      {
        title: "Section 2: Visual Storytelling & Insights",
        duration: "30 mins",
        description: "Generating executive-ready charts and spotting statistical anomalies.",
        points: ["Distribution plots", "Correlation heatmaps", "Interactive charts with Plotly"]
      },
      {
        title: "Section 3: Predictive Modeling & Churn Classification",
        duration: "25 mins",
        description: "Training logistic regression and random forest models to predict churn.",
        points: ["Feature engineering", "Cross-validation", "Confusion matrix & ROC curve"]
      },
      {
        title: "Section 4: Q&A and Jupyter Notebooks Download",
        duration: "10 mins",
        description: "Interactive session and sharing of source notebooks and datasets.",
        points: ["Jupyter notebook link", "Dataset download"]
      }
    ],
    reviews: [
      {
        author: "Shalini Murugesan",
        rating: 5,
        date: "2 days ago",
        comment: "Dr. Patel breaks down data science concepts with zero jargon. The churn modeling notebook was clean, well commented, and worked immediately.",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
      }
    ],
    description: "Transform raw data into strategic intelligence. Learn practical exploratory analysis and build real machine learning models that solve business problems."
  }
];

module.exports = seedWebinars;
