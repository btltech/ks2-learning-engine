import wave
import math
import struct
import os
import random

# Configuration
SAMPLE_RATE = 44100
OUTPUT_DIR = "public/sounds"

def ensure_dir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

def save_wav(filename, data):
    filepath = os.path.join(OUTPUT_DIR, filename)
    with wave.open(filepath, 'w') as w:
        w.setnchannels(1)  # Mono
        w.setsampwidth(2)  # 16-bit
        w.setframerate(SAMPLE_RATE)
        for sample in data:
            w.writeframes(struct.pack('<h', int(sample * 32767.0)))
    print(f"Generated {filepath}")

def generate_sine_wave(frequency, duration, volume=1.0):
    num_samples = int(duration * SAMPLE_RATE)
    data = []
    for i in range(num_samples):
        t = float(i) / SAMPLE_RATE
        # Apply a simple envelope (attack/decay) to avoid clicking
        envelope = 1.0
        if i < 500: envelope = i / 500.0
        if i > num_samples - 500: envelope = (num_samples - i) / 500.0
        
        value = math.sin(2.0 * math.pi * frequency * t) * volume * envelope
        data.append(value)
    return data

def generate_square_wave(frequency, duration, volume=1.0):
    num_samples = int(duration * SAMPLE_RATE)
    data = []
    for i in range(num_samples):
        t = float(i) / SAMPLE_RATE
        envelope = 1.0
        if i < 100: envelope = i / 100.0
        if i > num_samples - 500: envelope = (num_samples - i) / 500.0
        
        # Square wave approximation
        val = math.sin(2.0 * math.pi * frequency * t)
        value = (1.0 if val > 0 else -1.0) * volume * envelope
        data.append(value)
    return data

def generate_noise(duration, volume=1.0):
    num_samples = int(duration * SAMPLE_RATE)
    data = []
    for i in range(num_samples):
        envelope = 1.0
        if i > num_samples - 1000: envelope = (num_samples - i) / 1000.0
        value = (random.random() * 2.0 - 1.0) * volume * envelope
        data.append(value)
    return data

def main():
    ensure_dir(OUTPUT_DIR)

    # 1. Click: Short, high pitch, very fast decay
    click_data = generate_sine_wave(1200, 0.05, 0.3)
    save_wav("click.wav", click_data)

    # 2. Correct: "Ding" - Two tones (High C -> Higher E)
    # C5 (523.25 Hz) -> E5 (659.25 Hz)
    correct_data = generate_sine_wave(523.25, 0.1, 0.5) + generate_sine_wave(659.25, 0.3, 0.5)
    save_wav("correct.wav", correct_data)

    # 3. Incorrect: "Buzz" - Low square wave
    # A2 (110 Hz)
    incorrect_data = generate_square_wave(110, 0.4, 0.4)
    save_wav("incorrect.wav", incorrect_data)

    # 4. Success: Fanfare - Major Arpeggio
    # C4, E4, G4, C5
    # 261.63, 329.63, 392.00, 523.25
    success_data = []
    success_data.extend(generate_sine_wave(261.63, 0.1, 0.5))
    success_data.extend(generate_sine_wave(329.63, 0.1, 0.5))
    success_data.extend(generate_sine_wave(392.00, 0.1, 0.5))
    success_data.extend(generate_sine_wave(523.25, 0.4, 0.5))
    save_wav("success.wav", success_data)

if __name__ == "__main__":
    main()
