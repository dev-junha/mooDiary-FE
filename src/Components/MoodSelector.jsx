import clsx from "clsx";

const MOODS = [
  { key: "joy",   label: "기쁨", emoji: "😊" },
  { key: "calm",  label: "평온", emoji: "🙂" },
  { key: "sad",   label: "슬픔", emoji: "😢" },
  { key: "angry", label: "분노", emoji: "😠" },
  { key: "anx",   label: "불안", emoji: "😟" },
  { key: "tired", label: "피곤", emoji: "🥱" },
];

export default function MoodSelector({ value, onChange }) {
  return (
    <div className="mood-wrap">
      {MOODS.map(m => (
        <button
          key={m.key}
          type="button"
          className={clsx("mood-chip", value === m.key && "active")}
          onClick={() => onChange?.(m.key)}
          aria-pressed={value === m.key}
          title={m.label}
        >
          <span className="emoji" aria-hidden>{m.emoji}</span>
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  );
}