# Fact-Grounded Intelligence Caption Synthesis for X & YouTube

This upgrade overhaul aligns caption generation in **CAPTIONS & PUBLISHING** with the actual content of selected news reports and X dispatches. It eliminates hallucinated military claims on general stories, enforces factual grounding with in-depth intelligence background, and produces authoritative English dispatches for X and YouTube.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed in Phase 1 clarification:
> - **Caption Style**: In-depth analysis with intelligence situational background (*Analisis mendalam dengan latar belakang situasi intelijen*).
> - **Language**: Always English (*Selalu Bahasa Inggris - EN*) for both X and YouTube community dispatches.
> - **Non-Combat & General Topics**: Strictly tailored to the real subject matter without forcing synthetic combat or weapon jargon.

---

## 1. Overview & Core Concept

- **What It Does**: Upgrades the AI rewrite and captioning pipeline (`/api/ai/rewrite` and `CaptionsPanel.tsx`) so that every generated X post and YouTube Community article directly reflects the facts reported in the source feed or tweet, supplemented with accurate geopolitical and strategic context.
- **Target Audience / Persona**: Conflict news desk editors and OSINT analysts at `@Stark-News-x` who need immediate, trustworthy, publishing-ready copy without fact-checking fictional AI additions.
- **Key Value**: 100% factual fidelity to source reports, zero invented strikes/casualties on civilian/diplomatic tweets, and structured intelligence analysis in clear, authoritative English.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Story Selection**: User clicks an intelligence dispatch, X post, or wire report in the radar feed.
2. **Instant Grounded Draft**: The editor immediately populates with pure factual content from the story while Gemini 3.8 Flash synthesizes in the background.
3. **In-Depth Dispatches in Captions Panel**:
   - **X (Twitter) Post**: A concise, punchy 180–240 character intelligence wire dispatch containing the verified event, key actors, tactical/political significance, and hashtags.
   - **YouTube Community Post**: A 3-paragraph structured intelligence briefing (1: The Event & Verified Facts; 2: Strategic / Situational Background; 3: Regional Implications + Stark News call-to-action).
4. **Topic-Aware Verification**: Clear indicator displaying `Grounding: Verified Source Data` and the source handle/agency.
5. **Interactive Regenerate**: 1-click regenerate with style fine-tuning (In-Depth Intelligence, Tactical Wire, Geopolitical Analysis).

### Visual Identity & Theme
- **Theme**: High-contrast defense intelligence terminal aesthetic (pure `#000000` background, subtle `#262626` borders, crisp `#ffffff` primary text, muted `#a3a3a3` secondary prose).
- **Typography**: Clean tabular numerals and monospace metadata tags (`font-mono`, `text-[10px]`) for character counters and source attribution.
- **Micro-Interactions**: Smooth loading states on regeneration, character budget warnings for X (warning at 240, alert at 280), and 1-click clipboard copy buttons with visual checkmarks.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Topic-Adaptive Intelligence Grounding vs. Rigid Combat Template
- **Chosen Approach**: Dynamically evaluate whether the incoming report is a military engagement, diplomatic maneuver, political development, or general civilian report. The prompt instructs Gemini 3.8 Flash to adjust its analytical frame accordingly, forbidding the invention of weapon systems, casualties, or missile strikes when none exist in the source.
- **Why**: The previous template forced every tweet (even sports or diplomacy) into a military combat framework ("weapons used, casualty figures, frontline sectors"), causing hallucinations.
- **Alternatives Considered**: Hardcoded regex category routing (too brittle for nuanced multilingual dispatches).

### Decision 2: Fact-Anchor Heuristic Fallback
- **Chosen Approach**: Overhaul the offline/quota fallback in `server.ts` to directly extract and translate the actual sentences and entities from `title` and `summary`, rather than substituting canned Arabic/Cyrillic combat headlines.
- **Why**: Guarantees that even if API keys or rate limits fluctuate, captions will never display unrelated battlefield claims.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Live Radar Feed                          │
│     (X Tweets, Telegram Intel, Google News, Custom Feeds)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                Unified News Dispatch Object                 │
│    { title, summary, source, authorHandle, link, category } │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Server Route: POST /api/ai/rewrite              │
│  - Extracts full dispatch content (title + summary + media) │
│  - Classifies domain: Military / Diplomatic / General       │
│  - Executes Gemini 3.8 Flash Neural Engine with Grounding   │
│  - Multi-model fallback: gemini-3.8-flash -> 3.1-flash-lite │
│  - Deterministic entity-preserving fallback if offline      │
└──────────────────────────────┬──────────────────────────────┘
                               │
              ┌────────────────┴────────────────┐
              ▼                                 ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│        X (Twitter) Post      │ │     YouTube Community Post  │
│  - Factual Lead Sentence     │ │  - Paragraph 1: Event Lead  │
│  - Strategic Context Line    │ │  - Paragraph 2: Situation   │
│  - Clean Hashtags & Handle   │ │  - Paragraph 3: Outlook/CTA │
└──────────────────────────────┘ └─────────────────────────────┘
              │                                 │
              └────────────────┬────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│           CaptionsPanel (CAPTIONS & PUBLISHING)             │
│    - Live bidirectional sync with Canvas headline           │
│    - Character counter & copy buttons                        │
│    - Topic grounding indicator                              │
└─────────────────────────────────────────────────────────────┘
```

### Data Contracts & Model Configuration
- **Endpoint**: `POST /api/ai/rewrite`
  - Request: `{ title, summary, source, authorHandle, targetLang: 'en', category }`
  - Response Schema:
    ```json
    {
      "headline": "PUNCHY 6-9 WORD HEADLINE IN UPPERCASE",
      "highlight_words": "2-3 TACTICAL/KEY TERMS",
      "caption_x": "Accurate 180-240 char English post with verified context...",
      "caption_youtube": "3-paragraph in-depth intelligence dispatch in English...",
      "hashtags": ["#StarkNews", "#Geopolitics", "#SpecificTopic"],
      "groundingSummary": "Verified summary of facts from source",
      "aiAvailable": true,
      "provider": "Gemini 3.8 Flash Neural Engine"
    }
    ```
- **Gemini Model**: `gemini-3.8-flash` primary with `gemini-3.1-flash-lite` fallback.
- **Client Components**: `src/components/CaptionsPanel.tsx`, `src/App.tsx`, and `server.ts`.
