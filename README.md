# TravelMadLibs

AI-powered travel recommendation engine that turns a few fun Mad Libs-style prompts into a curated list of perfect destinations.

![TravelMadLibs hero](./docs/hero.png) <!-- replace with a real screenshot if available -->

---

## ✨ Features

* **Mad Libs-style Input** – Fill-in-the-blank form with real-time typeahead suggestions.
* **Travel Profile Integration** – Optionally add a personal profile to tailor results even further.
* **AI-Curated Destinations** – Up to 10 suggestions, each scored (70–100 %) and complete with highlights, best time to visit, and transportation info.
* **Detailed Modals** – Click any card for deeper details such as language, cuisine, budget, and cultural notes.
* **Responsive & Accessible UI** – Built with Tailwind CSS and React for a snappy experience on any device.

---

## 🛠 Tech Stack

| Purpose | Library |
| ------- | ------- |
| UI / Framework | React 18, TypeScript |
| Build Tooling | Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| AI Integration | OpenAI GPT-4 via `openai` SDK |

---

## 🚀 Getting Started

### Prerequisites

* **Node.js ≥ 18** (18 LTS recommended)
* An **OpenAI API key** with access to GPT-4 (or compatible) models

### 1. Clone & Install

```bash
# clone the repo
$ git clone https://github.com/jsnoblit/travel-madlibs.git
$ cd travel-madlibs

# install dependencies
$ npm install # or yarn / pnpm
```

### 2. Environment Variables

Create a `.env` file in the project root and add your OpenAI key:

```env
# .env
VITE_OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

> **Warning**  Never commit real API keys – `.env` is already in `.gitignore`.

### 3. Run in Development

```bash
$ npm run dev
```

The app will be served via Vite (usually at http://localhost:5173).

### 4. Production Build

```bash
# generate an optimized build in dist/
$ npm run build

# preview the production build locally
$ npm run preview
```

---

## 📂 Project Structure

```
travel-madlibs
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── MadLibForm.tsx
│   │   ├── Typeahead.tsx
│   │   ├── DestinationCard.tsx
│   │   ├── DestinationDetailsModal.tsx
│   │   └── TravelProfileButton.tsx
│   ├── data/             # Static suggestion lists
│   ├── services/         # API wrapper for OpenAI
│   ├── App.tsx           # Main app shell
│   └── main.tsx          # Entry point
├── index.html            # Vite HTML template
├── tailwind.config.js    # Tailwind configuration
├── TECHNICAL_SPECS.md    # In-depth architecture docs
└── …
```

---

## 📝 Scripts

| Script | What it does |
| ------ | ------------- |
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Create a production build |
| `npm run preview` | Serve the build locally for testing |
| `npm run lint` | Run ESLint over the codebase |

---

## 🤝 Contributing

1. Fork the repo and create your branch: `git checkout -b my-feature`  
2. Commit your changes: `git commit -m "feat: add amazing feature"`  
3. Push to the branch: `git push origin my-feature`  
4. Open a Pull Request

Please follow the existing code style and add tests where reasonable.

---

## 📄 License

This project is released under the MIT License. See [LICENSE](LICENSE) for details. 