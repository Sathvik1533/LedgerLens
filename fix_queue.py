path = 'frontend/src/pages/app/QueuePage.tsx'
with open(path, 'r') as f:
    c = f.read()

# Fix the missing onClick on severity radio buttons
bad_label = """<label key={sev} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedSeverity === sev ? 'bg-ink-900 border-ink-900' : 'bg-paper-0 border-rule-300 group-hover:border-ink-900'}`}>"""
good_label = """<label key={sev} className="flex items-center gap-3 cursor-pointer group focus-ring">
                    <input type="radio" name="severity" value={sev} checked={selectedSeverity === sev} onChange={() => setSelectedSeverity(sev)} className="hidden" />
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedSeverity === sev ? 'bg-ink-900 border-ink-900' : 'bg-paper-0 border-rule-300 group-hover:border-ink-900'}`}>"""
c = c.replace(bad_label, good_label)

# Make sidebar scrollable and prevent lenis hijacking
c = c.replace('className="w-full md:w-72 shrink-0 md:sticky top-28 self-start"',
              'className="w-full md:w-72 shrink-0 md:sticky top-28 self-start max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar pb-10" data-lenis-prevent="true"')

with open(path, 'w') as f:
    f.write(c)

# Fix CustomSelect
path2 = 'frontend/src/components/CustomSelect.tsx'
with open(path2, 'r') as f:
    c2 = f.read()

c2 = c2.replace('className="max-h-60 overflow-y-auto py-1"',
                'className="max-h-60 overflow-y-auto py-1 custom-scrollbar" data-lenis-prevent="true"')

with open(path2, 'w') as f:
    f.write(c2)
