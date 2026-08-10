#!/usr/bin/env python3
"""Generate a small local F5-TTS Yoruba listening pack.

This is intentionally a local review tool. It does not upload audio or touch R2.
The F5 Yoruba checkpoint is non-commercial (CC-BY-NC-4.0), so generated files
must be reviewed before considering any production use.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import unicodedata
from pathlib import Path


PHRASES = [
    ("greeting", "Ẹ káàárọ̀! Báwo ni?", "Good morning! How are you?"),
    ("learning", "Mo fẹ́ kọ́ èdè Yorùbá.", "I want to learn Yoruba."),
    ("learning-marked", "Mo fẹ́ kọ́ èdè Yọ̀rùbá.", "I want to learn Yoruba (marked pronunciation test)."),
    ("name", "Orúkọ mi ni Wúrà Ọlá.", "My name is Wura Ola."),
    ("name-pause", "Orúkọ mi ni Wúrà, Ọlá.", "My name is Wura Ola (articulation test)."),
    ("repeat", "Ẹ jọ̀ọ́, tún sọ ọ́ díẹ̀díẹ̀.", "Please say it again slowly."),
    ("practice", "Mo ń kọ́ àwọn ọ̀rọ̀ tuntun lojúmọ́.", "I learn new words every day."),
]

# The first review batch intentionally samples complete, natural phrases rather
# than isolated letters/words. The first F5 test showed that this checkpoint
# needs sentence context for reliable Yoruba prosody. Later batches can use the
# same principle with carrier phrases where a lesson item is a single word.
CORE_REVIEW_TEXT = [
    'Ẹ káàárọ̀. Báwo ni?', 'Ara mi dára.', 'Ara mi kò yá.',
    'Mo ń kẹ́kọ̀ọ́ ní ilé-ìwé.', 'Mo fẹ́ràn ìrẹsì.',
    'Mo fẹ́ràn orin nítorí pé ó dùn.', 'Mo fẹ́ràn eré bọ́ọ̀lù nítorí pé ó dùn.',
    'Mo wọ aṣọ búlúù.', 'Òjò ń rọ̀ lónìí.', 'Ọmọ ọdún mélòó ni ọ́?',
    'Ọmọ ọdún mẹ́wàá ni mí.', 'Eélòó ni ìrẹsì yìí?', 'Jọ̀ọ́, ràn mí lọ́wọ́.',
    'Jọ̀ọ́, fún mi ní…', 'Kí ni orúkọ rẹ?',
    'Orúkọ mi ni… Mo fẹ́ sọ̀rọ̀ nípa ìdílé mi.', 'Mo nílò ìrànlọ́wọ́.',
    'Wo ọ̀nà kí o tó kọjá.', 'Àga wà nínú yàrá.', 'Ajá wà ní ilé.',
    'Lónìí, Àdé lọ sí ọjà pẹ̀lú ìyá rẹ̀.', 'Àṣà Yorùbá yàtọ̀ sí àṣà míì.',
    'Tún sọ ọ́, jọ̀ọ́.', 'Bẹ́ẹ̀ ni, mo fẹ́ràn.', 'Mo lọ sí ilé-ìwé, lẹ́yìn náà mo lọ sí ilé.',
    'Dákẹ́ kí o gbọ́.', 'Dúró!', 'Eélòó?', 'Ẹ gbọ́ mi, jọ̀ọ́.',
    'Ilé-ìwé wà nítòsí.', 'Ìwé pupa', 'Ìyá mi', 'Kí ni ó ṣẹlẹ̀?', 'Kí ni?',
    'Mo fẹ́ jẹ…', 'Mo fẹ́ mu…', 'Mo fẹ́ sọ̀rọ̀ nípa…', 'Mo fẹ́ràn…',
    'Mo jẹ́ ọmọ ọdún…', 'Mo ní ìwé mẹ́ta.', 'Mo wá láti…', 'Mo wọ aṣọ.',
    'níbo?', 'Orúkọ mi ni…', 'Oṣù Ṣẹ́rẹ́ ni.', 'Oṣù wo ni a wà?',
    'owó mélòó ni?', 'Ọjà wà ní ọ̀tún.', 'Ọjọ́ Ajé ni.', 'Ọjọ́ wo ni ó jẹ́?',
]


def slug(value: str) -> str:
    value = re.sub(r'[^a-z0-9]+', '-', value.lower()).strip('-')
    return value or 'phrase'


def text_key(value: str) -> str:
    """Compare Yoruba entries without treating capitalization as new content."""
    return unicodedata.normalize('NFC', value).strip().casefold()


def load_translations(path: Path) -> dict[str, str]:
    translations = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(translations, dict) or any(not isinstance(k, str) or not isinstance(v, str) or not v.strip() for k, v in translations.items()):
        raise SystemExit(f'Translations must be a non-empty string map: {path}')
    return translations


def load_manifest_entries(path: Path, translations: dict[str, str]) -> list[dict]:
    manifest = json.loads(path.read_text(encoding='utf-8'))
    if manifest.get('language') != 'yo':
        raise SystemExit(f'Manifest language must be Yoruba (yo): {path}')
    entries = manifest.get('entries')
    if not isinstance(entries, list) or not entries:
        raise SystemExit(f'Manifest has no entries: {path}')
    by_text = {entry.get('text'): entry for entry in entries if entry.get('text')}
    selected = [
        {
            **by_text[text],
            # The audio review must always show the same English meaning as
            # the lesson. Some legacy manifest rows predate translations, so
            # the curated core map is authoritative for this review pack.
            "english": translations.get(text) or by_text[text].get("english", ""),
        }
        for text in CORE_REVIEW_TEXT
        if text in by_text
    ]
    if len(selected) != len(CORE_REVIEW_TEXT):
        missing = [text for text in CORE_REVIEW_TEXT if text not in by_text]
        raise SystemExit(f'Manifest is missing core review text: {missing}')
    selected_ids = {entry['id'] for entry in selected}
    selected_keys = {text_key(entry.get('text', '')) for entry in selected}
    for entry in entries:
        key = text_key(entry.get('text', ''))
        if entry.get('id') in selected_ids or not key or key in selected_keys:
            continue
        selected.append({
            **entry,
            "english": translations.get(entry.get("text", "")) or entry.get("english", ""),
        })
        selected_ids.add(entry['id'])
        selected_keys.add(key)
    return selected


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model-dir", default="/tmp/demiwuraks-f5-model")
    parser.add_argument("--reference", default="/tmp/demiwuraks-f5-reference.wav")
    parser.add_argument("--reference-text", default="/tmp/demiwuraks-f5-reference.txt")
    parser.add_argument("--output", default="audio/yoruba/f5-yoruba-test")
    parser.add_argument("--manifest", default="data/audio/yoruba-audio-manifest.json")
    parser.add_argument("--translations", default="data/audio/yoruba-f5-review-translations.json")
    parser.add_argument("--legacy-phrases", action="store_true", help="Use the original hand-picked test phrases instead of the manifest")
    parser.add_argument("--text", action="append", help="Generate an explicit test phrase (repeatable; bypasses manifest selection)")
    parser.add_argument("--entries-file", help="JSON array of {id,text,english} entries to generate")
    parser.add_argument("--speed", type=float, default=1.0)
    parser.add_argument("--steps", type=int, default=16)
    parser.add_argument("--fix-duration", type=float, help="Force generated duration in seconds (useful for clipped multi-clause phrases)")
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--start", type=int, default=0)
    parser.add_argument("--device", default=os.getenv("F5_DEVICE", "cpu"))
    parser.add_argument("--dry-run", action="store_true", help="Print the selected entries without loading the model")
    parser.add_argument("--seed", type=int, help="Explicit F5 seed for reproducible testing")
    args = parser.parse_args()

    translations = load_translations(Path(args.translations).expanduser().resolve())
    if args.entries_file:
        entries_path = Path(args.entries_file).expanduser().resolve()
        selected = json.loads(entries_path.read_text(encoding="utf-8"))
        if not isinstance(selected, list) or any(not isinstance(item, dict) or not item.get("text") for item in selected):
            raise SystemExit(f"Entries file must contain an array of objects with text: {entries_path}")
    elif args.text:
        selected = [
            {
                "id": f"manual-{index + 1}",
                "text": text,
                "english": translations.get(text, ""),
            }
            for index, text in enumerate(args.text)
        ]
    elif args.legacy_phrases:
        selected = [
            {"id": item_slug, "text": text, "english": english}
            for item_slug, text, english in PHRASES
        ]
    else:
        selected = load_manifest_entries(Path(args.manifest).expanduser().resolve(), translations)
    phrases = selected[max(0, args.start) : max(0, args.start) + max(0, args.limit)]
    if not phrases:
        raise SystemExit("No phrases selected.")
    missing_translations = [item["text"] for item in phrases if not str(item.get("english", "")).strip()]
    if missing_translations:
        raise SystemExit(f"Every generated phrase needs an English translation: {missing_translations}")
    if args.dry_run:
        print(json.dumps({"selected": len(phrases), "entries": phrases}, ensure_ascii=False, indent=2))
        return

    # The Yoruba checkpoint uses a character tokenizer. Do not transliterate or
    # strip tone marks before inference.
    import f5_tts.model.utils as f5_utils

    f5_utils.convert_char_to_pinyin = lambda texts, polyphone=True: texts
    from f5_tts.api import F5TTS
    # F5's default inference uses a ThreadPoolExecutor even for one text
    # chunk. On macOS/CPU that can trigger a child-runtime crash between
    # consecutive phrases. Keep review generation deterministic and single
    # threaded; this is a small offline batch, not a serving workload.
    import f5_tts.infer.utils_infer as infer_utils

    class _ImmediateFuture:
        def __init__(self, fn, *args):
            self._value = fn(*args)

        def result(self):
            return self._value

    class _InlineExecutor:
        def __enter__(self):
            return self

        def __exit__(self, *_):
            return False

        def submit(self, fn, *args):
            return _ImmediateFuture(fn, *args)

    infer_utils.ThreadPoolExecutor = _InlineExecutor

    model_dir = Path(args.model_dir).expanduser().resolve()
    reference = Path(args.reference).expanduser().resolve()
    reference_text_path = Path(args.reference_text).expanduser().resolve()
    output_dir = Path(args.output).expanduser().resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    if not reference.exists() or not reference_text_path.exists():
        raise SystemExit(f"Missing reference audio/text: {reference} / {reference_text_path}")

    # F5-TTS uses a trailing space after terminal punctuation as a chunk
    # boundary. Do not strip it away from the reference transcript.
    reference_text = reference_text_path.read_text(encoding="utf-8").strip() + " "
    f5tts = F5TTS(
        model="F5TTS_v1_Base",
        ckpt_file=str(model_dir / "model_150000.pt"),
        vocab_file=str(model_dir / "vocab.txt"),
        device=args.device,
    )

    generated = []
    for index, item in enumerate(phrases, start=args.start + 1):
        text = item["text"]
        generation_text = text.strip()
        # F5 treats uppercase characters as letter names. Yoruba sentences are
        # conventionally capitalised in the UI, but the speech tokenizer must
        # receive lowercase words (including internal letters such as Ṣ in
        # ``Ṣẹ́rẹ́``). Keep the original, correctly-cased text in the report.
        generation_text = generation_text.lower()
        if generation_text and generation_text[-1] in ".!?…;:":
            generation_text += " "
        item_slug = item.get("id", slug(text))
        wav_path = output_dir / f"{index:02d}-{item_slug}.wav"
        if wav_path.exists() and wav_path.stat().st_size > 0:
            print(f"[{index - args.start}/{len(phrases)}] exists: {wav_path}", flush=True)
            generated.append(
                {
                    "id": item.get("id", item_slug),
                    "text": text,
                    "english": item.get("english", ""),
                    "manifestObjectKey": item.get("objectKey"),
                    "path": str(wav_path),
                    "speed": args.speed,
                    "nfeStep": args.steps,
                    "reference": str(reference),
                    "status": "existing",
                }
            )
            continue
        print(f"[{index - args.start}/{len(phrases)}] {text}", flush=True)
        wav, sample_rate, _ = f5tts.infer(
            ref_file=str(reference),
            ref_text=reference_text,
            gen_text=generation_text,
            speed=args.speed,
            nfe_step=args.steps,
            fix_duration=args.fix_duration,
            # F5-TTS otherwise derives a seed from sys.maxsize, which can set
            # PYTHONHASHSEED above Python's permitted 32-bit range and crash
            # the next inference on macOS.
            seed=args.seed if args.seed is not None else (index * 7919) % 4294967295,
            file_wave=str(wav_path),
        )
        generated.append(
            {
                "id": item.get("id", item_slug),
                "text": text,
                "english": item.get("english", ""),
                "manifestObjectKey": item.get("objectKey"),
                "path": str(wav_path),
                "sampleRate": sample_rate,
                "speed": args.speed,
                "nfeStep": args.steps,
                "reference": str(reference),
            }
        )

    report_path = output_dir / "generation-report.json"
    prior = []
    if report_path.exists():
        try:
            prior = json.loads(report_path.read_text(encoding="utf-8")).get("generated", [])
        except (json.JSONDecodeError, OSError):
            prior = []
    by_id = {item.get("id"): item for item in prior if item.get("id")}
    by_id.update({item["id"]: item for item in generated})
    report_path.write_text(json.dumps({"provider": "f5-tts-yoruba", "generated": list(by_id.values())}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(generated)} files and {report_path}")


if __name__ == "__main__":
    main()
