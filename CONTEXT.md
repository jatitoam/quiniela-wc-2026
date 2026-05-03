# Quiniela WC 2026

A company-internal World Cup 2026 prediction pool. Participants pay an entry fee, submit match predictions before each stage begins, and earn points based on accuracy. An admin manages fixtures, confirms registrations, and enters match scores.

## Language

### People

**User**:
A system account. Can hold the Participant role, the Admin role, or both simultaneously.
_Avoid_: Member, account, person

**Participant**:
A User whose registration has been confirmed by an Admin. Only Participants earn points. Identified publicly by their Alias; real name is only shown on the Participant detail view.
_Avoid_: Player, competitor, entrant

**Alias**:
A Participant's chosen public display name. Unique across all Participants. May contain spaces and special characters. Used everywhere in the UI except the Participant detail view.
_Avoid_: Username, handle, nickname

**Admin**:
A User role that can confirm Registrations, populate Fixtures, and enter Scores. Does not imply the User is also a Participant.
_Avoid_: Organizer, manager, moderator

### Registration

**Registration**:
The act of signing up with a name, alias, and personal email, plus payment of the entry fee. A Registration is either _unconfirmed_ or _confirmed_; only confirmed Registrations grant Participant status.
_Avoid_: Enrollment, membership, sign-up

**Entry Fee**:
The fixed payment amount (currently Q200) required to confirm a Registration. Set by the organizers; may change between editions.
_Avoid_: Buy-in, fee, cost

### Tournament structure

**Stage**:
A named phase of the tournament. Each Stage contains a fixed set of Matches. Stages are: Group Stage, Round of 32, Round of 16, Quarter-Finals, Semi-Finals, Third-Place Play-off, Final.
_Avoid_: Phase, round, bracket

**Group Stage**:
The opening Stage comprising 72 matches across 12 groups. The only Stage where teams can draw without going to extra time.
_Avoid_: Groups phase, pool stage

**Knockout Stage**:
Any Stage after the Group Stage. Every Match in a Knockout Stage must produce a winner via 90 minutes, extra time, or a penalty shootout.
_Avoid_: Elimination stage, playoff stage

**Match**:
A single scheduled game between two teams, belonging to exactly one Stage. Has a scheduled start time, an optional Score, and a set of Predictions.
_Avoid_: Fixture, game, bout

**Score**:
The actual final result of a Match entered by an Admin, consisting of the goals scored by each team and (for Knockout Matches) whether extra time and/or a penalty shootout occurred and the shootout winner. A Score can be corrected by an Admin within 30 minutes of entry; after that it is immutable. Points are recalculated automatically on correction.
_Avoid_: Result, outcome, final

### Predictions & points

**Prediction**:
A Participant's forecast for a single Match. For Group Stage Matches: predicted goals for each team. For Knockout Stage Matches: predicted goals, whether extra time occurs, and (if the predicted score is a tie after extra time) the predicted penalty shootout winner.
_Avoid_: Pick, guess, entry, bet

**Prediction Window**:
The period during which a Participant may create, edit, or delete Predictions for any Match in a Stage. Opens when the Stage's Matches are populated. Closes at the scheduled start time of the Stage's first Match — never at the time an Admin enters a Score. Once closed, no Prediction in that Stage can be created or modified. Points are earned per Match: a missing Prediction earns 0 for that Match only; there is no Stage-level penalty for incomplete submissions.
_Avoid_: Submission window, deadline, cutoff, lock

**Points**:
The numerical score a Participant earns for a Prediction once the Match has a Score. Calculated automatically; cannot be edited by an Admin.
_Avoid_: Score (reserved for match results), tally

**Leaderboard**:
A ranked list of Participants ordered by total Points, descending. Ties share a rank; no tiebreaker is applied. Publicly accessible without login, showing Aliases only. Real names appear only on the Participant detail view, and only for logged-in Users.
_Avoid_: Rankings, standings, table

## Scoring rules

### Group Stage (per Match)
| Condition | Points |
|---|---|
| Predicted result (win A / draw / win B) correct | 2 |
| Predicted exact score also correct | +1 |

### Knockout Stage (per Match)
| Condition | Points |
|---|---|
| Non-tie prediction: predicted team is overall winner | 2 |
| Tie prediction: match goes to shootout AND predicted shootout winner wins | 2 |
| Predicted exact final score correct (after ET if applicable) | +1 |
| Predicted whether extra time occurred (yes/no) correctly | +1 |
| Tie prediction only: shootout occurred AND predicted winner wins | +1 |

Maximum per Match: 3 pts (Group Stage) · 4 pts (Knockout, non-tie prediction) · 5 pts (Knockout, tie prediction).

## Relationships

- A **User** holds one or more roles: **Participant**, **Admin**, or both
- A **Registration** belongs to exactly one **User**; a **User** becomes a **Participant** once their **Registration** is confirmed
- A **Stage** contains one or more **Matches**
- A **Match** belongs to exactly one **Stage**
- A **Prediction** belongs to one **Participant** and one **Match**
- A **Prediction Window** belongs to exactly one **Stage**
- A **Score** belongs to exactly one **Match**; its entry triggers **Points** calculation for all **Predictions** on that **Match**

## Example dialogue

> **Dev:** "If a User pays late — after the Group Stage window closed — can they still earn points?"
> **Domain expert:** "Yes. Confirmation grants Participant status. They missed the Group Stage Prediction Window, so they earn 0 there, but they can still submit for every Knockout Stage whose window is still open."

> **Dev:** "What happens if a Participant submits 71 of 72 Group Stage Predictions before the window closes?"
> **Domain expert:** "They earn points for the 71 they submitted. The 1 missing Match earns 0 — no Stage-level penalty."

## Flagged ambiguities

- "score" was used for both match results and participant totals — resolved: **Score** means the match result entered by an Admin; **Points** means the Participant's accumulated total.
- "result" in knockout context was ambiguous (90-min outcome vs overall winner) — resolved: for the 2-point result check, a non-tie Prediction earns the 2 pts if the predicted team wins the match overall (regardless of ET); a tie Prediction earns the 2 pts only if the match goes to a shootout and the predicted winner wins.
- "all-or-nothing" was used early in design but was misleading — resolved: the Stage locks entirely when its first Match starts; within the window, all Predictions are freely editable; a missing Prediction earns 0 for that Match only, not the whole Stage.
