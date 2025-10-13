import type { TemplateData } from '../types';

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
  },
];
