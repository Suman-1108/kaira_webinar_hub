/**
 * Seed data for 10 Professional Courses in Kaira Webinar Hub.
 * Note: Sample educational curriculum for platform demonstration.
 */

const seedCourses = [
  {
    id: "course-fullstack-web-dev",
    slug: "full-stack-web-development-modern-mern-architecture",
    title: "Full-Stack Web Development: Modern MERN Architecture",
    category: "Web Development",
    categoryId: "web-dev",
    tagline: "Build scalable, production-ready enterprise web apps with MongoDB, Express, React 19, and Node.js.",
    description: "Master end-to-end full-stack web engineering. Learn modern state management, secure REST APIs, role-based access control, responsive interfaces, and CI/CD deployment pipelines.",
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
    posterImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
    instructor: {
      name: "Rajesh Nair",
      role: "Lead Full-Stack Architect",
      company: "Kaira Tech Studio",
      bio: "12+ years designing distributed web systems, micro-frontends, and high-throughput SaaS backends.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      rating: 4.9,
      reviewsCount: 840,
      studentCount: 6200
    },
    duration: "42 Hours",
    level: "Beginner to Advanced",
    language: "English",
    price: 499,
    originalPrice: 2499,
    currency: "INR",
    rating: 4.9,
    reviewsCount: 312,
    learnersCount: 2840,
    isFeatured: true,
    outcomes: [
      "Architect scalable Full-Stack MERN applications from scratch",
      "Implement secure JWT authentication, cookies, and RBAC authorization",
      "Deploy full-stack applications with Docker, Nginx, and automated workflows",
      "Build real-time interactive experiences with WebSockets"
    ],
    prerequisites: [
      "Basic HTML, CSS, and modern JavaScript fundamentals",
      "A computer with Node.js and code editor installed"
    ],
    curriculum: [
      {
        sectionId: "sec_fullstack_1",
        title: "Section 1: Foundations & Architecture Design",
        order: 1,
        duration: "10 hours",
        lessons: [
          { lessonId: "les_fullstack_1_1", title: "1. Full-Stack Ecosystem & Architecture Overview", duration: "25 mins", durationSeconds: 1500, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4", order: 1 },
          { lessonId: "les_fullstack_1_2", title: "2. Setting up the Development Environment & Monorepo", duration: "30 mins", durationSeconds: 1800, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-programmer-working-on-a-desktop-computer-42840-large.mp4", order: 2 },
          { lessonId: "les_fullstack_1_3", title: "3. Clean Architecture & Code Organization Best Practices", duration: "35 mins", durationSeconds: 2100, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-in-an-office-42790-large.mp4", order: 3 }
        ]
      },
      {
        sectionId: "sec_fullstack_2",
        title: "Section 2: Robust Backend APIs with Node & Express",
        order: 2,
        duration: "12 hours",
        lessons: [
          { lessonId: "les_fullstack_2_1", title: "4. Express Routing, Middleware & Error Handling Pipeline", duration: "40 mins", durationSeconds: 2400, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-2214-large.mp4", order: 4 },
          { lessonId: "les_fullstack_2_2", title: "5. MongoDB Schema Design, Relationships & Aggregations", duration: "45 mins", durationSeconds: 2700, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4", order: 5 },
          { lessonId: "les_fullstack_2_3", title: "6. Security Hardening: Helmet, Rate Limiting & Input Validation", duration: "35 mins", durationSeconds: 2100, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-programmer-working-on-a-desktop-computer-42840-large.mp4", order: 6 }
        ]
      },
      {
        sectionId: "sec_fullstack_3",
        title: "Section 3: Modern React Frontend & State Management",
        order: 3,
        duration: "12 hours",
        lessons: [
          { lessonId: "les_fullstack_3_1", title: "7. React 19 State, Hooks & Custom Lifecycle Hooks", duration: "40 mins", durationSeconds: 2400, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-in-an-office-42790-large.mp4", order: 7 },
          { lessonId: "les_fullstack_3_2", title: "8. API Data Fetching, Caching & Optimistic UI", duration: "45 mins", durationSeconds: 2700, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-2214-large.mp4", order: 8 },
          { lessonId: "les_fullstack_3_3", title: "9. Building Interactive Dashboards & Data Tables", duration: "35 mins", durationSeconds: 2100, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4", order: 9 }
        ]
      },
      {
        sectionId: "sec_fullstack_4",
        title: "Section 4: Production Deployment & DevOps",
        order: 4,
        duration: "8 hours",
        lessons: [
          { lessonId: "les_fullstack_4_1", title: "10. Containerizing Frontend & Backend with Docker", duration: "40 mins", durationSeconds: 2400, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-programmer-working-on-a-desktop-computer-42840-large.mp4", order: 10 },
          { lessonId: "les_fullstack_4_2", title: "11. Zero-Downtime Deployment & CI/CD Pipelines", duration: "35 mins", durationSeconds: 2100, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-in-an-office-42790-large.mp4", order: 11 }
        ]
      }
    ]
  },
  {
    id: "course-react-frontend-dev",
    slug: "react-frontend-development-mastery",
    title: "React Frontend Development: Server Components & Hooks",
    category: "Web Development",
    categoryId: "web-dev",
    tagline: "Master React 19, Server Components, Concurrent Mode, and performant UI architectures.",
    description: "Deep dive into production-grade React engineering. Learn state management patterns, custom hooks, micro-frontends, rendering optimization, and modern tooling.",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80",
    posterImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80",
    instructor: {
      name: "Priya Sharma",
      role: "Frontend Staff Engineer",
      company: "Kaira Tech Studio",
      bio: "Recognized UI architect specializing in component libraries, web performance, and React design systems.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
      rating: 4.9,
      reviewsCount: 710,
      studentCount: 5100
    },
    duration: "28 Hours",
    level: "Intermediate",
    language: "English",
    price: 499,
    originalPrice: 1999,
    currency: "INR",
    rating: 4.8,
    reviewsCount: 245,
    learnersCount: 2100,
    isFeatured: true,
    outcomes: [
      "Master React 19 Actions, useTransition, and useOptimistic",
      "Architect reusable, accessible component design systems",
      "Diagnose and eliminate unnecessary re-renders with DevTools",
      "Implement robust client-side routing, code splitting, and preloading"
    ],
    prerequisites: ["Strong familiarity with JavaScript ES6+"],
    curriculum: [
      {
        sectionId: "sec_react_1",
        title: "Section 1: Modern React 19 Fundamentals",
        order: 1,
        duration: "8 hours",
        lessons: [
          { lessonId: "les_react_1_1", title: "1. React 19 Core Mental Model & Compilation", duration: "30 mins", durationSeconds: 1800, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4", order: 1 },
          { lessonId: "les_react_1_2", title: "2. Deep Dive into useState, useReducer & Custom Hooks", duration: "35 mins", durationSeconds: 2100, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-programmer-working-on-a-desktop-computer-42840-large.mp4", order: 2 }
        ]
      },
      {
        sectionId: "sec_react_2",
        title: "Section 2: High-Performance Architecture",
        order: 2,
        duration: "10 hours",
        lessons: [
          { lessonId: "les_react_2_1", title: "3. Mastering Memoization, Profiler & Re-render Prevention", duration: "40 mins", durationSeconds: 2400, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-in-an-office-42790-large.mp4", order: 3 },
          { lessonId: "les_react_2_2", title: "4. Suspense, Error Boundaries & Streaming SSR", duration: "35 mins", durationSeconds: 2100, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-2214-large.mp4", order: 4 }
        ]
      },
      {
        sectionId: "sec_react_3",
        title: "Section 3: Production Project & Testing",
        order: 3,
        duration: "10 hours",
        lessons: [
          { lessonId: "les_react_3_1", title: "5. Comprehensive Automated Testing with Vitest & RTL", duration: "45 mins", durationSeconds: 2700, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4", order: 5 },
          { lessonId: "les_react_3_2", title: "6. End-to-End Capstone Project Build & Deployment", duration: "50 mins", durationSeconds: 3000, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-programmer-working-on-a-desktop-computer-42840-large.mp4", order: 6 }
        ]
      }
    ]
  },
  {
    id: "course-nodejs-rest-api",
    slug: "nodejs-rest-api-engineering-microservices",
    title: "Node.js & REST API Development: Microservices & Scaling",
    category: "Backend Engineering",
    categoryId: "backend",
    tagline: "Build enterprise RESTful backends, async event pipelines, authentication, and database layers.",
    description: "Learn how to build resilient, production-ready Node.js backends. Covers event-driven architecture, caching with Redis, SQL and NoSQL integrations, security, and load balancing.",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
    posterImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
    instructor: {
      name: "Amit Joshi",
      role: "Principal Systems Engineer",
      company: "Kaira Tech Studio",
      bio: "Specializes in high-availability backend microservices, caching hierarchies, and database scaling.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      rating: 4.8,
      reviewsCount: 560,
      studentCount: 4300
    },
    duration: "32 Hours",
    level: "Intermediate to Advanced",
    language: "English",
    price: 499,
    originalPrice: 1999,
    currency: "INR",
    rating: 4.8,
    reviewsCount: 180,
    learnersCount: 1750,
    isFeatured: true,
    outcomes: [
      "Design standard REST APIs with idempotency keys and error handling",
      "Implement multi-tier caching with Redis to achieve sub-millisecond latencies",
      "Structure enterprise microservices with event pub/sub messaging",
      "Write comprehensive unit and integration tests with Jest"
    ],
    prerequisites: ["Intermediate JavaScript, basic command line knowledge"],
    curriculum: [
      {
        sectionId: "sec_node_1",
        title: "Section 1: Node.js Internals & Asynchronous Core",
        order: 1,
        duration: "10 hours",
        lessons: [
          { lessonId: "les_node_1_1", title: "1. The Node.js Event Loop, Worker Threads & Streams", duration: "35 mins", durationSeconds: 2100, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4", order: 1 },
          { lessonId: "les_node_1_2", title: "2. Structuring RESTful Controllers, Services & Repositories", duration: "40 mins", durationSeconds: 2400, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-programmer-working-on-a-desktop-computer-42840-large.mp4", order: 2 }
        ]
      },
      {
        sectionId: "sec_node_2",
        title: "Section 2: Caching, Security & Performance",
        order: 2,
        duration: "12 hours",
        lessons: [
          { lessonId: "les_node_2_1", title: "3. Redis Caching Strategies & Distributed Locking", duration: "40 mins", durationSeconds: 2400, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-in-an-office-42790-large.mp4", order: 3 },
          { lessonId: "les_node_2_2", title: "4. Token Revocation, Refresh Tokens & Rate Limiting", duration: "35 mins", durationSeconds: 2100, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-2214-large.mp4", order: 4 }
        ]
      },
      {
        sectionId: "sec_node_3",
        title: "Section 3: Production Deployment & Observability",
        order: 3,
        duration: "10 hours",
        lessons: [
          { lessonId: "les_node_3_1", title: "5. Structured Logging, Tracing & Prometheus Metrics", duration: "40 mins", durationSeconds: 2400, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4", order: 5 },
          { lessonId: "les_node_3_2", title: "6. Production Zero-Downtime Deployment with PM2 & Docker", duration: "45 mins", durationSeconds: 2700, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-programmer-working-on-a-desktop-computer-42840-large.mp4", order: 6 }
        ]
      }
    ]
  },
  {
    id: "course-python-programming",
    slug: "python-programming-core-syntax-to-automation",
    title: "Python Programming: Core Syntax to Advanced Automation",
    category: "Programming Languages",
    categoryId: "python",
    tagline: "Build practical automation scripts, web scrapers, data pipelines, and CLI utilities with Python 3.",
    description: "Learn Python from first principles to professional software engineering. Includes OOP, async programming, data structures, test automation, and interacting with modern APIs.",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    posterImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    instructor: {
      name: "Neha Kapoor",
      role: "Senior Automation Specialist",
      company: "Kaira Tech Studio",
      bio: "Python educator with over a decade of experience designing enterprise automation pipelines and scraping engines.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
      rating: 4.9,
      reviewsCount: 920,
      studentCount: 7800
    },
    duration: "30 Hours",
    level: "All Levels",
    language: "English",
    price: 499,
    originalPrice: 1799,
    currency: "INR",
    rating: 4.9,
    reviewsCount: 380,
    learnersCount: 3400,
    isFeatured: true,
    outcomes: [
      "Write clean, idiomatic Python adhering to PEP 8 standards",
      "Automate repetitive system tasks, file operations, and scheduled scripts",
      "Extract structured data from the web using Beautiful Soup and Playwright",
      "Build command-line interfaces and publish reusable packages"
    ],
    prerequisites: ["No prior programming experience required"],
    curriculum: [
      {
        sectionId: "sec_py_1",
        title: "Section 1: Python Fundamentals & Data Structures",
        order: 1,
        duration: "10 hours",
        lessons: [
          { lessonId: "les_py_1_1", title: "1. Python 3 Syntax, Types, Functions & Comprehensions", duration: "35 mins", durationSeconds: 2100, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4", order: 1 },
          { lessonId: "les_py_1_2", title: "2. Object-Oriented Programming, Classes & Dunder Methods", duration: "40 mins", durationSeconds: 2400, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-programmer-working-on-a-desktop-computer-42840-large.mp4", order: 2 }
        ]
      },
      {
        sectionId: "sec_py_2",
        title: "Section 2: Automation & Data Pipelines",
        order: 2,
        duration: "10 hours",
        lessons: [
          { lessonId: "les_py_2_1", title: "3. Web Scraping & Headless Browser Automation", duration: "45 mins", durationSeconds: 2700, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-in-an-office-42790-large.mp4", order: 3 },
          { lessonId: "les_py_2_2", title: "4. Interacting with REST APIs and Cloud Storage", duration: "35 mins", durationSeconds: 2100, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-2214-large.mp4", order: 4 }
        ]
      },
      {
        sectionId: "sec_py_3",
        title: "Section 3: Testing & Packaging",
        order: 3,
        duration: "10 hours",
        lessons: [
          { lessonId: "les_py_3_1", title: "5. Unit Testing with Pytest & Mocking External APIs", duration: "35 mins", durationSeconds: 2100, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4", order: 5 },
          { lessonId: "les_py_3_2", title: "6. Building and Publishing a PyPI Package", duration: "40 mins", durationSeconds: 2400, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-programmer-working-on-a-desktop-computer-42840-large.mp4", order: 6 }
        ]
      }
    ]
  },
  {
    id: "course-cloud-computing",
    slug: "cloud-computing-fundamentals-aws-azure-architecture",
    title: "Cloud Computing Fundamentals: AWS & Cloud Architecture",
    category: "Cloud & DevOps",
    categoryId: "cloud",
    tagline: "Understand multi-cloud architectures, storage tiers, compute instances, VPC networking, and security.",
    description: "Build foundational cloud engineering skills. Understand virtualization, cloud storage, IAM policies, auto-scaling groups, serverless compute, and cost governance across major providers.",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    posterImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    instructor: {
      name: "Vikramaditya Sen",
      role: "Chief Cloud Architect",
      company: "Kaira Tech Studio",
      bio: "Multi-cloud certified architect with 15+ years experience designing global high-availability infrastructure.",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
      rating: 4.8,
      reviewsCount: 650,
      studentCount: 4900
    },
    duration: "24 Hours",
    level: "Beginner",
    language: "English",
    price: 499,
    originalPrice: 2199,
    currency: "INR",
    rating: 4.8,
    reviewsCount: 190,
    learnersCount: 1680,
    isFeatured: true,
    outcomes: [
      "Understand cloud service models (IaaS, PaaS, SaaS) and deployment types",
      "Configure VPC networks, subnets, route tables, and security groups",
      "Deploy scalable compute instances with load balancers and auto-scaling",
      "Implement identity management and principle of least privilege (IAM)"
    ],
    prerequisites: ["Basic computer networking fundamentals"],
    curriculum: [
      {
        sectionId: "sec_cloud_1",
        title: "Section 1: Core Cloud Infrastructure Concepts",
        order: 1,
        duration: "8 hours",
        lessons: [
          { lessonId: "les_cloud_1_1", title: "1. Cloud Computing Evolution, Availability Zones & Regions", duration: "30 mins", durationSeconds: 1800, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4", order: 1 },
          { lessonId: "les_cloud_1_2", title: "2. Identity & Access Management (IAM) Best Practices", duration: "35 mins", durationSeconds: 2100, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-programmer-working-on-a-desktop-computer-42840-large.mp4", order: 2 }
        ]
      },
      {
        sectionId: "sec_cloud_2",
        title: "Section 2: Compute, Storage & Networking",
        order: 2,
        duration: "8 hours",
        lessons: [
          { lessonId: "les_cloud_2_1", title: "3. Virtual Private Clouds (VPC), Subnets & Gateways", duration: "40 mins", durationSeconds: 2400, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-in-an-office-42790-large.mp4", order: 3 },
          { lessonId: "les_cloud_2_2", title: "4. Cloud Storage Architecture: Block, Object & File Tiers", duration: "35 mins", durationSeconds: 2100, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-2214-large.mp4", order: 4 }
        ]
      },
      {
        sectionId: "sec_cloud_3",
        title: "Section 3: Serverless & Cost Governance",
        order: 3,
        duration: "8 hours",
        lessons: [
          { lessonId: "les_cloud_3_1", title: "5. Serverless Compute (Lambda/Cloud Functions) Workflows", duration: "35 mins", durationSeconds: 2100, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4", order: 5 },
          { lessonId: "les_cloud_3_2", title: "6. Monitoring, Cost Optimization & Budget Alerts", duration: "30 mins", durationSeconds: 1800, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-programmer-working-on-a-desktop-computer-42840-large.mp4", order: 6 }
        ]
      }
    ]
  },
  {
    id: "course-devops-cicd",
    slug: "devops-cicd-github-actions-terraform-gitops",
    title: "DevOps & CI/CD: Automated Pipelines, Terraform & GitOps",
    category: "Cloud & DevOps",
    categoryId: "devops",
    tagline: "Build production continuous delivery pipelines, Infrastructure as Code, and automated testing.",
    description: "Hands-on guide to modern DevOps. Learn GitHub Actions automation, declarative infrastructure provisioning with Terraform, container registries, canary rollouts, and GitOps workflows.",
    thumbnail: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=80",
    posterImage: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=80",
    instructor: {
      name: "Kavita Roy",
      role: "DevOps Engineering Lead",
      company: "Kaira Tech Studio",
      bio: "Automates CI/CD and deployment infrastructure across top FinTech and SaaS enterprise systems.",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
      rating: 4.9,
      reviewsCount: 780,
      studentCount: 5600
    },
    duration: "26 Hours",
    level: "Intermediate",
    language: "English",
    price: 499,
    originalPrice: 2299,
    currency: "INR",
    rating: 4.9,
    reviewsCount: 290,
    learnersCount: 2450,
    isFeatured: true,
    outcomes: [
      "Build end-to-end GitHub Actions pipelines with linting, testing, and Docker builds",
      "Manage cloud resources declaratively using Terraform state and modules",
      "Implement zero-downtime blue/green and canary deployment strategies",
      "Enforce compliance and secrets scanning in continuous integration"
    ],
    prerequisites: ["Basic Linux CLI, Git, and Docker fundamentals"],
    curriculum: [
      {
        sectionId: "sec_devops_1",
        title: "Section 1: Automated CI/CD Pipelines with GitHub Actions",
        order: 1,
        duration: "8 hours",
        lessons: [
          { lessonId: "les_devops_1_1", title: "1. GitHub Actions Workflows, Triggers & Runner Types", duration: "30 mins", durationSeconds: 1800, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4", order: 1 },
          { lessonId: "les_devops_1_2", title: "2. Secrets Management & Automated Release Tagging", duration: "35 mins", durationSeconds: 2100, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-programmer-working-on-a-desktop-computer-42840-large.mp4", order: 2 }
        ]
      },
      {
        sectionId: "sec_devops_2",
        title: "Section 2: Infrastructure as Code with Terraform",
        order: 2,
        duration: "10 hours",
        lessons: [
          { lessonId: "les_devops_2_1", title: "3. Terraform Providers, State Locking & Workspace Config", duration: "40 mins", durationSeconds: 2400, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-in-an-office-42790-large.mp4", order: 3 },
          { lessonId: "les_devops_2_2", title: "4. Modularizing Reusable Infrastructure Code", duration: "35 mins", durationSeconds: 2100, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-2214-large.mp4", order: 4 }
        ]
      },
      {
        sectionId: "sec_devops_3",
        title: "Section 3: GitOps & Continuous Delivery",
        order: 3,
        duration: "8 hours",
        lessons: [
          { lessonId: "les_devops_3_1", title: "5. Declarative Deployments with ArgoCD and GitOps", duration: "40 mins", durationSeconds: 2400, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4", order: 5 },
          { lessonId: "les_devops_3_2", title: "6. Canary Deployments & Automated Rollback Strategies", duration: "35 mins", durationSeconds: 2100, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-programmer-working-on-a-desktop-computer-42840-large.mp4", order: 6 }
        ]
      }
    ]
  },
  {
    id: "course-docker-kubernetes",
    slug: "docker-kubernetes-production-container-orchestration",
    title: "Docker & Kubernetes: Production Container Orchestration",
    category: "Cloud & DevOps",
    categoryId: "containers",
    tagline: "Deploy, scale, and manage resilient containerized applications on Kubernetes clusters.",
    description: "Complete masterclass in containerization and Kubernetes. From writing optimal Dockerfiles to managing ingress, persistent volumes, Helm charts, service meshes, and auto-scaling.",
    thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80",
    posterImage: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80",
    instructor: {
      name: "Arun Prasad",
      role: "Staff Infrastructure Engineer",
      company: "Kaira Tech Studio",
      bio: "Kubernetes core contributor and certified administrator (CKA/CKS) managing production clusters.",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
      rating: 4.9,
      reviewsCount: 890,
      studentCount: 6800
    },
    duration: "35 Hours",
    level: "Intermediate to Advanced",
    language: "English",
    price: 499,
    originalPrice: 2499,
    currency: "INR",
    rating: 4.9,
    reviewsCount: 340,
    learnersCount: 2950,
    isFeatured: true,
    outcomes: [
      "Write multi-stage Dockerfiles optimizing image size and security",
      "Deploy and manage Pods, Deployments, Services, and Ingress Controllers",
      "Configure persistent storage, ConfigMaps, and encrypted Secrets",
      "Package complex applications with Helm charts and automated upgrades"
    ],
    prerequisites: ["Linux CLI basics and foundational networking"],
    curriculum: [
      {
        sectionId: "sec_k8s_1",
        title: "Section 1: Docker Deep Dive & Image Optimization",
        order: 1,
        duration: "10 hours",
        lessons: [
          { lessonId: "les_k8s_1_1", title: "1. Containerization Fundamentals, Namespaces & cgroups", duration: "35 mins", durationSeconds: 2100, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4", order: 1 },
          { lessonId: "les_k8s_1_2", title: "2. Multi-stage Docker Builds & Minimizing Image Vulnerabilities", duration: "40 mins", durationSeconds: 2400, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-programmer-working-on-a-desktop-computer-42840-large.mp4", order: 2 }
        ]
      },
      {
        sectionId: "sec_k8s_2",
        title: "Section 2: Kubernetes Architecture & Workloads",
        order: 2,
        duration: "13 hours",
        lessons: [
          { lessonId: "les_k8s_2_1", title: "3. Cluster Architecture: Control Plane, Nodes & kubelet", duration: "45 mins", durationSeconds: 2700, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-in-an-office-42790-large.mp4", order: 3 },
          { lessonId: "les_k8s_2_2", title: "4. Deployments, Rolling Updates & Horizontal Pod Autoscaling", duration: "40 mins", durationSeconds: 2400, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-2214-large.mp4", order: 4 }
        ]
      },
      {
        sectionId: "sec_k8s_3",
        title: "Section 3: Networking, Storage & Helm Packaging",
        order: 3,
        duration: "12 hours",
        lessons: [
          { lessonId: "les_k8s_3_1", title: "5. Services, Ingress Routing & TLS Certificate Automation", duration: "40 mins", durationSeconds: 2400, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4", order: 5 },
          { lessonId: "les_k8s_3_2", title: "6. Building Reusable Helm Charts & Production Monitoring", duration: "45 mins", durationSeconds: 2700, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-programmer-working-on-a-desktop-computer-42840-large.mp4", order: 6 }
        ]
      }
    ]
  },
  {
    id: "course-cloud-native-security",
    slug: "cloud-native-security-devsecops-zero-trust",
    title: "Cloud-Native Security: DevSecOps & Zero-Trust Defense",
    category: "Cybersecurity",
    categoryId: "security",
    tagline: "Harden containers, manage secrets securely, scan dependencies, and defend cloud infrastructure.",
    description: "Comprehensive cloud-native cybersecurity course. Learn threat modeling, container runtime defense, supply chain security with Sigstore, IAM zero-trust policy, and automated vulnerability scanning.",
    thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
    posterImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
    instructor: {
      name: "Dr. Siddharth Seth",
      role: "Head of Information Security",
      company: "Kaira Tech Studio",
      bio: "Security researcher and CISSP with deep expertise in cloud penetration testing and runtime threat defense.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      rating: 4.9,
      reviewsCount: 620,
      studentCount: 4100
    },
    duration: "22 Hours",
    level: "Intermediate to Advanced",
    language: "English",
    price: 499,
    originalPrice: 2499,
    currency: "INR",
    rating: 4.9,
    reviewsCount: 195,
    learnersCount: 1620,
    isFeatured: true,
    outcomes: [
      "Implement automated SAST, DAST, and container image vulnerability scans",
      "Design zero-trust architectures with strict mutual TLS (mTLS)",
      "Manage sensitive secrets using HashiCorp Vault and cloud KMS",
      "Defend against OWASP Top 10 vulnerabilities in modern web applications"
    ],
    prerequisites: ["Understanding of web protocols and cloud infrastructure"],
    curriculum: [
      {
        sectionId: "sec_sec_1",
        title: "Section 1: Shift-Left Security & Vulnerability Scanning",
        order: 1,
        duration: "7 hours",
        lessons: [
          { lessonId: "les_sec_1_1", title: "1. DevSecOps Principles, Threat Modeling & Pipeline Integration", duration: "35 mins", durationSeconds: 2100, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4", order: 1 },
          { lessonId: "les_sec_1_2", title: "2. Static & Dynamic Code Analysis (SAST/DAST) in CI/CD", duration: "40 mins", durationSeconds: 2400, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-programmer-working-on-a-desktop-computer-42840-large.mp4", order: 2 }
        ]
      },
      {
        sectionId: "sec_sec_2",
        title: "Section 2: Container & Runtime Security",
        order: 2,
        duration: "8 hours",
        lessons: [
          { lessonId: "les_sec_2_1", title: "3. Hardening Docker Containers & Non-root Execution", duration: "35 mins", durationSeconds: 2100, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-in-an-office-42790-large.mp4", order: 3 },
          { lessonId: "les_sec_2_2", title: "4. Kubernetes Pod Security Standards & Network Policies", duration: "45 mins", durationSeconds: 2700, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-2214-large.mp4", order: 4 }
        ]
      },
      {
        sectionId: "sec_sec_3",
        title: "Section 3: Identity & Zero-Trust Defense",
        order: 3,
        duration: "7 hours",
        lessons: [
          { lessonId: "les_sec_3_1", title: "5. Secrets Management with Vault and Ephemeral Credentials", duration: "40 mins", durationSeconds: 2400, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4", order: 5 },
          { lessonId: "les_sec_3_2", title: "6. Zero-Trust Access Control & Incident Response Playbooks", duration: "35 mins", durationSeconds: 2100, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-programmer-working-on-a-desktop-computer-42840-large.mp4", order: 6 }
        ]
      }
    ]
  },
  {
    id: "course-generative-ai-fundamentals",
    slug: "generative-ai-fundamentals-llms-rag-prompt-engineering",
    title: "Generative AI Fundamentals: LLMs, Prompt Engineering & RAG",
    category: "Artificial Intelligence",
    categoryId: "ai-ml",
    tagline: "Build enterprise AI applications using LLMs, vector databases, LangChain, and RAG pipelines.",
    description: "Hands-on Generative AI course for engineers. Learn transformer architectures, embeddings, vector database search, Retrieval-Augmented Generation (RAG), and agentic tool-use.",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80",
    posterImage: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80",
    instructor: {
      name: "Dr. Ananya Raman",
      role: "Principal AI Research Scientist",
      company: "Kaira Tech Studio",
      bio: "AI researcher focusing on autonomous multi-agent pipelines, localized vector embeddings, and reasoning guardrails.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
      rating: 4.9,
      reviewsCount: 1240,
      studentCount: 9400
    },
    duration: "36 Hours",
    level: "Intermediate",
    language: "English",
    price: 499,
    originalPrice: 2999,
    currency: "INR",
    rating: 4.9,
    reviewsCount: 520,
    learnersCount: 4600,
    isFeatured: true,
    outcomes: [
      "Understand foundation model architectures and tokenization mechanics",
      "Engineer production RAG pipelines with chunking and hybrid search",
      "Deploy vector stores (Pinecone, Chroma, pgvector) with low latency",
      "Build autonomous agents that invoke real tools and APIs"
    ],
    prerequisites: ["Python proficiency and basic understanding of APIs"],
    curriculum: [
      {
        sectionId: "sec_genai_1",
        title: "Section 1: LLM Architecture & Prompt Engineering",
        order: 1,
        duration: "10 hours",
        lessons: [
          { lessonId: "les_genai_1_1", title: "1. Transformers, Self-Attention & Generation Mechanics", duration: "40 mins", durationSeconds: 2400, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4", order: 1 },
          { lessonId: "les_genai_1_2", title: "2. Systematic Prompt Engineering: Few-Shot, CoT & Structured Outputs", duration: "45 mins", durationSeconds: 2700, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-programmer-working-on-a-desktop-computer-42840-large.mp4", order: 2 }
        ]
      },
      {
        sectionId: "sec_genai_2",
        title: "Section 2: Embeddings & Vector Search (RAG)",
        order: 2,
        duration: "14 hours",
        lessons: [
          { lessonId: "les_genai_2_1", title: "3. Vector Embeddings, Similarity Metrics & Chunking Strategies", duration: "45 mins", durationSeconds: 2700, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-in-an-office-42790-large.mp4", order: 3 },
          { lessonId: "les_genai_2_2", title: "4. Building Production RAG with Vector Stores and Re-ranking", duration: "50 mins", durationSeconds: 3000, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-2214-large.mp4", order: 4 }
        ]
      },
      {
        sectionId: "sec_genai_3",
        title: "Section 3: AI Agents & Production Deployment",
        order: 3,
        duration: "12 hours",
        lessons: [
          { lessonId: "les_genai_3_1", title: "5. Autonomous Agent Architectures & Model Context Protocol (MCP)", duration: "45 mins", durationSeconds: 2700, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4", order: 5 },
          { lessonId: "les_genai_3_2", title: "6. Production Guardrails, Hallucination Checks & Cost Budgeting", duration: "40 mins", durationSeconds: 2400, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-programmer-working-on-a-desktop-computer-42840-large.mp4", order: 6 }
        ]
      }
    ]
  },
  {
    id: "course-data-analytics-python",
    slug: "data-analytics-python-pandas-numpy-powerbi",
    title: "Data Analytics with Python: Pandas, NumPy & Modeling",
    category: "Data Science",
    categoryId: "data-science",
    tagline: "Analyze large datasets, generate insights, clean messy data, and build visual business dashboards.",
    description: "Learn practical data analytics with Python. Master Pandas for data manipulation, NumPy for numerical operations, Matplotlib/Seaborn for visual storytelling, and exploratory data analysis (EDA).",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    posterImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    instructor: {
      name: "Pooja Sundaram",
      role: "Lead Analytics Consultant",
      company: "Kaira Tech Studio",
      bio: "Data analytics expert transforming enterprise data warehouses into actionable predictive metrics.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
      rating: 4.8,
      reviewsCount: 540,
      studentCount: 4200
    },
    duration: "28 Hours",
    level: "All Levels",
    language: "English",
    price: 499,
    originalPrice: 2199,
    currency: "INR",
    rating: 4.8,
    reviewsCount: 220,
    learnersCount: 2050,
    isFeatured: true,
    outcomes: [
      "Clean, filter, and transform messy real-world datasets with Pandas",
      "Perform exploratory data analysis (EDA) and identify hidden patterns",
      "Create publication-quality visualizations with Seaborn and Plotly",
      "Build statistical hypothesis tests and regression models"
    ],
    prerequisites: ["Basic Python familiarity or eagerness to learn"],
    curriculum: [
      {
        sectionId: "sec_data_1",
        title: "Section 1: Data Wrangling with Pandas & NumPy",
        order: 1,
        duration: "10 hours",
        lessons: [
          { lessonId: "les_data_1_1", title: "1. NumPy Array Computation & Vectorized Math Operations", duration: "35 mins", durationSeconds: 2100, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4", order: 1 },
          { lessonId: "les_data_1_2", title: "2. Pandas Series, DataFrames, Missing Value Imputation", duration: "45 mins", durationSeconds: 2700, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-programmer-working-on-a-desktop-computer-42840-large.mp4", order: 2 }
        ]
      },
      {
        sectionId: "sec_data_2",
        title: "Section 2: Exploratory Data Analysis & Visualizations",
        order: 2,
        duration: "10 hours",
        lessons: [
          { lessonId: "les_data_2_1", title: "3. Exploratory Data Analysis (EDA) Workflow on Real Datasets", duration: "40 mins", durationSeconds: 2400, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-in-an-office-42790-large.mp4", order: 3 },
          { lessonId: "les_data_2_2", title: "4. Interactive Dashboards with Plotly & Streamlit", duration: "45 mins", durationSeconds: 2700, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-2214-large.mp4", order: 4 }
        ]
      },
      {
        sectionId: "sec_data_3",
        title: "Section 3: Statistical Modeling & Capstone",
        order: 3,
        duration: "8 hours",
        lessons: [
          { lessonId: "les_data_3_1", title: "5. Statistical Hypothesis Testing & Correlation Analysis", duration: "40 mins", durationSeconds: 2400, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4", order: 5 },
          { lessonId: "les_data_3_2", title: "6. End-to-End Business Analytics Capstone Presentation", duration: "45 mins", durationSeconds: 2700, videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-programmer-working-on-a-desktop-computer-42840-large.mp4", order: 6 }
        ]
      }
    ]
  }
];

module.exports = seedCourses;
