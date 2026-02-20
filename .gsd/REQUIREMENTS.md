# REQUIREMENTS.md

## Format

| ID             | Requirement                                                             | Source           | Status  |
| -------------- | ----------------------------------------------------------------------- | ---------------- | ------- |
| **FR-AUTH-01** | Host can login via Email/Password.                                      | SPEC Goal 5      | Pending |
| **FR-AUTH-02** | Host can login via Google OAuth.                                        | SPEC Goal 5      | Pending |
| **FR-DASH-01** | Host sees stats for upcoming, active, and revealed events.              | SPEC Goal 5      | Pending |
| **FR-EVNT-01** | Host can create an event with a name, description, and reveal time.     | SPEC Goal 2      | Pending |
| **FR-EVNT-02** | Host can set photo and participant limits.                              | SPEC Goal 5      | Pending |
| **FR-EVNT-03** | Use promocode to increase photo cap from 100 to 1000.                   | SPEC Goal 5      | Pending |
| **FR-EVNT-04** | Generate unique event code and QR code upon creation.                   | SPEC Goal 1      | Pending |
| **FR-JOIN-01** | User joins by scanning QR or entering code + name.                      | SPEC Goal 1      | Pending |
| **FR-CAM-01**  | Built-in browser camera with vintage filters (Sepia, B&W, Grain, etc.). | SPEC Goal 3      | Pending |
| **FR-CAM-02**  | Support gallery upload (max 20MB).                                      | SPEC Goal 1      | Pending |
| **FR-STOR-01** | Upload photos to Telegram Bot, store `file_id` in Supabase.             | SPEC Goal 4      | Pending |
| **FR-REVL-01** | Timer-based restricted access ("Developing..." screen).                 | SPEC Goal 2      | Pending |
| **FR-REVL-02** | Grid gallery sorted by timestamp after reveal time.                     | SPEC Goal 2      | Pending |
| **FR-REVL-03** | Host can bypass reveal time to view photos anytime.                     | SPEC Goal 5      | Pending |
| **FR-CTRL-01** | Host can download all photos as a ZIP.                                  | SPEC Goal 5      | Pending |
| **FR-CTRL-02** | Host can modify reveal time or kick participants.                       | SPEC Goal 5      | Pending |
| **FR-ANLT-01** | Show post-reveal stats (most photos, peak time).                        | SPEC Goal 5      | Pending |
| **NFR-SEC-01** | Protect host-only routes and enforce server-side limits.                | SPEC Constraints | Pending |
| **NFR-UI-01**  | Clean, minimal, mobile-first responsive design (Shadcn UI).             | SPEC Goal 3      | Pending |
