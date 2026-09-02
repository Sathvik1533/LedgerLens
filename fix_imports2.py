path1 = 'frontend/src/layouts/AppLayout.tsx'
with open(path1, 'r') as f:
    c = f.read()
c = c.replace("Play,\n  Command", "Play")
with open(path1, 'w') as f:
    f.write(c)

path2 = 'frontend/src/pages/app/QueuePage.tsx'
with open(path2, 'r') as f:
    c = f.read()
c = c.replace("Filter,\n  Activity,", "Filter,")
with open(path2, 'w') as f:
    f.write(c)
