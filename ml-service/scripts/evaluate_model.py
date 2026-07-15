import pandas as pd, numpy as np, joblib, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (confusion_matrix, roc_curve, auc, precision_recall_curve,
                              classification_report, brier_score_loss)
from sklearn.preprocessing import label_binarize

outdir = '/home/claude/SafeSphere_AI/reports/evaluation'

clf = joblib.load('/home/claude/SafeSphere_AI/models/risk_classifier_calibrated.pkl')
X_test = pd.read_csv('/home/claude/SafeSphere_AI/data/processed/X_test.csv')
y_test = pd.read_csv('/home/claude/SafeSphere_AI/data/processed/ycls_test.csv').iloc[:,0]

classes = sorted(y_test.unique())
pred = clf.predict(X_test)
proba = clf.predict_proba(X_test)

# 1. Confusion matrix
cm = confusion_matrix(y_test, pred, labels=classes)
fig, ax = plt.subplots(figsize=(5,4))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=classes, yticklabels=classes, ax=ax)
ax.set_xlabel('Predicted'); ax.set_ylabel('True'); ax.set_title('Confusion Matrix (Calibrated RF)')
plt.tight_layout(); plt.savefig(f'{outdir}/confusion_matrix.png', dpi=130); plt.close()

# 2. ROC curves (one-vs-rest)
y_bin = label_binarize(y_test, classes=classes)
fig, ax = plt.subplots(figsize=(6,5))
for i, c in enumerate(classes):
    fpr, tpr, _ = roc_curve(y_bin[:, i], proba[:, i])
    ax.plot(fpr, tpr, label=f'{c} (AUC={auc(fpr,tpr):.3f})')
ax.plot([0,1],[0,1],'k--', alpha=0.4)
ax.set_xlabel('False Positive Rate'); ax.set_ylabel('True Positive Rate')
ax.set_title('ROC Curves (One-vs-Rest)'); ax.legend()
plt.tight_layout(); plt.savefig(f'{outdir}/roc_curves.png', dpi=130); plt.close()

# 3. PR curves
fig, ax = plt.subplots(figsize=(6,5))
for i, c in enumerate(classes):
    prec, rec, _ = precision_recall_curve(y_bin[:, i], proba[:, i])
    ax.plot(rec, prec, label=f'{c}')
ax.set_xlabel('Recall'); ax.set_ylabel('Precision'); ax.set_title('Precision-Recall Curves')
ax.legend()
plt.tight_layout(); plt.savefig(f'{outdir}/pr_curves.png', dpi=130); plt.close()

# 4. Calibration curve (reliability diagram) - for the "High" class (most safety-critical)
from sklearn.calibration import calibration_curve
high_idx = classes.index('High')
prob_true, prob_pred = calibration_curve(y_bin[:, high_idx], proba[:, high_idx], n_bins=10)
fig, ax = plt.subplots(figsize=(5,5))
ax.plot(prob_pred, prob_true, marker='o', label='High-risk class')
ax.plot([0,1],[0,1],'k--', label='Perfect calibration')
ax.set_xlabel('Mean predicted probability'); ax.set_ylabel('Fraction of positives')
ax.set_title('Calibration Curve -- High-risk class'); ax.legend()
plt.tight_layout(); plt.savefig(f'{outdir}/calibration_curve.png', dpi=130); plt.close()

brier = brier_score_loss(y_bin[:, high_idx], proba[:, high_idx])
print("Brier score (High class, lower=better calibrated):", brier)

# 5. Classification report -> file
report = classification_report(y_test, pred)
with open(f'{outdir}/classification_report.txt', 'w') as f:
    f.write(report)
print(report)

print("Evaluation charts + report saved to", outdir)
