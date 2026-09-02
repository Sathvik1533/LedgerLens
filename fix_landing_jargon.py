path = 'frontend/src/pages/marketing/LandingPage.tsx'
with open(path, 'r') as f:
    c = f.read()

c = c.replace("Deterministic 3-Way Parity", "Automated Financial Matching")
c = c.replace("A deterministic control room", "A financial control room")
c = c.replace("ACID Audit Logs", "Permanent Audit Logs")
c = c.replace("append-only cryptographic receipts", "permanent, time-stamped records")
c = c.replace("Deterministic Matching", "Exact Matching First")
c = c.replace("Grounds AI decisions in hard facts and contractual formulas. Resolves exact matches automatically and safely blocks impossible mathematical leaps.", "Matches records perfectly based on actual bank data. AI never guesses numbers—it only flags where the math fails.")
c = c.replace("Read the Whitepaper", "See How It Works")
c = c.replace("built on hard database invariants", "built on strict financial rules")

with open(path, 'w') as f:
    f.write(c)
