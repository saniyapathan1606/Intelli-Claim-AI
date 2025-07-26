-- Seed sample data for demonstration

-- Insert sample policy documents
INSERT INTO documents (name, type, size, status, extracted_text, metadata) VALUES
('Health Insurance Policy Terms.pdf', 'application/pdf', 245760, 'processed', 
'COMPREHENSIVE HEALTH INSURANCE POLICY

Section 1: Coverage Details
This policy provides medical coverage up to ₹5,00,000 per policy year including:
- Hospitalization expenses
- Surgical procedures including orthopedic surgeries
- Emergency treatments and ambulance charges
- Pre and post hospitalization expenses

Section 2: Waiting Periods
- General treatments: No waiting period
- Surgical procedures: 6 months waiting period
- Pre-existing conditions: 2 years waiting period
- Maternity benefits: 10 months waiting period

Section 3: Geographic Coverage
Treatment covered in Tier 1 and Tier 2 cities including:
Mumbai, Delhi, Bangalore, Chennai, Pune, Hyderabad, Ahmedabad, Surat, Jaipur

Section 4: Age Limits
- Entry age: 18-65 years
- Renewal: Lifetime
- Dependent children: Up to 25 years

Section 5: Exclusions
- Cosmetic surgeries
- Dental treatments (unless accidental)
- Alternative medicine
- Self-inflicted injuries',
'{"pages": 25, "language": "en", "confidence": 0.96, "wordCount": 1250}'),

('Claim Processing Guidelines.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 156432, 'processed',
'CLAIM PROCESSING GUIDELINES

1. Claim Submission Requirements
- Claims must be submitted within 30 days of discharge
- Required documents: Discharge summary, bills, diagnostic reports
- Pre-authorization required for planned surgeries above ₹25,000

2. Processing Timeline
- Cashless claims: 2-4 hours for pre-authorization
- Reimbursement claims: 7-15 working days
- Investigation cases: Up to 30 days

3. Approval Criteria
- Treatment must be medically necessary
- Hospital must be network provider for cashless
- Policy must be active with premiums paid
- Waiting periods must be completed

4. Common Rejection Reasons
- Insufficient documentation
- Treatment not covered under policy
- Waiting period not completed
- Pre-existing condition not declared',
'{"pages": 12, "language": "en", "confidence": 0.94, "wordCount": 850}');

-- Insert sample policy clauses
INSERT INTO clauses (clause_id, document_id, title, content, category, page_number, relevance_keywords) VALUES
('C-001', 1, 'Orthopedic Surgery Coverage', 'Orthopedic procedures including knee surgery, hip replacement, and spine surgery are covered under Section 4.2 after completion of applicable waiting period.', 'Coverage', 12, ARRAY['orthopedic', 'knee', 'surgery', 'hip', 'spine']),

('C-002', 1, 'Waiting Period for Surgery', 'All surgical procedures require minimum 6-month policy maturity for coverage eligibility, except emergency surgeries due to accidents.', 'Waiting Period', 8, ARRAY['surgery', 'waiting', 'period', '6 months', 'emergency']),

('C-003', 1, 'Geographic Coverage', 'Treatment in Tier-1 and Tier-2 cities including Mumbai, Delhi, Pune, Bangalore, Chennai, Hyderabad is covered under standard rates.', 'Geographic', 15, ARRAY['geographic', 'tier-1', 'tier-2', 'mumbai', 'delhi', 'pune', 'bangalore']),

('C-004', 1, 'Age Eligibility', 'Policy holders between ages 18-65 are eligible for coverage. Dependent children covered up to age 25.', 'Eligibility', 5, ARRAY['age', 'eligibility', '18-65', 'dependent', 'children']),

('C-005', 1, 'Coverage Limits', 'Maximum coverage limit is ₹5,00,000 per policy year with sub-limits for specific treatments as defined in policy schedule.', 'Limits', 7, ARRAY['coverage', 'limit', '500000', 'maximum', 'sub-limits']),

('C-006', 2, 'Pre-authorization Requirements', 'Planned surgeries above ₹25,000 require pre-authorization. Emergency procedures can be intimated within 24 hours.', 'Process', 3, ARRAY['pre-authorization', 'planned', 'surgery', '25000', 'emergency']),

('C-007', 2, 'Documentation Requirements', 'Claims require discharge summary, itemized bills, diagnostic reports, and treating doctor certificate for processing.', 'Documentation', 5, ARRAY['documentation', 'discharge', 'bills', 'diagnostic', 'reports']),

('C-008', 1, 'Maternity Coverage', 'Maternity benefits available after 10 months waiting period with coverage up to ₹50,000 for normal delivery and ₹75,000 for cesarean.', 'Maternity', 18, ARRAY['maternity', '10 months', 'normal', 'cesarean', '50000', '75000']);

-- Insert sample decisions for demonstration
INSERT INTO decisions (query, parsed_query, decision, confidence, amount, justification, relevant_clauses, processing_time, documents_searched) VALUES
('46-year-old male, knee surgery in Pune, 3-month-old insurance policy', 
'{"age": "46", "gender": "male", "procedure": "knee surgery", "location": "Pune", "policyAge": "3 months"}',
'rejected', 0.89, 0, 
'Claim rejected due to insufficient policy maturity period. Surgical procedures require minimum 6-month waiting period as per policy terms.',
'[{"clauseId": "C-002", "relevanceScore": 0.94}, {"clauseId": "C-001", "relevanceScore": 0.87}]',
'2.3s', 2),

('35-year-old female, cardiac procedure, Mumbai, 2-year-old policy',
'{"age": "35", "gender": "female", "procedure": "cardiac procedure", "location": "Mumbai", "policyAge": "2 years"}',
'approved', 0.92, 125000,
'Claim approved. Policy maturity requirements met, procedure covered under cardiac care section, location within coverage area.',
'[{"clauseId": "C-003", "relevanceScore": 0.91}, {"clauseId": "C-005", "relevanceScore": 0.88}]',
'1.8s', 2);
