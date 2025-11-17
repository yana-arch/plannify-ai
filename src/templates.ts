import type { TemplateData } from './types';

// Helper function to safely handle Vietnamese characters
const sanitizeVietnameseText = (text: string): string => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const projectTemplates: TemplateData[] = [
  {
    projectName: "Standard Web App",
    shortDescription: "A modern, responsive web application with user authentication and a dynamic frontend.",
    businessGoals: "Engage users with a seamless web experience and capture market share.",
    technicalGoals: "Build a scalable and maintainable codebase.",
    targetUsers: ["General Public", "Web Users"],
    numberOfFeatures: 15,
    estimatedScale: "$25K-$75K",
    timeline: "4-6 months",
    coreRequirements: [
        { id: "1", description: "User registration and login (email/password, OAuth)", priority: 'High' },
        { id: "2", description: "User profile management", priority: 'High' },
        { id: "3", description: "Admin dashboard for user management", priority: 'Medium' },
    ],
    userFeatureRequests: "",
    coreModules: [],
    rolePermissions: [],
    standardFlows: [],
    techStack: {
      frontend: ["React", "TypeScript", "Tailwind CSS"],
      backend: ["Node.js", "Express.js"],
      database: ["PostgreSQL"],
      otherTools: ["Vite", "Jest", "Docker"],
    },
    marketAnalysis: "The market for general web applications is vast. Success depends on finding a niche and providing a superior user experience compared to existing solutions.",
    competitors: ["Generic SaaS tools", "Custom-built internal apps"],
    riskAssessment: [
      {
        risk: "User data privacy breach",
        impact: 'High',
        probability: 'Low',
        mitigation: "Implement strong encryption, regular security audits, and follow data privacy best practices."
      },
      {
        risk: "Scalability issues with user growth",
        impact: 'Medium',
        probability: 'Medium',
        mitigation: "Design a scalable architecture from the start, use load balancing, and monitor performance."
      }
    ],
    featureDependencies: {
      "1": [],
      "2": ["1"],
      "3": ["1"]
    },
    successMetrics: [
      {
        metric: "User acquisition rate",
        target: "1000 new users in the first 3 months",
        timeframe: "3 months"
      },
      {
        metric: "User engagement",
        target: "50% of users active weekly",
        timeframe: "6 months"
      }
    ],
    meta: {
      category: 'web_app',
      size: 'medium',
      tags: ['standard', 'web', 'auth'],
    },
  },
  {
    projectName: "Mobile App Backend",
    shortDescription: "A robust backend service to support a mobile application, with a focus on API performance and security.",
    businessGoals: "Provide reliable data and services for the mobile app, ensuring a smooth user experience.",
    technicalGoals: "99.99% API uptime, sub-200ms response times, secure data storage.",
    targetUsers: ["Mobile App Users", "App Developers"],
    numberOfFeatures: 25,
    estimatedScale: "$50K-$150K",
    timeline: "6-9 months",
     coreRequirements: [
        { id: "1", description: "Secure RESTful API with JWT authentication", priority: 'High' },
        { id: "2", description: "Push notification service integration", priority: 'High' },
        { id: "3", description: "User data storage with encryption", priority: 'High' },
        { id: "4", description: "Image and media upload/storage", priority: 'Medium' },
    ],
    userFeatureRequests: "",
    coreModules: [],
    rolePermissions: [],
    standardFlows: [],
    techStack: {
      frontend: [],
      backend: ["Python", "Django Rest Framework", "Celery"],
      database: ["PostgreSQL", "Redis"],
      otherTools: ["Docker", "S3 for storage", "Pytest"],
    },
    marketAnalysis: "The success of a mobile backend is directly tied to the success of the mobile app it serves. The market requires high reliability and scalability to handle fluctuating user loads.",
    competitors: ["Firebase", "Supabase", "AWS Amplify"],
    riskAssessment: [
      {
        risk: "API security vulnerabilities",
        impact: 'High',
        probability: 'Medium',
        mitigation: "Implement robust authentication, input validation, and regular security testing (pentesting)."
      },
      {
        risk: "Data synchronization issues with mobile clients",
        impact: 'Medium',
        probability: 'High',
        mitigation: "Design a clear API contract, use versioning, and implement offline-first strategies on the client."
      }
    ],
    featureDependencies: {
      "1": [],
      "2": ["1"],
      "3": ["1"],
      "4": ["1", "3"]
    },
    successMetrics: [
      {
        metric: "API response time",
        target: "Average response time < 200ms",
        timeframe: "Ongoing"
      },
      {
        metric: "API uptime",
        target: "99.9% uptime",
        timeframe: "Ongoing"
      }
    ],
    meta: {
      category: 'backend_service',
      size: 'large',
      tags: ['mobile', 'api', 'backend'],
    },
  },
  {
    projectName: "Data Analytics Dashboard",
    shortDescription: "An internal dashboard for visualizing and analyzing business intelligence data from multiple sources.",
    businessGoals: "Empower business teams to make data-driven decisions by providing real-time insights.",
    technicalGoals: "Efficiently process large datasets, provide interactive visualizations.",
    targetUsers: ["Data Analysts", "Business Managers", "Executives"],
    numberOfFeatures: 30,
    estimatedScale: "$100K-$250K",
    timeline: "5-8 months",
    userFeatureRequests: "",
    coreModules: [
      {
        moduleName: "Data Integration",
        description: "Connect and ingest data from various sources including databases, APIs, and external services.",
        flows: [
          "Data Source Connection Flow",
          "Data Pipeline Setup Flow",
          "Data Validation & Cleaning Flow",
          "Scheduled Data Refresh Flow"
        ]
      },
      {
        moduleName: "Visualization Engine",
        description: "Create and manage interactive charts, graphs, and dashboards with custom configurations.",
        flows: [
          "Chart Creation & Configuration Flow",
          "Dashboard Assembly & Layout Flow",
          "Interactive Filtering Flow",
          "Export & Sharing Flow"
        ]
      },
      {
        moduleName: "User Management",
        description: "Manage user access, roles, and permissions for data security and governance.",
        flows: [
          "User Registration Flow",
          "Role Assignment Flow",
          "Permission Management Flow",
          "Access Audit Flow"
        ]
      },
      {
        moduleName: "Reporting",
        description: "Generate scheduled reports and automated alerts based on data insights.",
        flows: [
          "Report Template Creation Flow",
          "Scheduled Report Generation Flow",
          "Alert Configuration Flow",
          "Report Delivery Flow"
        ]
      }
    ],
    rolePermissions: [
      {
        role: "Data Analysts",
        permissions: [
          "Create and modify dashboards",
          "Access all data sources",
          "Design custom visualizations",
          "Generate ad-hoc reports",
          "Share insights with team members"
        ]
      },
      {
        role: "Business Managers",
        permissions: [
          "View assigned dashboards",
          "Access predefined reports",
          "Filter and drill-down data",
          "Receive automated alerts",
          "Export basic reports"
        ]
      },
      {
        role: "Executives",
        permissions: [
          "View executive summary dashboards",
          "Access high-level KPIs",
          "Receive strategic reports",
          "View trend analysis",
          "Access real-time metrics"
        ]
      }
    ],
    standardFlows: [
      {
        flowName: "Dashboard Creation Flow",
        steps: [
          "Analyst selects data sources",
          "System validates data permissions",
          "Analyst configures visualizations",
          "Dashboard layout is designed",
          "Access permissions are set",
          "Dashboard is published and shared"
        ]
      },
      {
        flowName: "Data Alert Flow",
        steps: [
          "Automated monitoring checks data thresholds",
          "Alert conditions are triggered",
          "System notifies relevant users",
          "Users review alert details",
          "Action items are created if needed"
        ]
      }
    ],
    coreRequirements: [
        { id: "1", description: "Integration with multiple data sources (SQL, NoSQL, APIs)", priority: 'High' },
        { id: "2", description: "Customizable and interactive charts and graphs", priority: 'High' },
        { id: "3", description: "Role-based access control to dashboards", priority: 'Medium' },
        { id: "4", description: "Scheduled report generation and email delivery", priority: 'Low' },
    ],
    techStack: {
      frontend: ["SvelteKit", "TypeScript", "D3.js"],
      backend: ["Python", "Flask"],
      database: ["Snowflake", "ClickHouse"],
      otherTools: ["Airflow", "Docker", "Pandas"],
    },
    riskAssessment: [
      {
        risk: "Data quality issues affecting dashboard accuracy",
        impact: 'High',
        probability: 'Medium',
        mitigation: "Implement robust data validation, monitoring, and cleansing processes with automated quality checks."
      },
      {
        risk: "Performance degradation with large datasets",
        impact: 'Medium',
        probability: 'High',
        mitigation: "Use efficient data structures, implement caching layers, and optimize queries with proper indexing."
      },
      {
        risk: "Data security and privacy breaches",
        impact: 'High',
        probability: 'Low',
        mitigation: "Encrypt sensitive data, implement role-based access control, and conduct regular security audits."
      }
    ],
    featureDependencies: {
      "1": ["Data source connections", "Authentication system"],
      "2": ["Visualization library", "Data processing pipeline"],
      "3": ["User management", "Access control"],
      "4": ["Report scheduling", "Email service"]
    },
    successMetrics: [
      {
        metric: "Data processing and dashboard load times",
        target: "<5 seconds for dashboard loading",
        timeframe: "6 months"
      },
      {
        metric: "User adoption and engagement",
        target: "70% of target users actively using dashboards weekly",
        timeframe: "12 months"
      },
      {
        metric: "Data accuracy and reliability",
        target: "95% data accuracy with <1% error rate",
        timeframe: "Ongoing"
      }
    ],
    marketAnalysis: "Internal tools market is focused on increasing efficiency. Key selling points are ease of use, powerful features, and seamless integration with existing company data stacks.",
    competitors: ["Tableau", "PowerBI", "Looker", "Metabase"],
    meta: {
      category: 'dashboard_analytics',
      size: 'large',
      tags: ['bi', 'analytics', 'internal'],
    },
  },
  {
    projectName: "E-commerce Platform",
    shortDescription: "A feature-rich e-commerce platform with a product catalog, shopping cart, and secure checkout process.",
    businessGoals: "Drive online sales, increase customer retention, and provide a seamless shopping experience.",
    technicalGoals: "Ensure high availability during peak traffic, secure payment processing, and fast page load times (Core Web Vitals).",
    targetUsers: ["Online Shoppers", "Store Administrators"],
    numberOfFeatures: 20,
    estimatedScale: "$80K-$200K",
    timeline: "7-10 months",
    userFeatureRequests: "",
    coreModules: [
      {
        moduleName: "Product Catalog",
        description: "Manage product information, categories, inventory, and pricing with rich media support.",
        flows: [
          "Product Creation & Management Flow",
          "Category Organization Flow",
          "Inventory Tracking Flow",
          "Price Management Flow"
        ]
      },
      {
        moduleName: "Shopping Experience",
        description: "Handle product browsing, search, cart management, and checkout process for customers.",
        flows: [
          "Product Discovery Flow",
          "Cart Management Flow",
          "Checkout & Payment Flow",
          "Order Confirmation Flow"
        ]
      },
      {
        moduleName: "Order Management",
        description: "Process and fulfill orders, handle returns, and manage customer communications.",
        flows: [
          "Order Processing Flow",
          "Shipping & Fulfillment Flow",
          "Return & Refund Management Flow",
          "Customer Service Flow"
        ]
      },
      {
        moduleName: "Analytics & Reporting",
        description: "Track sales performance, customer behavior, and business metrics with insights.",
        flows: [
          "Sales Analytics Flow",
          "Customer Behavior Tracking Flow",
          "Inventory Optimization Flow",
          "Financial Reporting Flow"
        ]
      }
    ],
    rolePermissions: [
      {
        role: "Store Administrators",
        permissions: [
          "Full system access",
          "Manage products and categories",
          "Handle orders and returns",
          "Configure payment methods",
          "Access all analytics and reports"
        ]
      },
      {
        role: "Online Shoppers",
        permissions: [
          "Browse products and categories",
          "Add items to cart and checkout",
          "View order history and status",
          "Manage shipping addresses",
          "Leave product reviews"
        ]
      }
    ],
    standardFlows: [
      {
        flowName: "Purchase Flow",
        steps: [
          "Customer browses products",
          "Adds items to cart",
          "Initiates checkout process",
          "Provides shipping and payment information",
          "Completes purchase and receives confirmation",
          "Order is processed and shipped"
        ]
      },
      {
        flowName: "Product Management Flow",
        steps: [
          "Administrator logs into admin panel",
          "Creates or edits product information",
          "Uploads product images and sets pricing",
          "Configures inventory levels",
          "Publishes product to store",
          "Monitors sales and adjusts as needed"
        ]
      }
    ],
    coreRequirements: [
      { id: "1", description: "Product catalog with categories, filtering, and search", priority: 'High' },
      { id: "2", description: "Shopping cart and multi-step checkout flow", priority: 'High' },
      { id: "3", description: "Integration with a payment gateway (e.g., Stripe, PayPal)", priority: 'High' },
      { id: "4", description: "Order management dashboard for administrators", priority: 'Medium' },
    ],
    techStack: {
      frontend: ["Next.js", "TypeScript", "Redux Toolkit"],
      backend: ["Node.js", "Express.js", "Stripe SDK"],
      database: ["MongoDB"],
      otherTools: ["Vercel", "Docker", "Jest"],
    },
    riskAssessment: [
      {
        risk: "Payment processing failures during peak traffic",
        impact: 'High',
        probability: 'Medium',
        mitigation: "Implement multiple payment gateways, proper error handling, and transaction monitoring with automatic failover."
      },
      {
        risk: "Inventory synchronization issues leading to overselling",
        impact: 'Medium',
        probability: 'High',
        mitigation: "Use atomic inventory updates, implement real-time stock tracking, and add inventory alerts for low stock levels."
      },
      {
        risk: "Data breaches exposing customer payment information",
        impact: 'High',
        probability: 'Low',
        mitigation: "Comply with PCI DSS standards, use encryption for sensitive data, and conduct regular security audits and penetration testing."
      }
    ],
    featureDependencies: {
      "1": ["Database setup", "Media storage"],
      "2": ["Product catalog", "User accounts"],
      "3": ["Payment gateway integration", "SSL certificates"],
      "4": ["Order management", "Email notifications"]
    },
    successMetrics: [
      {
        metric: "Conversion rate from visitor to customer",
        target: "3-5% conversion rate",
        timeframe: "3 months"
      },
      {
        metric: "Average order value and customer lifetime value",
        target: "Increase AOV by 20% within 6 months",
        timeframe: "6 months"
      },
      {
        metric: "Site uptime and performance",
        target: "99.9% uptime with <2s page load times",
        timeframe: "Ongoing"
      }
    ],
    marketAnalysis: "The e-commerce market is highly competitive. Differentiation can be achieved through niche products, superior user experience, or building a strong brand community.",
    competitors: ["Shopify", "BigCommerce", "WooCommerce", "Magento"],
    meta: {
      category: 'ecommerce',
      size: 'large',
      tags: ['store', 'checkout', 'payments'],
    },
  },
  {
    projectName: "B2B SaaS Platform",
    shortDescription: "A multi-tenant SaaS application with subscription billing and role-based access control.",
    businessGoals: "Acquire and retain business customers through a valuable and reliable service, based on a recurring revenue model.",
    technicalGoals: "Build a secure, scalable multi-tenant architecture. Implement a reliable subscription and billing system.",
    targetUsers: ["Business Users", "Team Admins", "Company Owners"],
    numberOfFeatures: 35,
    estimatedScale: "$150K-$500K",
    timeline: "9-12 months",
    userFeatureRequests: "",
    coreModules: [
      {
        moduleName: "User & Organization Management",
        description: "Handle multi-tenant user accounts, organization hierarchies, and team management.",
        flows: [
          "Organization Setup Flow",
          "User Invitation & Onboarding Flow",
          "Team Hierarchy Management Flow",
          "Account Suspension/Reactivation Flow"
        ]
      },
      {
        moduleName: "Subscription & Billing",
        description: "Manage subscription plans, billing cycles, payments, and plan upgrades/downgrades.",
        flows: [
          "Subscription Plan Selection Flow",
          "Billing Cycle Management Flow",
          "Payment Processing Flow",
          "Plan Change & Proration Flow"
        ]
      },
      {
        moduleName: "Access Control & Security",
        description: "Implement role-based permissions, data isolation, and security compliance.",
        flows: [
          "Role Assignment & Permission Flow",
          "Data Access Control Flow",
          "Security Audit & Compliance Flow",
          "Multi-Tenant Data Isolation Flow"
        ]
      },
      {
        moduleName: "Core Business Feature",
        description: "The main functionality of the SaaS platform (e.g., project management, CRM, or other business tool).",
        flows: [
          "Feature Core Functionality Flow",
          "Collaboration & Sharing Flow",
          "Data Export & Integration Flow",
          "Custom Workflow Creation Flow"
        ]
      }
    ],
    rolePermissions: [
      {
        role: "Company Owners",
        permissions: [
          "Full organization access",
          "Manage subscription and billing",
          "Configure organization settings",
          "Access all company data and reports"
        ]
      },
      {
        role: "Team Admins",
        permissions: [
          "Manage team members",
          "Configure team permissions",
          "Access team analytics",
          "Customize team-specific features"
        ]
      },
      {
        role: "Business Users",
        permissions: [
          "Access assigned features and data",
          "Collaborate with team members",
          "Generate personal reports",
          "Customize personal dashboard"
        ]
      }
    ],
    standardFlows: [
      {
        flowName: "Organization Onboarding Flow",
        steps: [
          "Owner creates organization account",
          "System sets up tenant isolation",
          "Owner configures initial settings",
          "Team members are invited",
          "Subscription is activated and billing begins"
        ]
      },
      {
        flowName: "Subscription Management Flow",
        steps: [
          "Owner reviews current plan and usage",
          "System suggests upgrades or downgrades",
          "Owner selects new plan",
          "Payment is processed with proration",
          "New plan features are activated"
        ]
      }
    ],
    coreRequirements: [
      { id: "1", description: "User authentication with team/organization support", priority: 'High' },
      { id: "2", description: "Subscription plans and billing integration (e.g., Chargebee, Stripe)", priority: 'High' },
      { id: "3", description: "Role-Based Access Control (RBAC) within teams", priority: 'High' },
      { id: "4", description: "A core feature specific to the SaaS product (e.g., project management, CRM)", priority: 'High' },
    ],
    techStack: {
      frontend: ["React", "Vite", "Tailwind CSS"],
      backend: ["Ruby on Rails", "Sidekiq"],
      database: ["PostgreSQL"],
      otherTools: ["Heroku", "Stripe Billing", "RSpec"],
    },
    riskAssessment: [
      {
        risk: "Data isolation failures between tenants leading to data leakage",
        impact: 'High',
        probability: 'Low',
        mitigation: "Implement strict database row-level security, conduct regular tenant data isolation testing, and use encrypted tenant-specific keys."
      },
      {
        risk: "Subscription billing errors causing customer dissatisfaction",
        impact: 'High',
        probability: 'Medium',
        mitigation: "Implement robust billing logic with comprehensive testing, integrate with reliable payment processors, and provide clear billing transparency."
      },
      {
        risk: "Single point of failure in multi-tenant architecture",
        impact: 'Medium',
        probability: 'Low',
        mitigation: "Deploy redundant architecture with automatic failover, implement circuit breakers, and conduct regular disaster recovery testing."
      }
    ],
    featureDependencies: {
      "1": ["User authentication", "Multi-tenant database schema"],
      "2": ["Payment gateway integration", "Invoice generation"],
      "3": ["Role management system", "Access control"],
      "4": ["Core business logic", "API endpoints"]
    },
    successMetrics: [
      {
        metric: "Monthly recurring revenue (MRR) growth",
        target: "20% month-over-month growth in first 12 months",
        timeframe: "Ongoing"
      },
      {
        metric: "Customer churn rate",
        target: "<5% monthly churn rate",
        timeframe: "Ongoing"
      },
      {
        metric: "Customer acquisition cost (CAC) payback period",
        target: "<12 months",
        timeframe: "Annual"
      }
    ],
    marketAnalysis: "B2B SaaS is about solving a specific business problem more efficiently than existing solutions. Customer support and reliability are paramount. The sales cycle is longer, but customer lifetime value is higher.",
    competitors: ["Salesforce", "Atlassian Jira", "HubSpot", "Various niche competitors"],
    meta: {
      category: 'b2b_saas',
      size: 'large',
      tags: ['subscription', 'multi-tenant', 'rbac'],
    },
  },
  {
    projectName: "AI/ML Model API Service",
    shortDescription: "A scalable API service for serving a machine learning model for tasks like image recognition or NLP.",
    businessGoals: "Provide a reliable, high-performance API for developers to integrate AI capabilities into their applications.",
    technicalGoals: "Low-latency model inference, high throughput, robust API key management, and easy deployment.",
    targetUsers: ["Developers", "Data Scientists"],
    numberOfFeatures: 10,
    estimatedScale: "$40K-$120K",
    timeline: "3-5 months",
    userFeatureRequests: "",
    coreModules: [
      {
        moduleName: "Model Management",
        description: "Handle model deployment, versioning, scaling, and performance monitoring.",
        flows: [
          "Model Deployment Flow",
          "Version Control Flow",
          "Auto-scaling Flow",
          "Performance Monitoring Flow"
        ]
      },
      {
        moduleName: "API Gateway",
        description: "Manage authentication, rate limiting, request routing, and API documentation.",
        flows: [
          "Authentication & Authorization Flow",
          "Rate Limiting Flow",
          "Request Routing Flow",
          "API Documentation Generation Flow"
        ]
      },
      {
        moduleName: "Usage Analytics",
        description: "Track API usage, billing, analytics, and provide insights to developers.",
        flows: [
          "Usage Tracking Flow",
          "Billing & Invoicing Flow",
          "Analytics Dashboard Flow",
          "Developer Portal Access Flow"
        ]
      },
      {
        moduleName: "Infrastructure Management",
        description: "Manage compute resources, monitoring, logging, and deployment automation.",
        flows: [
          "Resource Provisioning Flow",
          "Monitoring & Alerting Flow",
          "Logging & Tracing Flow",
          "CI/CD Pipeline Flow"
        ]
      }
    ],
    rolePermissions: [
      {
        role: "Developers",
        permissions: [
          "Access API documentation",
          "Generate API keys",
          "View usage statistics",
          "Test API endpoints",
          "Access developer support"
        ]
      },
      {
        role: "Data Scientists",
        permissions: [
          "Monitor model performance",
          "Submit model updates",
          "Access advanced analytics",
          "Request model retraining",
          "Access training data insights"
        ]
      }
    ],
    standardFlows: [
      {
        flowName: "API Access Setup Flow",
        steps: [
          "Developer registers for account",
          "Generates API keys with appropriate permissions",
          "Configures rate limits and usage plans",
          "Accesses API documentation and testing tools",
          "Begins integration and testing"
        ]
      },
      {
        flowName: "Model Inference Flow",
        steps: [
          "Client sends authenticated request with data",
          "API gateway validates request and rate limits",
          "Request routed to appropriate model instance",
          "Model processes inference and returns result",
          "Response logged and usage tracked"
        ]
      }
    ],
    coreRequirements: [
      { id: "1", description: "A secure API endpoint for model inference", priority: 'High' },
      { id: "2", description: "API key authentication and usage tracking/rate limiting", priority: 'High' },
      { id: "3", description: "Infrastructure for model deployment and versioning", priority: 'Medium' },
      { id: "4", description: "Clear API documentation for developers", priority: 'High' },
    ],
    techStack: {
      frontend: [],
      backend: ["Python", "FastAPI", "Go", "NVIDIA Triton Inference Server", "Pytorch/TensorFlow"],
      database: ["Redis (for caching)"],
      otherTools: ["Docker", "Kubernetes/SageMaker", "Prometheus", "Grafana"],
    },
    riskAssessment: [
      {
        risk: "Model performance degradation over time due to data drift",
        impact: 'Medium',
        probability: 'High',
        mitigation: "Implement continuous monitoring, automated retraining pipelines, and regular model validation against ground truth data."
      },
      {
        risk: "API service unavailability affecting dependent applications",
        impact: 'High',
        probability: 'Medium',
        mitigation: "Deploy across multiple availability zones, implement automatic failover, and provide clear SLA guarantees."
      },
      {
        risk: "Security vulnerabilities in model inference exposing sensitive data",
        impact: 'High',
        probability: 'Low',
        mitigation: "Use secure model serving frameworks, implement input validation, sanitize outputs, and conduct regular security audits."
      }
    ],
    featureDependencies: {
      "1": ["Secure API gateway", "Model serving infrastructure"],
      "2": ["Authentication system", "Usage tracking database"],
      "3": ["Model versioning system", "CI/CD pipeline"],
      "4": ["Documentation generation", "Developer portal"]
    },
    successMetrics: [
      {
        metric: "API response time and throughput",
        target: "<100ms average latency, 1000+ requests/second",
        timeframe: "3 months"
      },
      {
        metric: "API uptime and reliability",
        target: "99.9% uptime with clear SLA terms",
        timeframe: "Ongoing"
      },
      {
        metric: "Developer adoption and API usage growth",
        target: "50% month-over-month usage increase",
        timeframe: "6 months"
      }
    ],
    marketAnalysis: "The AI API market is rapidly growing. Success hinges on the quality and uniqueness of the underlying model, as well as the reliability and ease of use of the API.",
    competitors: ["OpenAI API", "Hugging Face Inference API", "Google Cloud AI", "AWS AI Services"],
    meta: {
      category: 'ai_api',
      size: 'medium',
      tags: ['ml', 'api', 'inference'],
    },
  },
  {
    projectName: "School Management System",
    shortDescription: "Comprehensive educational management system for schools, covering students, staff, inventory, products, and events with detailed role-based flows.",
    businessGoals: "Centralize management for schools, reduce administrative overhead, and improve communication between departments and staff.",
    technicalGoals: "Implement a secure, modular, and scalable education management system with standardized workflows.",
    targetUsers: [
      "Giám đốc",
      "Hiệu trưởng",
      "Quản lý",
      "Trưởng khoa",
      "Giáo viên",
      "Thư ký",
      "Học sinh"
    ],
    numberOfFeatures: 30,
    estimatedScale: "$80K-$150K",
    timeline: "8-12 months",
    userFeatureRequests: "",
    coreModules: [
      {
        moduleName: "Student Management",
        description: "Manage student data, enrollment, attendance, grades, tuition, and communication.",
        flows: [
          "Student Registration Flow",
          "Enrollment & Class Assignment Flow",
          "Attendance Tracking Flow",
          "Grade Input & Review Flow",
          "Tuition Payment Flow",
          "Parent/Student Portal Access Flow"
        ]
      },
      {
        moduleName: "Staff Management",
        description: "Manage teacher and staff records, departments, attendance, salary, and performance.",
        flows: [
          "Staff Onboarding Flow",
          "Attendance and Leave Approval Flow",
          "Salary Calculation & Approval Flow",
          "Performance Evaluation Flow"
        ]
      },
      {
        moduleName: "Inventory Management",
        description: "Track and manage school inventory, supplies, uniforms, and educational materials.",
        flows: [
          "Item Procurement Flow",
          "Stock Entry Flow",
          "Item Distribution to Departments Flow",
          "Maintenance & Disposal Flow"
        ]
      },
      {
        moduleName: "Product Management",
        description: "Handle internal product sales (books, uniforms, stationery) and billing.",
        flows: [
          "Product Catalog Management Flow",
          "Internal Sales Order Flow",
          "Stock & Reorder Notification Flow",
          "Payment & Invoice Generation Flow"
        ]
      },
      {
        moduleName: "Event Management",
        description: "Organize and track school events, competitions, and meetings.",
        flows: [
          "Event Proposal & Approval Flow",
          "Event Registration Flow",
          "Event Budget & Resource Allocation Flow",
          "Event Evaluation & Report Flow"
        ]
      },
      {
        moduleName: "Role & Permission Management",
        description: "Define and control what each role can do across modules.",
        flows: [
          "Role Definition Flow",
          "Permission Assignment Flow",
          "Access Validation Flow"
        ]
      }
    ],
    rolePermissions: [
      {
        role: "Giám đốc",
        permissions: [
          "Full system access",
          "Approve budgets and salaries",
          "View financial and academic reports",
          "Manage administrators"
        ]
      },
      {
        role: "Hiệu trưởng",
        permissions: [
          "Manage staff and student data",
          "Oversee events and academic performance",
          "Approve department requests",
          "Generate school-wide reports"
        ]
      },
      {
        role: "Quản lý",
        permissions: [
          "Manage inventory and products",
          "Handle purchase orders",
          "Approve warehouse transactions",
          "View performance summaries"
        ]
      },
      {
        role: "Trưởng khoa",
        permissions: [
          "Oversee classes and teachers in the department",
          "Approve grades and schedules",
          "Manage department-specific events",
          "Generate department reports"
        ]
      },
      {
        role: "Giáo viên",
        permissions: [
          "Manage assigned classes",
          "Take attendance and input grades",
          "Communicate with students",
          "Participate in events"
        ]
      },
      {
        role: "Thư ký",
        permissions: [
          "Support data entry and scheduling",
          "Prepare reports and documents",
          "Assist in event logistics",
          "Manage announcements"
        ]
      },
      {
        role: "Học sinh",
        permissions: [
          "View grades and attendance",
          "Register for events",
          "Pay tuition and download invoices",
          "Receive notifications from teachers or school"
        ]
      }
    ],
    standardFlows: [
      {
        flowName: "Student Registration Flow",
        steps: [
          "Student submits registration form",
          "Thư ký kiểm tra và xác nhận hồ sơ",
          "Hiệu trưởng duyệt nhập học",
          "Học sinh được gán vào lớp và khoa tương ứng"
        ]
      },
      {
        flowName: "Attendance Tracking Flow",
        steps: [
          "Giáo viên điểm danh theo lớp",
          "Hệ thống ghi nhận dữ liệu",
          "Thư ký tổng hợp báo cáo chuyên cần",
          "Trưởng khoa và Hiệu trưởng xem thống kê"
        ]
      },
      {
        flowName: "Grade Input & Review Flow",
        steps: [
          "Giáo viên nhập điểm vào hệ thống",
          "Trưởng khoa duyệt điểm",
          "Học sinh và phụ huynh xem điểm trên cổng thông tin"
        ]
      },
      {
        flowName: "Inventory Procurement Flow",
        steps: [
          "Nhân viên kho tạo yêu cầu mua hàng",
          "Quản lý kiểm tra và phê duyệt",
          "Hệ thống cập nhật tồn kho và lập báo cáo nhập hàng"
        ]
      },
      {
        flowName: "Event Approval Flow",
        steps: [
          "Giáo viên hoặc trưởng khoa tạo đề xuất sự kiện",
          "Hiệu trưởng hoặc Giám đốc duyệt kế hoạch",
          "Thư ký gửi thông báo đến toàn trường",
          "Sau sự kiện, báo cáo và hình ảnh được lưu trữ"
        ]
      }
    ],
    coreRequirements: [
        { id: "1", description: "Student Information System (SIS) including enrollment, attendance, and grades", priority: 'High' },
        { id: "2", description: "Staff Management for teacher/staff records, attendance, and salary", priority: 'High' },
        { id: "3", description: "Inventory Management for school supplies and materials", priority: 'Medium' },
        { id: "4", description: "Event Management for school activities and competitions", priority: 'Medium' },
        { id: "5", description: "Product Management for internal sales of books and uniforms", priority: 'Low' }
    ],
    techStack: {
      frontend: [
        "Vue.js 3",
        "Tailwind CSS",
        "Vite"
      ],
      backend: [
        "ASP.NET Core MVC",
        "RESTful API",
        "JWT Authentication"
      ],
      database: [
        "SQL Server"
      ],
      otherTools: [
        "Chart.js",
        "Serilog",
        "Swagger",
        "Docker",
        "GitHub Actions"
      ]
    },
    riskAssessment: [
      {
        risk: "Data security breaches from unauthorized access",
        impact: 'High',
        probability: 'Medium',
        mitigation: "Implement robust encryption, regular security audits, and compliance with data protection regulations like GDPR or local equivalents."
      },
      {
        risk: "System downtime during peak usage periods (e.g., enrollment season)",
        impact: 'Medium',
        probability: 'Low',
        mitigation: "Deploy scalable infrastructure with load balancing, implement redundancy measures, and perform regular maintenance during off-peak hours."
      },
      {
        risk: "Resistance to change from school staff accustomed to manual processes",
        impact: 'Medium',
        probability: 'High',
        mitigation: "Conduct comprehensive training programs, provide ongoing support, and demonstrate clear benefits through phased implementation."
      }
    ],
    featureDependencies: {
      "1": ["User authentication system", "Database setup"],
      "2": ["Staff Management", "Academic modules"],
      "3": ["Student Management", "Financial modules"],
      "4": ["Role-based access control"],
      "5": ["Inventory tracking system"],
      "6": ["Product catalog", "Payment integration"]
    },
    successMetrics: [
      {
        metric: "Reduction in administrative paperwork processing time",
        target: "50% reduction within 6 months",
        timeframe: "6 months"
      },
      {
        metric: "User adoption rate among staff and students",
        target: "80% active users within 1 year",
        timeframe: "12 months"
      },
      {
        metric: "System uptime and reliability",
        target: "99.9% uptime annually",
        timeframe: "Ongoing"
      }
    ],
    marketAnalysis: "Educational institutions are rapidly digitizing. A unified platform like this can streamline academic and operational workflows, making it highly adaptable for schools, colleges, and training centers.",
    competitors: [
      "Schoology",
      "MyClassCampus",
      "EduAdmin",
      "CampusCare"
    ],
    meta: {
      category: 'education',
      size: 'large',
      tags: ['school', 'management', 'vietnamese'],
    },
  },
  {
    projectName: "Healthcare Management System",
    shortDescription: "Comprehensive healthcare management platform for hospitals and clinics, managing patients, appointments, medical records, and billing.",
    businessGoals: "Improve patient care quality, streamline hospital operations, and ensure compliance with healthcare regulations.",
    technicalGoals: "Build a secure, HIPAA-compliant system with real-time data synchronization and robust reporting capabilities.",
    targetUsers: [
      "Hospital Administrators",
      "Doctors",
      "Nurses",
      "Medical Staff",
      "Patients",
      "Insurance Coordinators",
      "Pharmacists"
    ],
    numberOfFeatures: 35,
    estimatedScale: "$120K-$250K",
    timeline: "10-14 months",
    userFeatureRequests: "",
    coreModules: [
      {
        moduleName: "Patient Management",
        description: "Complete patient lifecycle management from registration to discharge.",
        flows: [
          "Patient Registration & Admission Flow",
          "Medical Record Management Flow",
          "Treatment & Care Plan Flow",
          "Discharge & Follow-up Flow"
        ]
      },
      {
        moduleName: "Appointment Scheduling",
        description: "Manage doctor appointments, consultations, and medical procedures.",
        flows: [
          "Appointment Booking Flow",
          "Schedule Management Flow",
          "Resource Allocation Flow",
          "Notification & Reminder Flow"
        ]
      },
      {
        moduleName: "Medical Records",
        description: "Digital storage and management of patient health records and histories.",
        flows: [
          "Record Creation & Update Flow",
          "Access Authorization Flow",
          "Data Backup & Recovery Flow",
          "Integration with External Systems Flow"
        ]
      },
      {
        moduleName: "Billing & Insurance",
        description: "Handle medical billing, insurance claims, and payment processing.",
        flows: [
          "Service Recording Flow",
          "Insurance Claim Processing Flow",
          "Payment Collection Flow",
          "Financial Reporting Flow"
        ]
      }
    ],
    rolePermissions: [
      {
        role: "Hospital Administrators",
        permissions: [
          "Full system oversight",
          "Financial management",
          "Staff supervision",
          "Regulatory compliance monitoring"
        ]
      },
      {
        role: "Doctors",
        permissions: [
          "Patient diagnosis and treatment",
          "Medical record access and updates",
          "Prescription management",
          "Consultation scheduling"
        ]
      },
      {
        role: "Nurses",
        permissions: [
          "Patient care documentation",
          "Vital signs recording",
          "Medication administration tracking",
          "Care coordination"
        ]
      },
      {
        role: "Patients",
        permissions: [
          "View personal medical records",
          "Book appointments",
          "Access test results",
          "Communicate with healthcare providers"
        ]
      }
    ],
    standardFlows: [
      {
        flowName: "Patient Admission Flow",
        steps: [
          "Patient arrives at hospital",
          "Registration staff collects information",
          "Nurse performs initial assessment",
          "Doctor conducts examination and creates treatment plan",
          "Patient admitted to appropriate ward"
        ]
      },
      {
        flowName: "Medical Record Access Flow",
        steps: [
          "Healthcare provider requests access",
          "System validates credentials and permissions",
          "Relevant records retrieved and displayed",
          "Access logged for audit purposes"
        ]
      }
    ],
    coreRequirements: [
        { id: "1", description: "Patient Management with registration, medical records (EHR), and treatment plans", priority: 'High' },
        { id: "2", description: "Appointment Scheduling for doctors, consultations, and procedures", priority: 'High' },
        { id: "3", description: "Billing & Insurance module for claim processing and payments", priority: 'High' },
        { id: "4", description: "Role-based access control for all user types (HIPAA compliance)", priority: 'High' }
    ],
    techStack: {
      frontend: [
        "React",
        "Material-UI",
        "Redux Toolkit"
      ],
      backend: [
        "Node.js",
        "Express.js",
        "Socket.io"
      ],
      database: [
        "MongoDB",
        "Redis"
      ],
      otherTools: [
        "Docker",
        "Nginx",
        "ELK Stack",
        "JWT",
        "Stripe for payments"
      ]
    },
    riskAssessment: [
      {
        risk: "Data breaches violating HIPAA regulations",
        impact: 'High',
        probability: 'Medium',
        mitigation: "Implement HIPAA-compliant encryption, regular audits, and strict access controls with audit logging."
      },
      {
        risk: "System unavailability during critical care situations",
        impact: 'High',
        probability: 'Low',
        mitigation: "Deploy redundant systems, conduct regular failover testing, and have manual backup procedures."
      },
      {
        risk: "Integration issues with existing hospital systems",
        impact: 'Medium',
        probability: 'High',
        mitigation: "Conduct thorough requirements gathering, perform integration testing, and provide comprehensive documentation."
      }
    ],
    featureDependencies: {
      "1": ["Patient records system", "HL7 integration"],
      "2": ["Appointment scheduling system"],
      "3": ["Electronic health records (EHR)", "Data security"],
      "4": ["Billing system", "Insurance integration"]
    },
    successMetrics: [
      {
        metric: "Patient data accessibility and wait times",
        target: "50% reduction in data retrieval time",
        timeframe: "6 months"
      },
      {
        metric: "System adoption by medical staff",
        target: "95% of staff using system daily",
        timeframe: "12 months"
      },
      {
        metric: "Error reduction in patient records",
        target: "80% reduction in data entry errors",
        timeframe: "9 months"
      }
    ],
    marketAnalysis: "Healthcare digitization is accelerating due to regulatory requirements and the need for better patient outcomes. Systems must prioritize security, interoperability, and user-friendly interfaces for medical professionals.",
    competitors: [
      "Epic Systems",
      "Cerner",
      "Meditech",
      "Allscripts"
    ],
    meta: {
      category: 'healthcare',
      size: 'large',
      tags: ['hospital', 'ehr', 'hipaa'],
    },
  },
  {
    projectName: "Real Estate Management Platform",
    shortDescription: "Complete real estate management solution for property owners, agents, and tenants with listing management, tenant screening, and maintenance tracking.",
    businessGoals: "Streamline property management operations, improve tenant satisfaction, and maximize rental income for property owners.",
    technicalGoals: "Create a user-friendly platform with automated workflows, secure document storage, and comprehensive reporting features.",
    targetUsers: [
      "Property Owners",
      "Real Estate Agents",
      "Property Managers",
      "Tenants",
      "Maintenance Staff",
      "Accountants"
    ],
    numberOfFeatures: 28,
    estimatedScale: "$70K-$140K",
    timeline: "7-10 months",
    userFeatureRequests: "",
    coreModules: [
      {
        moduleName: "Property Listings",
        description: "Manage property information, photos, amenities, and availability status.",
        flows: [
          "Property Listing Creation Flow",
          "Listing Update & Maintenance Flow",
          "Availability Management Flow",
          "Marketing & Promotion Flow"
        ]
      },
      {
        moduleName: "Tenant Management",
        description: "Handle tenant applications, screening, lease agreements, and communication.",
        flows: [
          "Tenant Application Flow",
          "Background Screening Flow",
          "Lease Agreement Flow",
          "Tenant Communication Flow"
        ]
      },
      {
        moduleName: "Maintenance & Repairs",
        description: "Track maintenance requests, schedule repairs, and manage vendor relationships.",
        flows: [
          "Maintenance Request Flow",
          "Work Order Management Flow",
          "Vendor Coordination Flow",
          "Quality Assurance Flow"
        ]
      },
      {
        moduleName: "Financial Management",
        description: "Manage rent collection, expense tracking, and financial reporting.",
        flows: [
          "Rent Collection Flow",
          "Expense Tracking Flow",
          "Financial Reporting Flow",
          "Tax Preparation Support Flow"
        ]
      }
    ],
    rolePermissions: [
      {
        role: "Property Owners",
        permissions: [
          "View all properties and financials",
          "Approve major decisions",
          "Access detailed reports",
          "Manage property managers"
        ]
      },
      {
        role: "Property Managers",
        permissions: [
          "Day-to-day property operations",
          "Tenant communication",
          "Maintenance coordination",
          "Rent collection oversight"
        ]
      },
      {
        role: "Tenants",
        permissions: [
          "Submit maintenance requests",
          "Pay rent online",
          "View lease documents",
          "Communicate with management"
        ]
      }
    ],
    standardFlows: [
      {
        flowName: "Tenant Application Process",
        steps: [
          "Prospective tenant views property listing",
          "Tenant submits application with required documents",
          "Background and credit check performed",
          "Application reviewed and approved/rejected",
          "Lease agreement prepared and signed"
        ]
      },
      {
        flowName: "Maintenance Request Handling",
        steps: [
          "Tenant submits maintenance request",
          "Property manager reviews and assigns priority",
          "Maintenance staff or vendor scheduled",
          "Work completed and quality verified",
          "Request closed and tenant notified"
        ]
      }
    ],
    coreRequirements: [
        { id: "1", description: "Property Listing and Management", priority: 'High' },
        { id: "2", description: "Tenant Application and Lease Management", priority: 'High' },
        { id: "3", description: "Online Rent Payment and Financial Tracking", priority: 'High' },
        { id: "4", description: "Maintenance Request and Work Order Management", priority: 'Medium' }
    ],
    techStack: {
      frontend: [
        "Next.js",
        "TypeScript",
        "Chakra UI"
      ],
      backend: [
        "Python",
        "Django",
        "Django Rest Framework"
      ],
      database: [
        "PostgreSQL"
      ],
      otherTools: [
        "AWS S3",
        "Stripe",
        "SendGrid",
        "Docker",
        "Redis"
      ]
    },
    riskAssessment: [
      {
        risk: "Tenant data privacy violations",
        impact: 'High',
        probability: 'Medium',
        mitigation: "Implement comprehensive data encryption, GDPR/CCPA compliance measures, and regular privacy audits."
      },
      {
        risk: "Maintenance service disruptions and cost overruns",
        impact: 'Medium',
        probability: 'High',
        mitigation: "Establish vendor contracts with SLAs, maintain emergency service backups, and implement budget tracking controls."
      },
      {
        risk: "Property vacancy periods extending unexpectedly",
        impact: 'Medium',
        probability: 'High',
        mitigation: "Implement automated marketing tools, comprehensive property search features, and predictive analytics for vacancy forecasting."
      }
    ],
    featureDependencies: {
      "1": ["Property database", "Media storage"],
      "2": ["Tenant verification services", "Document management"],
      "3": ["Maintenance scheduling system"],
      "4": ["Financial reporting", "Payment processing"]
    },
    successMetrics: [
      {
        metric: "Property occupancy rate",
        target: "95% average occupancy across portfolio",
        timeframe: "Ongoing"
      },
      {
        metric: "Tenant satisfaction scores",
        target: "4.5/5 average rating",
        timeframe: "Annual"
      },
      {
        metric: "Maintenance response time",
        target: "24 hours for routine requests, 2 hours for emergencies",
        timeframe: "Monthly"
      }
    ],
    marketAnalysis: "Property management is becoming increasingly digital. Modern tenants expect online portals, digital payments, and quick response times. The market favors platforms that can handle multiple property types and scales.",
    competitors: [
      "AppFolio",
      "Buildium",
      "Rent Manager",
      "Yardi"
    ],
    meta: {
      category: 'real_estate',
      size: 'medium',
      tags: ['property', 'rental', 'management'],
    },
  },
];