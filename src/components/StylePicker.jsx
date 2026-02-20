import { CABINET_STYLES } from '../cabinetStyles';

export default function StylePicker({ selectedStyle, onSelectStyle }) {
  return (
    <div className="style-picker">
      <h3 className="style-picker__title">Cabinet Style</h3>
      <div className="style-picker__grid">
        {CABINET_STYLES.map((style) => (
          <button
            key={style.id}
            className={`style-card ${selectedStyle.id === style.id ? 'style-card--active' : ''}`}
            onClick={() => onSelectStyle(style)}
            title={style.name}
          >
            <StyleSwatch style={style} />
            <span className="style-card__label">{style.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StyleSwatch({ style }) {
  return (
    <svg
      width="56"
      height="40"
      viewBox="0 0 56 40"
      aria-hidden="true"
      className="style-swatch"
    >
      {/* Frame */}
      <rect x="0" y="0" width="56" height="40" fill={style.frame} rx="2" />
      {/* Left door */}
      <rect x="3" y="3" width="23" height="34" fill={style.door} stroke={style.doorBorder} strokeWidth="1" rx="1" />
      {/* Left door inset */}
      <rect x="6" y="6" width="17" height="28" fill="none" stroke={style.doorBorder} strokeWidth="0.6" opacity="0.5" rx="1" />
      {/* Right door */}
      <rect x="30" y="3" width="23" height="34" fill={style.door} stroke={style.doorBorder} strokeWidth="1" rx="1" />
      {/* Right door inset */}
      <rect x="33" y="6" width="17" height="28" fill="none" stroke={style.doorBorder} strokeWidth="0.6" opacity="0.5" rx="1" />
      {/* Handles */}
      {style.handleType === 'bar' ? (
        <>
          <rect x="10" y="26" width="9" height="3" fill={style.handle} rx="1" />
          <rect x="37" y="26" width="9" height="3" fill={style.handle} rx="1" />
        </>
      ) : (
        <>
          <circle cx="14.5" cy="27" r="2.5" fill={style.handle} />
          <circle cx="41.5" cy="27" r="2.5" fill={style.handle} />
        </>
      )}
    </svg>
  );
}
