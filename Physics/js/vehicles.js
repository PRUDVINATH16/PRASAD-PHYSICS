/**
 * vehicles.js
 * Visual representation and mechanical kinematics for rideable vehicles:
 * 1. Bicycle (rotating spoked wheels, crankset, circular pedal kinematics)
 * 2. Kick-Scooter (rolling wheels, deck, kick-and-glide cycles)
 */

export class VehicleRenderer {
  /**
   * Generates the SVG markup for the cruiser bicycle.
   */
  static getBicycleSVG() {
    return `
      <g id="bicycleRoot" class="vehicle-bicycle" transform="translate(-10, 25)">
        <!-- Rear Wheel -->
        <g id="bikeRearWheel" transform="translate(18, 70)">
          <circle cx="0" cy="0" r="22" stroke="#475569" stroke-width="4" fill="none" />
          <circle cx="0" cy="0" r="20" stroke="#cbd5e1" stroke-width="1.5" fill="rgba(241, 245, 249, 0.4)" />
          <line class="spoke" x1="-19" y1="0" x2="19" y2="0" stroke="#94a3b8" stroke-width="1.2" />
          <line class="spoke" x1="0" y1="-19" x2="0" y2="19" stroke="#94a3b8" stroke-width="1.2" />
          <line class="spoke" x1="-13" y1="-13" x2="13" y2="13" stroke="#94a3b8" stroke-width="1.2" />
          <line class="spoke" x1="-13" y1="13" x2="13" y2="-13" stroke="#94a3b8" stroke-width="1.2" />
          <circle cx="0" cy="0" r="4.5" fill="#334155" />
        </g>

        <!-- Front Wheel -->
        <g id="bikeFrontWheel" transform="translate(92, 70)">
          <circle cx="0" cy="0" r="22" stroke="#475569" stroke-width="4" fill="none" />
          <circle cx="0" cy="0" r="20" stroke="#cbd5e1" stroke-width="1.5" fill="rgba(241, 245, 249, 0.4)" />
          <line class="spoke" x1="-19" y1="0" x2="19" y2="0" stroke="#94a3b8" stroke-width="1.2" />
          <line class="spoke" x1="0" y1="-19" x2="0" y2="19" stroke="#94a3b8" stroke-width="1.2" />
          <line class="spoke" x1="-13" y1="-13" x2="13" y2="13" stroke="#94a3b8" stroke-width="1.2" />
          <line class="spoke" x1="-13" y1="13" x2="13" y2="-13" stroke="#94a3b8" stroke-width="1.2" />
          <circle cx="0" cy="0" r="4.5" fill="#334155" />
        </g>

        <!-- Frame Geometry (Vibrant Turquoise/Cyan) -->
        <!-- Chain-stay & Seat-stay -->
        <line x1="18" y1="70" x2="52" y2="70" stroke="#0284c7" stroke-width="4" stroke-linecap="round" />
        <line x1="18" y1="70" x2="44" y2="38" stroke="#0284c7" stroke-width="4" stroke-linecap="round" />
        <!-- Seat tube -->
        <line x1="52" y1="70" x2="44" y2="34" stroke="#0284c7" stroke-width="4.5" stroke-linecap="round" />
        <!-- Down tube -->
        <line x1="52" y1="70" x2="80" y2="36" stroke="#0284c7" stroke-width="4.5" stroke-linecap="round" />
        <!-- Top tube -->
        <line x1="44" y1="38" x2="78" y2="36" stroke="#0284c7" stroke-width="4" stroke-linecap="round" />
        <!-- Front fork & Head tube -->
        <line x1="92" y1="70" x2="78" y2="30" stroke="#0284c7" stroke-width="4" stroke-linecap="round" />
        <line x1="78" y1="30" x2="74" y2="18" stroke="#0284c7" stroke-width="4" stroke-linecap="round" />
        <!-- Handlebars -->
        <path d="M 74 18 Q 72 10 64 12" stroke="#64748b" stroke-width="3.5" fill="none" stroke-linecap="round" />
        <!-- Rubber Grips -->
        <circle cx="64" cy="12" r="3" fill="#0f172a" />

        <!-- Saddle / Seat -->
        <path d="M 36 34 Q 44 32 52 35 Q 46 38 40 37 Z" fill="#78350f" stroke="#451a03" stroke-width="1.5" />

        <!-- Crankset & Pedals (Crank at 52, 70) -->
        <g id="bikeCrankset" transform="translate(52, 70)">
          <!-- Chain-ring -->
          <circle cx="0" cy="0" r="9" fill="#94a3b8" stroke="#475569" stroke-width="1.5" />
          
          <!-- Crank Arm 1 (Right / Near side) -->
          <g id="bikeCrankArmNear" transform="rotate(0)">
            <line x1="0" y1="0" x2="0" y2="12" stroke="#334155" stroke-width="3" stroke-linecap="round" />
            <rect x="-4" y="11" width="8" height="3.5" rx="1.5" fill="#f59e0b" />
          </g>

          <!-- Crank Arm 2 (Left / Far side - 180 deg) -->
          <g id="bikeCrankArmFar" transform="rotate(180)">
            <line x1="0" y1="0" x2="0" y2="12" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" />
            <rect x="-4" y="11" width="8" height="3.5" rx="1.5" fill="#d97706" />
          </g>
        </g>
      </g>
    `;
  }

  /**
   * Generates the SVG markup for the kick-scooter.
   */
  static getScooterSVG() {
    return `
      <g id="scooterRoot" class="vehicle-scooter" transform="translate(0, 32)">
        <!-- Rear Small Wheel -->
        <g id="scooterRearWheel" transform="translate(16, 68)">
          <circle cx="0" cy="0" r="10" stroke="#334155" stroke-width="3" fill="#cbd5e1" />
          <circle cx="0" cy="0" r="3" fill="#0f172a" />
          <!-- Rear brake fender -->
          <path d="M -6 -7 Q 0 -12 8 -8" stroke="#f43f5e" stroke-width="3.5" fill="none" stroke-linecap="round" />
        </g>

        <!-- Deck Platform -->
        <rect x="18" y="64" width="56" height="6" rx="3" fill="#f43f5e" stroke="#be123c" stroke-width="1.2" />
        <rect x="24" y="62" width="44" height="2.5" rx="1" fill="#334155" /> <!-- Grip tape -->

        <!-- Steering Column & Front Fork -->
        <line x1="74" y1="66" x2="78" y2="16" stroke="#e2e8f0" stroke-width="4" stroke-linecap="round" />
        <line x1="74" y1="66" x2="82" y2="68" stroke="#94a3b8" stroke-width="3.5" stroke-linecap="round" />

        <!-- Front Wheel -->
        <g id="scooterFrontWheel" transform="translate(82, 68)">
          <circle cx="0" cy="0" r="10" stroke="#334155" stroke-width="3" fill="#cbd5e1" />
          <circle cx="0" cy="0" r="3" fill="#0f172a" />
        </g>

        <!-- T-Bar Handlebars -->
        <circle cx="78" cy="15" r="3.5" fill="#f43f5e" />
        <line x1="68" y1="15" x2="88" y2="15" stroke="#334155" stroke-width="4" stroke-linecap="round" />
        <rect x="65" y="13" width="7" height="4" rx="1.5" fill="#0f172a" /> <!-- Left Grip -->
        <rect x="84" y="13" width="7" height="4" rx="1.5" fill="#0f172a" /> <!-- Right Grip -->
      </g>
    `;
  }
}
