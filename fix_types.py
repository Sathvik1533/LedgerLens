import re

path = 'frontend/src/pages/IngestionFeedsPage.tsx'
with open(path, 'r') as f:
    content = f.read()

# Fix the mess I made
content = content.replace('useState<"payments" | "settlements" | "refunds" | "bank-credits">(\'payments\')', 'useState<"payments" | "settlements" | "refunds" | "bank-credits">(\'payments\')')
content = content.replace('useState<"payments" | "settlements" | "refunds" | "bank-credits">(\'\')', 'useState<string>(\'\')')
content = content.replace('useState<"payments" | "settlements" | "refunds" | "bank-credits">', 'useState<string>')

# But wait, selectedFeed must be typed explicitly as the union
# Let's fix selectedFeed explicitly
content = content.replace("const [selectedFeed, setSelectedFeed] = useState<string>('payments');", "const [selectedFeed, setSelectedFeed] = React.useState<'payments' | 'settlements' | 'refunds' | 'bank-credits'>('payments');")

# Also need to cast `feed.id as any` when calling setSelectedFeed in map if feed.id is string
content = content.replace("onClick={() => setSelectedFeed(feed.id)}", "onClick={() => setSelectedFeed(feed.id as any)}")

with open(path, 'w') as f:
    f.write(content)
