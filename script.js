const display = document.getElementById("display");
const calculator = document.getElementById("calculator");
const resultDisplay = document.getElementById("resultDisplay");
let currentInput = "";
const toolbar = document.getElementById("calculator-toolbar");
let useFrac = false;
math.config({
  number: useFrac ? "Fraction" : "BigNumber",
  precision: 18,
});
document.getElementById("fraction").addEventListener("change", function () {
  useFrac = this.selected;
  math.config({
    number: useFrac ? "Fraction" : "BigNumber",
    precision: 14,
  });
});
let roundOff = false;

document.getElementById("roundOff").addEventListener("change", function () {
  roundOff = this.selected;
  liveDisplay();
});

let isDegree = false;
document.getElementById("rad").addEventListener("change", function () {
  isDegree = this.selected;
  liveDisplay();
});

const showElement = (id) => {
  const dis = document.getElementById(id);

  if (getComputedStyle(dis).display === "none") {
    dis.style.display = "flex";
    anime({
      targets: `#${id}`,
      duration: 300,
      opacity: [0, 1],
      translateY: [-20, 0],
      easing: "easeOutQuad",
    });
  } else {
    anime({
      targets: `#${id}`,
      duration: 300,
      opacity: [1, 0],
      easing: "easeOutQuad",
      translateY: [0, -20],
      complete: () => {
        dis.style.display = "none";
      },
    });
  }
};


function convert(angle) {
  if (isDegree) {
    return (angle * Math.PI) / 180;
  } else {
    return angle;
  }
}
function updateDisplay(value) {
  display.textContent = value || "0";
  scrollToBottom();
}
function preprocessInput(input) {
  const openCount = (input.match(/\(/g) || []).length;
  const closeCount = (input.match(/\)/g) || []).length;
  const unmatchedCount = openCount - closeCount;

  if (unmatchedCount > 0) {
    input += ")".repeat(unmatchedCount);
  } else if (unmatchedCount < 0) {
    input = input.replace(/\)/g, "", -unmatchedCount);
  }

  return input
    .replace(/(\d)(π|e)/g, "$1*$2") // 4π → 4*π
    .replace(/(π|e)(\d)/g, "$1*$2") // π4 → π*4
    .replace(/(π|e)(π|e)/g, "$1*$2") // ππ → π*π
    .replace(/π{2,}/g, (match) => match.split("").join("*")) // Handles ππππ → π*π*π*π
    .replace(/×/g, "*") // Replace × with *
    .replace(/π/g, "pi") // Replace π with 'pi'
    .replace(/√/g, "sqrt"); // Replace √ with 'sqrt'
}

function calculateTrig(input) {
  const angle = extractNumber(input); // Extract the angle or value from the input
  if (angle !== null) {
    const funcName = input.match(/(sin|cos|tan|asin|acos|atan|sec|csc|cot)/)[1]; // Match the function name
    const convertedAngle = convert(angle); // Convert the angle if needed (e.g., radians ↔ degrees)
    if (["asin", "acos", "atan"].includes(funcName)) {
      let result = math[funcName](angle); // Input must always be in radians

      if (isDegree) {
        result = (result * 180) / Math.PI; // Convert radians to degrees
      }
      return result;
    }
    if (funcName === "sec") {
      return 1 / math.cos(convertedAngle);
    } else if (funcName === "csc") {
      return 1 / math.sin(convertedAngle);
    } else if (funcName === "cot") {
      return 1 / math.tan(convertedAngle);
    }
    return math[funcName](convertedAngle);
  }
  return null;
}

function liveDisplay() {
  try {
    if (!currentInput || /[+\-×/^(\s]$/.test(currentInput)) {
      resultDisplay.textContent = "";
      return;
    }

    const processedInput = preprocessInput(currentInput);
    if (
      processedInput.includes("sin") ||
      processedInput.includes("cos") ||
      processedInput.includes("tan") ||
      processedInput.includes("sec") ||
      processedInput.includes("csc") ||
      processedInput.includes("cot") ||
      processedInput.includes("asin") ||
      processedInput.includes("acos") ||
      processedInput.includes("atan")
    ) {
      const liveResult = calculateTrig(processedInput);
      if (liveResult !== null) {
        resultDisplay.textContent = liveResult;
        return;
      }
    }
    if (/[+\-*/^()!e]/.test(processedInput)) {
      let liveResult = math.evaluate(processedInput);
      if (useFrac) {
        const fractionResult = math.fraction(liveResult);
        resultDisplay.textContent = math.format(fractionResult, {
          fraction: "ratio",
        });
      } else if (roundOff) {
        // Apply rounding if enabled
        liveResult = math.round(liveResult, 2);
        resultDisplay.textContent = `≈ ${liveResult}`;
      } else {
        // Default behavior
        resultDisplay.textContent = liveResult;
      }
    } else {
      resultDisplay.textContent = "";
    }
  } catch {
    resultDisplay.textContent = "";
  }
}

function extractNumber(input) {
  const match = input.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

calculator.addEventListener("click", (event) => {
  const target = event.target;
  if (target.tagName !== "BUTTON") return;
  const value = target.textContent.trim();

  if (!value) return;

  switch (value) {
    case "C": // Clear everything
      currentInput = "";
      updateDisplay("");
      resultDisplay.textContent = "";
      break;

    case "=": // Evaluate result
      try {
        const processedInput = preprocessInput(currentInput);

        // Handle empty or invalid input
        if (!currentInput || currentInput.trim() === "0") {
          updateDisplay("0");
          resultDisplay.textContent = "";
          break;
        }

        // Check if the input contains operators or special functions
        if (
          /[+\-×/^()!eπ]/.test(currentInput) || // Contains operators
          processedInput.includes("sin") ||
          processedInput.includes("cos") ||
          processedInput.includes("tan") ||
          processedInput.includes("sec") ||
          processedInput.includes("csc") ||
          processedInput.includes("cot") ||
          processedInput.includes("asin") ||
          processedInput.includes("acos") ||
          processedInput.includes("atan") ||
          processedInput.includes("log") ||
          processedInput.includes("ln") ||
          processedInput.includes("√")
        ) {
          // Handle trigonometric calculations
          if (
            processedInput.includes("sin") ||
            processedInput.includes("cos") ||
            processedInput.includes("tan") ||
            processedInput.includes("sec") ||
            processedInput.includes("csc") ||
            processedInput.includes("cot") ||
            processedInput.includes("asin") ||
            processedInput.includes("acos") ||
            processedInput.includes("atan")
          ) {
            const result = calculateTrig(processedInput);
            if (result !== null) {
              currentInput = result.toString();
              updateDisplay(currentInput);
              resultDisplay.textContent = "";
              addToHistory(currentInput, result); // Save to history
              return;
            }
          }

          // Evaluate general expressions
          let evaluatedResult = math.evaluate(processedInput);

          // Apply rounding if enabled
          if (roundOff) {
            evaluatedResult = math.round(evaluatedResult, 2);
          }

          // Convert result to string, update the display, and save to history
          currentInput = evaluatedResult.toString();
          updateDisplay(currentInput);
          resultDisplay.textContent = "";
          addToHistory(processedInput, evaluatedResult);
        } else {
          // If no operators or functions, don't save "35 = 35" to history
          updateDisplay(currentInput);
          resultDisplay.textContent = currentInput;
        }
      } catch {
        // Handle errors
        updateDisplay("Error");
        currentInput = ""; // Reset on error
      }
      break;

    case "backspace": // Delete last character
      currentInput = currentInput.slice(0, -1);
      if (!currentInput) {
        currentInput = "";
      }
      updateDisplay(currentInput);
      liveDisplay();
      break;

    case "(":
      currentInput += value;
      updateDisplay(currentInput);
      liveDisplay();
      break;

    case ")":
      if (currentInput.split("(").length > currentInput.split(")").length) {
        currentInput += value;
        updateDisplay(currentInput);
        liveDisplay();
      }
      break;

    case "log":
    case "cot":
    case "sec":
    case "csc":
    case "sin":
    case "cos":
    case "tan":
    case "atan":
    case "acos":
    case "asin":
      try {
        currentInput += `${value}(`;
        updateDisplay(currentInput);
      } catch (error) {
        console.error(error);
        updateDisplay("Error");
        currentInput = "";
      }
      break;
    case "log10":
      currentInput += "log10(";
      updateDisplay(currentInput);
      break;
    default:
      if (["+", "-", "×", "/", "^"].includes(value)) {
        if (currentInput === "" || !/[\dπe]/.test(currentInput)) {
          return; // Prevent adding operator without a number
        }
        if (["+", "-", "×", "/", "^"].includes(currentInput.slice(-1))) return; // Prevent consecutive operators
      }
      if (value === ".") {
        // Prevent multiple "." in the same number
        const lastNumber = currentInput.split(/[\+\-\×\/\^]/).pop(); // Get the last number
        if (lastNumber.includes(".")) {
          return; // If the last number already has a ".", prevent adding another
        }
      }
      currentInput += value;
      updateDisplay(currentInput);
      liveDisplay();
  }
});

toolbar.addEventListener("click", (event) => {
  const target = event.target;
  if (target.tagName !== "BUTTON") return;
  const value = target.textContent.trim();

  if (!value) return;

  switch (value) {
    case "arrow_downward":
      return;
      break;
    case "√":
      currentInput += "√(";
      break;
    case "π":
      currentInput += value;
      break;
    case "!":
    case "^":
      if (!/\d$/.test(currentInput)) return;
      if (currentInput.slice(-1) === value) return;
      currentInput += value;
      break;
    default:
      currentInput += value;
      liveDisplay();
  }
  updateDisplay(currentInput);
  liveDisplay();
});

function createRipple(event) {
  const button = event.currentTarget;

  if (getComputedStyle(button).position === "static") {
    button.style.position = "relative";
  }

  const circle = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${
    event.clientX - button.getBoundingClientRect().left - radius
  }px`;
  circle.style.top = `${
    event.clientY - button.getBoundingClientRect().top - radius
  }px`;
  circle.classList.add("ripple");
  button.appendChild(circle);
  circle.addEventListener("animationend", () => {
    circle.remove();
  });
}
const buttons = document.querySelectorAll("button");
buttons.forEach((button) => {
  button.addEventListener("click", createRipple);
});


document.querySelector("md-switch").addEventListener("change", function () {
  const fontFamily = this.selected
    ? "Roboto, sans-serif"
    : "JetBrains Mono, monospace";
  document.getElementById("display").style.fontFamily = fontFamily;
  document.getElementById("resultDisplay").style.fontFamily = fontFamily;
  document.getElementById("result").style.fontFamily = fontFamily;
});

const displayElement = document.getElementById("display");
function scrollToBottom() {
  displayElement.scrollTo({
    top: displayElement.scrollHeight,
    behavior: "smooth",
  });
}
const result1 = document.getElementById("result");
const val = document.getElementById("convert-value");
const convertButton = document.getElementById("convertButton");

// Differentiation Function
function differentiate() {
  const expression = document.getElementById("input").value; // Get the expression dynamically
  try {
    const result = math.derivative(expression, "x").toString();
    result1.textContent = `Result: ${result}`;
  } catch (error) {
    result1.textContent = "Invalid expression!";
  }
}

function convertUnits(inputValue, baseUnit, targetUnits) {
  const expression = document.getElementById(inputValue).value; // Get the input dynamically
  if (!expression) {
    return;
  }
  try {
    const value = parseFloat(expression); // Convert input to number
    if (isNaN(value)) {
      result1.textContent = "Invalid input! Please enter a number.";
      return;
    }

    const unit = math.unit(value, baseUnit); // Convert the base unit
    const conversions = targetUnits.map(
      (u) => `${unit.to(u).toNumeric(u).toFixed(2)} ${u}`,
    ); // Perform conversions

    // Display results
    result1.innerHTML = `
      ${conversions.join("<br>")}
    `;
  } catch (error) {
    result1.textContent = "Error in conversion!";
    console.error(error);
  }
}
function length() {
  convertUnits("input", "m", [
    "mm",
    "cm",
    "dm",
    "km",
    "inch",
    "mile",
    "foot",
    "yard",
  ]);
}
function mass() {
  convertUnits("input", "g", ["kg", "mg", "lb", "oz", "ton"]);
}
function speed() {
  convertUnits("input", "m/s", ["km/h", "mi/h"]);
}
function volume() {
  convertUnits("input", "l", ["ml", "cm^3", "m^3", "gal", "cup"]);
}
function time() {
  convertUnits("input", "h", ["s", "min", "day", "week", "month", "year"]);
}
function temperature() {
  const expression = document.getElementById("input").value; // Get the input dynamically
  if (!expression) {
    result1.textContent = "Please enter a temperature value.";
    return;
  }

  try {
    const value = parseFloat(expression); // Convert input to number
    if (isNaN(value)) {
      result1.textContent = "Invalid input! Please enter a valid number.";
      return;
    }
    const celsius = value; // Assume input is in Celsius
    const kelvin = celsius + 273.15;
    const fahrenheit = (celsius * 9) / 5 + 32;

    // Display results
    result1.innerHTML = `
      ${kelvin.toFixed(2)} K<br>
      ${fahrenheit.toFixed(2)} °F
    `;
  } catch (error) {
    result1.textContent = "Error in conversion!";
    console.error(error);
  }
}
const functionMap = {
  length,
  temperature,
  speed,
  differentiate,
  time,
  mass,
  volume,
};
const calculateConversions = () => {
  const selectedValue = val.value; // Get selected function
  if (functionMap[selectedValue]) {
    functionMap[selectedValue](); // Call the mapped function
  } else {
    console.error("Invalid function selected");
    result1.textContent = "Invalid function selected.";
  }
};
convertButton.addEventListener("click", calculateConversions);
document
  .getElementById("input")
  .addEventListener("change", calculateConversions);

const addToHistory = (expression, result) => {
  const historyItem = `${expression} = ${result}`;
  let history = JSON.parse(localStorage.getItem("calcHistory")) || [];

  if (history.some((item) => item.startsWith(expression))) {
    return;
  }

  history.unshift(historyItem);
  if (history.length > 10) {
    history.pop();
  }
  localStorage.setItem("calcHistory", JSON.stringify(history));
  updateHistory();
};

const updateHistory = () => {
  const historyList = document.getElementById("history-list");
  const history = JSON.parse(localStorage.getItem("calcHistory")) || [];
  historyList.innerHTML = "";

  history.forEach((item) => {
    const historyItem = document.createElement("li");
    historyItem.textContent = item;
    const [expression] = item.split("=");
    historyItem.addEventListener("click", () => {
      currentInput = expression.trim();
      if (currentInput === "pi") {
        currentInput = "π";
        updateDisplay(currentInput);
        liveDisplay();
      }
      updateDisplay(currentInput);
      liveDisplay();
    });
    historyList.prepend(historyItem);
  });
};
document.addEventListener("DOMContentLoaded", () => {
  updateHistory();
  setTheme();
});
function clearHistory() {
  localStorage.removeItem("calcHistory");
  updateHistory();
}

const theme = window.matchMedia("(prefers-color-scheme: light)").matches;
const mediaTheme = window.matchMedia("(prefers-color-scheme: light)");

const setTheme = () => {
  if (theme) {
    document.documentElement.classList.add("light");
  }
};

mediaTheme.addEventListener("change", setTheme);
