# Kuizzy — ಸಂಸ್ಕೃತಿಕ ಕನ್ನಡ MCQ ಪರೀಕ್ಷಾ ತಯಾರಿ

**Kuizzy** is a fast, responsive, distraction-free Kannada MCQ study web application built for the **1st Internal Test in Samskrutika Kannada**.

It features a dark neon aesthetic, Noto Sans Kannada typography, client-side persistence, and intelligent learning workflows (immediate feedback Guess Mode with delayed spaced revisits, timed Actual Test simulation, and a persistent Mistake Revise Queue).

---

## ✨ Features

- **📖 Study Mode**:
  - Browse questions categorized into 6 themes: *Vocabulary*, *Vachanakaras & Pen-Names*, *Authors & Works*, *History & Organizations*, *Cultural Concepts*, and *Language & Grammar*.
  - Group-by-group study chunks (10 questions per group) with progress tracking.
  - Live search across Kannada questions and answer options.
  - Correct answers and verified source explanations highlighted with no guessing needed.

- **🎯 Guess Mode (Smart Revisit Queue)**:
  - Immediate feedback after each choice (green for correct, red for incorrect).
  - Incorrect answers are automatically placed into a **delayed revisit queue** (scheduled to reappear after 4 other questions, up to 2 revisits max).
  - Failed questions are automatically synchronized into the persistent **Revise Queue**.
  - Results screen separates first-attempt accuracy from revisit recall.

- **✏️ Actual Test Simulation**:
  - Test conditions: answer choices are kept hidden until explicit submission.
  - Question overview drawer/grid to jump between answered and unanswered questions.
  - Confirmation modal to prevent accidental submissions with unanswered questions.
  - Full post-test review with category score breakdowns and question-by-question analysis.

- **🔁 Mistake Revise Queue**:
  - Persistent collection of questions you got wrong across Guess and Test modes.
  - Interactive retry flow: test your recall or reveal the answer.
  - Questions remain in the queue until you explicitly mark them as **Mastered**.
  - Toggle between active practice items and mastered archive.

- **📊 Real Analytics & Progress**:
  - Zero vanity metrics or fake gamification.
  - First-attempt accuracy trends across Guess and Test modes.
  - Category-by-category weakness distribution.
  - JSON data export, import, and reset for portability across devices.

- **🎨 Design & Accessibility**:
  - Dark mode aesthetic (`#0a0f0d` background, neon lime `#a3e635` accent, cyan `#22d3ee`, warm orange `#fb923c`).
  - Google Fonts: **Noto Sans Kannada** for legible Kannada typography, **Inter** for UI, **JetBrains Mono** for numbers and metrics.
  - Desktop responsive sidebar navigation + mobile sticky bottom navigation bar.

---

## 📚 Question Bank & Dataset Integrity

- **Source Document**: *“1st Internal Test Samskrutika kannada MCQ's Question Bank.pdf”*
- **Total Unique Questions**: **79** canonical questions (consolidated and deduplicated from the 100 entries in the PDF).
- **Missing Questions in Source**: Questions **12** and **47** are absent from the original source PDF. Kuizzy adheres strictly to academic integrity and **does NOT fabricate or invent** artificial questions to fill these gaps.
- **Verification**: Verified answers, stable option identifiers, and source question number cross-references are maintained in `src/data/questions.ts`.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Vanilla CSS design system (`src/index.css`) with CSS custom properties
- **Persistence**: Browser `localStorage` (versioned `kuizzy_v1` schema)
- **Deployment**: Static single-page application (SPA), fully configured for Vercel

---

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or later recommended)
- npm (comes with Node.js)

### Installation & Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173/`.

3. **Build for production**:
   ```bash
   npm run build
   ```
   The production-ready static assets will be emitted to `dist/`.

4. **Preview production build locally**:
   ```bash
   npm run preview
   ```

---

## 🌐 Deploying to Vercel

Kuizzy is ready to deploy to Vercel out-of-the-box with zero environment variables needed:

1. Push your repository to **GitHub**.
2. Go to the [Vercel Dashboard](https://vercel.com/new).
3. Import the `kuizzy` repository.
4. Framework Preset will be automatically detected as **Vite**.
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click **Deploy**.

> Note: `vercel.json` is already included with client-side SPA route rewrites to `index.html`.

---

## 📁 Project Structure

```
kuizzy/
├── index.html                   # HTML entry with Kannada metadata & font preconnect
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript project configuration
├── vercel.json                  # SPA rewrite rules for Vercel
├── vite.config.ts               # Vite configuration
├── src/
│   ├── App.tsx                  # Root layout & responsive navigation (sidebar / bottom nav)
│   ├── index.css                # Complete CSS design system (tokens, components, animations)
│   ├── main.tsx                 # React application entry point
│   ├── components/
│   │   ├── OptionButton.tsx     # State-aware interactive option button
│   │   ├── SessionHeader.tsx    # Progress bar, timer & session controls
│   │   └── StudyQuestionCard.tsx# Question study card with answer reveals & notes
│   ├── data/
│   │   └── questions.ts         # 79 verified questions, categories & utility queries
│   ├── lib/
│   │   ├── storage.ts           # Type-safe localStorage API, export & import
│   │   └── utils.ts             # Shuffling, ID generators, date & time formatters
│   ├── pages/
│   │   ├── AnalyticsPage.tsx    # Progress overview, accuracy metrics & backup tools
│   │   ├── RevisePage.tsx       # Mistake queue with active practice & mastery archive
│   │   ├── StudyPage.tsx        # Filterable category browser with search & chunking
│   │   └── TestPage.tsx         # Guess Mode & Actual Test Mode execution engine
│   └── types/
│       └── index.ts             # TypeScript interfaces for sessions, results & queues
```

---

## 📄 License

MIT. Prepared for academic internal examination review.
