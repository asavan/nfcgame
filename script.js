// TODO: Update with serialNumbers from your own NFC tags: https://googlechrome.github.io/samples/web-nfc/
const tagsColors = {
  "04:49:3a:ba:12:5c:80": "blue",
  "04:38:1d:42:50:58:80": "forestgreen",
  "04:f4:53:fa:53:32:82": "dodgerblue",
  "05:34:d6:66:91:b0:c1": "slategray",
  "04:39:3d:9a:9d:29:82": "mediumorchid",
  "04:fb:d0:b2:ed:40:80": "crimson"
};

let numberOfTimesUserWon = 0;

let serialNumbers = [];

const cards = Array.from(document.getElementById("cards").children);

const LOST_IMAGE_URL = "assets/loudly-crying-face.png";
const WIN_IMAGE_URL = "assets/face-with-party-horn-and-party-hat.png";

let ndef;

const button = document.getElementById("button");

function onreading({ serialNumber }) {
  // User tapped wrong tag.
  if (
    serialNumbers.includes(serialNumber) &&
    serialNumber !== serialNumbers.shift()
  ) {
    // lost();
    return;
  }

  // User tapped all tags in the right order.
  if (serialNumbers.length === 0) {
    win();
    return;
  }

  // Show tag color user tapped.
  setColor(serialNumber);
}

button.addEventListener("click", async () => {
  // Start NFC scanning and prompt user if needed.
  ndef = new NDEFReader();
  await ndef.scan();

  reset();

  // Create random sequence of tag serial numbers.
  const allSerialNumbers = Object.keys(tagsColors);
  serialNumbers = [];
  while (allSerialNumbers.length) {
    const randomIndex = Math.floor(Math.random() * allSerialNumbers.length);
    serialNumbers = serialNumbers.concat(
      allSerialNumbers.splice(randomIndex, 1)
    );
  }

  // Show colors to memorize.
  for (const serialNumber of serialNumbers) {
    await setColor(serialNumber, true /* transient */);
  }

  // Start listening to tags.
  ndef.onreading = onreading;
});

function reset() {
  ndef.onreading = null;
  cards.forEach(card => {
    card.style.backgroundColor = "";
    card.style.backgroundImage = "";
  });
  button.classList.toggle("hidden", true);
}

function lost() {
  reset();
  cards.forEach(card => {
    card.style.backgroundImage = `url(${LOST_IMAGE_URL})`;
  });
  button.classList.toggle("hidden", false);
  numberOfTimesUserWon = 0;
}

function win() {
  reset();
  cards.forEach(card => {
    card.style.backgroundImage = `url(${WIN_IMAGE_URL})`;
  });
  button.classList.toggle("hidden", false);
  numberOfTimesUserWon++;
}

async function setColor(serialNumber, transient = false) {
  const color = tagsColors[serialNumber];
  const card = cards[Object.values(tagsColors).indexOf(color)];
  card.style.backgroundColor = color;
  if (transient) {
    await new Promise(resolve => {
      setTimeout(_ => {
        resolve();
        card.style.backgroundColor = "";
      }, Math.max(100, 500 - 200 * numberOfTimesUserWon));
    });
  }
}
