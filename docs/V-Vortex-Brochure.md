# V2: V-Vortex Hackathon Brochure

> ## Mission Statement

> To provide industry-like pressure and experience to the participants while working on a project towards its completion, with fun activities and great domain experts to learn from.

[vortex-app](https://v-vortex.in/)

## Overall Timeline

| Date                              | Milestone                                                                                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| December 7–8, 2025 (This Weekend) | Target kickoff for official participant registration. Backup launch: December 15, 2025.                                                                |
| December 10, 2025                 | Sponsorship lineup finalization and announcement.                                                                                                      |
| December 15, 2025                 | Venue confirmation. Expansion plan to convert the event into a national-scale hackathon with possible satellite events hosted by partner universities. |
| December 22, 2025 onward          | Optional sponsor-led bootcamp/workshop series begins.                                                                                                  |
| December 27, 2025                 | Beta rollout of the official web platform for testing and feedback.                                                                                    |
| January 7, 2026                   | Ideathon – idea submission and refinement phase.                                                                                                       |
| January 9, 2026                   | Hackathon begins.                                                                                                                                      |
| January 10, 2026                  | Shark-Tank and Bug Bounty                                                                                                                              |
| January 10, 2026                  | Results of the Hackathon                                                                                                                               |

#### Registrations Process

1. The participants will register on EventHubCC and pay the fees.
2. The participants will also be required to register in the UnStop website and form the teams.
3. On December 27, 2025, the Event's official website will be opened - where participants can again register and form the teams - finalized set of teams.
4. Multi-college teams are allowed.

**The following details are supposed to be collected:**

1. The participant's name
2. The participant's college
3. The participant's registration number
4. The participant's phone number
5. The participant's mail ID
6. The participant's payment receipt
7. The Team Name
8. The number of members in the team
9. The participant’s Gender
10. The participant’s Institute
11. The participant’s domain, course, graduating year, specialization.

## **Registration Flow**

### **EventHubCC**

If a VIT participant,

- Go to the website, login with VTOP credentials.
- Search up “V Vortex” on the website
- Click on register and form your teams (Minimum 2 members)
- The registering member can choose to pay now or pay later: Rs. 200

If a non-VIT participant,

- Go to the website, new user -> sign up, old user -> login
- Search up “V Vortex” on the website
- Click on register and form your teams (Minimum 2 members)
- The registering member can choose to pay now or pay later: Rs. 200

### **Unstop**

All details mentioned above are collected via the Unstop website, post which they can create and finalize teams.

### **V Vortex official website**

The participants are encouraged to fill in the same details as filled in the previous 2 forms.

First, the team leader will register on the website. They will have to give the:

- Their name
- Email
- Registration Number if from VIT
- Give payment receipts of all the members
- If not from VIT, they to give their Event Hub ID, and their phone number

Then, the team leader will register members on the website via their login immediately.

#### Domains and Problem Statement

## Selected Domains

The domains selected for the event are as follows:

1. ### Cybersecurity

   #### CS PS 1

### \#PS1:

Build a security analysis system that models authentication relationships and software supply-chain dependencies as a single trust-propagation graph.

It must analyse how trust flows between identities, code, and execution environments to identify hidden privilege-escalation paths and damage traversal risks.

**Minimum Requirements:**

1. Represent System as a directed graph, showcasing Idetities(users, accounts, and CI runners, etc), code artifacts(codebase, packages, dependencies, build scripts), and execution environments(mVMs, containers, VPS, Cloud resources, etc.)
2. Separate dependencies and users by those who can affect integrity and confidentiality via meaningful input.
3. Use said input to map and traverse trust relations. Be able to compute/simulate the possible damage radius of a node being compromised.
4. Represent this in the form of a visualisation, preferably with a query interface. Output must be human readable and coherent.
5. Document the comprehensive loss of integrity, confidentiality, and authenticity between nodes when certain nodes are tested to be poisoned.

   #### CS PS 2

**Problem Title**: Zero Trace Tripwire: The Labyrinth Repo **Category**: Advanced Deception Engineering & Repository Security

1. Executive Summary

   Git repositories are the primary targets for credential harvesting. Once an attacker gains read access, they scrape history and branches for secrets. The Labyrinth Repo challenge requires participants to turn a single repository into a minefield. You must deploy Vertical Siloed Pathways within the repo that lead attackers into obfuscated dead-ends, while ensuring that Authorized Users—identified by specific fingerprints—can access real credentials seamlessly and without interference.

2. The Core Innovation: The Identity-Aware Guard
   - The most critical requirement is Zero-Interference for Authorized Users.
   - **The Logic:** The system must maintain a whitelist (e.g., specific SSH fingerprints, IP ranges, or Hardware IDs).
   - **The Switch:** If an Authorized User requests a sensitive file, the system serves the functional credential. If an unauthorized user (attacker) requests the same file or scrapes the history, the system serves a Zero Trace Tripwire (ZTT).
3. Scope of Work (The 3 Vertical Silos)
   - Participants must architect three Isotropic Pathways within the same repository. There must be no horizontal connection; triggering a trap in Path A must not alert the attacker to the existence of Path B.
   - ***Pathway Alpha: The "Time-Traveler" (Git History)***

      **Bait**: "Accidental" leaks buried deep in the commit history (e.g., 50 commits back).

      **Trap**: Accessing these triggers the Sentry and serves a fake "Legacy Database" connection that leads to a tarpit.

   - ***Pathway Beta: The "Feature Creeper" (Hidden Branches)***

      **Bait**: Credentials leaked in abandoned or "Staging" branches (e.g., feature/api-v2-test).

      **Trap**: These keys lead to a mock "Internal Tool" that performs heavy obfuscation to waste the attacker’s CPU cycles.

   - ***Pathway Gamma: The "Release Hunter" (Git Tags/Releases)***

      **Bait**: Secrets hidden in old Release Tags or .zip assets attached to releases.

      **Trap**: These keys trigger an immediate "Silo Lockdown," where all subsequent requests from that attacker's IP return fake, randomized code.

4. Technical Requirements

   **Phase I: The Artisan & The Guard**

   - Build a system that recognizes authorized users.
   - Ensure real credentials remain functional and reachable only by these users.
   - Generate "believable" tripwires for everyone else.

   **Phase II: Post-Discovery Obfuscation (The Rabbit Hole)**

   - When a honey-key is used, the system must not show a "403 Forbidden" error. Instead: ● Dynamic Obfuscation: Return a 200 OK but deliver a "Recursive Rabbit Hole"—a script or file that points to another fake secret, which points to another, creating an infinite loop of useless data.
   - Tarpitting: Inject 5–10 seconds of latency into every response for the flagged attacker to frustrate their automated tools.

   **Phase III: The Sentry (Silo Monitoring)**

   - The Sentry must track the attacker's progress within a specific silo (Alpha, Beta, or Gamma).
   - Constraint: If an attacker is trapped in Alpha, they must be "blinded" to the content of Beta and Gamma to prevent horizontal pivoting.

> **Submission Deliverables**

1. > The Labyrinth Repo: A single Git repository configured with the 3 pathways.
2. > The Guard Logic: The code responsible for distinguishing between the Real User and the Attacker.
3. > Live Demonstration:
   - > User A (Authorized): Clones the repo, gets real keys, and connects to a DB.
   - > User B (Attacker): Clones the repo, finds a "leaked" key, and gets trapped in a 60-second latency loop with fake data.

   #### CS PS 3

1. ### AI/ML

   #### AI/ML PS 1

> Assignee:

**Context:**

AI-generated images are increasingly realistic and difficult to distinguish from real photographs. This poses risks in misinformation, digital fraud, and content integrity across social platforms, journalism, and online marketplaces.

**Challenge:**

Design a system that detects whether an image is AI-generated or real, while remaining robust to image compression, resizing, and post-processing.

**Core Requirements:**

- Analyze images to determine authenticity (real vs AI-generated)
- Generalize across multiple image styles and sources
- Remain reliable under common transformations (compression, cropping, noise)
- Provide confidence-aware outputs instead of binary decisions
- Explain visual cues influencing authenticity predictions
- Demonstrate behavior on previously unseen generation patterns

   #### AI/ML PS 2: AI-Powered Mind Map Search

## Context

Traditional search engines present information as ranked lists, making it difficult to explore complex topics or understand relationships between concepts. Learners and researchers benefit from structured, visual representations that encourage exploration and discovery.

## Challenge

Design a search system that retrieves information for a user query and organizes results into an interactive mind map, revealing key topics, subtopics, and relationships.

## Core Requirements

- Understand and handle ambiguous or multi-intent search queries
- Retrieve relevant information from a defined content corpus
- Automatically identify important concepts and their relationships
- Organize results into a coherent, expandable mind map structure
- Support progressive exploration without losing topic relevance
- Explain why topics or relationships were suggested

   #### AI/ML PS 3: AI-Powered Mental Well-Being Risk Indicator (Non-Clinical)

## Context

Early signs of mental well-being decline often appear as gradual changes in behavioral patterns over time, such as disrupted sleep routines, irregular activity levels, or shifts in digital usage habits. These signals are typically subtle, highly personalized, and non-clinical in nature, making early identification challenging without intrusive monitoring. A carefully designed system can help surface potential risk indicators while preserving user privacy and explicitly avoiding medical diagnosis.

## Challenge

Design a non-clinical system that analyzes anonymized behavioral patterns to identify early mental well-being risk indicators, while providing transparent, uncertainty-aware insights and ensuring ethical data handling, privacy preservation, and user control.

## Core Requirements

- Analyze anonymized behavioral patterns over time, focusing on trends, deviations from personal baselines, and irregular changes
- Generate a non-clinical mental well-being risk indicator without using medical terminology or diagnoses
- Provide interpretable explanations and uncertainty-aware outputs for identified risk indicators
- Ensure privacy-preserving design using only aggregated or transformed behavioral data
- Remain robust to missing, noisy data and to behavioral changes caused by external factors such as travel or schedule shifts

1. ### IOT and Robotics

   #### IOT PS 1: The "Sky-Glow" Sentinel - Mapping Urban Skyglow

## Context

Urban light pollution creates "skyglow," a haze that hides stars and disrupts biological clocks. This phenomenon affects both astronomical observation and human health, making it critical to understand and map light pollution patterns across cities.

## Challenge

Build a high-sensitivity Sky Quality Monitor (SQM) node that measures near-total darkness, distinguishes actual starlight from urban atmospheric reflection, and maps readings to the Bortle Scale to create a ground-level heatmap of a city's light pollution.

## Dependencies

- **Controller:** ESP32 or NodeMCU (for fast processing and Wi-Fi/Bluetooth transmission)
- **Sensor:** TSL2591 High-Dynamic-Range sensor (standard LDRs/sensors won't work for starlight-level Lux)
- **Optics:** Baffled Zenith Housing (3D printed/PVC) to restrict the field of view to the sky directly above and block streetlamp glare
- **Software:** Logic to convert raw light data into Magnitudes per Square Arcsecond (mpsas)

## Minimum Requirements

- **Precision:** Detect levels below 0.001 Lux to distinguish between a clear dark sky and cloud-reflected pollution
- **Classification:** Automatically map measurements to the Bortle Scale (Class 1-9)
- **Filtering:** Use a median filter to ignore "trash" data like passing car headlights or planes
- **Visualization:** Push real-time data to a dashboard to track "Sky Health" trends against city activity

   #### IOT PS 2: Decentralized Peer-to-Peer Mesh Network

## Problem Statement

Modern connectivity is inherently fragile due to its reliance on centralized infrastructure. In "denied environments"—such as deep mining operations, open-ocean monitoring, or post-disaster zones—the lack of Cloud access, WiFi, and GPS renders standard communication tools useless. This dependency creates a single point of failure; if the central server or internet backbone is severed, the entire network collapses. There is a critical need for a decentralized, peer-to-peer hardware mesh network capable of maintaining data integrity and communication channels without any external infrastructure.

## Dependencies (Tech Stack)

- **Microcontrollers:** ESP32 or ESP8266 (required for processing mesh logic and low-power states)
- **Comms Modules:** LoRa (SX1278) for long-range/low-bandwidth, Zigbee (XBee), or ESP-NOW (for high-speed local mesh)
- **Sensors:** GPS Modules (Neo-6M) for outdoor positioning or IMUs (MPU6050) for dead-reckoning in GPS-denied areas
- **Libraries:** PainlessMesh (for JSON-based self-healing networks), RadioHead or LoRa libraries, and custom "Store-and-Forward" algorithms

## Minimum Requirements

- **Decentralized Node Design:** Develop an independent hardware node capable of transmitting short-burst text or sensor telemetry without any internet or cellular uplink
- **Multi-Hop Routing:** Implement a protocol where data packets can "hop" across multiple devices to reach a destination far beyond the radio range of the original sender
- **Self-Healing Reliability:** The network must demonstrate dynamic rerouting; if an intermediate node is powered off or removed, the data must automatically find an alternative path to the destination without manual reconfiguration

   #### IOT PS 3: Smart Parking Detection System

## Problem Statement

In urban environments—including malls, hospitals, and residential complexes—drivers spend an average of 15–20 minutes searching for vacant parking. This inefficiency leads to increased traffic congestion, unnecessary fuel consumption, and underutilized infrastructure. The objective is to design a low-cost IoT-based detection system that identifies parking spot occupancy in real time and transmits that status to a centralized dashboard, allowing users to navigate directly to available spots.

## Dependencies (Tech Stack)

- **Microcontrollers:** ESP32 or ESP8266 (preferred for integrated Wi-Fi) or an Arduino with an ESP-01 module
- **Occupancy Sensors:** HC-SR04 Ultrasonic sensors (to measure distance to the vehicle) or IR proximity sensors for short-range detection
- **Connectivity:** MQTT protocol or HTTP Webhooks to push data to a cloud broker or local server
- **Interface:** A simple web dashboard (HTML/CSS) or a mobile application built via platforms like Blynk or [Thinger.io](http://Thinger.io)
- **Power Management:** Li-ion batteries with a TP4056 charging module or a standard 5V power adapter

## Minimum Requirements

- **Accuracy:** The system must reliably distinguish between a parked vehicle and a vacant spot without false triggers from pedestrians or small debris
- **Real-Time Latency:** Parking status updates (Occupied vs. Vacant) must reflect on the user interface within 3–5 seconds of the state change
- **Efficiency:** The hardware must utilize low-power sensors and "Sleep Modes" on the microcontroller to maximize battery life in standalone installations
- **Proof of Concept:** A physical prototype demonstrating at least one functional parking bay with a visual indicator (LED) and a corresponding digital status update
- **Scalability:** The circuit and code logic should be modular, allowing for easy replication across dozens of parking bays without complex rewiring

1. ### Health Tech

   #### HealthTech PS 1: R**ule-Based Sepsis Screening Software**

Design a rule-based sepsis screening software that continuously evaluates simulated patient vitals using qSOFA parameters, visualizes vital trends over time, and flags patients at escalating risk. The software must generate explainable alerts supported by graphical timelines and clear reasoning while strictly avoiding diagnostic conclusions or treatment recommendations.

**Expectations:**

- Use qSOFA criteria: respiratory rate, systolic BP, mental status
- Continuously track vital trends over time
- Visualize vitals with charts or timelines
- Generate risk escalation alerts with clear reasoning
- Test with at least one evolving patient scenario

**Dependencies:**

- Any programming language or framework
- Use simulated patient data only
- Understanding qSOFA criteria
- Interpreting vital sign trends
- Knowing the basics of time-critical sepsis escalation

   #### HealthTech PS 2: **Genetic Inheritance Risk Modeling System**

Design a genetic inheritance risk modeling system that represents genotypes (AA, Aa, aa; XᴬXᵃ), distinguishes genotype from phenotype, and probabilistically handles unknown or conflicting carrier states across at least three generations. The system must dynamically update offspring risk for multiple children when family information changes, support mixed autosomal and X-linked inheritance, visualize risk as probability ranges, and allow "what-if" scenario simulations.

**Expectations:**

- Model at least 3 inheritance patterns
- Support carrier vs. affected distinction
- Calculate risk for each child individually
- Visualize pedigree across minimum 3 generations

**Dependencies:**

- Mendelian inheritance rules
- Genotype–phenotype relationships
- Probability reasoning
- Ethical boundaries of genetic counseling

   #### HealthTech PS 3: Real-Time Cardiac Arrhythmia Detection & Monitoring System

Design a software that continuously analyzes simulated ECG-derived vitals, including heart rate trends and rhythm patterns, to detect early arrhythmia risk. The software must visualize cardiac trends over time, generate explainable alerts with reasoning, and handle ambiguous or evolving patterns. It should support clinical monitoring without issuing diagnostic or treatment directives.

### Expectations

- Continuous analysis of heart rate trends
- Detection of at least 2 different arrhythmia types (e.g., AFib, VT)
- Visualization of cardiac trends over time (line charts, ECG-like graphs, or dashboards)
- Generation of rule-based alerts with reasoning
- Handling of evolving or borderline patterns
- Testing with at least one multi-step simulated scenario

### Dependencies

- Any programming language or framework
- Synthetic ECG or heart rate trend data
- Basic understanding of cardiac arrhythmias
- Ability to interpret rhythm and rate trends
- Understanding of time-critical monitoring

1. ### FinTech

   #### FinTech PS 1: Unified Payment Orchestration & Automated Settlements

### Problem Context

Digital payments today operate across multiple channels such as banks, wallets, cards, and alternative payment rails. Merchants—particularly small and medium enterprises—often manage several payment integrations, resulting in fragmented workflows, delayed settlements, and manual reconciliation processes.

Post-payment activities such as refunds, split settlements, conditional releases, and delayed payouts are frequently handled through manual intervention or tightly coupled custom logic, increasing operational complexity and reducing reliability.

### Problem Statement

Design and prototype a unified payment orchestration platform that enables merchants to accept payments across multiple channels through a single interface, while automating post-payment workflows using configurable logic.

The system should demonstrate how payments can be initiated, tracked, settled, and reconciled in a reliable and auditable manner, while allowing flexibility in defining settlement rules, payment conditions, and future extensions.

### Dependencies

- Mocked or sandboxed payment gateways
- Transaction lifecycle and settlement data
- Rule configuration for post-payment workflows
- Merchant and user account simulation
- Backend services for payment orchestration

### Minimum Expectation

- Ability to initiate and track a payment (mocked or sandboxed)
- Rule-based automation for at least one post-payment action
- Merchant-facing view of transactions and settlements
- Clear transaction and settlement state visibility
- High-level system architecture diagram

   #### FinTech PS 2: Real-Time Privacy-Preserving Collaborative Transaction Monitoring & Fraud Intelligence Platform

### Problem Context

Financial institutions and payment platforms process large volumes of transactions in real time, yet fraud detection and compliance monitoring often operate in isolated systems. While fraud patterns frequently span across multiple organizations, privacy regulations and data confidentiality constraints prevent the sharing of raw transaction data.

As a result, institutions are unable to leverage shared intelligence, limiting their ability to proactively detect coordinated fraud, suspicious behavior, and compliance risks in real time.

### Problem Statement

Design and prototype a real-time transaction monitoring and compliance intelligence platform that continuously analyzes transaction activity to identify suspicious patterns, assign risk levels, and trigger appropriate actions, while enabling privacy-preserving collaboration across multiple independent entities.

The platform should demonstrate how transactional signals, behavioral indicators, and shared intelligence can be combined to support proactive fraud detection and compliance monitoring without sharing raw transaction data. Each participating entity must retain control over its own data while contributing aggregated risk signals or insights to a shared coordination mechanism that enhances overall fraud awareness.

The system should clearly explain why a transaction was flagged, blocked, or escalated, ensuring transparency, auditability, and trust.

### Dependencies

- Real-time or simulated transaction data stream
- Transactional and behavioral attributes
- Local risk scoring logic
- Simulation of multiple independent entities
- Privacy-preserving coordination or aggregation mechanism (mocked)
- Secure communication, access control, and data isolation
- Monitoring interface for alerts and compliance review

### Minimum Expectation

- Near real-time transaction processing simulation
- At least two independent entities with local fraud detection
- Risk scoring without sharing raw transaction data
- Aggregation of shared risk signals or intelligence
- Generation of fraud alerts, blocks, or escalations
- Explainable justification for each risk decision
- Basic admin/compliance dashboard
- Clear system architecture illustrating data flow and coordination

   #### FinTech PS 3: Adaptive Pricing in Real-Time Digital Marketplaces

### Context

Modern digital marketplaces such as ride-hailing, airline booking, and e-commerce platforms rely on dynamic pricing to respond to fluctuating demand and supply. However, frequent price changes, delayed customer feedback, and limited visibility into user intent make pricing decisions complex. Poor pricing strategies can lead to customer churn, loss of trust, and regulatory concerns.

### Challenge

Design a pricing system that continuously adapts prices in real time to maximize long-term business value while maintaining customer trust, fairness, and retention under uncertain and evolving market conditions.

### Core Requirements

- Adjust prices dynamically using partial and evolving demand signals
- Function effectively with delayed and noisy indicators of customer satisfaction or churn
- Balance short-term revenue with long-term customer retention
- Prevent extreme or erratic price fluctuations
- Respect ethical, fairness, and regulatory pricing constraints
- Adapt to seasonal trends, competitive pressure, and sudden demand shifts

### Rejected Domains

| **Domain** | **Reason**                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| AgriTech   | Even though this domain promised a better collaboration with V-Nest, we had to reject this domain because we could not find experts in time. |
| BlockChain | We could not find a sponsor for this track.                                                                                                  |

## Rounds

The whole event consists of three overarching rounds.

1. Ideathon
2. Hackathon
3. Investor Pitch

#### 📘 Round 1: **Ideathon**

### 📅 Schedule & Kickoff

The Ideathon round will officially begin on **January 7, 2025**, immediately after lunch at **12:00 PM**. The entire round will be conducted online, via the website.

| Stage                 | Date & Time                           | What Happens                               | Who Handles It        |
| --------------------- | ------------------------------------- | ------------------------------------------ | --------------------- |
| Event Start           | Jan 7, 2026 — 12:0 0 PM (after lunch) | Teams choose domain → random PS assignment | PS Committee          |
| Open Innovation Opens | Jan 7 — 10:00 PM                      | Teams may submit own PS                    | PS Committee          |
| Submissions Open      | Jan 8 — 12:00 AM                      | PPT → PDF upload with Drive link           | Participants + WebDev |
| Submissions Close     | Jan 8 — 8:00 PM                       | Final link submission locked               | WebDev + Organisers   |
| Evaluation Window     | Jan 8 — 8 PM to Jan 9 — 4 AM          | 180DC + Judges evaluate                    | Evaluation Panel      |
| Results Release       | Jan 9 — 7:00 AM                       | Results live on website                    | WebDev + PR Team      |

## 🧩 Problem Statements (PS) Allocation

1. Teams will first be asked to **choose a domain** from the available categories.
2. Each selected domain contains **three problem statements**, curated beforehand. Each team can select their problem statement from a slot based system. Each will have only slots evenly distributed based on the number of teams, irrespective of the complexity of the domain.
3. Problem statements are distributed such that **multiple teams work on the same prompt**, ensuring fairness and comparative evaluation.
4. Problem statements come from **two sources**:
   - **Sponsored PS** - provided by guests, judges, partners, or sponsors.
   - **Internal Technical PS** - submitted by domain experts from the technical/innovation team.

### Committee Workflow for PS Finalization

| Committee/Team                   | Responsibility                                                                          |
| -------------------------------- | --------------------------------------------------------------------------------------- |
| Sponsorship & Judges Team        | Acquires problem statements from external sponsors                                      |
| Technical Team                   | Provides domain-expert vetted PS                                                        |
| Planning and Direction Committee | Collects PS from sponsors + internal tech team and select the right problem statements. |

The committee will consolidate all inputs and **select the final PS list** that will be used during the Ideathon.

## 💡 Open Innovation Track (Optional)

- At **10 PM on January 6**, teams who **initially picked a pre-existing PS** may additionally opt for the **Open Innovation Track**.
- They may **propose and submit their own problem statement**, alongside a proposed unique solution in a PPT; within the scope of the given domains.
- These open submissions will be **evaluated separately** along with the main entries.

> *This enables student-driven creativity for participants who wish to explore solutions beyond assigned domains.*

## 📝 Submission Process

The PPT submission window will open from:

**📌 January 7→8, 2026 — 12:00 AM (Midnight)**

They have to select their problem statements.

**📌 January 8, 2026 — 8:00 PM**

During this time, teams must:

1. Create a **presentation (PPT) summarizing their idea & approach**.
2. Export it as a **PDF file**.
3. Upload the PDF to **Google Drive**.
4. Set visibility to **"Anyone with the link can view"**.
5. Submit the PDF link using the official submission form.
6. Teams opting for Open Innovation must provide **two links**:
   - Main problem statement PPT's PDF
   - Open innovation PPT's PDF

> *The submission link and website interface will be handled by the **Web Development Team**.*

## 🏛 Evaluation Phase

- Submissions close **strictly at 8 PM on January 8**.
- After this, **180 Degrees Consulting (180DC)** along with the evaluation panel will begin assessments.
- The judging process must be completed by **4 AM on January 9**, ensuring sufficient time for final rankings and quality checks.
- There will be 5 evaluations teams, one per each domain, from 180DC; with the composition as follows:
   - 1 senior member from 3rd year
   - A couple of first-or-second years accompanying them
- Firstly, 180DC will evaluate the open innovation track and select the top 10 teams. The other teams who were in open innovation track will have to go to their originally selected problem statements.
- Then, the 180DC team will evaluate the rest of the submissions, ignoring the 10 selected teams.

### Web/Technical Team Support:

- Submission dashboard monitoring
- Backup exports of drive links
- Score calculator integration (if available)

## 🏆 Results & Publishing

- Final results of the Ideathon will be prepared and verified between **4 AM – 6 AM**.
- The publishing team will format and upload the results to the **official website**.
- Results will go live by **7 AM on January 9, 2026**.

**All teams, sponsors, judges, and mentors will be notified accordingly.**

## Evaluation Rubrics

| Category                            | What is Evaluated                                                      | Score Range | Scoring Guide                                                                                                                                                                      |
| ----------------------------------- | ---------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Problem Understanding & Research | Clarity of problem statement, depth of context, analysis of root cause | 0–15        | 0–3: vague understanding<br>4–6: decent clarity, partial analysis<br>7–9: strong research with supporting reasoning<br>10: excellent depth, root-cause explored with data/insights |
| 2. Innovation & Creativity          | Uniqueness of solution, novelty, out-of-the-box thinking               | 0–15        | 0–3: common/simple idea<br>4–6: moderately creative<br>7–9: clearly innovative, unique approach<br>10: wow factor, highly creative/disruptive                                      |
| 4. Technical/Business Approach      | Tech stack or business model clarity, architecture, process flow       | 0–7         | 0–2: minimal technical/business detail<br>3–5: decent structure, partially complete<br>6–7: robust architecture/model with clarity                                                 |
| 5. Impact & Scalability             | Target audience, reach, long-term potential, measurable benefit        | 0–7         | 0–2: low impact/local scope<br>3–5: moderate impact, some scaling potential<br>6–7: strong impact, scalable solution with clear value                                              |
| 6. Presentation Quality             | PPT clarity, storytelling, flow, formatting, professionalism           | 0–6         | 0–2: cluttered or unclear<br>3–4: readable with minor issues<br>5–6: polished, crisp, compelling presentation                                                                      |

#### Round 2: Hackathon

The hackathon will kick off in the morning at 9:00 AM. Participants are requested to participate in as early as possible in order to maximize time savings during the hackathon.

## Overview of the Hackathon Timeline

### MG Auditorium Plan

| Name                                        | Date                                     |
| ------------------------------------------- | ---------------------------------------- |
| Start of Hackathon                          | 9 January 2026 09:00 → 10:00             |
| Introduction of the Guests and Speakers     | 9 January 2026 10:00 → 10:30             |
| Pro-VC Speaker Segment                      | 9 January 2026 10:30 → 11:00             |
| Vivian Gomes (Speaker Segment A)            | 9 January 2026 11:00 → 11:30             |
| Speaker Segment B (Sponsor-aided awareness) | 9 January 2026 11:30 → 12:00             |
| Lunch Break                                 | 9 January 2026 12:30 → 13:30             |
| Review 1 (30% Completion)                   | 9 January 2026 14:30→ 15:30              |
| Release of the Results of Review 1          | 9 January 2026 16:00                     |
| Refreshments Break                          | 9 January 2026 16:30 → 17:00             |
| Dinner Break                                | 9 January 2026 19:00 → 20:00             |
| Review 2 (50% Completion)                   | 9 January 2026 23:00 → 10 Jan 2026 01:00 |
| Release of the Results of Review 2          | 10 January 2026 01:30                    |

As per changed plan…

### Secondary Auditorium

After 6 AM on January 10, 2026; we will have to vacate MG Auditorium.

| Name                                                         | Date                          |
| ------------------------------------------------------------ | ----------------------------- |
| Movement of Review 3 qualified teams to Secondary Auditorium | 10 January 2026 01:30 → 02:00 |
| Hackathon continues                                          | 10 January 2026 02:30 → 07:00 |
| Final Submission (Review 3)                                  | 10 January 2026 07:00 → 08:30 |
| Release of the Results of Review 3                           | 10 January 2026 08:30 → 09:00 |
| Breakfast and Refreshment Break                              | 10 January 2026 08:30 → 09:30 |
| Parallel Quiz-mania by external Sponsor                      | 10 January 2026 09:30 → 11:30 |
| Investor Pitch + Surprise Event                              | 10 January 2026 11:00 → 13:00 |
| Release of Results and Vote of Thanks                        | 10 January 2026 13:30 → 14:00 |

#### Start of the Hackathon

The registration desk will start accepting people into the hackathon from 8:00 AM itself. They will be allowed to sit down and set up shop the moment they are allowed inside the hackathon.

At 9:00 AM, the participants will be given a brief instructions about what they should do during the course of the hackathon.

General Order One:

1. They must maintain decency and decorum in the auditorium.
2. They must not litter the auditorium.
3. They must upload their code to GitHub and must always make commits every 1 hour.
4. They can always ask for mentorship or doubts to the organising committee, and we will be ready to help out in the best way possible.
5. They must follow the periodic announcements made by the organising committee from time to time.

Once the instructions have been, they can start with their preparations.

At 9:45 AM, they will be requested to stop any conversations in order to welcome the dignitaries.

#### Welcoming the Dignitaries

At 9:50 AM, the red carpet will be rolled out for the dignitaries, where they will enter the auditorium under the announcement of the mic.

Then, they will be asked to light the kutthu velakku, a sign of hope. After that that, a short intro about the guests will be made.

And they will be asked to sit on stage…

#### Speakers Section

This section will last 1.5 hours-2 hours.

The speakers for the hackathon segment are:

1. Pro-VC Speech
2. Vivian Gomes (Chief Guest)
3. One sponsor's lecture about AI

Here is what this section entails:

- The speakers will talk about their life experiences.
- After each speaker finishes giving their speech, we will grant them with a momento. If they need to leave, they can leave the event after that.
- Food will be provided to the speaker.
- Immediately after

#### Review 1

During this review, we will domain based expert faculty to review the work of the students. It will be handled by predominantly by SCOPE. Faculty will be put in groups of 1-3 and they will each have to evaluate 100 teams. Each group will specialize in a particular domain.

| Category                               | Marks | What to Evaluate                                                                                             |
| -------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------ |
| Problem Understanding & Research       | 10    | Clarity of the problem statement, background research, user needs analysis, justification of chosen approach |
| Idea Feasibility & Solution Approach   | 10    | Proposed architecture/flow, feasibility of execution within hackathon timeframe, clarity of MVP scope        |
| Initial Technical Implementation       | 10    | Early development work, basic modules setup, codebase initialized, repo structure, proof-of-concept builds   |
| Architecture / System Design Readiness | 8     | Tech stack finalized, workflow diagrams, API design, DB models, module breakdown, integration plan           |
| Innovation & Uniqueness of Approach    | 6     | Creativity, originality, differentiated problem-solving angle                                                |
| Team Planning & Execution Strategy     | 6     | Task division, timeline planning, milestones set, use of project tools (Git, Trello, etc.)                   |

The faculty will be assistrd

#### Review 2

This review will be conducted over the wee hours of 2026.

The aim of this review is to evaluate the progress of teams and ensure that they've completed atleast 50% of the work.

This review will be conducted by the technical support committee of V-Vortex.

Is it a good proposition? Yes!

Marks will be given as per the given rubric

| Category                          | Marks | What is Evaluated                                                      |
| --------------------------------- | ----- | ---------------------------------------------------------------------- |
| Progress & Completion Level       | 10    | % of core features built, visible implementation, foundation stability |
| Functionality Demo                | 10    | Working prototype, key flows running, partial usability                |
| Code Quality & Structure          | 8     | Modularity, readability, documentation, version control                |
| Technical Difficulty & Innovation | 8     | Engineering depth, tech stack usage, creativity, uniqueness            |
| Problem–Solution Fit & Value      | 6     | Clarity of use-case, effectiveness, real-world relevance               |
| Team Workflow & Role Division     | 4     | Collaboration, time management, responsibilities clarity               |
| Roadmap to 100% Completion        | 4     | Remaining plan, clarity of next tasks, feasibility                     |

| Score | Meaning                                   |
| ----- | ----------------------------------------- |
| 45–50 | Exceptional progress — ahead of schedule  |
| 38–44 | On track — expected to finish strong      |
| 30–37 | Slightly behind — needs direction & focus |
| <30   | Risk zone — requires serious re-alignment |

#### Review 3

> Final Submission Review

> The review will end by 8:30 AM of Hackathon Day 2.

The teams will be asked to freeze development, and upload links to their codebase. The links will be:

1. Deployed Version of Code
2. Final PPT
3. GitHub Link (setting repo as public)
4. Link to a zip file contacting the code too
5. Documentation (optional)

Reviewers will be extremely professional guests who have exquisite domain knowledge of their respective field.

The rubrics will be evaluated as per given rubrics.

| Category                                    | Marks | What Judges Must Look For                                                                           |
| ------------------------------------------- | ----- | --------------------------------------------------------------------------------------------------- |
| 1. Final Product Completion & Functionality | 10    | Working product, complete flow, stability, successful execution of core features                    |
| 2. Technical Implementation & Complexity    | 10    | Depth of engineering, efficiency, scalability, optimized architecture, difficulty of problem solved |
| 3. Innovation & Creativity                  | 6     | Originality, novelty of idea/approach, smart use of tech, “wow factor”                              |
| 4. UI/UX Quality                            | 6     | Visual design, ease of use, responsiveness, user journey smoothness                                 |
| 5. Real-World Usefulness & Impact           | 6     | Problem relevance, potential adoption, long-term value, clarity of impact                           |
| 6. Presentation & Pitch Delivery            | 5     | Communication, demo clarity, ability to explain solution, confidence                                |
| 7. Documentation & Code Quality             | 2     | Clean code, repo structure, README, setup guide, comments, version control                          |
| 8. Response Time &                          | 5     |                                                                                                     |

#### Breaks

Breaks will offered at vantage timings in order to keep both the judges and the people engaged.

The breaks have been evenly spaced out, this time around.

During 3 of those breaks, the participants will get refreshments.

#### Round 3: Investor Pitch + Bug Bounty

The Round 3 phase is a two hour phase that would be conducted between January 10, 2026 from 11 AM to 1 PM.

#### Finalists' Stream: PitchVortex - Investor Pitch

This event simulates real-world investment where judges act as “Sharks” and allocate credits to startups/ideas.

> ## Objective

> Encourage innovation, pitching skills, business thinking, and practical solution design.

- The shark tank will be conducted under the able mentorship of director V-NEST.
- Only the top 15 teams will get into this round.
- The Director of V-Nest and his team will take care of financial aspects of each idea, and will ask questions related to that part.
- The Dr. Deepa from Bhavesh Associates will take care of the legal aspect of each idea.
- The other judges will take care of the technical aspects of each idea.

## Credits System

1 credit = 1 USD

- Each judge receives **XX credits** (modifiable by organizers), that they have to distribute among the different finalists according to their pitch.
- Judges may distribute credits to **one or multiple teams**.
- Teams may receive investment from multiple judges.
- **Unused credits are wasted and cannot be saved.**
- Use of profanity or show of indecorum may lead to automatic deduction in credits alloted by the judges. The deduction may be upto 25% of all credits awarded to the team.

## Judging Model

This event follows two special enhancements:

**(A) Auction-Style Investment Phase**

   After pitches, judges may ask questions and teams must defend their idea.

**(B) Blind Allocation Phase**

   Judges finalize investments privately using credit slips/forms.

## Event Flow

1. Welcome & rules explanation
2. Teams pitch (5–7 minutes)
3. Investor Q&A and negotiation
4. Judges allocate credits privately
5. Credits are tallied
6. Winner announcement

## Evaluation Factors

Judges may consider:

| Criteria            | Questions to Ask                        |
| ------------------- | --------------------------------------- |
| Innovation          | Is it unique or creative?               |
| Feasibility         | Can the idea be built realistically?    |
| Market Potential    | Will people pay for it? Is it scalable? |
| Prototype/Execution | How far are they in development?        |
| Presentation        | Clear, confident pitch?                 |
| Impact              | Social/tech/economic value?             |

## Win Condition

The scores will be weighed and uploaded to the website.

- 🏆 The **team with the highest total credits wins and will take away the title winner award,** based solely on the scores of the investor pitch.
- Runner-ups may be awarded based on ranking.
- We will offer internships to the first three winners, without any interviews for the position. A company has agreed to offer the internship.

The score card for Shark Tank will be independent of the main score card.

## Fairness Rules

- No judge may change credits after submission.
- Judges cannot influence each other’s allocation.
- Audience interaction is allowed but judges have final authority.

#### Review 2: CaptureVortex - CTF+Bug Report

As mentioned in the previous listing, for those are not part of the top 40 teams according to the leaderboard after Review 2, they will have a CTF+bug report program. It will conducted on the TryHackMe platform.

#### Non-Finalist Round

This round is a sponsor conducted Quiz round, with whom we are still conducting negotiations with.

Rest assured, we will send an update on this page once we get a concrete plan in.

## Score card distribution

Score cards with valuable information will be provided at vantage points during the hackathon. Only the main score card is given below. The other score cards will be included in their respective sections.

## Main Score Card

| Item     | Scoring points | Weightage |
| -------- | -------------- | --------- |
| Ideathon | 50 marks       | 20%       |
| Review 1 | 50 marks       | 15%       |
| Review 2 | 50 marks       | 15%       |
| Review 3 | 100 marks      | 50%       |

## Finances

#### Sponsorships

## Sponsorship tiers and types

| Category                 | Contribution                                                                     | Benefits                                                                                                                                             |
| ------------------------ | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Title Sponsor (in cash)  | ₹30,000+                                                                         | Naming rights, logo on T-shirt, banner, website, certificates, & main stage announcement, social media announcement                                  |
| Gold Sponsor (in cash)   | ₹25,000+                                                                         | Logo on posters, website, certificates; announcement on Social Media                                                                                 |
| Silver Sponsor (in cash) | ₹15,000+                                                                         | Announcement on Social Media, Logo on posters & website                                                                                              |
| Bronze Sponsor (in cash) | ₹8,000+                                                                          | Announcement on Social Media, Logo on website                                                                                                        |
| Goodies Sponsor          | Any amount/products                                                              | Branding during prize distribution & Instagram shout-out                                                                                             |
| Internship Sponsor       | Providing paid or unpaid internships                                             | Same benefits as Title Sponsor or Gold Sponsor based on nature of internships; and with access to the data on the submissions of the top 3 teams     |
| PS Sponsor               | Provide us with a problem statement along with some monetary benefits            | Similar benefits as Title Sponsor, and we will give your company data regarding the submission for your sponsored PS; if your PS is accepted by VIT. |
| Food Sponsor             | Sponsor partially refreshments or provide meals for ~50 organizers/participants. | Similar benefits to Title, Gold or Silver Sponsor based on the nature of food sponsored                                                              |

## Acquired Sponsors

| **Sponsor/Partners**         | **Offerings**                   | **Expectations**                                       |
| ---------------------------- | ------------------------------- | ------------------------------------------------------ |
| Shnorh                       | Rs. 15000 + Design R&D + Print  | Silver Sponsor perks                                   |
| Bhavesh Associates           | Rs. 20000                       | Silver+ Sponsor perks                                  |
| Unstop                       | Goodies + 10% off Untop Premium | Branding + Register people on Unstop + Branding Report |
| Codebyte                     | Paid Internship                 | Internship Sponsor perks                               |
| VIT Chennai Students Network | Marketing                       | Branding                                               |
| CodeOnJVM                    | Marketing                       | Branding                                               |
| LearnHub                     | Marketing                       | Branding                                               |

### EduTech Sponsors

#### Unstop

## What are they offering?

- Goodies (like t-shirts, diaries, bookmarks, stickers) for the winners
- 10% additional discount on Unstop Pro for all participants
- Participation e-Certificates
- Promotion of event/festival through: 1 Instagram story (140K+ followers)

## \#What do they expect from us?

- Registrations for your event will be done through Unstop only. (negotiation to redirect participants to vit-eventhub page.)
- Unstop logo visibility as Powered By on the website, social media, PR releases, newspaper articles, and other branding collaterals.
- Mention the link to your listed opportunity at Unstop on the college/event website.
- Tag/Mention Unstop pages on all Social Media posts with our logo.
- LinkedIn posts by the event organiser highlighting the collaboration and partnership experience.
- LinkedIn post acknowledging Unstop as event partner. Once the post is live, they will proceed with dispatching the goodies.
- Share a branding report with screenshots/links showing Unstop’s visibility (event promotions, banners/backdrops with logo, prize distribution with goodies).

#### VIT Chennai Students Network

## What are they offering to us?

They wish to promote this hackathon via their social media handles and help out in the promotions.

## What do they expect?

They want their logo to be displayed as a marketing sponsor on the hub.

#### EduTech Community - Learnhub

### Community Partners

1. CODE ON JVM (Confirm)

## Sponsors in talk

2. Canara Bank
3. UIT Path
4. CODEBYTE - INTERNSHIP SPONSOR

## Cancelled Sponsors

1. OSEN:
Offered: Rs. 10000
Type: Rejected
Reason for Rejection: Wanted the 10-15 projects and full Registration Data, both of which VIT was not willing to provide.
2. IDFC Bank:
Offered: Monetary Support and Goodies
Type: Backed out
Reason for backing out: Another event happening at IIT Madras for which they are sponsoring.

## Letter to Sponsors (Draft)

[Inviting Sponsors for V-Vortex.pdf](https://resv2.craft.do/user/full/b8b89018-aef2-86a2-127d-5e07bf8933bc/doc/71f90131-208e-fe7e-705a-f375675cf2b3/bbf39f77-a1ea-49a7-b466-07384876bdd7)

[v-vortex letter.docx](https://resv2.craft.do/user/full/b8b89018-aef2-86a2-127d-5e07bf8933bc/doc/71f90131-208e-fe7e-705a-f375675cf2b3/6cd4e8b2-fa27-f8c8-c3bf-6acaf851d817)

#### Calculations

#### EXPENDITURE

| Title | PER PIECE COST | NO. OF PIECES | TOTAL COST |
| --- | --- | --- | --- |
| SAMOSA | 15/- | 400 | 6,000/- |
| JUICE | 10/- | 400 | 4,000/- |
| CHIPS+BISCUITS | (5+5)/- | 400+400 | (2,000+2,000)/- |
| TEA & COFFEE | 12/- | 400 | 4,800/-  |
| TRANSPORTATION | - | - | 1,000/- |
| GST for EventHub | - | - | 12,500/- |
| Prize Pool |  |  | 30,000/- |
| MISC (OC, printings, domain purchase) |  |  | 7,500/- |
| Total (Overall) |  |  | 70,000/- |

#### REVENUE

1. REG. FEE - 70,000/- (estd.) ( 200 per participant , 350 participants)
2. Prize Pool Sponsorships - Rs. 30000

## Surplus: Rs. 30,000

## Committees

1. Planning Committee
2. Advisory Board / Core Team
3. Management and Operations
4. Guests, Sponsorships and Judges Committee
5. Technical Support Committee
6. WebDev Full-Stack Committee
7. PS and Evaluation Committee
8. Social Media and Communications Committee
9. Security and Coordination Committee
10. Registrations and Marketing Committee

### Top-Level Committees

#### Planning and Direction Committee (Main Board)

> ## Mandate

> To ensure overall coordination among all the committees, participants and the college management.

The Planning Committee serves as the apex body guiding the hackathon’s vision, structure and execution. It ensures that every arm of the organising team functions cohesively, maintains communication with institutional authorities, and upholds standards of quality, safety, and professionalism throughout the event lifecycle.

## Members

1. Sugeeth Jayaraj S A
Student Coordinator
2. Prasanna M
Student Coordinator
3. Yashwant
Advisory Board Representative
4. Pariksith
Senior as a Advisor
5. Sarathi
Senior as a Advisor

## Responsibilities

- Lead the strategic planning and execution of the hackathon from pre-event setup to post-event evaluation.
- Review, approve, and supervise proposals from all committees including logistics, marketing, technical tracks, budgeting, and sponsorships.
- Act as the primary interface between the organising team and faculty coordinators, ensuring alignment with institutional standards and policies.
- Monitor progress across teams, resolve escalations, and maintain clear communication channels for high operational efficiency.
- Ensure smooth collaboration among event heads, mentors, volunteers, and external stakeholders.

### **1. Pre-Event – Problem Statement (PS) Curation**

- Collect problem statements from sponsors, technical clubs, internal teams, and industry partners.
- Filter, refine, and standardise PS formats to ensure clarity, feasibility, and innovation potential.
- Evaluate PS relevance to current tech trends, outcomes, and future scalability.
- Coordinate with Sponsorship & Technical Committees for approval and alignment.
- Prepare final problem statement booklet/portal for participants.

## Limitations

The committee functions under the guidance and regulatory boundaries defined by the Faculty Coordinator and SCOPE, ensuring compliance with academic and organisational norms.

#### Core Team / Advisory Board

> ## Mandate

> We advise the Planning Committee on all matters related to the hackathon.

The Advisory Board functions as the guiding authority for the hackathon, offering expert insights and ensuring that decisions align with academic integrity, industry relevance, and organisational objectives. They advise student leaders, validate critical decisions, and help steer the event toward a successful, impactful outcome.

## Members

The leads of all departments are automatically members of the advisory board. Additionally we have a few other members whose opinions we will consider for their expertise.

1. J C Kawin
2. Harsh
3. Tanushree

## Responsibilities

- Provide strategic insight, industry perspective, and high-level guidance to the planning and execution teams.
- Offer advice on technical structure, event flow, judging criteria, outreach strategies and scalability.
- Support decision-making in areas requiring expertise or conflict resolution.
- Review proposals requiring experience-based judgement and ensure alignment with long-term vision.
- Mentor student leads and committees, ensuring knowledge transfer and capability building for future organisers.

### **Limitations**

The board does not intervene in day-to-day execution unless required for escalation or critical decision-making. Their role remains advisory, not operational.

### Second-Level Committees

#### Management and Operations

> ## Mandate

> They must coordinate the entire event, oversee multiple committees and ensure unity and harmony while adhering to the directives of the Planning Committee.

The Management & Operations Committee forms the operational backbone of the hackathon. Responsible for aligning teams, monitoring execution phases, and resolving workflow conflicts, they ensure that the event remains organised, consistent, and deadline-oriented. They make operational decisions, maintain communication pipelines, and ensure that every committee functions harmoniously toward a unified event vision. Minor decisions may be made independently to maintain efficiency, while major changes remain under Planning Committee authority.

## Members

1. Sugeeth Jayaraj S A
Honorary member
2. Prasanna M **Lead of Committee**
3. Harsh
Liaison between WebDev and Management
4. Kaushick
5. Tanushree
6. Akash S
24ECE

### **Powers / Responsibilities**

1. Implement and enforce decisions passed by the Planning Committee.
2. Onboard or release team members when necessary, subject to Planning Committee approval.
3. Monitor progress, ensure deadlines are met, and make minor operational decisions to keep workflows on track.
4. Maintain unified communication between committees, resolve coordination issues, and ensure clarity in task distribution.
5. Oversee execution during the event days -venue management, task deployment, issue resolution, and real-time decision support.
6. Ensure harmony, accountability, and transparency in operations across all teams.

### **Limitations**

1. Acts within the boundaries set by the Planning Committee
2. Major decisions require approval.

## **Core Responsibilities**

### **1. Pre-Event Phase**

- Translate Planning Committee decisions into structured task plans.
- Allocate responsibilities to committees & volunteers; maintain accountability tracking.
- Maintain strong communication across committees through regular sync meetings.
- Oversee registration workflows, deadlines, documentation and task progression.
- Coordinate with Logistics, Tech, Marketing, Sponsors, and Venue teams.
- Prepare volunteer rosters, duty charts, and contingency backup plans.
- Conduct campus walkthroughs & resource requirement assessments.

### **2. During the Event**

- Operate the central control desk ensuring live communication between teams.
- Manage ground-level operations: venue readiness, seating, helpdesks, movement flow.
- Deploy volunteers based on requirements; resolve last-minute issues promptly.
- Coordinate with on-ground committees: Logistics, Hospitality, Tech Support, Marketing.
- Handle time-bound workflows (session changes, check-ins, judging rounds, ceremonies).
- Supervise safety, crowd management, resource distribution & workflow discipline.
- Act as escalation and decision support for urgent operational requirements.

### **3. Post-Event Phase**

- Manage event wind-down, hall clearance, and inventory return.
- Compile operational reports, feedback, and improvement action notes.
- Support creative/media teams with post-event coordination when needed.
- Conduct debrief and submit final performance reports to the Planning Committee.

#### Guests, Sponsorships  and Judges Committee

## Mandate

The Judges & Sponsorship Committee is responsible for securing event sponsors, inviting speakers, acquiring internship/partnership opportunities, and managing the onboarding of judges. They act as the primary point of contact for external bodies—corporate, academic, and industry—and ensure sponsor commitments and guest requirements are fulfilled professionally. Their work directly supports event funding, outreach, and quality of technical evaluation.

## Members

1. M. Shree
Lead of the Committee
2. Kritin
3. Prasanna M

## Plan

1. They will contact sponsors and get ready with the sponsorships and internships.
2. They will contact prospective speakers and ensure accomodations for them.
3. They will ensure that the requirements of the sponsors are met by the team after the sponsors have been approved.

## **Core Responsibilities**

### **1. Sponsorship Acquisition & Partnership Development**

- Identify potential sponsors, partners, tech companies, startups, incubators, and CSR bodies.
- Prepare sponsorship proposals, pitch decks, mail formats, and communication collaterals.
- Reach out via email/LinkedIn/calls through a structured outreach plan.
- Negotiate deliverables, branding placement, perks, booth spaces, and sponsor tiers.
- Coordinate with Finance/Planning Committees for approvals and formal agreements.
- Maintain sponsor communication throughout pre-event and event phases.

### **2. Judge & Speaker Coordination**

- Shortlist and invite judges, mentors, domain experts, keynote speakers.
- Handle formal communication, schedules, briefing documents, and expectations.
- Ensure hospitality arrangements (transport, accommodation, food, kits, protocol).
- Communicate judging frameworks, rubrics, timelines and event flow to judges.
- Escort VIPs during event and ensure smooth movement to stages/rooms.
- Maintain backup judges list for contingencies.

### **3. Sponsor Deliverables & Integration**

- Ensure sponsor branding visibility and commitments are fulfilled.
- Coordinate with Marketing for logo placement, banners, posts, brochure inclusion.
- Help sponsors set up booth/interaction zones, if part of the deal.
- Ensure perks such as workshops, sessions, swags, talk slots (if applicable) are scheduled.
- Track deliverables post-event if ongoing opportunities exist (internships, offers).

### **5. Post-Event Responsibilities**

- Send thank-you mails and certificates to sponsors and judges.
- Compile a sponsorship outcome report including funds generated vs required.
- Maintain contacts for future editions and long-term partnerships.

## **Authority**

- Can initiate outreach to external partners for sponsorships and speaker engagement.
- Can negotiate within approved sponsorship frameworks.
- Can coordinate judge/speaker logistics with SAC& Marketing.

## **Limitations**

- Final approval of sponsorship amounts, offers, or benefits must come from Planning Committee.
- Cannot independently sign contracts or commit deliverables without authorization.

### Committees that report to the Management Committee

#### Technical Committees

#### Technical Support Committee

## Mandate:

The Technical Support Committee ensures that the hackathon maintains a high standard of technological relevance and domain rigor. The team develops and refines problem statements, collaborates with industry professionals and domain experts, invites technical speakers, and supports judging teams with technical verification during the evaluation phases. They serve as the knowledge backbone of the hackathon - bridging expertise, innovation, and feasibility. Additionally, they will serve as mentors during the hackathon.

## Members

1. Yashwant Gokul P
25BYB1063
Lead
2. Chittesh D
25BRS1255
Co-Lead
3. Harish Vaitheeswar
4. J C Kawin

## Unified Applications Link for the Technical Committees

## **Core Responsibilities**

### **1. Pre-Event Phase**

- Work with domain experts and industry professionals to craft high-quality problem statements.
- Assist the PS & Evaluations Committee in PS filtering and technical feasibility reviews.
- Bring in technical speakers for workshops, inductions, and keynote knowledge sessions.
- Prepare documentation for rules, tech stacks, data usage guidelines, and API access.
- Support sponsorship discussions in cases involving technical deliverables or product integrations.

### **2. During the Event**

- Provide on-ground technical assistance to teams, mentors, and evaluators.
- Help judges validate technical implementations during prototype/demo evaluations.
- Resolve technical blockers like domain doubts, stack clarifications, or tool usage constraints.
- Coordinate with Evaluations Committee to ensure parity and fairness in judging criteria.
- Maintain technical resource points (SDK access, repo links, cloud credits, hardware assistance if any).
- They will help the students participating and will serve as mentors during the hackathon.

### **3. Collaboration with Other Committees**

- Work closely with PS & Evaluations Committee for rubric alignment and ideathon workflow.
- Assist Sponsorship Committee when sponsors provide technical PS, cloud credits, tools or frameworks.
- Support WebDev, Management, and Security teams where technical infrastructure or clarifications are needed.

### **4. Post-Event**

- Compile reports on problem statement performance, solution patterns, and participant tech trends.
- Recommend improvements for future editions including domain expansions or new tracks.
- Archive technical content, PS documents, workshops, and recordings for next hackathon cycles.

## **Authority**

- Can suggest, refine, approve or reject technical feasibility of problem statements.
- Can coordinate directly with speakers and domain experts regarding technical sessions.
- May standardize toolkits/frameworks and issue technical advisories to participants.

## **Limitations**

- Final PS selection is shared with PS & Evaluations + Sponsorship + Planning Committees.
- No independent authority over sponsorship contracts or scoring outcomes.

#### WebDev Full-Stack Committee

## Mandate

This committee is responsible for building out all the functionality for the website for the hackathon . They will have deadlines to deploy the respective sections of website, and would have to deploy the entire website by the end of December 2025.

They will hand over the website ownership to the technical support committee upon completion.

## Timeline for Deployment

| Deployment Item                                   | Deployment Date   |
| ------------------------------------------------- | ----------------- |
| Front Page                                        | December 7, 2025  |
| Registrations for the team                        | December 10, 2025 |
| Ideathon Deployment (Along with Admin Dashboards) | December 15, 2025 |
| Hackathon Deployment                              | December 21, 2025 |
| Shark Tank + Bug Bounty Deployment                | December 27, 2025 |
| Battle-testing and Final Deployment               | December 30, 2025 |

#### Evaluation Committee

## Mandate:

Their job will be to ensure that they select the best problem statements from both the sponsored and non-sponsored set of problem statements provided by both the sponsorship and technical committees in order to ensure maximum efficacy. They will also be responsible for hiring and managing judges; and scoreboards during the course of the hackathon.

## Partnership

- For the evaluations committee alone, the team will work closely with the 180 Degrees Consulting Club VIT Chennai, a consulting firm, in order to evaluate ideas and PPTs during the ideathon phase.
- The evaluations committee will be accompanied by the technical support committee in order to ensure maximum efficacy.

## **Core Responsibilities**

### **2. Evaluation Framework Design**

- Define judging rubrics based on innovation, impact, feasibility, UI/UX, scalability, etc.
- Develop weighted scoring sheets for ideation, prototype, final demo rounds.
- Coordinate with judges in advance to ensure expectations and scoring logic are standardised.
- Set rules for bonus points (presentation, teamwork, pitch quality, technical depth).

### **3. During Event – Evaluations & Judging**

- Manage ideathon screenings, PPT checks, and qualification rounds.
- Conduct judge briefings, assign judges to clusters, and maintain consistency in scoring.
- Maintain live scoreboards and ensure transparency in evaluation.
- Coordinate judging room schedules, team pitching flow, and jury movement.
- Validate scoring sheets, detect discrepancies, and maintain unbiased decision flow.
- Work closely with the Technical Support Committee for demo verifications and problem-specific assistance.

### **4. Partnerships & Special Collaboration**

- For the **evaluations sub-team**, direct collaboration will occur with **180 Degrees Consulting Club, VIT Chennai** for ideathon and PPT screening support.
- Technical Support Committee will assist during development phases to ensure evaluation fairness and technical correctness.

### **5. Post-Event**

- Finalise results, rankings, and maintain score sheet records.
- Assist in publication of winners, project summaries, and prize distribution coordination.
- Submit evaluation insight reports to Planning Committee for future optimisation.

---

## **Authority**

- Can approve/refine/modify problem statements before publishing final set.
- Can organise evaluation panels, jury assignments, and scoring protocols.
- Can collaborate with external bodies for screening and evaluation.

## **Limitations**

- Final PS list must align with Sponsorship + Technical Committee inputs and Planning Committee approval.
- Cannot make budgeting or prize decisions.

#### Non-technical Committees

#### Security and Coordination Committee

## Mandate:

The Security & Coordination Committee oversees on-ground discipline, safety, controlled movement, and structured execution during the hackathon. Active primarily during the event days, the committee monitors the venue, manages participant flow, escorts judges and guests, regulates access, handles OD slips, and ensures smooth logistics such as food delivery and transport of materials. Their role ensures a safe, orderly, and disruption-free hackathon environment.

## Members:

1. Sanjai
Integrated M.Tech (Fresher)
25MIS1004 **LEAD of Committee**

## **Responsibilities**

### **1. Pre-Event Preparations**

- Coordinate with Management & Operations to understand venue layout and checkpoints.
- Identify access points, restricted zones, registration areas, food counters, stage zones, etc.
- Prepare crowd-flow plans for entry, exit, sessions, and breaks.
- Train volunteers on discipline, crowd handling, emergency response, and signals.
- Plan judge/guest escorting routes and vehicle drop points.

### **2. During the Hackathon**

- Maintain security presence across the venue to ensure order and smooth movement.
- Perform **crowd control** during registration, opening ceremony, sessions, food service, and judging rounds.
- Verify access permissions such as OD slips and identity when needed. They will work closely with the Registrations Committee to offer ODs to the students; including OD for the hostels and classes.
- Escort judges, guests, mentors, and speakers to designated rooms on time.
- Monitor corridors, labs, lounges, and participant areas to avoid congestion.
- Coordinate **food logistics**, ensuring materials are moved safely from trucks to service zones.
- Handle lost-and-found issues, minor conflicts, and escalations immediately.
- Liaise with Management, and technical committees live.

### **3. Post-Event Responsibilities**

- Ensure structured dispersal of participants and clearance of venue.
- Assist logistics with packing, movement and secure handling of equipment.
- Submit a report on incidents, challenges, response efficiency, and improvements.

## **Authority**

- Allowed to restrict entry to controlled areas for safety and protocol.
- Can redirect movement, clear zones, or pause flow in case of overload.
- May request volunteer or logistic reinforcements when required.

## **Limitations**

- Cannot change event flow or policies without approval from Management/Planning.
- Must escalate serious issues (medical, security, conflict) immediately to higher authority.

#### Registrations and Marketing Committee

The committee performs 2 roles, as the name suggests - Handling Registrations and Marketing the Hackathon.

## `Registrations` **Committee** **– Mandate & Planning**

### **Prelude:**

The Registrations Committee is responsible for managing all participant-related onboarding processes to ensure a smooth, transparent, and efficient registration experience before and during the Hackathon.

### **1. Pre-Event Responsibilities**

#### **1.1 Registration Planning**

- Define registration workflow (online/offline).
- Decide participant categories (students, professionals, teams, mentors, etc.).
- Coordinate with the core team to finalize eligibility criteria, deadlines, and required participant information.

#### **1.2 Platform & Form Setup**

- Create and maintain registration forms (Google Forms/portal).
- Ensure fields are clear, concise, and collect all required data.
- Test the form for accessibility, device compatibility, and data accuracy.

#### **1.3 Promotion & Communication Support**

- Provide registration links and instructions for marketing/publicity teams.
- Respond to participant queries regarding registration (email, social media, helpdesk).

#### **1.4 Data Management**

- Maintain a secure database of registrants.
- Categorize registrations (confirmed, waitlisted, incomplete).
- Monitor registration numbers and provide regular updates to the organizing team.

---

### **2. During the Event**

#### **2.1 Check-in**

- Set up and manage onsite registration desks.
- Verify participant details and identity (if required).
- Issue ID cards, kits, and verify team formation.

#### **2.2 Helpdesk Management**

- Address participant issues regarding registration, access, or profile updates.
- Coordinate with SAC for seating and team allocations.

#### **2.3 Coordination With Other Committees**

- Inform logistics of final participant count.
- Provide judges/mentors with lists of participants and teams.
- Update event coordination teams about dropouts or last-minute registrations.

---

### **3. Post-Event Responsibilities**

#### **3.1 Data Closure**

- Finalize the complete participant list and attendance records.
- Ensure secure storage or deletion of participant data as per policy.

#### **3.2 Reporting**

- Prepare a report covering total registrations, attendance, demographics, and insights.
- Suggest improvements for future editions based on participant feedback.

---

**Marketing Committee - Mandate & Planning**

**Prelude:**

The **Marketing Committee** is responsible for three core functions: **marketing the hackathon**, **designing all event-related creatives**, and **managing social media outreach**. The team leads the **overall marketing strategy** to ensure strong visibility within and beyond the campus. It handles the **design of posters, banners, digital assets, and promotional materials** that reflect the event’s theme and branding. Additionally, the committee oversees **social media activities**, including announcements, promotional campaigns, engagement posts, and **real-time updates**. Through effective marketing, thoughtful design, and active social media management, the committee helps **attract participants** and **build excitement** throughout the event.

### **1. Pre-Event Responsibilities**

#### **1.1 Planning & Strategy**

- Create a complete marketing roadmap with clear promotion phases.
- Define target audiences (students, developers, innovators, partners).
- Select effective online/offline channels for outreach.
- Align all messaging with the hackathon’s vision in collaboration with the Core Committee.

#### **1.2 Marketing & Outreach Execution**

- Conduct campus and off-campus awareness drives through posters, clubs, and word-of-mouth.
- Coordinate with departments, clubs, and external communities for reach.
- Prepare promotional content for emails, announcements, and partner communication.

#### **1.3 Creative Design & Branding**

- Design all event visuals (posters, banners, standees, brochures, merchandise, etc.).
- Propose design themes and finalize the branding style guide.
- Maintain consistent visual identity across all materials.
- Support other committees with customized designs for sessions and documents.

#### **1.4 Social Media Preparation**

- Plan a content calendar for announcements, reveals, deadlines, and engagement posts.
- Prepare captions, hashtags, and posting schedules.
- Set guidelines for tone and formatting of online communication.
- Respond to early participant queries regarding registration and event details.

---

### **2. During the Event**

#### **2.1 Live Marketing & Communication**

- Share periodic updates to maintain buzz.
- Prepare quick video clips and photos for immediate posting.
- Highlight inaugurations, sessions, coding rounds, and judging moments.

#### **2.2 Creative Design Support**

- Create urgent posters or updates as needed.
- Ensure all on-site branding follows the event theme.
- Coordinate with Event Coordination to maintain venue aesthetics.

#### **2.3 Social Media Live Coverage**

- Post real-time stories, reels, and interviews.
- Manage engagement with polls, quizzes, and interactive content.
- Work with photographers/videographers for quick visual delivery.
- Track engagement and adjust posting strategy.

---

### **3. Post-Event Responsibilities**

#### **3.1 Post-Event Promotions**

- Share closing announcements and winner highlights.
- Publish a recap via carousel, montage, or aftermovie.
- Feature standout teams, projects, and event moments.

#### **3.2 Documentation & Reporting**

- Compile a report covering engagement, growth, reach, campaign performance, and feedback.
- Identify strengths, areas for improvement, and future strategies.
- Archive all final creatives and assets for the next team.

#### **3.3 Handover & Review**

- Hold a review meeting with the Core Committee.
- Provide suggestions for improving branding and online presence.
- Organize all files for smooth handover.

---

## Members

1. Jaidev K
2. Suprajha V M
3. Sanjana B
4. Sai Siddarth

## Externals Details

#### Speakers

## Prospective

1. Vivian Gomes
2. Abdul Kareem
3. [Founder](https://indehub.org/) of IndeHub : adithya balaji [ab@indiehub.org](https://indehub.org/)

[IndeHub - Community for Indie Developers](https://indehub.org/)

#### Judges

## Prospective

1. [https://www.linkedin.com/in/kate-sai-kishore-10123b118](https://www.linkedin.com/in/kate-sai-kishore-10123b118)

   **Kate Sai Kishore sir (Cybersecurity Domain)**

[in.linkedin.com](https://in.linkedin.com/in/sasikumar-mohan-461b5655)

### `#Poster`:

![Vortex V3 - Collab with SHnorh.png](https://resv2.craft.do/user/full/b8b89018-aef2-86a2-127d-5e07bf8933bc/doc/71f90131-208e-fe7e-705a-f375675cf2b3/c66d387c-fd53-479e-a43c-261e5652c167)

> ## Prize Pool and Finalist Offers

> We plan on offering a prize pool of ~Rs. 30000. The split-up of the prize pool will be revealed later.

> The winners of the Shark Tank will be offered internship and opportunities to incubate their companies.

> The other teams will also  be offered research paper opportunities, product development, patent opportunities and incubation opportunities!

**END OF DOCUMENT**

|   |   |   |   |
| - | - | - | - |

3. 1 EDUTECH COMMUNITY

