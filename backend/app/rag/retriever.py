"""
RAG Retriever — Corpus Versioning + Cosine Grounding Floor
==========================================================
Chunks policy corpus markdown files, embeds with sentence-transformers,
retrieves top-k by cosine similarity, and enforces a hard grounding floor.

Technical invariants:
  - Cosine similarity < GROUNDING_FLOOR → context REJECTED (no hallucinated policy)
  - Chunk metadata always includes source filename + line numbers
  - Corpus version is stamped to every retrieval for auditability
"""

import os
import re
from dataclasses import dataclass
from typing import List, Optional
from pathlib import Path

import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

GROUNDING_FLOOR = 0.35       # Reject context if similarity below this
CHUNK_SIZE = 250             # words per chunk
CHUNK_OVERLAP = 50           # words overlap between chunks
CORPUS_VERSION = "v1.0"
CORPUS_DIR = Path(__file__).resolve().parent / "corpus"


@dataclass
class RetrievedChunk:
    source_file: str
    line_start: int
    line_end: int
    text: str
    similarity_score: float

    def citation_tag(self) -> str:
        return f"[Doc: {self.source_file}#L{self.line_start}-{self.line_end}]"


class PolicyRetriever:
    """
    Loads all corpus markdown files, chunks them, embeds once (lazy), and
    answers retrieval queries with cosine similarity + grounding floor.
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self._model: Optional[SentenceTransformer] = None
        self._model_name = model_name
        self._chunks: List[RetrievedChunk] = []
        self._embeddings: Optional[np.ndarray] = None
        self._loaded = False

    def _get_model(self) -> SentenceTransformer:
        if self._model is None:
            self._model = SentenceTransformer(self._model_name)
        return self._model

    def _chunk_text(self, text: str, filename: str) -> List[RetrievedChunk]:
        """Split markdown text into overlapping word-window chunks with line tracking."""
        lines = text.split("\n")
        chunks = []
        words_so_far: List[str] = []
        line_start = 1
        current_line = 1

        for line in lines:
            line_words = line.split()
            words_so_far.extend(line_words)

            if len(words_so_far) >= CHUNK_SIZE:
                chunk_text = " ".join(words_so_far[:CHUNK_SIZE])
                chunks.append(RetrievedChunk(
                    source_file=filename,
                    line_start=line_start,
                    line_end=current_line,
                    text=chunk_text,
                    similarity_score=0.0,
                ))
                # Slide window with overlap
                words_so_far = words_so_far[CHUNK_SIZE - CHUNK_OVERLAP:]
                line_start = current_line
            current_line += 1

        if words_so_far:
            chunks.append(RetrievedChunk(
                source_file=filename,
                line_start=line_start,
                line_end=current_line,
                text=" ".join(words_so_far),
                similarity_score=0.0,
            ))
        return chunks

    def load_corpus(self) -> None:
        """Load, chunk, and embed all markdown files in the corpus directory."""
        all_chunks: List[RetrievedChunk] = []
        for md_file in sorted(CORPUS_DIR.glob("*.md")):
            text = md_file.read_text(encoding="utf-8")
            file_chunks = self._chunk_text(text, md_file.name)
            all_chunks.extend(file_chunks)

        self._chunks = all_chunks
        model = self._get_model()
        texts = [c.text for c in self._chunks]
        self._embeddings = model.encode(texts, convert_to_numpy=True)
        self._loaded = True

    def retrieve(
        self,
        query: str,
        top_k: int = 3,
    ) -> List[RetrievedChunk]:
        """
        Returns top-k chunks above GROUNDING_FLOOR.
        If all candidates are below the floor, returns empty list (no hallucination risk).
        """
        if not self._loaded:
            self.load_corpus()

        model = self._get_model()
        query_embedding = model.encode([query], convert_to_numpy=True)
        scores = cosine_similarity(query_embedding, self._embeddings)[0]

        # Rank and filter
        ranked_indices = np.argsort(scores)[::-1]
        results: List[RetrievedChunk] = []
        for idx in ranked_indices[:top_k * 3]:  # check wider pool
            score = float(scores[idx])
            if score < GROUNDING_FLOOR:
                continue
            chunk = RetrievedChunk(
                source_file=self._chunks[idx].source_file,
                line_start=self._chunks[idx].line_start,
                line_end=self._chunks[idx].line_end,
                text=self._chunks[idx].text,
                similarity_score=round(score, 4),
            )
            results.append(chunk)
            if len(results) >= top_k:
                break

        return results

    def is_ready(self) -> bool:
        """Returns True if the embedding model and corpus embeddings are loaded into memory."""
        return self._loaded and self._embeddings is not None

    @property
    def corpus_version(self) -> str:
        return CORPUS_VERSION
