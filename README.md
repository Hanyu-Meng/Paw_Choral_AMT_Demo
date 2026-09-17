# PawCT project page

Public project page for **“PawCT: End-to-End Choral Transcription into
Separate SATB Note Tracks.”**

**Live demo:**
[https://hanyu-meng.github.io/Paw_Choral_AMT_Demo/](https://hanyu-meng.github.io/Paw_Choral_AMT_Demo/)

PawCT transcribes one mixed choral recording into note-level soprano, alto,
tenor, and bass parts. This dependency-free academic project page presents a
concise paper summary, headline results, manuscript figures, and an interactive
listening comparison rendered from a short ground-truth excerpt and cached model predictions. The original
35-second recording excerpt is presented in an on-page waveform player, so
visitors do not need to leave the demo to hear it.

## Scientific status

The headline and aggregate metrics are manuscript-reported values, not results
regenerated from this demo repository. The listening rows additionally show
onset-only Note F1 at 50 and 100 ms, recomputed from the shipped 35-second
reference and prediction events; these excerpt-level values are illustrative
and are not full-test-set averages. Read [the reproducibility audit](REPRODUCIBILITY.md)
before citing any result. The accompanying implementation repository is
currently access-controlled while its experiment provenance is being frozen.

## Contents

- `index.html`, `styles.css`, and `app.js`: the static project page and browser-based note synthesizer;
- `assets/PawCT.pdf`: the current manuscript PDF;
- `assets/task-overview.png` and `assets/method-overview.png`: manuscript Figures 1 and 2;
- `assets/exsultate-deo-four-panel.png`: the qualitative piano-roll comparison;
- `assets/exsultate-deo-demo.json`: a 35-second excerpt of cached PawCT, PagCT, Post-VA, MuScriptor-medium, and Yu et al. model predictions;
- `assets/exsultate-deo-reference.json`: the matching 35-second part-agnostic union of the official SATB reference annotations;
- `assets/audio/exsultate-deo-10s-45s.mp3`: the matching 35-second source-recording excerpt;
- `assets/audio/exsultate-deo-waveform.json`: normalized peaks used by the interactive waveform;
- `assets/analysis/`: aggregate, recording-level, symbolic, onset-error, and ablation analyses;
- `assets/manifest.json`: asset provenance and rights notes;
- `tools/build_waveform.py`: dependency-free waveform-peak builder for PCM WAV input;
- `tools/merge_demo_baselines.mjs`: validates and merges audited baseline event exports into the listening demo;
- `CODE_WALKTHROUGH.md`: English method and code walkthrough;
- `CODE_WALKTHROUGH.zh-CN.md`: concise Chinese walkthrough;
- `REPRODUCIBILITY.md` and `PROVENANCE.md`: release caveats and source audit.

The site distributes one 35-second YouChorale recording excerpt and a
mechanically derived part-agnostic reference excerpt for scholarly comparison,
and links the recording's original provider for attribution. It does not
distribute the full recording, source MIDI, full annotation files, model
checkpoints, or probability files. See `assets/manifest.json` for provenance
and rights notes.

## Local preview

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>. Local serving is only for development; the
GitHub Pages link above is the intended public entry point.

## Maintainer

[Hanyu Meng](https://github.com/Hanyu-Meng), Multimodal Music Research Lab.

## License

Site source is released under Apache License 2.0. The manuscript PDF and
included figures remain author-owned research materials and are not covered by
the source license. The license also does not grant rights to datasets,
recordings, annotations, checkpoints, or other generated media; see
`assets/manifest.json` for details.
