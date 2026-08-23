# IVS News - Next Steps

**Date:** 2026-08-23
**Product:** Daily habit for AI / edge video — free current-awareness for integrators, MSPs, consultants, and technical buyers.
**Repos:** `ivs_news` (pipeline) · `ivs-news-frontend` (site). Same plan lives in both.

**Do not:** sell featured directory listings, claim IPVM-style independent testing, or publicly promote until the weekday brief habit is real.

---

## Done (keep)

- Site live at https://www.ivsnews.com/
- Daily briefs on homepage + `/briefs/YYYY-MM-DD`
- News aggregator + directory (45 providers)
- Hermes / Grok Build research → ingest into `ivs_briefs`
- Subscribe domain, `editor@` / `hello@`, Beehiiv sending live
- Site: positioning, RSS, about, robots/sitemap, recency-filtered news, first-party event tracker (apply SQL)

---

## Phase 1 — Tonight / this week (habit + measurement)

Work is mostly in **this repo**. Pipeline stays weekday briefs.

### 1. Brief is the product
- [x] Homepage stays latest brief; add one-line positioning + links into News and Directory
- [x] RSS feed of published briefs (`/feed.xml`)
- [x] Beehiiv on `subscribe.ivsnews.com`; From/Reply-To `editor@`; `hello@` forwards
- [ ] Wire Beehiiv weekday send of the latest brief (still manual in Beehiiv until automated)
- [ ] Cadence: weekday briefs even if some days are 4 items; missed weeks kill the model

### 2. News feed must not fight the brief
- [x] Show last 60 days only
- [x] Hide public `Rel 9 • Tech 8` scores
- [x] Reject titles starting with `#` (raw LinkedIn hashtag titles)
- [ ] Drop remaining duplicates / SEO-mill keeps in the pipeline
- [x] Remove “Built with Grok” from the public footer

### 3. First-party analytics (not Vercel, not GA)
- [x] Supabase `page_events` table: view, dwell, outbound (migration written; apply in SQL editor)
- [x] Capture: path, referrer, session id, entity id, outbound URL, seconds on page
- [x] Show on `/analytics`: views, sessions, dwell, top paths, top outbound
- [x] Hardcoded analytics password removed; set `ANALYTICS_PASSWORD` in Vercel

### 4. Trust surface
- [x] `/about` — who it is for, how items are selected, ecosystem disclosure
- [x] `robots.txt` + `sitemap.xml` (briefs, news, directory, about)
- [x] Unique titles + basic Open Graph on brief permalinks

### 5. Soft launch (you, not the site)
- [ ] 10–20 practitioners who specify or sell AI video
- [ ] Send the brief; ask: “Would you want this every weekday?”
- [ ] No LinkedIn blast, vendor pitch, or ISC push until opens/clicks exist

---

## Phase 2 — After the email is real (buyer-useful directory)

- [ ] Filters that change a shortlist: NDAA/region, edge vs cloud vs hybrid, buy-category (LPR, weapons, VMS, chip)
- [ ] Add missing majors (Hanwha, Bosch, CVEDIA, …)
- [ ] Flag Hikvision / Dahua / Clearview instead of silent listing
- [ ] “Suggest a provider” form (lead-gen, not paid placement)
- [ ] Refresh “last updated” (currently May 25, 2026)

---

## Phase 3 — Original pieces (only with a list)

- [ ] One deep dive or field-style demo per month, chosen from brief click data
- [ ] Comments / upvotes only when the room is not empty

---

## Explicitly deferred

- Featured / premium directory listings (independence)
- Vercel Analytics / Google Analytics
- HN-style voting
- Product demo dump from vendors
- RB2B / lead-resale

---

## How we know it is working

| Signal | Means |
|---|---|
| People subscribe and open the weekday brief | Habit exists |
| They click 1–2 signals, not bounce | Editorial is useful |
| Directory searches happen from the brief | Funnel to buyers is real |
| A vendor asks to be listed unprompted | Directory has gravity |
| Someone forwards a brief unasked | Ready for slightly louder promotion |

---

**How to use this file:** Check off items. Say “update Next_Steps.md” for a fresh version. Canonical copy is in both repos; keep them in sync.
