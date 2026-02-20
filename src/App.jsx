import { useState } from 'react';
import CabinetOverlay from './components/CabinetOverlay';
import StylePicker from './components/StylePicker';
import { CABINET_STYLES } from './cabinetStyles';
import './App.css';

export default function App() {
  const [selectedStyle, setSelectedStyle] = useState(CABINET_STYLES[0]);
  const [showOverlay, setShowOverlay] = useState(true);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">🪟 Cabinet AR</h1>
        <p className="app-subtitle">Visualise new cabinets in your space — live</p>
      </header>

      <main className="app-main">
        <CabinetOverlay selectedStyle={selectedStyle} showOverlay={showOverlay} />
      </main>

      <aside className="app-sidebar">
        <div className="overlay-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showOverlay}
              onChange={(e) => setShowOverlay(e.target.checked)}
            />
            <span className="toggle-track" />
            <span className="toggle-text">Show virtual cabinet</span>
          </label>
        </div>

        <StylePicker selectedStyle={selectedStyle} onSelectStyle={setSelectedStyle} />
      </aside>
    </div>
  );
}
