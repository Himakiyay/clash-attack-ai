import { TOWN_HALL_DATA, ARMY_SYNERGY } from "./data.js";

window.runAI = function () {
  const th = document.getElementById("townHall").value;
  const selectedArmy = [...document.querySelectorAll("input:checked")]
    .map(el => el.value);

  const thData = TOWN_HALL_DATA[th];

  // --- Attack Advice ---
  document.getElementById("attackAdvice").innerText =
    `Recommended Attacks: ${thData.bestAttacks.join(", ")}`;

  // --- Upgrade Advice ---
  document.getElementById("upgradeAdvice").innerText =
    `Upgrade Priority: ${thData.upgradePriority.join(" → ")}`;

  // --- Simulation ---
  const result = simulateBattle(selectedArmy);
  document.getElementById("simulationResult").innerText =
    `Expected Stars: ${result.stars.toFixed(2)} (${result.confidence})`;
};

// Probability-based simulation
function simulateBattle(army) {
  let score = 0;

  army.forEach(unit => {
    if (ARMY_SYNERGY[unit]) {
      score += 10;
    }
  });

  // randomness
  let starsTotal = 0;
  const runs = 1000;

  for (let i = 0; i < runs; i++) {
    let roll = Math.random() * 100 + score;
    if (roll > 85) starsTotal += 3;
    else if (roll > 55) starsTotal += 2;
    else starsTotal += 1;
  }

  const avgStars = starsTotal / runs;

  return {
    stars: avgStars,
    confidence:
      avgStars > 2.5 ? "High" :
      avgStars > 2.0 ? "Medium" : "Low"
  };
}
