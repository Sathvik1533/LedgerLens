import re

with open("frontend/src/pages/app/QueuePage.tsx", "r") as f:
    c = f.read()

# Fix Copy Action Tooltip
copy_button = '''<button
                                  onClick={(e) => copyToClipboard(item.payment_id, e)}
                                  className="inline-flex items-center gap-1 bg-paper-0 border border-rule-300 px-1.5 py-0.5 rounded shadow-sm hover:bg-paper-1 hover:text-ink-900 transition-colors"
                                >
                                  <span>{item.payment_id}</span>
                                  {copiedId === item.payment_id ? <Check className="w-2.5 h-2.5 text-matched-green" /> : <Copy className="w-2.5 h-2.5 opacity-60" />}
                                </button>'''

new_copy_button = '''<Tooltip content="Copy Payment ID to clipboard">
                                <button
                                  onClick={(e) => copyToClipboard(item.payment_id, e)}
                                  className="inline-flex items-center gap-1 bg-paper-0 border border-rule-300 px-1.5 py-0.5 rounded shadow-sm hover:bg-paper-1 hover:text-ink-900 transition-colors focus-ring"
                                  aria-label={`Copy payment ID ${item.payment_id}`}
                                >
                                  <span>{item.payment_id}</span>
                                  {copiedId === item.payment_id ? <Check className="w-2.5 h-2.5 text-matched-green" /> : <Copy className="w-2.5 h-2.5 opacity-60" />}
                                </button>
                                </Tooltip>'''
c = c.replace(copy_button, new_copy_button)

# Fix Refresh Action Tooltip
refresh_button = '''<button onClick={loadQueue} className="px-4 py-2 bg-white border border-ledger-vermilion text-ledger-vermilion rounded text-xs font-semibold shadow-sm hover:bg-paper-0 transition-colors flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
          </button>'''
new_refresh_button = '''<Tooltip content="Refresh the queue data from the server">
          <button onClick={loadQueue} className="px-4 py-2 bg-white border border-ledger-vermilion text-ledger-vermilion rounded text-xs font-semibold shadow-sm hover:bg-paper-0 transition-colors flex items-center gap-2 focus-ring">
            <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
          </button>
          </Tooltip>'''
c = c.replace(refresh_button, new_refresh_button)

# Severity Tag
sev_tag = '''<span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-widest ${
                                  item.severity === 'Critical' ? 'bg-ledger-vermilion/10 text-ledger-vermilion border border-ledger-vermilion' :
                                    item.severity === 'High' ? 'bg-advisory-amber/10 text-advisory-amber border border-advisory-amber' :
                                      'bg-ink-900/10 text-ink-900 border border-ink-900'
                                }`}>
                                  {item.severity}
                                </span>'''
new_sev_tag = '''<Tooltip content={`Exposure is ${item.severity === 'Critical' ? '> ₹500' : '< ₹500'}`}>
                                <span tabIndex={0} className={`focus-ring inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-widest ${
                                  item.severity === 'Critical' ? 'bg-ledger-vermilion/10 text-ledger-vermilion border border-ledger-vermilion' :
                                    item.severity === 'High' ? 'bg-advisory-amber/10 text-advisory-amber border border-advisory-amber' :
                                      'bg-ink-900/10 text-ink-900 border border-ink-900'
                                }`}>
                                  {item.severity}
                                </span>
                                </Tooltip>'''
c = c.replace(sev_tag, new_sev_tag)

with open("frontend/src/pages/app/QueuePage.tsx", "w") as f:
    f.write(c)
