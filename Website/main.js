// Building class
class Building {
    constructor(base_production, name, position, price, data = null) {
        this.data = data || new BuildingData(base_production, name, position, price);
    }

    addBonus(bonus) {
        this.data.modifier += bonus;
    }

    calcProduction() {
        return this.data.base_production * this.data.amount * this.data.modifier;
    }

    buy(amount, price_multiplier, money) {
        if (money < this.data.price * amount) {
            return money;
        }
        this.data.amount += amount;
        money -= this.data.price * amount;
        this.data.price *= Math.pow(price_multiplier, amount);
        return money;
    }

    getSaveData() {
        return this.data;
    }
}


// Game class
class Game {
    constructor() {
        this.autosaveInterval = 1000;
        this.startTime = performance.now();
        this.buildings = [];
        this.upgrades = [];
        this.previousBuildingHTML = ''; // Store previous HTML content for buildings
        this.previousUpgradeHTML = ''; // Store previous HTML content for upgrades

        if (window.localStorage.getItem("Init") == null) {
            this.initialiseData();
            this.generalData = new Data();
        } else {
            this.generalData = this.loadData();
            this.fetchData();
        }

        setInterval(() => this.update(), 100);
        document.getElementById("resetGameButton").addEventListener("click", () => {
            this.resetGame();
            hideWinScreen();
        });
        setInterval(() => this.saveGameData(), this.autosaveInterval);
    }

    resetGame() {
        // Clear local storage
        window.localStorage.clear();

        // Reset game data
        this.startTime = performance.now();
        this.buildings = [];
        this.upgrades = [];
        this.generalData = new Data();

        // Re-initialize game data
        this.initialiseData();
        this.updateUI()
    }
    fixBug() {
        // Simulate fixing the bug and update bugs collected
        this.generalData.money += 10; // Example increment, adjust as needed
        this.updateUI(); // Update UI
    }
    updateUI(){
        // Update UI only if content has changed
        let moneyCounter = document.getElementById("MoneyCounter");
        moneyCounter.innerText = `${this.generalData.money.toFixed(0)} Bugs collected so far`;

        let buildingHTML = this.generateBuildingHTML();
        if (buildingHTML !== this.previousBuildingHTML) {
            document.getElementById("buildings").innerHTML = buildingHTML;
            this.previousBuildingHTML = buildingHTML;
        }

        let upgradeHTML = this.generateUpgradeHTML();
        if (upgradeHTML !== this.previousUpgradeHTML) {
            document.getElementById("upgrades").innerHTML = upgradeHTML;
            this.previousUpgradeHTML = upgradeHTML;
        }
    }
    saveGameData() {
        SaveData(this.generalData);
        for (let i = 0; i < this.buildings.length; i++) {
            SaveBuildingData(initData.buildings[i].keyname, this.buildings[i].getSaveData());
        }
    }

    loadData() {
        let data = window.localStorage.getItem("GeneralData");
        return JSON.parse(data) || new Data();
    }

    initialiseData() {
        let buildings = initData.buildings;
        let upgrades = initData.upgrades;

        for (let i = 0; i < buildings.length; i++) {
            let jsonData = buildings[i];
            let newData = new Building(jsonData.base_production, jsonData.name, jsonData.position, jsonData.price);
            this.buildings.push(newData);
        }

        for (let i = 0; i < upgrades.length; i++) {
            let jsonData = upgrades[i];
            let newData = new Upgrade(jsonData.bonus, jsonData.affected_buildings, jsonData.price, jsonData.name);
            this.upgrades.push(newData);
        }
    }

    fetchData() {
        let buildings = initData.buildings;
        let upgrades = initData.upgrades;

        for (let i = 0; i < buildings.length; i++) {
            let buildingData = LoadBuildingData(buildings[i].keyname);
            this.buildings.push(new Building(buildings[i].base_production, buildings[i].name, buildings[i].position, buildings[i].price, buildingData));
        }

        for (let i = 0; i < upgrades.length; i++) {
            this.upgrades.push(new Upgrade(upgrades[i].bonus, upgrades[i].affected_buildings, upgrades[i].price,upgrades[i].name));
        }
    }

    getBuildingInfo(index) {
        return this.buildings[index].data;
    }

    getUpgradeInfo(index) {
        return this.upgrades[index].data;
    }

    buyBuilding(buildingIndex, amount) {
        let money = this.generalData.money;
        money = this.buildings[buildingIndex].buy(amount, initData.price_multiplier, money);
        this.generalData.money = money;
    }

    buyUpgrade(upgradeIndex) {
        let money = this.generalData.money;
        money = this.upgrades[upgradeIndex].buy(money);
        this.generalData.money = money;
        this.generalData.bought_upgrades.push(upgradeIndex);
    }

    update() {
        let additional_money = 0;
        for (let i = 0; i < this.buildings.length; i++) {
            additional_money += this.buildings[i].calcProduction();
        }
        let endTime = performance.now();
        let timeDiff = (endTime - this.startTime) / 1000;
        this.generalData.money += additional_money * timeDiff;
        this.startTime = endTime;
        if (this.generalData.money >= initData.winCondition) {
            showWinScreen();
        }

        // Update UI
        this.updateUI();
    }

    generateBuildingHTML() {
        let html = '';
        for (let i = 0; i < this.buildings.length; i++) {
            let building = this.buildings[i];
            html += `
                <button class="building-item" data-index="${i}" onclick="game.buyBuilding(${i}, 1)">
                    <h3>${building.data.name}</h3>
                    <p>Amount: ${building.data.amount}</p>
                    <p>Production: ${building.data.base_production.toFixed(0)}</p>
                    <p>Price: ${building.data.price.toFixed(0)}</p>
                </button>
            `;
        }
        return html;
    }
    

    generateUpgradeHTML() {
        let html = '';
        let pos = 0;
        for (let i = 0; i < this.upgrades.length; i++) {
            if (this.generalData.bought_upgrades.includes(i)) {
                continue; // Skip upgrades that have already been bought
            }
            let upgrade = this.upgrades[i];
            html += `
                <button class="upgrade-item" data-index="${pos}" onclick="game.buyUpgrade(${i})">
                    <h3>Upgrade ${upgrade.name}</h3>
                    <p>Upgrade Cost: ${upgrade.price.toFixed(0)}</p>
                    <p>${upgrade.getDescription()}</p>
                </button>
            `;
            pos++;
        }
        return html;
    }
    

}


// Utility functions
function SaveBuildingData(key, data) {
    window.localStorage.setItem(key, JSON.stringify(data));
}

function LoadBuildingData(key) {
    let data = window.localStorage.getItem(key);
    return JSON.parse(data);
}

function SaveData(data) {
    window.localStorage.setItem("Init", "1");
    window.localStorage.setItem("GeneralData", JSON.stringify(data));
}

// Data classes
class Data {
    constructor() {
        this.money = 0;
        this.bought_upgrades = [];
    }
}

class BuildingData {
    constructor(base_production, name, position, price) {
        this.base_production = base_production;
        this.name = name;
        this.position = position;
        this.amount = 0;
        this.modifier = 1;
        this.price = price;
    }
}

class Upgrade {
    constructor(bonus, effected_buildings, price, name) {
        this.name = name;
        this.bonus = bonus;
        this.effected_buildings = effected_buildings;
        this.price = price;
    }

    getDescription() {
        return `This upgrade multiplies the profit from ${this.effected_buildings.join(", ")} by a factor of ${this.bonus.toFixed(0)}.`;
    }

    applyBonus(buildings) {
        for (let i = 0; i < buildings.length; i++) {
            if (this.effected_buildings.includes(buildings[i].data.name)) {
                buildings[i].addBonus(this.bonus);
            }
        }
    }

    buy(money) {
        if (money < this.price) {
            return money;
        }
        this.applyBonus(game.buildings);
        return money - this.price;
    }
}

// Adjusted game data
var initData = {
    "winCondition": 1000000,  // Adjusted win condition to 1,000,000 units
    "buildings": [
        {
            "keyname": "bugger",
            "name": "Bugger",
            "position": 0,
            "price": 10,
            "base_production": 5
        },
        {
            "keyname": "optimizer",
            "name": "Optimizer",
            "position": 1,
            "price": 100,
            "base_production": 25
        },
        {
            "keyname": "compiler",
            "name": "Compiler",
            "position": 2,
            "price": 500,
            "base_production": 50
        },
        {
            "keyname": "debugger",
            "name": "Debugger",
            "position": 3,
            "price": 1000,
            "base_production": 100
        },
        {
            "keyname": "profiler",
            "name": "Profiler",
            "position": 4,
            "price": 5000,
            "base_production": 250
        },
        {
            "keyname": "refactorer",
            "name": "Refactorer",
            "position": 5,
            "price": 10000,
            "base_production": 500
        },
        {
            "keyname": "integrator",
            "name": "Integrator",
            "position": 6,
            "price": 25000,
            "base_production": 1000
        },
        {
            "keyname": "automator",
            "name": "Automator",
            "position": 7,
            "price": 50000,
            "base_production": 2000
        }
    ],
    "upgrades": [
        {
            "name": "Efficiency Boost",
            "bonus": 2.5,
            "price": 200,
            "affected_buildings": ["Bugger", "Compiler"]
        },
        {
            "name": "Precision Tweaking",
            "bonus": 2,
            "price": 500,
            "affected_buildings": ["Optimizer", "Debugger"]
        },
        {
            "name": "Master Code Optimization",
            "bonus": 3.5,
            "price": 1000,
            "affected_buildings": ["Bugger", "Optimizer", "Compiler", "Debugger"]
        },
        {
            "name": "Advanced Profiling",
            "bonus": 4,
            "price": 5000,
            "affected_buildings": ["Profiler", "Refactorer", "Integrator"]
        },
        {
            "name": "Automated Refactoring",
            "bonus": 5,
            "price": 10000,
            "affected_buildings": ["Refactorer", "Automator"]
        },
        {
            "name": "Optimized Integration",
            "bonus": 6,
            "price": 25000,
            "affected_buildings": ["Integrator"]
        },
        {
            "name": "AI Automation",
            "bonus": 7,
            "price": 50000,
            "affected_buildings": ["Automator"]
        }
    ],
    "price_multiplier": 1.15
};



function generateProgrammingBug() {
    const verbs = [
        "SyntaxError",
        "ReferenceError",
        "TypeError",
        "RangeError",
        "AssertionError",
        "NotImplementedError",
        "OverflowError",
        "IndentationError",
        "KeyError",
        "ValueError",
        "ImportError"
    ];

    const adjectives = [
        "Unexpected",
        "Missing",
        "Undefined",
        "Invalid",
        "Infinite",
        "Illegal",
        "Ambiguous",
        "Sneaky",
        "Nefarious",
        "Ridiculous",
        "Hilarious",
        "Absurd"
    ];

    const nouns = [
        "semicolon",
        "variable",
        "function",
        "module",
        "class",
        "object",
        "attribute",
        "method",
        "parameter",
        "argument",
        "property",
        "index",
        "syntax",
        "loop"
    ];

    const verb = verbs[Math.floor(Math.random() * verbs.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${verb}: ${adjective} ${noun}`;
}

// Example usage:
console.log(generateProgrammingBug()); // Output: "TypeError: Hilarious variable"
console.log(generateProgrammingBug()); // Output: "SyntaxError: Nefarious syntax"
console.log(generateProgrammingBug()); // Output: "ReferenceError: Absurd function"


// Update the findAndFixBug function to integrate with the Game class
function findAndFixBug() {
    let bugDescription = generateProgrammingBug();
    alert(`Bug Found: ${bugDescription}`);

    // Confirm if the player wants to fix the bug
    let fixButton = confirm("Do you want to fix this bug?");

    if (fixButton) {
        // Assuming game instance is accessible globally or in scope
        game.fixBug(); // Call a method to handle bug fixing in your Game class
    }
}


// Example initialization and usage
let game = new Game();

// Function to show win screen
function showWinScreen() {
    const winScreen = document.getElementById('winScreen');
    winScreen.style.display = 'block';
}
// Function to show win screen
function showWinScreen() {
    const winScreen = document.getElementById('winScreen');
    winScreen.style.display = 'block';
}
function hideWinScreen(){
    const winScreen = document.getElementById('winScreen');
    winScreen.style.display = 'none';
}