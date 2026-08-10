#!/usr/bin/env python3
"""Transcribe the local Yoruba audit pack and compare speech to expected text."""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from difflib import SequenceMatcher
from pathlib import Path


def plain(value: str) -> str:
    value = unicodedata.normalize("NFD", value).lower()
    value = value.replace("ẹ", "e").replace("ọ", "o").replace("ṣ", "s")
    value = "".join(char for char in value if unicodedata.category(char) != "Mn")
    value = re.sub(r"[^a-z0-9\s]", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--audit", default="audio/yoruba/f5-450-audit/audit-report.json")
    parser.add_argument("--model", default="/tmp/demiwuraks-yoruba-asr")
    parser.add_argument("--output", default="audio/yoruba/f5-450-audit/asr-report.json")
    parser.add_argument("--limit", type=int, default=0, help="Only process the first N rows (for a smoke test)")
    args = parser.parse_args()

    # Imports are intentionally delayed so the structural audit remains usable
    # without the optional ASR model installed.
    import soundfile as sf
    from scipy.signal import resample_poly
    import torch
    from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline

    root = Path(__file__).resolve().parents[1]
    audit = json.loads((root / args.audit).read_text(encoding="utf-8"))
    rows = audit["rows"][: args.limit or None]
    model_path = Path(args.model).expanduser().resolve()
    processor = AutoProcessor.from_pretrained(model_path)
    model = AutoModelForSpeechSeq2Seq.from_pretrained(model_path)
    device = "mps" if torch.backends.mps.is_available() else -1
    if device == "mps":
        model = model.to("mps")
    asr = pipeline(
        "automatic-speech-recognition",
        model=model,
        tokenizer=processor.tokenizer,
        feature_extractor=processor.feature_extractor,
        device=device,
        chunk_length_s=30,
    )

    results = []
    for index, row in enumerate(rows, start=1):
        audio_path = root / row["audioPath"]
        if not audio_path.exists():
            results.append({**row, "asrStatus": "missing-audio"})
            continue
        speech, sample_rate = sf.read(audio_path, dtype="float32", always_2d=False)
        if getattr(speech, "ndim", 1) > 1:
            speech = speech.mean(axis=1)
        if sample_rate != 16000:
            speech = resample_poly(speech, 16000, sample_rate)
        transcript = asr(speech, generate_kwargs={"language": "yoruba", "task": "transcribe"})["text"].strip()
        expected = plain(row["text"])
        observed = plain(transcript)
        similarity = SequenceMatcher(None, expected, observed).ratio()
        expected_tokens = expected.split()
        observed_tokens = observed.split()
        first_token_ok = bool(expected_tokens and observed_tokens and expected_tokens[0] == observed_tokens[0])
        if similarity < 0.55 or (expected_tokens and not first_token_ok):
            status = "likely-failure"
        elif similarity < 0.78:
            status = "review"
        else:
            status = "likely-match"
        results.append({
            **row,
            "asrStatus": status,
            "transcript": transcript,
            "normalizedExpected": expected,
            "normalizedTranscript": observed,
            "characterSimilarity": round(similarity, 3),
            "firstTokenMatch": first_token_ok,
        })
        print(f"[{index}/{len(rows)}] {status} {row['text']} -> {transcript}", flush=True)

    report = {
        "model": str(model_path),
        "note": "ASR is a triage signal, not proof of correct Yoruba tone; low similarity and missing first tokens are high-priority checks.",
        "counts": {status: sum(1 for row in results if row.get("asrStatus") == status) for status in ("likely-failure", "review", "likely-match", "missing-audio")},
        "rows": results,
    }
    output = root / args.output
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(f"{json.dumps(report, ensure_ascii=False, indent=2)}\n", encoding="utf-8")
    print(json.dumps({"output": str(output), "counts": report["counts"]}, indent=2))


if __name__ == "__main__":
    main()
