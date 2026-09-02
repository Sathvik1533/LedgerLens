path = 'frontend/src/pages/SettingsPage.tsx'
with open(path, 'r') as f:
    c = f.read()

c = c.replace("System Telemetry", "System Architecture & Capabilities (Static Info)")
c = c.replace("Active Feed Pipeline:", "Supported Feeds (Configured):")
c = c.replace("● 4 Feeds Live", "4 Active")
c = c.replace("Database Engine:", "Configured Target DB:")

with open(path, 'w') as f:
    f.write(c)
