function updateBContent(data,number){
    var amount = data.amount;
    var cost = data.price;
    var production = data.base_production*data.modifier;
    number = number.toString()
    document.getElementById("amount").innerHTML = amount.toString();
    document.getElementById(("cost"+number)).innerHTML = cost.toString();
    document.getElementById("production"+number).innerHTML = production.toString()
}
function updateUContent(data,number){
    //unhide content
    //make it use space
    
    var elem = document.getElementById("upgrade"+number.toString());
    elem.style.display = "block";
    var cost = data.price;
    var bonus = data.bonus;
    var effected_buidlings = data.effected_buidlings;
    var src = document.getElementById("UImage"+number.toString()).src;
    src = src.slice(-5);
    if (src.toString() != number.toString()+".png"){
        console.log("upüdate")
        document.getElementById("UImage"+number.toString()).src = "./upgrades/"+number.toString()+".png";
    }
    document.getElementById("cost"+number.toString()).innerText = "Upgrade Cost: "+cost.toString();
    var effect = "This upgrade multiplies the profit from "+effected_buidlings.toString()+" by a factor of "+bonus.toString()+".";
    document.getElementById("effect"+number.toString()).innerText = effect;
}
function updateMoney(money){
    document.getElementById("MoneyCounter").innerText = toString("money")+" Bugs collected so far";
    // Updates the "money amount showed on screen"
}
function update(){
    game.update();
    for(let i=0;i<game.buildings.length;i++){
        updateBContent(game.buildings[i].data,i);
    }
    var pos = 0;
    for(let i=0;i<game.upgrades.length;i++){
        if(game.GeneralData.bougth_upgrades.includes(i)){
            continue;
        }
        updateUContent(game.upgrades[i],pos);
        pos++;
    }
    updateMoney(game.GeneralData.money);
}
function click(){
    game.money += 1;
}




class  Game{
    constructor(){
        this.startTime = performance.now();
        this.buildings = [];
        this.upgrades = []
        if(window.localStorage.getItem("Init") == null){
            this.InitialiseData();   
            this.GeneralData = new Data();

        }
        else{
            this.GeneralData = LoadData();
            this.FetchData();
        }
        
        //this.update();
    }
    // returns all the data neccesarry to describe a building
    getBuldingInfo(index){
        return this.buildings[index].data;
    }
    getUpgradeInfo(index){
        return this.upgrades[index].data;
    }
    // Functions to buy items
    buyBuldings(buldingIndex,amount){
        money = this.GeneralData.money;
        money = this.buildings[buldingIndex].buy(amount,initData[price_multiplier],money);
        this.GeneralData.money = money;
    }
    buyUpgrade(upgradeIndex){
        money = this.GeneralData.money;
        money = this.upgrades[upgradeIndex].buy(money);
        this.GeneralData.money = money;
        this.GeneralData.bougth_upgrades.push(upgradeIndex);
    }
    // The main function
    // Updates the money and calls itself
    update(){
        var additional_money = 0;
        for(let i = 0;i<this.buildings.length;i++){
            additional_money += this.buildings[i].calc_Production();
        }
        var endTime = performance.now();
        var TimeDiff = (endTime-this.startTime)/1000;
        this.GeneralData.money += additional_money*TimeDiff;
        setTimeout(300);
        this.startTime = endTime;
        //this.update();
    }
    // Saving and Loading the data
    // If no data was save init with the basic starting data
    FetchData(){
        var upgrades = initData["upgrades"];
        var buldings = initData["buldings"];
        for(let i=0;i<buldings.length;i++){
            var loadData = LoadBuildingData(buldings[i].keyname)
            this.buildings.push(new Bulding(null,null,null,null,loadData));
        }
        for(let i=0;i<upgrades.length;i++){

            var jsonData = upgrades[i];
            newData = new Upgrade(jsonData.bonus,jsonData.effected_buidlings,jsonData.price);
            this.upgrades.push(newData);
        }
        
    }
    InitialiseData(){
        var upgrades = initData["upgrades"];
        var buldings = initData["buldings"];

        for(let i=0;i<buldings.length;i++){
            var jsonData = buldings[i];

            var newData = new Bulding(jsonData.base_production,jsonData.name,jsonData.position,jsonData.price);
            this.buildings.push(newData);
        }
        for(let i=0;i<upgrades.length;i++){
            var jsonData = upgrades[i];
            var newData = new Upgrade(jsonData.bonus,jsonData.effected_buidlings,jsonData.price);
            this.upgrades.push(newData);
        }
    }
    saveGameData(){
        SaveData(this.GeneralData);
        var buldingKeys = initData["buldings"];
        for(let i = 0;i<this.buildings.length;i++){
            SaveBuildingData(buldingKeys[i].keyname,this.buildings[i].data);
        }
    }
}

function SaveBuildingData(key,data){
    window.localStorage.setItem(key,JSON.stringify(data))
}
function LoadBuildingData(key){
    let newObject = window.localStorage.getItem(key);
    return JSON.parse(newObject);
}
function SaveData(Data){
    window.localStorage.setItem("Init","1")
    window.localStorage.setItem("GeneralData",JSON.stringify(Data))
}
function LoadData(){
    let newObject = window.localStorage.getItem("GeneralData");
    return JSON.parse(newObject);
}
class Data{
    money = 0
    bougth_upgrades = []
}
class BuldingData{
    base_production = 3;
    constructor(base_production,name,position, price){
        this.base_production = base_production;
        this.name = name;
        this.position = position;
        this.amount = 0;
        this.modifier = 1;
        this.price = price;
    }
}

class Bulding{
    data = null;
    constructor(base_production,name,position, price,data = null){
        if(data == null){
            this.data = new BuldingData(base_production,name,position, price);

        }
        else{

            this.data = data;
        }
    }
    addBonus(bonus){
        this.data.modifier = this.data.modifier + bonus;
    }
    calc_Production(){

        return this.data.base_production * this.data.amount * this.data.modifier;
    }
    buy(amount,price_multiplier,money){
        if(money<this.data.price*amount){
            return money;
        }
        this.data.amount += amount;
        money = money - amount*this.data.price;
        this.data.price = this.data.price * (price_multiplier**amount);
        return money
    }
    sell(amount,money,price_multiplier){
        if (amount>this.data.amount){
            return money
        }
        this.data.amount -= amount;
        this.data.price = this.data.price/(price_multiplier**amount);
        money += this.data.price * amount;
        return money;
    }
    getAmount(){
        return this.data.amount;
    }
    getPrice(){
        return this.data.price;
    }
    getSaveData(){
        return this.data;
    }
}
class Upgrade{
    constructor(bonus,effected_buidlings,price){
        this.effected_buidlings = effected_buidlings;
        this.bonus = bonus;
        this.price = price;
    }
    apply_bonus(buldings){
        for(let i = 0; i<buldings.length;i++){
            if(this.effected_buidlings.includes(buldings[i].name)){
                buldings[i].addBonus(this.bonus);
            }
        }
    }
    buy(money){
        if(money<this.price){
            return money;
        }
        this.apply_bonus(buldings);
        return money - this.price;
    }
}

var game = new Game();
setInterval((update),100);