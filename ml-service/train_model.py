import os
import json
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

def generate_synthetic_erp_data(n_samples=2000, random_seed=42):
    np.random.seed(random_seed)
    
    # 1. Generate core features
    current_cgpa = np.random.normal(loc=7.2, scale=1.4, size=n_samples)
    current_cgpa = np.clip(current_cgpa, 3.5, 10.0)
    
    sgpa_drop = np.random.exponential(scale=0.5, size=n_samples) - 0.2
    sgpa_drop = np.clip(sgpa_drop, -0.5, 4.5)
    
    active_kts = np.random.poisson(lam=0.7, size=n_samples)
    active_kts = np.clip(active_kts, 0, 7)
    
    attendance_pct = np.random.normal(loc=82, scale=12, size=n_samples)
    attendance_pct = np.clip(attendance_pct, 25.0, 100.0)
    
    rolling_30day_drop = np.random.exponential(scale=5.0, size=n_samples)
    rolling_30day_drop = np.clip(rolling_30day_drop, 0.0, 45.0)
    
    fee_defaulter = np.random.binomial(n=1, p=0.15, size=n_samples)
    library_overdue = np.random.binomial(n=1, p=0.20, size=n_samples)
    
    # 2. Risk score formula (Ground Truth generation for synthetic dataset)
    # Risk score ranges 0 to 100
    risk_raw = (
        (10.0 - current_cgpa) * 4.5 +
        sgpa_drop * 12.0 +
        active_kts * 14.0 +
        (100.0 - attendance_pct) * 0.45 +
        rolling_30day_drop * 0.9 +
        fee_defaulter * 10.0 +
        library_overdue * 6.0 +
        np.random.normal(0, 3.0, n_samples)
    )
    
    risk_score = np.clip(risk_raw, 0, 100)
    
    # Classify into 4 categories:
    # 0: Low (0-30), 1: Medium (31-55), 2: High (56-75), 3: Critical (76-100)
    risk_class = np.zeros(n_samples, dtype=int)
    risk_class[risk_score > 30] = 1
    risk_class[risk_score > 55] = 2
    risk_class[risk_score > 75] = 3
    
    df = pd.DataFrame({
        'sgpa_drop': sgpa_drop,
        'current_cgpa': current_cgpa,
        'active_kts': active_kts,
        'attendance_percentage': attendance_pct,
        'rolling_30day_attendance_drop': rolling_30day_drop,
        'fee_defaulter_flag': fee_defaulter,
        'library_overdue_flag': library_overdue,
        'risk_score': risk_score,
        'risk_class': risk_class
    })
    
    return df

def train_and_export_model():
    print("Generating synthetic ERP longitudinal student dataset...")
    df = generate_synthetic_erp_data(n_samples=2500)
    
    feature_cols = [
        'sgpa_drop',
        'current_cgpa',
        'active_kts',
        'attendance_percentage',
        'rolling_30day_attendance_drop',
        'fee_defaulter_flag',
        'library_overdue_flag'
    ]
    
    X = df[feature_cols]
    y = df['risk_class']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training RandomForest Risk Classifier...")
    model = RandomForestClassifier(
        n_estimators=120,
        max_depth=8,
        random_state=42,
        class_weight='balanced'
    )
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"Model Accuracy: {acc:.4f}")
    print("\nClassification Report:\n", classification_report(y_test, preds))
    
    # Save artifacts
    output_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(output_dir, "model.joblib")
    meta_path = os.path.join(output_dir, "feature_meta.json")
    
    joblib.dump(model, model_path)
    
    meta_info = {
        "features": feature_cols,
        "feature_labels": {
            "sgpa_drop": "SGPA Drop Between Semesters",
            "current_cgpa": "Current CGPA",
            "active_kts": "Unresolved KT Backlogs",
            "attendance_percentage": "Overall Attendance %",
            "rolling_30day_attendance_drop": "30-Day Rolling Attendance Drop",
            "fee_defaulter_flag": "Pending Tuition Fee Status",
            "library_overdue_flag": "Overdue Library Books"
        },
        "classes": ["Low", "Medium", "High", "Critical"],
        "accuracy": float(acc)
    }
    
    with open(meta_path, "w") as f:
        json.dump(meta_info, f, indent=2)
        
    print(f"Saved trained model artifact to {model_path}")
    print(f"Saved feature metadata to {meta_path}")

if __name__ == "__main__":
    train_and_export_model()
