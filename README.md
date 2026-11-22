# HabitTwin — Meet Your Future Self

> **Your daily habits are writing your future. HabitTwin lets you see where they lead — and what changes when you choose differently.**

HabitTwin is an AI-assisted behavioral digital twin for personal self-improvement. It turns everyday routine data into behavioral insights, future simulations, and practical actions. Instead of only showing what you did yesterday, HabitTwin helps you explore what your current habits could mean six months or five years from now.

<p align="center">
  <a href="https://habittwin-frontend-78oq.vercel.app"><strong>🚀 Try the Live Demo</strong></a>
  &nbsp; · &nbsp;
  <a href="https://github.com/manas-3321/HabitTwin"><strong>Source Code</strong></a>
</p>

---

## The Problem

Most habit trackers tell people whether they completed a task. They rarely help answer the harder question:

**“If I keep living this way, where am I likely to end up?”**

Sleep debt, excessive screen time, inconsistent study, low physical activity, and unplanned spending often feel harmless in isolation. Their combined effects are difficult to see in the middle of a busy routine. Without meaningful feedback, it is easy to repeat the same patterns.

## Our Solution

HabitTwin creates a personal behavioral model from daily habit logs and turns that information into an interactive picture of possible futures.

Track your routine, understand the patterns behind it, compare your current trajectory with an improved one, and experiment with small changes before committing to them.

## What You Can Do

- **Track daily habits** — Log sleep, screen time, physical activity, study hours, mood, study mode, and spending.
- **Understand your behavior** — Review averages, consistency, streaks, trends, and relationships between tracked habits.
- **Simulate your future** — Explore projected outcomes over **6 months** and **5 years**.
- **Compare two paths** — See the difference between your current routine and a more intentional, improved routine.
- **Run what-if experiments** — Adjust habit inputs and explore how changing your routine may affect projected outcomes.
- **Explore multiple life dimensions** — View illustrative academic, health, finance, and lifestyle projections.
- **Receive a future-self letter** — Generate a first-person letter with practical suggestions, using Anthropic Claude when configured or the built-in fallback narrative engine.
- **Visualize progress** — Explore projected trajectories, behavioral insights, and future-self visual states in the dashboard.

## How It Works

```text
Daily Habit Logs
      │
      ▼
Behavioral Analytics
(averages, streaks, trends, correlations)
      │
      ▼
Predictive Simulation Engine
(rule-based models + Ridge Regression)
      │
      ├──────────────► Current Path
      │
      ├──────────────► Improved Path
      │
      └──────────────► Custom What-if Path
                            │
                            ▼
                Future Metrics & Trajectories
                            │
                            ▼
                 Future-Self AI Letter
```

1. **Input:** Users record their daily routine.
2. **Analyze:** The analytics engine calculates behavioral patterns and statistical relationships.
3. **Predict:** The simulation engine combines transparent rule-based calculations with Ridge Regression where sufficient history is available.
4. **Compare:** Current, improved, and custom what-if scenarios make the potential impact of habit changes easier to understand.
5. **Reflect:** The future-self letter translates projected metrics into a readable narrative and concrete micro-actions.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite |
| UI & Visualization | Tailwind CSS, Framer Motion, Recharts, Lucide React |
| Backend API | Python, FastAPI, Pydantic |
| Data & Modeling | NumPy, Pandas, scikit-learn (Ridge Regression) |
| Statistical Analysis | Statsmodels |
| AI Narrative | Anthropic Claude API with local fallback |
| Data Persistence | JSON file-based storage |
| Deployment | Vercel (frontend), Render (backend) |

## Architecture

```text
HabitTwin/
├── backend/
│   ├── main.py                 # FastAPI application and API routes
│   ├── analysis.py             # Behavioral analytics
│   ├── predictive_engine.py   # Predictive models and simulations
│   ├── llm_service.py          # Future-self letter generation
│   ├── json_db.py              # JSON persistence layer
│   ├── schemas.py              # Request/response validation
│   ├── seed_data.py            # Demo data generator
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── api/                # Backend API client
│   │   └── components/         # Dashboard and UI components
│   ├── index.html
│   └── package.json
│
└── render.yaml                 # Render deployment configuration
```

## Run Locally

### Prerequisites

- Python 3.10 or later
- Node.js 18 or later and npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/manas-3321/HabitTwin.git
cd HabitTwin
```

### 2. Start the backend

From the repository root:

```bash
python -m venv .venv
```

Activate the environment:

```bash
# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate
```

Install dependencies and start the API:

```bash
pip install -r backend/requirements.txt
python -m backend.run_server
```

The backend runs at `http://localhost:8000`.

Interactive API documentation: `http://localhost:8000/docs`

### 3. Start the frontend

Open a second terminal from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in your terminal (usually `http://localhost:5173`).

### 4. Optional: Enable AI-generated letters

The future-self letter feature works without an API key using the built-in narrative fallback. To enable Anthropic Claude, create `backend/.env`:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key
PORT=8000
HOST=0.0.0.0
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Keep API keys private. Do not commit your `.env` file.

## API Overview

The FastAPI backend exposes the following main endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend status |
| GET | `/api/habits` | Retrieve daily habit logs |
| POST | `/api/habits` | Create or update a daily log |
| PUT | `/api/habits/{log_id}` | Update a habit log |
| DELETE | `/api/habits/{log_id}` | Delete a habit log |
| DELETE | `/api/habits/clear` | Clear all habit records |
| POST | `/api/habits/seed` | Load sample demo data |
| GET | `/api/analysis` | Get behavioral analytics |
| POST | `/api/predict` | Generate future simulations |
| POST | `/api/future-letter` | Generate a future-self letter |

Full request and response schemas are available through the interactive Swagger UI at `/docs`.

## Hackathon Demo Flow

A short walkthrough that communicates the core idea:

1. **Start with the routine:** Show a user's daily habit data.
2. **Reveal the patterns:** Open behavioral analytics and explain what the data says.
3. **Show the two futures:** Compare the current path with the improved path.
4. **Make it interactive:** Change the what-if inputs and regenerate the projection.
5. **End with the human angle:** Generate the future-self letter and show how data becomes actionable reflection.

**The key idea:** HabitTwin does not just track habits. It helps people understand the possible consequences of repeating them.

## Important Disclaimer

HabitTwin is an experimental self-reflection and educational simulation project. Its projections are illustrative model outputs, not guaranteed outcomes or validated forecasts. They are not medical, clinical, academic, or financial advice. Actual outcomes depend on many factors that are not represented by the model.

## Future Scope

- Personalize model calibration as more user history becomes available.
- Add richer explainability for the factors influencing each projection.
- Support secure cloud-based user accounts and synchronized storage.
- Expand integrations with calendars, wearables, and productivity tools.
- Evaluate predictive performance against appropriately collected, consent-based real-world data.

## Contributing

Contributions, suggestions, and issue reports are welcome. If you find a bug or have an idea that could make HabitTwin more useful, open an issue or submit a pull request.


## Contributors

Thanks to everyone who helped build HabitTwin.

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/nk634267-sudo">
        <img src="https://github.com/nk634267-sudo.png" width="100px;" alt="nk634267-sudo"/>
        <br />
        <sub><b>nk634267-sudo</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/rastogiparth54-bot">
        <img src="https://github.com/rastogiparth54-bot.png" width="100px;" alt="rastogiparth54-bot"/>
        <br />
        <sub><b>rastogiparth54-bot</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Kishlay689">
        <img src="https://github.com/Kishlay689.png" width="100px;" alt="Kishlay689"/>
        <br />
        <sub><b>Kishlay689</b></sub>
      </a>
    </td>
  </tr>
</table>

## Built With Purpose

**HabitTwin — See how today's routine shapes tomorrow's you.**

If the project resonates with you, consider giving the repository a ⭐.
