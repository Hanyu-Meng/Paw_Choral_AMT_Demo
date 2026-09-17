#!/usr/bin/env python3
"""Build normalized waveform peaks from a 16-bit PCM WAV file."""

from __future__ import annotations

import argparse
import json
import sys
import wave
from array import array
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--buckets", type=int, default=1800)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    with wave.open(str(args.input), "rb") as audio:
        channels = audio.getnchannels()
        sample_width = audio.getsampwidth()
        sample_rate = audio.getframerate()
        frame_count = audio.getnframes()
        raw = audio.readframes(frame_count)

    if sample_width != 2:
        raise ValueError(f"Expected 16-bit PCM; got {sample_width * 8}-bit audio")

    samples = array("h")
    samples.frombytes(raw)
    if sys.byteorder != "little":
        samples.byteswap()

    bucket_count = max(1, args.buckets)
    frames_per_bucket = max(1, frame_count // bucket_count)
    peaks: list[float] = []
    for bucket in range(bucket_count):
        first = bucket * frames_per_bucket
        last = frame_count if bucket == bucket_count - 1 else min(
            frame_count, first + frames_per_bucket
        )
        peak = 0
        for frame in range(first, last):
            offset = frame * channels
            for channel in range(channels):
                peak = max(peak, abs(samples[offset + channel]))
        peaks.append(peak / 32768.0)

    normalization_peak = max(peaks) or 1.0
    payload = {
        "schemaVersion": 1,
        "durationSeconds": frame_count / sample_rate,
        "sampleRate": sample_rate,
        "channels": channels,
        "bucketCount": bucket_count,
        "normalizationPeak": round(normalization_peak, 8),
        "peaks": [round(value / normalization_peak, 5) for value in peaks],
    }
    args.output.write_text(
        json.dumps(payload, separators=(",", ":")) + "\n", encoding="utf-8"
    )


if __name__ == "__main__":
    main()
