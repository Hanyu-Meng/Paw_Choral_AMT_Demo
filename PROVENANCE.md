# Source provenance

- Audit date: 2026-09-06 (Europe/London).
- Source: read-only snapshot from a private research workstation.
- Snapshot archive SHA-256:
  `52ce7300c73d66d38e5a2ec39596acbac5414e7ada566c400b610d74db2de39f`.
- Qualitative figure SHA-256:
  `46747902ae576b79ca3ec25e50cf2e2955aec66892a2ef2c8643012ce133dbc5`.
- Interactive demo data SHA-256:
  `9e5a7e169456f24b6e1813f100c82497d6d752ee4a7acff1257446b815f97fc3`.
- Original-recording excerpt SHA-256:
  `8da42a2d08a9df1d125ee57dd7daf1aba76b6453fc14b15fbb3dfe7e15298642`.
- Source recording SHA-256 before excerpt encoding:
  `73212f1fc740d61cf9a3ad245d69793665ed99daaabe282ccc1e0be45795d6ac`.
- Waveform peak data SHA-256:
  `44cddfc8f311a5b165d8db9ad0c8a340eb1a623a0fa034253bc2a3712729a6f8`.
- Interactive excerpt: cached PawCT, PagCT, and Post-VA model predictions for
  `jd2_r4PK5dc`, cropped to 10–45 seconds. The page now includes the matching
  35-second source-recording excerpt and a derived waveform. It contains no
  reference MIDI, reference annotations, checkpoints, or probability arrays.
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
