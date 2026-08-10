#!/usr/bin/env python3
"""Build a pending Yoruba expansion queue from the COERLL textbook PDF text.

The PDF's legacy text layer uses a few private glyphs for Yoruba characters.
This importer normalises those glyphs, but every result remains pending native
review and is intentionally separate from the production audio manifest.
"""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from pathlib import Path

TARGET_TOTAL = 450
SOURCE_NAME = "COERLL-Yorùbá-Yé-Mi"

OCR_MAP = str.maketrans(
    {
        "æ": "ọ",
        "Æ": "Ọ",
        "÷": "ẹ",
        "¿": "Ẹ",
        "«": "ṣ",
        "»": "Ṣ",
        "ô": "ọ́",
        "Ô": "Ọ́",
        "ö": "ọ̀",
        "Ö": "Ọ̀",
        "ê": "ẹ́",
        "Ê": "Ẹ́",
        "ë": "ẹ̀",
        "Ë": "Ẹ̀",
        "ñ": "ń",
        "Ñ": "Ń",
    }
)

CATEGORY_NAMES = {
    "Nouns",
    "Noun Phrases",
    "Verbs",
    "Verb Phrases",
    "Adjectives",
    "Adverbs",
    "Conjunctions",
    "Interrogatives",
    "Other Expressions",
    "Pronouns",
    "Prepositions",
}
YORUBA_CHARS = re.compile(r"[ẸẹỌọṢṣÀàÁáÈèÉéÌìÍíÒòÓóÙùÚú]", re.UNICODE)
MOJIBAKE = re.compile(r"[�]|Ã.|Â.|Ð.|Ñ.")
AUTO_CORRECTIONS = {
    "kí ni nõkan?": "Kí ni nǹkan?",
    "tọ́ nõkan wò": "tọ́ nǹkan wò",
    "síìõkì": "síńkì",
    "kíláàsìi sáyẹ́õsì": "kíláàsì sáyẹ́ǹsì",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="UTF-8 text extracted from the COERLL textbook PDF")
    parser.add_argument(
        "--manifest",
        type=Path,
        default=Path("data/audio/yoruba-audio-manifest.json"),
        help="Existing production manifest used to avoid duplicates",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("data/audio/yoruba-expansion-review-queue.json"),
        help="Pending-review queue output path",
    )
    parser.add_argument("--target-total", type=int, default=TARGET_TOTAL)
    return parser.parse_args()


def clean_candidate(value: str) -> str:
    value = unicodedata.normalize("NFC", value.translate(OCR_MAP))
    value = re.sub(r"[\u0000-\u001f]", " ", value)
    value = value.replace("…", "").replace("\\", "").strip()
    value = re.sub(r"\s+", " ", value)
    return value.strip(" .,:;|\t")


def main() -> int:
    args = parse_args()
    source = args.source.read_text(encoding="utf-8")
    existing = json.loads(args.manifest.read_text(encoding="utf-8"))
    existing_text = {entry["text"] for entry in existing.get("entries", [])}

    candidates = []
    seen = set(existing_text)
    current_category = "uncategorised"
    for page in source.split("\f"):
        if "Vocabulary" not in page:
            continue
        for raw_line in page.splitlines():
            line = raw_line.rstrip()
            stripped = line.strip()
            if stripped in CATEGORY_NAMES:
                current_category = stripped
                continue
            match = re.match(r"^\s{2,}(.+?)\s{2,}([^\s].*)$", line)
            if not match:
                continue
            raw_text, meaning = match.groups()
            text = clean_candidate(raw_text)
            meaning = re.sub(r"\s+", " ", meaning.strip())
            if not text or not meaning or len(text) > 90 or len(meaning) > 220:
                continue
            if text.startswith(("!", "|", "Orí ", "Chapter ", "COERLL ")) or text.lower() in {"vocabulary", "nouns", "verbs"}:
                continue
            if meaning.startswith(("|", "---")) or "..." in meaning:
                continue
            if not YORUBA_CHARS.search(text) or MOJIBAKE.search(text):
                continue
            if not re.search(r"[A-Za-z]", text):
                continue
            review_notes = ["PDF text-layer normalization; native-speaker approval required"]
            if "õ" in raw_text:
                review_notes.append("Unresolved legacy glyph 'õ'; verify the syllabic nasal/tone")
            if text in AUTO_CORRECTIONS:
                text = AUTO_CORRECTIONS[text]
                review_notes.append("Automatically corrected against a modern Yoruba spelling reference; confirm before approval")
            variants = [part.strip() for part in text.split("/") if part.strip()]
            for variant in variants:
                if variant in seen:
                    continue
                seen.add(variant)
                variant_notes = list(review_notes)
                if len(variants) > 1:
                    variant_notes.append("Split from slash-separated source alternatives; review synonym independently")
                candidates.append(
                    {
                        "text": variant,
                        "english": meaning,
                        "language": "yo",
                        "category": current_category,
                        "source": SOURCE_NAME,
                        "sourceLicense": "CC BY",
                        "reviewed": False,
                        "status": "pending-native-review",
                        "reviewNotes": variant_notes,
                    }
                )

    need = max(0, args.target_total - len(existing.get("entries", [])))
    if len(candidates) > need:
        # Sample the whole textbook so the queue covers early and later themes,
        # rather than filling only with the first chapter's vocabulary.
        selected = []
        for index in range(need):
            source_index = min(len(candidates) - 1, (index * len(candidates)) // need)
            selected.append(candidates[source_index])
        candidates = selected

    output = {
        "schemaVersion": 1,
        "language": "yo",
        "languageName": "Yorùbá",
        "targetTotal": args.target_total,
        "existingProductionEntries": len(existing.get("entries", [])),
        "pendingCandidateEntries": len(candidates),
        "status": "pending-native-review",
        "source": SOURCE_NAME,
        "sourceLicense": "CC BY",
        "attribution": "Yorùbá Yé Mi, Center for Open Educational Resources and Language Learning (COERLL), University of Texas at Austin",
        "entries": candidates,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(candidates)} pending candidates to {args.output}")
    print(f"Combined Phase 1 inventory: {len(existing.get('entries', [])) + len(candidates)}/{args.target_total}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
