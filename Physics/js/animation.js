/**
 * animation.js
 * Mathematical kinematics and procedural animation engine for "Kip".
 * Generates natural gait cycles, airborne running phases, parabolic jumping arcs,
 * circular bicycle pedaling, and kick-scooter dynamics.
 */

export class AnimationEngine {
  constructor() {
    this.time = 0;
  }

  /**
   * Evaluates procedural gait parameters based on action mode and speed.
   */
  evaluateGait(mode, dt, speed) {
    this.time += dt;

    switch (mode) {
      case 'walk':
        return this.calculateWalk(this.time, speed);
      case 'fastWalk':
        return this.calculateFastWalk(this.time, speed);
      case 'run':
        return this.calculateRun(this.time, speed);
      case 'idle':
      default:
        return this.calculateIdle(this.time);
    }
  }

  calculateIdle(t) {
    const breath = Math.sin(t * 2.5);
    const tailSway = Math.sin(t * 2.0);
    const earFlick = Math.sin(t * 1.2) > 0.95 ? 6 : 0;

    return {
      torsoY: breath * 2,
      torsoLean: 0,
      headTilt: Math.sin(t * 1.5) * 1.5,
      armLeftAngle: 6 + breath * 2,
      armRightAngle: -6 - breath * 2,
      legLeftAngle: 0,
      legRightAngle: 0,
      legLeftY: 0,
      legRightY: 0,
      tailAngle: tailSway * 8,
      earLeftAngle: earFlick,
      earRightAngle: -earFlick * 0.5,
      isAirborne: false,
      shadowScale: 1 + breath * 0.03
    };
  }

  calculateWalk(t, speed) {
    const freq = 5.2; // Steps per second
    const phase = t * freq;
    const stride = 22; // Degrees
    const armStride = 18;

    // Alternating leg swing
    const legLeftAngle = Math.sin(phase) * stride;
    const legRightAngle = -Math.sin(phase) * stride;

    // Arms counter-swing (opposite to legs)
    const armLeftAngle = -Math.sin(phase) * armStride;
    const armRightAngle = Math.sin(phase) * armStride;

    // Vertical torso bob: peaks twice per full stride cycle (mid-stride)
    const torsoBob = Math.abs(Math.sin(phase)) * 4 - 2;

    // Slight side-to-side weight shift
    const weightShift = Math.sin(phase) * 1.5;

    // Foot lift off ground during forward swing
    const legLeftY = Math.sin(phase) > 0 ? -Math.sin(phase) * 6 : 0;
    const legRightY = -Math.sin(phase) > 0 ? Math.sin(phase) * 6 : 0;

    return {
      torsoY: torsoBob,
      torsoLean: 3, // Slight forward intent
      headTilt: -weightShift * 0.8,
      armLeftAngle,
      armRightAngle,
      legLeftAngle,
      legRightAngle,
      legLeftY,
      legRightY,
      tailAngle: Math.sin(phase * 0.8) * 12,
      earLeftAngle: torsoBob * 0.6,
      earRightAngle: -torsoBob * 0.4,
      isAirborne: false,
      shadowScale: 1 - torsoBob * 0.04
    };
  }

  calculateFastWalk(t, speed) {
    const freq = 7.5; // Visibly faster tempo
    const phase = t * freq;
    const stride = 30; // Longer stride
    const armStride = 26;

    const legLeftAngle = Math.sin(phase) * stride;
    const legRightAngle = -Math.sin(phase) * stride;

    const armLeftAngle = -Math.sin(phase) * armStride;
    const armRightAngle = Math.sin(phase) * armStride;

    const torsoBob = Math.abs(Math.sin(phase)) * 5 - 2.5;
    const legLeftY = Math.sin(phase) > 0 ? -Math.sin(phase) * 9 : 0;
    const legRightY = -Math.sin(phase) > 0 ? Math.sin(phase) * 9 : 0;

    return {
      torsoY: torsoBob,
      torsoLean: 7, // Clear forward lean
      headTilt: Math.sin(phase) * 2,
      armLeftAngle,
      armRightAngle,
      legLeftAngle,
      legRightAngle,
      legLeftY,
      legRightY,
      tailAngle: Math.sin(phase) * 16,
      earLeftAngle: torsoBob * 0.9,
      earRightAngle: -torsoBob * 0.6,
      isAirborne: false,
      shadowScale: 1 - torsoBob * 0.05
    };
  }

  calculateRun(t, speed) {
    const freq = 10.0; // Rapid athletic tempo
    const phase = t * freq;
    const stride = 46; // Wide dynamic stride
    const armStride = 42;

    const legLeftAngle = Math.sin(phase) * stride;
    const legRightAngle = -Math.sin(phase) * stride;

    // Running arms are bent at roughly 90 degrees and pump vigorously
    const armLeftAngle = -Math.sin(phase) * armStride - 10;
    const armRightAngle = Math.sin(phase) * armStride + 10;

    // Running bounce & airborne flight
    // In running, both feet leave the ground when legs are crossing
    const flightCheck = Math.cos(2 * phase);
    const isAirborne = flightCheck > 0.45;
    const flightLift = isAirborne ? (flightCheck - 0.45) * 16 : 0;

    const torsoBob = -Math.abs(Math.sin(phase)) * 7 - flightLift;
    const legLeftY = Math.sin(phase) > 0 ? -Math.sin(phase) * 14 : 0;
    const legRightY = -Math.sin(phase) > 0 ? Math.sin(phase) * 14 : 0;

    return {
      torsoY: torsoBob,
      torsoLean: 18, // Distinct athletic forward lean
      headTilt: Math.sin(phase * 1.5) * 3,
      armLeftAngle,
      armRightAngle,
      legLeftAngle,
      legRightAngle,
      legLeftY,
      legRightY,
      tailAngle: -15 + Math.sin(phase) * 22,
      earLeftAngle: torsoBob * 1.2,
      earRightAngle: -torsoBob * 0.8,
      isAirborne,
      shadowScale: isAirborne ? 0.75 : 1.05
    };
  }
}
