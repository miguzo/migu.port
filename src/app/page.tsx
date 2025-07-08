@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap');

body {
  background: #19191b;
  background-image: url('https://www.transparenttextures.com/patterns/dark-fish-skin.png');
  font-family: 'Cinzel', serif;
  color: #e5c06c;
}

.fantasy-card {
  border-radius: 1.4rem;
  border: 3px solid transparent;
  background-clip: padding-box;
  box-shadow: 0 2px 24px 0 #000a, 0 0 0 5px rgba(229, 192, 108, 0.13), 0 2px 32px 0 #0009;
  background: linear-gradient(120deg, #232325 85%, #77622c 120%);
  position: relative;
  overflow: visible;
}
.fantasy-card:before {
  content: "";
  position: absolute;
  inset: -6px;
  border-radius: 1.55rem;
  border: 2.7px solid #e5c06c;
  box-shadow: 0 0 32px 4px #e5c06c33, 0 0 0 4px #19191b;
  pointer-events: none;
  z-index: 2;
}
.fantasy-glow {
  text-shadow: 0 1px 8px #e5c06c77, 0 0 1px #fff7;
}
.fantasy-btn {
  border-radius: 9999px;
  border: 2px solid #e5c06c;
  background: rgba(34, 32, 23, 0.94);
  color: #e5c06c;
  box-shadow: 0 1px 8px #e5c06c55, 0 1px 0 #fff3;
  transition: all .15s;
}
.fantasy-btn:hover, .fantasy-btn:focus {
  background: #e5c06c;
  color: #19191b;
  box-shadow: 0 1px 24px #e5c06cbb;
}
.fantasy-panel {
  background: linear-gradient(135deg, #232325 82%, #9f8751 120%);
  border: 2.5px solid #e5c06c;
  border-radius: 1.3rem;
  box-shadow: 0 0 40px 8px #0009;
  color: #e5c06c;
  font-family: 'Cinzel', serif;
}
.fantasy-title {
  font-family: 'Cinzel', serif;
  font-size: 1.15rem;
  color: #e5c06c;
  margin-top: 0.25rem;
  text-shadow: 0 1px 10px #e5c06c88, 0 0 1px #fff;
  letter-spacing: 0.05em;
}
.fantasy-playlist {
  background: rgba(30, 27, 15, 0.93);
  border: 1.5px solid #e5c06c;
  border-radius: 0.9rem;
  box-shadow: 0 0 20px #e5c06c44;
}
.fantasy-track-active {
  background: #e5c06c22;
  color: #e5c06c;
}
