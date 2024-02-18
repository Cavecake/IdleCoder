import Game from "./game.js"

function updateBContent(data,number){
    var amount = data.amount;
    var cost = data.cost;
    var production = data.production;
    document.getElementById("amount"+toString(number)).innerText = toString(amount);
    document.getElementById("cost"+toString(number)).innerText = toString(cost);
    document.getElementById("production"+toString(number)).innerText = toString(production)
}
function updateUContent(data,number){
    //unhide content
    //make it use space
    var elem = document.getElementById("upgarde"+toString(number));
    elem.style.display = "block";
    var cost = data.price;
    var bonus = data.bonus;
    var effected_buidlings = data.effected_buidlings;
    elem.getElementById("UpgradeImage").src = "./upgrade"+toString(number)+".png";
    elem.getElementById("cost").innerText = "Upgrade Cost: "+toString(cost);
    var effect = "This upgrade multiplies the profit from "+effected_buidlings.toString()+" by a factor of"+toString(bonus)+".";
    elem.getElementById("effect").innerText = effect;
}
function updateMoney(money){
    document.getElementById("MoneyConter").innerText = toString("money")+" Bugs collected so far";
    // Updates the "money amount showed on screen"
}
function update(game){
    for(let i=0;i<game.buildings.length;i++){
        updateBContent(game.buildings[i].data,i);
    }
    var pos = 0;
    for(let i=0;i<game.upgardes.length;i++){
        if(game.GeneralData.bougth_upgrades.contains(i)){
            continue;
        }
        pos++;
        updateUContent(game.upgardes[i],pos);
        
    }
    updateMoney(game.GeneralData.money);
}
function click(){
    game.money += 1;
}

var game = new Game();
setInterval((update),100);