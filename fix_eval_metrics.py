path = 'frontend/src/pages/marketing/EvaluationPage.tsx'
with open(path, 'r') as f:
    c = f.read()

c = c.replace("> 1,000 rps", "O(N) Complexity")
c = c.replace("100% Precision", "Penny-Exact Math")
c = c.replace("'0'", "'Strict Float-Free'")

with open(path, 'w') as f:
    f.write(c)
