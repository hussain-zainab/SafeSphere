import pandas as pd, numpy as np, joblib, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import shap

clf_raw = joblib.load('/home/claude/SafeSphere_AI/models/risk_classifier_raw.pkl')
X_test = pd.read_csv('/home/claude/SafeSphere_AI/data/processed/X_test.csv')
sample = X_test.sample(n=800, random_state=42)  # subsample for speed

explainer = shap.TreeExplainer(clf_raw)
shap_values = explainer.shap_values(sample)

# shap_values shape for multiclass: (n_samples, n_features, n_classes) in newer shap
print("SHAP values type/shape check:", type(shap_values), np.array(shap_values).shape if not isinstance(shap_values, list) else len(shap_values))

classes = clf_raw.classes_
high_idx = list(classes).index('High')

fig = plt.figure(figsize=(8,6))
if isinstance(shap_values, list):
    shap.summary_plot(shap_values[high_idx], sample, show=False, max_display=12)
else:
    shap.summary_plot(shap_values[:,:,high_idx], sample, show=False, max_display=12)
plt.title("SHAP Feature Impact -- 'High' Risk Class")
plt.tight_layout()
plt.savefig('/home/claude/SafeSphere_AI/reports/evaluation/shap_summary_high.png', dpi=130, bbox_inches='tight')
print("SHAP summary plot saved")
