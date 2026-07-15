# Before vs After: Target-Noise Reduction

| Metric | Before (noise=0.22, jitter=0.35/0.45) | After (noise=0.13, jitter=0.18/0.22) |
|---|---|---|
| Accuracy | 69.5% | **80.4%** |
| Macro F1 | 0.694 | **0.803** |
| High recall | 0.72 | 0.81 |
| Moderate F1 (weakest class, both runs) | 0.57 | 0.71 |
| Safe F1 | 0.78 | 0.86 |
| High->Safe confusion rate | 2.5% (47/1879) | 0.51% (10/1967) |
| Safe->High confusion rate | 1.6% (40/2465) | 0.12% (3/2432) |
| Class balance | 37.8/33.5/28.8 | 37.3/32.6/30.1 |

## Why accuracy changed (mechanism, not magic)
Two independent noise sources were being layered on the SAME target:
1. `target_noise` -- a per-row multiplicative lognormal draw applied to the
   latent risk value (intentional: this is what keeps risk_score from being
   a deterministic function of the aggregated features).
2. Threshold jitter -- a per-row additive draw applied AGAIN when converting
   the (already noisy) risk_score into Safe/Moderate/High buckets.

Both were necessary in principle (no leakage), but their combined variance
was larger than the true world's designed signal-to-noise ratio, so even a
perfect model was capped near ~70% -- the errors were landing in genuine
label ambiguity, not model weakness. Feature importances and mutual
information were already well-distributed BEFORE this fix (no single
dominant/leaky feature), which is what confirmed this was a noise problem,
not a missing-feature problem: engineering more features barely moved
accuracy (68.7% -> 69.5%), but reducing noise moved it 69.5% -> 80.4%
with the identical feature set.

Halving both noise sources (0.22->0.13, 0.35/0.45->0.18/0.22) preserves
real class overlap (Moderate F1 is still the weakest at 0.71 -- it is
NOT perfectly separable) while letting the genuine locality/time signal
that was already there come through. Class balance stayed close to
target (~37/33/30) after the change, confirmed empirically not assumed.
