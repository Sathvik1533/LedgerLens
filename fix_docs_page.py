with open("frontend/src/pages/marketing/DocsPage.tsx", "r") as f:
    c = f.read()

# Update the token display
c = c.replace('#F9F9FB (paper-0)', '#181C25 (canvas)')
c = c.replace('#FFFFFF (paper-1)', '#222733 (surface)')
c = c.replace('#111827 (ink-900)', '#F8FAFC (text-primary)')
c = c.replace('#4B5563 (ink-700)', '#94A3B8 (text-secondary)')
c = c.replace('#E5E7EB (rule-300)', '#3A4150 (border)')
c = c.replace('#DC2626 (vermilion)', '#F43F5E (critical)')
c = c.replace('#D97706 (amber)', '#F59E0B (high)')
c = c.replace('#059669 (green)', '#10B981 (resolved)')

with open("frontend/src/pages/marketing/DocsPage.tsx", "w") as f:
    f.write(c)
