with open("frontend/src/components/AmountDisplay.tsx", "r") as f:
    c = f.read()

if "import { Tooltip }" not in c:
    c = c.replace("import React from 'react';", "import React from 'react';\nimport { Tooltip } from './Tooltip';")

old_return = '''return (
    <span className={`font-mono font-tabular ${colorClass} ${className}`}>
      {isNegative ? `-${symbol}${absFormatted}` : `${symbol}${absFormatted}`}
    </span>
  );'''

new_return = '''const content = (
    <span tabIndex={0} className={`focus-ring inline-block font-mono font-tabular ${colorClass} ${className}`}>
      {isNegative ? `-${symbol}${absFormatted}` : `${symbol}${absFormatted}`}
    </span>
  );

  if (isDiscrepancy) {
    const tooltipText = Math.abs(num) > 0.001 
      ? 'The exact mathematical difference between expected and received amounts.'
      : 'Values match exactly with zero discrepancy.';
    
    return (
      <Tooltip content={tooltipText}>
        {content}
      </Tooltip>
    );
  }

  return content;'''

c = c.replace(old_return, new_return)

with open("frontend/src/components/AmountDisplay.tsx", "w") as f:
    f.write(c)
