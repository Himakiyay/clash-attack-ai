function simulate() {
  const townHall = document.getElementById("townHall").value;

  let message = "";

  if (townHall === "9") {
    message = "Recommended: GoHo or Lavaloon";
  } else if (townHall === "10") {
    message = "Recommended: Queen Walk Hybrid";
  } else {
    message = "Recommended: Electro Dragon spam";
  }

  document.getElementById("result").innerText = message;
}
