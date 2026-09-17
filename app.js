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
  let demo = null;
  let audioContext = null;
  let pianoWave = null;
  let activeNodes = [];
  let activeButton = null;
  let stopTimer = null;

  function trackFor(model, voice) {
    if (!demo || !demo.tracks[model]) return [];
    if (voice !== "all" || model === "pagct") {
      return (demo.tracks[model][voice] || []).map((event) => ({ ...event, part: voice }));
    }
    return demo.voices.flatMap((part) =>
      (demo.tracks[model][part] || []).map((event) => ({ ...event, part }))
    );
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
    resizeTimer = window.setTimeout(paintAll, 120);
  });
  window.addEventListener("pagehide", resetPlayer);
  loadDemo();
})();
