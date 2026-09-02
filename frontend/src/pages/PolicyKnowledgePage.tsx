import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  FileText,
  Search,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { fetchPolicyCorpus, queryPolicyCorpus } from '../api/client';
import { PolicyCorpusResponse, PolicySearchResult, PolicyDocument } from '../types/api';

export const PolicyKnowledgePage: React.FC = () => {
  const [corpusData, setCorpusData] = useState<PolicyCorpusResponse | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<PolicyDocument | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('What is the contractual fee formula for standard gateway settlement?');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<PolicySearchResult | null>(null);

  const loadCorpus = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPolicyCorpus();
      setCorpusData(data);
      if (data.documents && data.documents.length > 0) {
        setSelectedDoc(data.documents[0]);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCorpus();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await queryPolicyCorpus(searchQuery.trim(), 4);
      setSearchResult(res);
    } catch (err: any) {
      alert(`Search failed: ${err.message || 'Error'}`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-6xl mx-auto p-6 lg:p-10 space-y-8 font-sans"
    >
      {/* 1. Section Header Strip */}
      <div className="space-y-2 border-b border-rule-300 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-source-blue bg-source-blue/10 border border-source-blue px-2.5 py-0.5 rounded-full">
            06 &mdash; CONTRACTUAL POLICY &amp; RAG KNOWLEDGE BASE
          </span>
          <span className="text-ink-700">&bull;</span>
          <span className="text-xs text-ink-700 font-mono">DETERMINISTIC GROUNDING</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink-900 tracking-tight">
              Policy Knowledge Base &amp; RAG Grounding Engine
            </h1>
            <p className="text-xs text-ink-700 font-sans mt-0.5">
              Verified contractual SOPs, fee formulas (2% + 18% GST), and semantic vector retrieval with cosine grounding floor
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-paper-1 border border-rule-300 text-xs text-ink-700 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-matched-green" />
              <span>Grounding Floor &ge; 0.35</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={loadCorpus}
              disabled={isLoading}
              className="h-8 px-3.5 rounded-full bg-paper-1 hover:bg-paper-1 border border-rule-300 text-xs font-medium text-ink-700 hover:text-ink-900 flex items-center gap-1.5 transition font-sans"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-source-blue' : ''}`} />
              <span>Reload Corpus</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Semantic Policy Search Playground */}
      <div className="control-panel rounded-xl p-6 space-y-4 shadow-none">
        <div className="flex items-center justify-between border-b border-rule-300 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <h2 className="text-xs font-bold text-ink-900 uppercase tracking-wider">
              Semantic Policy Retrieval Playground
            </h2>
          </div>
          <span className="text-[10px] font-mono text-ink-700">
            MiniLM-L6-v2 Embeddings
          </span>
        </div>

        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex gap-2.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-ink-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask or search contractual policy rules (e.g. fee formula, missing settlement SLA)..."
                className="w-full bg-paper-1 border border-rule-300 focus:border-source-blue rounded-lg pl-10 pr-3 py-2 text-xs text-ink-900 placeholder-[#829BB8]/50 focus:outline-none font-sans"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-2 rounded-full bg-paper-1 text-ink-900 hover:from-blue-500 hover:to-indigo-500 text-ink-900 text-xs font-semibold transition disabled:opacity-40 flex items-center gap-1.5 shadow-none"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-ink-900" />
                  <span>Searching...</span>
                </>
              ) : (
                <span>Retrieve SOP Citations &rarr;</span>
              )}
            </motion.button>
          </div>
        </form>

        {/* Search Results */}
        {searchResult && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs text-ink-700">
              <span>Matched Chunks ({searchResult.matched_chunks.length})</span>
              <span className="font-mono text-[11px]">Floor: {searchResult.grounding_floor}</span>
            </div>

            {searchResult.matched_chunks.length === 0 ? (
              <div className="p-3 rounded-lg bg-advisory-amber/10 border border-advisory-amber text-xs text-advisory-amber flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-advisory-amber shrink-0" />
                <span>No chunks met the cosine grounding floor (&ge; 0.35). Result suppressed to prevent hallucination.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchResult.matched_chunks.map((chunk, i) => (
                  <div
                    key={i}
                    className="bg-paper-1 border border-rule-300 hover:border-source-blue rounded-lg p-4 space-y-2 text-xs transition shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-source-blue font-semibold">
                        {chunk.source_file}#L{chunk.line_start}-{chunk.line_end}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-matched-green/10 text-matched-green border border-matched-green">
                        Score: {chunk.similarity_score}
                      </span>
                    </div>
                    <p className="text-ink-900 font-sans leading-relaxed text-[11px] bg-paper-1 p-3 rounded border border-rule-300">
                      {chunk.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Policy Corpus Documents Viewer */}
      {corpusData && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Document Tabs */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-ink-900 uppercase tracking-wider px-1">
              Corpus Files ({corpusData.documents.length})
            </div>
            <div className="space-y-1.5">
              {corpusData.documents.map((doc) => (
                <button
                  key={doc.filename}
                  onClick={() => setSelectedDoc(doc)}
                  className={`w-full p-3 rounded-lg text-left text-xs transition flex items-center justify-between border ${
                    selectedDoc?.filename === doc.filename
                      ? 'bg-source-blue/10 text-ink-900 border-source-blue font-semibold shadow-sm'
                      : 'bg-paper-1 text-ink-700 hover:text-ink-900 border-rule-300 hover:bg-paper-1'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-source-blue shrink-0" />
                    <span className="truncate">{doc.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-ink-700">{doc.line_count}L</span>
                </button>
              ))}
            </div>
          </div>

          {/* Document Content View */}
          <div className="lg:col-span-3 control-panel rounded-xl p-6 space-y-3 shadow-none">
            {selectedDoc ? (
              <>
                <div className="flex items-center justify-between border-b border-rule-300 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-source-blue" />
                    <h3 className="text-xs font-bold text-ink-900 font-sans">
                      {selectedDoc.title}
                    </h3>
                  </div>
                  <span className="font-mono text-[11px] text-ink-700">
                    Source: {selectedDoc.filename}
                  </span>
                </div>

                <pre className="bg-paper-1 border border-rule-300 rounded-lg p-4 text-xs font-mono text-ink-900 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[500px]">
                  {selectedDoc.content}
                </pre>
              </>
            ) : (
              <div className="py-12 text-center text-xs text-ink-700 font-mono">
                Select a document to inspect full markdown source.
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};
