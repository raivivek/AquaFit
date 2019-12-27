import { user } from "user-profile";
import document from "document";
import clock from "clock";
import * as fs from "fs";

const SETTINGS_FILE = "aquabit_settings.txt"
const HISTORY_FILE = "aquabit_history.txt"

function getTumblerText(tumblerObj) {
 return tumblerObj.getElementById("item" + tumblerObj.value).getElementById("content").text;
}

function loadSettings() {
  let json_data = {};
  
  if (fs.existsSync(SETTINGS_FILE)) {
    console.log("info: found user information!");
    json_data = fs.readFileSync(SETTINGS_FILE, "cbor");
  } else {
    console.log("info: saving user information!");
    json_data = {
      "age": user.age,
      "gender": user.gender,
      "weight": user.weight
    };
   
    fs.writeFileSync(SETTINGS_FILE, json_data, "cbor");
  }
  return json_data;
}

function saveData(button_type, value) {
  let history_data = {};
  
  if (fs.existsSync(HISTORY_FILE)) {
    console.log("info: found previous data information!");
    history_data = fs.readFileSync(HISTORY_FILE, "cbor");
  }
  
  let today = Date.now();
  
  history_data[today] = history_data[today] || {};
  
  history_data[today][button_type] = value;
  fs.writeFileSync(HISTORY_FILE, history_data, "cbor");
  console.log("info: wrote data.");
}


let buttons = ["btn-water", "btn-coffee", "btn-tea", "btn-milk", "btn-juice", "btn-soda"];

for (let item of buttons) {
  let btnItem = document.getElementById(item);
  btnItem.onclick = function(evt) {
    showModal(item);
    console.log(JSON.stringify(evt));
  }
}

function showModal(button_type) {
  let tumbler = document.getElementById("tumbler");
  let main_screen = document.getElementById("main-screen");
  let overlay = document.getElementById("overlay")
  
  main_screen.style.display = "none";
  overlay.style.display = "inline";
  

  let saveButton = document.getElementById("btn-save");
  let exitButton = document.getElementById("btn-exit");

  saveButton.onclick = function(evt) {
    saveData(button_type, getTumblerText(tumbler));
    refreshProgress();
    console.log(button_type + " " + getTumblerText(tumbler));
    overlay.style.display = "none";
    main_screen.style.display = "inline";

    return;
  }
  
  exitButton.onclick = function(evt) {
    overlay.style.display = "none";
    main_screen.style.display = "inline";

    return;
  }
}

function dateWithoutTime(time) {
    let d = new Date();
    d.setTime(time);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

function getTodayTotal() {
  let history_data = {};
  if (fs.existsSync(HISTORY_FILE)) {
    console.log("info: found previous data!");
    history_data = fs.readFileSync(HISTORY_FILE, "cbor");
  }
  
  let today = dateWithoutTime(Date.now());
  let waterHad = 0;
  
  Object.keys(history_data).forEach(function (key) {
    let new_date = dateWithoutTime(key);
    let data = history_data[key];
    if (new_date === today) {
      waterHad += parseInt(data["btn-water"] === undefined ? 0 : data["btn-water"]);    
    }
  });
  
  return waterHad;
}

function refreshProgress() {
  let progress = document.getElementById("mixedtext");
  let waterHad = getTodayTotal();
  let percent = parseInt(100*waterHad/2350, 0);
  
  progress.text =  percent + "%, " + waterHad + " ml";
  
  if (percent >= 100) {
    progress.style.fill = "green";
  }
}

refreshProgress();
