/**
 * main.js
 * Application entry point for the Character Animation Playground.
 * Connects UI button handlers, keyboard shortcuts, HUD telemetry,
 * responsive stage resize, and the continuous animation loop.
 */

import { Character } from './character.js';

window.addEventListener('DOMContentLoaded', () => {
  const stageViewport = document.getElementById('stageViewport');
  const characterLayer = document.getElementById('characterLayer');
  const dustLayer = document.getElementById('dustLayer');

  // HUD Elements
  const hudActionBadge = document.getElementById('hudActionBadge');
  const hudSpeedVal = document.getElementById('hudSpeedVal');
  const hudDirectionVal = document.getElementById('hudDirectionVal');

  // Control Buttons
  const btnWalk = document.getElementById('btnWalk');
  const btnFastWalk = document.getElementById('btnFastWalk');
  const btnRun = document.getElementById('btnRun');
  const btnJump = document.getElementById('btnJump');
  const btnBicycle = document.getElementById('btnBicycle');
  const btnRiding = document.getElementById('btnRiding');
  const btnReset = document.getElementById('btnReset');
  const btnTurn = document.getElementById('btnTurn');

  const actionButtons = [btnWalk, btnFastWalk, btnRun, btnJump, btnBicycle, btnRiding];

  // Initialize Character
  let stageWidth = stageViewport.clientWidth;
  const character = new Character(characterLayer, stageWidth);

  // Set active button highlight helper
  function setActiveButton(activeBtn) {
    actionButtons.forEach(btn => btn.classList.remove('active'));
    if (activeBtn) activeBtn.classList.add('active');
  }

  // Hook state changes to HUD and buttons
  character.onStateChange = (state) => {
    hudActionBadge.textContent = state.toUpperCase();
    hudActionBadge.className = `action-pill state-${state}`;

    switch (state) {
      case 'walk': setActiveButton(btnWalk); break;
      case 'fastWalk': setActiveButton(btnFastWalk); break;
      case 'run': setActiveButton(btnRun); break;
      case 'jump': setActiveButton(btnJump); break;
      case 'bicycle': setActiveButton(btnBicycle); break;
      case 'riding': setActiveButton(btnRiding); break;
      case 'idle':
      default:
        setActiveButton(null);
        break;
    }
  };

  // Button Listeners
  btnWalk.addEventListener('click', () => character.walk());
  btnFastWalk.addEventListener('click', () => character.fastWalk());
  btnRun.addEventListener('click', () => character.run());
  btnJump.addEventListener('click', () => character.jump());
  btnBicycle.addEventListener('click', () => character.bicycle());
  btnRiding.addEventListener('click', () => character.ride());
  btnReset.addEventListener('click', () => character.reset());
  btnTurn.addEventListener('click', () => character.turnAround());

  // Keyboard Shortcuts for instant testability
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key.toLowerCase()) {
      case 'w':
        character.walk();
        break;
      case 'f':
        character.fastWalk();
        break;
      case 'r':
        character.run();
        break;
      case ' ':
      case 'j':
        e.preventDefault();
        character.jump();
        break;
      case 'b':
        character.bicycle();
        break;
      case 's':
        character.ride();
        break;
      case 't':
        character.turnAround();
        break;
      case 'escape':
        character.reset();
        break;
    }
  });

  // Responsive stage resizing
  window.addEventListener('resize', () => {
    stageWidth = stageViewport.clientWidth;
  });

  // Dust Puff Particle Spawner (during Run, Jump Landing, or Scooter Kick)
  let dustTimer = 0;
  function spawnDust(x, y) {
    if (!dustLayer) return;
    const puff = document.createElement('div');
    puff.className = 'dust-puff';
    puff.style.left = `${x + 30}px`;
    puff.style.bottom = `42px`;
    dustLayer.appendChild(puff);
    setTimeout(() => puff.remove(), 600);
  }

  // Animation Frame Loop
  let lastTime = performance.now();

  function tick(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    // Update Character Kinematics
    character.update(dt, stageWidth);

    // Update HUD
    hudSpeedVal.textContent = `${Math.round(character.speed)} px/s`;
    hudDirectionVal.textContent = character.facing > 0 ? 'Right ➔' : 'Left ➔';

    // Spawn dust puffs if running
    dustTimer += dt;
    if (character.state === 'run' && dustTimer > 0.16) {
      dustTimer = 0;
      spawnDust(character.x, character.y);
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
});
