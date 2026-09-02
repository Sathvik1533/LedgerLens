import re

path = 'frontend/src/pages/app/QueuePage.tsx'
with open(path, 'r') as f:
    content = f.read()

# We need to completely overwrite the return statement block.
# I will just write a new file instead of regexing.
