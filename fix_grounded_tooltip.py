with open("frontend/src/components/RagCopilotPanel.tsx", "r") as f:
    c = f.read()

# Make sure Tooltip is imported
if "import { Tooltip }" not in c:
    c = c.replace("import { CitationCard }", "import { Tooltip } from './Tooltip';\nimport { CitationCard }")

old_tag = '''<span
              className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                result.is_confident
                  ? 'bg-resolved-subtle text-matched-green border-resolved-border'
                  : 'bg-warning-subtle text-advisory-amber border-warning-border'
              }`}
            >
              {result.is_confident ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-matched-green" aria-hidden="true" />
                  <span>Grounded (Cosine &ge; 0.35)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-advisory-amber" aria-hidden="true" />
                  <span>Fallback (Low Cosine)</span>
                </>
              )}
            </span>'''

new_tag = '''<Tooltip content="Whether the advisory explanation is sufficiently supported by retrieved policy evidence.">
            <span
              tabIndex={0}
              className={`focus-ring hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                result.is_confident
                  ? 'bg-resolved-subtle text-matched-green border-resolved-border'
                  : 'bg-warning-subtle text-advisory-amber border-warning-border'
              }`}
            >
              {result.is_confident ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-matched-green" aria-hidden="true" />
                  <span>Evidence grounding</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-advisory-amber" aria-hidden="true" />
                  <span>Evidence grounding (Low)</span>
                </>
              )}
            </span>
            </Tooltip>'''

c = c.replace(old_tag, new_tag)

with open("frontend/src/components/RagCopilotPanel.tsx", "w") as f:
    f.write(c)
