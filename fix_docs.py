with open("frontend/src/pages/marketing/DocsPage.tsx", "r") as f:
    c = f.read()

tokens_jsx = '''
        <motion.div variants={FADE_UP} className="mt-16 bg-white border border-rule-300 rounded-2xl p-8 shadow-sm">
          <h3 className="text-xl text-ink-900 font-display font-bold mb-6">Design System: Direction A (The Clear Ledger)</h3>
          
          <div className="space-y-8">
            <div>
              <h4 className="text-xs font-mono text-ink-700 uppercase tracking-widest mb-4">Typography</h4>
              <div className="grid gap-4">
                <div className="flex items-baseline gap-4 border-b border-rule-300 pb-2">
                  <div className="font-display font-bold text-4xl text-ink-900 w-32">Aa</div>
                  <div className="text-sm">
                    <span className="font-semibold block text-ink-900">Manrope (Display & Headings)</span>
                    <span className="text-ink-700">Weights: 500, 600, 700, 800</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-4 border-b border-rule-300 pb-2">
                  <div className="font-sans text-3xl text-ink-900 w-32">Aa</div>
                  <div className="text-sm">
                    <span className="font-semibold block text-ink-900">Inter (UI & Data)</span>
                    <span className="text-ink-700">Weights: 400, 500, 600</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-4">
                  <div className="font-mono text-2xl text-ink-900 w-32">0123</div>
                  <div className="text-sm">
                    <span className="font-semibold block text-ink-900">Geist Mono (Identifiers & Hashes)</span>
                    <span className="text-ink-700">Weights: 400, 500</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-mono text-ink-700 uppercase tracking-widest mb-4">Color Palette</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="h-12 w-full rounded border border-rule-300 bg-paper-0"></div>
                  <div className="text-xs"><span className="font-semibold text-ink-900 block">Canvas</span><span className="text-ink-700 font-mono text-[10px]">#F9F9FB (paper-0)</span></div>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-full rounded border border-rule-300 bg-paper-1"></div>
                  <div className="text-xs"><span className="font-semibold text-ink-900 block">Surface</span><span className="text-ink-700 font-mono text-[10px]">#FFFFFF (paper-1)</span></div>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-full rounded bg-ink-900"></div>
                  <div className="text-xs"><span className="font-semibold text-ink-900 block">Primary Text</span><span className="text-ink-700 font-mono text-[10px]">#111827 (ink-900)</span></div>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-full rounded bg-ink-700"></div>
                  <div className="text-xs"><span className="font-semibold text-ink-900 block">Secondary Text</span><span className="text-ink-700 font-mono text-[10px]">#4B5563 (ink-700)</span></div>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-full rounded bg-rule-300"></div>
                  <div className="text-xs"><span className="font-semibold text-ink-900 block">Borders</span><span className="text-ink-700 font-mono text-[10px]">#E5E7EB (rule-300)</span></div>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-full rounded bg-ledger-vermilion"></div>
                  <div className="text-xs"><span className="font-semibold text-ink-900 block">Critical</span><span className="text-ink-700 font-mono text-[10px]">#DC2626 (vermilion)</span></div>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-full rounded bg-advisory-amber"></div>
                  <div className="text-xs"><span className="font-semibold text-ink-900 block">High / Review</span><span className="text-ink-700 font-mono text-[10px]">#D97706 (amber)</span></div>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-full rounded bg-matched-green"></div>
                  <div className="text-xs"><span className="font-semibold text-ink-900 block">Resolved</span><span className="text-ink-700 font-mono text-[10px]">#059669 (green)</span></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
'''

c = c.replace('</div>\n    </div>\n  );\n}', tokens_jsx + '    </div>\n  );\n}')

with open("frontend/src/pages/marketing/DocsPage.tsx", "w") as f:
    f.write(c)
