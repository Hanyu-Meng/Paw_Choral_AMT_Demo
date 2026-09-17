# Source provenance

- Audit date: 2026-09-06 (Europe/London).
- Source: read-only snapshot from a private research workstation.
- Snapshot archive SHA-256:
  `52ce7300c73d66d38e5a2ec39596acbac5414e7ada566c400b610d74db2de39f`.
- Qualitative figure SHA-256:
  `46747902ae576b79ca3ec25e50cf2e2955aec66892a2ef2c8643012ce133dbc5`.
- Interactive demo data SHA-256:
  `40b3e4f24b55aea60bbede1b9be978d41eb1705a4a4767a78cdb5ff2de4ae217`.
- Part-agnostic reference excerpt SHA-256:
  `70dd1f6539a830b3f783787aee0ae22f8287695faaddee2f2895842be165600c`.
- Original-recording excerpt SHA-256:
  `8da42a2d08a9df1d125ee57dd7daf1aba76b6453fc14b15fbb3dfe7e15298642`.
- Source recording SHA-256 before excerpt encoding:
  `73212f1fc740d61cf9a3ad245d69793665ed99daaabe282ccc1e0be45795d6ac`.
- Waveform peak data SHA-256:
  `44cddfc8f311a5b165d8db9ad0c8a340eb1a623a0fa034253bc2a3712729a6f8`.
- Interactive excerpt: the canonical part-agnostic reference plus cached
  PawCT, PagCT, Post-VA, MuScriptor-medium, and Yu et al. model predictions for
  `jd2_r4PK5dc`, cropped to 10–45 seconds. The reference contains 244 events
  derived by applying `clip_offsets_drop_unobservable_onsets_v1` and the
  100-Hz canonical-union policy to the trusted annotation (source annotation
  SHA-256 `d5dc8519ba70ba91f5c0e21e5eb8f65e56692da0d621e63848be56179b0a937e`;
  canonical excerpt-event SHA-256
  `8c23759d20d602b2de75a35782c044a448ace84683877bde6e59428cbc776aff`).
  The page includes the matching 35-second source-recording excerpt and a
  derived waveform. It contains no source MIDI, full annotation file,
  checkpoints, or probability arrays.
- MuScriptor-medium contributes 240 excerpt events. They were mechanically
  cropped from the audited 890-note zero-shot prediction artifact (artifact
  file SHA-256 `0bf35332b866c07b1a28521a6860fbeed729facbdf8d98a926ba0607355d1b96`,
  weights SHA-256 `ac80adbdf85d87231735fd948af7013441c0afced316c4e9067fd5d8a7fb97ec`,
  vendor commit `7f213afecf23bd6a1b8672aa223690ee9807cefb`). The canonical excerpt-event
  SHA-256 is `859e5bb9557b1ddeae71b764d2f8de1cd1388f8443a96df816b7cb7f87145f80`.
- Yu et al. contributes 218 excerpt events. No historical per-song prediction
  was retained, so this row is transparently a new audited demo inference from
  the frozen `best` checkpoint associated with the reported aggregate baseline
  (checkpoint SHA-256 `0d02a65b626284241ee62decf174a3d356ca0cfd7acd8cec890349dce5dae3bf`,
  config SHA-256 `f48df8bdffba7549828ab4cc9efc79b9c88b01a87c388e078e8126271b8b4479`).
  It uses the finite precomputed log-mel input (SHA-256
  `06b8c6927114e9034e8934fe671e588f012e76e0a64c1db39d946bf9a702c683`),
  `model.eval()`, beam size 4, 320-frame windows, 240-frame hops, full-song
  stitching, and then the same overlap-and-clip rule. The canonical
  excerpt-event SHA-256 is
  `d0eb258196e1da621d6e7b7284343c871afa605a5bd747841453c092ad1c7f11`.
- Baseline and case-study figures were generated from the manuscript table,
  audited MuScriptor aggregate and per-recording metrics, and cached symbolic
  outputs. Diagnostic nearest-onset pairing is explicitly distinguished from
  the official note-matching metric on the page.
- Static syntax audit: all imported Python files parsed/compiled.
- Local dependency-backed test run: 35 passed, with one expected `mir_eval`
  resampling warning; no failures.
- Excluded from import: approximately 119 GB of HDF5 data, probabilities,
  checkpoints, logs, caches, and generated visualizations.

The source directory was not tracked by the surrounding historical Git
repository, so its parent commit is not a source revision for these files.
Timestamp correspondence and the exact Figure 3 command/example provide strong
evidence that this is the manuscript code family, but not an immutable
experiment snapshot.
