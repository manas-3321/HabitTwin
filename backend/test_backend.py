"""
HabitTwin Backend Verification Test Script
Tests database seeding, analytics computation, predictive simulation,
What-If scenario calculations, CRUD operations, and letter generation.
"""

from fastapi.testclient import TestClient
from backend.main import app


def test_suite():
    with TestClient(app) as client:
        print("=== HabitTwin Backend Automated Verification ===")

        # 1. Test Health Endpoint
        print("\n[1/7] Testing /api/health ...")
        res = client.get("/api/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        print("[OK] Health check:", res.json()["service"])

        # 2. Test Seeding Demo Data
        print("\n[2/7] Testing /api/habits/seed ...")
        res = client.post("/api/habits/seed")
        assert res.status_code == 200, f"Seed failed: {res.text}"
        print("[OK] Seeded demo data:", res.json()["message"])

        # 3. Test Habit Retrieval & CRUD Upsert
        print("\n[3/7] Testing /api/habits retrieval and CRUD ...")
        res = client.get("/api/habits")
        assert res.status_code == 200, f"Habits fetch failed: {res.text}"
        habits = res.json()
        print(f"[OK] Retrieved {len(habits)} daily habit logs from SQLite database.")
        print(f"     Latest log date: {habits[0]['date']}, Sleep: {habits[0]['sleep_hours']}h, Spend: ₹{habits[0]['total_spending']}")

        # Create a test entry and update + delete it
        create_res = client.post("/api/habits", json={
            "date": "2026-01-01",
            "sleep_hours": 8.0,
            "screen_time_hours": 6.0,
            "physical_activity_minutes": 45,
            "study_hours": 4.0,
            "spending_food": 120.0,
            "spending_entertainment": 0.0,
            "spending_study": 50.0,
            "spending_shopping": 0.0,
            "spending_misc": 20.0,
            "notes": "Test day entry"
        })
        assert create_res.status_code == 201, f"Create failed: {create_res.text}"
        created_id = create_res.json()["id"]
        put_res = client.put(f"/api/habits/{created_id}", json={"sleep_hours": 8.5})
        assert put_res.status_code == 200 and put_res.json()["sleep_hours"] == 8.5
        del_res = client.delete(f"/api/habits/{created_id}")
        assert del_res.status_code == 200
        print("[OK] CRUD Create/Update/Delete verified cleanly.")

        # 4. Test Behavioral Analysis
        print("\n[4/7] Testing /api/analysis ...")
        res = client.get("/api/analysis")
        assert res.status_code == 200, f"Analysis failed: {res.text}"
        analysis = res.json()
        summary = analysis["summary"]
        streaks = analysis["streaks"]
        print("[OK] Behavioral Analysis Computed:")
        print(f"     Avg Sleep: {summary['avg_sleep_hours']}h | Avg Screen: {summary['avg_screen_time_hours']}h | Consistency Score: {summary['consistency_score']}/100")
        print(f"     Logging Streak: {streaks['logging_streak_days']} days | Study Streak: {streaks['study_consistency_streak_days']} days")
        print(f"     Correlations detected: {len(analysis['correlations'])} pairs")
        for corr in analysis["correlations"][:3]:
            print(f"       - {corr['pair_name']}: r = {corr['coefficient']} ({corr['strength']})")

        # 5. Test Predictive Simulation (6-month and 5-year)
        print("\n[5/7] Testing /api/predict (6-month and 5-year horizons) ...")
        res_6m = client.post("/api/predict", json={"horizon": "6_months", "monthly_income": 15000.0})
        assert res_6m.status_code == 200, f"Predict 6m failed: {res_6m.text}"
        data_6m = res_6m.json()
        gpa_a = data_6m["scenario_a_current"]["metrics"]["academic_gpa"]
        gpa_b = data_6m["scenario_b_improved"]["metrics"]["academic_gpa"]
        assert 0.0 <= gpa_a <= 10.0, f"Expected CGPA on 10.0 scale, got {gpa_a}"
        assert 0.0 <= gpa_b <= 10.0, f"Expected CGPA on 10.0 scale, got {gpa_b}"
        sav_a = data_6m["scenario_a_current"]["metrics"]["projected_savings"]
        sav_b = data_6m["scenario_b_improved"]["metrics"]["projected_savings"]
        print("[OK] 6-Month Horizon Projections:")
        print(f"     Scenario A (Current):  CGPA: {gpa_a:.2f} | Savings: ₹{sav_a:,.2f} | Lifestyle: {data_6m['scenario_a_current']['metrics']['overall_lifestyle_score']}")
        print(f"     Scenario B (Improved): CGPA: {gpa_b:.2f} | Savings: ₹{sav_b:,.2f} | Lifestyle: {data_6m['scenario_b_improved']['metrics']['overall_lifestyle_score']}")
        print(f"     Scenario A Avatar Posture: {data_6m['scenario_a_current']['avatar']['posture']}, Aura: {data_6m['scenario_a_current']['avatar']['aura_color']}")
        print(f"     Scenario B Avatar Posture: {data_6m['scenario_b_improved']['avatar']['posture']}, Aura: {data_6m['scenario_b_improved']['avatar']['aura_color']}")

        res_5y = client.post("/api/predict", json={"horizon": "5_years", "monthly_income": 15000.0})
        assert res_5y.status_code == 200, f"Predict 5y failed: {res_5y.text}"
        data_5y = res_5y.json()
        print("[OK] 5-Year Horizon Projections:")
        print(f"     Scenario A 5y Savings: ₹{data_5y['scenario_a_current']['metrics']['projected_savings']:,.2f}")
        print(f"     Scenario B 5y Savings: ₹{data_5y['scenario_b_improved']['metrics']['projected_savings']:,.2f}")

        # 6. Test What-If Interactive Simulator
        print("\n[6/7] Testing What-If Custom Simulation ...")
        what_if_res = client.post("/api/predict", json={
            "horizon": "5_years",
            "monthly_income": 18000.0,
            "what_if": {
                "sleep_hours": 8.0,
                "screen_time_hours": 6.0,
                "physical_activity_minutes": 60.0,
                "study_hours": 4.5,
                "daily_spending": 200.0,
                "monthly_income": 18000.0
            }
        })
        assert what_if_res.status_code == 200
        custom = what_if_res.json()["scenario_custom"]
        assert custom is not None
        print(f"[OK] Custom Scenario: CGPA={custom['metrics']['academic_gpa']}, Lifestyle={custom['metrics']['overall_lifestyle_score']}, Badge={custom['avatar']['badge_title']}")

        # 7. Test LLM Future-Self Letter
        print("\n[7/7] Testing /api/future-letter ...")
        for tone in ["motivational", "honest", "gentle"]:
            letter_res = client.post("/api/future-letter", json={
                "scenario": "improved" if tone == "motivational" else "current",
                "horizon": "5_years",
                "tone": tone,
                "user_name": "Alex"
            })
            assert letter_res.status_code == 200, f"Letter generation failed: {letter_res.text}"
            letter = letter_res.json()
            assert len(letter["suggestions"]) == 3
        print(f"[OK] Future-Self Letters generated cleanly for all 3 tones (Engine: {letter['generated_by']}).")
        print(f"     Sample Title: {letter['title']}")

        print("\nALL BACKEND TESTS PASSED!")


if __name__ == "__main__":
    test_suite()
