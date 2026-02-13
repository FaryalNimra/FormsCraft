# FormCraft Engineering Execution Plan

> **Version:** 3.0 (Parallel Sprint Model)**  
> **Date:** February 13, 2026  
> **Current Status:** Phase 1 Complete ✅  
> **Work Model:** 🔄 PARALLEL SPRINTS (Both work simultaneously)

---

## 🔄 PARALLEL SPRINT MODEL - KEY PRINCIPLES

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    PARALLEL SPRINT RULES                                  ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  ✅ WHAT'S NEW IN THIS MODEL:                                             ║
║  ────────────────────────────                                             ║
║  1. BOTH developers start Day 1 (no waiting)                              ║
║  2. Frontend uses MOCK DATA until backend ready                           ║
║  3. Agreed INTERFACE first, implementation later                          ║
║  4. Daily 10-min SYNC call (morning or evening)                           ║
║  5. Features delivered COMPLETE each week                                 ║
║                                                                           ║
║  ⚡ HOW IT WORKS:                                                          ║
║  ────────────────────────────                                             ║
║                                                                           ║
║     Day 1 Morning: Agree on TypeScript interfaces                         ║
║           ↓                                                               ║
║     🔵 Teammate builds real API    |    🟢 Huzaifa builds UI with mock    ║
║           ↓                        |           ↓                          ║
║     Day 3-4: Connect real API to UI (replace mocks)                       ║
║           ↓                                                               ║
║     Day 5: Test together, fix bugs, merge                                 ║
║                                                                           ║
║  📱 DAILY SYNC AGENDA (10 mins):                                          ║
║  ────────────────────────────                                             ║
║  • What I completed yesterday                                             ║
║  • What I'm doing today                                                   ║
║  • Any blockers / need from you                                           ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 👥 TEAM ROLES - READ THIS FIRST!

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                         TEAM RESPONSIBILITIES                             ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║   🔵 TEAMMATE (Admin Developer)       🟢 HUZAIFA (User Developer)         ║
║   ─────────────────────────────       ───────────────────────────         ║
║                                                                           ║
║   FOCUS: Backend & Database           FOCUS: Frontend & UI/UX             ║
║                                                                           ║
║   ✓ Supabase tables & schemas         ✓ React pages & components          ║
║   ✓ RLS (Row Level Security)          ✓ User interface design             ║
║   ✓ API routes (app/api/*)            ✓ Form interactions                 ║
║   ✓ Database queries                  ✓ State management                  ║
║   ✓ Authentication setup              ✓ Auth UI (login/signup)            ║
║   ✓ Third-party integrations          ✓ Charts & visualizations           ║
║   ✓ File upload handling              ✓ Responsive design                 ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

### 📁 File Ownership Map

```
FormsCraft/
├── app/
│   ├── globals.css              🔒 SHARED (coordinate first)
│   ├── layout.tsx               🟢 HUZAIFA (after teammate adds auth provider)
│   ├── page.tsx                 🔵 TEAMMATE ✅ Done
│   ├── builder/page.tsx         🔵 TEAMMATE ✅ Done
│   │
│   ├── api/                     🔵 TEAMMATE ONLY (all API routes)
│   │   ├── auth/*               🔵 TEAMMATE
│   │   ├── forms/*              🔵 TEAMMATE
│   │   ├── responses/*          🔵 TEAMMATE
│   │   └── workspaces/*         🔵 TEAMMATE
│   │
│   ├── form/[formId]/           🟢 HUZAIFA ✅ Done
│   ├── view/[id]/               🟢 HUZAIFA ✅ Done
│   ├── responses/[id]/          🔵 TEAMMATE ✅ Done
│   │
│   ├── (auth)/                  🟢 HUZAIFA (NEW - Phase 2)
│   │   ├── login/page.tsx       🟢 HUZAIFA
│   │   └── signup/page.tsx      🟢 HUZAIFA
│   │
│   ├── dashboard/               🔵 TEAMMATE (NEW - Phase 2)
│   │   └── analytics/page.tsx   🟢 HUZAIFA (UI only)
│   │
│   └── settings/                🟢 HUZAIFA (NEW - Phase 2)
│       └── page.tsx             🟢 HUZAIFA
│
├── components/
│   ├── Navbar.tsx               🔒 SHARED
│   ├── ActionCard.tsx           🔵 TEAMMATE ✅ Done
│   ├── RecentFormCard.tsx       🔵 TEAMMATE ✅ Done
│   ├── form-elements/*          🟢 HUZAIFA ✅ Done
│   │
│   ├── auth/                    🟢 HUZAIFA (NEW)
│   │   ├── LoginForm.tsx        🟢 HUZAIFA
│   │   ├── SignupForm.tsx       🟢 HUZAIFA
│   │   └── AuthProvider.tsx     🔵 TEAMMATE (creates) → 🟢 HUZAIFA (uses)
│   │
│   ├── analytics/               🟢 HUZAIFA (NEW)
│   │   ├── PieChart.tsx         🟢 HUZAIFA
│   │   ├── BarChart.tsx         🟢 HUZAIFA
│   │   └── ResponseTable.tsx    🟢 HUZAIFA
│   │
│   └── workspace/               🟢 HUZAIFA (NEW)
│       ├── WorkspaceSelector.tsx 🟢 HUZAIFA
│       └── MembersList.tsx      🟢 HUZAIFA
│
├── lib/
│   ├── supabase.ts              🔵 TEAMMATE (primary owner)
│   ├── forms.ts                 🔵 TEAMMATE ✅ Done
│   ├── auth.ts                  🔵 TEAMMATE (NEW)
│   └── analytics.ts             🔵 TEAMMATE (NEW)
│
├── types/
│   └── database.ts              🔵 TEAMMATE (adds types) → Both use
│
└── middleware.ts                🔵 TEAMMATE (NEW - route protection)
```

### ⚠️ GOLDEN RULES

| Rule | Description |
|------|-------------|
| **Rule 1** | NEVER edit files marked with the other person's color |
| **Rule 2** | 🔒 SHARED files = Message teammate BEFORE editing |
| **Rule 3** | Pull `main` branch EVERY morning before starting |
| **Rule 4** | Push your work EVERY evening |
| **Rule 5** | One person creates schema/types, other person USES them |

---

## Executive Summary

FormCraft has completed Phase 1 (core form creation + response collection). This plan outlines the architecture and execution strategy for Phases 2-4, focusing on collaboration, analytics, integrations, and advanced AI features.

---

## 1. Feature Modules Breakdown

### Module Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FORMCRAFT MODULES                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   AUTH       │  │   FORMS      │  │  RESPONSES   │  │  ANALYTICS  │ │
│  │   MODULE     │  │   MODULE     │  │   MODULE     │  │   MODULE    │ │
│  │  (Phase 2)   │  │  (Phase 1✅) │  │  (Phase 1✅) │  │  (Phase 2)  │ │
│  │  🔵+🟢       │  │  🔵 Done     │  │  🟢 Done     │  │  🔵+🟢      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ COLLABORATION│  │ INTEGRATIONS │  │  ADVANCED    │  │   ADMIN     │ │
│  │   MODULE     │  │   MODULE     │  │   LOGIC      │  │   MODULE    │ │
│  │  (Phase 2)   │  │  (Phase 3)   │  │  (Phase 4)   │  │  (Phase 2)  │ │
│  │  🔵+🟢       │  │  🔵+🟢       │  │  🔵+🟢       │  │  🔵+🟢      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Module Ownership

| Module | Phase | 🔵 Teammate Tasks | 🟢 Huzaifa Tasks |
|--------|-------|-------------------|------------------|
| **Auth** | 2 | Supabase Auth, RLS, middleware | Login/Signup UI, AuthProvider usage |
| **Forms** | 1 ✅ | Database, API | Builder UI (done) |
| **Responses** | 1 ✅ | Storage logic | Form fill UI (done) |
| **Analytics** | 2 | Aggregation queries, export API | Charts, dashboard UI |
| **Collaboration** | 2 | Workspace tables, permissions | Workspace UI, member list |
| **Integrations** | 3 | OAuth, API connections | Settings UI, status display |
| **Advanced Logic** | 4 | Logic engine, AI API | Logic builder UI, AI panel |
| **Admin** | 2 | Template storage | Settings pages |

---

## 2. Database Design Direction

### Current Schema (Phase 1 ✅)

```
forms ─────────┬───────── form_elements
               │
               └───────── responses ───────── response_answers
```

### Extended Schema (Phases 2-4)

```sql
-- ═══════════════════════════════════════════════════════════════
-- PHASE 2: Authentication & Collaboration
-- ═══════════════════════════════════════════════════════════════

-- Users table (managed by Supabase Auth, extended with profile)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspaces (for team collaboration)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES user_profiles(id),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace members (role-based access)
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Form collaborators (per-form permissions)
CREATE TABLE form_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  permission TEXT NOT NULL DEFAULT 'view' CHECK (permission IN ('edit', 'view', 'comment')),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(form_id, user_id)
);

-- ALTER existing forms table
ALTER TABLE forms 
  ADD COLUMN workspace_id UUID REFERENCES workspaces(id),
  ADD COLUMN settings JSONB DEFAULT '{}',
  ADD COLUMN theme JSONB DEFAULT '{}',
  ADD COLUMN is_template BOOLEAN DEFAULT FALSE,
  ADD COLUMN response_limit INTEGER,
  ADD COLUMN closes_at TIMESTAMPTZ;

-- ═══════════════════════════════════════════════════════════════
-- PHASE 2: Analytics & Notifications
-- ═══════════════════════════════════════════════════════════════

-- Form analytics (aggregated metrics)
CREATE TABLE form_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  starts INTEGER DEFAULT 0,
  completions INTEGER DEFAULT 0,
  avg_completion_time INTEGER, -- seconds
  UNIQUE(form_id, date)
);

-- Notification preferences
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  email_on_response BOOLEAN DEFAULT TRUE,
  email_digest TEXT DEFAULT 'none' CHECK (email_digest IN ('none', 'daily', 'weekly')),
  UNIQUE(user_id, form_id)
);

-- ═══════════════════════════════════════════════════════════════
-- PHASE 3: Integrations
-- ═══════════════════════════════════════════════════════════════

-- Integration connections
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google_sheets', 'slack', 'zapier', 'webhook')),
  credentials JSONB, -- encrypted
  config JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Form-specific integration mappings
CREATE TABLE form_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  config JSONB DEFAULT '{}', -- field mappings, channel, etc.
  enabled BOOLEAN DEFAULT TRUE,
  UNIQUE(form_id, integration_id)
);

-- ═══════════════════════════════════════════════════════════════
-- PHASE 4: Advanced Logic
-- ═══════════════════════════════════════════════════════════════

-- Branching/conditional logic rules
CREATE TABLE form_logic_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  source_element_id UUID NOT NULL REFERENCES form_elements(id) ON DELETE CASCADE,
  condition JSONB NOT NULL, -- {operator: 'equals', value: 'Yes'}
  action_type TEXT NOT NULL CHECK (action_type IN ('show', 'hide', 'skip_to', 'end_form')),
  target_element_id UUID REFERENCES form_elements(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0
);

-- AI insights cache
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL, -- 'summary', 'sentiment', 'recommendations'
  content JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Form templates library
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  form_data JSONB NOT NULL, -- serialized form + elements
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES user_profiles(id),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Database Relationships Diagram (Full)

```
                              ┌─────────────────┐
                              │  auth.users     │
                              │  (Supabase)     │
                              └────────┬────────┘
                                       │
                              ┌────────▼────────┐
                              │  user_profiles  │
                              └────────┬────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            │                          │                          │
   ┌────────▼────────┐      ┌─────────▼─────────┐     ┌─────────▼─────────┐
   │   workspaces    │      │workspace_members  │     │notification_settings│
   └────────┬────────┘      └───────────────────┘     └───────────────────┘
            │
   ┌────────┴────────────────────────┐
   │                                 │
┌──▼───┐                    ┌───────▼───────┐
│forms │                    │  integrations │
└──┬───┘                    └───────┬───────┘
   │                                │
   ├──────────────┬─────────────────┼──────────────┬─────────────┐
   │              │                 │              │             │
┌──▼───────┐  ┌───▼────────┐  ┌────▼─────┐  ┌────▼────────┐ ┌───▼───────┐
│form_     │  │form_       │  │form_     │  │form_logic_  │ │form_      │
│elements  │  │collaborators│ │integrations│ │rules        │ │analytics  │
└──┬───────┘  └────────────┘  └──────────┘  └─────────────┘ └───────────┘
   │
┌──▼───────┐
│responses │
└──┬───────┘
   │
┌──▼───────────┐
│response_     │
│answers       │
└──────────────┘
```

---

## 3. API Structure

### API Architecture Pattern

**Recommended:** Hybrid approach using Next.js API Routes + Supabase Client

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  React Components → React Query / SWR → API Layer               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌──────────────────┐                   │
│  │ Next.js API     │    │ Supabase Direct  │                   │
│  │ Routes          │    │ (RLS Protected)  │                   │
│  ├─────────────────┤    ├──────────────────┤                   │
│  │ • Auth callbacks│    │ • Form CRUD      │                   │
│  │ • Webhooks      │    │ • Response fetch │                   │
│  │ • File uploads  │    │ • Real-time sub  │                   │
│  │ • Integrations  │    │ • Analytics read │                   │
│  │ • AI processing │    │                  │                   │
│  └─────────────────┘    └──────────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL + Row Level Security + Realtime + Storage + Auth    │
└─────────────────────────────────────────────────────────────────┘
```

### API Routes Structure

```
app/api/
├── auth/
│   ├── callback/route.ts       # OAuth callback handler
│   ├── signup/route.ts         # Email signup
│   └── logout/route.ts         # Session cleanup
│
├── forms/
│   ├── route.ts                # GET (list), POST (create)
│   ├── [id]/
│   │   ├── route.ts            # GET, PUT, DELETE
│   │   ├── duplicate/route.ts  # POST - clone form
│   │   ├── publish/route.ts    # POST - change status
│   │   └── export/route.ts     # GET - CSV/Excel export
│   └── templates/route.ts      # GET (list), POST (create from form)
│
├── responses/
│   ├── route.ts                # POST (submit response)
│   └── [formId]/
│       ├── route.ts            # GET (list responses)
│       └── analytics/route.ts  # GET (aggregated stats)
│
├── workspaces/
│   ├── route.ts                # GET, POST
│   └── [id]/
│       ├── route.ts            # GET, PUT, DELETE
│       ├── members/route.ts    # GET, POST, DELETE
│       └── invite/route.ts     # POST (send invite)
│
├── integrations/
│   ├── google-sheets/
│   │   ├── auth/route.ts       # OAuth flow
│   │   └── sync/route.ts       # POST (sync responses)
│   ├── slack/
│   │   ├── auth/route.ts       # OAuth flow
│   │   └── webhook/route.ts    # POST (receive events)
│   └── webhooks/
│       └── [formId]/route.ts   # Outgoing webhooks
│
├── ai/
│   ├── summarize/route.ts      # POST (generate summary)
│   └── insights/route.ts       # POST (analyze responses)
│
└── upload/
    └── route.ts                # POST (file upload to Supabase Storage)
```

### Key API Contracts

#### Forms API

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/forms` | GET | Required | List user's forms |
| `/api/forms` | POST | Required | Create new form |
| `/api/forms/[id]` | GET | Optional* | Get form (public if published) |
| `/api/forms/[id]` | PUT | Required | Update form |
| `/api/forms/[id]` | DELETE | Required | Delete form |
| `/api/forms/[id]/duplicate` | POST | Required | Clone form |
| `/api/forms/[id]/publish` | POST | Required | Publish/unpublish |
| `/api/forms/[id]/export` | GET | Required | Export responses |

#### Responses API

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/responses` | POST | Optional | Submit response |
| `/api/responses/[formId]` | GET | Required | List form responses |
| `/api/responses/[formId]/analytics` | GET | Required | Get analytics |

---

## 4. Phased Roadmap

### Timeline Overview

```
         Feb 2026        Mar 2026        Apr 2026        May 2026
            │               │               │               │
 ┌──────────┴───────────────┴───────────────┴───────────────┴──────────┐
 │                                                                     │
 │  ████████████████  Phase 2: Auth + Analytics + Collab               │
 │  (6 weeks)         🔄 PARALLEL SPRINTS                              │
 │                    ████████████████  Phase 3: Integrations          │
 │                    (4 weeks)         🔄 PARALLEL SPRINTS            │
 │                                      ██████████████████  Phase 4    │
 │                                      (6 weeks)          AI + Logic  │
 │                                                                     │
 └─────────────────────────────────────────────────────────────────────┘
```

---

## 📅 PHASE 2: Authentication + Analytics + Collaboration (6 Weeks)

### 🎯 Phase 2 Goal
Enable multi-user access, team workspaces, and response visualization.

---

### 📆 WEEK 1: Authentication (PARALLEL SPRINT)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    WEEK 1 - PARALLEL SPRINT                               ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  📌 DAY 1 MORNING: INTERFACE AGREEMENT (30 min call)                      ║
║  ───────────────────────────────────────────────────                      ║
║  Both agree on these TypeScript interfaces:                               ║
║                                                                           ║
║  interface UserProfile {                                                  ║
║    id: string;                                                            ║
║    email: string;                                                         ║
║    full_name: string | null;                                              ║
║    avatar_url: string | null;                                             ║
║  }                                                                        ║
║                                                                           ║
║  interface AuthFunctions {                                                ║
║    signUp(email: string, password: string): Promise<User>;                ║
║    signIn(email: string, password: string): Promise<User>;                ║
║    signInWithGoogle(): Promise<User>;                                     ║
║    signOut(): Promise<void>;                                              ║
║    getCurrentUser(): User | null;                                         ║
║  }                                                                        ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  🔵 TEAMMATE (Day 1-5)                 🟢 HUZAIFA (Day 1-5)               ║
║  ──────────────────────                ─────────────────────              ║
║  STARTS IMMEDIATELY                    STARTS IMMEDIATELY                 ║
║                                                                           ║
║  Day 1-2:                              Day 1-2:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Enable Supabase Auth      │       │ ✦ Create mock auth service  │   ║
║  │   - Email provider          │       │   lib/mocks/auth.mock.ts    │   ║
║  │   - Google OAuth            │       │   (returns fake user data)  │   ║
║  │                             │       │                             │   ║
║  │ ✦ Create user_profiles      │       │ ✦ Build login page UI       │   ║
║  │   table in Supabase         │       │   app/(auth)/login/page.tsx │   ║
║  │                             │       │                             │   ║
║  │ ✦ Add RLS policies          │       │ ✦ Build signup page UI      │   ║
║  │                             │       │   app/(auth)/signup/page.tsx│   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 3-4:                              Day 3-4:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Create lib/auth.ts        │       │ ✦ Create LoginForm.tsx      │   ║
║  │   - signUp()                │       │   - Email/password inputs   │   ║
║  │   - signIn()                │       │   - Google button           │   ║
║  │   - signInWithGoogle()      │       │   - Error messages          │   ║
║  │   - signOut()               │       │   - Loading states          │   ║
║  │   - getCurrentUser()        │       │                             │   ║
║  │                             │       │ ✦ Create SignupForm.tsx     │   ║
║  │ ✦ Create middleware.ts      │       │   - Validation              │   ║
║  │   - Route protection        │       │   - Password strength       │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 5: INTEGRATION                    Day 5: INTEGRATION                 ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Test auth APIs            │       │ ✦ Replace mock with real    │   ║
║  │ ✦ Fix any RLS issues        │       │   import from lib/auth.ts   │   ║
║  │ ✦ Push to main              │       │ ✦ Test full flow            │   ║
║  │                             │       │ ✦ Push to main              │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  ✅ WEEK 1 CHECKPOINT (Both test together):                               ║
║  □ Sign up with email works                                              ║
║  □ Sign in with email works                                              ║
║  □ Sign in with Google works                                             ║
║  □ Sign out works                                                        ║
║  □ UI shows loading/error states                                         ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

#### Week 1 Files Created (PARALLEL)

| 🔵 Teammate Creates | 🟢 Huzaifa Creates |
|---------------------|-------------------|
| `lib/auth.ts` | `app/(auth)/login/page.tsx` |
| `middleware.ts` | `app/(auth)/signup/page.tsx` |
| `types/database.ts` (UserProfile) | `components/auth/LoginForm.tsx` |
| Supabase: user_profiles table | `components/auth/SignupForm.tsx` |
| Supabase: RLS policies | `lib/mocks/auth.mock.ts` (temporary) |

---

### 📆 WEEK 2: Session Management + Navbar (PARALLEL SPRINT)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    WEEK 2 - PARALLEL SPRINT                               ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  📌 DAY 1 MORNING: INTERFACE AGREEMENT (15 min call)                      ║
║  ───────────────────────────────────────────────────                      ║
║                                                                           ║
║  interface AuthContext {                                                  ║
║    user: UserProfile | null;                                              ║
║    loading: boolean;                                                      ║
║    signIn: (email, password) => Promise<void>;                            ║
║    signOut: () => Promise<void>;                                          ║
║  }                                                                        ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  🔵 TEAMMATE (Day 1-5)                 🟢 HUZAIFA (Day 1-5)               ║
║  ──────────────────────                ─────────────────────              ║
║                                                                           ║
║  Day 1-2:                              Day 1-2:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Create AuthProvider.tsx   │       │ ✦ Update Navbar.tsx         │   ║
║  │   components/auth/          │       │   - User avatar (mock first)│   ║
║  │   - Session state           │       │   - User name display       │   ║
║  │   - Auto-refresh            │       │   - Logout button           │   ║
║  │   - Context provider        │       │   - Login button (if !auth) │   ║
║  │                             │       │                             │   ║
║  │ ✦ Session persistence       │       │ ✦ Create UserMenu.tsx       │   ║
║  │   - Remember login          │       │   - Dropdown menu           │   ║
║  │   - Token refresh           │       │   - Profile link            │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 3-4:                              Day 3-4:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Update forms table        │       │ ✦ Wrap app with AuthProvider│   ║
║  │   - Add created_by column   │       │   in layout.tsx             │   ║
║  │   - Migration script        │       │                             │   ║
║  │                             │       │ ✦ Protected route component │   ║
║  │ ✦ Update lib/forms.ts       │       │   - Redirect if not auth    │   ║
║  │   - Use user_id on save     │       │   - Loading state           │   ║
║  │                             │       │                             │   ║
║  │ ✦ RLS: users see own forms  │       │ ✦ Update Dashboard page     │   ║
║  │                             │       │   - Use protected route     │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 5: INTEGRATION + TESTING          Day 5: INTEGRATION + TESTING       ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Test RLS policies         │       │ ✦ Connect real AuthProvider │   ║
║  │ ✦ Verify form ownership     │       │ ✦ Test protected routes     │   ║
║  │ ✦ Push & merge              │       │ ✦ Push & merge              │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  ✅ WEEK 2 CHECKPOINT:                                                    ║
║  □ Navbar shows user info when logged in                                 ║
║  □ Navbar shows login button when not logged in                          ║
║  □ Session persists after page refresh                                   ║
║  □ /builder redirects to login if not authenticated                      ║
║  □ Forms are linked to user who created them                             ║
║  □ User only sees their own forms on dashboard                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

### 📆 WEEK 3: Workspaces - Tables & UI (PARALLEL SPRINT)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    WEEK 3 - PARALLEL SPRINT                               ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  📌 DAY 1 MORNING: INTERFACE AGREEMENT (20 min call)                      ║
║  ───────────────────────────────────────────────────                      ║
║                                                                           ║
║  interface Workspace {                                                    ║
║    id: string;                                                            ║
║    name: string;                                                          ║
║    slug: string;                                                          ║
║    owner_id: string;                                                      ║
║    plan: 'free' | 'pro' | 'enterprise';                                   ║
║  }                                                                        ║
║                                                                           ║
║  // API Response Format                                                   ║
║  GET /api/workspaces → { workspaces: Workspace[] }                        ║
║  POST /api/workspaces → { workspace: Workspace }                          ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  🔵 TEAMMATE (Day 1-5)                 🟢 HUZAIFA (Day 1-5)               ║
║  ──────────────────────                ─────────────────────              ║
║                                                                           ║
║  Day 1-2:                              Day 1-2:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Create workspaces table   │       │ ✦ Create mock workspaces    │   ║
║  │   - id, name, slug, owner_id│       │   lib/mocks/workspace.mock.ts│  ║
║  │                             │       │                             │   ║
║  │ ✦ Create workspace_members  │       │ ✦ WorkspaceSelector.tsx     │   ║
║  │   table                     │       │   - Dropdown component      │   ║
║  │   - workspace_id, user_id   │       │   - Current workspace name  │   ║
║  │   - role (owner/editor/view)│       │   - Switch workspace        │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 3-4:                              Day 3-4:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ API: GET /api/workspaces  │       │ ✦ CreateWorkspaceModal.tsx  │   ║
║  │   - List user's workspaces  │       │   - Name input              │   ║
║  │                             │       │   - Create button           │   ║
║  │ ✦ API: POST /api/workspaces │       │                             │   ║
║  │   - Create new workspace    │       │ ✦ Add selector to Navbar    │   ║
║  │                             │       │   - Replace mock data       │   ║
║  │ ✦ RLS policies for workspaces│      │                             │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 5: INTEGRATION + TESTING          Day 5: INTEGRATION + TESTING       ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Test workspace APIs       │       │ ✦ Connect real APIs         │   ║
║  │ ✦ Auto-create default ws    │       │ ✦ Test workspace switching  │   ║
║  │   on user signup            │       │ ✦ Test create workspace     │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  ✅ WEEK 3 CHECKPOINT:                                                    ║
║  □ User has default workspace on signup                                  ║
║  □ User can create new workspaces                                        ║
║  □ User can switch between workspaces                                    ║
║  □ Workspace selector shows in navbar                                    ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

### 📆 WEEK 4: Workspace Members & Permissions (PARALLEL SPRINT)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    WEEK 4 - PARALLEL SPRINT                               ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  📌 DAY 1 MORNING: INTERFACE AGREEMENT (15 min call)                      ║
║  ───────────────────────────────────────────────────                      ║
║                                                                           ║
║  interface WorkspaceMember {                                              ║
║    id: string;                                                            ║
║    user: UserProfile;                                                     ║
║    role: 'owner' | 'admin' | 'editor' | 'viewer';                         ║
║    invited_at: string;                                                    ║
║  }                                                                        ║
║                                                                           ║
║  GET /api/workspaces/[id]/members → { members: WorkspaceMember[] }        ║
║  POST /api/workspaces/[id]/invite → { success: boolean }                  ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  🔵 TEAMMATE (Day 1-5)                 🟢 HUZAIFA (Day 1-5)               ║
║  ──────────────────────                ─────────────────────              ║
║                                                                           ║
║  Day 1-2:                              Day 1-2:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ API: GET members          │       │ ✦ MembersList.tsx           │   ║
║  │   /api/workspaces/[id]/     │       │   - List all members        │   ║
║  │   members                   │       │   - Role badges (color)     │   ║
║  │                             │       │   - Avatar + name           │   ║
║  │ ✦ API: POST invite          │       │                             │   ║
║  │   /api/workspaces/[id]/     │       │ ✦ MemberCard.tsx            │   ║
║  │   invite                    │       │   - Remove button (if owner)│   ║
║  │   - Send email invite       │       │   - Change role dropdown    │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 3-4:                              Day 3-4:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ API: DELETE member        │       │ ✦ InviteMemberModal.tsx     │   ║
║  │ ✦ API: PATCH member role    │       │   - Email input             │   ║
║  │                             │       │   - Role selector           │   ║
║  │ ✦ Link forms to workspace   │       │   - Send invite button      │   ║
║  │   - Update forms table      │       │                             │   ║
║  │   - workspace_id column     │       │ ✦ WorkspaceSettings page    │   ║
║  │                             │       │   app/settings/workspace/   │   ║
║  │ ✦ RLS: workspace isolation  │       │   - Members section         │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 5: INTEGRATION + TESTING          Day 5: INTEGRATION + TESTING       ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Test with 2 accounts      │       │ ✦ Full member flow test     │   ║
║  │ ✦ Verify isolation          │       │ ✦ Role-based UI hiding      │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  ✅ WEEK 4 CHECKPOINT:                                                    ║
║  □ Owner can invite members by email                                     ║
║  □ Owner can remove members                                              ║
║  □ Owner can change member roles                                         ║
║  □ Members only see workspace's forms                                    ║
║  □ Viewers cannot edit forms                                             ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

### 📆 WEEK 5: Analytics - Charts & Data (PARALLEL SPRINT)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    WEEK 5 - PARALLEL SPRINT                               ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  📌 DAY 1 MORNING: INTERFACE AGREEMENT (20 min call)                      ║
║  ───────────────────────────────────────────────────                      ║
║                                                                           ║
║  interface FormAnalytics {                                                ║
║    totalResponses: number;                                                ║
║    responsesByDate: { date: string; count: number }[];                    ║
║    questionStats: {                                                       ║
║      questionId: string;                                                  ║
║      questionLabel: string;                                               ║
║      answers: { value: string; count: number; percentage: number }[];     ║
║    }[];                                                                   ║
║  }                                                                        ║
║                                                                           ║
║  GET /api/responses/[formId]/analytics → FormAnalytics                    ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  🔵 TEAMMATE (Day 1-5)                 🟢 HUZAIFA (Day 1-5)               ║
║  ──────────────────────                ─────────────────────              ║
║                                                                           ║
║  Day 1-2:                              Day 1-2:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Create form_analytics     │       │ ✦ npm install recharts      │   ║
║  │   table (for caching)       │       │                             │   ║
║  │                             │       │ ✦ Create mock analytics     │   ║
║  │ ✦ Create lib/analytics.ts   │       │   lib/mocks/analytics.mock  │   ║
║  │   - getFormStats()          │       │                             │   ║
║  │   - getResponsesByDate()    │       │ ✦ PieChart.tsx component    │   ║
║  │   - getAnswerDistribution() │       │   - Multiple choice answers │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 3-4:                              Day 3-4:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ API: GET analytics        │       │ ✦ BarChart.tsx component    │   ║
║  │   /api/responses/[formId]/  │       │   - Rating scale results    │   ║
║  │   analytics                 │       │                             │   ║
║  │                             │       │ ✦ LineChart.tsx component   │   ║
║  │ ✦ Aggregate response data   │       │   - Responses over time     │   ║
║  │   - Count by answer         │       │                             │   ║
║  │   - Percentage calculation  │       │ ✦ StatsCard.tsx             │   ║
║  │                             │       │   - Total responses         │   ║
║  │                             │       │   - Completion rate         │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 5: INTEGRATION + TESTING          Day 5: INTEGRATION + TESTING       ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Test with real responses  │       │ ✦ Connect charts to real API│   ║
║  │ ✦ Optimize query performance│       │ ✦ Test with various data    │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  ✅ WEEK 5 CHECKPOINT:                                                    ║
║  □ Pie chart shows MCQ answer distribution                               ║
║  □ Bar chart shows rating scale results                                  ║
║  □ Line chart shows responses over time                                  ║
║  □ Stats cards show totals                                               ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

### 📆 WEEK 6: Analytics Dashboard & Export (PARALLEL SPRINT)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    WEEK 6 - PARALLEL SPRINT                               ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  📌 DAY 1 MORNING: INTERFACE AGREEMENT (15 min call)                      ║
║  ───────────────────────────────────────────────────                      ║
║                                                                           ║
║  // Export API                                                            ║
║  GET /api/forms/[id]/export?format=csv → CSV file download                ║
║  GET /api/forms/[id]/export?format=xlsx → Excel file download             ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  🔵 TEAMMATE (Day 1-5)                 🟢 HUZAIFA (Day 1-5)               ║
║  ──────────────────────                ─────────────────────              ║
║                                                                           ║
║  Day 1-2:                              Day 1-2:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Export API: CSV           │       │ ✦ Analytics dashboard page  │   ║
║  │   /api/forms/[id]/export    │       │   app/forms/[id]/analytics  │   ║
║  │   ?format=csv               │       │                             │   ║
║  │                             │       │ ✦ Layout with all charts    │   ║
║  │ ✦ Install xlsx package      │       │   - Summary section         │   ║
║  │   for Excel export          │       │   - Charts grid             │   ║
║  │                             │       │   - Individual responses    │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 3-4:                              Day 3-4:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Export API: Excel         │       │ ✦ ResponsesTable.tsx        │   ║
║  │   ?format=xlsx              │       │   - Paginated list          │   ║
║  │                             │       │   - Click to view detail    │   ║
║  │ ✦ Notification settings     │       │   - Delete response btn     │   ║
║  │   - notification_settings   │       │                             │   ║
║  │     table                   │       │ ✦ ExportButtons.tsx         │   ║
║  │   - API for preferences     │       │   - Download CSV button     │   ║
║  │                             │       │   - Download Excel button   │   ║
║  │                             │       │                             │   ║
║  │                             │       │ ✦ DateRangeFilter.tsx       │   ║
║  │                             │       │   - Filter by date range    │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 5: FINAL TESTING                  Day 5: FINAL TESTING               ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Test exports with data    │       │ ✦ Full dashboard test       │   ║
║  │ ✦ Edge cases (empty, large) │       │ ✦ Mobile responsive check   │   ║
║  │ ✦ Phase 2 review            │       │ ✦ Phase 2 review            │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  ✅ PHASE 2 COMPLETE CHECKLIST:                                          ║
║  □ Users can sign up / sign in (Email + Google)                          ║
║  □ Session persists across pages                                         ║
║  □ Users can create and switch workspaces                                ║
║  □ Users can invite team members with roles                              ║
║  □ Members only see their workspace's forms                              ║
║  □ Analytics dashboard shows all chart types                             ║
║  □ Responses can be exported to CSV/Excel                                ║
║  □ All routes are protected appropriately                                ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 📅 PHASE 3: Integrations (4 Weeks)

### 🎯 Phase 3 Goal
Connect FormCraft to external services for workflow automation.

---

### 📆 WEEK 7: Google Sheets - OAuth Setup (PARALLEL SPRINT)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    WEEK 7 - PARALLEL SPRINT                               ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  📌 DAY 1 MORNING: INTERFACE AGREEMENT (25 min call)                      ║
║  ───────────────────────────────────────────────────                      ║
║                                                                           ║
║  interface Integration {                                                  ║
║    id: string;                                                            ║
║    type: 'google_sheets' | 'slack' | 'zapier' | 'webhook';                ║
║    form_id: string;                                                       ║
║    config: Record<string, any>;                                           ║
║    status: 'active' | 'error' | 'disconnected';                           ║
║    last_synced: string | null;                                            ║
║  }                                                                        ║
║                                                                           ║
║  // API Format                                                            ║
║  GET /api/integrations → { integrations: Integration[] }                  ║
║  POST /api/integrations/google-sheets/auth → { authUrl: string }          ║
║  POST /api/integrations/google-sheets/callback → { success: boolean }     ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  🔵 TEAMMATE (Day 1-5)                 🟢 HUZAIFA (Day 1-5)               ║
║  ──────────────────────                ─────────────────────              ║
║                                                                           ║
║  Day 1-2:                              Day 1-2:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Google Cloud Console      │       │ ✦ Create mock integrations  │   ║
║  │   - Create project          │       │   lib/mocks/integration.mock│   ║
║  │   - Enable Sheets API       │       │                             │   ║
║  │   - OAuth consent screen    │       │ ✦ Integrations page layout  │   ║
║  │                             │       │   app/settings/integrations/│   ║
║  │ ✦ Create integrations table │       │   page.tsx                  │   ║
║  │   - id, type, form_id       │       │                             │   ║
║  │   - config (JSONB)          │       │ ✦ IntegrationCard.tsx       │   ║
║  │   - status, last_synced     │       │   - Logo + name             │   ║
║  │                             │       │   - Status indicator        │   ║
║  │ ✦ Encrypted token storage   │       │   - Connect button          │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 3-4:                              Day 3-4:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ OAuth flow API            │       │ ✦ ConnectGoogleModal.tsx    │   ║
║  │   /api/integrations/        │       │   - Explain permissions     │   ║
║  │   google-sheets/auth        │       │   - Connect button → popup  │   ║
║  │                             │       │                             │   ║
║  │ ✦ OAuth callback handler    │       │ ✦ OAuth popup handling      │   ║
║  │   /api/integrations/        │       │   - Open Google auth        │   ║
║  │   google-sheets/callback    │       │   - Detect completion       │   ║
║  │                             │       │   - Refresh parent page     │   ║
║  │ ✦ Token encryption/storage  │       │                             │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 5: INTEGRATION + TESTING          Day 5: INTEGRATION + TESTING       ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Test OAuth flow           │       │ ✦ Connect real OAuth        │   ║
║  │ ✦ Token refresh works       │       │ ✦ UI shows connected status │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  ✅ WEEK 7 CHECKPOINT:                                                    ║
║  □ User can connect Google account                                       ║
║  □ OAuth tokens stored securely                                          ║
║  □ Integration card shows connected status                               ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

### 📆 WEEK 8: Google Sheets - Sync Functionality (PARALLEL SPRINT)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    WEEK 8 - PARALLEL SPRINT                               ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  📌 DAY 1 MORNING: INTERFACE AGREEMENT (15 min call)                      ║
║  ───────────────────────────────────────────────────                      ║
║                                                                           ║
║  interface SheetMapping {                                                 ║
║    formElementId: string;                                                 ║
║    columnLetter: string;                                                  ║
║    headerName: string;                                                    ║
║  }                                                                        ║
║                                                                           ║
║  POST /api/integrations/google-sheets/sync → { rowsAdded: number }        ║
║  GET /api/integrations/google-sheets/sheets → { sheets: SpreadSheet[] }   ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  🔵 TEAMMATE (Day 1-5)                 🟢 HUZAIFA (Day 1-5)               ║
║  ──────────────────────                ─────────────────────              ║
║                                                                           ║
║  Day 1-2:                              Day 1-2:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ List user's spreadsheets  │       │ ✦ SheetSelector.tsx         │   ║
║  │   using Drive API           │       │   - Dropdown of sheets      │   ║
║  │                             │       │   - "Create new" option     │   ║
║  │ ✦ Create new spreadsheet    │       │                             │   ║
║  │   API function              │       │ ✦ FieldMappingTable.tsx     │   ║
║  │                             │       │   - Form field → Column     │   ║
║  │ ✦ form_integrations table   │       │   - Drag to reorder         │   ║
║  │   - Link form to sheet ID   │       │   - Auto-map button         │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 3-4:                              Day 3-4:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Sheets sync service       │       │ ✦ SyncStatusBar.tsx         │   ║
║  │   lib/integrations/sheets.ts│       │   - "Last synced: X min ago"│   ║
║  │   - appendRow()             │       │   - Sync now button         │   ║
║  │   - syncAllResponses()      │       │   - Spinning indicator      │   ║
║  │                             │       │                             │   ║
║  │ ✦ Auto-sync on new response │       │ ✦ SyncErrorDisplay.tsx      │   ║
║  │   - Webhook trigger         │       │   - Error message           │   ║
║  │   - Retry on failure        │       │   - "Reconnect" button      │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 5: INTEGRATION + TESTING          Day 5: INTEGRATION + TESTING       ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Test sync with real sheet │       │ ✦ Full mapping flow test    │   ║
║  │ ✦ Test auto-sync trigger    │       │ ✦ Test sync button          │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  ✅ WEEK 8 CHECKPOINT:                                                    ║
║  □ User can select/create spreadsheet                                    ║
║  □ User can map form fields to columns                                   ║
║  □ New responses auto-sync to sheet                                      ║
║  □ Manual "Sync Now" button works                                        ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

### 📆 WEEK 9: Slack & Webhooks (PARALLEL SPRINT)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    WEEK 9 - PARALLEL SPRINT                               ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  📌 DAY 1 MORNING: INTERFACE AGREEMENT (20 min call)                      ║
║  ───────────────────────────────────────────────────                      ║
║                                                                           ║
║  interface SlackConfig {                                                  ║
║    channel_id: string;                                                    ║
║    channel_name: string;                                                  ║
║    message_template: string;                                              ║
║  }                                                                        ║
║                                                                           ║
║  interface WebhookConfig {                                                ║
║    url: string;                                                           ║
║    events: ('new_response' | 'form_published')[];                         ║
║    headers?: Record<string, string>;                                      ║
║  }                                                                        ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  🔵 TEAMMATE (Day 1-5)                 🟢 HUZAIFA (Day 1-5)               ║
║  ──────────────────────                ─────────────────────              ║
║                                                                           ║
║  Day 1-2:                              Day 1-2:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Create Slack App          │       │ ✦ SlackIntegrationCard.tsx  │   ║
║  │   - api.slack.com           │       │   - Connect to Slack btn    │   ║
║  │   - Bot Token Scopes:       │       │   - Status indicator        │   ║
║  │     chat:write, channels:read│      │                             │   ║
║  │                             │       │ ✦ SlackChannelPicker.tsx    │   ║
║  │ ✦ Slack OAuth flow          │       │   - List channels dropdown  │   ║
║  │   /api/integrations/slack/  │       │   - Search filter           │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 3-4:                              Day 3-4:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Slack message sender      │       │ ✦ MessageTemplateEditor.tsx │   ║
║  │   lib/integrations/slack.ts │       │   - Preview message         │   ║
║  │   - postNotification()      │       │   - Variable placeholders   │   ║
║  │   - formatMessage()         │       │   {form_name}, {respondent} │   ║
║  │                             │       │                             │   ║
║  │ ✦ Generic webhook system    │       │ ✦ WebhookConfigForm.tsx     │   ║
║  │   lib/integrations/webhook.ts│      │   - URL input               │   ║
║  │   - sendWebhook()           │       │   - Event checkboxes        │   ║
║  │   - retryWithBackoff()      │       │   - Headers (optional)      │   ║
║  │                             │       │                             │   ║
║  │ ✦ webhook_logs table        │       │ ✦ TestWebhookButton.tsx     │   ║
║  │   - Track deliveries        │       │   - Send test payload       │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 5: INTEGRATION + TESTING          Day 5: INTEGRATION + TESTING       ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Test Slack notifications  │       │ ✦ Full Slack flow test      │   ║
║  │ ✦ Test webhooks (RequestBin)│       │ ✦ Webhook logs display      │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  ✅ WEEK 9 CHECKPOINT:                                                    ║
║  □ Slack notifications work on new response                              ║
║  □ Webhooks fire on configured events                                    ║
║  □ Webhook logs show delivery status                                     ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

### 📆 WEEK 10: QR Codes & Zapier (PARALLEL SPRINT)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    WEEK 10 - PARALLEL SPRINT                              ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  📌 DAY 1 MORNING: INTERFACE AGREEMENT (15 min call)                      ║
║  ───────────────────────────────────────────────────                      ║
║                                                                           ║
║  // QR Code API                                                           ║
║  GET /api/forms/[id]/qr?size=300&format=svg → QR Code image               ║
║                                                                           ║
║  // Zapier API                                                            ║
║  POST /api/integrations/zapier/subscribe → { webhookId: string }          ║
║  DELETE /api/integrations/zapier/unsubscribe                              ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  🔵 TEAMMATE (Day 1-5)                 🟢 HUZAIFA (Day 1-5)               ║
║  ──────────────────────                ─────────────────────              ║
║                                                                           ║
║  Day 1-2:                              Day 1-2:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ QR code generation API    │       │ ✦ ShareFormModal.tsx        │   ║
║  │   npm install qrcode        │       │   - Tabs: Link, QR, Embed   │   ║
║  │   /api/forms/[id]/qr        │       │                             │   ║
║  │   - Support PNG & SVG       │       │ ✦ QRCodeTab.tsx             │   ║
║  │   - Size parameter          │       │   - QR preview (mock first) │   ║
║  │                             │       │   - Size selector           │   ║
║  │ ✦ QR code caching           │       │   - Download PNG/SVG btns   │   ║
║  │   - Store in Supabase       │       │                             │   ║
║  │     Storage                 │       │ ✦ EmbedCodeTab.tsx          │   ║
║  │                             │       │   - iframe code             │   ║
║  │                             │       │   - Copy button             │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 3-4:                              Day 3-4:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Zapier trigger endpoints  │       │ ✦ IntegrationsOverview.tsx  │   ║
║  │   - Subscription management │       │   - All integrations grid   │   ║
║  │   - Perform list (samples)  │       │   - Status indicators       │   ║
║  │                             │       │   - Quick actions           │   ║
║  │ ✦ Zapier authentication     │       │                             │   ║
║  │   - API key generation      │       │ ✦ ZapierIntegrationCard.tsx │   ║
║  │   - Zapier app registration │       │   - "Connect to Zapier"     │   ║
║  │                             │       │   - Active zaps count       │   ║
║  │ ✦ Zapier webhook delivery   │       │                             │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 5: INTEGRATION + TESTING          Day 5: INTEGRATION + TESTING       ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Test QR codes scan        │       │ ✦ Download QR codes test    │   ║
║  │ ✦ Test Zapier trigger       │       │ ✦ Phase 3 review            │   ║
║  │ ✦ Phase 3 review            │       │                             │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  ✅ PHASE 3 COMPLETE CHECKLIST:                                          ║
║  □ Google Sheets sync works automatically                                ║
║  □ Slack notifications on new responses                                  ║
║  □ Webhooks configurable and logged                                      ║
║  □ QR codes generate and download                                        ║
║  □ Zapier triggers functional                                            ║
║  □ Integration status page shows all connections                         ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 📅 PHASE 4: Advanced Features (6 Weeks)

### 🎯 Phase 4 Goal
Introduce branching logic, AI-powered insights, and enterprise features.

---

### 📆 WEEK 11: Conditional Logic - Data Model (PARALLEL SPRINT)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    WEEK 11 - PARALLEL SPRINT                              ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  📌 DAY 1 MORNING: INTERFACE AGREEMENT (30 min call)                      ║
║  ───────────────────────────────────────────────────                      ║
║                                                                           ║
║  interface LogicRule {                                                    ║
║    id: string;                                                            ║
║    form_id: string;                                                       ║
║    source_element_id: string;    // Which question triggers              ║
║    condition: {                                                           ║
║      operator: 'equals' | 'not_equals' | 'contains' | 'greater' | 'less'; ║
║      value: string | number;                                              ║
║    };                                                                     ║
║    action: {                                                              ║
║      type: 'show' | 'hide' | 'skip_to' | 'end_form';                      ║
║      target_element_id?: string;                                          ║
║      target_section_id?: string;                                          ║
║    };                                                                     ║
║  }                                                                        ║
║                                                                           ║
║  GET /api/forms/[id]/logic → { rules: LogicRule[] }                       ║
║  POST /api/forms/[id]/logic → { rule: LogicRule }                         ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  🔵 TEAMMATE (Day 1-5)                 🟢 HUZAIFA (Day 1-5)               ║
║  ──────────────────────                ─────────────────────              ║
║                                                                           ║
║  Day 1-2:                              Day 1-2:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ form_logic_rules table    │       │ ✦ Study existing logic UIs  │   ║
║  │   - id, form_id             │       │   - Google Forms            │   ║
║  │   - source_element_id       │       │   - Typeform                │   ║
║  │   - condition (JSONB)       │       │                             │   ║
║  │   - action (JSONB)          │       │ ✦ Create mock logic         │   ║
║  │                             │       │   lib/mocks/logic.mock.ts   │   ║
║  │ ✦ form_sections table       │       │                             │   ║
║  │   - Support section breaks  │       │ ✦ LogicRuleItem.tsx         │   ║
║  │                             │       │   - Display one rule        │   ║
║  │ ✦ Update types/database.ts  │       │   - Edit/delete buttons     │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 3-4:                              Day 3-4:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ API: GET logic rules      │       │ ✦ LogicBuilderPanel.tsx     │   ║
║  │   /api/forms/[id]/logic     │       │   - "If [Question]"         │   ║
║  │                             │       │   - "[Condition]"           │   ║
║  │ ✦ API: POST logic rule      │       │   - "Then [Action]"         │   ║
║  │   Create new rule           │       │                             │   ║
║  │                             │       │ ✦ ConditionBuilder.tsx      │   ║
║  │ ✦ API: DELETE logic rule    │       │   - Operator dropdown       │   ║
║  │ ✦ API: PUT logic rule       │       │   - Value input             │   ║
║  │                             │       │   - Question selector       │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 5: INTEGRATION + TESTING          Day 5: INTEGRATION + TESTING       ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Test CRUD for logic rules │       │ ✦ Connect to real APIs      │   ║
║  │ ✦ Validate rule constraints │       │ ✦ Test rule creation UI     │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  ✅ WEEK 11 CHECKPOINT:                                                   ║
║  □ Logic rules can be created via API                                    ║
║  □ Logic builder UI works with mock data                                 ║
║  □ Rules saved to database correctly                                     ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

### 📆 WEEK 12: Conditional Logic - Evaluation Engine (PARALLEL SPRINT)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    WEEK 12 - PARALLEL SPRINT                              ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  📌 DAY 1 MORNING: INTERFACE AGREEMENT (20 min call)                      ║
║  ───────────────────────────────────────────────────                      ║
║                                                                           ║
║  // Evaluation functions signature                                        ║
║  evaluateCondition(rule: LogicRule, answers: Answers): boolean;           ║
║  getVisibleElements(rules: LogicRule[], answers: Answers): string[];      ║
║  getNextSection(rules: LogicRule[], currentAnswer: Answer): string | null;║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  🔵 TEAMMATE (Day 1-5)                 🟢 HUZAIFA (Day 1-5)               ║
║  ──────────────────────                ─────────────────────              ║
║                                                                           ║
║  Day 1-2:                              Day 1-2:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ lib/logic.ts              │       │ ✦ Add logic button to       │   ║
║  │   - evaluateCondition()     │       │   form builder               │   ║
║  │     - equals, not_equals    │       │   - Per-question settings   │   ║
║  │     - contains              │       │                             │   ║
║  │     - greater, less         │       │ ✦ LogicSidebar.tsx          │   ║
║  │                             │       │   - Opens from builder      │   ║
║  │ ✦ getVisibleElements()      │       │   - Lists all rules         │   ║
║  │   - Filter based on answers │       │   - Add new rule btn        │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 3-4:                              Day 3-4:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Section navigation logic  │       │ ✦ Update FormElementRenderer│   ║
║  │   - getNextSection()        │       │   - Check visibility        │   ║
║  │   - Handle skip_to          │       │   - Animate show/hide       │   ║
║  │   - Handle end_form         │       │                             │   ║
║  │                             │       │ ✦ SectionBreak.tsx          │   ║
║  │ ✦ Unit tests for logic      │       │   - Section title           │   ║
║  │   - Edge cases              │       │   - Section description     │   ║
║  │   - Multiple rules          │       │   - Next section button     │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 5: INTEGRATION + TESTING          Day 5: INTEGRATION + TESTING       ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Integration tests         │       │ ✦ Full logic flow test      │   ║
║  │ ✦ Performance testing       │       │ ✦ Test with real form       │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  ✅ WEEK 12 CHECKPOINT:                                                   ║
║  □ Fields show/hide based on previous answers                            ║
║  □ Form can skip to specific sections                                    ║
║  □ "End form" action works                                               ║
║  □ Section breaks render correctly                                       ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

### 📆 WEEK 13: AI Insights - Setup (PARALLEL SPRINT)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    WEEK 13 - PARALLEL SPRINT                              ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  📌 DAY 1 MORNING: INTERFACE AGREEMENT (25 min call)                      ║
║  ───────────────────────────────────────────────────                      ║
║                                                                           ║
║  interface AIInsight {                                                    ║
║    id: string;                                                            ║
║    form_id: string;                                                       ║
║    type: 'summary' | 'sentiment' | 'key_findings' | 'chat_response';      ║
║    content: string;                                                       ║
║    generated_at: string;                                                  ║
║    response_count: number;  // How many responses were analyzed          ║
║  }                                                                        ║
║                                                                           ║
║  POST /api/ai/summarize → { insight: AIInsight }                          ║
║  POST /api/ai/sentiment → { insight: AIInsight }                          ║
║  POST /api/ai/chat → { response: string }                                 ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  🔵 TEAMMATE (Day 1-5)                 🟢 HUZAIFA (Day 1-5)               ║
║  ──────────────────────                ─────────────────────              ║
║                                                                           ║
║  Day 1-2:                              Day 1-2:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ AI provider setup         │       │ ✦ Create mock AI service    │   ║
║  │   - Choose: OpenAI or Claude│       │   lib/mocks/ai.mock.ts      │   ║
║  │   - Get API key             │       │   - Return sample insights  │   ║
║  │   - Store in env vars       │       │                             │   ║
║  │                             │       │ ✦ AIInsightsPanel.tsx       │   ║
║  │ ✦ ai_insights table         │       │   - "Generate Insights" btn │   ║
║  │   - Cache AI responses      │       │   - Loading state           │   ║
║  │   - Avoid repeated calls    │       │   - Insight cards           │   ║
║  │                             │       │                             │   ║
║  │ ✦ lib/ai.ts                 │       │ ✦ AILoadingState.tsx        │   ║
║  │   - OpenAI/Claude client    │       │   - "Analyzing responses..."│   ║
║  │   - Error handling          │       │   - Progress animation      │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 3-4:                              Day 3-4:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ generateSummary()         │       │ ✦ SummaryCard.tsx           │   ║
║  │   - Prompt engineering      │       │   - Display AI summary      │   ║
║  │   - Format responses        │       │   - Regenerate button       │   ║
║  │                             │       │                             │   ║
║  │ ✦ analyzeSentiment()        │       │ ✦ SentimentDisplay.tsx      │   ║
║  │   - Positive/Negative/      │       │   - Visual meter            │   ║
║  │     Neutral classification  │       │   - Percentage breakdown    │   ║
║  │                             │       │                             │   ║
║  │ ✦ API: POST /api/ai/        │       │ ✦ KeyFindingsCard.tsx       │   ║
║  │   summarize & sentiment     │       │   - Bullet point list       │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 5: INTEGRATION + TESTING          Day 5: INTEGRATION + TESTING       ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Test with real responses  │       │ ✦ Connect to real AI API    │   ║
║  │ ✦ Rate limiting working     │       │ ✦ Test loading states       │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  ✅ WEEK 13 CHECKPOINT:                                                   ║
║  □ AI summary generates from responses                                   ║
║  □ Sentiment analysis shows results                                      ║
║  □ Results are cached to avoid re-calls                                  ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

### 📆 WEEK 14: AI Chat & Polish (PARALLEL SPRINT)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    WEEK 14 - PARALLEL SPRINT                              ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  📌 DAY 1 MORNING: INTERFACE AGREEMENT (15 min call)                      ║
║  ───────────────────────────────────────────────────                      ║
║                                                                           ║
║  interface ChatMessage {                                                  ║
║    role: 'user' | 'assistant';                                            ║
║    content: string;                                                       ║
║    timestamp: string;                                                     ║
║  }                                                                        ║
║                                                                           ║
║  POST /api/ai/chat → { message: ChatMessage }                             ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  🔵 TEAMMATE (Day 1-5)                 🟢 HUZAIFA (Day 1-5)               ║
║  ──────────────────────                ─────────────────────              ║
║                                                                           ║
║  Day 1-2:                              Day 1-2:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Chat API endpoint         │       │ ✦ AIChatInterface.tsx       │   ║
║  │   /api/ai/chat              │       │   - Chat input box          │   ║
║  │   - Context: form responses │       │   - Message history         │   ║
║  │   - Stream response         │       │   - Submit button           │   ║
║  │                             │       │                             │   ║
║  │ ✦ Chat prompt engineering   │       │ ✦ ChatMessage.tsx           │   ║
║  │   - Provide context         │       │   - User vs AI styling      │   ║
║  │   - Limit scope to form data│       │   - Timestamp               │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 3-4:                              Day 3-4:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Rate limiting per user    │       │ ✦ AIErrorStates.tsx         │   ║
║  │   - X requests per day      │       │   - "Rate limit exceeded"   │   ║
║  │   - Usage tracking table    │       │   - "AI unavailable"        │   ║
║  │                             │       │   - Retry button            │   ║
║  │ ✦ Error handling            │       │                             │   ║
║  │   - API failures            │       │ ✦ AIQuotaDisplay.tsx        │   ║
║  │   - Token quota             │       │   - "X/10 insights used"    │   ║
║  │   - Graceful fallbacks      │       │   - Upgrade prompt          │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 5: INTEGRATION + TESTING          Day 5: INTEGRATION + TESTING       ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Full AI feature test      │       │ ✦ Chat flow test            │   ║
║  │ ✦ Rate limiting test        │       │ ✦ Error states test         │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  ✅ WEEK 14 CHECKPOINT:                                                   ║
║  □ Chat interface works                                                  ║
║  □ Users can ask questions about responses                               ║
║  □ Rate limiting prevents abuse                                          ║
║  □ Error states display correctly                                        ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

### 📆 WEEK 15: Templates & Duplication (PARALLEL SPRINT)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    WEEK 15 - PARALLEL SPRINT                              ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  📌 DAY 1 MORNING: INTERFACE AGREEMENT (20 min call)                      ║
║  ───────────────────────────────────────────────────                      ║
║                                                                           ║
║  interface FormTemplate {                                                 ║
║    id: string;                                                            ║
║    name: string;                                                          ║
║    description: string;                                                   ║
║    category: 'survey' | 'feedback' | 'registration' | 'quiz' | 'other';   ║
║    thumbnail_url: string | null;                                          ║
║    form_data: FormData;  // The actual form structure                     ║
║    is_public: boolean;   // Visible to all users                          ║
║  }                                                                        ║
║                                                                           ║
║  GET /api/templates → { templates: FormTemplate[] }                       ║
║  POST /api/templates → { template: FormTemplate }                         ║
║  POST /api/forms/[id]/duplicate → { form: Form }                          ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  🔵 TEAMMATE (Day 1-5)                 🟢 HUZAIFA (Day 1-5)               ║
║  ──────────────────────                ─────────────────────              ║
║                                                                           ║
║  Day 1-2:                              Day 1-2:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ templates table           │       │ ✦ Mock templates            │   ║
║  │   - id, name, description   │       │   lib/mocks/templates.mock  │   ║
║  │   - category, thumbnail_url │       │                             │   ║
║  │   - form_data (JSONB)       │       │ ✦ TemplateGallery.tsx       │   ║
║  │   - is_public, created_by   │       │   app/templates/page.tsx    │   ║
║  │                             │       │   - Category filter         │   ║
║  │ ✦ API: GET templates        │       │   - Grid of cards           │   ║
║  │   - Public + user's own     │       │                             │   ║
║  │   - Category filter         │       │ ✦ TemplateCard.tsx          │   ║
║  │                             │       │   - Thumbnail preview       │   ║
║  │                             │       │   - "Use Template" btn      │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 3-4:                              Day 3-4:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ API: POST template        │       │ ✦ SaveAsTemplateModal.tsx   │   ║
║  │   - Save current form       │       │   - Name input              │   ║
║  │   - Generate thumbnail      │       │   - Category selector       │   ║
║  │                             │       │   - Description             │   ║
║  │ ✦ API: POST duplicate       │       │   - Make public checkbox    │   ║
║  │   /api/forms/[id]/duplicate │       │                             │   ║
║  │   - Deep copy form + elements│      │ ✦ DuplicateFormButton.tsx   │   ║
║  │   - New form name           │       │   - Quick action in builder │   ║
║  │   - Clear responses         │       │   - Rename modal            │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 5: INTEGRATION + TESTING          Day 5: INTEGRATION + TESTING       ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Test template creation    │       │ ✦ Full template flow test   │   ║
║  │ ✦ Test duplication          │       │ ✦ Test duplicate flow       │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  ✅ WEEK 15 CHECKPOINT:                                                   ║
║  □ Template gallery shows all templates                                  ║
║  □ User can start from template                                          ║
║  □ User can save form as template                                        ║
║  □ Form duplication works                                                ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

### 📆 WEEK 16: Advanced Settings & Theming (PARALLEL SPRINT)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    WEEK 16 - PARALLEL SPRINT                              ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  📌 DAY 1 MORNING: INTERFACE AGREEMENT (20 min call)                      ║
║  ───────────────────────────────────────────────────                      ║
║                                                                           ║
║  interface FormSettings {                                                 ║
║    response_limit: number | null;                                         ║
║    close_date: string | null;                                             ║
║    confirmation_message: string;                                          ║
║    redirect_url: string | null;                                           ║
║    require_sign_in: boolean;                                              ║
║    theme: FormTheme;                                                      ║
║  }                                                                        ║
║                                                                           ║
║  interface FormTheme {                                                    ║
║    primary_color: string;                                                 ║
║    background_color: string;                                              ║
║    font_family: string;                                                   ║
║    header_image_url: string | null;                                       ║
║  }                                                                        ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  🔵 TEAMMATE (Day 1-5)                 🟢 HUZAIFA (Day 1-5)               ║
║  ──────────────────────                ─────────────────────              ║
║                                                                           ║
║  Day 1-2:                              Day 1-2:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ form_settings table       │       │ ✦ FormSettingsPanel.tsx     │   ║
║  │   - response_limit          │       │   - Accordion sections      │   ║
║  │   - close_date              │       │   - General settings        │   ║
║  │   - confirmation_message    │       │   - Response settings       │   ║
║  │   - theme (JSONB)           │       │   - Theme settings          │   ║
║  │                             │       │                             │   ║
║  │ ✦ API: GET/PUT form settings│       │ ✦ ResponseLimitInput.tsx    │   ║
║  │   /api/forms/[id]/settings  │       │   - Number input            │   ║
║  │                             │       │   - "Unlimited" checkbox    │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 3-4:                              Day 3-4:                           ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Advanced validation rules │       │ ✦ ThemeCustomizer.tsx       │   ║
║  │   - Regex patterns          │       │   - Color picker            │   ║
║  │   - Custom error messages   │       │   - Font dropdown           │   ║
║  │   - Min/max for numbers     │       │   - Preview panel           │   ║
║  │                             │       │                             │   ║
║  │ ✦ Form close logic          │       │ ✦ ClosedFormPage.tsx        │   ║
║  │   - Check limit on submit   │       │   - "This form is closed"   │   ║
║  │   - Check close_date        │       │   - Custom message          │   ║
║  │                             │       │                             │   ║
║  │ ✦ Validation API updates    │       │ ✦ HeaderImageUpload.tsx     │   ║
║  │   - Validate on server      │       │   - Upload to Supabase      │   ║
║  │   - Return specific errors  │       │   - Preview                 │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
║  Day 5: FINAL TESTING + LAUNCH         Day 5: FINAL TESTING + LAUNCH      ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐   ║
║  │ ✦ Full system test          │       │ ✦ Full UI test              │   ║
║  │ ✦ Performance audit         │       │ ✦ Responsive design check   │   ║
║  │ ✦ Phase 4 complete review   │       │ ✦ Phase 4 complete review   │   ║
║  └─────────────────────────────┘       └─────────────────────────────┘   ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  ✅ PHASE 4 COMPLETE CHECKLIST:                                          ║
║  □ Conditional logic shows/hides fields                                  ║
║  □ AI generates summaries and sentiment                                  ║
║  □ AI chat answers questions about responses                             ║
║  □ Templates gallery works                                               ║
║  □ Form duplication works                                                ║
║  □ Response limits & close dates work                                    ║
║  □ Theme customization applies to public form                            ║
║  □ All validation rules working                                          ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 🎉 PROJECT COMPLETE CHECKLIST

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                      FULL PROJECT CHECKLIST                               ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  PHASE 1 (Complete):                                                      ║
║  ✅ Form builder with drag-drop                                          ║
║  ✅ Multiple question types                                              ║
║  ✅ Form preview & publish                                               ║
║  ✅ Response collection                                                  ║
║                                                                           ║
║  PHASE 2 (Authentication + Analytics + Collaboration):                    ║
║  □ User signup/signin (Email + Google)                                   ║
║  □ Session management                                                    ║
║  □ Workspaces with team members                                          ║
║  □ Role-based permissions                                                ║
║  □ Analytics charts (Pie, Bar, Line)                                     ║
║  □ CSV/Excel export                                                      ║
║                                                                           ║
║  PHASE 3 (Integrations):                                                 ║
║  □ Google Sheets sync                                                    ║
║  □ Slack notifications                                                   ║
║  □ Custom webhooks                                                       ║
║  □ QR code generation                                                    ║
║  □ Zapier integration                                                    ║
║                                                                           ║
║  PHASE 4 (Advanced Features):                                            ║
║  □ Conditional logic/branching                                           ║
║  □ AI-powered summaries                                                  ║
║  □ AI sentiment analysis                                                 ║
║  □ AI chat interface                                                     ║
║  □ Form templates                                                        ║
║  □ Form duplication                                                      ║
║  □ Theme customization                                                   ║
║  □ Advanced settings (limits, close dates)                               ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---
║           🔵 TEAMMATE                     🟢 HUZAIFA                      ║
║           (Admin/Backend)                 (User/Frontend)                 ║
║                                                                           ║
║  Skills Used:                           Skills Used:                      ║
║  • SQL / Database design                • React / Next.js                 ║
║  • Supabase (Auth, RLS, Storage)        • Tailwind CSS                    ║
║  • API development                      • UI/UX design                    ║
║  • Third-party integrations             • State management                ║
║  • Security & permissions               • Responsive design               ║
║                                                                           ║
║  Typical Day:                           Typical Day:                      ║
║  1. Write SQL schemas                   1. Build React components         ║
║  2. Create API routes                   2. Implement UI designs           ║
║  3. Set up RLS policies                 3. Connect to APIs                ║
║  4. Test APIs with Postman              4. Handle user interactions       ║
║  5. Debug backend issues                5. Test UI flows                  ║
║                                                                           ║
║  Tools:                                 Tools:                            ║
║  • Supabase Dashboard                   • VS Code                         ║
║  • Postman / Insomnia                   • Browser DevTools                ║
║  • Database client                      • React DevTools                  ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

### 📋 Daily Workflow for Each Developer

#### 🔵 TEAMMATE's Daily Routine

```
┌─────────────────────────────────────────────────────────────────┐
│                   TEAMMATE DAILY CHECKLIST                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🌅 MORNING (Start of Day)                                      │
│  ────────────────────────                                       │
│  □ git checkout main                                            │
│  □ git pull origin main                                         │
│  □ git checkout feature/admin-<current-feature>                 │
│  □ git merge main (if needed)                                   │
│  □ Check Supabase dashboard for any issues                      │
│                                                                 │
│  💻 DURING WORK                                                 │
│  ────────────────────────                                       │
│  □ Work on your assigned tasks                                  │
│  □ Test APIs in Postman before pushing                          │
│  □ Update types/database.ts when adding new tables              │
│  □ Commit after each completed task                             │
│     git commit -m "feat(admin): add workspace API"              │
│                                                                 │
│  🌙 END OF DAY                                                  │
│  ────────────────────────                                       │
│  □ Push all changes: git push origin feature/admin-*            │
│  □ Message Huzaifa if you made changes he needs                 │
│  □ Create PR if feature is complete                             │
│                                                                 │
│  📱 MESSAGE HUZAIFA WHEN:                                       │
│  ────────────────────────                                       │
│  • New API endpoint is ready: "GET /api/workspaces is ready"    │
│  • New type added: "Added WorkspaceType in types/database.ts"   │
│  • Breaking change: "Changed response format for /api/forms"    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 🟢 HUZAIFA's Daily Routine

```
┌─────────────────────────────────────────────────────────────────┐
│                    HUZAIFA DAILY CHECKLIST                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🌅 MORNING (Start of Day)                                      │
│  ────────────────────────                                       │
│  □ git checkout main                                            │
│  □ git pull origin main                                         │
│  □ git checkout feature/user-<current-feature>                  │
│  □ git merge main (if needed)                                   │
│  □ Check teammate's messages for new APIs/types                 │
│                                                                 │
│  💻 DURING WORK                                                 │
│  ────────────────────────                                       │
│  □ Work on your assigned UI components                          │
│  □ Import types from types/database.ts (don't recreate!)        │
│  □ Use lib/ functions for API calls (don't call Supabase direct)│
│  □ Test all UI states: loading, error, success, empty           │
│  □ Commit after each completed component                        │
│     git commit -m "feat(user): add LoginForm component"         │
│                                                                 │
│  🌙 END OF DAY                                                  │
│  ────────────────────────                                       │
│  □ Push all changes: git push origin feature/user-*             │
│  □ Message teammate if you need a new API                       │
│  □ Create PR if feature is complete                             │
│                                                                 │
│  📱 MESSAGE TEAMMATE WHEN:                                      │
│  ────────────────────────                                       │
│  • Need new API: "Need endpoint for listing workspace members"  │
│  • Found API bug: "GET /api/forms returns empty workspace_id"   │
│  • Need new type: "Need WorkspaceMember type with role field"   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 🔄 Handoff Points (When Work Depends on Each Other)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                        DEPENDENCY FLOW                                    ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  Step 1: 🔵 Teammate creates backend                                      ║
║          ─────────────────────────────                                    ║
║          • Creates Supabase table                                         ║
║          • Adds TypeScript types                                          ║
║          • Creates API route                                              ║
║          • Tests API with Postman                                         ║
║          • Pushes code                                                    ║
║          • Messages: "API ready: GET /api/xyz"                            ║
║                              │                                            ║
║                              ▼                                            ║
║  Step 2: 🟢 Huzaifa builds frontend                                       ║
║          ─────────────────────────────                                    ║
║          • Pulls latest code                                              ║
║          • Imports types from types/database.ts                           ║
║          • Builds UI component                                            ║
║          • Calls API using fetch or lib function                          ║
║          • Handles loading/error states                                   ║
║          • Pushes code                                                    ║
║                              │                                            ║
║                              ▼                                            ║
║  Step 3: Both test together                                               ║
║          ──────────────────────                                           ║
║          • End-to-end testing                                             ║
║          • Fix any integration issues                                     ║
║          • Merge to main                                                  ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

### 📊 Phase-wise Work Distribution

#### Phase 2 (Week 1-6)

| Week | 🔵 Teammate Tasks | 🟢 Huzaifa Tasks | Handoff |
|------|-------------------|------------------|---------|
| 1 | Auth setup, user_profiles table, lib/auth.ts | Wait → then build login/signup UI | After Day 2 |
| 2 | AuthProvider, middleware, form ownership | Navbar auth state, error handling | After Day 1 |
| 3 | Workspaces table, API routes | Wait → then WorkspaceSelector UI | After Day 3 |
| 4 | Members API, invitations | MembersList, InviteMemberModal | After Day 2 |
| 5 | Analytics table, lib/analytics.ts | Chart components (Pie, Bar, Line) | After Day 3 |
| 6 | Export API (CSV/Excel), notifications | Analytics page, filters, export UI | After Day 3 |

#### Phase 3 (Week 7-10)

| Week | 🔵 Teammate Tasks | 🟢 Huzaifa Tasks | Handoff |
|------|-------------------|------------------|---------|
| 7 | Google OAuth setup, integrations table | Integrations page layout | After Day 4 |
| 8 | Sheets sync service, field mapping API | Field mapping UI, sync status | After Day 3 |
| 9 | Slack OAuth, webhook system | Slack config UI, webhook UI | After Day 3 |
| 10 | QR generation, Zapier endpoints | Share modal, QR display | After Day 2 |

#### Phase 4 (Week 11-16)

| Week | 🔵 Teammate Tasks | 🟢 Huzaifa Tasks | Handoff |
|------|-------------------|------------------|---------|
| 11 | Logic rules table, condition types | Study/design logic builder UI | After Day 4 |
| 12 | Logic evaluation engine, section breaks | LogicBuilder component, conditionals | After Day 3 |
| 13 | AI service setup, lib/ai.ts | AI insights panel design | After Day 4 |
| 14 | AI endpoints, caching, rate limits | AIInsightsPanel, AIChatInterface | After Day 3 |
| 15 | Templates table, duplication API | Template gallery, SaveAsTemplate | After Day 3 |
| 16 | Advanced validation, form settings | Settings page, theme customization | After Day 3 |

---

### 🔒 Shared Files - Coordination Rules

| File | Primary Owner | How to Coordinate |
|------|---------------|-------------------|
| `types/database.ts` | 🔵 Teammate adds | Huzaifa imports only, never edits |
| `lib/supabase.ts` | 🔵 Teammate | Ask before editing |
| `lib/forms.ts` | 🔵 Teammate | Ask before editing |
| `app/layout.tsx` | 🟢 Huzaifa | Ask before editing |
| `app/globals.css` | 🟢 Huzaifa | Ask before editing |
| `components/Navbar.tsx` | 🔒 Both | Discuss before any change |
| `package.json` | 🔒 Both | Tell other before npm install |

---

## 6. Risks & Dependencies

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Supabase RLS complexity** | High | Medium | Start with simple policies, iterate. Test thoroughly with different user roles. |
| **Real-time sync conflicts** | High | Medium | Implement optimistic UI with conflict resolution. Use Supabase Realtime carefully. |
| **Google API rate limits** | Medium | Low | Implement queuing, batching, and retry logic. Cache responses. |
| **AI API costs at scale** | Medium | Medium | Implement caching layer, rate limiting per user, tiered access. |
| **File upload storage costs** | Low | Medium | Set size limits, implement cleanup for orphaned files. |

### External Dependencies

| Dependency | Required For | Risk Level | Fallback |
|------------|--------------|------------|----------|
| **Supabase** | Everything | High | Self-hosted PostgreSQL + custom auth |
| **Vercel** | Hosting | Medium | Cloudflare, Railway, or self-hosted |
| **Google Cloud** | Sheets integration | Medium | Manual CSV export only |
| **Slack API** | Notifications | Low | Email notifications, webhooks |
| **OpenAI/Claude** | AI features | Medium | Rule-based summaries, disable AI |

### Dependency Chain

```
Phase 1 (Done) ─────► Phase 2 ─────► Phase 3 ─────► Phase 4
     │                   │              │              │
     │                   │              │              │
     ▼                   ▼              ▼              ▼
  Forms +            Auth is         Sheets needs   AI needs
  Responses          REQUIRED        OAuth from     responses
  exist              for all         Phase 2        data
                     future
                     features
```

### Blockers to Watch

| Blocker | Affects | Detection | Resolution |
|---------|---------|-----------|------------|
| Auth not complete | All Phase 2+ | Can't protect routes | Prioritize auth Week 1-2 |
| RLS policies broken | Data security | Users see wrong data | Test with multiple accounts |
| Missing env vars | Integrations | API calls fail | Document all required vars |
| Schema migrations | Production data | Data loss risk | Use Supabase migrations tool |

---

## 7. Immediate Next Steps

### 🚀 THIS WEEK: Start Phase 2

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    WEEK 1 ACTION ITEMS                                    ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  🔵 TEAMMATE - Do These First (Day 1-2)                                   ║
║  ──────────────────────────────────────                                   ║
║  □ Step 1: Go to Supabase Dashboard → Authentication → Providers          ║
║  □ Step 2: Enable Email provider                                          ║
║  □ Step 3: Enable Google provider (need Google Cloud credentials)         ║
║  □ Step 4: Run SQL to create user_profiles table                          ║
║  □ Step 5: Create lib/auth.ts with signIn, signUp, signOut functions      ║
║  □ Step 6: Push code and message Huzaifa: "Auth ready!"                   ║
║                                                                           ║
║  🟢 HUZAIFA - Do These After Teammate (Day 3-5)                           ║
║  ──────────────────────────────────────────────                           ║
║  □ Step 1: Wait for teammate's "Auth ready!" message                      ║
║  □ Step 2: Pull latest code from main                                     ║
║  □ Step 3: Create app/(auth)/login/page.tsx                               ║
║  □ Step 4: Create app/(auth)/signup/page.tsx                              ║
║  □ Step 5: Create components/auth/LoginForm.tsx                           ║
║  □ Step 6: Create components/auth/SignupForm.tsx                          ║
║  □ Step 7: Test login/signup flow                                         ║
║  □ Step 8: Push code                                                      ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

### ✅ Definition of Done (Phase 2)

| # | Requirement | Test Method |
|---|-------------|-------------|
| 1 | User can sign up with email | Create new account |
| 2 | User can sign in with Google | Click Google button |
| 3 | Navbar shows user avatar when logged in | Visual check |
| 4 | /builder redirects to login if not authenticated | Try accessing without login |
| 5 | User can create workspace | Use workspace form |
| 6 | User can switch workspaces | Use workspace dropdown |
| 7 | User can invite team members | Send invitation |
| 8 | Analytics shows charts | View analytics page |
| 9 | Export to CSV works | Download button |
| 10 | User only sees their own forms | Check with 2 accounts |

---

## 📋 QUICK REFERENCE CARD

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    FORMCRAFT QUICK REFERENCE                              ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  🔵 TEAMMATE                           🟢 HUZAIFA                         ║
║  ────────────                          ────────────                       ║
║  Branch: feature/admin-*               Branch: feature/user-*             ║
║  Focus: Backend, Database, API         Focus: Frontend, UI, Components    ║
║                                                                           ║
║  YOUR FILES:                           YOUR FILES:                        ║
║  • app/api/**                          • app/(auth)/**                    ║
║  • lib/*.ts                            • app/settings/**                  ║
║  • middleware.ts                       • components/auth/**               ║
║  • types/database.ts                   • components/analytics/**          ║
║                                        • components/workspace/**          ║
║                                                                           ║
║  DAILY COMMANDS:                       DAILY COMMANDS:                    ║
║  git pull origin main                  git pull origin main               ║
║  git checkout feature/admin-*          git checkout feature/user-*        ║
║  git push origin feature/admin-*       git push origin feature/user-*     ║
║                                                                           ║
║  ────────────────────────────────────────────────────────────────────     ║
║                                                                           ║
║  🔒 SHARED (Ask First!):  globals.css | layout.tsx | Navbar.tsx           ║
║                                                                           ║
║  📱 COMMUNICATION:                                                        ║
║  • "API ready: GET /api/xyz"                                              ║
║  • "Need endpoint for X"                                                  ║
║  • "Added new type: XyzType"                                              ║
║  • "Going to edit [shared file]"                                          ║
║                                                                           ║
║  ⚠️  NEVER DO:                                                            ║
║  • Edit files owned by other person                                       ║
║  • Push to main directly                                                  ║
║  • Create tables without telling teammate                                 ║
║  • Install packages without telling teammate                              ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 🗓️ FULL TIMELINE SUMMARY

| Week | Phase | 🔵 Teammate Focus | 🟢 Huzaifa Focus |
|------|-------|-------------------|------------------|
| 1 | 2 | Auth setup, user_profiles | Login/Signup UI |
| 2 | 2 | AuthProvider, middleware | Navbar auth, error states |
| 3 | 2 | Workspaces table, API | WorkspaceSelector UI |
| 4 | 2 | Members API, invites | MembersList, InviteModal |
| 5 | 2 | Analytics table, queries | Chart components |
| 6 | 2 | Export API, notifications | Analytics page, filters |
| 7 | 3 | Google OAuth, integrations | Integrations page |
| 8 | 3 | Sheets sync service | Field mapping UI |
| 9 | 3 | Slack OAuth, webhooks | Slack/Webhook UI |
| 10 | 3 | QR codes, Zapier | Share modal, QR display |
| 11 | 4 | Logic rules schema | Logic builder design |
| 12 | 4 | Logic engine, sections | LogicBuilder component |
| 13 | 4 | AI service, lib/ai.ts | AI panel design |
| 14 | 4 | AI endpoints, caching | AI components |
| 15 | 4 | Templates, duplication | Template gallery |
| 16 | 4 | Validation, settings | Settings page, themes |

---

**Document Version:** 2.0 (Polished)  
**Last Updated:** February 12, 2026  
**Next Review:** End of Week 2  
**Maintained By:** Both team members
