import pandas as pd, numpy as np, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

df = pd.read_csv('/home/claude/SafeSphere_AI/data/processed/training_dataset_engineered.csv')
outdir = '/home/claude/SafeSphere_AI/reports/eda'

print("Shape:", df.shape)
print("Missing values:\n", df.isnull().sum().sum(), "total nulls")
print("Duplicates:", df.duplicated().sum())
print("\nClass balance:\n", df['risk_level'].value_counts(normalize=True).round(3))

# 1. Class balance chart
fig, ax = plt.subplots(figsize=(5,4))
df['risk_level'].value_counts().reindex(['Safe','Moderate','High']).plot(kind='bar', color=['#4CAF50','#FFC107','#F44336'], ax=ax)
ax.set_title('Class Balance'); ax.set_ylabel('Count')
plt.tight_layout(); plt.savefig(f'{outdir}/class_balance.png', dpi=130); plt.close()

# 2. Risk by hour bucket and archetype (heatmap)
pivot = df.pivot_table(index='area_type', columns='hour_bucket', values='risk_score', aggfunc='mean')
pivot = pivot[['early_morning','midday','evening','late_evening','night']]
fig, ax = plt.subplots(figsize=(7,4))
sns.heatmap(pivot, annot=True, fmt='.2f', cmap='YlOrRd', ax=ax)
ax.set_title('Mean Risk Score by Area Type x Time of Day')
plt.tight_layout(); plt.savefig(f'{outdir}/archetype_time_heatmap.png', dpi=130); plt.close()

# 3. Correlation heatmap (numeric features)
num_cols = ['police_station_dist_km','hospital_dist_km','metro_dist_km','market_density',
            'school_density','population_density_proxy','reports_last_30d','reports_last_365d',
            'historical_crime_baseline','temperature_proxy','risk_score']
corr = df[num_cols].corr()
fig, ax = plt.subplots(figsize=(8,6))
sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm', center=0, ax=ax)
plt.tight_layout(); plt.savefig(f'{outdir}/correlation_heatmap.png', dpi=130); plt.close()

# 4. Risk score distribution by class
fig, ax = plt.subplots(figsize=(6,4))
for lvl, color in zip(['Safe','Moderate','High'], ['#4CAF50','#FFC107','#F44336']):
    ax.hist(df[df['risk_level']==lvl]['risk_score'], bins=30, alpha=0.6, label=lvl, color=color)
ax.legend(); ax.set_xlabel('risk_score'); ax.set_title('Risk Score Distribution by Class (overlap = realistic)')
plt.tight_layout(); plt.savefig(f'{outdir}/risk_score_distribution.png', dpi=130); plt.close()

# 5. District-level average risk
district_risk = df.groupby('district')['risk_score'].mean().sort_values(ascending=False)
print("\nTop 5 highest-risk districts (mean):\n", district_risk.head())
print("\nBottom 5 lowest-risk districts (mean):\n", district_risk.tail())

print("\nEDA charts saved to", outdir)
