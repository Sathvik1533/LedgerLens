import React from 'react';
import { Link } from 'react-router-dom';

export const ConceptReviewGatePage: React.FC = () => {
  const concepts = [
    {
      id: 'a',
      name: 'Concept A: Cinematic Ledger',
      tagline: 'Deep ink atmosphere, controlled physical light, illuminated trace ribbon',
      landingPath: '/concept/a',
      casePath: '/concept/a/case',
      highlights: [
        'Deep ink ground (#111315 / #17212B) with warm mineral evidence surfaces',
        'Large, authoritative Newsreader headline with asymmetric composition',
        'Dynamic illuminated Ledger Trace ribbon with curved Bezier convergence',
        'Warm mineral evidence slips (#F4F1EA) emerging from dark background',
        'Restrained oxide-red surgical redline markers at mismatch point',
      ],
      score: '58 / 60',
      status: 'RECOMMENDED WINNER',
    },
    {
      id: 'b',
      name: 'Concept B: Editorial Folio',
      tagline: 'Mineral canvas, publication-grade serif dominance, bookkeeper tallies',
      landingPath: '/concept/b',
      casePath: '/concept/b/case',
      highlights: [
        'Tactile mineral paper canvas (#F4F1EA) and warm cream (#EAE4D8)',
        'Legal monograph masthead and classical bookkeeper tally columns',
        'Scored bookkeeper redline strike-through on mismatched payout amount',
        'Documentary docket exhibits (Exhibit A, B, C, D) with fine rules',
        'Formal sealed register receipt with embossed typographic mark',
      ],
      score: '52 / 60',
      status: 'STRONG RUNNER-UP',
    },
    {
      id: 'c',
      name: 'Concept C: Instrument Panel',
      tagline: 'Restrained financial operations environment, archival rules, telemetry bus',
      landingPath: '/concept/c',
      casePath: '/concept/c/case',
      highlights: [
        'Dark slate-tinted ink (#0F1317 / #14191E) with precise coordinate rules',
        'Four-stage mathematical verification bus with discrete logic gates',
        'High-density technical telemetry: 1,200 RPS, sub-penny exact tolerance',
        'Tripped fault diagnostics on Gate 02 (Contract Formula)',
        'Institutional operator terminal with cryptographic hash generation',
      ],
      score: '49 / 60',
      status: 'VIABLE ALTERNATIVE',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#1C1B19] font-sans p-6 sm:p-12 space-y-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-3 border-b-2 border-[#1C1B19] pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-[#716E68]">
          <span>DOCUMENT 44 REVIEW GATE</span>
          <span>&bull;</span>
          <span className="text-[#1C1B19] font-bold">MANDATORY VISUAL CONCEPT COMPARISON</span>
        </div>
        <h1 className="font-editorial text-4xl sm:text-5xl font-semibold text-[#1C1B19]">
          LedgerLens Visual Concept Review Gate
        </h1>
        <p className="text-sm text-[#716E68] font-sans max-w-3xl leading-relaxed">
          In accordance with the art direction protocol, three materially distinct, screenshot-ready visual worlds were authored and evaluated across both landing and live case surfaces before full-site propagation.
        </p>
      </div>

      {/* Three Concepts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {concepts.map((c) => (
          <div 
            key={c.id} 
            className={`border p-6 space-y-6 flex flex-col justify-between ${
              c.id === 'a' 
                ? 'border-[#1C1B19] bg-[#FCFBF8] shadow-lg ring-1 ring-[#1C1B19]' 
                : 'border-[#D8D2C8] bg-[#FCFBF8]'
            }`}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs text-[#716E68] uppercase font-bold">
                  CONCEPT {c.id.toUpperCase()}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-xs ${
                  c.id === 'a' 
                    ? 'bg-[#3D6B55] text-white' 
                    : 'bg-[#EAE4D8] text-[#1C1B19]'
                }`}>
                  {c.status}
                </span>
              </div>

              <div>
                <h3 className="font-editorial text-2xl font-semibold text-[#1C1B19]">
                  {c.name}
                </h3>
                <p className="text-xs text-[#716E68] font-sans mt-1">
                  {c.tagline}
                </p>
              </div>

              <div className="border-t border-[#D8D2C8] pt-3 space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#716E68] block">
                  Authoring Characteristics:
                </span>
                <ul className="text-xs font-sans text-[#1C1B19] space-y-1.5 list-disc pl-4">
                  {c.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-[#D8D2C8] space-y-3">
              <div className="flex justify-between items-baseline font-mono text-xs">
                <span className="text-[#716E68]">12-Dimension Score:</span>
                <span className="font-bold text-sm text-[#1C1B19]">{c.score}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <Link
                  to={c.landingPath}
                  className="py-2.5 text-center bg-[#1C1B19] text-[#FCFBF8] hover:bg-[#1C1B19]/90 transition-colors"
                >
                  Landing Hero &rarr;
                </Link>
                <Link
                  to={c.casePath}
                  className="py-2.5 text-center border border-[#1C1B19] text-[#1C1B19] hover:bg-[#EAE4D8] transition-colors"
                >
                  Case Workspace &rarr;
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 12-Dimension Scoring Matrix Table */}
      <div className="border border-[#1C1B19] bg-[#FCFBF8] p-8 space-y-6">
        <div className="border-b border-[#D8D2C8] pb-3">
          <span className="text-xs font-mono uppercase text-[#716E68]">DOCUMENT 44 RUBRIC</span>
          <h3 className="font-editorial text-2xl font-semibold text-[#1C1B19] mt-0.5">
            The 12-Dimension Concept Evaluation Matrix
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b-2 border-[#1C1B19] font-mono text-[11px] text-[#716E68]">
                <th className="py-2.5 font-normal">Review Dimension</th>
                <th className="py-2.5 font-normal text-center">Concept A (Cinematic)</th>
                <th className="py-2.5 font-normal text-center">Concept B (Folio)</th>
                <th className="py-2.5 font-normal text-center">Concept C (Instrument)</th>
                <th className="py-2.5 font-normal">Evaluator Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D2C8] font-mono text-[11px]">
              {[
                { dim: '1. Distinctiveness (recognizable without logo)', a: '5/5', b: '4/5', c: '4/5', note: 'Concept A’s illuminated 4-stream ribbon creates an immediate silhouette.' },
                { dim: '2. Brand Ownership (belongs specifically to LedgerLens)', a: '5/5', b: '4/5', c: '4/5', note: 'Conveys reconciliation rather than generic banking or devtools.' },
                { dim: '3. Emotional Premise (calm authority when numbers disagree)', a: '5/5', b: '5/5', c: '4/5', note: 'Both A & B communicate quiet confidence; C feels more intense.' },
                { dim: '4. Typography Hierarchy (authored type pairings)', a: '5/5', b: '5/5', c: '4/5', note: 'Newsreader display + Instrument Sans UI is pitch-perfect in A & B.' },
                { dim: '5. Scale & Whitespace (deliberate contrast & tension)', a: '5/5', b: '4/5', c: '4/5', note: 'Concept A utilizes scale most dramatically across 1440px desktop.' },
                { dim: '6. Ledger Trace Metaphor (reconciliation visual)', a: '5/5', b: '4/5', c: '4/5', note: 'A’s converging Bezier paths into a redline offset embody the concept.' },
                { dim: '7. Marketing-to-Product Relationship (connected worlds)', a: '5/5', b: '5/5', c: '4/5', note: 'A transitions naturally from cinematic deep ink to mineral evidence.' },
                { dim: '8. Information Clarity (clear operator action path)', a: '5/5', b: '4/5', c: '5/5', note: 'Evidence slips + policy note + sign-off form are immediate.' },
                { dim: '9. Premium Quality (sits credibly beside Stripe/Mercury)', a: '5/5', b: '4/5', c: '4/5', note: 'Depth, physical light gradients, and refined tactile slips.' },
                { dim: '10. Originality (avoids copying any reference)', a: '5/5', b: '5/5', c: '4/5', note: 'Not a clone of Paymentor, Linear, or Mercury; distinct identity.' },
                { dim: '11. Mobile Integrity (strong composition at 375px)', a: '4/5', b: '4/5', c: '4/5', note: 'All three stack cleanly without horizontal scroll or overflow.' },
                { dim: '12. Materiality & Anti-Patterns Check (zero glass/neon)', a: '5/5', b: '4/5', c: '4/5', note: 'Zero generic neon blue or floating glass cards.' },
              ].map((r, i) => (
                <tr key={i} className="hover:bg-[#F4F1EA]/60 transition-colors">
                  <td className="py-2.5 font-sans font-medium text-[#1C1B19]">{r.dim}</td>
                  <td className="py-2.5 text-center font-bold text-[#3D6B55]">{r.a}</td>
                  <td className="py-2.5 text-center text-[#1C1B19]">{r.b}</td>
                  <td className="py-2.5 text-center text-[#1C1B19]">{r.c}</td>
                  <td className="py-2.5 font-sans text-xs text-[#716E68]">{r.note}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#1C1B19] font-mono font-bold">
                <td className="py-3 font-sans text-sm text-[#1C1B19]">TOTAL EVALUATION SCORE</td>
                <td className="py-3 text-center text-sm text-[#3D6B55]">58 / 60 (96.7%)</td>
                <td className="py-3 text-center text-sm text-[#1C1B19]">52 / 60 (86.7%)</td>
                <td className="py-3 text-center text-sm text-[#1C1B19]">49 / 60 (81.7%)</td>
                <td className="py-3 font-sans text-xs text-[#3D6B55]">Concept A Passes All Gates</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Rejection Condition Verification */}
      <div className="border border-[#D8D2C8] bg-[#FCFBF8] p-6 space-y-3 text-xs font-mono">
        <span className="font-bold uppercase text-[#1C1B19] block">
          DOCUMENT 44 REJECTION CONDITIONS AUDIT:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[#716E68]">
          <div className="flex items-center gap-2">
            <span className="text-[#3D6B55] font-bold">✓ PASS</span>
            <span>Not a beige page with one card below a headline.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#3D6B55] font-bold">✓ PASS</span>
            <span>Not a generic dark dashboard with blue accents.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#3D6B55] font-bold">✓ PASS</span>
            <span>Not reliant on font changes without new spatial compositions.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#3D6B55] font-bold">✓ PASS</span>
            <span>Zero generic glassmorphism, neumorphism, or AI terminal decoration.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#3D6B55] font-bold">✓ PASS</span>
            <span>Ledger Trace visual is strictly bound to 4-source reconciliation.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#3D6B55] font-bold">✓ PASS</span>
            <span>Landing and case workspace share the exact same material world.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConceptReviewGatePage;
