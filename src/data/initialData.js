// Official data definitions for Convosis Technologies Private Limited - IT Academy
// Clean initial state with ZERO dummy data (empty courses, internships, candidates)
// Standard Tuition Structure: ₹15,000 Base Fee + 18% GST (₹2,700) = ₹17,700 Total (3x ₹5,900)

export const INITIAL_COURSES = [];
export const INITIAL_INTERNSHIPS = [];
export const INITIAL_STUDENTS = [];
export const INITIAL_SENT_LOGS = [];
export const INITIAL_ATTENDANCE_LOGS = [];

export const INITIAL_ACADEMY_SETTINGS = {
  name: 'Convosis Technologies Private Limited',
  shortName: 'Convosis Technologies',
  orgNumber: 'CV-ORG-2026',
  cinNumber: 'U72900KA2026PTC184920',
  taxId: 'GSTIN29AAACC1234D1Z5',
  subname: 'Technical Training Division',
  tagline: 'Bridging Industry & Engineering Excellence',
  email: 'contact@convosis.com',
  financeEmail: 'billing@convosis.com',
  phone: '+91 (800) 584-TECH',
  address: 'Innovation Hub, Cyber City, Bangalore, Karnataka - 560100',
  currency: '₹',
  currencyCode: 'INR',
  baseCourseFee: 15000,
  baseInternshipFee: 15000,
  taxRate: 18, // 18% GST
  gstPercent: 18,
  website: 'https://convosis.com',
  theme: 'theme-minimal-light'
};

// Official Convosis Program Templates (₹15,000 Base Fee + 18% GST = ₹17,700 Total)
// Admins and Super Admins can initialize these or create custom courses & internships anytime.
export const OFFICIAL_CONVOSIS_PROGRAM_TEMPLATES = [
  // 1. Data Science and AI Course
  {
    id: 'course-ds-ai',
    title: 'Data Science and AI',
    type: 'course',
    category: 'Artificial Intelligence',
    duration: '6 Months',
    totalHours: '280+ Hours',
    rating: 4.9,
    enrolledCount: 0,
    badge: 'Core Program',
    description: 'Master Machine Learning, Deep Learning, Generative AI, PyTorch, LangChain, and real-world MLOps on AWS/GCP.',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'LLMs & RAG', 'MLOps', 'Transformers'],
    baseFee: 15000,
    gstPercent: 18,
    gstAmount: 2700,
    fullAmount: 17700,
    installmentMonths: 3,
    installmentAmount: 5900,
    feeStructure: {
      baseFee: 15000,
      gstPercent: 18,
      gstAmount: 2700,
      fullAmount: 17700,
      installmentMonths: 3,
      monthlyInstallment: 5900,
      installmentBreakdown: [
        { month: 1, title: 'Month 1 (Base ₹5,000 + 18% GST)', amount: 5900 },
        { month: 2, title: 'Month 2 (Base ₹5,000 + 18% GST)', amount: 5900 },
        { month: 3, title: 'Month 3 (Base ₹5,000 + 18% GST)', amount: 5900 }
      ]
    },
    instructor: {
      name: 'Faculty Team',
      role: 'Lead AI Instructor'
    },
    syllabus: [
      { 
        module: 'Module 1', 
        title: 'Python for AI, Mathematics & Vector Calculus', 
        weeks: 'Weeks 1-4',
        submodules: [
          { title: 'Linear Algebra, Matrices & Eigenvalues for Neural Nets', hours: '18 Hours', labs: 'Tensor Operations Lab' },
          { title: 'Vectorized Computing with NumPy & Pandas', hours: '22 Hours', labs: 'Data Pipeline Wrangling' },
          { title: 'Object-Oriented Python for Production Pipelines', hours: '20 Hours', labs: 'Package Architecture' }
        ]
      },
      { 
        module: 'Module 2', 
        title: 'Supervised & Unsupervised Machine Learning', 
        weeks: 'Weeks 5-10',
        submodules: [
          { title: 'Regression, Classification & Regularization', hours: '24 Hours', labs: 'Risk Scoring Benchmark' },
          { title: 'Ensemble Learning: XGBoost, LightGBM, CatBoost', hours: '26 Hours', labs: 'Competition Baseline' },
          { title: 'Dimensionality Reduction (t-SNE, UMAP, PCA)', hours: '18 Hours', labs: 'High-Dim Clustering' }
        ]
      },
      { 
        module: 'Module 3', 
        title: 'Deep Learning, CNNs & PyTorch Architecture', 
        weeks: 'Weeks 11-16',
        submodules: [
          { title: 'Feedforward Networks & Custom Autograd in PyTorch', hours: '25 Hours', labs: 'Backprop from Scratch' },
          { title: 'Convolutional Vision Models & Transfer Learning', hours: '28 Hours', labs: 'Medical Imaging VGG/ResNet' }
        ]
      },
      { 
        module: 'Module 4', 
        title: 'Generative AI, LLMs & LangChain RAG', 
        weeks: 'Weeks 17-21',
        submodules: [
          { title: 'Transformer Architecture, Attention & Self-Attention', hours: '24 Hours', labs: 'Mini-GPT Attention Block' },
          { title: 'Retrieval Augmented Generation (RAG) with ChromaDB & FAISS', hours: '26 Hours', labs: 'Enterprise PDF QA Engine' }
        ]
      },
      { 
        module: 'Module 5', 
        title: 'MLOps, Docker Containerization & Cloud', 
        weeks: 'Weeks 22-24',
        submodules: [
          { title: 'Model Serving via FastAPI & Docker', hours: '20 Hours', labs: 'Containerized Inference Endpoint' },
          { title: 'CI/CD Pipelines & Real-time Drift Monitoring', hours: '18 Hours', labs: 'GitHub Actions ML Deployment' }
        ]
      }
    ]
  },
  // 2. Data Analytics Course
  {
    id: 'course-data-analytics',
    title: 'Data Analytics',
    type: 'course',
    category: 'Data & BI',
    duration: '4 Months',
    totalHours: '190+ Hours',
    rating: 4.8,
    enrolledCount: 0,
    badge: 'Core Program',
    description: 'End-to-end data analytics mastery: SQL queries, Power BI dashboards, Tableau enterprise reporting, and metrics modeling.',
    skills: ['Advanced SQL', 'Power BI', 'Tableau', 'Excel Mastery', 'Python for Data'],
    baseFee: 15000,
    gstPercent: 18,
    gstAmount: 2700,
    fullAmount: 17700,
    installmentMonths: 3,
    installmentAmount: 5900,
    feeStructure: {
      baseFee: 15000,
      gstPercent: 18,
      gstAmount: 2700,
      fullAmount: 17700,
      installmentMonths: 3,
      monthlyInstallment: 5900,
      installmentBreakdown: [
        { month: 1, title: 'Month 1 (Base ₹5,000 + 18% GST)', amount: 5900 },
        { month: 2, title: 'Month 2 (Base ₹5,000 + 18% GST)', amount: 5900 },
        { month: 3, title: 'Month 3 (Base ₹5,000 + 18% GST)', amount: 5900 }
      ]
    },
    instructor: {
      name: 'Faculty Team',
      role: 'Lead BI Instructor'
    },
    syllabus: [
      {
        module: 'Module 1',
        title: 'Advanced Relational Database Design & SQL',
        weeks: 'Weeks 1-4',
        submodules: [
          { title: 'Complex Window Functions, CTEs & Recursive Queries', hours: '20 Hours', labs: 'Cohort Retention Queries' },
          { title: 'Query Optimization, Indexing & Execution Plans', hours: '18 Hours', labs: 'Database Benchmark Tuner' }
        ]
      },
      {
        module: 'Module 2',
        title: 'Power BI DAX Modeling & Architecture',
        weeks: 'Weeks 5-9',
        submodules: [
          { title: 'Star Schema Design & Fact-Dimension Architecture', hours: '22 Hours', labs: 'Retail Data Model' },
          { title: 'Advanced DAX Formulas, CALCULATE & Time Intelligence', hours: '26 Hours', labs: 'Financial Performance Model' }
        ]
      },
      {
        module: 'Module 3',
        title: 'Tableau Visual Analytics & Storytelling',
        weeks: 'Weeks 10-14',
        submodules: [
          { title: 'LOD Expressions (Fixed, Include, Exclude)', hours: '20 Hours', labs: 'Regional Market Cannibalization' },
          { title: 'Interactive Dashboard Actions & Parameter Controls', hours: '22 Hours', labs: 'Executive SaaS Dashboard' }
        ]
      }
    ]
  },
  // 3. Ethical Hacking Course
  {
    id: 'course-ethical-hacking',
    title: 'Ethical Hacking',
    type: 'course',
    category: 'Cybersecurity',
    duration: '5 Months',
    totalHours: '220+ Hours',
    rating: 4.9,
    enrolledCount: 0,
    badge: 'Specialized',
    description: 'Offensive security, web app pen-testing, network reconnaissance, Metasploit, Active Directory attacks, and bug bounty methodologies.',
    skills: ['Kali Linux', 'Burp Suite Pro', 'Metasploit', 'Wireshark', 'Active Directory Hacking'],
    baseFee: 15000,
    gstPercent: 18,
    gstAmount: 2700,
    fullAmount: 17700,
    installmentMonths: 3,
    installmentAmount: 5900,
    feeStructure: {
      baseFee: 15000,
      gstPercent: 18,
      gstAmount: 2700,
      fullAmount: 17700,
      installmentMonths: 3,
      monthlyInstallment: 5900,
      installmentBreakdown: [
        { month: 1, title: 'Month 1 (Base ₹5,000 + 18% GST)', amount: 5900 },
        { month: 2, title: 'Month 2 (Base ₹5,000 + 18% GST)', amount: 5900 },
        { month: 3, title: 'Month 3 (Base ₹5,000 + 18% GST)', amount: 5900 }
      ]
    },
    instructor: {
      name: 'Faculty Team',
      role: 'Principal Security Researcher'
    },
    syllabus: [
      { 
        module: 'Module 1', 
        title: 'TCP/IP Reconnaissance & Network Exploitation', 
        weeks: 'Weeks 1-5',
        submodules: [
          { title: 'Port Scanning, Nmap Scripting Engine & Firewall Evasion', hours: '22 Hours', labs: 'Stealth Scanning Range' },
          { title: 'Wireshark Packet Analysis & Protocol Vulnerabilities', hours: '24 Hours', labs: 'Traffic Decryption Lab' }
        ]
      },
      { 
        module: 'Module 2', 
        title: 'Web Application Penetration Testing (OWASP Top 10)', 
        weeks: 'Weeks 6-10',
        submodules: [
          { title: 'Burp Suite Pro Automation & Intruder Custom Payloads', hours: '26 Hours', labs: 'Session Hijacking' },
          { title: 'SQL Injection, Blind SQLi & XSS (DOM, Stored, Reflected)', hours: '28 Hours', labs: 'DVWA Exploitation' }
        ]
      },
      { 
        module: 'Module 3', 
        title: 'Network Penetration & Active Directory Exploits', 
        weeks: 'Weeks 11-15',
        submodules: [
          { title: 'Metasploit Framework, MSFvenom Payload Generation', hours: '26 Hours', labs: 'Internal Network Pivot' },
          { title: 'Kerberoasting, Pass-the-Hash & Domain Compromise', hours: '26 Hours', labs: 'Active Directory Cyber Range' }
        ]
      }
    ]
  },

  // 4. Data Engineer Internship
  {
    id: 'intern-data-engineer',
    title: 'Data Engineer',
    type: 'internship',
    category: 'Big Data & Cloud',
    duration: '3 Months (Live Industry)',
    stipend: 'Performance-based',
    seatsAvailable: 15,
    enrolledCount: 0,
    badge: 'Internship',
    description: 'Work on production ETL pipelines, Apache Spark clusters, Snowflake data warehouses, and streaming with Kafka.',
    techStack: ['Airflow', 'Snowflake', 'PySpark', 'AWS S3', 'Kafka'],
    mentor: 'Industry Mentor',
    baseFee: 15000,
    gstPercent: 18,
    gstAmount: 2700,
    fullAmount: 17700,
    installmentMonths: 3,
    installmentAmount: 5900,
    feeStructure: {
      baseFee: 15000,
      gstPercent: 18,
      gstAmount: 2700,
      fullAmount: 17700,
      installmentMonths: 3,
      monthlyInstallment: 5900,
      installmentBreakdown: [
        { month: 1, title: 'Month 1 (Base ₹5,000 + 18% GST)', amount: 5900 },
        { month: 2, title: 'Month 2 (Base ₹5,000 + 18% GST)', amount: 5900 },
        { month: 3, title: 'Month 3 (Base ₹5,000 + 18% GST)', amount: 5900 }
      ]
    },
    syllabus: [
      {
        module: 'Sprint 1',
        title: 'Data Modeling & Batch Pipeline Build',
        weeks: 'Month 1',
        submodules: [
          { title: 'PostgreSQL Relational Schema & CDC Ingestion', hours: '25 Hours', labs: 'Debezium Pipeline' },
          { title: 'PySpark Transformation Jobs & Parquet Optimization', hours: '30 Hours', labs: 'Cluster Benchmark' }
        ]
      },
      {
        module: 'Sprint 2',
        title: 'Streaming Pipelines & Cloud Warehouses',
        weeks: 'Month 2',
        submodules: [
          { title: 'Apache Kafka Event Streams & Consumer Groups', hours: '28 Hours', labs: 'Live Telemetry Ingestion' },
          { title: 'Snowflake External Tables & Snowpipe Setup', hours: '25 Hours', labs: 'Zero-Copy Clone Warehouses' }
        ]
      }
    ]
  },

  // 5. Data Analytics Internship
  {
    id: 'intern-data-analytics',
    title: 'Data Analytics',
    type: 'internship',
    category: 'Analytics & BI',
    duration: '3 Months (Live Industry)',
    stipend: 'Performance-based',
    seatsAvailable: 20,
    enrolledCount: 0,
    badge: 'Internship',
    description: 'Work alongside senior analysts on real e-commerce and fintech data pipelines, customer segmentation, and automated executive dashboards.',
    techStack: ['PostgreSQL', 'Power BI Service', 'dbt', 'Python'],
    mentor: 'Industry Mentor',
    baseFee: 15000,
    gstPercent: 18,
    gstAmount: 2700,
    fullAmount: 17700,
    installmentMonths: 3,
    installmentAmount: 5900,
    feeStructure: {
      baseFee: 15000,
      gstPercent: 18,
      gstAmount: 2700,
      fullAmount: 17700,
      installmentMonths: 3,
      monthlyInstallment: 5900,
      installmentBreakdown: [
        { month: 1, title: 'Month 1 (Base ₹5,000 + 18% GST)', amount: 5900 },
        { month: 2, title: 'Month 2 (Base ₹5,000 + 18% GST)', amount: 5900 },
        { month: 3, title: 'Month 3 (Base ₹5,000 + 18% GST)', amount: 5900 }
      ]
    },
    syllabus: [
      {
        module: 'Sprint 1',
        title: 'Data Transformation with dbt & SQL',
        weeks: 'Month 1',
        submodules: [
          { title: 'Automated dbt Lineage Models & Data Testing', hours: '24 Hours', labs: 'CI/CD dbt Cloud Setup' },
          { title: 'Dimensional Modeling for Multi-Tenant SaaS', hours: '26 Hours', labs: 'SaaS Metric Engine' }
        ]
      },
      {
        module: 'Sprint 2',
        title: 'Executive Dashboards & Automated Alerts',
        weeks: 'Month 2',
        submodules: [
          { title: 'Real-time Power BI DirectQuery Pipelines', hours: '25 Hours', labs: 'Live Operations Center' },
          { title: 'Automated Anomaly Detection with Python & Slack Bots', hours: '28 Hours', labs: 'Alert Trigger Webhook' }
        ]
      }
    ]
  },

  // 6. Digital Marketing Internship
  {
    id: 'intern-digital-marketing',
    title: 'Digital Marketing',
    type: 'internship',
    category: 'Growth & Marketing',
    duration: '3 Months (Live Industry)',
    stipend: 'Performance-based',
    seatsAvailable: 15,
    enrolledCount: 0,
    badge: 'Internship',
    description: 'Execute high-budget live campaigns on Google Ads, Meta Ads Manager, GA4 data streams, programmatic SEO, and conversion rate optimization.',
    techStack: ['Google Ads', 'Meta Business Suite', 'GA4', 'Semrush', 'HubSpot'],
    mentor: 'Industry Mentor',
    baseFee: 15000,
    gstPercent: 18,
    gstAmount: 2700,
    fullAmount: 17700,
    installmentMonths: 3,
    installmentAmount: 5900,
    feeStructure: {
      baseFee: 15000,
      gstPercent: 18,
      gstAmount: 2700,
      fullAmount: 17700,
      installmentMonths: 3,
      monthlyInstallment: 5900,
      installmentBreakdown: [
        { month: 1, title: 'Month 1 (Base ₹5,000 + 18% GST)', amount: 5900 },
        { month: 2, title: 'Month 2 (Base ₹5,000 + 18% GST)', amount: 5900 },
        { month: 3, title: 'Month 3 (Base ₹5,000 + 18% GST)', amount: 5900 }
      ]
    },
    syllabus: [
      {
        module: 'Sprint 1',
        title: 'Search Engine Optimization & Technical Auditing',
        weeks: 'Month 1',
        submodules: [
          { title: 'Core Web Vitals, Crawl Budget & Schema Markup', hours: '22 Hours', labs: 'Site Architecture Audit' },
          { title: 'Programmatic Keyword Cluster Strategy & Content Ops', hours: '24 Hours', labs: 'Organic Revenue Model' }
        ]
      },
      {
        module: 'Sprint 2',
        title: 'Paid Media (PPC, Meta & Google Performance Max)',
        weeks: 'Month 2',
        submodules: [
          { title: 'Meta Conversion API (CAPI) & Pixel Setup', hours: '25 Hours', labs: 'Server-Side Tagging Lab' },
          { title: 'Google Performance Max Bid Strategies & ROAS Tuning', hours: '26 Hours', labs: 'Live Spend Campaign' }
        ]
      }
    ]
  },

  // 7. Pen Tester Internship
  {
    id: 'intern-pen-tester',
    title: 'Pen Tester',
    type: 'internship',
    category: 'Offensive Security',
    duration: '3 Months (Live Industry)',
    stipend: 'Performance-based',
    seatsAvailable: 10,
    enrolledCount: 0,
    badge: 'Internship',
    description: 'Perform real authorized vulnerability assessments and penetration tests across cloud infrastructure, APIs, and client perimeter networks.',
    techStack: ['Burp Suite', 'Cobalt Strike', 'Nessus', 'Python', 'AWS IAM'],
    mentor: 'Industry Mentor',
    baseFee: 15000,
    gstPercent: 18,
    gstAmount: 2700,
    fullAmount: 17700,
    installmentMonths: 3,
    installmentAmount: 5900,
    feeStructure: {
      baseFee: 15000,
      gstPercent: 18,
      gstAmount: 2700,
      fullAmount: 17700,
      installmentMonths: 3,
      monthlyInstallment: 5900,
      installmentBreakdown: [
        { month: 1, title: 'Month 1 (Base ₹5,000 + 18% GST)', amount: 5900 },
        { month: 2, title: 'Month 2 (Base ₹5,000 + 18% GST)', amount: 5900 },
        { month: 3, title: 'Month 3 (Base ₹5,000 + 18% GST)', amount: 5900 }
      ]
    },
    syllabus: [
      {
        module: 'Sprint 1',
        title: 'External Perimeter Recon & Vulnerability Assessment',
        weeks: 'Month 1',
        submodules: [
          { title: 'Automated Asset Discovery with Amass, Subfinder & Shodan', hours: '25 Hours', labs: 'Perimeter Attack Surface' },
          { title: 'Nessus Vulnerability Assessment & False Positive Triaging', hours: '24 Hours', labs: 'Enterprise Scanning Report' }
        ]
      },
      {
        module: 'Sprint 2',
        title: 'API & Cloud Infrastructure Penetration Testing',
        weeks: 'Month 2',
        submodules: [
          { title: 'GraphQL & REST API Flaws (BOLA, BFLA, Injection)', hours: '28 Hours', labs: 'Postman API Exploit Suite' },
          { title: 'AWS Cloud Security Assessment (Pacu, ScoutSuite & IAM)', hours: '26 Hours', labs: 'S3 Privilege Escalation' }
        ]
      }
    ]
  },

  // 8. Data Science & AI + Data Engineer (Course + Internship Combo)
  {
    id: 'combo-ds-ai-engineer',
    title: 'Data Science and AI + Data Engineer (Course + Internship)',
    type: 'dual',
    category: 'AI & Data Engineering',
    duration: '6 Months (3 Mo Course + 3 Mo Internship)',
    totalHours: '400+ Hours',
    rating: 5.0,
    enrolledCount: 0,
    badge: 'Course + Internship',
    description: 'Complete end-to-end program: Academic training in AI/Deep Learning plus live corporate data engineering internship on Apache Spark, Snowflake, and LLM pipelines.',
    skills: ['Python', 'PyTorch', 'LLMs & RAG', 'Apache Spark', 'Snowflake', 'Airflow', 'Kafka'],
    mentor: 'Chief AI Architect & Industry Mentor',
    baseFee: 30000,
    gstPercent: 18,
    gstAmount: 5400,
    fullAmount: 35400,
    installmentMonths: 3,
    installmentAmount: 11800,
    feeStructure: {
      baseFee: 30000,
      gstPercent: 18,
      gstAmount: 5400,
      fullAmount: 35400,
      installmentMonths: 3,
      monthlyInstallment: 11800,
      installmentBreakdown: [
        { month: 1, title: 'Month 1 (Base ₹10,000 + 18% GST)', amount: 11800 },
        { month: 2, title: 'Month 2 (Base ₹10,000 + 18% GST)', amount: 11800 },
        { month: 3, title: 'Month 3 (Base ₹10,000 + 18% GST)', amount: 11800 }
      ]
    },
    syllabus: [
      {
        module: 'Phase 1: Coursework',
        title: 'Core Machine Learning, Deep Learning & Generative AI',
        weeks: 'Months 1-3',
        submodules: [
          { title: 'Python, Mathematics for AI & Vectorized Computing', hours: '30 Hours', labs: 'NumPy Vector Pipeline' },
          { title: 'PyTorch Deep Learning & LLM RAG Architecture', hours: '40 Hours', labs: 'Enterprise RAG Agent' }
        ]
      },
      {
        module: 'Phase 2: Corporate Internship',
        title: 'Live Industry ETL, Big Data Clusters & Cloud Orchestration',
        weeks: 'Months 4-6',
        submodules: [
          { title: 'PySpark Large-Scale Pipelines & Snowflake Warehouses', hours: '45 Hours', labs: 'Production Data Pipeline' },
          { title: 'Kafka Event Streaming, Airflow DAGs & Cloud Deployment', hours: '45 Hours', labs: 'Live Streaming Engine' }
        ]
      }
    ]
  },

  // 9. Data Analytics (Course + Internship Combo)
  {
    id: 'combo-data-analytics',
    title: 'Data Analytics Master (Course + Internship)',
    type: 'dual',
    category: 'Analytics & BI Track',
    duration: '6 Months (3 Mo Course + 3 Mo Internship)',
    totalHours: '350+ Hours',
    rating: 4.9,
    enrolledCount: 0,
    badge: 'Course + Internship',
    description: 'Master advanced SQL, Power BI, and Tableau in coursework, followed by live client analytics sprints, dbt models, and automated reporting pipelines.',
    skills: ['Advanced SQL', 'Power BI', 'Tableau', 'dbt', 'Python Analytics'],
    mentor: 'Lead BI Architect',
    baseFee: 30000,
    gstPercent: 18,
    gstAmount: 5400,
    fullAmount: 35400,
    installmentMonths: 3,
    installmentAmount: 11800,
    feeStructure: {
      baseFee: 30000,
      gstPercent: 18,
      gstAmount: 5400,
      fullAmount: 35400,
      installmentMonths: 3,
      monthlyInstallment: 11800,
      installmentBreakdown: [
        { month: 1, title: 'Month 1 (Base ₹10,000 + 18% GST)', amount: 11800 },
        { month: 2, title: 'Month 2 (Base ₹10,000 + 18% GST)', amount: 11800 },
        { month: 3, title: 'Month 3 (Base ₹10,000 + 18% GST)', amount: 11800 }
      ]
    },
    syllabus: [
      {
        module: 'Phase 1: Coursework',
        title: 'SQL Mastery, DAX Architecture & Tableau Storytelling',
        weeks: 'Months 1-3',
        submodules: [
          { title: 'Complex Window Functions, Indexing & Data Modeling', hours: '30 Hours', labs: 'Cohort Analysis' },
          { title: 'Power BI Enterprise DAX & Tableau LOD Expressions', hours: '35 Hours', labs: 'Executive BI Dashboard' }
        ]
      },
      {
        module: 'Phase 2: Corporate Internship',
        title: 'Live Industry Data Transformations with dbt & Production BI',
        weeks: 'Months 4-6',
        submodules: [
          { title: 'dbt Cloud Modeling & Automated Data Quality Testing', hours: '35 Hours', labs: 'Warehouse Ingestion' },
          { title: 'Real-time Executive Operations Dashboards & Alerts', hours: '35 Hours', labs: 'Fintech Metric Portal' }
        ]
      }
    ]
  },

  // 10. Ethical Hacking + Pen Tester (Course + Internship Combo)
  {
    id: 'combo-ethical-hacking-pen-tester',
    title: 'Ethical Hacking + Pen Tester (Course + Internship)',
    type: 'dual',
    category: 'Cybersecurity Specialization',
    duration: '6 Months (3 Mo Course + 3 Mo Internship)',
    totalHours: '380+ Hours',
    rating: 5.0,
    enrolledCount: 0,
    badge: 'Course + Internship',
    description: 'In-depth offensive cybersecurity curriculum combined with live corporate penetration testing and vulnerability assessments.',
    skills: ['Kali Linux', 'Burp Suite Pro', 'Metasploit', 'Active Directory Hacking', 'Cloud Security'],
    mentor: 'Lead Security Engineer',
    baseFee: 30000,
    gstPercent: 18,
    gstAmount: 5400,
    fullAmount: 35400,
    installmentMonths: 3,
    installmentAmount: 11800,
    feeStructure: {
      baseFee: 30000,
      gstPercent: 18,
      gstAmount: 5400,
      fullAmount: 35400,
      installmentMonths: 3,
      monthlyInstallment: 11800,
      installmentBreakdown: [
        { month: 1, title: 'Month 1 (Base ₹10,000 + 18% GST)', amount: 11800 },
        { month: 2, title: 'Month 2 (Base ₹10,000 + 18% GST)', amount: 11800 },
        { month: 3, title: 'Month 3 (Base ₹10,000 + 18% GST)', amount: 11800 }
      ]
    },
    syllabus: [
      {
        module: 'Phase 1: Coursework',
        title: 'Network Exploitation, Web App Hacking & Active Directory',
        weeks: 'Months 1-3',
        submodules: [
          { title: 'TCP/IP Reconnaissance & OWASP Top 10 Exploitation', hours: '35 Hours', labs: 'Web Cyber Range' },
          { title: 'Active Directory Domain Compromise & Pivoting', hours: '35 Hours', labs: 'Kerberoasting Attack' }
        ]
      },
      {
        module: 'Phase 2: Corporate Internship',
        title: 'Live Client Penetration Testing & Cloud Security Audit',
        weeks: 'Months 4-6',
        submodules: [
          { title: 'External Perimeter Reconnaissance & Nessus Audits', hours: '40 Hours', labs: 'Perimeter Scan Report' },
          { title: 'AWS Cloud Security & REST API Exploitation Suite', hours: '40 Hours', labs: 'IAM Privilege Escalation' }
        ]
      }
    ]
  }
];

export const INITIAL_EMAIL_TEMPLATES = [
  {
    id: 'tpl-welcome',
    name: 'New Admission Welcome Kit',
    type: 'welcome',
    subject: 'Welcome to Convosis Technologies: Official Enrollment Confirmation',
    description: 'Dispatched automatically upon candidate admission with student credentials and portal link.',
    body: `Dear {{student_name}},

Welcome to Convosis Technologies Private Limited! Your enrollment in {{course_name}} has been officially confirmed.

Your Admission Credentials:
• Student ID: {{student_id}}
• Program: {{course_name}}
• Payment Mode: {{payment_plan}}
• Portal Login: http://localhost:5173/

Best regards,
Admissions Office
Convosis Technologies Private Limited`
  },
  {
    id: 'tpl-payment-receipt',
    name: 'Official Fee Payment Receipt',
    type: 'fee_receipt',
    subject: 'Tax Receipt: Official Payment Confirmation - Convosis Technologies',
    description: 'Dispatched instantly when any installment or full tuition payment is settled.',
    body: `Dear {{student_name}},

Thank you for your payment. Your tuition installment of ₹{{amount}} for {{course_name}} has been received and verified.

Receipt Details:
• Receipt Ref: {{transaction_ref}}
• Payment Method: {{payment_method}}
• Remaining Balance: ₹{{remaining_balance}}

Best regards,
Finance Department
Convosis Technologies Private Limited`
  },
  {
    id: 'tpl-fee-reminder',
    name: '3-Day Installment Due Reminder',
    type: 'fee_reminder',
    subject: 'Friendly Reminder: Upcoming Installment Milestone Due for {{course_name}}',
    description: 'Automated 3-day advance notice for upcoming scheduled tuition installments.',
    body: `Dear {{student_name}},

This is a reminder that Month {{installment_month}} of your installment schedule (₹{{amount}}) is due on {{due_date}}.

Best regards,
Accounts Division
Convosis Technologies Private Limited`
  },
  {
    id: 'tpl-fee-overdue',
    name: 'Overdue Installment Notice',
    type: 'fee_overdue',
    subject: 'Urgent Notice: Overdue Tuition Milestone for {{course_name}}',
    description: 'Triggered when an installment passes its milestone deadline without settlement.',
    body: `Dear {{student_name}},

Our financial records indicate that your installment for {{course_name}} (₹{{amount}}) was due on {{due_date}} and remains pending. Please settle your account to ensure continued lab and session access.

Best regards,
Finance & Accounts Department
Convosis Technologies Private Limited`
  },
  {
    id: 'tpl-attendance-warning',
    name: 'Low Attendance Warning (< 75%)',
    type: 'attendance_alert',
    subject: 'Academic Notice: Attendance Alert for {{course_name}} (Below 75%)',
    description: 'Triggered when attendance drops below the 75% threshold required for certification.',
    body: `Dear {{student_name}},

This is an academic notice regarding your attendance in {{course_name}}.

Current Attendance Record:
• Conducted Sessions: {{total_classes}}
• Attended Sessions: {{attended_classes}}
• Current Rate: {{attendance_percentage}}% (Minimum Required: 75%)

Best regards,
Convosis Technologies Private Limited`
  }
];
