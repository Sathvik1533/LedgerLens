import re

path = 'frontend/src/pages/SettingsPage.tsx'
with open(path, 'r') as f:
    content = f.read()

if "import { motion }" not in content:
    content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { motion } from 'framer-motion';")

with open(path, 'w') as f:
    f.write(content)
