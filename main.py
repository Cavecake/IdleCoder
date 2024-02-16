class Building():
    amount = 0
    modifiers = [1]
    prestige_modifers = []
    base_production = 0
    def __init__(self,base_production) -> None:
        self.base_production = base_production
    
    def change_base_modifer(self,add_modifer):
        self.modifiers[0] += add_modifer
    
    def add_multiplied_modifer(self,modifer):
        self.modifiers.append(modifer)
    
    def calc_production(self):
        modifer = self.modifiers[0]

        for i in range(1,len(self.modifiers)):
            modifer*=self.modifiers[i]
        
        for i in range(len(self.prestige_modifers)):
            modifer*=self.prestige_modifers[i]

        return self.base_production*modifer
    
    def add_prestige_modifer(self,modifer):
        self.prestige_modifers.append(modifer)

    def prestige(self):
        self.modifiers = [1]
        self.amount = 0

class Upgrade():
    def __init__(self,bonus,prestige_bonus= False,additive = False):
        self.additive = additive  
        self.prestige = prestige_bonus
        self.bonus = bonus
    def apply(self,buildings):
        for building in buildings:
            if self.prestige:
                building.add_prestige_modifer(self.bonus)
            elif self.additive:
                building.add_multiplied_modifer(self.bonus)
            else:
                building.change_base_modifer(self.bonus)

