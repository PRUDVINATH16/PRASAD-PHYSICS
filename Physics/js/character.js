/**
 * character.js
 * The core Character class representing "Kip the Mascot".
 * Manages character states, SVG puppet articulation, vehicle mounting,
 * transitions, physics position updates, and bounds handling.
 */

import { AnimationEngine } from './animation.js';
import { VehicleRenderer } from './vehicles.js';

export class Character {
  constructor(containerElement, stageWidth = 1000) {
    this.container = containerElement;
    this.stageWidth = stageWidth;

    // Movement & Transform Properties
    this.x = 120; // Initial start position in px
    this.y = 0;   // Height offset from ground in px
    this.facing = 1; // 1 = Right, -1 = Left
    this.groundY = 0;

    // State & Action
    this.state = 'idle'; // 'idle', 'walk', 'fastWalk', 'run', 'jump', 'bicycle', 'riding'
    this.speed = 0; // Current travel velocity in px/s
    this.targetSpeed = 0;

    // Jumping physics state
    this.isJumping = false;
    this.jumpTimer = 0;
    this.jumpDuration = 0.95; // seconds
    this.jumpPeakHeight = 90; // px

    // Bicycle & Scooter Kinematics
    this.wheelRotation = 0;
    this.pedalRotation = 0;
    this.scooterKickPhase = 0;

    // Sub-systems
    this.anim = new AnimationEngine();
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.stateTime = 0;

    // Callbacks
    this.onStateChange = null;

    this.initDOM();
  }

  initDOM() {
    this.root = document.createElement('div');
    this.root.className = 'kip-character-wrapper';
    this.container.appendChild(this.root);

    this.root.innerHTML = `
      <!-- Ground Contact Shadow -->
      <div class="kip-shadow" id="kipShadow"></div>

      <!-- Vehicle Layer (Behind or beneath character) -->
      <svg class="vehicle-svg" id="vehicleLayer" viewBox="0 0 140 120" width="140" height="120">
        ${VehicleRenderer.getBicycleSVG()}
        ${VehicleRenderer.getScooterSVG()}
      </svg>

      <!-- Kip Puppet SVG Layer -->
      <svg class="kip-svg" id="kipSvg" viewBox="0 0 130 140" width="130" height="140">
        <defs>
          <linearGradient id="kipFur" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ff9e3b" />
            <stop offset="100%" stop-color="#f57c00" />
          </linearGradient>
          <linearGradient id="creamFur" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="100%" stop-color="#fff8ed" />
          </linearGradient>
          <linearGradient id="scarfGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0284c7" />
            <stop offset="100%" stop-color="#38bdf8" />
          </linearGradient>
        </defs>

        <!-- Tail -->
        <g id="kipTail" class="part-tail">
          <path d="M 46 92 C 24 96 10 78 16 56 C 22 44 38 52 40 70 C 42 80 46 86 48 90" fill="url(#kipFur)" />
          <path d="M 16 56 C 19 47 28 49 32 60 C 26 58 20 54 16 56" fill="url(#creamFur)" />
        </g>

        <!-- Left / Back Leg (Behind Body) -->
        <g id="kipLegBack" class="part-leg part-leg-back" transform-origin="48px 90px">
          <path d="M 48 90 L 44 114 L 42 124" stroke="url(#kipFur)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none" />
          <ellipse cx="44" cy="125" rx="7" ry="4.5" fill="#e65100" />
        </g>

        <!-- Torso & Explorer Scarf -->
        <g id="kipTorso" class="part-torso" transform-origin="60px 88px">
          <!-- Torso Body -->
          <ellipse cx="60" cy="85" rx="20" ry="23" fill="url(#kipFur)" />
          <!-- Cream Belly -->
          <path d="M 55 74 C 66 74 73 82 73 94 C 73 103 64 106 55 106 C 48 106 46 99 46 88 C 46 78 51 74 55 74 Z" fill="url(#creamFur)" />
          
          <!-- Cute Scout Scarf -->
          <path d="M 44 68 Q 62 76 80 68" stroke="url(#scarfGrad)" stroke-width="7" stroke-linecap="round" fill="none" />
          <polygon id="kipScarfTail" points="48,72 40,94 54,82" fill="#0284c7" />
        </g>

        <!-- Right / Front Leg -->
        <g id="kipLegFront" class="part-leg part-leg-front" transform-origin="68px 90px">
          <path d="M 68 90 L 72 114 L 74 124" stroke="url(#kipFur)" stroke-width="9.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
          <ellipse cx="76" cy="125" rx="7.5" ry="4.5" fill="#e65100" />
        </g>

        <!-- Left / Back Arm -->
        <g id="kipArmBack" class="part-arm part-arm-back" transform-origin="48px 74px">
          <path d="M 48 74 L 40 90 L 46 96" stroke="url(#kipFur)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none" />
          <circle cx="46" cy="96" r="4.5" fill="#e65100" />
        </g>

        <!-- Head and Face Elements -->
        <g id="kipHead" class="part-head" transform-origin="64px 54px">
          <!-- Ears -->
          <g id="kipEarLeft" class="part-ear" transform-origin="48px 36px">
            <polygon points="52,42 40,12 64,30" fill="url(#kipFur)" />
            <polygon points="53,38 45,18 61,30" fill="#ffb4a2" />
          </g>
          <g id="kipEarRight" class="part-ear" transform-origin="76px 36px">
            <polygon points="70,34 90,14 82,42" fill="url(#kipFur)" />
            <polygon points="72,34 85,20 80,40" fill="#ffb4a2" />
          </g>

          <!-- Head Base -->
          <ellipse cx="64" cy="52" rx="23" ry="20" fill="url(#kipFur)" />
          <!-- Cheek Fluff -->
          <polygon points="41,56 33,62 42,65" fill="url(#kipFur)" />
          <polygon points="87,56 95,62 86,65" fill="url(#kipFur)" />

          <!-- Cream Snout / Muzzle -->
          <path d="M 52 52 C 52 45 76 45 76 52 C 76 64 68 69 64 69 C 60 69 52 64 52 52 Z" fill="url(#creamFur)" />
          <!-- Button Nose -->
          <ellipse cx="64" cy="55" rx="3.5" ry="2.5" fill="#1e293b" />

          <!-- Eyes Group -->
          <g id="kipEyes" transform-origin="64px 46px">
            <!-- Left Eye -->
            <ellipse class="eye-white" cx="54" cy="46" rx="6.5" ry="8" fill="#ffffff" stroke="#1e293b" stroke-width="1.2" />
            <ellipse class="eye-pupil" cx="55" cy="46" rx="4.5" ry="5.5" fill="#1e293b" />
            <circle cx="53" cy="43" r="2.2" fill="#ffffff" />
            <circle cx="56.5" cy="48" r="1.1" fill="#ffffff" />

            <!-- Right Eye -->
            <ellipse class="eye-white" cx="74" cy="46" rx="6.5" ry="8" fill="#ffffff" stroke="#1e293b" stroke-width="1.2" />
            <ellipse class="eye-pupil" cx="73" cy="46" rx="4.5" ry="5.5" fill="#1e293b" />
            <circle cx="72" cy="43" r="2.2" fill="#ffffff" />
            <circle cx="74.5" cy="48" r="1.1" fill="#ffffff" />
          </g>

          <!-- Rosy Cheeks -->
          <ellipse cx="46" cy="55" rx="4.5" ry="3" fill="#ff7043" opacity="0.45" />
          <ellipse cx="82" cy="55" rx="4.5" ry="3" fill="#ff7043" opacity="0.45" />

          <!-- Mouth -->
          <path id="kipMouth" d="M 59 62 Q 64 67 69 62" stroke="#1e293b" stroke-width="2" stroke-linecap="round" fill="none" />
        </g>

        <!-- Right / Front Arm -->
        <g id="kipArmFront" class="part-arm part-arm-front" transform-origin="68px 76px">
          <path d="M 68 76 L 78 92 L 86 90" stroke="url(#kipFur)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none" />
          <circle cx="86" cy="90" r="5" fill="#e65100" />
        </g>
      </svg>
    `;

    // Cache elements for high-performance direct transform manipulation
    this.elShadow = this.root.querySelector('#kipShadow');
    this.elSvg = this.root.querySelector('#kipSvg');
    this.elHead = this.root.querySelector('#kipHead');
    this.elTorso = this.root.querySelector('#kipTorso');
    this.elScarfTail = this.root.querySelector('#kipScarfTail');
    this.elTail = this.root.querySelector('#kipTail');
    this.elLegBack = this.root.querySelector('#kipLegBack');
    this.elLegFront = this.root.querySelector('#kipLegFront');
    this.elArmBack = this.root.querySelector('#kipArmBack');
    this.elArmFront = this.root.querySelector('#kipArmFront');
    this.elEyes = this.root.querySelector('#kipEyes');
    this.elEarLeft = this.root.querySelector('#kipEarLeft');
    this.elEarRight = this.root.querySelector('#kipEarRight');

    // Vehicle SVGs
    this.elBicycle = this.root.querySelector('#bicycleRoot');
    this.elBikeRearWheel = this.root.querySelector('#bikeRearWheel');
    this.elBikeFrontWheel = this.root.querySelector('#bikeFrontWheel');
    this.elBikeCrankNear = this.root.querySelector('#bikeCrankArmNear');
    this.elBikeCrankFar = this.root.querySelector('#bikeCrankArmFar');

    this.elScooter = this.root.querySelector('#scooterRoot');
    this.elScooterRearWheel = this.root.querySelector('#scooterRearWheel');
    this.elScooterFrontWheel = this.root.querySelector('#scooterFrontWheel');

    // Hide vehicles by default
    this.hideVehicles();
  }

  hideVehicles() {
    if (this.elBicycle) this.elBicycle.style.display = 'none';
    if (this.elScooter) this.elScooter.style.display = 'none';
  }

  // =========================================================================
  // ACTION DISPATCHERS
  // =========================================================================

  walk() {
    this.setState('walk', 70);
  }

  fastWalk() {
    this.setState('fastWalk', 130);
  }

  run() {
    this.setState('run', 225);
  }

  jump() {
    if (this.isJumping) return;
    this.isJumping = true;
    this.jumpTimer = 0;
    this.setState('jump', this.speed > 0 ? this.speed * 0.85 : 0);
  }

  bicycle() {
    this.setState('bicycle', 155);
  }

  ride() {
    this.setState('riding', 170);
  }

  idle() {
    this.setState('idle', 0);
  }

  reset() {
    this.x = 120;
    this.y = 0;
    this.facing = 1;
    this.speed = 0;
    this.targetSpeed = 0;
    this.isJumping = false;
    this.jumpTimer = 0;
    this.wheelRotation = 0;
    this.pedalRotation = 0;
    this.scooterKickPhase = 0;
    this.setState('idle', 0);
  }

  turnAround() {
    this.facing = -this.facing;
  }

  setState(newState, targetSpeed = 0) {
    if (this.state === newState && newState !== 'jump') return;

    this.state = newState;
    this.targetSpeed = targetSpeed;
    this.stateTime = 0;

    // Toggle vehicle visibility based on action
    this.hideVehicles();
    if (newState === 'bicycle' && this.elBicycle) {
      this.elBicycle.style.display = 'block';
    } else if (newState === 'riding' && this.elScooter) {
      this.elScooter.style.display = 'block';
    }

    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
  }

  // =========================================================================
  // FRAME UPDATE LOOP
  // =========================================================================

  update(dt, stageWidth) {
    this.stageWidth = stageWidth || this.stageWidth;
    this.stateTime += dt;
    this.blinkTimer += dt;

    // Smooth speed interpolation
    this.speed += (this.targetSpeed - this.speed) * Math.min(1, dt * 6);

    // 1. Position update along horizontal stage
    if (this.speed > 0) {
      this.x += this.speed * this.facing * dt;

      // Handle screen edge auto-turnaround or wrap
      const margin = 70;
      if (this.facing > 0 && this.x > this.stageWidth - margin) {
        this.x = this.stageWidth - margin;
        this.turnAround();
      } else if (this.facing < 0 && this.x < margin) {
        this.x = margin;
        this.turnAround();
      }
    }

    // 2. Eye Blinking Logic
    if (!this.isBlinking && this.blinkTimer > 3.2 + Math.random() * 2) {
      this.blinkTimer = 0;
      this.blink();
    }

    // 3. Dispatch Animation Pose based on state
    if (this.state === 'jump') {
      this.updateJump(dt);
    } else if (this.state === 'bicycle') {
      this.updateBicycle(dt);
    } else if (this.state === 'riding') {
      this.updateScooter(dt);
    } else {
      this.updateGait(dt);
    }

    // 4. Render Root Container Transform
    this.root.style.transform = `translate3d(${this.x}px, ${this.groundY - this.y}px, 0) scaleX(${this.facing})`;
  }

  blink() {
    this.isBlinking = true;
    if (this.elEyes) {
      this.elEyes.style.transform = 'scaleY(0.1)';
      setTimeout(() => {
        if (this.elEyes) this.elEyes.style.transform = 'scaleY(1)';
        this.isBlinking = false;
      }, 130);
    }
  }

  // =========================================================================
  // STANDARD GAIT (IDLE, WALK, FAST WALK, RUN)
  // =========================================================================

  updateGait(dt) {
    this.y = 0;
    const pose = this.anim.evaluateGait(this.state, dt, this.speed);

    // Apply transforms
    this.elTorso.style.transform = `translateY(${pose.torsoY}px) rotate(${pose.torsoLean}deg)`;
    this.elHead.style.transform = `rotate(${pose.headTilt}deg)`;
    this.elTail.style.transform = `rotate(${pose.tailAngle}deg)`;

    this.elLegBack.style.transform = `translateY(${pose.legLeftY}px) rotate(${pose.legLeftAngle}deg)`;
    this.elLegFront.style.transform = `translateY(${pose.legRightY}px) rotate(${pose.legRightAngle}deg)`;

    this.elArmBack.style.transform = `rotate(${pose.armLeftAngle}deg)`;
    this.elArmFront.style.transform = `rotate(${pose.armRightAngle}deg)`;

    this.elEarLeft.style.transform = `rotate(${pose.earLeftAngle}deg)`;
    this.elEarRight.style.transform = `rotate(${pose.earRightAngle}deg)`;

    if (this.elScarfTail) {
      const scarfFlutter = -pose.torsoLean * 1.5 + Math.sin(this.stateTime * 12) * (this.speed / 15);
      this.elScarfTail.style.transform = `rotate(${scarfFlutter}deg)`;
    }

    // Shadow
    this.elShadow.style.transform = `translateX(-50%) scale(${pose.shadowScale})`;
    this.elShadow.style.opacity = '0.35';
  }

  // =========================================================================
  // 5-STAGE PHYSICALLY BELIEVABLE JUMP
  // =========================================================================

  updateJump(dt) {
    this.jumpTimer += dt;
    const t = this.jumpTimer;
    const dur = this.jumpDuration;

    // Phase 1: Crouch Anticipation (0 to 0.16s)
    if (t < 0.16) {
      const p = t / 0.16;
      this.y = 0;
      // Squat deformation
      this.elTorso.style.transform = `translateY(${p * 14}px) scale(1.1, 0.88)`;
      this.elLegFront.style.transform = `rotate(-25deg)`;
      this.elLegBack.style.transform = `rotate(25deg)`;
      this.elArmFront.style.transform = `rotate(35deg)`;
      this.elArmBack.style.transform = `rotate(35deg)`;
      this.elShadow.style.transform = `translateX(-50%) scale(1.15)`;
      this.elShadow.style.opacity = '0.45';
      return;
    }

    // Phase 2 & 3: Airborne Parabolic Arc (0.16s to 0.82s)
    const airStart = 0.16;
    const airEnd = 0.82;
    const airDur = airEnd - airStart;

    if (t >= airStart && t < airEnd) {
      const p = (t - airStart) / airDur;
      // Parabolic equation: 4 * H * p * (1 - p)
      this.y = 4 * this.jumpPeakHeight * p * (1 - p);

      // Body stretches up at launch, tucks in apex, stretches down during fall
      const stretch = p < 0.3 ? 1.15 : (p > 0.7 ? 1.1 : 0.95);
      this.elTorso.style.transform = `translateY(0px) scale(0.92, ${stretch}) rotate(${p < 0.5 ? -4 : 6}deg)`;

      // Arms raised high in joy during jump
      this.elArmFront.style.transform = `rotate(${-80 + Math.sin(p * Math.PI) * -30}deg)`;
      this.elArmBack.style.transform = `rotate(${-70 + Math.sin(p * Math.PI) * -30}deg)`;

      // Legs tucked upward during peak
      const legTuck = Math.sin(p * Math.PI) * -22;
      this.elLegFront.style.transform = `translateY(${legTuck}px) rotate(15deg)`;
      this.elLegBack.style.transform = `translateY(${legTuck}px) rotate(-15deg)`;

      // Shadow shrinks and fades as character rises
      const shadowFactor = Math.max(0.3, 1 - (this.y / this.jumpPeakHeight) * 0.65);
      this.elShadow.style.transform = `translateX(-50%) scale(${shadowFactor})`;
      this.elShadow.style.opacity = `${0.35 * shadowFactor}`;
      return;
    }

    // Phase 4: Landing Shock Absorption (0.82s to 0.95s)
    if (t >= airEnd && t <= dur) {
      const p = (t - airEnd) / (dur - airEnd);
      this.y = 0;
      // Landing compression
      const squash = 1 - Math.sin(p * Math.PI) * 0.18;
      this.elTorso.style.transform = `translateY(${Math.sin(p * Math.PI) * 12}px) scale(1.15, ${squash})`;
      this.elLegFront.style.transform = `rotate(-20deg)`;
      this.elLegBack.style.transform = `rotate(20deg)`;
      this.elArmFront.style.transform = `rotate(10deg)`;
      this.elArmBack.style.transform = `rotate(10deg)`;
      this.elShadow.style.transform = `translateX(-50%) scale(1.1)`;
      this.elShadow.style.opacity = '0.45';
      return;
    }

    // Jump complete -> transition naturally to walk (if speed > 0) or idle
    this.isJumping = false;
    this.y = 0;
    if (this.speed > 50) {
      this.setState('run', 225);
    } else if (this.speed > 0) {
      this.setState('walk', 70);
    } else {
      this.setState('idle', 0);
    }
  }

  // =========================================================================
  // BICYCLE RIDING KINEMATICS
  // =========================================================================

  updateBicycle(dt) {
    this.y = 2; // Slight seat height elevation
    const wheelRadius = 22; // px
    const rotationSpeed = (this.speed / wheelRadius); // rad/s
    this.wheelRotation += rotationSpeed * dt * 57.2958; // to deg
    this.pedalRotation += rotationSpeed * 0.7 * dt * 57.2958; // Gear ratio

    // Spin bicycle wheels
    if (this.elBikeRearWheel) this.elBikeRearWheel.setAttribute('transform', `translate(18, 70) rotate(${this.wheelRotation})`);
    if (this.elBikeFrontWheel) this.elBikeFrontWheel.setAttribute('transform', `translate(92, 70) rotate(${this.wheelRotation})`);

    // Rotate crank arms and pedals
    if (this.elBikeCrankNear) this.elBikeCrankNear.setAttribute('transform', `rotate(${this.pedalRotation})`);
    if (this.elBikeCrankFar) this.elBikeCrankFar.setAttribute('transform', `rotate(${this.pedalRotation + 180})`);

    // Character sitting posture:
    // Torso leaned forward over handlebars
    const pedalRad = (this.pedalRotation * Math.PI) / 180;
    const bodyBob = Math.sin(pedalRad * 2) * 2;
    this.elTorso.style.transform = `translate(2px, ${-6 + bodyBob}px) rotate(22deg)`;
    this.elHead.style.transform = `translate(2px, -4px) rotate(-14deg)`;

    // Arms firmly reach forward to grip handlebars
    this.elArmFront.style.transform = `rotate(-52deg) scale(1.15)`;
    this.elArmBack.style.transform = `rotate(-46deg) scale(1.1)`;

    // Legs follow the circular pedal paths
    const legFrontAngle = Math.sin(pedalRad) * 32 - 12;
    const legBackAngle = Math.sin(pedalRad + Math.PI) * 32 - 12;
    this.elLegFront.style.transform = `translate(0px, -6px) rotate(${legFrontAngle}deg)`;
    this.elLegBack.style.transform = `translate(-2px, -6px) rotate(${legBackAngle}deg)`;

    // Scarf winds in the breeze
    if (this.elScarfTail) {
      this.elScarfTail.style.transform = `rotate(${-35 + Math.sin(this.stateTime * 14) * 12}deg)`;
    }

    // Shadow
    this.elShadow.style.transform = `translateX(-50%) scale(1.4, 0.9)`;
    this.elShadow.style.opacity = '0.35';
  }

  // =========================================================================
  // KICK-SCOOTER RIDING KINEMATICS
  // =========================================================================

  updateScooter(dt) {
    this.y = 4; // Standing on deck
    const wheelRadius = 10;
    const rotationSpeed = (this.speed / wheelRadius);
    this.wheelRotation += rotationSpeed * dt * 57.2958;

    // Spin scooter wheels
    if (this.elScooterRearWheel) this.elScooterRearWheel.setAttribute('transform', `translate(16, 68) rotate(${this.wheelRotation})`);
    if (this.elScooterFrontWheel) this.elScooterFrontWheel.setAttribute('transform', `translate(82, 68) rotate(${this.wheelRotation})`);

    // Kick-cycle: foot kicks back then rests on deck
    const kickFreq = 3.2; // rad/s
    this.scooterKickPhase += dt * kickFreq;
    const kickSin = Math.sin(this.scooterKickPhase);

    // Front leg stays planted on deck holding balance
    this.elLegFront.style.transform = `translate(-4px, -8px) rotate(-6deg)`;

    // Back leg performs the kick motion
    // Positive kick: foot pushes backwards along pavement
    let backLegAngle = 0;
    let backLegY = -8;
    if (kickSin > 0) {
      // Ground strike and push
      backLegAngle = kickSin * 38;
      backLegY = -8 + kickSin * 6; // reaches down to ground
    } else {
      // Swing forward and rest
      backLegAngle = kickSin * 15;
    }
    this.elLegBack.style.transform = `translate(-2px, ${backLegY}px) rotate(${backLegAngle}deg)`;

    // Torso leans forward, hands on T-bar
    const torsoLean = 14 + Math.max(0, kickSin) * 6;
    this.elTorso.style.transform = `translate(-2px, -6px) rotate(${torsoLean}deg)`;
    this.elHead.style.transform = `translate(0px, -4px) rotate(-8deg)`;

    // Arms extended to handlebars
    this.elArmFront.style.transform = `rotate(-46deg) scale(1.15)`;
    this.elArmBack.style.transform = `rotate(-40deg) scale(1.1)`;

    // Scarf winds in the breeze
    if (this.elScarfTail) {
      this.elScarfTail.style.transform = `rotate(${-40 + Math.sin(this.stateTime * 16) * 14}deg)`;
    }

    // Shadow
    this.elShadow.style.transform = `translateX(-50%) scale(1.3, 0.85)`;
    this.elShadow.style.opacity = '0.35';
  }
}
