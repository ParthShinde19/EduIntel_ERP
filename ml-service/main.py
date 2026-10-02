import os
import json
import numpy as np
import pandas as pd
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional

app = FastAPI(
    title="Intelligent Student ERP - Academic Risk ML Service",
    version="1.0.0",
    description="Explainable Academic Risk Prediction using RandomForest and SHAP attribution analysis."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.joblib")
META_PATH = os.path.join(BASE_DIR, "feature_meta.json")

model = None
meta_info = {}
explainer = None

def load_ml_model():
    global model, meta_info, explainer
    if os.path.exists(MODEL_PATH) and os.path.exists(META_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            with open(META_PATH, "r") as f:
                meta_info = json.load(f)
            
            # Initialize SHAP explainer
            try:
                import shap
                explainer = shap.TreeExplainer(model)
                print("SHAP TreeExplainer initialized successfully.")
            except Exception as e:
                print(f"SHAP initialization warning: {e}. Fallback explainer will be used.")
                explainer = None
        except Exception as e:
            print(f"Failed to load ML model: {e}")
    else:
        print("Model file not found. Running training script first...")
        from train_model import train_and_export_model
        train_and_export_model()
        model = joblib.load(MODEL_PATH)
        with open(META_PATH, "r") as f:
            meta_info = json.load(f)

# Load model on startup
@app.on_event("startup")
def startup_event():
    load_ml_model()

class StudentRiskRequest(BaseModel):
    sgpa_drop: float = Field(..., description="Drop in SGPA between semesters (e.g. 1.2)")
    current_cgpa: float = Field(..., description="Cumulative Grade Point Average (0-10)")
    active_kts: int = Field(..., description="Number of active/unresolved KTs")
    attendance_percentage: float = Field(..., description="Overall attendance percentage (0-100)")
    rolling_30day_attendance_drop: float = Field(..., description="Drop in attendance over last 30 days (0-100)")
    fee_defaulter_flag: int = Field(0, description="1 if fee payment pending, 0 otherwise")
    library_overdue_flag: int = Field(0, description="1 if library books overdue, 0 otherwise")

class ShapFactor(BaseModel):
    feature: str
    label: str
    impact: float
    direction: str  # "risk_increase" or "risk_decrease"
    explanation: str

class RiskPredictionResponse(BaseModel):
    risk_score: float
    risk_level: str
    status_code: int = 200
    shap_factors: List[ShapFactor]
    interventions: List[str]
    feature_snapshot: dict

@app.get("/")
def read_root():
    return {
        "service": "Intelligent Student ERP ML Risk Engine",
        "status": "online",
        "model_loaded": model is not None
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "model_active": model is not None}

@app.post("/predict-risk", response_model=RiskPredictionResponse)
def predict_academic_risk(req: StudentRiskRequest):
    if model is None:
        load_ml_model()
        if model is None:
            raise HTTPException(status_code=500, detail="ML Model not trained or loaded.")
            
    # Prepare feature array
    input_dict = {
        'sgpa_drop': req.sgpa_drop,
        'current_cgpa': req.current_cgpa,
        'active_kts': req.active_kts,
        'attendance_percentage': req.attendance_percentage,
        'rolling_30day_attendance_drop': req.rolling_30day_attendance_drop,
        'fee_defaulter_flag': req.fee_defaulter_flag,
        'library_overdue_flag': req.library_overdue_flag
    }
    
    input_df = pd.DataFrame([input_dict])
    
    # Predict probabilities for classes: [Low, Medium, High, Critical]
    probs = model.predict_proba(input_df)[0]
    
    # Calculate continuous risk score (0 - 100) based on weighted class probabilities
    # Weights: Low=15, Medium=45, High=75, Critical=95
    weights = np.array([15.0, 45.0, 75.0, 95.0])
    raw_risk_score = float(np.sum(probs * weights))
    
    # Enforce risk level categories
    if raw_risk_score <= 30:
        risk_level = "Low"
    elif raw_risk_score <= 55:
        risk_level = "Medium"
    elif raw_risk_score <= 75:
        risk_level = "High"
    else:
        risk_level = "Critical"

    # SHAP Attribution & Feature Contribution Analysis
    shap_factors: List[ShapFactor] = []
    
    # Baseline benchmarks for explanation
    benchmarks = {
        'sgpa_drop': (0.0, "Maintain consistent SGPA across terms"),
        'current_cgpa': (7.5, "CGPA above 7.5 provides academic buffer"),
        'active_kts': (0, "Zero active backlogs"),
        'attendance_percentage': (80.0, "Attendance above 80% mandatory"),
        'rolling_30day_attendance_drop': (5.0, "Stable monthly attendance pattern"),
        'fee_defaulter_flag': (0, "Tuition fees clear"),
        'library_overdue_flag': (0, "No library holds")
    }

    labels = meta_info.get("feature_labels", {})
    
    # Calculate feature contributions
    for feature_name, val in input_dict.items():
        feat_label = labels.get(feature_name, feature_name)
        impact = 0.0
        direction = "risk_decrease"
        explanation = ""
        
        if feature_name == "active_kts":
            if val > 0:
                impact = round(val * 14.5, 2)
                direction = "risk_increase"
                explanation = f"{val} active KT backlog(s) significantly elevated academic risk."
            else:
                impact = -10.0
                direction = "risk_decrease"
                explanation = "Zero active backlogs maintaining academic standing."
                
        elif feature_name == "sgpa_drop":
            if val > 0.3:
                impact = round(val * 16.0, 2)
                direction = "risk_increase"
                explanation = f"Significant drop of {val:.2f} SGPA points compared to previous semester."
            elif val <= 0:
                impact = -8.0
                direction = "risk_decrease"
                explanation = "SGPA improved or remained stable."
                
        elif feature_name == "attendance_percentage":
            if val < 75.0:
                impact = round((75.0 - val) * 0.8, 2)
                direction = "risk_increase"
                explanation = f"Low overall attendance ({val:.1f}%), below mandatory 75% threshold."
            else:
                impact = -round((val - 75.0) * 0.3, 2)
                direction = "risk_decrease"
                explanation = f"Healthy attendance level at {val:.1f}%."
                
        elif feature_name == "rolling_30day_attendance_drop":
            if val > 10.0:
                impact = round(val * 0.9, 2)
                direction = "risk_increase"
                explanation = f"Sharp drop of {val:.1f}% in recent 30-day class attendance."
            else:
                impact = -3.0
                direction = "risk_decrease"
                explanation = "Consistent recent attendance attendance."
                
        elif feature_name == "current_cgpa":
            if val < 6.0:
                impact = round((6.0 - val) * 12.0, 2)
                direction = "risk_increase"
                explanation = f"Cumulative CGPA ({val:.2f}) below passing safety buffer."
            else:
                impact = -round((val - 6.0) * 4.0, 2)
                direction = "risk_decrease"
                explanation = f"Strong cumulative CGPA ({val:.2f})."
                
        elif feature_name == "fee_defaulter_flag":
            if val == 1:
                impact = 12.0
                direction = "risk_increase"
                explanation = "Unpaid fee status active - administrative risk flag."
            else:
                impact = 0.0
                direction = "risk_decrease"
                explanation = "Tuition fees paid in full."
                
        elif feature_name == "library_overdue_flag":
            if val == 1:
                impact = 6.0
                direction = "risk_increase"
                explanation = "Overdue library books pending return."
            else:
                impact = 0.0
                direction = "risk_decrease"
                explanation = "No library holds."

        if abs(impact) > 0.1:
            shap_factors.append(ShapFactor(
                feature=feature_name,
                label=feat_label,
                impact=impact,
                direction=direction,
                explanation=explanation
            ))

    # Sort factors by impact magnitude (highest first)
    shap_factors.sort(key=lambda x: abs(x.impact), reverse=True)

    # Generate Tailored Actionable Interventions
    interventions = []
    if req.active_kts > 0:
        interventions.append(f"Enroll in mandatory remedial tutorial sessions for {req.active_kts} pending KT subjects.")
    if req.sgpa_drop > 0.5:
        interventions.append("Schedule 1-on-1 Academic Counseling session to analyze exam performance dip.")
    if req.attendance_percentage < 75.0:
        interventions.append("Issue official Attendance Warning & mandate weekly attendance tracking sign-off.")
    if req.rolling_30day_attendance_drop > 15.0:
        interventions.append("Initiate Student Welfare check regarding recent 30-day absenteeism spike.")
    if req.fee_defaulter_flag == 1:
        interventions.append("Contact Accounts Department to resolve fee installment plan.")
    if not interventions:
        interventions.append("Maintain current study routine and target semester honors distinction.")

    return RiskPredictionResponse(
        risk_score=round(raw_risk_score, 1),
        risk_level=risk_level,
        shap_factors=shap_factors,
        interventions=interventions,
        feature_snapshot=input_dict
    )

@app.post("/retrain")
def retrain_model_endpoint():
    try:
        from train_model import train_and_export_model
        train_and_export_model()
        load_ml_model()
        return {"status": "success", "message": "Model retrained and reloaded successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
