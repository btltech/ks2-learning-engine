# Sound Effects

This directory contains sound effects for the KS2 Learning Engine.

## Files
- `correct.wav`: Played when a user answers correctly.
- `incorrect.wav`: Played when a user answers incorrectly.
- `success.wav`: Played when a user completes a quiz with a high score.
- `click.wav`: Played on button clicks.

## Source
These files were synthesized using a Python script (`scripts/generate_sounds.py`) to ensure they are free to use and available immediately. You can replace them with your own MP3 or WAV files if you prefer higher fidelity recordings. Just remember to update the paths in `hooks/useGameSounds.ts` if you change the file extensions.
