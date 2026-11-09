from django.core.management.base import BaseCommand
from apps.programs.models import Program, Module, SubModule
from apps.students.models import Student, Installment, PaymentReceipt
from apps.attendance.models import AttendanceRecord
from apps.communications.models import EmailTemplate, EmailLog
from datetime import date, timedelta

class Command(BaseCommand):
    help = 'Seeds database with Convosis Technologies IT Academy initial data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding Convosis Technologies database...')

        # 1. Seed Programs (Courses & Internships)
        programs_data = [
            {
                'id': 'course-ds-ai',
                'title': 'Data Science and AI',
                'type': 'course',
                'category': 'Artificial Intelligence',
                'duration': '6 Months',
                'total_hours': '280+ Hours',
                'rating': 4.90,
                'enrolled_count': 34,
                'badge': 'Flagship Course',
                'description': 'Master Machine Learning, Deep Learning, Generative AI, PyTorch, LangChain, and real-world deployment on AWS/GCP.',
                'full_amount': 1800,
                'installment_months': 3,
                'installment_amount': 600,
                'instructor_name': 'Dr. Alistair Vance',
                'instructor_role': 'Ex-DeepMind Lead AI Researcher',
                'modules': [
                    {
                        'code': 'Module 1',
                        'title': 'Python for AI, Mathematics & Vector Calculus',
                        'weeks': 'Weeks 1-4',
                        'submodules': [
                            ('Python OOP & Memory Architecture', '8 Hours'),
                            ('Linear Algebra, Matrices & Vector Calculus', '12 Hours'),
                            ('NumPy & SciPy High-Performance Vectorization', '6 Hours')
                        ]
                    },
                    {
                        'code': 'Module 2',
                        'title': 'Supervised & Unsupervised Machine Learning',
                        'weeks': 'Weeks 5-10',
                        'submodules': [
                            ('Regression & Classification Algorithms', '10 Hours'),
                            ('Ensemble Methods: Random Forests & XGBoost', '12 Hours'),
                            ('Dimensionality Reduction: PCA & t-SNE', '8 Hours')
                        ]
                    },
                    {
                        'code': 'Module 3',
                        'title': 'Deep Learning, CNNs & PyTorch Architecture',
                        'weeks': 'Weeks 11-16',
                        'submodules': [
                            ('PyTorch Tensor Operations & Autograd', '10 Hours'),
                            ('Convolutional Neural Networks & Vision Backbones', '14 Hours'),
                            ('Transfer Learning & Hyperparameter Tuning', '8 Hours')
                        ]
                    },
                    {
                        'code': 'Module 4',
                        'title': 'Generative AI, LLMs & LangChain RAG',
                        'weeks': 'Weeks 17-21',
                        'submodules': [
                            ('Attention Mechanism & Transformer Architectures', '12 Hours'),
                            ('LangChain, Vector Databases (Pinecone/Chroma) & RAG', '14 Hours'),
                            ('Fine-tuning Open-Source Models (LoRA/QLoRA)', '10 Hours')
                        ]
                    },
                    {
                        'code': 'Module 5',
                        'title': 'MLOps, Docker Containerization & Cloud Deployment',
                        'weeks': 'Weeks 22-24',
                        'submodules': [
                            ('Containerizing AI Models with Docker', '8 Hours'),
                            ('CI/CD Pipelines & Automated Model Registry', '10 Hours'),
                            ('Deploying Real-Time Inference on AWS ECS', '8 Hours')
                        ]
                    }
                ]
            },
            {
                'id': 'course-data-analytics',
                'title': 'Data Analytics',
                'type': 'course',
                'category': 'Data & BI',
                'duration': '4 Months',
                'total_hours': '190+ Hours',
                'rating': 4.80,
                'enrolled_count': 42,
                'badge': 'High Demand',
                'description': 'End-to-end data analytics mastery: SQL queries, Power BI dashboards, Tableau enterprise reporting, and metrics modeling.',
                'full_amount': 1200,
                'installment_months': 3,
                'installment_amount': 400,
                'instructor_name': 'Elena Rostova',
                'instructor_role': 'Principal BI Architect at FinTech Global',
                'modules': [
                    {
                        'code': 'Module 1',
                        'title': 'Business Statistics & Statistical Modeling',
                        'weeks': 'Weeks 1-3',
                        'submodules': [('Descriptive & Inferential Statistics', '8 Hours'), ('Hypothesis Testing & A/B Experiments', '8 Hours')]
                    },
                    {
                        'code': 'Module 2',
                        'title': 'Complex SQL Queries, Window Functions & CTEs',
                        'weeks': 'Weeks 4-8',
                        'submodules': [('PostgreSQL Advanced Queries', '12 Hours'), ('Window Functions & Cohort Analytics', '12 Hours')]
                    },
                    {
                        'code': 'Module 3',
                        'title': 'Power BI: DAX, Modeling & Dashboards',
                        'weeks': 'Weeks 9-12',
                        'submodules': [('DAX Measures & Time Intelligence', '14 Hours'), ('Executive Visual Design', '10 Hours')]
                    }
                ]
            },
            {
                'id': 'course-ethical-hacking',
                'title': 'Ethical Hacking',
                'type': 'course',
                'category': 'Cybersecurity',
                'duration': '5 Months',
                'total_hours': '240+ Hours',
                'rating': 4.95,
                'enrolled_count': 29,
                'badge': 'Certified',
                'description': 'Practical penetration testing, network sniffing, web application security (OWASP Top 10), Metasploit, and CEH prep.',
                'full_amount': 1500,
                'installment_months': 3,
                'installment_amount': 500,
                'instructor_name': 'Marcus Cipher Ward',
                'instructor_role': 'Senior Red Team Lead & Certified CEH Master',
                'modules': [
                    {
                        'code': 'Module 1',
                        'title': 'Networking Fundamentals & Packet Crafting',
                        'weeks': 'Weeks 1-4',
                        'submodules': [('TCP/IP Stack & Wireshark Deep Dive', '12 Hours'), ('Nmap Scanning & OS Fingerprinting', '10 Hours')]
                    },
                    {
                        'code': 'Module 2',
                        'title': 'Web App Pentesting (OWASP Top 10)',
                        'weeks': 'Weeks 5-10',
                        'submodules': [('Burp Suite Pro Workflow', '12 Hours'), ('SQL Injection, XSS, CSRF & SSRF', '16 Hours')]
                    }
                ]
            },
            {
                'id': 'intern-data-engineer',
                'title': 'Data Engineer',
                'type': 'internship',
                'category': 'Big Data & Cloud',
                'duration': '3 Months (Live Industry)',
                'total_hours': '180 Hours',
                'rating': 4.85,
                'enrolled_count': 18,
                'badge': 'Live Pipeline',
                'description': 'Work on production ETL pipelines, Apache Spark clusters, Snowflake data warehouses, and streaming with Kafka.',
                'full_amount': 900,
                'installment_months': 3,
                'installment_amount': 300,
                'mentor_name': 'David Zhao (Lead Data Architect)',
                'modules': [
                    {
                        'code': 'Sprint 1',
                        'title': 'Data Modeling & Batch Pipeline Build',
                        'weeks': 'Month 1',
                        'submodules': [('Data Lakehouse Architecture on S3', '10 Hours'), ('PySpark Transformations', '14 Hours')]
                    },
                    {
                        'code': 'Sprint 2',
                        'title': 'Streaming Pipelines & Cloud Warehouses',
                        'weeks': 'Month 2',
                        'submodules': [('Apache Kafka Event Streaming', '12 Hours'), ('Snowflake Storage & Query Clustering', '12 Hours')]
                    }
                ]
            },
            {
                'id': 'intern-data-analytics',
                'title': 'Data Analytics',
                'type': 'internship',
                'category': 'Business Analytics',
                'duration': '3 Months (Client Sprints)',
                'total_hours': '160 Hours',
                'rating': 4.90,
                'enrolled_count': 22,
                'badge': 'Client Work',
                'description': 'Collaborate with real marketing, sales, and operations datasets. Deliver executive-ready Tableau/Power BI dashboards.',
                'full_amount': 750,
                'installment_months': 3,
                'installment_amount': 250,
                'mentor_name': 'Sonia Kapoor (VP Analytics)',
                'modules': [
                    {
                        'code': 'Sprint 1',
                        'title': 'Exploratory Analysis & KPI Design',
                        'weeks': 'Month 1',
                        'submodules': [('Telemetry Data Audit & Cleaning', '10 Hours'), ('Stakeholder KPI Formulation', '8 Hours')]
                    }
                ]
            },
            {
                'id': 'intern-digital-marketing',
                'title': 'Digital Marketing',
                'type': 'internship',
                'category': 'Growth & Ads',
                'duration': '3 Months (Live Budgets)',
                'total_hours': '140 Hours',
                'rating': 4.75,
                'enrolled_count': 25,
                'badge': 'Live Budgets',
                'description': 'Manage live PPC campaigns on Google Ads and Meta Ads Manager. Technical SEO audits and conversion rate optimization.',
                'full_amount': 600,
                'installment_months': 3,
                'installment_amount': 200,
                'mentor_name': 'Chloe Martin (Growth Director)',
                'modules': [
                    {
                        'code': 'Sprint 1',
                        'title': 'Technical SEO Audits & Performance Ads',
                        'weeks': 'Month 1',
                        'submodules': [('Keyword Clustering & Search Intent', '8 Hours'), ('Meta Campaign Scaling & Retargeting', '10 Hours')]
                    }
                ]
            },
            {
                'id': 'intern-pen-tester',
                'title': 'Pen Tester',
                'type': 'internship',
                'category': 'Offensive Security',
                'duration': '3 Months (Virtual Range)',
                'total_hours': '180 Hours',
                'rating': 4.95,
                'enrolled_count': 14,
                'badge': 'Security Labs',
                'description': 'Simulate adversary attacks on isolated enterprise cloud environments. Network pentesting, API auditing, and VAPT reporting.',
                'full_amount': 950,
                'installment_months': 3,
                'installment_amount': 320,
                'mentor_name': 'Tariq Al-Mansoor (Principal OSCP Pentester)',
                'modules': [
                    {
                        'code': 'Sprint 1',
                        'title': 'Scope Definition & Reconnaissance',
                        'weeks': 'Month 1',
                        'submodules': [('Passive & Active OSINT', '8 Hours'), ('Subdomain Enumeration & Port Mapping', '10 Hours')]
                    }
                ]
            }
        ]

        for p_data in programs_data:
            modules_list = p_data.pop('modules', [])
            program, _ = Program.objects.update_or_create(id=p_data['id'], defaults=p_data)
            
            for m_idx, m_data in enumerate(modules_list):
                submodules_list = m_data.pop('submodules', [])
                module, _ = Module.objects.update_or_create(
                    program=program,
                    module_code=m_data['code'],
                    defaults={'title': m_data['title'], 'weeks': m_data['weeks'], 'order': m_idx + 1}
                )
                for s_idx, (s_title, s_hours) in enumerate(submodules_list):
                    SubModule.objects.update_or_create(
                        module=module,
                        title=s_title,
                        defaults={'hours': s_hours, 'order': s_idx + 1}
                    )

        self.stdout.write(self.style.SUCCESS('Successfully seeded programs, modules & sub-modules.'))

        # 2. Seed Candidates
        students_data = [
            {
                'student_id': 'STU-1001',
                'name': 'Aiden Vance',
                'email': 'aiden.vance@techmail.io',
                'phone': '+1 (555) 234-5678',
                'program_id': 'course-ds-ai',
                'program_title': 'Data Science and AI',
                'program_type': 'course',
                'enrollment_date': date(2026, 9, 15),
                'payment_mode': 'installment',
                'total_fee': 1800,
                'paid_amount': 1200,
                'remaining_balance': 600,
                'installments': [
                    (1, 'Month 1 Installment', 600, date(2026, 9, 15), 'paid', date(2026, 9, 15), 'TXN-98432', 'Card'),
                    (2, 'Month 2 Installment', 600, date(2026, 10, 15), 'paid', date(2026, 10, 14), 'TXN-99120', 'Bank Transfer'),
                    (3, 'Month 3 Installment', 600, date(2026, 11, 15), 'pending', None, None, None)
                ]
            },
            {
                'student_id': 'STU-1002',
                'name': 'Samantha Ray',
                'email': 'samantha.ray@cloudbi.com',
                'phone': '+1 (555) 345-6789',
                'program_id': 'course-data-analytics',
                'program_title': 'Data Analytics',
                'program_type': 'course',
                'enrollment_date': date(2026, 8, 20),
                'payment_mode': 'full',
                'total_fee': 1200,
                'paid_amount': 1200,
                'remaining_balance': 0,
                'installments': [
                    (1, 'Full Course Tuition', 1200, date(2026, 8, 20), 'paid', date(2026, 8, 20), 'TXN-88190', 'Online Card')
                ]
            },
            {
                'student_id': 'STU-1003',
                'name': 'Kavita Patel',
                'email': 'kavita.patel@cybersec.org',
                'phone': '+1 (555) 456-7890',
                'program_id': 'course-ethical-hacking',
                'program_title': 'Ethical Hacking',
                'program_type': 'course',
                'enrollment_date': date(2026, 9, 1),
                'payment_mode': 'installment',
                'total_fee': 1500,
                'paid_amount': 500,
                'remaining_balance': 1000,
                'installments': [
                    (1, 'Month 1 Installment', 500, date(2026, 9, 1), 'paid', date(2026, 9, 1), 'TXN-90214', 'UPI'),
                    (2, 'Month 2 Installment', 500, date(2026, 10, 1), 'overdue', None, None, None),
                    (3, 'Month 3 Installment', 500, date(2026, 11, 1), 'overdue', None, None, None)
                ]
            }
        ]

        for s_data in students_data:
            inst_list = s_data.pop('installments', [])
            student, _ = Student.objects.update_or_create(student_id=s_data['student_id'], defaults=s_data)
            for m_num, title, amt, due, st, p_date, ref, meth in inst_list:
                Installment.objects.update_or_create(
                    student=student,
                    month=m_num,
                    defaults={
                        'title': title,
                        'amount': amt,
                        'due_date': due,
                        'status': st,
                        'paid_date': p_date,
                        'transaction_ref': ref,
                        'payment_method': meth
                    }
                )

        self.stdout.write(self.style.SUCCESS('Successfully seeded candidates and 3-month installments.'))

