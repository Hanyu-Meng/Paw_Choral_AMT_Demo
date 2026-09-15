# PawCT project page

Public project page for **“PawCT: End-to-End Choral Transcription into
Separate SATB Note Tracks.”**

**Live demo:**
[https://hanyu-meng.github.io/ICASSP2027_Paw_Choral_AMT_Demo/](https://hanyu-meng.github.io/ICASSP2027_Paw_Choral_AMT_Demo/)

PawCT transcribes one mixed choral recording into note-level soprano, alto,
tenor, and bass parts. This dependency-free academic project page presents a
concise paper summary, headline results, manuscript figures, and an interactive
listening comparison rendered from cached model predictions.

## Scientific status

The displayed metrics are manuscript-reported values, not results regenerated
from this demo repository. Read [the reproducibility audit](REPRODUCIBILITY.md)
before citing them. The accompanying implementation repository is currently
access-controlled while its experiment provenance is being frozen.

## Contents

- `index.html`, `styles.css`, and `app.js`: the static project page and browser-based note synthesizer;
- `assets/ICASSP2027_PawCT.pdf`: the current manuscript PDF;
- `assets/task-overview.png` and `assets/method-overview.png`: manuscript Figures 1 and 2;
- `assets/exsultate-deo-four-panel.png`: the qualitative piano-roll comparison;
- `assets/exsultate-deo-demo.json`: a 35-second excerpt of cached PawCT, PagCT, and Post-VA model predictions;
- `assets/manifest.json`: asset provenance and rights notes;
- `CODE_WALKTHROUGH.md`: English method and code walkthrough;
- `CODE_WALKTHROUGH.zh-CN.md`: concise Chinese walkthrough;
- `REPRODUCIBILITY.md` and `PROVENANCE.md`: release caveats and source audit.

No YouChorale audio file, source MIDI, annotation, model checkpoint, or
probability file is distributed here. The qualitative example links to the
corresponding recording at its original YouTube host.

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
