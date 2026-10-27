#!/usr/bin/env python3
"""Generate French and Spanish pronunciation MP3s with Kokoro-82M.

Reads data/audio/language-audio-manifest.json (scripts/build-language-audio-manifest.mjs),
writes MP3s to audio/languages/kokoro-82m-v1.0/<hash>.mp3, runs basic sanity
checks (not silent, not clipped, sensible length) and writes:

  audio/languages/kokoro-82m-v1.0/manifest.json          what the app loads (passing entries only)
  audio/languages/kokoro-82m-v1.0/generation-report.json every entry with its checks

Nothing is uploaded. LISTEN to the files (ideally with a French/Spanish speaker)
before running scripts/upload-language-audio-r2.mjs; pass --approved-ids to the
upload step or delete bad files and regenerate.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

SAMPLE_RATE = 24000  # Kokoro output rate
MIN_SECONDS = 0.25
MAX_SECONDS = 6.0
MAX_PEAK = 0.999


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--manifest", type=Path, default=Path("data/audio/language-audio-manifest.json"))
    parser.add_argument("--output-dir", type=Path, default=Path("audio/languages/kokoro-82m-v1.0"))
    parser.add_argument("--language", choices=["fr", "es"], action="append", help="Limit to a language (repeatable)")
    parser.add_argument("--id", dest="ids", action="append", help="Generate a specific manifest id (repeatable)")
    parser.add_argument("--limit", type=int, help="Generate at most N entries")
    parser.add_argument("--regenerate", action="store_true", help="Overwrite existing MP3s")
    parser.add_argument("--dry-run", action="store_true", help="List what would be generated without loading the model")
    return parser.parse_args()


def load_entries(args: argparse.Namespace) -> tuple[dict, list[dict]]:
    if not args.manifest.exists():
        raise SystemExit(f"Manifest not found: {args.manifest}. Run: node scripts/build-language-audio-manifest.mjs")
    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    entries = manifest.get("entries", [])
    if args.language:
        entries = [e for e in entries if e["language"] in args.language]
    if args.ids:
        wanted = set(args.ids)
        entries = [e for e in entries if e["id"] in wanted]
        missing = wanted - {e["id"] for e in entries}
        if missing:
            raise SystemExit(f"Unknown manifest id(s): {', '.join(sorted(missing))}")
    if args.limit is not None:
        if args.limit < 1:
            raise SystemExit("--limit must be at least 1")
        entries = entries[: args.limit]
    if not entries:
        raise SystemExit("No manifest entries selected.")
    return manifest, entries


def encode_mp3(samples, wav_path: Path, mp3_path: Path) -> None:
    import soundfile as sf

    sf.write(wav_path, samples, SAMPLE_RATE, format="WAV", subtype="PCM_16")
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_path), "-codec:a", "libmp3lame", "-b:a", "96k", str(mp3_path)],
            check=True,
        )
    except FileNotFoundError as error:
        raise SystemExit("ffmpeg is required to encode MP3 output. Install ffmpeg and rerun.") from error
    finally:
        wav_path.unlink(missing_ok=True)


def check_audio(samples) -> dict:
    import numpy as np

    seconds = len(samples) / SAMPLE_RATE
    peak = float(np.max(np.abs(samples))) if len(samples) else 0.0
    problems = []
    if seconds < MIN_SECONDS:
        problems.append(f"too short ({seconds:.2f}s)")
    if seconds > MAX_SECONDS:
        problems.append(f"too long ({seconds:.2f}s)")
    if peak < 0.05:
        problems.append("near silent")
    if peak > MAX_PEAK:
        problems.append("clipped")
    return {"seconds": round(seconds, 2), "peak": round(peak, 3), "problems": problems}


def main() -> int:
    args = parse_args()
    manifest, entries = load_entries(args)
    args.output_dir.mkdir(parents=True, exist_ok=True)

    if args.dry_run:
        for entry in entries:
            print(f"{entry['id']}  {entry['language']}  {entry['voice']}  {entry['text']!r}")
        print(f"{len(entries)} entries would be generated into {args.output_dir}")
        return 0

    try:
        import numpy as np
        from kokoro import KPipeline
    except ImportError as error:
        print(
            "Install the generation dependencies first (Python 3.10-3.12):\n"
            "  pip install -r scripts/requirements-language-audio.txt\n"
            f"Missing dependency: {error}",
            file=sys.stderr,
        )
        return 2

    pipelines: dict[str, KPipeline] = {}
    report = []
    for index, entry in enumerate(entries, start=1):
        mp3_path = args.output_dir / f"{entry['hash']}.mp3"
        if mp3_path.exists() and mp3_path.stat().st_size > 0 and not args.regenerate:
            print(f"[{index}/{len(entries)}] exists: {entry['text']}")
            report.append({"id": entry["id"], "text": entry["text"], "status": "existing", "problems": []})
            continue

        lang = entry["kokoroLang"]
        if lang not in pipelines:
            print(f"Loading Kokoro pipeline for {entry['languageName']} (first run downloads the model)...")
            pipelines[lang] = KPipeline(lang_code=lang, repo_id="hexgrad/Kokoro-82M")
        print(f"[{index}/{len(entries)}] generating {entry['language']}: {entry['text']}")

        # Single words/phrases come back as one chunk; join defensively with a short gap.
        gap = np.zeros(int(SAMPLE_RATE * 0.1), dtype=np.float32)
        chunks = []
        for _, _, audio in pipelines[lang](entry["text"], voice=entry["voice"], speed=entry["speed"], split_pattern=None):
            chunks.extend([np.asarray(audio, dtype=np.float32), gap])
        if not chunks:
            report.append({"id": entry["id"], "text": entry["text"], "status": "failed", "problems": ["no audio produced"]})
            continue
        samples = np.concatenate(chunks[:-1])
        checks = check_audio(samples)
        encode_mp3(samples, mp3_path.with_suffix(".tmp.wav"), mp3_path)
        report.append({"id": entry["id"], "text": entry["text"], "status": "generated", **checks})

    # Client manifest: every entry with an MP3 on disk that has no automatic problems.
    failed = {item["id"] for item in report if item.get("problems")}
    published = []
    for entry in manifest["entries"]:
        mp3_path = args.output_dir / f"{entry['hash']}.mp3"
        if entry["id"] in failed or not mp3_path.exists() or mp3_path.stat().st_size == 0:
            continue
        published.append({k: entry[k] for k in ("id", "text", "language", "english", "hash", "objectKey", "contentType", "category") if k in entry})

    client_manifest = {
        "version": "kokoro-82m-v1.0",
        "generatedFrom": manifest.get("generatedAt"),
        "speed": manifest.get("speed"),
        "entries": published,
    }
    (args.output_dir / "manifest.json").write_text(json.dumps(client_manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (args.output_dir / "generation-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    problems = [item for item in report if item.get("problems")]
    print(f"Done: {len(published)} entries in manifest, {len(problems)} flagged.")
    for item in problems:
        print(f"  FLAGGED {item['id']} {item['text']!r}: {', '.join(item['problems'])}")
    print(f"Review the MP3s in {args.output_dir} before uploading.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
