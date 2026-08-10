#!/usr/bin/env python3
"""Regenerate ASR-flagged Yoruba clips and keep the best local candidate.

This is deliberately non-destructive: original F5 packs are never overwritten.
Accepted replacements are written to a separate directory with a JSON map that
can be promoted after the automated check.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path


def run(command: list[str], root: Path) -> None:
    print("$", " ".join(command), flush=True)
    subprocess.run(command, cwd=root, check=True)


def score(row: dict) -> float:
    """Score an ASR result conservatively; higher is better."""
    similarity = float(row.get("characterSimilarity") or 0)
    expected = str(row.get("normalizedExpected") or "")
    observed = str(row.get("normalizedTranscript") or "")
    value = similarity + (0.12 if row.get("firstTokenMatch") else 0)
    if expected and len(observed) > len(expected) * 1.45:
        value -= 0.35
    if row.get("asrStatus") == "likely-match":
        value += 0.18
    elif row.get("asrStatus") == "review":
        value += 0.05
    return value


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--report", default="audio/yoruba/f5-450-audit/asr-report.json")
    parser.add_argument("--output", default="audio/yoruba/f5-auto-repair")
    parser.add_argument("--model-dir", default="/tmp/demiwuraks-f5-model")
    parser.add_argument("--reference", default="/tmp/demiwuraks-user-reference/BtlTech-2-reference.wav")
    parser.add_argument("--reference-text", default="/tmp/demiwuraks-user-reference/BtlTech-2-reference.txt")
    parser.add_argument("--asr-model", default="/tmp/demiwuraks-yoruba-asr")
    parser.add_argument("--device", default="cpu")
    parser.add_argument("--seeds", default="9001,1337")
    parser.add_argument("--limit", type=int, default=0, help="Only repair the first N flagged rows")
    args = parser.parse_args()

    root = Path(__file__).resolve().parents[1]
    report_path = (root / args.report).resolve()
    report = json.loads(report_path.read_text(encoding="utf-8"))
    source_rows = [
        row for row in report["rows"]
        if row.get("asrStatus") in {"likely-failure", "review"}
        # These are already native-approved recordings and must not be replaced.
        and "f5-user-corrections" not in str(row.get("audioPath", ""))
    ]
    if args.limit:
        source_rows = source_rows[: args.limit]
    if not source_rows:
        raise SystemExit("No unapproved ASR-flagged clips need repair.")

    output = (root / args.output).resolve()
    output.mkdir(parents=True, exist_ok=True)
    seeds = [int(seed.strip()) for seed in args.seeds.split(",") if seed.strip()]
    generator = root / "scripts" / "generate-f5-yoruba-audio.py"
    transcriber = root / "scripts" / "transcribe-yoruba-audit.py"
    python = sys.executable
    candidate_results: dict[str, list[dict]] = {}

    with tempfile.TemporaryDirectory(prefix="demiwuraks-repair-") as temp_dir:
        temp_root = Path(temp_dir)
        entries_file = temp_root / "entries.json"
        entries_file.write_text(json.dumps([
            {"id": f"repair-{index + 1:03d}", "text": row["text"], "english": row.get("english", "")}
            for index, row in enumerate(source_rows)
        ], ensure_ascii=False), encoding="utf-8")
        for seed in seeds:
            candidate_dir = output / f"candidate-{seed}"
            candidate_dir.mkdir(parents=True, exist_ok=True)
            command = [
                python, str(generator),
                "--output", str(candidate_dir),
                "--model-dir", args.model_dir,
                "--reference", args.reference,
                "--reference-text", args.reference_text,
                "--steps", "16", "--speed", "1.0", "--device", args.device,
                "--seed", str(seed), "--limit", str(len(source_rows)),
                "--entries-file", str(entries_file),
            ]
            run(command, root)
            generation = json.loads((candidate_dir / "generation-report.json").read_text(encoding="utf-8"))
            asr_input = temp_root / f"audit-{seed}.json"
            asr_input.write_text(json.dumps({"rows": [
                {"text": item["text"], "english": item.get("english", ""), "audioPath": item["path"]}
                for item in generation["generated"]
            ]}, ensure_ascii=False), encoding="utf-8")
            asr_output = temp_root / f"asr-{seed}.json"
            run([
                python, str(transcriber), "--audit", str(asr_input), "--model", args.asr_model,
                "--output", str(asr_output),
            ], root)
            candidate_results[str(seed)] = json.loads(asr_output.read_text(encoding="utf-8"))["rows"]

    originals = {row["text"]: row for row in source_rows}
    accepted = []
    unresolved = []
    for index, source in enumerate(source_rows):
        candidates = [rows[index] for rows in candidate_results.values()]
        candidates.sort(key=score, reverse=True)
        best = candidates[0]
        original_score = score(source)
        if score(best) > original_score + 0.05:
            seed = next(seed for seed, rows in candidate_results.items() if rows[index] is best)
            source_candidate = output / f"candidate-{seed}" / Path(best["audioPath"]).name
            final_path = output / "accepted" / f"{index + 1:03d}-{source_candidate.name}"
            final_path.parent.mkdir(parents=True, exist_ok=True)
            final_path.write_bytes(source_candidate.read_bytes())
            accepted.append({
                "text": source["text"],
                "english": source.get("english", ""),
                "originalAudio": source.get("audioPath"),
                "replacementAudio": str(final_path.relative_to(root)),
                "seed": int(seed),
                "originalAsr": {"status": source.get("asrStatus"), "transcript": source.get("transcript"), "similarity": source.get("characterSimilarity")},
                "replacementAsr": {"status": best.get("asrStatus"), "transcript": best.get("transcript"), "similarity": best.get("characterSimilarity")},
            })
        else:
            unresolved.append({
                "text": source["text"],
                "originalAudio": source.get("audioPath"),
                "originalAsr": {"status": source.get("asrStatus"), "transcript": source.get("transcript"), "similarity": source.get("characterSimilarity")},
                "bestCandidateAsr": {"status": best.get("asrStatus"), "transcript": best.get("transcript"), "similarity": best.get("characterSimilarity")},
            })

    result = {
        "scope": "unapproved ASR-flagged Yoruba clips",
        "candidateSeeds": seeds,
        "sourceCount": len(source_rows),
        "acceptedCount": len(accepted),
        "unresolvedCount": len(unresolved),
        "accepted": accepted,
        "unresolved": unresolved,
        "note": "Original clips remain untouched. Accepted replacements are selected by ASR similarity and still need a native-speaker spot check for tone.",
    }
    (output / "replacement-map.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(output), "source": len(source_rows), "accepted": len(accepted), "unresolved": len(unresolved)}, indent=2))


if __name__ == "__main__":
    main()
