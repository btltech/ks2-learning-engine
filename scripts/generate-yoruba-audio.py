#!/usr/bin/env python3
"""Generate local Yoruba MP3 files with Meta's MMS Yoruba model.

This intentionally does not upload anything. Review the generated audio locally,
then upload approved files to R2 using the documented object keys.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

MODEL_ID = "facebook/mms-tts-yor"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--manifest",
        type=Path,
        default=Path("data/audio/yoruba-audio-manifest.json"),
        help="Manifest created by build-yoruba-audio-manifest.mjs",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("audio/yoruba"),
        help="Directory for generated MP3 files",
    )
    parser.add_argument("--limit", type=int, help="Generate at most N entries")
    parser.add_argument("--id", dest="ids", action="append", help="Generate a specific manifest id (repeatable)")
    parser.add_argument("--dry-run", action="store_true", help="Validate inputs without loading the model")
    parser.add_argument(
        "--override-rejected-quality",
        action="store_true",
        help="Continue despite a rejected quality gate (for research only; never for production upload)",
    )
    return parser.parse_args()


def load_manifest(path: Path) -> dict:
    if not path.exists():
        raise SystemExit(f"Manifest not found: {path}. Run the manifest builder first.")
    manifest = json.loads(path.read_text(encoding="utf-8"))
    if manifest.get("model") != MODEL_ID:
        raise SystemExit(f"Manifest model must be {MODEL_ID!r}.")
    if manifest.get("language") != "yo":
        raise SystemExit("Manifest language must be Yoruba (yo).")
    return manifest


def main() -> int:
    args = parse_args()
    manifest = load_manifest(args.manifest)
    quality_gate_path = args.manifest.parent / "yoruba-tts-quality-gate.json"
    if quality_gate_path.exists() and not args.override_rejected_quality:
        quality_gate = json.loads(quality_gate_path.read_text(encoding="utf-8"))
        if quality_gate.get("status") == "rejected":
            raise SystemExit(
                "Meta Yoruba audio is rejected by the quality gate. "
                "Do not generate or publish it; evaluate another provider first. "
                "Use --override-rejected-quality only for isolated research."
            )
    entries = manifest.get("entries", [])
    if args.ids:
        wanted = set(args.ids)
        entries = [entry for entry in entries if entry.get("id") in wanted]
        missing = wanted - {entry.get("id") for entry in entries}
        if missing:
            raise SystemExit(f"Unknown manifest id(s): {', '.join(sorted(missing))}")
    if args.limit is not None:
        if args.limit < 1:
            raise SystemExit("--limit must be at least 1")
        entries = entries[: args.limit]
    if not entries:
        raise SystemExit("No manifest entries selected.")

    args.output_dir.mkdir(parents=True, exist_ok=True)
    outputs = []
    for entry in entries:
        object_key = entry["objectKey"]
        speed = float(entry.get("speed", 1))
        if speed <= 0:
            raise SystemExit(f"Invalid speed for {entry['id']}: {speed}")
        relative_key = Path(*object_key.split("/")[2:])
        output_path = args.output_dir / relative_key
        outputs.append({"id": entry["id"], "text": entry["text"], "objectKey": object_key, "path": str(output_path), "speed": speed})

    if args.dry_run:
        print(json.dumps({"model": MODEL_ID, "selected": len(outputs), "outputs": outputs}, ensure_ascii=False, indent=2))
        return 0

    try:
        import soundfile as sf
        import torch
        from transformers import AutoTokenizer, VitsModel
    except ImportError as error:
        print(
            "Meta MMS generation needs local Python packages: transformers, torch, and soundfile.\n"
            "Install them in a project virtual environment, then rerun this script.\n"
            f"Missing dependency: {error}",
            file=sys.stderr,
        )
        return 2

    print(f"Loading {MODEL_ID} (the first run downloads approximately 291 MB)...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
    model = VitsModel.from_pretrained(MODEL_ID)
    model.eval()
    sample_rate = int(model.config.sampling_rate)

    generated = []
    with torch.no_grad():
        for index, item in enumerate(outputs, start=1):
            output_path = Path(item["path"])
            output_path.parent.mkdir(parents=True, exist_ok=True)
            if output_path.exists() and output_path.stat().st_size > 0:
                print(f"[{index}/{len(outputs)}] exists: {output_path}")
                generated.append({**item, "status": "existing"})
                continue
            print(f"[{index}/{len(outputs)}] generating: {item['text']}")
            inputs = tokenizer(item["text"], return_tensors="pt")
            waveform = model(**inputs).waveform.squeeze().cpu().numpy()
            output_sample_rate = round(sample_rate * item["speed"])
            temporary_wav = output_path.with_suffix(".tmp.wav")
            sf.write(temporary_wav, waveform, output_sample_rate, format="WAV", subtype="PCM_16")
            try:
                subprocess.run(
                    ["ffmpeg", "-y", "-loglevel", "error", "-i", str(temporary_wav), "-codec:a", "libmp3lame", "-b:a", "96k", str(output_path)],
                    check=True,
                )
            except FileNotFoundError as error:
                raise SystemExit("ffmpeg is required to encode MP3 output. Install ffmpeg and rerun.") from error
            finally:
                temporary_wav.unlink(missing_ok=True)
            generated.append({**item, "status": "generated", "sampleRate": output_sample_rate})

    report_path = args.output_dir / "generation-report.json"
    report_path.write_text(
        json.dumps({"model": MODEL_ID, "language": "yo", "generated": generated}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote report: {report_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
