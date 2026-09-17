type SystemSound = "startup" | "close" | "minimize";

type Note = { frequency: number; start: number; duration: number; volume: number };

// Three ascending sine notes, loosely evoking a startup chime — an original
// tone, not the real macOS sound asset (same "recreated, not traced"
// approach as the SVG icons, see os-macos-ui skill).
const SOUND_RECIPES: Record<SystemSound, Note[]> = {
  startup: [
    { frequency: 523.25, start: 0, duration: 0.28, volume: 0.12 },
    { frequency: 659.25, start: 0.06, duration: 0.3, volume: 0.12 },
    { frequency: 783.99, start: 0.12, duration: 0.4, volume: 0.14 },
  ],
  close: [{ frequency: 420, start: 0, duration: 0.09, volume: 0.08 }],
  minimize: [
    { frequency: 660, start: 0, duration: 0.08, volume: 0.07 },
    { frequency: 440, start: 0.05, duration: 0.1, volume: 0.07 },
  ],
};

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const AudioContextCtor = window.AudioContext;
    if (!AudioContextCtor) return null;
    audioContext = new AudioContextCtor();
  }
  return audioContext;
}

/**
 * Plays a short synthesized system-sound easter egg (see TODO.md Phase 9).
 * Must be called from a user-gesture handler — browsers block `AudioContext`
 * otherwise — and silently no-ops without Web Audio support.
 */
export function playSystemSound(sound: SystemSound): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();

  const now = ctx.currentTime;
  for (const note of SOUND_RECIPES[sound]) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(note.frequency, now + note.start);
    gain.gain.setValueAtTime(0, now + note.start);
    gain.gain.linearRampToValueAtTime(note.volume, now + note.start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + note.start + note.duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now + note.start);
    oscillator.stop(now + note.start + note.duration + 0.02);
  }
}
