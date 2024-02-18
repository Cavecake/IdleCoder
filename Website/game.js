import initData from './data.json' assert { type: 'json' };

class  Game{
    constructor(){
        this.buldings = [];
        this.upgrades = []
        if(window.localStorage.getItem("Init") == null){
            this.InitialiseData();   
            this.GeneralData = new Data();
            
        }
        else{
            this.GeneralData = LoadData();
            this.FetchData();
        }
        this.startTime = performance.now();
        this.update();
    }
    // returns all the data neccesarry to describe a building
    getBuldingInfo(index){
        return this.buldings[index].data;
    }
    getUpgradeInfo(index){
        return this.upgrades[index].data;
    }
    // Functions to buy items
    buyBuldings(buldingIndex,amount){
        money = this.GeneralData.money;
        money = this.buldings[buldingIndex].buy(amount,initData[price_multiplier],money);
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
        additional_money = 0;
        for(let i = 0;i<this.buldings.length;i++){
            additional_money += this.buldings[i].calc_Production();
        }
        var endTime = performance.now();
        var TimeDiff = (endTime-this.startTime)/1000;
        this.GeneralData.money += additional_money*TimeDiff;
        this.removeUsedUpgrades();
        setTimeout(300);
        this.startTime = endTime;
        this.update();
    }
    // Saving and Loading the data
    // If no data was save init with the basic starting data
    FetchData(){
        var upgrades = initData["upgrades"];
        var buldings = initData["buldings"];
        for(let i=0;i<buldings.length;i++){
            this.buldings.push(LoadBuildingData(buldings[i].keyname));
        }
        for(let i=0;i<upgrades.length;i++){

            jsonData = upgrades[i];
            newData = new Upgrade(jsonData.bonus,jsonData.effected_buidlings,jsonData.price);
            this.buldings.push(newData);
        }
        
    }
    InitialiseData(){
        var upgrades = initData["upgrades"];
        var buldings = initData["buldings"];
        for(let i=0;i<buldings.length;i++){
            jsonData = buldings[i];
            newData = new Bulding(jsonData.base_production,jsonData.name,jsonData.position,jsonData.price);
            this.buldings.push(newData);
        }
        for(let i=0;i<upgrades.length;i++){
            jsonData = upgrades[i];
            newData = new Upgrade(jsonData.bonus,jsonData.effected_buidlings,jsonData.price);
            this.buldings.push(newData);
        }
    }
    saveGameData(){
        SaveData(this.GeneralData);
        var buldingKeys = initData["buldings"];
        for(let i = 0;i<this.buldings.length;i++){
            SaveBuildingData(buldingKeys[i].keyname,this.buldings[i]);
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
    constructor(base_production,name,position, price,data = null){
        if(data == null){
            this.data = BuldingData(base_production,name,position, price)
        }
        this.data = data;
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
            if(this.effected_buidlings.contains(buldings[i].name)){
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