# DOCUMENT 4: SERVICE LEVEL AGREEMENT

**Agreement Number:** VH-SLA-2026-001

---

## SERVICE LEVEL AGREEMENT

## BETWEEN

**TOUCHLINE AGENCY (PTY) LTD** (Registration No. [__________])
trading as **VisioHealth**
(hereinafter referred to as **"VisioHealth"** or **"the Provider"**)

**AND**

**DR. [FULL LEGAL NAME] LAMOLA** (ID No. [__________])
practising as **[PRACTICE NAME]** (Practice No. [__________])
(hereinafter referred to as **"Dr. Lamola"** or **"the Client"**)

---

## RECITALS

**WHEREAS:**

A. VisioHealth provides an AI-powered healthcare practice management platform (the "Platform");

B. The Client has subscribed or intends to subscribe to the VisioHealth Professional Plan at R35,000.00 per month;

C. The Parties wish to define the service levels, performance standards, and support commitments applicable to the provision of the Platform;

D. This SLA is entered into in conjunction with the Commercial Agreement (VH-CA-2026-001) and forms part of the contractual framework between the Parties.

**NOW THEREFORE** the Parties agree as follows:

---

## 1. DEFINITIONS

1.1. Unless defined herein, capitalised terms shall have the meanings ascribed to them in the Commercial Agreement.

1.1.1. **"Business Hours"** means 08:00 to 17:00 South African Standard Time (SAST), Monday to Friday, excluding South African public holidays;

1.1.2. **"Critical Incident"** means an incident that renders the Platform or a material component thereof wholly unavailable or causes data loss, data corruption, or a security breach;

1.1.3. **"Downtime"** means any period during which the Platform is unavailable to the Client, measured from the time the incident is reported or detected (whichever is earlier) to the time the Platform is restored to normal operation;

1.1.4. **"Maintenance Window"** means the scheduled period for planned maintenance, being Sundays between 02:00 and 06:00 SAST, unless otherwise agreed in writing;

1.1.5. **"Monthly Uptime Percentage"** means the total number of minutes in a calendar month minus the number of minutes of Downtime (excluding Scheduled Downtime and Force Majeure events), divided by the total number of minutes in such month, expressed as a percentage;

1.1.6. **"Response Time"** means the time between the Client's submission of a support request and VisioHealth's first substantive response (acknowledgement of receipt with initial assessment);

1.1.7. **"Resolution Time"** means the time between the Client's submission of a support request and the full resolution or implementation of a reasonable workaround;

1.1.8. **"Scheduled Downtime"** means planned Downtime during the Maintenance Window, of which the Client has been given at least twenty-four (24) hours' prior notice;

1.1.9. **"Standard Incident"** means any incident that is not a Critical Incident, including but not limited to feature requests, configuration changes, non-critical bugs, and general queries.

---

## 2. SERVICE AVAILABILITY

2.1. **Uptime Commitment.** VisioHealth commits to maintaining a Monthly Uptime Percentage of no less than **ninety-nine point five percent (99.5%)** for the Platform.

2.2. **Calculation.** The Monthly Uptime Percentage shall be calculated as follows:

   Monthly Uptime % = ((Total Minutes in Month - Downtime Minutes) / Total Minutes in Month) x 100

2.3. **Exclusions.** The following shall not count as Downtime for the purposes of calculating the Monthly Uptime Percentage:

2.3.1. Scheduled Downtime within the Maintenance Window;

2.3.2. Downtime caused by Force Majeure events (as defined in the Commercial Agreement);

2.3.3. Downtime caused by the Client's equipment, network, or internet connectivity;

2.3.4. Downtime caused by the Client's misuse of the Platform or failure to comply with VisioHealth's reasonable usage guidelines;

2.3.5. Downtime caused by third-party services not under VisioHealth's direct control (e.g., WhatsApp API outages, payment gateway outages), provided that VisioHealth uses commercially reasonable efforts to minimise the impact of such outages.

---

## 3. AI AGENT AVAILABILITY

3.1. **24/7 Availability.** All AI Agents (triage, billing, intake, follow-up, scheduler) shall be available **twenty-four (24) hours per day, seven (7) days per week**, subject to the uptime commitment in clause 2.

3.2. **AI Credit Allocation.** The Professional Plan includes AI credits to the value of **R5,000.00 per month**. AI credit consumption shall be metered transparently via the Platform dashboard.

3.3. **Credit Exhaustion.** In the event that the Client's AI credits are exhausted prior to the end of a billing cycle:

3.3.1. the Client shall be notified via email and in-Platform notification when 80% and 100% of credits have been consumed;

3.3.2. the Client may purchase additional AI credits at the prevailing rate;

3.3.3. AI Agent functionality shall not be suspended without prior notice; rather, usage beyond the credit allocation shall be billed as an add-on in the following month's invoice.

---

## 4. WHATSAPP BOT AVAILABILITY

4.1. **24/7 Automated Service.** The WhatsApp AI Bot shall operate **twenty-four (24) hours per day, seven (7) days per week**, providing automated patient communication including:

4.1.1. appointment booking, confirmation, and reminders;

4.1.2. prescription refill reminders;

4.1.3. general practice information and FAQs;

4.1.4. patient intake form collection;

4.1.5. post-visit follow-up communications.

4.2. **Human Escalation.** During Business Hours, the WhatsApp Bot shall provide the option for patients to escalate to a human operator at the Practice. Outside Business Hours, the Bot shall inform patients that human escalation is available during the next Business Day and offer to schedule a callback.

4.3. **WhatsApp API Dependency.** WhatsApp Bot availability is dependent on the Meta/WhatsApp Business API. VisioHealth shall not be liable for outages or service interruptions attributable to Meta/WhatsApp.

---

## 5. SUPPORT RESPONSE AND RESOLUTION TIMES

5.1. VisioHealth shall provide the following support response and resolution times:

### 5.1.1. Critical Incidents

| Metric | Commitment |
|---|---|
| Response Time | **4 hours** (24/7, including weekends and public holidays) |
| Resolution Time (target) | **8 hours** |
| Escalation | Automatic escalation to senior engineering team if unresolved within 4 hours |
| Communication | Hourly status updates until resolution |

### 5.1.2. Standard Incidents

| Metric | Commitment |
|---|---|
| Response Time | **24 hours** (Business Hours) |
| Resolution Time (target) | **72 hours** |
| Escalation | Escalation to team lead if unresolved within 48 hours |
| Communication | Daily status updates until resolution |

5.2. **Support Channels.** The Client may submit support requests via:

5.2.1. Email: support@visiohealth.co.za;

5.2.2. In-Platform support ticket system;

5.2.3. Dedicated WhatsApp support line (for Critical Incidents only);

5.2.4. Telephone (during Business Hours): [__________].

5.3. **Ticket Priority.** VisioHealth reserves the right to reclassify the priority of a support request based on its reasonable assessment of the incident's severity, provided that the Client is notified of any reclassification.

---

## 6. DATA BACKUP AND RECOVERY

6.1. **Daily Backups.** VisioHealth shall perform automated backups of all Client data on a **daily** basis.

6.2. **Retention Period.** Backup copies shall be retained for a minimum period of **thirty (30) days**.

6.3. **Backup Storage.** All backups shall be stored in geographically separate locations within the Republic of South Africa, in compliance with data sovereignty requirements.

6.4. **Disaster Recovery.** VisioHealth shall maintain a disaster recovery plan with a target Recovery Time Objective (RTO) of **four (4) hours** and a target Recovery Point Objective (RPO) of **twenty-four (24) hours** for Critical Incidents.

6.5. **Data Restoration.** Upon the Client's reasonable written request, VisioHealth shall restore data from backup within **forty-eight (48) hours** of such request, subject to technical feasibility.

---

## 7. ONBOARDING SUPPORT

7.1. **Dedicated Account Manager.** VisioHealth shall assign a dedicated account manager to the Client for the first **thirty (30) days** following activation of the Platform (the "Onboarding Period").

7.2. **Onboarding Scope.** During the Onboarding Period, the account manager shall provide:

7.2.1. initial platform configuration, including practice profile setup, staff accounts, and role assignments;

7.2.2. white-label branding configuration (logo, colours, domain);

7.2.3. staff training (minimum of two (2) training sessions of up to two (2) hours each);

7.2.4. data migration assistance (from existing systems, subject to data format compatibility);

7.2.5. AI Agent configuration and testing;

7.2.6. WhatsApp Bot setup, including message template approval;

7.2.7. ICD-10 SA code mapping verification;

7.2.8. medical aid scheme integration setup;

7.2.9. delivery of one hundred (100) qualified patient leads;

7.2.10. go-live support on the first day of active operation.

7.3. **Post-Onboarding.** Following the Onboarding Period, the Client shall receive standard support in accordance with the response times set out in clause 5. Quarterly business review meetings shall be offered.

---

## 8. SERVICE CREDITS

8.1. **Eligibility.** If VisioHealth fails to meet the Monthly Uptime Percentage in any calendar month, the Client shall be entitled to service credits as follows:

| Monthly Uptime Percentage | Service Credit (% of monthly fee) |
|---|---|
| 99.0% to 99.49% | 5% |
| 98.0% to 98.99% | 10% |
| 95.0% to 97.99% | 20% |
| Below 95.0% | 30% |

8.2. **Claiming Credits.** The Client must submit a written claim for service credits within thirty (30) days of the end of the month in which the Downtime occurred. Service credits shall be applied as a discount against the next month's invoice.

8.3. **Maximum Credits.** Service credits in any calendar month shall not exceed **thirty percent (30%)** of the monthly subscription fee for that month.

8.4. **Sole Remedy.** Service credits shall be the Client's sole and exclusive remedy for failure to meet the uptime commitment in clause 2, save in the case of VisioHealth's gross negligence or wilful misconduct.

---

## 9. SECURITY AND COMPLIANCE

9.1. VisioHealth shall implement and maintain appropriate technical and organisational measures to protect the Client's data, including:

9.1.1. encryption of data in transit (TLS 1.2 or higher) and at rest (AES-256 or equivalent);

9.1.2. role-based access control with least-privilege principles;

9.1.3. multi-factor authentication for administrative access;

9.1.4. regular vulnerability assessments and penetration testing (at least annually);

9.1.5. security incident logging and monitoring;

9.1.6. compliance with POPIA requirements, including appointment of an Information Officer, processing limitation, and data subject access rights facilitation.

9.2. **Security Incidents.** VisioHealth shall notify the Client of any security incident affecting the Client's data within **twenty-four (24) hours** of becoming aware of such incident, and shall take immediate steps to contain, investigate, and remediate the incident.

9.3. **Compliance.** VisioHealth shall maintain compliance with:

9.3.1. the Protection of Personal Information Act 4 of 2013 (POPIA);

9.3.2. the National Health Act 61 of 2003, to the extent applicable to the Platform's processing of health information;

9.3.3. the Electronic Communications and Transactions Act 25 of 2002;

9.3.4. applicable HPCSA ethical guidelines relating to electronic health records and telemedicine.

---

## 10. PERFORMANCE MONITORING AND REPORTING

10.1. VisioHealth shall provide the Client with access to a real-time Platform performance dashboard displaying:

10.1.1. current uptime status;

10.1.2. AI credit usage and remaining balance;

10.1.3. active support tickets and their status;

10.1.4. WhatsApp Bot message volume and response metrics.

10.2. VisioHealth shall provide monthly performance reports within ten (10) Business Days of the end of each calendar month, including:

10.2.1. Monthly Uptime Percentage;

10.2.2. summary of all incidents (Critical and Standard);

10.2.3. average response and resolution times;

10.2.4. AI credit consumption summary;

10.2.5. any service credit entitlements.

---

## 11. CHANGES TO THE SLA

11.1. VisioHealth may amend this SLA from time to time by providing the Client with not less than **thirty (30) days'** prior written notice of the proposed amendments.

11.2. If the Client does not agree to the proposed amendments, the Client may terminate the Commercial Agreement in accordance with its terms, provided that written notice of termination is given within fifteen (15) days of receipt of the notice of amendment.

11.3. Continued use of the Platform following the effective date of any amendment shall constitute acceptance of the amended SLA.

---

## 12. DURATION

12.1. This SLA shall take effect on the Commencement Date of the Commercial Agreement and shall remain in force for the duration of the Commercial Agreement.

12.2. Upon termination of the Commercial Agreement, this SLA shall automatically terminate.

---

## 13. GOVERNING LAW

13.1. This SLA shall be governed by and construed in accordance with the laws of the Republic of South Africa.

---

## SIGNATURE BLOCKS

**SIGNED** at _________________________ on this _______ day of _________________________ 2026.

**FOR AND ON BEHALF OF TOUCHLINE AGENCY (PTY) LTD t/a VISIOHEALTH:**

| | |
|---|---|
| Signature: | _________________________________ |
| Name: | _________________________________ |
| Designation: | _________________________________ |
| Date: | _________________________________ |

---

**SIGNED** at _________________________ on this _______ day of _________________________ 2026.

**DR. LAMOLA:**

| | |
|---|---|
| Signature: | _________________________________ |
| Full Name: | _________________________________ |
| Practice No.: | _________________________________ |
| Date: | _________________________________ |

---
---
---