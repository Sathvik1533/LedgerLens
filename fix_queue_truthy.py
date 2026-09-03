with open("frontend/src/pages/app/QueuePage.tsx", "r") as f:
    c = f.read()

c = c.replace(
    "{item.exception_type ? EXCEPTION_CONFIG[item.exception_type]?.explanation : 'Manual investigation required' || 'Manual investigation required for financial discrepancy.'}",
    "{(item.exception_type && EXCEPTION_CONFIG[item.exception_type]) ? EXCEPTION_CONFIG[item.exception_type].explanation : 'Manual investigation required for financial discrepancy.'}"
)

with open("frontend/src/pages/app/QueuePage.tsx", "w") as f:
    f.write(c)
