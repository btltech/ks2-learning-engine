# DemiWura compliance and safeguarding runbook

Last reviewed: 10 August 2026

This is an operational checklist, not legal advice. Public pages must describe what the product actually does. Do not mark an item complete without evidence.

## Product and controller record

- Service: DemiWura, `demiwuraks2.co.uk`
- Intended learners: UK KS2, mainly ages 7–11
- Operator/controller for family accounts: BTLTECH LTD
- Company number: 13311691
- Registered office: 161 The Vale, London, England, W3 7RD
- Companies House status checked on 10 August 2026: Active
- Privacy contact: `privacy@demiwuraks2.co.uk`
- Safeguarding contact: `safeguarding@demiwuraks2.co.uk`
- General support: `support@demiwuraks2.co.uk`

## Data-flow register

| System | Purpose | Data involved | Important control |
| --- | --- | --- | --- |
| Firebase Authentication | Adult and child sessions | Adult email, UID, authentication tokens | Firebase handles adult passwords; child sessions use custom tokens |
| Firestore | Profiles, progress, classes, content, contact messages | Account/profile and learning data | Role checks and security rules; verify database location and backup retention |
| Firebase Realtime Database | Live classroom/battle state | Session code, limited participant identity and answers | Database is configured for `europe-west1`; expire sessions and restrict membership |
| Google Gemini API | AI lessons, MiRa, hints and reports | User text, age, subject/topic and limited learning summaries | Never include child name; do not log prompts; apply safety and output validation |
| Cloudflare Pages/Functions | Hosting and API processing | Requests, IP, authentication status | Origin validation, rate limits and no public secrets |
| Cloudflare Turnstile | Abuse prevention | Token and IP passed for verification | Use only on risk-sensitive forms and sign-in flows |
| Cloudflare KV | Short rate limits | Short-lived UID/IP-derived rate-limit key | Application TTL is normally no more than two minutes |
| Cloudflare R2 | Reviewed audio | Public learning audio and manifest | Do not store learner recordings in the public audio bucket |
| Resend | Contact notifications and consented reports | Adult email and message/report content | Weekly reports require `weeklyReportOptIn === true` |
| Sentry, if enabled | Error diagnosis | Privacy-minimised technical error | No session replay, no account ID, no request body, cookies or auth headers |
| Browser storage | Session, preferences, progress and offline features | Profile cache and local learning state | Clear profile on sign-out; service worker must not cache private Firestore responses |

## Children's DPIA working record

The accountable owner must approve the final DPIA before a broad student launch.

| Risk | Current control | Residual action / owner |
| --- | --- | --- |
| Child enters personal information into MiRa | Just-in-time warning; names removed from prompts; bounded server request | Test prompts and safety response quarterly — product owner |
| AI gives inaccurate or harmful content | Provider safety settings, validation, reporting route, adult guidance | Sample generated content and log corrective action — content lead |
| Unauthorised child-profile access | Parent code + PIN, hashing, rate limits, Turnstile and authenticated custom token | Review session and code-expiry design — security owner |
| Shared class/battle exposes identity | No public chat/profile; bounded group; aliasing where available | Confirm display-name policy in every live mode — safeguarding owner |
| Shared browser exposes earlier user's data | Profile cleared on sign-out; private Firestore service-worker caching removed | Test sign-out on a shared browser each release — QA owner |
| Excessive learning profiling | Limited educational personalisation; no advertising or significant decisions | Approve legitimate-interest/best-interests assessment — data owner |
| Contact form collects child data | Child warning, adult-only user types and minimisation notice | Review messages and remove unnecessary child data — support owner |
| Retention exceeds stated need | Contact records include `expiresAt`; deletion request route exists | Enable Firestore TTL and document provider backup cycles — data owner |
| Unauthorised weekly emails | Explicit opt-in check and self/admin-only test trigger | Add an adult preference UI before enabling the schedule — product owner |
| Inaccessible activity excludes a learner | Core keyboard/semantic fixes and accessible alternatives commitment | Complete manual WCAG 2.2 AA and assistive-technology test — accessibility owner |

## Rights-request workflow

1. Record the request date, requester, requested right and affected account without copying unnecessary child data.
2. Verify identity proportionately. Do not ask for more information than needed.
3. Check Firebase Authentication, Firestore profile and subcollections, Realtime Database sessions, contact submissions, class records and relevant provider records.
4. Protect another person's data when responding to access or portability requests.
5. Respond within one month unless a lawful extension applies; explain any extension before the initial period ends.
6. Record what was provided, corrected, restricted or deleted and the lawful reason for anything retained.
7. Parents may delete an individual child profile in Parent Monitoring. Adult closure remains a verified support/privacy request until self-service deletion is implemented.

## Safeguarding response workflow

1. If a child may be in immediate danger, advise the reporter to call 999 and escalate without waiting for an email response.
2. Record the minimum facts, time, route, session/content identifier and reporter contact where appropriate.
3. Restrict the affected content, code, class, battle or account when that safely reduces risk.
4. Preserve relevant records without broad exports or informal sharing.
5. Escalate to the school's safeguarding lead, police, local authority, CEOP or another appropriate body where required.
6. Document the decision, legal basis, information shared and follow-up control.
7. Do not promise a fixed response time unless staffed operational cover exists.

## Required operational sign-offs before broad student launch

- [ ] Complete the ICO data-protection fee self-assessment; record the registration number or documented exemption.
- [ ] Confirm that `support@`, `privacy@`, `safeguarding@` and `legal@demiwuraks2.co.uk` all deliver to monitored mailboxes.
- [ ] Verify the configured Firebase/Firestore data location and record it; do not infer it from the Realtime Database URL.
- [ ] Review and retain current data-processing terms for Google/Firebase/Gemini, Cloudflare, Resend and Sentry if enabled.
- [ ] Record the international-transfer mechanism used by each relevant provider.
- [ ] Approve the children's DPIA and legitimate-interest/best-interests assessment.
- [ ] Complete an Online Safety Act scope and children's risk assessment for classroom, battle and leaderboard features.
- [ ] Assign a named accountable safeguarding owner and deputy internally.
- [ ] Enable Firestore TTL on `contactSubmissions.expiresAt`; verify deletion with a test record.
- [ ] Leave the scheduled weekly-report function disabled until an adult opt-in/out interface and suppression process are live.
- [ ] Complete keyboard, 200% zoom, contrast, VoiceOver and NVDA checks across public pages, login, lessons, quizzes, dashboards, class and battle modes.
- [ ] Perform a live-page check after deployment, including the child privacy route, storage notice, all policy links and mobile layouts.

## Change control

Repeat the DPIA and public-policy comparison before adding advertising, general analytics, session replay, child uploads, voice recording, direct messaging, public profiles, new AI providers, new school integrations or new international data locations.

Useful official guidance:

- ICO Children's Code: <https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/>
- ICO right to be informed: <https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/>
- ICO storage and access technologies: <https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/>
- Ofcom protection of children duties: <https://www.ofcom.org.uk/online-safety/protecting-children/protection-of-children-duties-under-the-online-safety-act>
