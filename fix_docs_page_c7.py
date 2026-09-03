with open("frontend/src/pages/marketing/DocsPage.tsx", "r") as f:
    c = f.read()

# Update the token display
c = c.replace('#181C25 (canvas)', '#111111 (canvas)')
c = c.replace('#222733 (surface)', '#1E1E1E (surface)')
c = c.replace('#F8FAFC (text-primary)', '#F3F4F6 (text-primary)')
c = c.replace('#94A3B8 (text-secondary)', '#9CA3AF (text-secondary)')
c = c.replace('#3A4150 (border)', '#333333 (border)')
c = c.replace('#F43F5E (critical)', '#EF4444 (critical)')

with open("frontend/src/pages/marketing/DocsPage.tsx", "w") as f:
    f.write(c)
