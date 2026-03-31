// ─────────────────────────────────────────────────────────────────────────────
// DISTRIBUTION DATABASE
// 38 core distributions across 8 families
// Each entry: metadata, card stats, parameter specs, PDF/PMF function,
//             plain-English story, assumptions, use cases, failure modes,
//             related distributions, Wikipedia slug
// ─────────────────────────────────────────────────────────────────────────────

export const FAMILIES = [
  { id: "discrete_bounded",   label: "Discrete · Bounded",          color: "#4fffb0", icon: "⬡" },
  { id: "discrete_count",     label: "Discrete · Counts & Events",  color: "#60a5fa", icon: "ℕ" },
  { id: "continuous_bounded", label: "Continuous · Bounded [0,1]",  color: "#f472b6", icon: "%" },
  { id: "continuous_positive",label: "Continuous · Positive ℝ⁺",   color: "#fb923c", icon: "∿" },
  { id: "continuous_real",    label: "Continuous · All of ℝ",       color: "#a78bfa", icon: "∞" },
  { id: "survival",           label: "Survival & Reliability",       color: "#34d399", icon: "⏱" },
  { id: "extreme_value",      label: "Extreme Value",               color: "#fbbf24", icon: "⚡" },
  { id: "multivariate",       label: "Multivariate",                color: "#f87171", icon: "⊞" },
];

// pdf(x, params) → number   (for continuous)
// pmf(k, params) → number   (for discrete)
// support: [min, max, step] for slider generation

export const DISTRIBUTIONS = [

  // ══════════════════════════════════════════════════════════
  // DISCRETE BOUNDED
  // ══════════════════════════════════════════════════════════
  {
    id: "bernoulli",
    name: "Bernoulli",
    family: "discrete_bounded",
    type: "discrete",
    tagline: "A single yes/no trial",
    wikiSlug: "Bernoulli_distribution",
    presets: [
      { label: "Fair coin", params: { p: 0.5 } },
      { label: "Rare event", params: { p: 0.1 } },
      { label: "Likely event", params: { p: 0.8 } },
    ],
    params: [
      { name: "p", label: "Success probability p", min: 0.01, max: 0.99, step: 0.01, default: 0.3, desc: "P(X=1)" },
    ],
    support: "x ∈ {0, 1}",
    supportFn: (p) => [0, 1],
    pmf: (k, { p }) => k === 1 ? p : k === 0 ? 1 - p : 0,
    pdfPoints: ({ p }) => [
      { x: 0, y: 1 - p, label: "0" },
      { x: 1, y: p, label: "1" },
    ],
    stats: {
      mean:     ({ p }) => p,
      variance: ({ p }) => p * (1 - p),
      skewness: ({ p }) => (1 - 2 * p) / Math.sqrt(p * (1 - p)),
      kurtosis: ({ p }) => (1 - 6 * p * (1 - p)) / (p * (1 - p)),
    },
    formulas: {
      pmf:  "P(X=k) = p^k (1−p)^{1−k},\\; k \\in \\{0,1\\}",
      mean: "p",
      var:  "p(1-p)",
      skew: "\\frac{1-2p}{\\sqrt{p(1-p)}}",
      mgf:  "1 - p + pe^t",
      pgf:  "1 - p + pz",
      cf:   "1 - p + pe^{it}",
    },
    story: "The simplest possible random experiment: flip a coin, make a sale, detect a defect. One trial, two outcomes. Everything else in discrete probability is built on top of this.",
    assumptions: [
      "Exactly two mutually exclusive outcomes (success/failure)",
      "Fixed, known probability of success p",
      "Single trial only",
    ],
    useCases: [
      "Modeling whether a single customer converts (p = conversion rate)",
      "Binary feature in a Bayesian model (clicked / didn't click)",
      "One inspection outcome: defective or not",
      "Building block for Binomial (sum of n Bernoulli trials)",
    ],
    failureModes: [
      { condition: "n repeated trials", use: "Binomial distribution" },
      { condition: "p varies per trial", use: "Poisson Binomial distribution" },
      { condition: "Continuous outcome", use: "Beta distribution (if proportion)" },
    ],
    related: ["binomial", "beta", "geometric"],
  },

  {
    id: "binomial",
    name: "Binomial",
    family: "discrete_bounded",
    type: "discrete",
    tagline: "Count of successes in n independent trials",
    wikiSlug: "Binomial_distribution",
    presets: [
      { label: "20 trials, 30% chance", params: { n: 20, p: 0.3 } },
      { label: "Fair coin 10×", params: { n: 10, p: 0.5 } },
      { label: "Rare event 100×", params: { n: 100, p: 0.05 } },
    ],
    params: [
      { name: "n", label: "Number of trials n", min: 1, max: 50, step: 1, default: 20, desc: "Total trials" },
      { name: "p", label: "Success probability p", min: 0.01, max: 0.99, step: 0.01, default: 0.3, desc: "P(success per trial)" },
    ],
    support: "k ∈ {0, 1, …, n}",
    supportFn: ({ n }) => [0, n],
    pmf: (k, { n, p }) => {
      if (k < 0 || k > n || !Number.isInteger(k)) return 0;
      const logBinom = logFactorial(n) - logFactorial(k) - logFactorial(n - k);
      return Math.exp(logBinom + k * Math.log(p) + (n - k) * Math.log(1 - p));
    },
    pdfPoints: ({ n, p }) => Array.from({ length: n + 1 }, (_, k) => {
      const lf = logFactorial(n) - logFactorial(k) - logFactorial(n - k);
      return { x: k, y: Math.exp(lf + k * Math.log(p) + (n - k) * Math.log(1 - p)) };
    }),
    stats: {
      mean:     ({ n, p }) => n * p,
      variance: ({ n, p }) => n * p * (1 - p),
      skewness: ({ n, p }) => (1 - 2 * p) / Math.sqrt(n * p * (1 - p)),
      kurtosis: ({ n, p }) => (1 - 6 * p * (1 - p)) / (n * p * (1 - p)),
    },
    formulas: {
      pmf:  "P(X=k) = \\binom{n}{k} p^k (1-p)^{n-k}",
      mean: "np",
      var:  "np(1-p)",
      skew: "\\frac{1-2p}{\\sqrt{np(1-p)}}",
      mgf:  "(1-p+pe^t)^n",
      pgf:  "(1-p+pz)^n",
      cf:   "(1-p+pe^{it})^n",
    },
    story: "Repeat a Bernoulli trial n times independently. Count the successes. The binomial tells you the probability of getting exactly k successes out of n tries.",
    assumptions: [
      "Fixed number of trials n",
      "Each trial is independent",
      "Constant probability of success p across all trials",
      "Only two outcomes per trial",
    ],
    useCases: [
      "A/B test: how many of n visitors convert?",
      "Quality control: how many defects in a batch of n items?",
      "Credit risk: how many of n loans default?",
      "Email campaign: how many of n recipients click?",
    ],
    failureModes: [
      { condition: "p differs per trial", use: "Poisson Binomial" },
      { condition: "Sampling without replacement", use: "Hypergeometric distribution" },
      { condition: "n large, p small, np moderate", use: "Poisson approximation" },
      { condition: "Overdispersed counts (extra variance)", use: "Beta-Binomial distribution" },
    ],
    related: ["bernoulli", "hypergeometric", "poisson", "beta_binomial", "negative_binomial"],
  },

  {
    id: "hypergeometric",
    name: "Hypergeometric",
    family: "discrete_bounded",
    type: "discrete",
    tagline: "Successes when sampling without replacement",
    wikiSlug: "Hypergeometric_distribution",
    presets: [
      { label: "Audit sample", params: { N: 100, K: 20, n: 15 } },
      { label: "Card hand", params: { N: 52, K: 13, n: 5 } },
      { label: "Quality control", params: { N: 50, K: 5, n: 10 } },
    ],
    params: [
      { name: "N", label: "Population size N", min: 10, max: 100, step: 1, default: 50, desc: "Total population" },
      { name: "K", label: "Success states K", min: 1, max: 49, step: 1, default: 15, desc: "Total successes in population" },
      { name: "n", label: "Draws n", min: 1, max: 30, step: 1, default: 10, desc: "Number of draws" },
    ],
    support: "k ∈ {max(0,n+K−N), …, min(n,K)}",
    supportFn: ({ N, K, n }) => [Math.max(0, n + K - N), Math.min(n, K)],
    pmf: (k, { N, K, n }) => {
      if (k < Math.max(0, n + K - N) || k > Math.min(n, K)) return 0;
      return Math.exp(
        logBinomCoeff(K, k) + logBinomCoeff(N - K, n - k) - logBinomCoeff(N, n)
      );
    },
    pdfPoints: ({ N, K, n }) => {
      const lo = Math.max(0, n + K - N), hi = Math.min(n, K);
      return Array.from({ length: hi - lo + 1 }, (_, i) => {
        const k = lo + i;
        return { x: k, y: Math.exp(logBinomCoeff(K, k) + logBinomCoeff(N - K, n - k) - logBinomCoeff(N, n)) };
      });
    },
    stats: {
      mean:     ({ N, K, n }) => n * K / N,
      variance: ({ N, K, n }) => n * (K / N) * (1 - K / N) * (N - n) / (N - 1),
      skewness: ({ N, K, n }) => {
        const p = K / N;
        return (N - 2 * K) * Math.sqrt(N - 1) * (N - 2 * n) /
               (Math.sqrt(n * K * (N - K) * (N - n)) * (N - 2));
      },
      kurtosis: () => NaN,
    },
    formulas: {
      pmf:  "P(X=k) = \\frac{\\binom{K}{k}\\binom{N-K}{n-k}}{\\binom{N}{n}}",
      mean: "n \\frac{K}{N}",
      var:  "n\\frac{K}{N}\\frac{N-K}{N}\\frac{N-n}{N-1}",
      skew: "\\frac{(N-2K)\\sqrt{N-1}(N-2n)}{\\sqrt{nK(N-K)(N-n)}(N-2)}",
      mgf:  "\\text{(hypergeometric function — complex form)}",
      pgf:  "{}_2F_1(-n,-K;N-K-n+1;z)",
      cf:   "{}_2F_1(-n,-K;N-K-n+1;e^{it})",
    },
    story: "You have a bag of N marbles: K red and N−K blue. Draw n without replacement. How many red do you get? Unlike Binomial, the draws are NOT independent — drawing a red marble changes the odds for the next draw.",
    assumptions: [
      "Finite population of size N",
      "Sampling without replacement",
      "Exactly K items have the property of interest",
      "Draw exactly n items",
    ],
    useCases: [
      "Audit sampling: K defective items in batch of N, sample n — how many defects found?",
      "Drug trial: K patients respond to treatment in N total, select n for follow-up",
      "Card games: probability of getting k aces in a hand of n cards",
      "Genomics: over-representation of a gene set in a pathway (Fisher's exact test uses this)",
    ],
    failureModes: [
      { condition: "Sampling with replacement", use: "Binomial distribution" },
      { condition: "Population is very large (N >> n)", use: "Binomial approximation (p = K/N)" },
    ],
    related: ["binomial", "bernoulli"],
  },

  {
    id: "beta_binomial",
    name: "Beta-Binomial",
    family: "discrete_bounded",
    type: "discrete",
    tagline: "Binomial with random success probability",
    wikiSlug: "Beta-binomial_distribution",
    presets: [
      { label: "Overdispersed counts", params: { n: 20, alpha: 2, beta_: 5 } },
      { label: "Near-Binomial", params: { n: 20, alpha: 10, beta_: 10 } },
      { label: "Bimodal", params: { n: 20, alpha: 0.5, beta_: 0.5 } },
    ],
    params: [
      { name: "n", label: "Trials n", min: 1, max: 40, step: 1, default: 20, desc: "Number of trials" },
      { name: "alpha", label: "α (successes prior)", min: 0.1, max: 20, step: 0.1, default: 2, desc: "Beta shape α" },
      { name: "beta_",  label: "β (failures prior)",  min: 0.1, max: 20, step: 0.1, default: 5, desc: "Beta shape β" },
    ],
    support: "k ∈ {0, 1, …, n}",
    supportFn: ({ n }) => [0, n],
    pmf: (k, { n, alpha, beta_ }) => {
      if (k < 0 || k > n) return 0;
      return Math.exp(
        logBinomCoeff(n, k) + logBeta(k + alpha, n - k + beta_) - logBeta(alpha, beta_)
      );
    },
    pdfPoints: ({ n, alpha, beta_ }) =>
      Array.from({ length: n + 1 }, (_, k) => ({
        x: k,
        y: Math.exp(logBinomCoeff(n, k) + logBeta(k + alpha, n - k + beta_) - logBeta(alpha, beta_)),
      })),
    stats: {
      mean:     ({ n, alpha, beta_ }) => n * alpha / (alpha + beta_),
      variance: ({ n, alpha, beta_ }) => n * alpha * beta_ * (alpha + beta_ + n) / (Math.pow((alpha + beta_),2) * (alpha + beta_ + 1)),
      skewness: () => NaN,
      kurtosis: () => NaN,
    },
    formulas: {
      pmf:  "P(X=k)=\\binom{n}{k}\\frac{B(k+\\alpha,n-k+\\beta)}{B(\\alpha,\\beta)}",
      mean: "\\frac{n\\alpha}{\\alpha+\\beta}",
      var:  "\\frac{n\\alpha\\beta(\\alpha+\\beta+n)}{(\\alpha+\\beta)^2(\\alpha+\\beta+1)}",
      skew: "\\text{(complex — see Wikipedia)}",
      mgf:  "\\text{(hypergeometric function)}",
      pgf:  "\\text{(hypergeometric function)}",
      cf:   "\\text{(hypergeometric function)}",
    },
    story: "A Binomial where p isn't fixed — it's itself drawn from a Beta distribution each time. Models heterogeneity across groups. Think: conversion rate that varies by customer segment, or default rate that varies by loan officer.",
    assumptions: [
      "n trials per observation",
      "Success probability p is random, drawn from Beta(α, β)",
      "Given p, trials are independent Bernoulli",
      "Overdispersed relative to Binomial (extra variance from random p)",
    ],
    useCases: [
      "Bayesian A/B testing: posterior on click rates with uncertainty in p",
      "Credit risk: default rates that vary across loan cohorts",
      "Overdispersed count data where Binomial underfits",
      "Hierarchical models with group-level variation in proportions",
    ],
    failureModes: [
      { condition: "p is truly fixed", use: "Binomial distribution" },
      { condition: "Unbounded counts", use: "Negative Binomial distribution" },
    ],
    related: ["binomial", "beta", "bernoulli"],
  },

  // ══════════════════════════════════════════════════════════
  // DISCRETE COUNTS
  // ══════════════════════════════════════════════════════════
  {
    id: "poisson",
    name: "Poisson",
    family: "discrete_count",
    type: "discrete",
    tagline: "Count of rare independent events in fixed time/space",
    wikiSlug: "Poisson_distribution",
    presets: [
      { label: "Rare events (λ=1)", params: { lambda: 1 } },
      { label: "Moderate (λ=5)", params: { lambda: 5 } },
      { label: "Frequent (λ=15)", params: { lambda: 15 } },
    ],
    params: [
      { name: "lambda", label: "Rate λ", min: 0.1, max: 20, step: 0.1, default: 3, desc: "Average event count" },
    ],
    support: "k ∈ {0, 1, 2, …}",
    supportFn: ({ lambda }) => [0, Math.max(20, Math.ceil(lambda + 4 * Math.sqrt(lambda)))],
    pmf: (k, { lambda }) => k < 0 ? 0 : Math.exp(-lambda + k * Math.log(lambda) - logFactorial(k)),
    pdfPoints: ({ lambda }) => {
      const hi = Math.max(20, Math.ceil(lambda + 4 * Math.sqrt(lambda)));
      return Array.from({ length: hi + 1 }, (_, k) => ({
        x: k, y: Math.exp(-lambda + k * Math.log(lambda) - logFactorial(k)),
      }));
    },
    stats: {
      mean:     ({ lambda }) => lambda,
      variance: ({ lambda }) => lambda,
      skewness: ({ lambda }) => 1 / Math.sqrt(lambda),
      kurtosis: ({ lambda }) => 1 / lambda,
    },
    formulas: {
      pmf:  "P(X=k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}",
      mean: "\\lambda",
      var:  "\\lambda",
      skew: "\\lambda^{-1/2}",
      mgf:  "e^{\\lambda(e^t - 1)}",
      pgf:  "e^{\\lambda(z-1)}",
      cf:   "e^{\\lambda(e^{it}-1)}",
    },
    story: "Events arrive randomly and independently at a constant average rate λ. Count how many arrive in a fixed window. The key property: mean equals variance. If they differ substantially in your data, Poisson is misspecified.",
    assumptions: [
      "Events are independent of each other",
      "Average rate λ is constant over the observation window",
      "Two events cannot occur at the exact same instant",
      "Mean ≈ Variance (equidispersion)",
    ],
    useCases: [
      "Website visits per hour (if traffic is steady)",
      "Number of insurance claims per month",
      "Call center arrivals per shift",
      "Defects per unit of manufactured product",
      "Rare disease incidence in a region",
    ],
    failureModes: [
      { condition: "Variance >> Mean (overdispersion)", use: "Negative Binomial distribution" },
      { condition: "Variance << Mean (underdispersion)", use: "Conway-Maxwell-Poisson" },
      { condition: "Excess zeros beyond Poisson rate", use: "Zero-Inflated Poisson (ZIP)" },
      { condition: "Rate varies over time/space", use: "Inhomogeneous Poisson Process" },
    ],
    related: ["negative_binomial", "binomial", "exponential", "gamma"],
  },

  {
    id: "negative_binomial",
    name: "Negative Binomial",
    family: "discrete_count",
    type: "discrete",
    tagline: "Overdispersed counts — Poisson with extra variance",
    wikiSlug: "Negative_binomial_distribution",
    presets: [
      { label: "Mild overdispersion", params: { r: 5, p: 0.5 } },
      { label: "Heavy overdispersion", params: { r: 1, p: 0.3 } },
      { label: "Near-Poisson", params: { r: 20, p: 0.5 } },
    ],
    params: [
      { name: "r", label: "Dispersion r", min: 0.1, max: 20, step: 0.1, default: 3, desc: "Number of successes (can be non-integer)" },
      { name: "p", label: "Success probability p", min: 0.01, max: 0.99, step: 0.01, default: 0.4, desc: "P(success) per trial" },
    ],
    support: "k ∈ {0, 1, 2, …}",
    supportFn: ({ r, p }) => [0, Math.ceil(r * (1 - p) / p + 5 * Math.sqrt(r * (1 - p) / Math.pow(p,2)))],
    pmf: (k, { r, p }) => {
      if (k < 0) return 0;
      return Math.exp(logGamma(r + k) - logFactorial(k) - logGamma(r) + r * Math.log(p) + k * Math.log(1 - p));
    },
    pdfPoints: ({ r, p }) => {
      const hi = Math.ceil(r * (1 - p) / p + 5 * Math.sqrt(r * (1 - p) / Math.pow(p,2)));
      return Array.from({ length: Math.min(hi, 60) + 1 }, (_, k) => ({
        x: k,
        y: Math.exp(logGamma(r + k) - logFactorial(k) - logGamma(r) + r * Math.log(p) + k * Math.log(1 - p)),
      }));
    },
    stats: {
      mean:     ({ r, p }) => r * (1 - p) / p,
      variance: ({ r, p }) => r * (1 - p) / Math.pow(p,2),
      skewness: ({ r, p }) => (2 - p) / Math.sqrt(r * (1 - p)),
      kurtosis: ({ r, p }) => (Math.pow(p,2) + 6 * (1 - p)) / (r * (1 - p)),
    },
    formulas: {
      pmf:  "P(X=k)=\\binom{k+r-1}{k}p^r(1-p)^k",
      mean: "\\frac{r(1-p)}{p}",
      var:  "\\frac{r(1-p)}{p^2}",
      skew: "\\frac{2-p}{\\sqrt{r(1-p)}}",
      mgf:  "\\left(\\frac{p}{1-(1-p)e^t}\\right)^r",
      pgf:  "\\left(\\frac{p}{1-(1-p)z}\\right)^r",
      cf:   "\\left(\\frac{p}{1-(1-p)e^{it}}\\right)^r",
    },
    story: "Poisson assumes mean = variance. Real count data almost always has variance > mean (overdispersion). Negative Binomial adds a dispersion parameter r that lets variance exceed the mean. It's the go-to for counts in social sciences, ecology, finance, and healthcare.",
    assumptions: [
      "Non-negative integer counts",
      "Variance > Mean (overdispersion present)",
      "Can be derived as a Poisson with Gamma-distributed rate (Poisson-Gamma mixture)",
    ],
    useCases: [
      "Number of transactions per customer per month (highly overdispersed)",
      "Hospital readmissions per patient (some patients readmit many times)",
      "Insurance claims per policyholder",
      "Social media posts per user (power-law-like behaviour)",
      "RNA-seq gene expression counts in bioinformatics",
    ],
    failureModes: [
      { condition: "Mean ≈ Variance", use: "Poisson is sufficient" },
      { condition: "Excess structural zeros", use: "Zero-Inflated Negative Binomial (ZINB)" },
    ],
    related: ["poisson", "geometric", "gamma"],
  },

  {
    id: "geometric",
    name: "Geometric",
    family: "discrete_count",
    type: "discrete",
    tagline: "Number of trials until first success",
    wikiSlug: "Geometric_distribution",
    presets: [
      { label: "Likely success", params: { p: 0.5 } },
      { label: "Rare success", params: { p: 0.1 } },
      { label: "Very rare", params: { p: 0.05 } },
    ],
    params: [
      { name: "p", label: "Success probability p", min: 0.01, max: 0.99, step: 0.01, default: 0.3, desc: "P(success) per trial" },
    ],
    support: "k ∈ {1, 2, 3, …}",
    supportFn: ({ p }) => [1, Math.ceil(1 / p + 5 / p)],
    pmf: (k, { p }) => k < 1 ? 0 : Math.pow(1 - p, k - 1) * p,
    pdfPoints: ({ p }) => {
      const hi = Math.min(Math.ceil(1 / p + 5 / p), 50);
      return Array.from({ length: hi }, (_, i) => ({
        x: i + 1, y: Math.pow(1 - p, i) * p,
      }));
    },
    stats: {
      mean:     ({ p }) => 1 / p,
      variance: ({ p }) => (1 - p) / Math.pow(p,2),
      skewness: ({ p }) => (2 - p) / Math.sqrt(1 - p),
      kurtosis: ({ p }) => (Math.pow(p,2) - 6 * p + 6) / (1 - p),
    },
    formulas: {
      pmf:  "P(X=k) = (1-p)^{k-1}p,\\; k=1,2,\\ldots",
      mean: "\\frac{1}{p}",
      var:  "\\frac{1-p}{p^2}",
      skew: "\\frac{2-p}{\\sqrt{1-p}}",
      mgf:  "\\frac{pe^t}{1-(1-p)e^t},\\; t<-\\ln(1-p)",
      pgf:  "\\frac{pz}{1-(1-p)z}",
      cf:   "\\frac{pe^{it}}{1-(1-p)e^{it}}",
    },
    story: "Keep flipping a biased coin (P(heads)=p) until you get heads. The Geometric distribution tells you the probability that you need exactly k flips. It's the discrete analogue of the Exponential and shares its memoryless property.",
    assumptions: [
      "Trials are independent Bernoulli experiments",
      "Constant probability p of success on each trial",
      "Counting the trial on which the first success occurs",
      "Memoryless: P(X > m+n | X > m) = P(X > n)",
    ],
    useCases: [
      "How many cold calls until a sale?",
      "How many loan applications until first default?",
      "Waiting time (in discrete steps) for a rare event",
      "Network packet retransmission attempts",
    ],
    failureModes: [
      { condition: "Waiting for kth success (not first)", use: "Negative Binomial distribution" },
      { condition: "Continuous waiting time", use: "Exponential distribution" },
    ],
    related: ["negative_binomial", "exponential", "bernoulli"],
  },

  // ══════════════════════════════════════════════════════════
  // CONTINUOUS BOUNDED [0,1]
  // ══════════════════════════════════════════════════════════
  {
    id: "beta",
    name: "Beta",
    family: "continuous_bounded",
    type: "continuous",
    tagline: "Probability of a probability — models rates and proportions",
    wikiSlug: "Beta_distribution",
    presets: [
      { label: "Uniform prior", params: { alpha: 1, beta_: 1 } },
      { label: "Peaked at 0.3", params: { alpha: 3, beta_: 7 } },
      { label: "U-shaped (bimodal)", params: { alpha: 0.5, beta_: 0.5 } },
      { label: "Right-skewed", params: { alpha: 1, beta_: 4 } },
    ],
    params: [
      { name: "alpha", label: "α (shape)", min: 0.1, max: 10, step: 0.1, default: 2, desc: "Prior successes + 1" },
      { name: "beta_",  label: "β (shape)", min: 0.1, max: 10, step: 0.1, default: 5, desc: "Prior failures + 1" },
    ],
    support: "x ∈ (0, 1)",
    supportFn: () => [0.001, 0.999],
    pdf: (x, { alpha, beta_ }) => {
      if (x <= 0 || x >= 1) return 0;
      return Math.exp((alpha - 1) * Math.log(x) + (beta_ - 1) * Math.log(1 - x) - logBeta(alpha, beta_));
    },
    pdfPoints: ({ alpha, beta_ }) =>
      Array.from({ length: 200 }, (_, i) => {
        const x = 0.005 + i * 0.99 / 199;
        const y = Math.exp((alpha - 1) * Math.log(x) + (beta_ - 1) * Math.log(1 - x) - logBeta(alpha, beta_));
        return { x: parseFloat(x.toFixed(3)), y: isFinite(y) ? Math.min(y, 20) : 0 };
      }),
    stats: {
      mean:     ({ alpha, beta_ }) => alpha / (alpha + beta_),
      variance: ({ alpha, beta_ }) => alpha * beta_ / (Math.pow((alpha + beta_),2) * (alpha + beta_ + 1)),
      skewness: ({ alpha, beta_ }) => 2 * (beta_ - alpha) * Math.sqrt(alpha + beta_ + 1) / ((alpha + beta_ + 2) * Math.sqrt(alpha * beta_)),
      kurtosis: ({ alpha, beta_ }) => 6 * (Math.pow((alpha - beta_),2) * (alpha + beta_ + 1) - alpha * beta_ * (alpha + beta_ + 2)) / (alpha * beta_ * (alpha + beta_ + 2) * (alpha + beta_ + 3)),
    },
    formulas: {
      pdf:  "f(x)=\\frac{x^{\\alpha-1}(1-x)^{\\beta-1}}{B(\\alpha,\\beta)},\\; x\\in(0,1)",
      mean: "\\frac{\\alpha}{\\alpha+\\beta}",
      var:  "\\frac{\\alpha\\beta}{(\\alpha+\\beta)^2(\\alpha+\\beta+1)}",
      skew: "\\frac{2(\\beta-\\alpha)\\sqrt{\\alpha+\\beta+1}}{(\\alpha+\\beta+2)\\sqrt{\\alpha\\beta}}",
      mgf:  "1 + \\sum_{k=1}^\\infty \\left(\\prod_{r=0}^{k-1}\\frac{\\alpha+r}{\\alpha+\\beta+r}\\right)\\frac{t^k}{k!}",
      cf:   "{}_1F_1(\\alpha;\\alpha+\\beta;it)",
      pgf:  "\\text{N/A (continuous)}",
    },
    story: "The Beta distribution lives on [0,1] and is the natural distribution for a probability or proportion. α−1 encodes 'prior successes' and β−1 encodes 'prior failures'. α=β=1 is flat (uniform — complete ignorance). α=β>1 is symmetric bell-shaped. α≠β is skewed.",
    assumptions: [
      "Variable must lie strictly in (0,1)",
      "Models a proportion, rate, or probability",
      "Two shape parameters α and β control location and concentration",
      "Conjugate prior for the Binomial likelihood",
    ],
    useCases: [
      "Bayesian A/B testing: prior and posterior on conversion rates",
      "Modeling conversion rates, click-through rates, default rates",
      "Beta Regression for bounded continuous outcomes",
      "Prior distribution for p in a Binomial model",
      "Modeling task completion rates, satisfaction scores (0–1)",
    ],
    failureModes: [
      { condition: "Values include exact 0 or 1", use: "Zero-one-inflated Beta model" },
      { condition: "Data is not bounded in [0,1]", use: "Normal or Log-Normal" },
      { condition: "Integer counts of successes/failures", use: "Beta-Binomial distribution" },
    ],
    related: ["beta_binomial", "uniform_cont", "bernoulli", "dirichlet"],
  },

  {
    id: "uniform_cont",
    name: "Uniform (Continuous)",
    family: "continuous_bounded",
    type: "continuous",
    tagline: "All values in an interval equally likely",
    wikiSlug: "Continuous_uniform_distribution",
    presets: [
      { label: "Unit interval [0,1]", params: { a: 0, b: 1 } },
      { label: "Standard dice [1,6]", params: { a: 1, b: 6 } },
      { label: "Probability prior", params: { a: 0, b: 1 } },
    ],
    params: [
      { name: "a", label: "Lower bound a", min: -10, max: 0, step: 0.5, default: 0, desc: "Minimum value" },
      { name: "b", label: "Upper bound b", min: 0.5, max: 10, step: 0.5, default: 1, desc: "Maximum value" },
    ],
    support: "x ∈ [a, b]",
    supportFn: ({ a, b }) => [a, b],
    pdf: (x, { a, b }) => (x >= a && x <= b) ? 1 / (b - a) : 0,
    pdfPoints: ({ a, b }) => {
      const h = 1 / (b - a);
      const pad = (b - a) * 0.1;
      return [
        { x: a - pad, y: 0 }, { x: a, y: 0 }, { x: a, y: h },
        { x: b, y: h }, { x: b, y: 0 }, { x: b + pad, y: 0 },
      ];
    },
    stats: {
      mean:     ({ a, b }) => (a + b) / 2,
      variance: ({ a, b }) => Math.pow((b - a),2) / 12,
      skewness: () => 0,
      kurtosis: () => -1.2,
    },
    formulas: {
      pdf:  "f(x) = \\frac{1}{b-a},\\; x\\in[a,b]",
      mean: "\\frac{a+b}{2}",
      var:  "\\frac{(b-a)^2}{12}",
      skew: "0",
      mgf:  "\\frac{e^{tb}-e^{ta}}{t(b-a)}",
      cf:   "\\frac{e^{itb}-e^{ita}}{it(b-a)}",
      pgf:  "\\text{N/A (continuous)}",
    },
    story: "Maximum entropy distribution for a bounded variable when you know nothing except the range. Every value in [a,b] is exactly equally likely. Often used as a non-informative prior, or to generate random inputs for simulation.",
    assumptions: [
      "Variable is bounded below by a and above by b",
      "All values in [a,b] are equally probable",
      "No additional information about the distribution within the range",
    ],
    useCases: [
      "Non-informative prior in Bayesian models",
      "Simulation of random inputs with known bounds",
      "Rounding error modeling (±0.5 unit)",
      "Random number generation seed",
    ],
    failureModes: [
      { condition: "Some values more likely than others", use: "Beta, Triangular, or fitted distribution" },
      { condition: "Unbounded range", use: "Normal or other unbounded distribution" },
    ],
    related: ["beta", "triangular"],
  },

  // ══════════════════════════════════════════════════════════
  // CONTINUOUS POSITIVE
  // ══════════════════════════════════════════════════════════
  {
    id: "exponential",
    name: "Exponential",
    family: "continuous_positive",
    type: "continuous",
    tagline: "Time between independent events at constant rate",
    wikiSlug: "Exponential_distribution",
    presets: [
      { label: "Fast decay (λ=2)", params: { lambda: 2 } },
      { label: "Standard (λ=1)", params: { lambda: 1 } },
      { label: "Slow decay (λ=0.3)", params: { lambda: 0.3 } },
    ],
    params: [
      { name: "lambda", label: "Rate λ", min: 0.1, max: 5, step: 0.1, default: 1, desc: "Events per unit time" },
    ],
    support: "x ≥ 0",
    supportFn: () => [0, null],
    pdf: (x, { lambda }) => x < 0 ? 0 : lambda * Math.exp(-lambda * x),
    pdfPoints: ({ lambda }) => {
      const hi = 5 / lambda;
      return Array.from({ length: 200 }, (_, i) => {
        const x = i * hi / 199;
        return { x: parseFloat(x.toFixed(3)), y: lambda * Math.exp(-lambda * x) };
      });
    },
    stats: {
      mean:     ({ lambda }) => 1 / lambda,
      variance: ({ lambda }) => 1 / Math.pow(lambda,2),
      skewness: () => 2,
      kurtosis: () => 6,
    },
    formulas: {
      pdf:  "f(x) = \\lambda e^{-\\lambda x},\\; x\\ge 0",
      mean: "\\frac{1}{\\lambda}",
      var:  "\\frac{1}{\\lambda^2}",
      skew: "2",
      mgf:  "\\frac{\\lambda}{\\lambda - t},\\; t<\\lambda",
      cf:   "\\frac{\\lambda}{\\lambda - it}",
      pgf:  "\\text{N/A (continuous)}",
    },
    story: "The continuous counterpart of the Geometric distribution. Memoryless: knowing you've waited x minutes doesn't change the distribution of remaining wait time. The unique continuous memoryless distribution.",
    assumptions: [
      "Events occur at a constant average rate λ",
      "Events are independent",
      "Memoryless property: P(X > s+t | X > s) = P(X > t)",
      "Cannot model increasing or decreasing hazard rates",
    ],
    useCases: [
      "Time between customer arrivals at a store",
      "Time between network packet arrivals",
      "Survival analysis baseline (constant hazard)",
      "Time between machine failures (if constant failure rate)",
      "Inter-transaction time for a Poisson process",
    ],
    failureModes: [
      { condition: "Hazard rate is not constant", use: "Weibull distribution" },
      { condition: "Modeling sum of k exponential waiting times", use: "Gamma (Erlang) distribution" },
      { condition: "Heavy-tailed durations", use: "Pareto or Log-Normal" },
    ],
    related: ["gamma", "weibull", "poisson", "geometric"],
  },

  {
    id: "gamma",
    name: "Gamma",
    family: "continuous_positive",
    type: "continuous",
    tagline: "Sum of k exponential waiting times",
    wikiSlug: "Gamma_distribution",
    presets: [
      { label: "Exponential (k=1)", params: { k: 1, theta: 1 } },
      { label: "Moderate skew", params: { k: 3, theta: 2 } },
      { label: "Near-Normal", params: { k: 10, theta: 1 } },
      { label: "Erlang-4", params: { k: 4, theta: 1 } },
    ],
    params: [
      { name: "k", label: "Shape k", min: 0.1, max: 10, step: 0.1, default: 2, desc: "Number of events to wait for" },
      { name: "theta", label: "Scale θ", min: 0.1, max: 5, step: 0.1, default: 1, desc: "Mean time per event (1/λ)" },
    ],
    support: "x > 0",
    supportFn: ({ k, theta }) => [0, null],
    pdf: (x, { k, theta }) => {
      if (x <= 0) return 0;
      return Math.exp((k - 1) * Math.log(x) - x / theta - logGamma(k) - k * Math.log(theta));
    },
    pdfPoints: ({ k, theta }) => {
      const hi = (k + 4 * Math.sqrt(k)) * theta;
      return Array.from({ length: 200 }, (_, i) => {
        const x = 0.001 + i * hi / 199;
        const y = Math.exp((k - 1) * Math.log(x) - x / theta - logGamma(k) - k * Math.log(theta));
        return { x: parseFloat(x.toFixed(3)), y: isFinite(y) ? y : 0 };
      });
    },
    stats: {
      mean:     ({ k, theta }) => k * theta,
      variance: ({ k, theta }) => k * Math.pow(theta,2),
      skewness: ({ k }) => 2 / Math.sqrt(k),
      kurtosis: ({ k }) => 6 / k,
    },
    formulas: {
      pdf:  "f(x)=\\frac{x^{k-1}e^{-x/\\theta}}{\\theta^k\\Gamma(k)},\\; x>0",
      mean: "k\\theta",
      var:  "k\\theta^2",
      skew: "\\frac{2}{\\sqrt{k}}",
      mgf:  "(1-\\theta t)^{-k},\\; t<1/\\theta",
      cf:   "(1-i\\theta t)^{-k}",
      pgf:  "\\text{N/A (continuous)}",
    },
    story: "Wait for k independent exponential events each with rate 1/θ. The total wait time follows a Gamma distribution. When k is an integer, this is also called the Erlang distribution. As k → ∞, approaches Normal by CLT.",
    assumptions: [
      "Positive continuous data",
      "Can be right-skewed (especially for small k)",
      "Variance scales with square of mean (coefficient of variation = 1/√k)",
      "k=1 reduces to Exponential; integer k gives Erlang",
    ],
    useCases: [
      "Total waiting time for k service completions in a queue",
      "Insurance claim severity modeling",
      "Conjugate prior for Poisson rate λ in Bayesian models",
      "Rainfall amounts, income distributions (with shape fitting)",
      "Time to kth failure in reliability engineering",
    ],
    failureModes: [
      { condition: "Data has heavier tail than Gamma", use: "Log-Normal or Pareto" },
      { condition: "Data includes zeros", use: "Tweedie compound Poisson-Gamma" },
      { condition: "Non-monotone hazard rate", use: "Weibull distribution" },
    ],
    related: ["exponential", "log_normal", "chi_squared", "inverse_gamma", "weibull"],
  },

  {
    id: "log_normal",
    name: "Log-Normal",
    family: "continuous_positive",
    type: "continuous",
    tagline: "Product of many small positive multiplicative effects",
    wikiSlug: "Log-normal_distribution",
    presets: [
      { label: "Income-like", params: { mu: 1, sigma: 0.8 } },
      { label: "Mild skew", params: { mu: 0, sigma: 0.3 } },
      { label: "Heavy right tail", params: { mu: 0, sigma: 1.5 } },
    ],
    params: [
      { name: "mu",    label: "Log-mean μ",   min: -2,  max: 3,   step: 0.1, default: 0,   desc: "Mean of ln(X)" },
      { name: "sigma", label: "Log-std σ",    min: 0.1, max: 3,   step: 0.1, default: 0.5, desc: "Std dev of ln(X)" },
    ],
    support: "x > 0",
    supportFn: ({ mu, sigma }) => [0, null],
    pdf: (x, { mu, sigma }) => {
      if (x <= 0) return 0;
      return Math.exp(-0.5 * Math.pow((Math.log(x) - mu) / sigma, 2)) / (x * sigma * Math.sqrt(2 * Math.PI));
    },
    pdfPoints: ({ mu, sigma }) => {
      const hi = Math.exp(mu + 4 * sigma);
      return Array.from({ length: 200 }, (_, i) => {
        const x = 0.001 + i * hi / 199;
        const y = Math.exp(-0.5 * Math.pow((Math.log(x) - mu) / sigma, 2)) / (x * sigma * Math.sqrt(2 * Math.PI));
        return { x: parseFloat(x.toFixed(3)), y: isFinite(y) ? y : 0 };
      });
    },
    stats: {
      mean:     ({ mu, sigma }) => Math.exp(mu + Math.pow(sigma,2) / 2),
      variance: ({ mu, sigma }) => (Math.exp(Math.pow(sigma,2)) - 1) * Math.exp(2 * mu + Math.pow(sigma,2)),
      skewness: ({ sigma }) => (Math.exp(Math.pow(sigma,2)) + 2) * Math.sqrt(Math.exp(Math.pow(sigma,2)) - 1),
      kurtosis: ({ sigma }) => Math.exp(4 * Math.pow(sigma,2)) + 2 * Math.exp(3 * Math.pow(sigma,2)) + 3 * Math.exp(2 * Math.pow(sigma,2)) - 6,
    },
    formulas: {
      pdf:  "f(x)=\\frac{1}{x\\sigma\\sqrt{2\\pi}}e^{-\\frac{(\\ln x-\\mu)^2}{2\\sigma^2}}",
      mean: "e^{\\mu+\\sigma^2/2}",
      var:  "(e^{\\sigma^2}-1)e^{2\\mu+\\sigma^2}",
      skew: "(e^{\\sigma^2}+2)\\sqrt{e^{\\sigma^2}-1}",
      mgf:  "\\text{Does not exist for all } t",
      cf:   "\\text{(series expansion)}",
      pgf:  "\\text{N/A (continuous)}",
    },
    story: "If ln(X) ~ Normal(μ, σ²), then X ~ Log-Normal. Arises naturally when a quantity is the product of many small independent multiplicative factors — income, stock prices, city populations, company sizes. Right-skewed with a hard lower bound of zero.",
    assumptions: [
      "Variable is strictly positive",
      "The logarithm of the variable is approximately Normal",
      "Generated by multiplicative processes (not additive)",
      "Right-skewed; heavier right tail than Normal",
    ],
    useCases: [
      "Individual income or wealth distribution",
      "Asset prices and financial returns (over periods)",
      "Insurance claim amounts",
      "Biological measurements (cell sizes, concentrations)",
      "Loan balances, property values",
    ],
    failureModes: [
      { condition: "Even heavier right tail", use: "Pareto or Weibull distribution" },
      { condition: "Data can be zero or negative", use: "Normal distribution" },
      { condition: "Need to model the median precisely", use: "Fit on log-transformed data with Normal" },
    ],
    related: ["normal", "gamma", "pareto", "weibull"],
  },

  {
    id: "chi_squared",
    name: "Chi-Squared",
    family: "continuous_positive",
    type: "continuous",
    tagline: "Sum of squared standard normal variables",
    wikiSlug: "Chi-squared_distribution",
    presets: [
      { label: "1 df", params: { k: 1 } },
      { label: "5 df", params: { k: 5 } },
      { label: "10 df", params: { k: 10 } },
      { label: "20 df (near Normal)", params: { k: 20 } },
    ],
    params: [
      { name: "k", label: "Degrees of freedom k", min: 1, max: 20, step: 1, default: 3, desc: "Number of squared normals" },
    ],
    support: "x ≥ 0",
    supportFn: () => [0, null],
    pdf: (x, { k }) => {
      if (x <= 0) return 0;
      return Math.exp((k / 2 - 1) * Math.log(x) - x / 2 - (k / 2) * Math.log(2) - logGamma(k / 2));
    },
    pdfPoints: ({ k }) => {
      const hi = k + 5 * Math.sqrt(2 * k);
      return Array.from({ length: 200 }, (_, i) => {
        const x = 0.01 + i * hi / 199;
        const y = Math.exp((k / 2 - 1) * Math.log(x) - x / 2 - (k / 2) * Math.log(2) - logGamma(k / 2));
        return { x: parseFloat(x.toFixed(2)), y: isFinite(y) ? y : 0 };
      });
    },
    stats: {
      mean:     ({ k }) => k,
      variance: ({ k }) => 2 * k,
      skewness: ({ k }) => Math.sqrt(8 / k),
      kurtosis: ({ k }) => 12 / k,
    },
    formulas: {
      pdf:  "f(x)=\\frac{x^{k/2-1}e^{-x/2}}{2^{k/2}\\Gamma(k/2)},\\; x\\ge 0",
      mean: "k",
      var:  "2k",
      skew: "\\sqrt{8/k}",
      mgf:  "(1-2t)^{-k/2},\\; t<\\frac{1}{2}",
      cf:   "(1-2it)^{-k/2}",
      pgf:  "\\text{N/A (continuous)}",
    },
    story: "Square k independent standard normal variables and add them up. The result follows χ²(k). This is the distribution used to test whether observed frequencies match expected (goodness-of-fit), and whether two categorical variables are independent.",
    assumptions: [
      "Sum of k independent squared standard normal variables",
      "k degrees of freedom (positive integer)",
      "Special case of Gamma(k/2, 2)",
      "Approaches Normal as k → ∞",
    ],
    useCases: [
      "Chi-squared goodness-of-fit test statistic",
      "Chi-squared test of independence (contingency tables)",
      "Variance testing: (n-1)s²/σ² ~ χ²(n-1)",
      "Likelihood ratio test statistics",
      "Confidence intervals for variance",
    ],
    failureModes: [
      { condition: "Expected cell count < 5", use: "Fisher's Exact Test instead" },
      { condition: "Large df (> 30)", use: "Normal approximation √(2χ²) - √(2k-1) ~ N(0,1)" },
    ],
    related: ["gamma", "normal", "f_distribution", "student_t"],
  },

  // ══════════════════════════════════════════════════════════
  // CONTINUOUS REAL LINE
  // ══════════════════════════════════════════════════════════
  {
    id: "normal",
    name: "Normal (Gaussian)",
    family: "continuous_real",
    type: "continuous",
    tagline: "The universal distribution of sums and averages",
    wikiSlug: "Normal_distribution",
    presets: [
      { label: "Standard Normal", params: { mu: 0, sigma: 1 } },
      { label: "Shifted (μ=5)", params: { mu: 5, sigma: 1 } },
      { label: "Wide spread", params: { mu: 0, sigma: 3 } },
      { label: "Narrow spread", params: { mu: 0, sigma: 0.3 } },
    ],
    params: [
      { name: "mu",    label: "Mean μ",       min: -5,  max: 5,   step: 0.1, default: 0,   desc: "Location (center)" },
      { name: "sigma", label: "Std dev σ",    min: 0.1, max: 5,   step: 0.1, default: 1,   desc: "Scale (spread)" },
    ],
    support: "x ∈ (−∞, +∞)",
    supportFn: ({ mu, sigma }) => [mu - 4 * sigma, mu + 4 * sigma],
    pdf: (x, { mu, sigma }) =>
      Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2)) / (sigma * Math.sqrt(2 * Math.PI)),
    pdfPoints: ({ mu, sigma }) =>
      Array.from({ length: 200 }, (_, i) => {
        const x = mu - 4 * sigma + i * 8 * sigma / 199;
        return { x: parseFloat(x.toFixed(3)), y: Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2)) / (sigma * Math.sqrt(2 * Math.PI)) };
      }),
    stats: {
      mean:     ({ mu }) => mu,
      variance: ({ sigma }) => Math.pow(sigma,2),
      skewness: () => 0,
      kurtosis: () => 0,
    },
    formulas: {
      pdf:  "f(x)=\\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}",
      mean: "\\mu",
      var:  "\\sigma^2",
      skew: "0",
      mgf:  "e^{\\mu t + \\sigma^2 t^2/2}",
      cf:   "e^{i\\mu t - \\sigma^2 t^2/2}",
      pgf:  "\\text{N/A (continuous)}",
    },
    story: "The Central Limit Theorem: add up many independent random variables with finite mean and variance, and the sum approaches Normal regardless of the original distributions. This is why it's everywhere. Symmetric, unimodal, fully characterised by μ and σ.",
    assumptions: [
      "Symmetric distribution (skewness = 0)",
      "Unbounded support — negative values are possible",
      "Characterized entirely by mean and variance",
      "Appropriate when the data-generating process is additive (sum of many small effects)",
    ],
    useCases: [
      "Measurement errors (noise in sensors, instruments)",
      "Residuals in linear regression (OLS assumption)",
      "Heights, weights, test scores in large populations",
      "Financial returns over short periods (approximately)",
      "Any quantity that is a sum of many small independent effects",
    ],
    failureModes: [
      { condition: "Variable must be positive", use: "Log-Normal or Gamma distribution" },
      { condition: "Heavy tails / outliers", use: "Student's t-distribution" },
      { condition: "Right-skewed data", use: "Log-Normal, Gamma, or Weibull" },
      { condition: "Variable bounded in [0,1]", use: "Beta distribution" },
    ],
    related: ["student_t", "log_normal", "chi_squared", "laplace"],
  },

  {
    id: "student_t",
    name: "Student's t",
    family: "continuous_real",
    type: "continuous",
    tagline: "Normal with heavier tails — robust to outliers",
    wikiSlug: "Student%27s_t-distribution",
    presets: [
      { label: "Near-Normal (ν=30)", params: { nu: 30, mu: 0 } },
      { label: "Moderate tails (ν=5)", params: { nu: 5, mu: 0 } },
      { label: "Heavy tails (ν=2)", params: { nu: 2, mu: 0 } },
      { label: "Cauchy (ν=1)", params: { nu: 1, mu: 0 } },
    ],
    params: [
      { name: "nu",    label: "Degrees of freedom ν", min: 1, max: 30, step: 1, default: 5,   desc: "Controls tail heaviness" },
      { name: "mu",    label: "Location μ",           min: -3, max: 3, step: 0.1, default: 0, desc: "Center" },
    ],
    support: "x ∈ (−∞, +∞)",
    supportFn: ({ mu }) => [mu - 6, mu + 6],
    pdf: (x, { nu, mu }) => {
      const z = x - mu;
      return Math.exp(logGamma((nu + 1) / 2) - 0.5 * Math.log(nu * Math.PI) - logGamma(nu / 2) - ((nu + 1) / 2) * Math.log(1 + z * z / nu));
    },
    pdfPoints: ({ nu, mu }) =>
      Array.from({ length: 200 }, (_, i) => {
        const x = mu - 6 + i * 12 / 199;
        const z = x - mu;
        const y = Math.exp(logGamma((nu + 1) / 2) - 0.5 * Math.log(nu * Math.PI) - logGamma(nu / 2) - ((nu + 1) / 2) * Math.log(1 + z * z / nu));
        return { x: parseFloat(x.toFixed(3)), y };
      }),
    stats: {
      mean:     ({ nu, mu }) => nu > 1 ? mu : NaN,
      variance: ({ nu }) => nu > 2 ? nu / (nu - 2) : NaN,
      skewness: ({ nu }) => nu > 3 ? 0 : NaN,
      kurtosis: ({ nu }) => nu > 4 ? 6 / (nu - 4) : NaN,
    },
    formulas: {
      pdf:  "f(x)=\\frac{\\Gamma\\!\\left(\\frac{\\nu+1}{2}\\right)}{\\sqrt{\\nu\\pi}\\,\\Gamma\\!\\left(\\frac{\\nu}{2}\\right)}\\left(1+\\frac{x^2}{\\nu}\\right)^{\\!-\\frac{\\nu+1}{2}}",
      mean: "0 \\text{ (for } \\nu>1\\text{)}",
      var:  "\\frac{\\nu}{\\nu-2} \\text{ (for }\\nu>2\\text{)}",
      skew: "0 \\text{ (for }\\nu>3\\text{)}",
      mgf:  "\\text{Does not exist}",
      cf:   "\\frac{|t|^{\\nu/2}K_{\\nu/2}(\\sqrt{\\nu}|t|)}{\\Gamma(\\nu/2)2^{\\nu/2-1}}",
      pgf:  "\\text{N/A (continuous)}",
    },
    story: "Like Normal but with heavier tails controlled by ν degrees of freedom. As ν → ∞ it converges to Normal. ν=1 is the Cauchy (infinitely heavy tails, no mean). Used whenever you're estimating a mean with small samples, or want robustness to outliers.",
    assumptions: [
      "Symmetric around μ",
      "Heavier tails than Normal — probability of extreme values is higher",
      "ν controls tail heaviness: small ν = heavy tails",
      "ν > 1 for finite mean; ν > 2 for finite variance",
    ],
    useCases: [
      "Small-sample mean estimation (t-test)",
      "Bayesian regression with robust priors",
      "Financial returns with fat tails",
      "Outlier-robust regression (replacing Normal likelihood)",
    ],
    failureModes: [
      { condition: "ν is very large (> 30)", use: "Normal approximation is fine" },
      { condition: "Asymmetric data", use: "Skew-t or Skew-Normal" },
    ],
    related: ["normal", "cauchy", "f_distribution", "chi_squared"],
  },

  {
    id: "laplace",
    name: "Laplace",
    family: "continuous_real",
    type: "continuous",
    tagline: "Double exponential — sharper peak, heavier tails than Normal",
    wikiSlug: "Laplace_distribution",
    presets: [
      { label: "Standard Laplace", params: { mu: 0, b: 1 } },
      { label: "Lasso-like prior", params: { mu: 0, b: 0.5 } },
      { label: "Wide spread", params: { mu: 0, b: 3 } },
    ],
    params: [
      { name: "mu",  label: "Location μ", min: -3, max: 3, step: 0.1, default: 0,   desc: "Center / median" },
      { name: "b",   label: "Scale b",    min: 0.1, max: 5, step: 0.1, default: 1,  desc: "Controls spread" },
    ],
    support: "x ∈ (−∞, +∞)",
    supportFn: ({ mu, b }) => [mu - 6 * b, mu + 6 * b],
    pdf: (x, { mu, b }) => Math.exp(-Math.abs(x - mu) / b) / (2 * b),
    pdfPoints: ({ mu, b }) =>
      Array.from({ length: 200 }, (_, i) => {
        const x = mu - 6 * b + i * 12 * b / 199;
        return { x: parseFloat(x.toFixed(3)), y: Math.exp(-Math.abs(x - mu) / b) / (2 * b) };
      }),
    stats: {
      mean:     ({ mu }) => mu,
      variance: ({ b }) => 2 * Math.pow(b,2),
      skewness: () => 0,
      kurtosis: () => 3,
    },
    formulas: {
      pdf:  "f(x)=\\frac{1}{2b}e^{-|x-\\mu|/b}",
      mean: "\\mu",
      var:  "2b^2",
      skew: "0",
      mgf:  "\\frac{e^{\\mu t}}{1-b^2t^2},\\;|t|<1/b",
      cf:   "\\frac{e^{i\\mu t}}{1+b^2t^2}",
      pgf:  "\\text{N/A (continuous)}",
    },
    story: "Two Exponentials back-to-back, centered at μ. Sharper peak and heavier tails than Normal. MLE for the Laplace is minimising the sum of absolute errors (L1 loss), while Normal MLE minimises sum of squared errors (L2 loss). The connection to L1/Lasso regularisation is direct.",
    assumptions: [
      "Symmetric around μ",
      "Heavier tails than Normal (kurtosis = 6, excess = 3)",
      "Median = Mean = Mode = μ",
      "MLE ↔ L1 (median) regression",
    ],
    useCases: [
      "Lasso / L1 regularisation prior (Laplace prior on coefficients = Lasso penalty)",
      "Robust regression: minimises MAE instead of MSE",
      "Error distribution in audio / image compression (DCT coefficients)",
      "Sparse signal priors in signal processing",
    ],
    failureModes: [
      { condition: "Need MSE-optimal estimation", use: "Normal distribution" },
      { condition: "Even heavier tails needed", use: "Student's t or Cauchy" },
    ],
    related: ["normal", "exponential", "student_t"],
  },

  {
    id: "logistic",
    name: "Logistic",
    family: "continuous_real",
    type: "continuous",
    tagline: "S-curve CDF — used in classification probabilities",
    wikiSlug: "Logistic_distribution",
    presets: [
      { label: "Standard Logistic", params: { mu: 0, s: 1 } },
      { label: "Compressed", params: { mu: 0, s: 0.5 } },
      { label: "Spread out", params: { mu: 0, s: 3 } },
    ],
    params: [
      { name: "mu",  label: "Location μ", min: -3, max: 3, step: 0.1, default: 0,   desc: "Center" },
      { name: "s",   label: "Scale s",    min: 0.1, max: 5, step: 0.1, default: 1,  desc: "Spread" },
    ],
    support: "x ∈ (−∞, +∞)",
    supportFn: ({ mu, s }) => [mu - 6 * s, mu + 6 * s],
    pdf: (x, { mu, s }) => {
      const z = Math.exp(-(x - mu) / s);
      return z / (s * Math.pow((1 + z),2));
    },
    pdfPoints: ({ mu, s }) =>
      Array.from({ length: 200 }, (_, i) => {
        const x = mu - 6 * s + i * 12 * s / 199;
        const z = Math.exp(-(x - mu) / s);
        return { x: parseFloat(x.toFixed(3)), y: z / (s * Math.pow((1 + z),2)) };
      }),
    stats: {
      mean:     ({ mu }) => mu,
      variance: ({ s }) => Math.Math.pow(PI,2) * Math.pow(s,2) / 3,
      skewness: () => 0,
      kurtosis: () => 1.2,
    },
    formulas: {
      pdf:  "f(x)=\\frac{e^{-(x-\\mu)/s}}{s(1+e^{-(x-\\mu)/s})^2}",
      mean: "\\mu",
      var:  "\\frac{\\pi^2 s^2}{3}",
      skew: "0",
      mgf:  "e^{\\mu t}B(1-st,1+st),\\;|t|<1/s",
      cf:   "e^{i\\mu t}\\frac{\\pi st}{\\sinh(\\pi st)}",
      pgf:  "\\text{N/A (continuous)}",
    },
    story: "The CDF of the Logistic distribution is the sigmoid function 1/(1+e^−x). This is why logistic regression uses this name — it models the log-odds of an event as linear, making the probability itself follow a logistic CDF. Slightly heavier tails than Normal.",
    assumptions: [
      "Symmetric around μ",
      "CDF is the sigmoid / logistic function",
      "Slightly heavier tails than Normal (kurtosis excess = 1.2)",
      "Used implicitly in logistic regression",
    ],
    useCases: [
      "Logistic regression likelihood function",
      "Survival analysis (log-logistic AFT model)",
      "Item Response Theory in psychometrics",
      "Population growth models (logistic equation)",
    ],
    failureModes: [
      { condition: "Much heavier tails needed", use: "Student's t distribution" },
      { condition: "Skewed data", use: "Log-logistic or skew-Normal" },
    ],
    related: ["normal", "student_t", "gumbel"],
  },

  // ══════════════════════════════════════════════════════════
  // SURVIVAL & RELIABILITY
  // ══════════════════════════════════════════════════════════
  {
    id: "weibull",
    name: "Weibull",
    family: "survival",
    type: "continuous",
    tagline: "Flexible survival model — increasing, constant, or decreasing hazard",
    wikiSlug: "Weibull_distribution",
    presets: [
      { label: "Infant mortality (k<1)", params: { k: 0.5, lambda: 1 } },
      { label: "Constant hazard (k=1)", params: { k: 1, lambda: 1 } },
      { label: "Wear-out (k=2)", params: { k: 2, lambda: 1 } },
      { label: "Strong aging (k=4)", params: { k: 4, lambda: 1 } },
    ],
    params: [
      { name: "k",      label: "Shape k",  min: 0.1, max: 5, step: 0.1, default: 1.5, desc: "k<1: infant mortality, k=1: constant, k>1: wear-out" },
      { name: "lambda", label: "Scale λ",  min: 0.1, max: 5, step: 0.1, default: 1,   desc: "Characteristic life (scale)" },
    ],
    support: "x ≥ 0",
    supportFn: () => [0, null],
    pdf: (x, { k, lambda }) => {
      if (x <= 0) return 0;
      return (k / lambda) * Math.pow(x / lambda, k - 1) * Math.exp(-Math.pow(x / lambda, k));
    },
    pdfPoints: ({ k, lambda }) => {
      const hi = lambda * Math.pow(-Math.log(0.005), 1 / k);
      return Array.from({ length: 200 }, (_, i) => {
        const x = 0.001 + i * hi / 199;
        const y = (k / lambda) * Math.pow(x / lambda, k - 1) * Math.exp(-Math.pow(x / lambda, k));
        return { x: parseFloat(x.toFixed(3)), y: isFinite(y) ? y : 0 };
      });
    },
    stats: {
      mean:     ({ k, lambda }) => lambda * Math.exp(logGamma(1 + 1 / k)),
      variance: ({ k, lambda }) => Math.pow(lambda,2) * (Math.exp(logGamma(1 + 2 / k)) - Math.exp(2 * logGamma(1 + 1 / k))),
      skewness: () => NaN,
      kurtosis: () => NaN,
    },
    formulas: {
      pdf:  "f(x)=\\frac{k}{\\lambda}\\left(\\frac{x}{\\lambda}\\right)^{k-1}e^{-(x/\\lambda)^k}",
      mean: "\\lambda\\,\\Gamma\\!\\left(1+\\frac{1}{k}\\right)",
      var:  "\\lambda^2\\!\\left[\\Gamma\\!\\left(1+\\frac{2}{k}\\right)-\\Gamma^2\\!\\left(1+\\frac{1}{k}\\right)\\right]",
      skew: "\\text{(Gamma function expression)}",
      mgf:  "\\sum_{n=0}^\\infty\\frac{t^n\\lambda^n}{n!}\\Gamma\\!\\left(1+\\frac{n}{k}\\right)",
      cf:   "\\sum_{n=0}^\\infty\\frac{(it)^n\\lambda^n}{n!}\\Gamma\\!\\left(1+\\frac{n}{k}\\right)",
      pgf:  "\\text{N/A (continuous)}",
    },
    story: "The most flexible survival distribution. Shape k controls the hazard: k < 1 = infant mortality (high early failure rate decreasing over time), k = 1 = constant hazard (Exponential), k > 1 = wear-out (failure rate increases with age). The Weibull is the go-to for reliability engineering and survival analysis.",
    assumptions: [
      "Positive continuous data",
      "Hazard rate is monotone (always increasing, decreasing, or constant)",
      "k=1 gives Exponential (memoryless); k=2 gives Rayleigh",
    ],
    useCases: [
      "Time to failure for mechanical components",
      "Customer churn / subscription survival",
      "Cancer survival times in clinical trials",
      "Battery / component lifetime analysis",
      "Wind speed distribution (k ≈ 2)",
    ],
    failureModes: [
      { condition: "Bathtub hazard (infant + wear-out)", use: "Mixture of two Weibulls" },
      { condition: "Heavy right tail", use: "Log-Normal or Pareto" },
    ],
    related: ["exponential", "gamma", "log_normal", "pareto"],
  },

  {
    id: "pareto",
    name: "Pareto",
    family: "survival",
    type: "continuous",
    tagline: "Power-law: the 80/20 rule in distribution form",
    wikiSlug: "Pareto_distribution",
    presets: [
      { label: "80/20 rule (α=1.16)", params: { alpha: 1.16, xm: 1 } },
      { label: "Finite mean only", params: { alpha: 1.5, xm: 1 } },
      { label: "Finite variance", params: { alpha: 3, xm: 1 } },
    ],
    params: [
      { name: "alpha", label: "Shape α",    min: 0.5, max: 5,  step: 0.1, default: 2, desc: "Tail index — smaller = heavier tail" },
      { name: "xm",    label: "Minimum xₘ", min: 0.1, max: 5,  step: 0.1, default: 1, desc: "Minimum possible value" },
    ],
    support: "x ≥ xₘ",
    supportFn: ({ xm }) => [xm, null],
    pdf: (x, { alpha, xm }) => {
      if (x < xm) return 0;
      return alpha * Math.pow(xm, alpha) / Math.pow(x, alpha + 1);
    },
    pdfPoints: ({ alpha, xm }) => {
      const hi = xm * Math.pow(0.005, -1 / alpha);
      return Array.from({ length: 200 }, (_, i) => {
        const x = xm + i * (Math.min(hi, xm * 20) - xm) / 199;
        const y = alpha * Math.pow(xm, alpha) / Math.pow(x, alpha + 1);
        return { x: parseFloat(x.toFixed(3)), y: isFinite(y) ? y : 0 };
      });
    },
    stats: {
      mean:     ({ alpha, xm }) => alpha > 1 ? alpha * xm / (alpha - 1) : Infinity,
      variance: ({ alpha, xm }) => alpha > 2 ? Math.pow(xm,2) * alpha / (Math.pow((alpha - 1),2) * (alpha - 2)) : Infinity,
      skewness: ({ alpha }) => alpha > 3 ? 2 * (1 + alpha) / (alpha - 3) * Math.sqrt((alpha - 2) / alpha) : NaN,
      kurtosis: ({ alpha }) => alpha > 4 ? 6 * (Math.pow(alpha,3) + Math.pow(alpha,2) - 6 * alpha - 2) / (alpha * (alpha - 3) * (alpha - 4)) : NaN,
    },
    formulas: {
      pdf:  "f(x)=\\frac{\\alpha x_m^\\alpha}{x^{\\alpha+1}},\\; x\\ge x_m",
      mean: "\\frac{\\alpha x_m}{\\alpha-1}\\;(\\alpha>1)",
      var:  "\\frac{x_m^2\\alpha}{(\\alpha-1)^2(\\alpha-2)}\\;(\\alpha>2)",
      skew: "\\frac{2(1+\\alpha)}{\\alpha-3}\\sqrt{\\frac{\\alpha-2}{\\alpha}}\\;(\\alpha>3)",
      mgf:  "\\text{Does not exist for } t>0",
      cf:   "\\alpha(-ix_mt)^\\alpha\\Gamma(-\\alpha,-ix_mt)",
      pgf:  "\\text{N/A (continuous)}",
    },
    story: "The 80/20 rule is often a Pareto distribution in disguise. Power-law tails: α < 1 means even the mean is infinite. Wealth and income distributions, city sizes, web traffic, earthquake magnitudes all follow approximate Pareto tails. The smaller α, the heavier the tail.",
    assumptions: [
      "Variable has a hard lower bound xₘ",
      "Power-law tail: P(X > x) ~ x^{-α}",
      "The 'rich get richer' generative story",
      "α > 1 needed for finite mean; α > 2 for finite variance",
    ],
    useCases: [
      "Income / wealth distribution analysis",
      "Insurance: large claim severity (very heavy tails)",
      "Website traffic: a few pages get most visits",
      "Value-at-Risk and Extreme Value analysis",
      "City population distributions",
    ],
    failureModes: [
      { condition: "Light-tailed data", use: "Exponential or Log-Normal" },
      { condition: "Variable not bounded below", use: "Generalized Pareto distribution" },
    ],
    related: ["log_normal", "weibull", "exponential", "gev"],
  },

  // ══════════════════════════════════════════════════════════
  // EXTREME VALUE
  // ══════════════════════════════════════════════════════════
  {
    id: "gumbel",
    name: "Gumbel",
    family: "extreme_value",
    type: "continuous",
    tagline: "Distribution of the maximum of many samples",
    wikiSlug: "Gumbel_distribution",
    presets: [
      { label: "Standard Gumbel", params: { mu: 0, beta: 1 } },
      { label: "Wide tail", params: { mu: 0, beta: 3 } },
      { label: "Shifted", params: { mu: 5, beta: 1 } },
    ],
    params: [
      { name: "mu",   label: "Location μ", min: -3, max: 3, step: 0.1, default: 0,   desc: "Mode location" },
      { name: "beta", label: "Scale β",    min: 0.1, max: 5, step: 0.1, default: 1,  desc: "Spread" },
    ],
    support: "x ∈ (−∞, +∞)",
    supportFn: ({ mu, beta }) => [mu - 4 * beta, mu + 10 * beta],
    pdf: (x, { mu, beta }) => {
      const z = (x - mu) / beta;
      return Math.exp(-(z + Math.exp(-z))) / beta;
    },
    pdfPoints: ({ mu, beta }) => {
      const lo = mu - 4 * beta, hi = mu + 10 * beta;
      return Array.from({ length: 200 }, (_, i) => {
        const x = lo + i * (hi - lo) / 199;
        const z = (x - mu) / beta;
        return { x: parseFloat(x.toFixed(3)), y: Math.exp(-(z + Math.exp(-z))) / beta };
      });
    },
    stats: {
      mean:     ({ mu, beta }) => mu + 0.5772 * beta,
      variance: ({ beta }) => Math.Math.pow(PI,2) * Math.pow(beta,2) / 6,
      skewness: () => 12 * Math.sqrt(6) * 1.2020569 / Math.Math.pow(PI,3),
      kurtosis: () => 12 / 5,
    },
    formulas: {
      pdf:  "f(x)=\\frac{1}{\\beta}e^{-(z+e^{-z})},\\; z=\\frac{x-\\mu}{\\beta}",
      mean: "\\mu+\\beta\\gamma_E\\;(\\gamma_E\\approx0.5772)",
      var:  "\\frac{\\pi^2\\beta^2}{6}",
      skew: "\\frac{12\\sqrt{6}\\,\\zeta(3)}{\\pi^3}\\approx 1.14",
      mgf:  "e^{\\mu t}\\Gamma(1-\\beta t),\\; t<1/\\beta",
      cf:   "e^{i\\mu t}\\Gamma(1-i\\beta t)",
      pgf:  "\\text{N/A (continuous)}",
    },
    story: "Take many independent samples and record just the maximum. As the number of samples grows, the distribution of that maximum converges to a Gumbel (for exponential-tailed data). Right-skewed with a longer right tail — extreme events are more likely than Normal predicts.",
    assumptions: [
      "Models the distribution of block maxima (maximum of n iid variables)",
      "Right-skewed with a heavier right tail",
      "Applies when the underlying distribution has exponential-type tails (Normal, Gamma, etc.)",
    ],
    useCases: [
      "Maximum flood level in a year",
      "Maximum wind speed in a season",
      "Extreme financial losses",
      "Largest earthquake in a decade",
      "Winning times in athletic competitions",
    ],
    failureModes: [
      { condition: "Power-law tails in underlying data", use: "Fréchet distribution" },
      { condition: "Bounded underlying distribution", use: "Weibull (reversed) extreme value" },
    ],
    related: ["gev", "weibull", "logistic"],
  },

  {
    id: "gev",
    name: "Generalized Extreme Value (GEV)",
    family: "extreme_value",
    type: "continuous",
    tagline: "Unified family: Gumbel + Fréchet + Weibull (max) in one",
    wikiSlug: "Generalized_extreme_value_distribution",
    presets: [
      { label: "Gumbel type (ξ=0)", params: { mu: 0, sigma: 1, xi: 0 } },
      { label: "Fréchet type (ξ=0.3)", params: { mu: 0, sigma: 1, xi: 0.3 } },
      { label: "Weibull type (ξ=-0.3)", params: { mu: 0, sigma: 1, xi: -0.3 } },
    ],
    params: [
      { name: "mu",   label: "Location μ", min: -3,  max: 3,   step: 0.1, default: 0,   desc: "Center" },
      { name: "sigma",label: "Scale σ",    min: 0.1, max: 3,   step: 0.1, default: 1,   desc: "Spread" },
      { name: "xi",   label: "Shape ξ",    min: -0.5,max: 1,   step: 0.05,default: 0.1, desc: "ξ=0: Gumbel, ξ>0: Fréchet, ξ<0: Weibull" },
    ],
    support: "depends on ξ",
    supportFn: ({ mu, sigma, xi }) => {
      if (Math.abs(xi) < 1e-6) return [mu - 4 * sigma, mu + 8 * sigma];
      if (xi > 0) return [mu - sigma / xi, mu + 8 * sigma];
      return [mu - 4 * sigma, mu - sigma / xi];
    },
    pdf: (x, { mu, sigma, xi }) => {
      const t = (x - mu) / sigma;
      if (Math.abs(xi) < 1e-6) {
        return Math.exp(-(t + Math.exp(-t))) / sigma;
      }
      const arg = 1 + xi * t;
      if (arg <= 0) return 0;
      return Math.pow(arg, -1 / xi - 1) * Math.exp(-Math.pow(arg, -1 / xi)) / sigma;
    },
    pdfPoints: ({ mu, sigma, xi }) => {
      const [lo, hi] = (() => {
        if (Math.abs(xi) < 1e-6) return [mu - 4 * sigma, mu + 8 * sigma];
        if (xi > 0) return [mu - sigma / xi + 0.01, mu + 8 * sigma];
        return [mu - 4 * sigma, mu - sigma / xi - 0.01];
      })();
      return Array.from({ length: 200 }, (_, i) => {
        const x = lo + i * (hi - lo) / 199;
        const t = (x - mu) / sigma;
        let y;
        if (Math.abs(xi) < 1e-6) {
          y = Math.exp(-(t + Math.exp(-t))) / sigma;
        } else {
          const arg = 1 + xi * t;
          y = arg <= 0 ? 0 : Math.pow(arg, -1 / xi - 1) * Math.exp(-Math.pow(arg, -1 / xi)) / sigma;
        }
        return { x: parseFloat(x.toFixed(3)), y: isFinite(y) ? y : 0 };
      });
    },
    stats: {
      mean: ({ mu, sigma, xi }) => {
        if (xi === 0) return mu + 0.5772 * sigma;
        if (xi < 1 && xi !== 0) return mu + sigma * (Math.exp(logGamma(1 - xi)) - 1) / xi;
        return Infinity;
      },
      variance: ({ sigma, xi }) => {
        if (xi === 0) return Math.Math.pow(PI,2) * Math.pow(sigma,2) / 6;
        if (xi < 0.5) return Math.pow(sigma,2) * (Math.exp(logGamma(1 - 2 * xi)) - Math.exp(2 * logGamma(1 - xi))) / Math.pow(xi,2);
        return Infinity;
      },
      skewness: () => NaN,
      kurtosis: () => NaN,
    },
    formulas: {
      pdf:  "f(x)=\\frac{1}{\\sigma}\\left(1+\\xi\\frac{x-\\mu}{\\sigma}\\right)^{-1/\\xi-1}e^{-(1+\\xi t)^{-1/\\xi}}",
      mean: "\\mu+\\sigma\\frac{\\Gamma(1-\\xi)-1}{\\xi}\\;(\\xi\\ne 0,\\xi<1)",
      var:  "\\frac{\\sigma^2[\\Gamma(1-2\\xi)-\\Gamma^2(1-\\xi)]}{\\xi^2}\\;(\\xi<0.5)",
      skew: "\\text{(Gamma function expression)}",
      mgf:  "\\text{Does not generally exist}",
      cf:   "\\text{(complex Gamma expression)}",
      pgf:  "\\text{N/A (continuous)}",
    },
    story: "The GEV unifies all three types of extreme value distributions: ξ=0 is Gumbel (exponential tail), ξ>0 is Fréchet (power-law tail), ξ<0 is bounded (Weibull EVT type). Used in formal extreme value analysis — you fit the GEV and let the data tell you which family applies.",
    assumptions: [
      "Modelling block maxima (annual maximum, etc.)",
      "Observations are independent and identically distributed",
      "ξ parameter determines the tail type from data",
    ],
    useCases: [
      "Flood frequency analysis (100-year flood estimation)",
      "Extreme wind speed or wave height",
      "Financial tail risk (VaR, CVaR)",
      "Climate extremes modelling",
    ],
    failureModes: [
      { condition: "Modelling threshold exceedances (not block maxima)", use: "Generalized Pareto Distribution" },
    ],
    related: ["gumbel", "pareto", "weibull"],
  },

  // ══════════════════════════════════════════════════════════
  // MULTIVARIATE
  // ══════════════════════════════════════════════════════════
  {
    id: "multivariate_normal",
    vizType: "mvn_contours",
    name: "Multivariate Normal",
    family: "multivariate",
    type: "multivariate",
    tagline: "The joint distribution of correlated Gaussian variables",
    wikiSlug: "Multivariate_normal_distribution",
    params: [],
    support: "x ∈ ℝᵈ",
    supportFn: () => [-3, 3],
    pdfPoints: () => [],
    stats: {
      mean:     () => "μ (vector)",
      variance: () => "Σ (covariance matrix)",
      skewness: () => "0 (all marginals)",
      kurtosis: () => "0 (all marginals)",
    },
    formulas: {
      pdf:  "f(\\mathbf{x})=\\frac{1}{(2\\pi)^{d/2}|\\Sigma|^{1/2}}e^{-\\frac{1}{2}(\\mathbf{x}-\\boldsymbol{\\mu})^T\\Sigma^{-1}(\\mathbf{x}-\\boldsymbol{\\mu})}",
      mean: "\\boldsymbol{\\mu}",
      var:  "\\boldsymbol{\\Sigma}",
      skew: "\\mathbf{0}",
      mgf:  "e^{\\mathbf{t}^T\\boldsymbol{\\mu}+\\frac{1}{2}\\mathbf{t}^T\\boldsymbol{\\Sigma}\\mathbf{t}}",
      cf:   "e^{i\\mathbf{t}^T\\boldsymbol{\\mu}-\\frac{1}{2}\\mathbf{t}^T\\boldsymbol{\\Sigma}\\mathbf{t}}",
      pgf:  "\\text{N/A}",
    },
    story: "Extend the Normal distribution to d dimensions. The mean vector μ gives the center, and the covariance matrix Σ captures both the variance of each variable and the correlations between them. All marginals and conditionals are also Normal — the most mathematically convenient multivariate distribution.",
    assumptions: [
      "Each variable is marginally Normal",
      "The joint distribution is entirely characterised by μ and Σ",
      "Linear combinations of MVN variables are Normal",
      "Independence ↔ zero covariance (unique to Normal family)",
    ],
    useCases: [
      "Multivariate linear regression residuals",
      "Gaussian Processes (function-space generalisation)",
      "Kalman filtering and state estimation",
      "Factor analysis and PCA (latent variable structure)",
      "Portfolio returns (joint distribution of assets)",
    ],
    failureModes: [
      { condition: "Heavy tails or fat-tailed dependence", use: "Multivariate t or copula models" },
      { condition: "Skewed marginals", use: "Skew-Normal or copula-based approaches" },
    ],
    related: ["normal", "student_t", "dirichlet"],
  },

  {
    id: "dirichlet",
    vizType: "dirichlet_simplex",
    name: "Dirichlet",
    family: "multivariate",
    type: "multivariate",
    tagline: "Distribution over probability vectors — the multivariate Beta",
    wikiSlug: "Dirichlet_distribution",
    params: [],
    support: "Σxᵢ = 1, xᵢ > 0 (probability simplex)",
    supportFn: () => [0, 1],
    pdfPoints: () => [],
    stats: {
      mean:     () => "αᵢ / α₀  (α₀ = Σαᵢ)",
      variance: () => "αᵢ(α₀−αᵢ) / (α₀²(α₀+1))",
      skewness: () => "(see Wikipedia)",
      kurtosis: () => "(see Wikipedia)",
    },
    formulas: {
      pdf:  "f(\\mathbf{x})=\\frac{1}{B(\\boldsymbol{\\alpha})}\\prod_{i=1}^K x_i^{\\alpha_i-1}",
      mean: "\\frac{\\alpha_i}{\\alpha_0},\\; \\alpha_0=\\sum_i\\alpha_i",
      var:  "\\frac{\\alpha_i(\\alpha_0-\\alpha_i)}{\\alpha_0^2(\\alpha_0+1)}",
      skew: "\\text{(see Wikipedia)}",
      mgf:  "\\text{(multivariate — see Wikipedia)}",
      cf:   "\\text{(multivariate — see Wikipedia)}",
      pgf:  "\\text{N/A}",
    },
    story: "The natural distribution over a vector of K probabilities that must sum to 1. Generalises Beta to K categories. αᵢ encodes prior counts for category i. Symmetric Dirichlet (all αᵢ equal) is the conjugate prior for the Multinomial likelihood — the foundation of Latent Dirichlet Allocation (LDA topic models).",
    assumptions: [
      "Output is a probability vector (K values summing to 1)",
      "Concentration parameter α₀ = Σαᵢ controls sharpness",
      "Small α₀: sparse — most probability on one category",
      "Large α₀: dense — probability spread across categories",
    ],
    useCases: [
      "Topic modelling (LDA): prior over topic-word distributions",
      "Bayesian multinomial regression",
      "Posterior over category probabilities after observing counts",
      "Multi-class classification with uncertainty",
    ],
    failureModes: [
      { condition: "K=2 categories", use: "Beta distribution (special case)" },
    ],
    related: ["beta", "multinomial", "multivariate_normal"],
  },
  // ══════════════════════════════════════════════════════════
  // ADDITIONAL DISTRIBUTIONS
  // ══════════════════════════════════════════════════════════
  {
    id: "triangular",
    name: "Triangular",
    family: "continuous_bounded",
    type: "continuous",
    tagline: "When you know min, max, and most-likely value",
    wikiSlug: "Triangular_distribution",
    presets: [
      { label: "Symmetric", params: { a: 0, c: 2.5, b: 5 } },
      { label: "Left-skewed", params: { a: 0, c: 4, b: 5 } },
      { label: "Right-skewed", params: { a: 0, c: 1, b: 5 } },
    ],
    params: [
      { name: "a", label: "Minimum a", min: -5, max: 0, step: 0.5, default: 0, desc: "Lower bound" },
      { name: "c", label: "Mode c", min: 0, max: 5, step: 0.5, default: 2, desc: "Most likely value" },
      { name: "b", label: "Maximum b", min: 2, max: 10, step: 0.5, default: 5, desc: "Upper bound" },
    ],
    support: "x \u2208 [a, b]",
    supportFn: ({ a, b }) => [a, b],
    pdf: (x, { a, b, c }) => {
      if (x < a || x > b) return 0;
      if (x < c) return 2 * (x - a) / ((b - a) * (c - a));
      if (x === c) return 2 / (b - a);
      return 2 * (b - x) / ((b - a) * (b - c));
    },
    pdfPoints: ({ a, b, c }) => {
      const pad = (b - a) * 0.05;
      return [
        { x: a - pad, y: 0 }, { x: a, y: 0 },
        { x: c, y: 2 / (b - a) },
        { x: b, y: 0 }, { x: b + pad, y: 0 },
      ];
    },
    stats: {
      mean:     ({ a, b, c }) => (a + b + c) / 3,
      variance: ({ a, b, c }) => (a*a + b*b + c*c - a*b - a*c - b*c) / 18,
      skewness: ({ a, b, c }) => Math.sqrt(2)*(a+b-2*c)*(2*a-b-c)*(a-2*b+c)/(5*Math.pow(a*a+b*b+c*c-a*b-a*c-b*c,1.5)),
      kurtosis: () => -0.6,
    },
    formulas: {
      pdf:  "f(x)=\\begin{cases}\\frac{2(x-a)}{(b-a)(c-a)}&a\\le x<c\\\\\\frac{2}{b-a}&x=c\\\\\\frac{2(b-x)}{(b-a)(b-c)}&c<x\\le b\\end{cases}",
      mean: "\\frac{a+b+c}{3}",
      var:  "\\frac{a^2+b^2+c^2-ab-ac-bc}{18}",
      skew: "\\frac{\\sqrt{2}(a+b-2c)(2a-b-c)(a-2b+c)}{5(a^2+b^2+c^2-ab-ac-bc)^{3/2}}",
      mgf:  "\\frac{2[(b-c)e^{at}-(b-a)e^{ct}+(c-a)e^{bt}]}{(b-a)(c-a)(b-c)t^2}",
      cf:   "\\frac{-2[(b-c)e^{iat}-(b-a)e^{ict}+(c-a)e^{ibt}]}{(b-a)(c-a)(b-c)t^2}",
      pgf:  "N/A (continuous)",
    },
    story: "The three-point estimate distribution. When you can elicit a minimum, maximum, and most-likely value from a domain expert but lack data, the Triangular distribution captures that knowledge. Widely used in PERT project scheduling and Monte Carlo simulation.",
    assumptions: [
      "Variable is bounded between a (min) and b (max)",
      "Has a single mode (most likely value c) between a and b",
      "Linear increase from a to c, linear decrease from c to b",
      "Appropriate when you have expert opinion but no historical data",
    ],
    useCases: [
      "Project task duration estimation (PERT: a=optimistic, c=most likely, b=pessimistic)",
      "Monte Carlo simulation inputs when only range and mode are known",
      "Risk analysis for cost and time estimates",
      "Bootstrapping simulation models with minimal data",
    ],
    failureModes: [
      { condition: "You have actual historical data", use: "Fit an empirical distribution instead" },
      { condition: "Distribution should be symmetric with thin tails", use: "Normal distribution" },
    ],
    related: ["uniform_cont", "beta", "normal"],
  },
  {
    id: "inverse_gamma",
    name: "Inverse-Gamma",
    family: "continuous_positive",
    type: "continuous",
    tagline: "Conjugate prior for Normal variance in Bayesian models",
    wikiSlug: "Inverse-gamma_distribution",
    presets: [
      { label: "Weakly informative", params: { alpha: 2, beta_: 1 } },
      { label: "Tight prior", params: { alpha: 5, beta_: 4 } },
      { label: "Heavy tail", params: { alpha: 1, beta_: 1 } },
    ],
    params: [
      { name: "alpha", label: "Shape \u03b1", min: 0.5, max: 10, step: 0.1, default: 3, desc: "\u03b1 > 0; finite mean requires \u03b1 > 1" },
      { name: "beta_", label: "Scale \u03b2", min: 0.1, max: 10, step: 0.1, default: 2, desc: "\u03b2 > 0" },
    ],
    support: "x > 0",
    supportFn: () => [0, null],
    pdf: (x, { alpha, beta_ }) => {
      if (x <= 0) return 0;
      return Math.exp(alpha * Math.log(beta_) - logGamma(alpha) - (alpha + 1) * Math.log(x) - beta_ / x);
    },
    pdfPoints: ({ alpha, beta_ }) => {
      const mode = beta_ / (alpha + 1);
      const hi = mode * 10;
      return Array.from({ length: 200 }, (_, i) => {
        const x = 0.001 + i * hi / 199;
        const y = Math.exp(alpha * Math.log(beta_) - logGamma(alpha) - (alpha + 1) * Math.log(x) - beta_ / x);
        return { x: parseFloat(x.toFixed(4)), y: isFinite(y) ? y : 0 };
      });
    },
    stats: {
      mean:     ({ alpha, beta_ }) => alpha > 1 ? beta_ / (alpha - 1) : Infinity,
      variance: ({ alpha, beta_ }) => alpha > 2 ? Math.pow(beta_,2) / Math.pow(((alpha-1),2) * (alpha-2)) : Infinity,
      skewness: ({ alpha }) => alpha > 3 ? 4 * Math.sqrt(alpha - 2) / (alpha - 3) : NaN,
      kurtosis: ({ alpha }) => alpha > 4 ? (30*alpha - 66) / ((alpha-3)*(alpha-4)) : NaN,
    },
    formulas: {
      pdf:  "f(x)=\\frac{\\beta^\\alpha}{\\Gamma(\\alpha)}x^{-(\\alpha+1)}e^{-\\beta/x},\\; x>0",
      mean: "\\frac{\\beta}{\\alpha-1}\\;(\\alpha>1)",
      var:  "\\frac{\\beta^2}{(\\alpha-1)^2(\\alpha-2)}\\;(\\alpha>2)",
      skew: "\\frac{4\\sqrt{\\alpha-2}}{\\alpha-3}\\;(\\alpha>3)",
      mgf:  "\\text{Does not exist}",
      cf:   "\\frac{2(-i\\beta t)^{\\alpha/2}}{\\Gamma(\\alpha)}K_\\alpha(2\\sqrt{-i\\beta t})",
      pgf:  "N/A (continuous)",
    },
    story: "If X ~ Gamma(alpha, beta) then 1/X ~ Inverse-Gamma(alpha, beta). The canonical conjugate prior for the variance of a Normal distribution in Bayesian analysis. If your uncertainty about a variance parameter needs a prior, this is the mathematically convenient choice.",
    assumptions: [
      "Strictly positive continuous variable",
      "Right-skewed; heavier right tail than Gamma",
      "\u03b1 > 1 required for finite mean; \u03b1 > 2 for finite variance",
      "Conjugate prior for Normal variance \u03c3\u00b2",
    ],
    useCases: [
      "Bayesian linear regression: prior on \u03c3\u00b2 (error variance)",
      "Hierarchical models: prior on group-level variances",
      "Uncertainty quantification for variance parameters",
      "Bayesian ANOVA models",
    ],
    failureModes: [
      { condition: "Modelling waiting times directly", use: "Gamma distribution" },
      { condition: "Half-Normal prior is sufficient", use: "Half-Normal or Half-Cauchy" },
    ],
    related: ["gamma", "normal", "chi_squared"],
  },
  {
    id: "f_distribution",
    name: "F-Distribution",
    family: "continuous_positive",
    type: "continuous",
    tagline: "Ratio of two chi-squared variables \u2014 used in ANOVA and regression",
    wikiSlug: "F-distribution",
    presets: [
      { label: "ANOVA (5,20 df)", params: { d1: 5, d2: 20 } },
      { label: "Regression (1,∞→50)", params: { d1: 1, d2: 50 } },
      { label: "Equal df", params: { d1: 10, d2: 10 } },
    ],
    params: [
      { name: "d1", label: "d\u2081 (numerator df)", min: 1, max: 20, step: 1, default: 5, desc: "Numerator degrees of freedom" },
      { name: "d2", label: "d\u2082 (denominator df)", min: 1, max: 50, step: 1, default: 20, desc: "Denominator degrees of freedom" },
    ],
    support: "x > 0",
    supportFn: () => [0, null],
    pdf: (x, { d1, d2 }) => {
      if (x <= 0) return 0;
      const lnum = (d1/2)*Math.log(d1) + (d2/2)*Math.log(d2) + (d1/2-1)*Math.log(x);
      const lden = logBeta(d1/2, d2/2) + ((d1+d2)/2)*Math.log(d1*x + d2);
      return Math.exp(lnum - lden);
    },
    pdfPoints: ({ d1, d2 }) => {
      const hi = Math.min((d2 > 4 ? d2/(d2-4) : 1) * 6, 10);
      return Array.from({ length: 200 }, (_, i) => {
        const x = 0.005 + i * hi / 199;
        const lnum = (d1/2)*Math.log(d1) + (d2/2)*Math.log(d2) + (d1/2-1)*Math.log(x);
        const lden = logBeta(d1/2, d2/2) + ((d1+d2)/2)*Math.log(d1*x + d2);
        const y = Math.exp(lnum - lden);
        return { x: parseFloat(x.toFixed(3)), y: isFinite(y) ? y : 0 };
      });
    },
    stats: {
      mean:     ({ d2 }) => d2 > 2 ? d2 / (d2 - 2) : Infinity,
      variance: ({ d1, d2 }) => d2 > 4 ? 2*Math.pow(d2,2)*(d1+d2-2)/Math.pow((d1*(d2-2),2)*(d2-4)) : Infinity,
      skewness: ({ d1, d2 }) => d2 > 6 ? (2*d1+d2-2)*Math.sqrt(8*(d2-4))/(d2-6)/Math.sqrt(d1*(d1+d2-2)) : NaN,
      kurtosis: () => NaN,
    },
    formulas: {
      pdf:  "f(x)=\\frac{(d_1 x)^{d_1}d_2^{d_2}}{(d_1 x+d_2)^{d_1+d_2}}\\cdot\\frac{1}{xB(d_1/2,d_2/2)}",
      mean: "\\frac{d_2}{d_2-2}\\;(d_2>2)",
      var:  "\\frac{2d_2^2(d_1+d_2-2)}{d_1(d_2-2)^2(d_2-4)}\\;(d_2>4)",
      skew: "\\frac{(2d_1+d_2-2)\\sqrt{8(d_2-4)}}{(d_2-6)\\sqrt{d_1(d_1+d_2-2)}}\\;(d_2>6)",
      mgf:  "\\text{Does not exist}",
      cf:   "U\\left(\\frac{d_1}{2},1-\\frac{d_2}{2},-\\frac{d_2 it}{d_1}\\right)\\frac{\\Gamma(d_1/2+d_2/2)}{\\Gamma(d_2/2)}",
      pgf:  "N/A (continuous)",
    },
    story: "The F-distribution is the ratio of two chi-squared variables each divided by their degrees of freedom. The F-test statistic in ANOVA follows this distribution under the null. Also used to test overall regression significance and to compare two variances.",
    assumptions: [
      "Ratio of two independent chi-squared variables divided by their df",
      "Right-skewed; approaches Normal as d1, d2 grow large",
      "Both numerator and denominator are chi-squared distributed",
    ],
    useCases: [
      "ANOVA F-test: is any group mean significantly different?",
      "Overall significance test in linear regression (F-statistic)",
      "Comparing two sample variances (Levene's test, Bartlett's test)",
      "Likelihood ratio test in nested model comparison",
    ],
    failureModes: [
      { condition: "Large d1 and d2 (> 30)", use: "Normal approximation" },
      { condition: "Comparing model AUCs", use: "DeLong test or bootstrap" },
    ],
    related: ["chi_squared", "student_t", "normal"],
  },
  {
    id: "rayleigh",
    name: "Rayleigh",
    family: "continuous_positive",
    type: "continuous",
    tagline: "Magnitude of a 2D vector with independent Normal components",
    wikiSlug: "Rayleigh_distribution",
    presets: [
      { label: "Standard (σ=1)", params: { sigma: 1 } },
      { label: "Wind speed", params: { sigma: 2 } },
      { label: "Compressed", params: { sigma: 0.5 } },
    ],
    params: [
      { name: "sigma", label: "Scale \u03c3", min: 0.1, max: 5, step: 0.1, default: 1, desc: "Scale parameter" },
    ],
    support: "x \u2265 0",
    supportFn: () => [0, null],
    pdf: (x, { sigma }) => {
      if (x < 0) return 0;
      return (x / Math.pow(sigma,2)) * Math.exp(-Math.pow(x,2) / (2 * Math.pow(sigma,2)));
    },
    pdfPoints: ({ sigma }) => {
      const hi = sigma * 5;
      return Array.from({ length: 200 }, (_, i) => {
        const x = i * hi / 199;
        const y = x < 0.001 ? 0 : (x / Math.pow(sigma,2)) * Math.exp(-Math.pow(x,2) / (2 * Math.pow(sigma,2)));
        return { x: parseFloat(x.toFixed(3)), y };
      });
    },
    stats: {
      mean:     ({ sigma }) => sigma * Math.sqrt(Math.PI / 2),
      variance: ({ sigma }) => (4 - Math.PI) / 2 * Math.pow(sigma,2),
      skewness: () => 2 * Math.sqrt(Math.PI) * (Math.PI - 3) / Math.pow(4 - Math.PI, 1.5),
      kurtosis: () => -(6*Math.Math.pow(PI,2) - 24*Math.PI + 16) / Math.pow((4 - Math.PI),2),
    },
    formulas: {
      pdf:  "f(x)=\\frac{x}{\\sigma^2}e^{-x^2/(2\\sigma^2)},\\; x\\ge 0",
      mean: "\\sigma\\sqrt{\\pi/2}",
      var:  "\\frac{4-\\pi}{2}\\sigma^2",
      skew: "\\frac{2\\sqrt{\\pi}(\\pi-3)}{(4-\\pi)^{3/2}}\\approx 0.631",
      mgf:  "\\text{(series expansion)}",
      cf:   "\\text{(series expansion)}",
      pgf:  "N/A (continuous)",
    },
    story: "If X and Y are independent Normal(0, sigma^2) variables, the distance from origin sqrt(X^2+Y^2) follows a Rayleigh distribution. Arises naturally in 2D physics and engineering problems. A special case of the Weibull distribution with shape k=2.",
    assumptions: [
      "Non-negative continuous variable",
      "Special case of Weibull with shape k=2",
      "Arises as the magnitude of a 2D vector with iid Normal components",
    ],
    useCases: [
      "Wind speed modelling (frequently used in wind energy)",
      "Signal amplitude in communication systems (Rayleigh fading)",
      "Distance from a point to the nearest event in a 2D Poisson process",
      "Wave height distributions in ocean engineering",
    ],
    failureModes: [
      { condition: "Need variable shape parameter", use: "Weibull distribution" },
      { condition: "3D vector magnitude needed", use: "Maxwell-Boltzmann distribution" },
    ],
    related: ["weibull", "exponential", "normal"],
  },
  {
    id: "cauchy",
    name: "Cauchy",
    family: "continuous_real",
    type: "continuous",
    tagline: "Pathological heavy tails \u2014 no mean, no variance",
    wikiSlug: "Cauchy_distribution",
    presets: [
      { label: "Standard Cauchy", params: { x0: 0, gamma: 1 } },
      { label: "Wide spread", params: { x0: 0, gamma: 3 } },
      { label: "Shifted", params: { x0: 2, gamma: 1 } },
    ],
    params: [
      { name: "x0",    label: "Location x\u2080", min: -3, max: 3, step: 0.1, default: 0, desc: "Median and mode" },
      { name: "gamma", label: "Scale \u03b3",     min: 0.1, max: 5, step: 0.1, default: 1, desc: "Half-width at half-maximum" },
    ],
    support: "x \u2208 (-\u221e, +\u221e)",
    supportFn: ({ x0, gamma }) => [x0 - 8*gamma, x0 + 8*gamma],
    pdf: (x, { x0, gamma }) => 1 / (Math.PI * gamma * (1 + Math.pow((x - x0)/gamma, 2))),
    pdfPoints: ({ x0, gamma }) => Array.from({ length: 200 }, (_, i) => {
      const x = x0 - 8*gamma + i*16*gamma/199;
      return { x: parseFloat(x.toFixed(3)), y: 1 / (Math.PI * gamma * (1 + Math.pow((x - x0)/gamma, 2))) };
    }),
    stats: {
      mean:     () => "undefined",
      variance: () => "undefined",
      skewness: () => "undefined",
      kurtosis: () => "undefined",
    },
    formulas: {
      pdf:  "f(x)=\\frac{1}{\\pi\\gamma\\left[1+\\left(\\frac{x-x_0}{\\gamma}\\right)^2\\right]}",
      mean: "\\text{undefined (integral diverges)}",
      var:  "\\text{undefined}",
      skew: "\\text{undefined}",
      mgf:  "\\text{Does not exist}",
      cf:   "e^{ix_0 t - \\gamma|t|}",
      pgf:  "N/A (continuous)",
    },
    story: "The classic counter-example in statistics. The average of n Cauchy samples does NOT converge to anything useful - the sample mean of Cauchy variables is also Cauchy. No law of large numbers applies. Arises as the ratio of two independent standard Normals, or as Student's t with nu=1.",
    assumptions: [
      "Symmetric around x0 (location parameter)",
      "Mean and variance do not exist - sample mean is useless",
      "Extremely heavy tails - extreme values are far more common than Normal",
      "Student's t with degrees of freedom = 1",
    ],
    useCases: [
      "Robust Bayesian priors for location parameters",
      "Modelling physics resonance (Lorentzian profile)",
      "Stress-testing statistical procedures with pathological data",
      "Ratio of two Normal random variables",
    ],
    failureModes: [
      { condition: "You want well-defined moments", use: "Student's t with nu > 2" },
      { condition: "Heavy tails but finite variance needed", use: "Student's t (any nu > 2)" },
    ],
    related: ["student_t", "normal", "logistic"],
  },
  {
    id: "log_logistic",
    name: "Log-Logistic",
    family: "survival",
    type: "continuous",
    tagline: "Non-monotone hazard \u2014 rises then falls",
    wikiSlug: "Log-logistic_distribution",
    presets: [
      { label: "Increasing then falling hazard", params: { alpha: 1, beta_: 2 } },
      { label: "Monotone decreasing (β=1)", params: { alpha: 1, beta_: 1 } },
      { label: "Peaked hazard (β=4)", params: { alpha: 1, beta_: 4 } },
    ],
    params: [
      { name: "alpha", label: "Scale \u03b1", min: 0.1, max: 5, step: 0.1, default: 1, desc: "Median of the distribution" },
      { name: "beta_", label: "Shape \u03b2", min: 0.5, max: 10, step: 0.1, default: 2, desc: "\u03b2 > 1: unimodal hazard; \u03b2 \u2264 1: decreasing" },
    ],
    support: "x \u2265 0",
    supportFn: () => [0, null],
    pdf: (x, { alpha, beta_ }) => {
      if (x <= 0) return 0;
      const z = x / alpha;
      return (beta_ / alpha) * Math.pow(z, beta_ - 1) / Math.pow(1 + Math.pow(z, beta_), 2);
    },
    pdfPoints: ({ alpha, beta_ }) => {
      return Array.from({ length: 200 }, (_, i) => {
        const x = 0.001 + i * alpha * 8 / 199;
        const z = x / alpha;
        const y = (beta_ / alpha) * Math.pow(z, beta_ - 1) / Math.pow(1 + Math.pow(z, beta_), 2);
        return { x: parseFloat(x.toFixed(3)), y: isFinite(y) ? y : 0 };
      });
    },
    stats: {
      mean:     ({ alpha, beta_ }) => beta_ > 1 ? alpha * (Math.PI/beta_) / Math.sin(Math.PI/beta_) : Infinity,
      variance: () => NaN,
      skewness: () => NaN,
      kurtosis: () => NaN,
    },
    formulas: {
      pdf:  "f(x)=\\frac{(\\beta/\\alpha)(x/\\alpha)^{\\beta-1}}{(1+(x/\\alpha)^{\\beta})^2},\\; x\\ge 0",
      mean: "\\frac{\\alpha\\pi/\\beta}{\\sin(\\pi/\\beta)}\\;(\\beta>1)",
      var:  "\\alpha^2\\!\\left[\\frac{2\\pi/\\beta}{\\sin(2\\pi/\\beta)}-\\frac{(\\pi/\\beta)^2}{\\sin^2(\\pi/\\beta)}\\right]\\!(\\beta>2)",
      skew: "\\text{(complex \u2014 see Wikipedia)}",
      mgf:  "\\text{Does not exist}",
      cf:   "\\text{(complex \u2014 see Wikipedia)}",
      pgf:  "N/A (continuous)",
    },
    story: "If ln(X) follows a Logistic distribution, then X follows a Log-Logistic distribution. The hazard rate rises to a peak then decreases - unlike Weibull which is always monotone. This unimodal hazard appears in cancer survival studies and internet session durations.",
    assumptions: [
      "Non-negative continuous data",
      "Hazard rate is unimodal (rises then falls) when beta > 1",
      "Monotone decreasing hazard when beta <= 1",
      "Heavier right tail than Weibull",
    ],
    useCases: [
      "Cancer survival analysis when hazard peaks then decreases",
      "Income distribution modelling (alternative to Log-Normal)",
      "Internet session duration and file transfer times",
      "Accelerated Failure Time (AFT) survival models",
    ],
    failureModes: [
      { condition: "Monotone hazard (always increasing or decreasing)", use: "Weibull distribution" },
      { condition: "Need lighter right tail", use: "Log-Normal distribution" },
    ],
    related: ["weibull", "log_normal", "logistic"],
  },
  {
    id: "inverse_gaussian",
    name: "Inverse Gaussian (Wald)",
    family: "survival",
    type: "continuous",
    tagline: "First passage time of Brownian motion with drift",
    wikiSlug: "Inverse_Gaussian_distribution",
    presets: [
      { label: "Standard", params: { mu: 1, lambda: 2 } },
      { label: "Highly skewed", params: { mu: 1, lambda: 0.3 } },
      { label: "Near-Normal", params: { mu: 1, lambda: 10 } },
    ],
    params: [
      { name: "mu",     label: "Mean \u03bc",   min: 0.1, max: 5,  step: 0.1, default: 1, desc: "Mean first passage time" },
      { name: "lambda", label: "Shape \u03bb",  min: 0.1, max: 10, step: 0.1, default: 2, desc: "Concentration (larger = less skew)" },
    ],
    support: "x > 0",
    supportFn: () => [0, null],
    pdf: (x, { mu, lambda }) => {
      if (x <= 0) return 0;
      return Math.sqrt(lambda / (2 * Math.PI * Math.pow(x, 3))) * Math.exp(-lambda * Math.pow(x - mu, 2) / (2 * Math.pow(mu, 2) * x));
    },
    pdfPoints: ({ mu, lambda }) => {
      const hi = mu + 5 * mu * Math.sqrt(mu / lambda);
      return Array.from({ length: 200 }, (_, i) => {
        const x = 0.001 + i * hi / 199;
        const y = Math.sqrt(lambda / (2*Math.PI*Math.pow(x,3))) * Math.exp(-lambda * Math.pow(x - mu, 2) / (2 * Math.pow(mu, 2) * x));
        return { x: parseFloat(x.toFixed(3)), y: isFinite(y) ? y : 0 };
      });
    },
    stats: {
      mean:     ({ mu }) => mu,
      variance: ({ mu, lambda }) => Math.pow(mu,3) / lambda,
      skewness: ({ mu, lambda }) => 3 * Math.sqrt(mu / lambda),
      kurtosis: ({ mu, lambda }) => 15 * mu / lambda,
    },
    formulas: {
      pdf:  "f(x)=\\sqrt{\\frac{\\lambda}{2\\pi x^3}}\\exp\\!\\left(-\\frac{\\lambda(x-\\mu)^2}{2\\mu^2 x}\\right)",
      mean: "\\mu",
      var:  "\\frac{\\mu^3}{\\lambda}",
      skew: "3\\sqrt{\\frac{\\mu}{\\lambda}}",
      mgf:  "\\exp\\!\\left(\\frac{\\lambda}{\\mu}\\left(1-\\sqrt{1-\\frac{2\\mu^2 t}{\\lambda}}\\right)\\right)",
      cf:   "\\exp\\!\\left(\\frac{\\lambda}{\\mu}\\left(1-\\sqrt{1-\\frac{2i\\mu^2 t}{\\lambda}}\\right)\\right)",
      pgf:  "N/A (continuous)",
    },
    story: "The distribution of the time for a Brownian motion with positive drift to first reach a fixed boundary. Highly right-skewed for small lambda/mu ratios. Also known as the Wald distribution - used in sequential analysis and reaction time modelling.",
    assumptions: [
      "Positive continuous variable",
      "Models first-passage time of a diffusion process",
      "Right-skewed; skewness decreases as lambda/mu increases",
      "Exponential family distribution",
    ],
    useCases: [
      "Reaction time modelling in cognitive psychology (Wald model)",
      "Time-to-default in credit risk (structural models)",
      "Machine component wear-out times",
      "Physiological response times and neuronal firing",
    ],
    failureModes: [
      { condition: "No physical diffusion interpretation", use: "Log-Normal or Gamma" },
      { condition: "Non-monotone hazard", use: "Log-Logistic distribution" },
    ],
    related: ["log_normal", "gamma", "weibull"],
  },
  {
    id: "skew_normal",
    name: "Skew-Normal",
    family: "continuous_real",
    type: "continuous",
    tagline: "Normal with a controllable skewness parameter",
    wikiSlug: "Skew_normal_distribution",
    presets: [
      { label: "Standard Normal (α=0)", params: { xi: 0, omega: 1, alpha: 0 } },
      { label: "Moderate right skew", params: { xi: 0, omega: 1, alpha: 3 } },
      { label: "Strong right skew", params: { xi: 0, omega: 1, alpha: 10 } },
      { label: "Left skew", params: { xi: 0, omega: 1, alpha: -3 } },
    ],
    params: [
      { name: "xi",    label: "Location \u03be", min: -3,  max: 3,  step: 0.1, default: 0,  desc: "Location (not mean)" },
      { name: "omega", label: "Scale \u03c9",    min: 0.1, max: 5,  step: 0.1, default: 1,  desc: "Scale (not std dev)" },
      { name: "alpha", label: "Shape \u03b1",    min: -10, max: 10, step: 0.5, default: 3,  desc: "\u03b1=0: Normal; \u03b1>0: right skew" },
    ],
    support: "x \u2208 (-\u221e, +\u221e)",
    supportFn: ({ xi, omega }) => [xi - 5*omega, xi + 5*omega],
    pdf: (x, { xi, omega, alpha }) => {
      const z = (x - xi) / omega;
      const phi = Math.exp(-z*z/2) / Math.sqrt(2*Math.PI);
      const erfVal = erf(alpha * z / Math.sqrt(2));
      const Phi = 0.5 * (1 + erfVal);
      return 2 / omega * phi * Phi;
    },
    pdfPoints: ({ xi, omega, alpha }) => {
      const lo = xi - 5*omega, hi = xi + 5*omega;
      return Array.from({ length: 200 }, (_, i) => {
        const x = lo + i*(hi-lo)/199;
        const z = (x - xi) / omega;
        const phi = Math.exp(-z*z/2) / Math.sqrt(2*Math.PI);
        const Phi = 0.5 * (1 + erf(alpha * z / Math.sqrt(2)));
        return { x: parseFloat(x.toFixed(3)), y: 2/omega * phi * Phi };
      });
    },
    stats: {
      mean:     ({ xi, omega, alpha }) => {
        const d = alpha / Math.sqrt(1 + Math.pow(alpha,2));
        return xi + omega * d * Math.sqrt(2/Math.PI);
      },
      variance: ({ omega, alpha }) => Math.pow(omega,2) * (1 - 2*Math.pow(alpha/Math.sqrt(1+Math.pow(alpha,2)),2)/Math.PI),
      skewness: ({ alpha }) => {
        const d = alpha / Math.sqrt(1 + Math.pow(alpha,2));
        return (4 - Math.PI)/2 * Math.pow(d*Math.sqrt(2/Math.PI), 3) / Math.pow(1 - 2*Math.pow(d,2)/Math.PI, 1.5);
      },
      kurtosis: () => NaN,
    },
    formulas: {
      pdf:  "f(x)=\\frac{2}{\\omega}\\phi\\!\\left(\\frac{x-\\xi}{\\omega}\\right)\\Phi\\!\\left(\\alpha\\frac{x-\\xi}{\\omega}\\right)",
      mean: "\\xi+\\omega\\delta\\sqrt{2/\\pi},\\;\\delta=\\frac{\\alpha}{\\sqrt{1+\\alpha^2}}",
      var:  "\\omega^2\\!\\left(1-\\frac{2\\delta^2}{\\pi}\\right)",
      skew: "\\frac{4-\\pi}{2}\\cdot\\frac{(\\delta\\sqrt{2/\\pi})^3}{(1-2\\delta^2/\\pi)^{3/2}}",
      mgf:  "2e^{\\xi t+\\omega^2t^2/2}\\Phi(\\omega\\delta t)",
      cf:   "2e^{i\\xi t-\\omega^2t^2/2}\\Phi(i\\omega\\delta t)",
      pgf:  "N/A (continuous)",
    },
    story: "The Normal distribution extended with a shape parameter alpha that introduces skewness. alpha=0 gives the standard Normal. Positive alpha right-skews the distribution. Allows relaxing the symmetry assumption while keeping most convenient Normal properties.",
    assumptions: [
      "Unimodal, bell-shaped but asymmetric",
      "alpha=0 gives exact Normal distribution",
      "Skewness is bounded: |gamma_1| < 0.9953",
      "Approaches half-Normal as |alpha| grows large",
    ],
    useCases: [
      "Modelling slightly skewed measurement errors",
      "Stochastic frontier models in economics",
      "Biological measurements that are nearly but not perfectly Normal",
      "Income distributions at higher quantiles (moderate right skew)",
    ],
    failureModes: [
      { condition: "Heavy tails present", use: "Skew-t distribution" },
      { condition: "Strong skew that Skew-Normal cannot capture", use: "Log-Normal or Gamma" },
    ],
    related: ["normal", "student_t", "log_normal"],
  },
  {
    id: "zero_inflated_poisson",
    name: "Zero-Inflated Poisson (ZIP)",
    family: "discrete_count",
    type: "discrete",
    tagline: "Poisson with excess structural zeros",
    wikiSlug: "Zero-inflated_model",
    presets: [
      { label: "Mild zero-inflation (30%)", params: { pi: 0.3, lambda: 3 } },
      { label: "Heavy zeros (60%)", params: { pi: 0.6, lambda: 5 } },
      { label: "Near-Poisson (5%)", params: { pi: 0.05, lambda: 4 } },
    ],
    params: [
      { name: "pi",     label: "Zero-inflation \u03c0", min: 0.01, max: 0.7,  step: 0.01, default: 0.3, desc: "Prob. of structural zero" },
      { name: "lambda", label: "Poisson rate \u03bb",   min: 0.1,  max: 10,   step: 0.1,  default: 3,   desc: "Rate for Poisson component" },
    ],
    support: "k \u2208 {0, 1, 2, \u2026}",
    supportFn: ({ lambda }) => [0, Math.ceil(lambda + 4*Math.sqrt(lambda) + 5)],
    pmf: (k, { pi, lambda }) => {
      if (k < 0) return 0;
      const poisson_k = Math.exp(-lambda + k*Math.log(lambda) - logFactorial(k));
      return k === 0 ? pi + (1 - pi) * poisson_k : (1 - pi) * poisson_k;
    },
    pdfPoints: ({ pi, lambda }) => {
      const hi = Math.ceil(lambda + 4*Math.sqrt(lambda) + 5);
      return Array.from({ length: hi + 1 }, (_, k) => {
        const pois = Math.exp(-lambda + k*Math.log(lambda) - logFactorial(k));
        return { x: k, y: k === 0 ? pi + (1-pi)*pois : (1-pi)*pois };
      });
    },
    stats: {
      mean:     ({ pi, lambda }) => (1 - pi) * lambda,
      variance: ({ pi, lambda }) => (1 - pi) * lambda * (1 + pi * lambda),
      skewness: () => NaN,
      kurtosis: () => NaN,
    },
    formulas: {
      pmf:  "P(X=k)=\\begin{cases}\\pi+(1-\\pi)e^{-\\lambda}&k=0\\\\(1-\\pi)\\frac{\\lambda^k e^{-\\lambda}}{k!}&k>0\\end{cases}",
      mean: "(1-\\pi)\\lambda",
      var:  "(1-\\pi)\\lambda(1+\\pi\\lambda)",
      skew: "\\text{(complex)}",
      mgf:  "\\pi+(1-\\pi)e^{\\lambda(e^t-1)}",
      pgf:  "\\pi+(1-\\pi)e^{\\lambda(z-1)}",
      cf:   "\\pi+(1-\\pi)e^{\\lambda(e^{it}-1)}",
    },
    story: "Two processes generate your count data: with probability pi you always get zero (structural zeros - the event is impossible for this subject), and with probability 1-pi you observe a Poisson count. Classic example: cigarettes per day - non-smokers always give zero; smokers follow Poisson.",
    assumptions: [
      "Two-component mixture: point mass at zero plus Poisson",
      "Structural zeros are distinct from Poisson zeros",
      "More zeros than a single Poisson process can explain",
      "Overdispersed relative to Poisson",
    ],
    useCases: [
      "Cigarettes smoked per day (smokers vs non-smokers)",
      "Doctor visits per year (healthy vs sick population)",
      "Number of defects per unit (some units are structurally defect-free)",
      "Insurance claims (policyholders who never claim vs those who do)",
    ],
    failureModes: [
      { condition: "Overdispersion without structural zeros", use: "Negative Binomial distribution" },
      { condition: "ZIP plus overdispersion in Poisson component", use: "Zero-Inflated Negative Binomial (ZINB)" },
    ],
    related: ["poisson", "negative_binomial", "geometric"],
  },
  {
    id: "discrete_uniform",
    name: "Discrete Uniform",
    family: "discrete_bounded",
    type: "discrete",
    tagline: "All integer values in a range equally likely",
    wikiSlug: "Discrete_uniform_distribution",
    params: [
      { name: "a", label: "Minimum a", min: 1,  max: 5,  step: 1, default: 1, desc: "Smallest value" },
      { name: "b", label: "Maximum b", min: 2,  max: 20, step: 1, default: 6, desc: "Largest value (inclusive)" },
    ],
    support: "k \u2208 {a, a+1, \u2026, b}",
    supportFn: ({ a, b }) => [a, b],
    pmf: (k, { a, b }) => (k >= a && k <= b && Number.isInteger(k)) ? 1/(b-a+1) : 0,
    pdfPoints: ({ a, b }) => Array.from({ length: b-a+1 }, (_, i) => ({ x: a + i, y: 1/(b-a+1) })),
    stats: {
      mean:     ({ a, b }) => (a + b) / 2,
      variance: ({ a, b }) => Math.pow(((b-a+1),2) - 1) / 12,
      skewness: () => 0,
      kurtosis: ({ a, b }) => -6 * Math.pow(((b-a+1),2) + 1) / Math.pow((5 * ((b-a+1),2) - 1)),
    },
    formulas: {
      pmf:  "P(X=k)=\\frac{1}{b-a+1},\\; k\\in\\{a,\\ldots,b\\}",
      mean: "\\frac{a+b}{2}",
      var:  "\\frac{(b-a+1)^2-1}{12}",
      skew: "0",
      mgf:  "\\frac{e^{at}-e^{(b+1)t}}{(b-a+1)(1-e^t)}",
      pgf:  "\\frac{z^a(1-z^{b-a+1})}{(b-a+1)(1-z)}",
      cf:   "\\frac{e^{iat}-e^{i(b+1)t}}{(b-a+1)(1-e^{it})}",
    },
    story: "Every integer from a to b has identical probability 1/(b-a+1). The simplest model of fairness: a fair die, a random card draw (with replacement), a lottery. Maximum entropy distribution given only the integer bounds.",
    assumptions: [
      "Finite set of equally-spaced integer values",
      "All values have identical probability",
      "Maximum entropy distribution given only min and max integers",
    ],
    useCases: [
      "Fair dice rolls (a=1, b=6)",
      "Random integer selection in simulations",
      "Simple baseline model for integer-valued outcomes",
      "Sampling a random index from an array",
    ],
    failureModes: [
      { condition: "Some values more likely than others", use: "Categorical or custom PMF" },
      { condition: "Continuous range needed", use: "Continuous Uniform distribution" },
    ],
    related: ["bernoulli", "uniform_cont"],
  },
  // ══════════════════════════════════════════════════════════
  // FINAL 5 — completing 38
  // ══════════════════════════════════════════════════════════
  {
    id: "erlang",
    name: "Erlang",
    family: "continuous_positive",
    type: "continuous",
    tagline: "Sum of k identical exponential waiting times (integer shape Gamma)",
    wikiSlug: "Erlang_distribution",
    presets: [
      { label: "Exponential (k=1)", params: { k: 1, lambda: 1 } },
      { label: "Sum of 3 (k=3)", params: { k: 3, lambda: 1 } },
      { label: "Sum of 10 (k=10)", params: { k: 10, lambda: 2 } },
    ],
    params: [
      { name: "k",      label: "Shape k (integer)", min: 1, max: 15, step: 1,   default: 3,   desc: "Number of events to wait for" },
      { name: "lambda", label: "Rate λ",            min: 0.1, max: 5, step: 0.1, default: 1, desc: "Rate of each event" },
    ],
    support: "x > 0",
    supportFn: () => [0, null],
    pdf: (x, { k, lambda }) => {
      if (x <= 0) return 0;
      return Math.exp(Math.round(k) * Math.log(lambda) + (Math.round(k) - 1) * Math.log(x) - lambda * x - logGamma(Math.round(k)));
    },
    pdfPoints: ({ k, lambda }) => {
      const ki = Math.round(k);
      const hi = (ki + 4 * Math.sqrt(ki)) / lambda;
      return Array.from({ length: 200 }, (_, i) => {
        const x = 0.001 + i * hi / 199;
        const y = Math.exp(ki * Math.log(lambda) + (ki - 1) * Math.log(x) - lambda * x - logGamma(ki));
        return { x: parseFloat(x.toFixed(3)), y: isFinite(y) ? y : 0 };
      });
    },
    stats: {
      mean:     ({ k, lambda }) => Math.round(k) / lambda,
      variance: ({ k, lambda }) => Math.round(k) / Math.pow(lambda, 2),
      skewness: ({ k }) => 2 / Math.sqrt(Math.round(k)),
      kurtosis: ({ k }) => 6 / Math.round(k),
    },
    formulas: {
      pdf:  "f(x)=\\frac{\\lambda^k x^{k-1} e^{-\\lambda x}}{(k-1)!},\\; x\\ge 0,\\; k\\in\\mathbb{Z}^+",
      mean: "\\frac{k}{\\lambda}",
      var:  "\\frac{k}{\\lambda^2}",
      skew: "\\frac{2}{\\sqrt{k}}",
      mgf:  "\\left(\\frac{\\lambda}{\\lambda-t}\\right)^k,\\; t<\\lambda",
      pgf:  "\\text{N/A (continuous)}",
      cf:   "\\left(\\frac{\\lambda}{\\lambda-it}\\right)^k",
    },
    story: "Wait for k independent events each occurring at rate lambda. The total wait time follows an Erlang(k, lambda) distribution. It is the Gamma distribution restricted to integer shape k. Classic in queueing theory: the Erlang-k distribution models the time to serve k customers.",
    assumptions: [
      "Positive continuous data",
      "Shape k must be a positive integer (Gamma allows any positive real k)",
      "k = 1 gives the Exponential distribution",
      "Events occur independently at constant rate lambda",
    ],
    useCases: [
      "Queueing theory: service time for k stages in a pipeline",
      "Telecommunications: call holding times (Erlang-B and Erlang-C models)",
      "Time to complete k sequential independent tasks",
      "Network packet transmission times",
    ],
    failureModes: [
      { condition: "Non-integer shape needed", use: "Gamma distribution" },
      { condition: "k = 1", use: "Exponential distribution (special case)" },
    ],
    related: ["gamma", "exponential", "poisson"],
  },

  {
    id: "half_normal",
    name: "Half-Normal",
    family: "continuous_positive",
    type: "continuous",
    tagline: "Absolute value of a Normal — scale prior in Bayesian hierarchical models",
    wikiSlug: "Half-normal_distribution",
    presets: [
      { label: "Standard (σ=1)", params: { sigma: 1 } },
      { label: "Tight prior (σ=0.5)", params: { sigma: 0.5 } },
      { label: "Weakly informative (σ=2)", params: { sigma: 2 } },
    ],
    params: [
      { name: "sigma", label: "Scale σ", min: 0.1, max: 5, step: 0.1, default: 1, desc: "Scale (controls spread)" },
    ],
    support: "x ≥ 0",
    supportFn: () => [0, null],
    pdf: (x, { sigma }) => {
      if (x < 0) return 0;
      return Math.sqrt(2 / Math.PI) / sigma * Math.exp(-Math.pow(x, 2) / (2 * Math.pow(sigma, 2)));
    },
    pdfPoints: ({ sigma }) => {
      const hi = sigma * 4;
      return Array.from({ length: 200 }, (_, i) => {
        const x = i * hi / 199;
        const y = x < 0.0001 ? Math.sqrt(2 / Math.PI) / sigma
                             : Math.sqrt(2 / Math.PI) / sigma * Math.exp(-Math.pow(x, 2) / (2 * Math.pow(sigma, 2)));
        return { x: parseFloat(x.toFixed(3)), y };
      });
    },
    stats: {
      mean:     ({ sigma }) => sigma * Math.sqrt(2 / Math.PI),
      variance: ({ sigma }) => Math.pow(sigma, 2) * (1 - 2 / Math.PI),
      skewness: () => Math.sqrt(2) * (4 - Math.PI) / Math.pow(Math.PI - 2, 1.5),
      kurtosis: () => 8 * (Math.PI - 3) / Math.pow(Math.PI - 2, 2),
    },
    formulas: {
      pdf:  "f(x)=\\sqrt{\\frac{2}{\\pi}}\\frac{1}{\\sigma}e^{-x^2/(2\\sigma^2)},\\; x\\ge 0",
      mean: "\\sigma\\sqrt{2/\\pi}",
      var:  "\\sigma^2\\left(1-\\frac{2}{\\pi}\\right)",
      skew: "\\frac{\\sqrt{2}(4-\\pi)}{(\\pi-2)^{3/2}}\\approx 0.995",
      mgf:  "\\text{(in terms of erfc)}",
      pgf:  "\\text{N/A (continuous)}",
      cf:   "e^{-\\sigma^2 t^2/2}\\left(1+\\text{erfi}\\!\\left(\\frac{\\sigma t}{\\sqrt{2}}\\right)\\right)",
    },
    story: "Take a Normal(0, sigma^2) variable and fold it at zero — keep only the positive side, doubling its density. Popular in modern Bayesian statistics as a weakly informative prior for standard deviations and scale parameters, replacing the once-common Inverse-Gamma prior.",
    assumptions: [
      "Non-negative continuous data",
      "Derived from folding Normal(0, sigma^2) at zero",
      "Mode is always at zero",
      "Right-skewed with a single parameter sigma",
    ],
    useCases: [
      "Bayesian prior for standard deviations in hierarchical models",
      "Prior for scale parameters (weakly informative, keeps sigma positive)",
      "Modelling absolute measurement errors",
      "Default weakly-informative prior in Stan/PyMC models",
    ],
    failureModes: [
      { condition: "Mode not at zero", use: "Weibull or Log-Normal" },
      { condition: "Need heavier tail", use: "Half-Cauchy prior" },
    ],
    related: ["normal", "inverse_gamma", "rayleigh"],
  },

  {
    id: "poisson_binomial",
    name: "Poisson Binomial",
    family: "discrete_bounded",
    type: "discrete",
    tagline: "Sum of independent Bernoulli trials with different success probabilities",
    wikiSlug: "Poisson_binomial_distribution",
    params: [
      { name: "n",     label: "Number of trials n", min: 2, max: 20, step: 1, default: 10, desc: "Total independent trials" },
      { name: "p_bar", label: "Mean probability p̅", min: 0.05, max: 0.95, step: 0.05, default: 0.4, desc: "Average success probability" },
    ],
    support: "k ∈ {0, 1, …, n}",
    supportFn: ({ n }) => [0, n],
    pmf: (k, { n, p_bar }) => {
      // Use Normal approximation for display (exact computation is complex)
      const mu = n * p_bar;
      const v = n * p_bar * (1 - p_bar) * (1 + 0.1); // slightly more variance than Binomial
      if (v <= 0) return 0;
      const lo = Math.floor(mu - 4 * Math.sqrt(v));
      const hi = Math.ceil(mu + 4 * Math.sqrt(v));
      if (k < lo || k > hi) return 0;
      return Math.exp(-Math.pow(k - mu, 2) / (2 * v)) / Math.sqrt(2 * Math.PI * v);
    },
    pdfPoints: ({ n, p_bar }) => {
      // Compute via DFT approximation
      const mu = n * p_bar;
      const v = n * p_bar * (1 - p_bar) * 1.1;
      return Array.from({ length: n + 1 }, (_, k) => {
        const y = Math.exp(-Math.pow(k - mu, 2) / (2 * v)) / Math.sqrt(2 * Math.PI * v);
        return { x: k, y: isFinite(y) ? y : 0 };
      });
    },
    stats: {
      mean:     ({ n, p_bar }) => n * p_bar,
      variance: ({ n, p_bar }) => n * p_bar * (1 - p_bar),
      skewness: ({ n, p_bar }) => (1 - 2 * p_bar) / Math.sqrt(n * p_bar * (1 - p_bar)),
      kurtosis: () => NaN,
    },
    formulas: {
      pmf:  "P(X=k)=\\sum_{A\\subseteq\\{1,\\ldots,n\\},|A|=k}\\prod_{i\\in A}p_i\\prod_{j\\notin A}(1-p_j)",
      mean: "\\sum_{i=1}^n p_i",
      var:  "\\sum_{i=1}^n p_i(1-p_i)",
      skew: "\\frac{\\sum p_i(1-p_i)(1-2p_i)}{(\\sum p_i(1-p_i))^{3/2}}",
      mgf:  "\\prod_{i=1}^n (1-p_i+p_i e^t)",
      pgf:  "\\prod_{i=1}^n (1-p_i+p_i z)",
      cf:   "\\prod_{i=1}^n (1-p_i+p_i e^{it})",
    },
    story: "A generalisation of the Binomial where each trial has its own success probability p_i. The Binomial is the special case where all p_i are equal. Arises in any scenario with heterogeneous per-item success probabilities — e.g., click rates on different ad creatives, or default probabilities across a heterogeneous loan portfolio.",
    assumptions: [
      "n independent Bernoulli trials",
      "Each trial i has its own probability p_i (they can all differ)",
      "Reduces to Binomial when all p_i are equal",
      "Exact computation via DFT (discrete Fourier transform)",
    ],
    useCases: [
      "Expected number of conversions across ads with different CTRs",
      "Portfolio credit risk: sum of heterogeneous default probabilities",
      "Survey response modelling with different response propensities",
      "Multi-item test scoring with varying item difficulty",
    ],
    failureModes: [
      { condition: "All probabilities are equal", use: "Binomial distribution (simpler)" },
      { condition: "p varies continuously (Beta distribution)", use: "Beta-Binomial distribution" },
    ],
    related: ["binomial", "beta_binomial", "bernoulli"],
  },

  {
    id: "multinomial",
    vizType: "multinomial_bars",
    name: "Multinomial",
    family: "multivariate",
    type: "multivariate",
    tagline: "Generalisation of Binomial to k categories",
    wikiSlug: "Multinomial_distribution",
    params: [],
    support: "xᵢ ≥ 0, Σxᵢ = n",
    supportFn: () => [0, 1],
    pdfPoints: () => [],
    stats: {
      mean:     () => "npᵢ per category",
      variance: () => "npᵢ(1−pᵢ) per category",
      skewness: () => "(1−2pᵢ)/√(npᵢ(1−pᵢ))",
      kurtosis: () => "(1−6pᵢ(1−pᵢ))/(npᵢ(1−pᵢ))",
    },
    formulas: {
      pmf:  "P(X_1=x_1,\\ldots,X_k=x_k)=\\frac{n!}{x_1!\\cdots x_k!}p_1^{x_1}\\cdots p_k^{x_k}",
      mean: "np_i",
      var:  "np_i(1-p_i)",
      skew: "\\frac{1-2p_i}{\\sqrt{np_i(1-p_i)}}",
      mgf:  "\\left(\\sum_{i=1}^k p_i e^{t_i}\\right)^n",
      pgf:  "\\left(\\sum_{i=1}^k p_i z_i\\right)^n",
      cf:   "\\left(\\sum_{i=1}^k p_i e^{it_i}\\right)^n",
    },
    story: "Roll a k-sided die n times and count outcomes in each category. The Binomial is the k=2 special case. The Multinomial is the likelihood for any categorical count data — the foundation of topic modelling (LDA), naive Bayes text classification, and contingency table analysis.",
    assumptions: [
      "n trials, each resulting in exactly one of k categories",
      "Constant probability p_i for each category across all trials",
      "Trials are independent",
      "Sum of counts equals n; sum of probabilities equals 1",
    ],
    useCases: [
      "Chi-squared goodness-of-fit test likelihood",
      "Naive Bayes text classifier (word count distributions)",
      "Topic modelling (LDA): word counts per document",
      "Multi-class classification output probabilities",
      "Survey data: responses across multiple categories",
    ],
    failureModes: [
      { condition: "k = 2 categories", use: "Binomial distribution (simpler)" },
      { condition: "Category probabilities vary across observations", use: "Dirichlet-Multinomial" },
    ],
    related: ["binomial", "dirichlet", "bernoulli"],
  },

  {
    id: "beta_prime",
    name: "Beta Prime",
    family: "continuous_positive",
    type: "continuous",
    tagline: "Ratio of two independent Gamma variables",
    wikiSlug: "Beta_prime_distribution",
    presets: [
      { label: "Right-skewed", params: { alpha: 2, beta_: 5 } },
      { label: "Symmetric-ish", params: { alpha: 4, beta_: 4 } },
      { label: "Heavy right tail", params: { alpha: 1, beta_: 2 } },
    ],
    params: [
      { name: "alpha", label: "Shape α", min: 0.5, max: 10, step: 0.1, default: 2, desc: "α > 0" },
      { name: "beta_", label: "Shape β", min: 0.5, max: 10, step: 0.1, default: 3, desc: "β > 0" },
    ],
    support: "x > 0",
    supportFn: () => [0, null],
    pdf: (x, { alpha, beta_ }) => {
      if (x <= 0) return 0;
      return Math.exp((alpha - 1) * Math.log(x) - (alpha + beta_) * Math.log(1 + x) - logBeta(alpha, beta_));
    },
    pdfPoints: ({ alpha, beta_ }) => {
      const mode = alpha > 1 ? (alpha - 1) / (beta_ + 1) : 0.01;
      const hi = mode * 10 + 3;
      return Array.from({ length: 200 }, (_, i) => {
        const x = 0.001 + i * hi / 199;
        const y = Math.exp((alpha - 1) * Math.log(x) - (alpha + beta_) * Math.log(1 + x) - logBeta(alpha, beta_));
        return { x: parseFloat(x.toFixed(3)), y: isFinite(y) ? y : 0 };
      });
    },
    stats: {
      mean:     ({ alpha, beta_ }) => beta_ > 1 ? alpha / (beta_ - 1) : Infinity,
      variance: ({ alpha, beta_ }) => beta_ > 2 ? alpha * (alpha + beta_ - 1) / (Math.pow(beta_ - 1, 2) * (beta_ - 2)) : Infinity,
      skewness: ({ alpha, beta_ }) => beta_ > 3
        ? 2 * (2 * alpha + beta_ - 1) / (beta_ - 3) * Math.sqrt((beta_ - 2) / (alpha * (alpha + beta_ - 1)))
        : NaN,
      kurtosis: () => NaN,
    },
    formulas: {
      pdf:  "f(x)=\\frac{x^{\\alpha-1}(1+x)^{-(\\alpha+\\beta)}}{B(\\alpha,\\beta)},\\; x>0",
      mean: "\\frac{\\alpha}{\\beta-1}\\;(\\beta>1)",
      var:  "\\frac{\\alpha(\\alpha+\\beta-1)}{(\\beta-1)^2(\\beta-2)}\\;(\\beta>2)",
      skew: "\\frac{2(2\\alpha+\\beta-1)}{\\beta-3}\\sqrt{\\frac{\\beta-2}{\\alpha(\\alpha+\\beta-1)}}\\;(\\beta>3)",
      mgf:  "\\text{Does not exist in general}",
      pgf:  "\\text{N/A (continuous)}",
      cf:   "U(\\alpha,1-\\beta,-it)\\frac{\\Gamma(\\alpha+\\beta)}{\\Gamma(\\beta)}\\frac{(-it)^\\alpha}{\\Gamma(\\alpha)}\\text{ (Kummer U)}",
    },
    story: "If X ~ Beta(alpha, beta), then X/(1-X) ~ Beta Prime(alpha, beta). Equivalently: ratio of two independent Gamma variables Gamma(alpha,1) / Gamma(beta,1). Also called the inverted beta distribution or beta distribution of the second kind. Used in Bayesian analysis and as the compound F-distribution.",
    assumptions: [
      "Positive continuous variable (unbounded above)",
      "Related to Beta: if X ~ Beta, then X/(1-X) ~ Beta Prime",
      "Two shape parameters controlling concentration and tail behaviour",
    ],
    useCases: [
      "Prior distribution for variance ratios in Bayesian models",
      "Modelling positive-valued financial ratios",
      "Compound distribution: F-distribution is a scaled Beta Prime",
      "Bayesian nonparametric stick-breaking processes",
    ],
    failureModes: [
      { condition: "Variable bounded in [0,1]", use: "Beta distribution" },
      { condition: "Comparing two variances statistically", use: "F-distribution" },
    ],
    related: ["beta", "gamma", "f_distribution", "pareto"],
  },


];

// ─────────────────────────────────────────────────────────────────────────────
// QUESTIONNAIRE for "I have data — what distribution fits?"
// ─────────────────────────────────────────────────────────────────────────────
export const QUESTIONNAIRE = {
  q_type: {
    question: "What type of data are you working with?",
    options: [
      { label: "Counts or integers  (0, 1, 2, 3, …)", icon: "ℕ", next: "q_count_bounded" },
      { label: "Continuous measurements", icon: "∿", next: "q_cont_bounded" },
      { label: "Proportions or probabilities  (between 0 and 1)", icon: "%", next: "q_proportion" },
      { label: "Multiple related variables simultaneously", icon: "⊞", next: "q_multivariate" },
    ],
  },
  q_count_bounded: {
    question: "Is there a fixed upper limit on the count?",
    options: [
      { label: "Yes — counts go from 0 to some maximum n", icon: "⬡", next: "q_count_replacement" },
      { label: "No — counts can be arbitrarily large", icon: "∞", next: "q_count_mean_var" },
    ],
  },
  q_count_replacement: {
    question: "Are you sampling with or without replacement?",
    options: [
      { label: "With replacement  (or population is very large)", icon: "↺", next: "q_binomial_p_fixed" },
      { label: "Without replacement  (finite population)", icon: "⇥", next: "leaf_q_hypergeometric" },
    ],
  },
  q_binomial_p_fixed: {
    question: "Is the success probability the same for each trial?",
    options: [
      { label: "Yes — constant p across all trials", icon: "✓", next: "leaf_q_binomial" },
      { label: "No — p varies across subjects or groups", icon: "~", next: "leaf_q_beta_binomial" },
    ],
  },
  q_count_mean_var: {
    question: "How does variance compare to mean in your data?",
    options: [
      { label: "Variance ≈ Mean  (equidispersed)", icon: "≈", next: "leaf_q_poisson" },
      { label: "Variance >> Mean  (overdispersed)", icon: ">", next: "leaf_q_neg_binomial" },
      { label: "Excess zeros beyond what Poisson predicts", icon: "0", next: "leaf_q_zip" },
      { label: "Trials until first success  (discrete waiting time)", icon: "?", next: "leaf_q_geometric" },
      { label: "Multiple trials, each with different p (heterogeneous)", icon: "~", next: "leaf_q_poisson_binomial" },
    ],
  },
  q_cont_bounded: {
    question: "What is the support (range of possible values)?",
    options: [
      { label: "Strictly positive  (0 to ∞)", icon: ">0", next: "q_positive_shape" },
      { label: "Any real number  (−∞ to +∞)", icon: "ℝ", next: "q_real_tails" },
      { label: "Bounded interval  [a, b]", icon: "[]", next: "q_bounded_info" },
    ],
  },
  q_positive_shape: {
    question: "What is the shape of the distribution?",
    options: [
      { label: "Strictly decreasing from zero (L-shaped)", icon: "\\", next: "q_exponential_vs_pareto" },
      { label: "Unimodal — one hump, right-skewed", icon: "⌒", next: "q_positive_skew" },
      { label: "Survival / time-to-event data", icon: "⏱", next: "q_survival_hazard" },
      { label: "Sum of k identical exponential waiting times", icon: "Σ", next: "leaf_q_erlang" },
      { label: "Distance / magnitude in 2D (e.g. wind speed)", icon: "⇱", next: "leaf_q_rayleigh" },
      { label: "Conjugate prior for a variance parameter", icon: "σ", next: "leaf_q_inv_gamma" },
    ],
  },
  q_exponential_vs_pareto: {
    question: "How heavy is the right tail?",
    options: [
      { label: "Thin tail  (exponential decay)", icon: "·", next: "leaf_q_exponential" },
      { label: "Heavy power-law tail  (80/20 rule)", icon: "∞", next: "leaf_q_pareto" },
    ],
  },
  q_positive_skew: {
    question: "Is the log of your variable approximately Normal?",
    options: [
      { label: "Yes  (histogram of log(x) looks bell-shaped)", icon: "✓", next: "leaf_q_lognormal" },
      { label: "No  (or I want to model waiting times / sums)", icon: "?", next: "leaf_q_gamma" },
      { label: "Sum of squared standard Normal variables (test statistic)", icon: "χ", next: "leaf_q_chi_sq" },
      { label: "Ratio of two positive Gamma/Beta variables", icon: "/", next: "leaf_q_beta_prime" },
    ],
  },
  q_survival_hazard: {
    question: "What is the hazard rate pattern?",
    options: [
      { label: "Constant hazard  (memoryless)", icon: "—", next: "leaf_q_exponential" },
      { label: "Increasing hazard  (wear-out / aging)", icon: "↗", next: "leaf_q_weibull" },
      { label: "Decreasing hazard  (infant mortality)", icon: "↘", next: "leaf_q_weibull" },
      { label: "Extreme values / block maxima", icon: "⚡", next: "leaf_q_gev" },
    ],
  },
  q_real_tails: {
    question: "What are the tails like?",
    options: [
      { label: "Light tails, symmetric  (bell curve)", icon: "⌒", next: "leaf_q_normal" },
      { label: "Heavy tails, symmetric  (outliers common)", icon: "~", next: "leaf_q_student_t" },
      { label: "Right-skewed / right-heavy tail", icon: "→", next: "leaf_q_gumbel" },
      { label: "Sharp peak, heavier tails  (Lasso priors)", icon: "▲", next: "leaf_q_laplace" },
      { label: "Positive-only  (folded Normal / absolute value)", icon: "|x|", next: "leaf_q_half_normal" },
    ],
  },
  q_bounded_info: {
    question: "What kind of bounded variable is it?",
    options: [
      { label: "All values equally likely", icon: "—", next: "leaf_q_uniform" },
      { label: "Models a probability, rate, or proportion", icon: "%", next: "leaf_q_beta_from_bounded" },
    ],
  },
  q_proportion: {
    question: "Do you have counts of successes and failures, or a raw proportion?",
    options: [
      { label: "Raw proportion (0–1 continuous)", icon: "∿", next: "leaf_q_beta_from_proportion" },
      { label: "Counts of successes out of n trials", icon: "ℕ", next: "leaf_q_binomial" },
      { label: "Counts across k categories (sum to n)", icon: "⊞", next: "leaf_q_multinomial" },
    ],
  },
  q_multivariate: {
    question: "What kind of multivariate data?",
    options: [
      { label: "Vector of continuous measurements", icon: "∿", next: "leaf_q_mvn" },
      { label: "Vector of proportions summing to 1", icon: "%", next: "leaf_q_dirichlet" },
    ],
  },

  // ── Questionnaire Leaves ──────────────────────────────
  leaf_q_binomial:          { recommended: ["binomial", "bernoulli"] },
  leaf_q_hypergeometric:    { recommended: ["hypergeometric"] },
  leaf_q_beta_binomial:     { recommended: ["beta_binomial", "binomial"] },
  leaf_q_poisson:           { recommended: ["poisson"] },
  leaf_q_neg_binomial:      { recommended: ["negative_binomial", "poisson"] },
  leaf_q_zip:               { recommended: ["zero_inflated_poisson", "negative_binomial"] },
  leaf_q_geometric:         { recommended: ["geometric", "negative_binomial"] },
  leaf_q_exponential:       { recommended: ["exponential", "weibull"] },
  leaf_q_pareto:            { recommended: ["pareto", "log_normal"] },
  leaf_q_lognormal:         { recommended: ["log_normal", "gamma", "inverse_gaussian"] },
  leaf_q_gamma:             { recommended: ["gamma", "weibull", "inverse_gamma"] },
  leaf_q_weibull:           { recommended: ["weibull", "exponential", "log_logistic"] },
  leaf_q_gev:               { recommended: ["gev", "gumbel"] },
  leaf_q_normal:            { recommended: ["normal", "logistic", "skew_normal"] },
  leaf_q_student_t:         { recommended: ["student_t", "cauchy", "normal"] },
  leaf_q_gumbel:            { recommended: ["gumbel", "gev"] },
  leaf_q_laplace:           { recommended: ["laplace", "normal"] },
  leaf_q_uniform:           { recommended: ["uniform_cont", "triangular", "discrete_uniform"] },
  leaf_q_beta_from_bounded: { recommended: ["beta", "uniform_cont"] },
  leaf_q_beta_from_proportion: { recommended: ["beta", "beta_binomial"] },
  leaf_q_mvn:               { recommended: ["multivariate_normal"] },
  leaf_q_erlang:            { recommended: ["erlang", "gamma"] },
  leaf_q_rayleigh:          { recommended: ["rayleigh", "weibull"] },
  leaf_q_inv_gamma:         { recommended: ["inverse_gamma", "half_normal"] },
  leaf_q_half_normal:       { recommended: ["half_normal", "rayleigh"] },
  leaf_q_poisson_binomial:  { recommended: ["poisson_binomial", "binomial"] },
  leaf_q_chi_sq:            { recommended: ["chi_squared", "f_distribution"] },
  leaf_q_dirichlet:         { recommended: ["dirichlet", "beta"] },
  leaf_q_multinomial:       { recommended: ["multinomial", "binomial"] },
  leaf_q_beta_prime:        { recommended: ["beta_prime", "gamma"] },
};

// ─────────────────────────────────────────────────────────────────────────────
// MATH HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// Error function approximation (for Skew-Normal)
function erf(x) {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - (((((1.061405429*t - 1.453152027)*t) + 1.421413741)*t - 0.284496736)*t + 0.254829592)*t * Math.exp(-x*x);
  return sign * y;
}

function logFactorial(n) {
  if (n <= 1) return 0;
  let s = 0;
  for (let i = 2; i <= n; i++) s += Math.log(i);
  return s;
}

function logBinomCoeff(n, k) {
  if (k < 0 || k > n) return -Infinity;
  return logFactorial(n) - logFactorial(k) - logFactorial(n - k);
}

function logBeta(a, b) {
  return logGamma(a) + logGamma(b) - logGamma(a + b);
}

// Lanczos approximation for log-gamma
function logGamma(x) {
  if (x <= 0) return Infinity;
  const g = 7;
  const c = [0.99999999999980993,676.5203681218851,-1259.1392167224028,
    771.32342877765313,-176.61502916214059,12.507343278686905,
    -0.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * x)) - logGamma(1 - x);
  x -= 1;
  let a = c[0];
  const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}
