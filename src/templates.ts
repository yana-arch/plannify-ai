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
    techStack: {
      frontend: ["React", "TypeScript", "Tailwind CSS"],
      backend: ["Node.js", "Express.js"],
      database: ["PostgreSQL"],
      otherTools: ["Vite", "Jest", "Docker"],
    },
    marketAnalysis: "The market for general web applications is vast. Success depends on finding a niche and providing a superior user experience compared to existing solutions.",
    competitors: ["Generic SaaS tools", "Custom-built internal apps"],
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
    techStack: {
      frontend: [],
      backend: ["Python", "Django Rest Framework", "Celery"],
      database: ["PostgreSQL", "Redis"],
      otherTools: ["Docker", "S3 for storage", "Pytest"],
    },
    marketAnalysis: "The success of a mobile backend is directly tied to the success of the mobile app it serves. The market requires high reliability and scalability to handle fluctuating user loads.",
    competitors: ["Firebase", "Supabase", "AWS Amplify"],
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
    marketAnalysis: "Internal tools market is focused on increasing efficiency. Key selling points are ease of use, powerful features, and seamless integration with existing company data stacks.",
    competitors: ["Tableau", "PowerBI", "Looker", "Metabase"],
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
    marketAnalysis: "The e-commerce market is highly competitive. Differentiation can be achieved through niche products, superior user experience, or building a strong brand community.",
    competitors: ["Shopify", "BigCommerce", "WooCommerce", "Magento"],
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
    marketAnalysis: "B2B SaaS is about solving a specific business problem more efficiently than existing solutions. Customer support and reliability are paramount. The sales cycle is longer, but customer lifetime value is higher.",
    competitors: ["Salesforce", "Atlassian Jira", "HubSpot", "Various niche competitors"],
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
    marketAnalysis: "The AI API market is rapidly growing. Success hinges on the quality and uniqueness of the underlying model, as well as the reliability and ease of use of the API.",
    competitors: ["OpenAI API", "Hugging Face Inference API", "Google Cloud AI", "AWS AI Services"],
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
    marketAnalysis: "Educational institutions are rapidly digitizing. A unified platform like this can streamline academic and operational workflows, making it highly adaptable for schools, colleges, and training centers.",
    competitors: [
      "Schoology",
      "MyClassCampus",
      "EduAdmin",
      "CampusCare"
    ],
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
    marketAnalysis: "Healthcare digitization is accelerating due to regulatory requirements and the need for better patient outcomes. Systems must prioritize security, interoperability, and user-friendly interfaces for medical professionals.",
    competitors: [
      "Epic Systems",
      "Cerner",
      "Meditech",
      "Allscripts"
    ],
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
    marketAnalysis: "Property management is becoming increasingly digital. Modern tenants expect online portals, digital payments, and quick response times. The market favors platforms that can handle multiple property types and scales.",
    competitors: [
      "AppFolio",
      "Buildium",
      "Rent Manager",
      "Yardi"
    ],
  },
];
