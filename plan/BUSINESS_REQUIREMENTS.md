# V-VORTEX PLATFORM - BUSINESS REQUIREMENTS

## Executive Summary

**V-Vortex** is a hackathon management platform that handles the entire lifecycle of a hackathon event - from team registration to final results. It serves three primary user groups:

1. **Organizers/Admins** - People running the hackathon
2. **Participants** - Teams competing in the hackathon
3. **Judges** - People evaluating and scoring projects

---

## Platform Overview

### What Problem Does It Solve?

Running a hackathon involves managing hundreds of participants, dozens of teams, multiple submission rounds, and coordinated judging. V-Vortex automates and streamlines this process.

### Core Value Propositions

| For Organizers | For Participants | For Judges |
|----------------|------------------|------------|
| Centralized team management | Easy online registration | Clear evaluation criteria |
| Automated scoring aggregation | Real-time leaderboard | View assigned teams only |
| Controlled phase transitions | Track submission status | Submit scores online |
| Payment verification tracking | Get instant feedback | Mobile-friendly interface |
| Export data for reporting | Access resources anytime | Briefing materials in-app |

---

## User Roles & Permissions

### 1. Team Leader (Primary Participant)

**Can do:**
- Register team (2-4 members)
- Upload payment receipt
- Invite team members via email
- Select a Problem Statement
- Submit projects for each round
- View team's scores and leaderboard position

**Cannot do:**
- Change selected Problem Statement (once locked)
- Submit after deadlines
- View other teams' submissions

### 2. Team Member

**Can do:**
- View team dashboard
- View Problem Statement details
- View team's scores and submissions
- View leaderboard

**Cannot do:**
- Submit anything
- Change team details
- Select Problem Statement
- Add/remove team members

### 3. Judge

**Can do:**
- View assigned teams only
- Access team submissions
- Score teams based on rubrics
- Save draft scores
- Lock and submit final scores
- View judge briefing materials

**Cannot do:**
- View unassigned teams
- Modify locked scores
- See other judges' scores (until published)

### 4. Admin/Organizer

**Can do:**
- Full access to all features
- Approve/reject registrations
- Verify payments
- Create/manage Problem Statements
- Assign judges to teams
- Control event phases
- Send announcements
- Export all data
- Override deadlines (emergency)

---

## Event Phases

The hackathon progresses through these phases. **Admin controls when each phase starts/stops.**

### 1. Registration Phase

**Purpose**: Teams sign up to participate

**What happens:**
- Team leaders register their team (2-4 members)
- Upload payment receipt
- Admin reviews and approves/reject registrations
- Teams can add members via team code

**Deadlines:**
- Registration close date/time

**Controls:**
- Admin can manually close registration early
- Late registrations rejected after deadline

---

### 2. Ideathon Phase

**Purpose**: Teams select a Problem Statement and submit their initial idea

**What happens:**
- Problem Statements become visible
- Teams select PS on **first-come-first-serve** basis
- Each PS has a team limit (e.g., max 10 teams)
- Teams submit their Ideation Pitch (PPT/PDF or Drive link)
- Judges evaluate Ideathon submissions

**Deadlines:**
- PS selection deadline
- Ideathon submission deadline

**Key Feature - PS Selection:**
```
Example Problem Statement:
"AI-Powered Healthcare Diagnostics"
- Domain: AI/ML
- Max Teams: 10
- Slots Remaining: 3 (live counter)

When Team Leader clicks "Select":
→ If slots available: PS assigned immediately
→ If full: "No longer available" message
→ Once selected: Cannot change (locked)
```

---

### 3. Hackathon Phase

**Purpose**: Teams build their solutions and submit progress updates

**Three Review Rounds:**

#### Review 1 (30% Weight)
- **Submit**: GitHub repository link
- **Purpose**: Initial implementation check

#### Review 2 (50% Weight)
- **Submit**: Updated GitHub link, Deployed app link, PPT
- **Purpose**: Progress evaluation

#### Review 3 (Final - 100% Weight)
- **Submit**: Final GitHub link, Deployed app, PPT, ZIP (documentation)
- **Code Freeze**: No commits allowed after deadline
- **Purpose**: Final evaluation

**What happens:**
- Teams submit work for each review
- Judges evaluate assigned teams
- Scores aggregated after each round

---

### 4. Finals Phase

**Purpose**: Top teams present to judges, winners decided

**Two Optional Features:**

#### Shark Tank (Optional)
- Top N teams become finalists
- Each judge gets virtual credits (e.g., 1000)
- Judges "invest" credits in teams
- Team with most investment wins

#### Bug Bounty (Optional)
- Teams randomly assigned other teams' projects to test
- Find bugs, submit PoC (Proof of Concept)
- Judged on: Bugs found, severity, PoC quality

---

### 5. Archive Phase

**Purpose**: Event is over, data preserved

**What happens:**
- Leaderboard becomes read-only
- All data exportable
- No more submissions allowed

---

## Feature Breakdown

### A. Registration & Team Management

| Feature | Description | Decision Needed |
|---------|-------------|-----------------|
| Team size limit | Min 2, Max 4 members | Confirm limits? |
| VIT Chennai priority | Separate registration flow | Keep or remove? |
| Payment verification | Admin manually verifies receipts | Auto-verify needed? |
| Team member invitations | Email + OTP to join | Accept deadline? |
| Team approval workflow | Admin approves/rejects | Auto-approve? |

### B. Problem Statement Management

| Feature | Description | Decision Needed |
|---------|-------------|-----------------|
| FCFS allocation | First-come-first-serve selection | Confirm approach? |
| Team limit per PS | e.g., max 10 teams per PS | What limits? |
| PS categories/domains | AI/ML, IoT, Fintech, etc. | What domains? |
| Mentor assignment | Each PS can have mentor | Include mentors? |

### C. Submission System

| Feature | Description | Decision Needed |
|---------|-------------|-----------------|
| File uploads | PPT/PDF/ZIP upload to platform | Size limit? |
| Drive links | Accept Google Drive links | Validate format? |
| GitHub integration | Auto-fetch repo data | Needed? |
| Code freeze | No commits after Review 3 deadline | Enforce how? |

### D. Judging System

| Feature | Description | Decision Needed |
|---------|-------------|-----------------|
| Judge assignment | Admin assigns judges to teams | Auto-assign option? |
| Scoring rubrics | Configurable per round | What rubrics? |
| Draft scores | Judges can save before final submit | Needed? |
| Score visibility | Judges see own scores only | Peer scoring needed? |
| Multi-judge averaging | Average of all judge scores | Weighted averaging? |

### E. Results & Leaderboard

| Feature | Description | Decision Needed |
|---------|-------------|-----------------|
| Live leaderboard | Real-time rankings | Always visible or phase-gated? |
| Tie-break rules | How to handle equal scores | What tie-breaker? |
| Result publication | Admin controls when scores visible | Show immediately or batch release? |
| Certificates | Auto-generate participation certs | Needed? |

### F. Communications

| Feature | Description | Decision Needed |
|---------|-------------|-----------------|
| Email notifications | Send emails for key actions | What email provider? |
| SMS notifications | Send SMS for urgent updates | Needed? |
| In-app notifications | Real-time notifications panel | Needed? |
| Announcement board | Admin broadcasts messages to all | Needed? |

---

## Questions & Decisions for Organizers

### 1. Registration & Participation

**Question**: Who can participate?
- [ ] VIT Chennai students only
- [ ] Open to all colleges
- [ ] Corporate participants
- [ ] Mixed (different categories)

**Question**: Is payment required?
- [ ] Yes - fee for participation
- [ ] No - free event
- [ ] Waived for VIT students

**Question**: What is the team size policy?
- [ ] Fixed: Exactly 4 members
- [ ] Flexible: 2-4 members
- [ ] Minimum: 3 members
- [ ] Other: __________

---

### 2. Problem Statements

**Question**: How are Problem Statements allocated?
- [ ] FCFS (First-Come-First-Serve) - teams choose
- [ ] Random assignment
- [ ] Admin assigns
- [ ] Mix: Teams choose preference, admin assigns

**Question**: How many teams per PS?
- [ ] Unlimited
- [ ] Limited (e.g., max 5, 10, 15)
- [ ] Depends on PS complexity

**Question**: Can teams change their PS?
- [ ] Never (once selected, locked)
- [ ] Within X hours of selection
- [ ] Until Ideathon phase starts
- [ ] With admin approval

---

### 3. Submission Format

**Question**: What do teams submit?

**Ideathon:**
- [ ] PPT/PDF upload only
- [ ] Google Drive link
- [ ] Both options

**Hackathon Reviews:**
- [ ] GitHub repo link (required)
- [ ] Deployed/live demo URL (required for final)
- [ ] Presentation PPT
- [ ] Documentation ZIP
- [ ] Video demo

**Question**: What are the file size limits?
- [ ] 10MB
- [ ] 25MB
- [ ] 50MB
- [ ] 100MB

---

### 4. Judging Process

**Question**: How are judges assigned to teams?
- [ ] Admin manually assigns each judge
- [ ] Automatic: Each team gets N judges
- [ ] Domain-based: AI judges grade AI PS only
- [ ] Random assignment

**Question**: What scoring rubrics to use?

**Ideathon (50 points):**
- [ ] Innovation (15), Implementation (15), Presentation (10), Impact (10)
- [ ] Custom: __________

**Review 1 (50 points):**
- [ ] Progress (20), Code Quality (15), Documentation (15)
- [ ] Custom: __________

**Review 2 (50 points):**
- [ ] Functionality (20), UX (15), Scalability (15)
- [ ] Custom: __________

**Review 3 (100 points):**
- [ ] Technical (30), Design (30), Business (20), Demo (20)
- [ ] Custom: __________

**Question**: How are final scores calculated?
- [ ] Average of all judge scores
- [ ] Drop min/max, then average
- [ ] Weighted by judge expertise
- [ ] Other: __________

---

### 5. Finals Features

**Question**: Include Shark Tank?
- [ ] Yes - Finalists pitch for investments
- [ ] No - Not needed

**If yes:** How many finalists? (e.g., Top 10)

**Question**: Include Bug Bounty?
- [ ] Yes - Teams test each other's projects
- [ ] No - Not needed

**If yes:** How are targets assigned?
- [ ] Random
- [ ] Admin assigns
- [ ] Teams choose

---

### 6. Leaderboard & Results

**Question**: When is the leaderboard visible?
- [ ] Always live (after each round)
- [ ] After Ideathon only
- [ ] After all reviews complete
- [ ] After finals only

**Question**: Tie-break rules?
- [ ] Higher Innovation score wins
- [ ] Higher Implementation score wins
- [ ] Earlier submission wins
- [ ] Coin toss
- [ ] Other: __________

---

### 7. Communications

**Question**: What notifications to send?

**Emails:**
- [ ] Registration confirmation
- [ ] Team invitation
- [ ] Payment status
- [ ] Submission confirmation
- [ ] Deadline reminders (24h, 1h before)
- [ ] Results announcement
- [ ] Certificate of participation

**Question:** Email provider?
- [ ] Supabase Auth emails (default)
- [ ] SendGrid
- [ ] AWS SES
- [ ] Resend
- [ ] Other: __________

---

## Admin Controls

### Phase Transitions

**Admin can:**
- Move to next phase (e.g., Registration → Ideathon)
- Return to previous phase (if needed)
- Extend deadlines (emergency override)
- All extensions logged with reason

### Data Management

**Admin can:**
- Export all data (CSV, JSON, XLSX)
- Export by entity (teams, submissions, scores)
- View audit log of all actions
- Soft-delete teams (removes from leaderboard, keeps data)

### Override Options

**Admin can override:**
- Problem Statement selection (unlock/change PS)
- Submission deadlines (extend for specific teams)
- Judge assignments
- Scores (after review, with audit trail)
- Payment status

---

## Technical Constraints & Considerations

### Platform Limits

| Constraint | Limit | Notes |
|------------|-------|-------|
| Max teams | Unlimited (practically ~500) | Database can handle more |
| File upload size | 50MB per file | Configurable |
| Concurrent users | ~100 simultaneous | Supabase limits |
| Judges | ~50 | No hard limit |
| Problem Statements | ~50 | No hard limit |

### What the Platform Does NOT Do

❌ **Out of Scope (as planned):**
- Random PS assignment (use FCFS instead)
- Payment gateway integration (manual verification)
- Mentor accounts (judges can view PS instead)
- Certificate generation (can add later)
- Team chat/messaging system
- Cross-event shared databases
- Social login (Google, GitHub, etc.)
- Multiple concurrent events (single event only)

---

## Timeline Example

### Typical Hackathon Schedule

```
Week 1-2: Registration Phase
  Day 1-14: Team registration open
  Day 10:  Registration deadline reminder
  Day 14: Registration closes

Week 3: Ideathon Phase
  Day 15: PS selection opens
  Day 17: PS selection deadline
  Day 17: Ideathon submissions open
  Day 19: Ideathon submissions close
  Day 20-21: Judge scoring
  Day 22: Ideathon results published

Week 4-6: Hackathon Phase
  Day 23: Review 1 submissions due
  Day 26: Review 2 submissions due
  Day 30: Review 3 submissions due (Code freeze)
  Day 30-35: Final judging

Week 7: Finals
  Day 36: Top 10 finalists announced
  Day 37: Shark Tank & Bug Bounty
  Day 38: Final results & awards
```

**Your schedule may vary. Adjust in event_config.**

---

## Additions You Might Want

### Priority 1 (High Impact)

- [ ] **Waitlist**: When registration full, teams join waitlist
- [ ] **Disqualification**: Admin can disqualify teams with reason
- [ ] **Appeals**: Teams can appeal scores (admin-mediated)
- [ ] **Project Gallery**: Public showcase of all projects

### Priority 2 (Nice to Have)

- [ ] **Mentor Office Hours**: Book time with PS mentors
- [ ] **Team Matching**: Help individuals find teams
- [ ] **Resource Library**: Upload datasets, APIs, docs for participants
- [ ] **Live Announcements**: Show announcements during event

### Priority 3 (Future)

- [ ] **Mobile App**: Native iOS/Android apps
- [ ] **Live Streaming**: Stream opening/closing ceremonies
- [ ] **Sponsor Integration**: Sponsor challenges/prizes
- [ ] **Alumni Network**: Past participants can connect

---

## Removals You Might Want

### Possibly Remove:

- [ ] **Shark Tank** - Is investment-style judging needed?
- [ ] **Bug Bounty** - Do teams test each other?
- [ ] **Open Innovation Track** - Separate track without PS?
- [ ] **QR Code Attendance** - Physical attendance tracking
- [ ] **Member Login** - Do members need separate accounts?

---

## Next Steps

### For the Organizer (You):

1. **Review this document** - Mark what you want/need
2. **Answer the "Decision Needed" questions** - These affect implementation
3. **Propose additions/removals** - Customize to your needs
4. **Prioritize features** - What's MVP vs. nice-to-have?

### For the Development Team:

1. **Incorporate feedback** - Update this document with decisions
2. **Create MVP feature list** - Core features for first version
3. **Estimate timeline** - Based on approved features
4. **Start implementation** - Following phased roadmap

---

## Feedback Form

**Organizer:**

**Please review and mark each section:**

- [ ] Registration & Team Management - Approved / Changes Needed
- [ ] Problem Statement Management - Approved / Changes Needed
- [ ] Submission System - Approved / Changes Needed
- [ ] Judging System - Approved / Changes Needed
- [ ] Results & Leaderboard - Approved / Changes Needed
- [ ] Finals Features - Approved / Changes Needed
- [ ] Communications - Approved / Changes Needed
- [ ] Admin Controls - Approved / Changes Needed

**Additional Notes:**
________________________________________________________________
________________________________________________________________
________________________________________________________________

**Date:** _______________

**Signature:** _______________

---

**Document Version**: 1.0
**Last Updated**: 2025-12-24
