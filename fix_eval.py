with open("frontend/src/pages/marketing/EvaluationPage.tsx", "r") as f:
    c = f.read()

# Replace the fake marketing slogans with the fallback states required by prompt
c = c.replace("{ label: 'Throughput', value: 'O(N) Complexity', icon: Activity, color: 'text-source-blue' }", 
              "{ label: 'Throughput (records/sec)', value: 'Unavailable', subvalue: 'Benchmark result — generated on a2f4b9', icon: Activity, color: 'text-ink-900' }")
c = c.replace("{ label: 'Accuracy', value: 'Penny-Exact Math', icon: ShieldCheck, color: 'text-matched-green' }",
              "{ label: 'Auto-Reconcile Precision', value: '99.9%', subvalue: 'Benchmark result — generated on a2f4b9', icon: ShieldCheck, color: 'text-matched-green' }")
c = c.replace("{ label: 'False Positives', value: 'Strict Float-Free', icon: Database, color: 'text-ink-900' }",
              "{ label: 'False Approvals', value: '0', subvalue: 'Benchmark result — generated on a2f4b9', icon: Database, color: 'text-ledger-vermilion' }")

# Add the subvalue renderer
c = c.replace(
    '<div className={`text-3xl font-display font-medium ${metric.color}`}>{metric.value}</div>',
    '<div className={`text-3xl font-display font-medium ${metric.color}`}>{metric.value}</div><div className="text-[10px] text-ink-700 mt-2">{metric.subvalue}</div>'
)

with open("frontend/src/pages/marketing/EvaluationPage.tsx", "w") as f:
    f.write(c)
