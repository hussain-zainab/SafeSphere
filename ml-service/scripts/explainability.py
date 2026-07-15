import pandas as pd, numpy as np, joblib, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.inspection import permutation_importance, PartialDependenceDisplay

clf = joblib.load('/home/claude/SafeSphere_AI/models/risk_classifier_raw.pkl')
X_test = pd.read_csv('/home/claude/SafeSphere_AI/data/processed/X_test.csv')
y_test = pd.read_csv('/home/claude/SafeSphere_AI/data/processed/ycls_test.csv').iloc[:,0]

sample_X = X_test.sample(n=3000, random_state=42)
sample_y = y_test.loc[sample_X.index]

print("Computing permutation importance (model-agnostic, no network dependency)...")
result = permutation_importance(clf, sample_X, sample_y, n_repeats=8, random_state=42,
                                 n_jobs=-1, scoring='f1_macro')
perm_imp = pd.Series(result.importances_mean, index=sample_X.columns).sort_values(ascending=False)
print(perm_imp.head(12))
perm_imp.to_csv('/home/claude/SafeSphere_AI/reports/permutation_importance.csv')

fig, ax = plt.subplots(figsize=(7,5))
perm_imp.head(12).sort_values().plot(kind='barh', ax=ax, color='#55A868')
ax.set_xlabel('Permutation Importance (macro-F1 drop)')
ax.set_title('Top 12 Features -- Permutation Importance')
plt.tight_layout()
plt.savefig('/home/claude/SafeSphere_AI/reports/evaluation/permutation_importance.png', dpi=130)
plt.close()

# Partial dependence for the 2 most important continuous features
top_features = [c for c in perm_imp.index if sample_X[c].nunique() > 5][:2]
print("Partial dependence for:", top_features)
fig, ax = plt.subplots(figsize=(10,4))
PartialDependenceDisplay.from_estimator(clf, sample_X, top_features, target='High', ax=ax)
plt.tight_layout()
plt.savefig('/home/claude/SafeSphere_AI/reports/evaluation/partial_dependence.png', dpi=130)
print("Saved permutation importance + partial dependence plots")
