(() => {
  const COLORS = {
    S: "#db5361",
    A: "#d99425",
    T: "#278b91",
    B: "#3b6ea8",
    all: "#64734e",
  };

  const buttons = [...document.querySelectorAll(".play-button[data-model]")];
  const canvases = [...document.querySelectorAll(".piano-roll[data-model]")];
  const status = document.querySelector("#demo-status");
  const sourcePlayer = document.querySelector("[data-waveform-player]");
  const sourceAudio = document.querySelector("#original-recording");
  const sourceButton = document.querySelector("[data-original-play]");
  const sourceCanvas = document.querySelector("#original-waveform");
  const sourceScrubber = document.querySelector("#original-scrubber");
  const sourceStatus = document.querySelector("[data-waveform-status]");
  const sourceTime = document.querySelector("[data-waveform-time]");
  let demo = null;
  let audioContext = null;
  let pianoWave = null;
  let activeNodes = [];
  let activeButton = null;
  let stopTimer = null;
  let sourcePeaks = null;
  let sourceFrame = null;

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";
    const rounded = Math.max(0, Math.floor(seconds));
    return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, "0")}`;
  }

  function updateSourceTime() {
    if (!sourceAudio || !sourceScrubber || !sourceTime) return;
    const duration = Number.isFinite(sourceAudio.duration) ? sourceAudio.duration : 35;
    sourceScrubber.max = String(duration);
    sourceScrubber.value = String(Math.min(sourceAudio.currentTime, duration));
    sourceTime.textContent = `${formatTime(sourceAudio.currentTime)} / ${formatTime(duration)}`;
  }

  function drawSourceWaveform() {
    if (!sourceCanvas) return;
    const rect = sourceCanvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    sourceCanvas.width = Math.round(rect.width * ratio);
    sourceCanvas.height = Math.round(rect.height * ratio);
    const ctx = sourceCanvas.getContext("2d");
    ctx.scale(ratio, ratio);
    ctx.fillStyle = "#f5f7f9";
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.strokeStyle = "#d9dee3";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, rect.height / 2);
    ctx.lineTo(rect.width, rect.height / 2);
    ctx.stroke();
    if (!sourcePeaks?.length) return;

    const duration = Number.isFinite(sourceAudio?.duration) ? sourceAudio.duration : 35;
    const progress = duration > 0 ? (sourceAudio?.currentTime || 0) / duration : 0;
    const bars = Math.max(1, Math.floor(rect.width / 2));
    for (let index = 0; index < bars; index += 1) {
      const peakIndex = Math.min(sourcePeaks.length - 1, Math.floor((index / bars) * sourcePeaks.length));
      const magnitude = Math.max(0.04, sourcePeaks[peakIndex]);
      const barHeight = magnitude * rect.height * 0.82;
      const x = (index / bars) * rect.width;
      ctx.fillStyle = index / bars <= progress ? "#2877c7" : "#aeb6be";
      ctx.fillRect(x, (rect.height - barHeight) / 2, 1.25, barHeight);
    }
  }

  function stopSourceAnimation() {
    if (sourceFrame) window.cancelAnimationFrame(sourceFrame);
    sourceFrame = null;
  }

  function animateSource() {
    updateSourceTime();
    drawSourceWaveform();
    if (sourceAudio && !sourceAudio.paused) {
      sourceFrame = window.requestAnimationFrame(animateSource);
    }
  }

  function pauseSource() {
    sourceAudio?.pause();
  }

  async function loadSourceWaveform() {
    if (!sourceAudio || !sourceCanvas || !sourcePlayer) return;
    try {
      let staticPeaksLoaded = false;
      try {
        const peakResponse = await fetch("assets/audio/exsultate-deo-waveform.json");
        if (!peakResponse.ok) throw new Error(`HTTP ${peakResponse.status}`);
        const waveform = await peakResponse.json();
        if (!Array.isArray(waveform.peaks) || !waveform.peaks.length) {
          throw new Error("Waveform peak data is empty");
        }
        sourcePeaks = Float32Array.from(waveform.peaks);
        staticPeaksLoaded = true;
      } catch (peakError) {
        console.warn("Precomputed waveform unavailable; decoding audio locally", peakError);
      }

      if (!staticPeaksLoaded) {
        const response = await fetch(sourceAudio.currentSrc || sourceAudio.src);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const encoded = await response.arrayBuffer();
        const DecodeContext = window.AudioContext || window.webkitAudioContext;
        const decodeContext = new DecodeContext();
        const buffer = await decodeContext.decodeAudioData(encoded.slice(0));
        const bucketCount = 1800;
        const blockSize = Math.max(1, Math.floor(buffer.length / bucketCount));
        const peaks = new Float32Array(bucketCount);
        for (let bucket = 0; bucket < bucketCount; bucket += 1) {
          const start = bucket * blockSize;
          const end = Math.min(buffer.length, start + blockSize);
          let peak = 0;
          for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
            const samples = buffer.getChannelData(channel);
            for (let sample = start; sample < end; sample += 1) {
              peak = Math.max(peak, Math.abs(samples[sample]));
            }
          }
          peaks[bucket] = peak;
        }
        sourcePeaks = peaks;
        await decodeContext.close();
      }
      sourceStatus?.classList.add("is-ready");
      drawSourceWaveform();
    } catch (error) {
      sourcePlayer.classList.add("is-fallback");
      if (sourceAudio) sourceAudio.controls = true;
      if (sourceStatus) sourceStatus.textContent = "Waveform unavailable; use the audio controls below.";
      console.error("Original recording waveform failed to load", error);
    }
  }

  function trackFor(model, voice) {
    const tracks = demo?.tracks?.[model];
    if (!tracks) return [];

    if (voice !== "all") {
      return (tracks[voice] || []).map((event) => ({ ...event, part: voice }));
    }

    const partEvents = demo.voices.flatMap((part) =>
      (tracks[part] || []).map((event) => ({ ...event, part }))
    );
    if (partEvents.length) return partEvents;

    return (tracks.all || []).map((event) => ({ ...event, part: "all" }));
  }

  function paint(canvas) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    const ctx = canvas.getContext("2d");
    ctx.scale(ratio, ratio);

    const width = rect.width;
    const height = rect.height;
    const model = canvas.dataset.model;
    const voice = canvas.dataset.voice;
    const events = trackFor(model, voice);
    const duration = demo ? demo.durationSeconds : 35;
    const minPitch = 38;
    const maxPitch = 89;

    ctx.fillStyle = model === "postva" ? "#f6f7f8" : "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#e7e8ea";
    ctx.lineWidth = 1;
    for (let second = 5; second < duration; second += 5) {
      const x = (second / duration) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (const event of events) {
      const x = (event.t / duration) * width;
      const noteWidth = Math.max(1.5, (event.d / duration) * width);
      const y = height - ((event.p - minPitch + 1) / (maxPitch - minPitch + 2)) * height;
      ctx.fillStyle = COLORS[event.part] || COLORS.all;
      ctx.globalAlpha = model === "postva" ? 0.72 : 0.9;
      ctx.fillRect(x, y, noteWidth, voice === "all" ? 2 : 2.5);
    }
    ctx.globalAlpha = 1;
  }

  function paintAll() {
    canvases.forEach(paint);
  }

  function resetPlayer() {
    activeNodes.forEach((node) => {
      try { node.stop(); } catch (_) { /* already stopped */ }
    });
    activeNodes = [];
    if (stopTimer) window.clearTimeout(stopTimer);
    stopTimer = null;
    if (activeButton) {
      activeButton.classList.remove("is-playing");
      activeButton.querySelector("span").textContent = "▶";
    }
    activeButton = null;
  }

  function playTrack(button) {
    if (activeButton === button) {
      resetPlayer();
      return;
    }
    resetPlayer();
    pauseSource();
    const events = trackFor(button.dataset.model, button.dataset.voice);
    if (!events.length) return;

    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume();
    const start = audioContext.currentTime + 0.06;
    if (!pianoWave) {
      const real = new Float32Array(8);
      const imaginary = new Float32Array([0, 1, 0.52, 0.27, 0.14, 0.07, 0.035, 0.015]);
      pianoWave = audioContext.createPeriodicWave(real, imaginary);
    }

    const master = audioContext.createGain();
    const tone = audioContext.createBiquadFilter();
    const compressor = audioContext.createDynamicsCompressor();
    const partGain = button.dataset.voice === "all" ? 0.46 : 0.68;
    master.gain.setValueAtTime(partGain, start);
    tone.type = "lowpass";
    tone.frequency.setValueAtTime(5200, start);
    tone.Q.setValueAtTime(0.7, start);
    master.connect(tone);
    tone.connect(compressor);
    compressor.connect(audioContext.destination);

    for (const event of events) {
      const oscillator = audioContext.createOscillator();
      const envelope = audioContext.createGain();
      const onset = start + event.t;
      const offset = onset + Math.max(0.05, event.d);
      const attackEnd = Math.min(onset + 0.006, offset - 0.02);
      const decayEnd = Math.min(onset + 0.45, Math.max(attackEnd + 0.01, offset - 0.04));
      const amplitude = Math.min(0.06, 0.021 + (event.v / 127) * 0.029);
      oscillator.setPeriodicWave(pianoWave);
      oscillator.frequency.setValueAtTime(440 * 2 ** ((event.p - 69) / 12), onset);
      envelope.gain.setValueAtTime(0.0001, onset);
      envelope.gain.exponentialRampToValueAtTime(amplitude, attackEnd);
      envelope.gain.exponentialRampToValueAtTime(Math.max(0.0002, amplitude * 0.32), decayEnd);
      envelope.gain.exponentialRampToValueAtTime(0.0001, offset);
      oscillator.connect(envelope);
      envelope.connect(master);
      oscillator.start(onset);
      oscillator.stop(offset + 0.02);
      activeNodes.push(oscillator);
    }

    activeButton = button;
    button.classList.add("is-playing");
    button.querySelector("span").textContent = "■";
    stopTimer = window.setTimeout(resetPlayer, (demo.durationSeconds + 0.2) * 1000);
  }

  async function loadDemo() {
    try {
      const response = await fetch("assets/exsultate-deo-demo.json");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      demo = await response.json();
      buttons.forEach((button) => {
        button.disabled = false;
        button.addEventListener("click", () => playTrack(button));
      });
      status.textContent = "Model outputs ready.";
      status.classList.add("ready");
      paintAll();
    } catch (error) {
      status.textContent = "The listening example could not be loaded. The paper figures and results remain available below.";
      console.error("PawCT demo data failed to load", error);
    }
  }

  sourceButton?.addEventListener("click", async () => {
    if (!sourceAudio) return;
    if (sourceAudio.paused) {
      resetPlayer();
      try {
        await sourceAudio.play();
      } catch (error) {
        sourcePlayer?.classList.add("is-fallback");
        sourceAudio.controls = true;
        console.error("Original recording playback failed", error);
      }
    } else {
      sourceAudio.pause();
    }
  });

  sourceAudio?.addEventListener("loadedmetadata", () => {
    updateSourceTime();
    drawSourceWaveform();
  });
  sourceAudio?.addEventListener("play", () => {
    sourceButton?.classList.add("is-playing");
    sourceButton?.setAttribute("aria-label", "Pause the original recording");
    const icon = sourceButton?.querySelector("span");
    if (icon) icon.textContent = "❚❚";
    stopSourceAnimation();
    animateSource();
  });
  sourceAudio?.addEventListener("pause", () => {
    sourceButton?.classList.remove("is-playing");
    sourceButton?.setAttribute("aria-label", "Play the original recording");
    const icon = sourceButton?.querySelector("span");
    if (icon) icon.textContent = "▶";
    stopSourceAnimation();
    updateSourceTime();
    drawSourceWaveform();
  });
  sourceAudio?.addEventListener("ended", () => {
    sourceAudio.currentTime = 0;
    updateSourceTime();
    drawSourceWaveform();
  });
  sourceScrubber?.addEventListener("input", () => {
    if (!sourceAudio) return;
    sourceAudio.currentTime = Number(sourceScrubber.value);
    updateSourceTime();
    drawSourceWaveform();
  });

  const copyButton = document.querySelector("[data-copy-citation]");
  copyButton?.addEventListener("click", async () => {
    const citation = document.querySelector("#bibtex code")?.textContent || "";
    try {
      await navigator.clipboard.writeText(citation);
      copyButton.textContent = "Copied";
      window.setTimeout(() => { copyButton.textContent = "Copy BibTeX"; }, 1600);
    } catch (_) {
      copyButton.textContent = "Select and copy below";
    }
  });

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      paintAll();
      drawSourceWaveform();
    }, 120);
  });
  window.addEventListener("pagehide", () => {
    resetPlayer();
    pauseSource();
    stopSourceAnimation();
  });
  loadSourceWaveform();
  loadDemo();
})();
