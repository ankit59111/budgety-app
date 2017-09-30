var budgetController=(function () {
    //code here
    var Expenses = function (id,description,value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
    };
    Expenses.prototype.calcPercentage=function (totalIncome) {
      if (totalIncome > 0) {
          this.percentage=Math.round((this.value/totalIncome)*100);
      }else {
          this.percentage = -1;
      }
    };

    Expenses.prototype.getPercentage = function () {
         return this.percentage;
    };

    var Income = function (id,description,value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var calculateSum = function (type) {
        var sum=0;
        data.allItems[type].forEach(function (current) {
            sum+=current.value;
        });
        data.total[type]=sum;
    };

    var data = {
       allItems:{
           exp:[],
           inc:[]
       },
      total:{
          exp:0,
          inc:0
      },
      saving:0,
      percentage:-1
    };

    return {
      addItems:function (type,desc,val) {
          var newItem,ID;
          if(data.allItems[type].length>0){
              ID=data.allItems[type][data.allItems[type].length-1].id+1;
          }else {
              ID=0;
          }

          if (type === 'exp'){
              newItem = new Expenses(ID,desc,val);
          }else if (type === 'inc'){
              newItem = new Income(ID,desc,val);
          }
          data.allItems[type].push(newItem);
          return newItem;

      },
        deleteItem:function (type,id) {
          var ids,index;
            ids=data.allItems[type].map(function (current) {
               return current.id;
            });
            index = ids.indexOf(id);
            if (index !== -1){
                data.allItems[type].splice(index,1);
            }
        },
      calculateBudget:function () {
        calculateSum('exp');
        calculateSum('inc');

        data.saving = data.total.inc - data.total.exp;
        if(data.total.inc>0){
            data.percentage = Math.round((data.total.exp/data.total.inc)*100);
        }else {
            data.percentage=-1;
        }

      },

        calculatePercentage:function () {
          data.allItems.exp.forEach(function (current) {
             current.calcPercentage(data.total.inc);
          });

        },
        getPercentages:function () {
          var allPercentages=data.allItems.exp.map(function (current) {
              return current.getPercentage();
          });
          return allPercentages;
        },

        getBudget:function () {
        return {
            budget:data.saving ,
            totalincome:data.total.inc,
            totalExpenditure:data.total.exp,
            totalPercentage:data.percentage
        }
      },
      testing:function () {
        console.log(data);
       }


    };

})();



var UIController=(function () {
    //code here
    var DOMstrings={
       inputType:'.add_type',
        inputDescription:'.add_description',
        inputValue: '.add_value',
        inputButton:'.add_btn',
        incomeContainer:'.income_list',
        expenseContainer:'.expenses_list',
        totalbudgetLabel:'.budget_value',
        incomeLabel:'.budget_income--value',
        expenseLabel:'.budget_expenses--value',
        percentageLabel:'.budget_expenses--percentage',
        container:'.container',
        expPercentage:'.item_percentage',
        displaydate:'.budget_title--month'
        

    };
    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    var nodeList = function (list,callback) {
        for (var i=0;i<list.length;i++){
            callback(list[i],i);
        }
    };

    return {
  getinputdata:function () {
     return{
        type: document.querySelector(DOMstrings.inputType).value,
        desc: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
     };

  },
    getDomStrings:function () {
        return DOMstrings;
    },
    addListItem:function (obj,type) {
      var html,newHtml,element;
      if (type==='inc'){
          element=DOMstrings.incomeContainer;
          html='<div class="item clearfix" id="inc-%id%"><div class="item_description">%description%</div><div class="right clearfix">\n' +
              ' <div class="item_value">%value%</div><div class="item_delete"><button class="item_delete--btn"><i class="ion-ios-close-outline">\n' +
              ' </i></button></div></div></div>'
      }else if (type==='exp'){
          element=DOMstrings.expenseContainer;
          html='<div class="item clearfix" id="exp-%id%"><div class="item_description">%description%</div><div class="right clearfix">\n' +
              ' <div class="item_value">%value%</div><div class="item_percentage">21%</div>><div class="item_delete"><button class="item_delete--btn"><i class="ion-ios-close-outline">\n' +
              ' </i></button></div></div></div>'
      }
      //replacing placeholder tet with actual data
        newHtml=html.replace("%id%",obj.id);
        newHtml=newHtml.replace("%description%",obj.description);
        newHtml=newHtml.replace("%value%",obj.value);
        document.querySelector(element).insertAdjacentHTML('beforeEnd',newHtml);
    },
    deleteListItem:function (selectorID) {
      var element = document.getElementById(selectorID);
        element.parentNode.removeChild(element);
    },
    displayPercentage:function (percentages) {
        var fields;
        fields=document.querySelectorAll(DOMstrings.expPercentage);
        nodeList(fields,function (current,index) {
            if(percentages[index]>0){
                current.textContent=percentages[index] + '%';
            }else {
                current.textContent='---';
            }
        });
    },
    displayDate:function () {
      var now,year;
      now = new Date();
      year = now.getFullYear();
      document.querySelector(DOMstrings.displaydate).textContent= ' ' + year;
    },

    clearField:function () {
        var fields,fieldsArr;
        fields=document.querySelectorAll(DOMstrings.inputDescription +','+ DOMstrings.inputValue);
        fieldsArr=Array.prototype.slice.call(fields);

        fieldsArr.forEach(function (current,index,fieldArr) {
            current.value="";
        });
        fieldsArr[0].focus();
    },
      changeColor:function () {
        var fields = document.querySelectorAll(DOMstrings.inputType +','+ DOMstrings.inputDescription +','+ DOMstrings.inputValue);
        nodeList(fields,function (current) {
           current.classList.toggle('red-focus');
        });
        document.querySelector(DOMstrings.inputButton).classList.toggle('red');
      },


     budget:function (obj) {
      var type;
         obj.budget > 0 ? type = 'inc' : type = 'exp';
        document.querySelector(DOMstrings.totalbudgetLabel).textContent=formatNumber(obj.budget,type);
         document.querySelector(DOMstrings.incomeLabel).textContent=formatNumber(obj.totalincome,'inc');
         document.querySelector(DOMstrings.expenseLabel).textContent=formatNumber(obj.totalExpenditure,'exp');
         if (obj.totalPercentage > 0){
             document.querySelector(DOMstrings.percentageLabel).textContent=obj.totalPercentage + '%';
         }else {
             document.querySelector(DOMstrings.percentageLabel).textContent='---';
         }

    }

};
})();




var controller=(function (bdgtctrl,UIctrl) {
    //code here
    var setEventListener=function () {
        var Dom = UIctrl.getDomStrings();
        document.querySelector(Dom.inputButton).addEventListener('click',ctrl);
        document.addEventListener('keypress',function (event) {
            if (event.keyCode==13||event.which==13){
                ctrl();
            }
        });
        document.querySelector(Dom.container).addEventListener('click',ctrldeleteItem);
        document.querySelector(Dom.inputType).addEventListener('change',UIctrl.changeColor);
    };
    var updatePercentage = function () {
        bdgtctrl.calculatePercentage();
        var percentages=bdgtctrl.getPercentages();
        UIctrl.displayPercentage(percentages);

    };
    var ctrl = function () {
        // 1. get input data
        var input = UIctrl.getinputdata();
        // 2. add item to budget
        if(input.desc!=="" && !isNaN(input.value) && input.value>0){
            var addItem= bdgtctrl.addItems(input.type,input.desc,input.value);
            // 3. add item to ui
            UIctrl.addListItem(addItem,input.type);

            UIctrl.clearField();
        }
        // 4. calculate budget
        updateBudget();
        // 5. display budget on ui
        // calculate and update percentage
        updatePercentage();
    };
    var updateBudget = function () {
        bdgtctrl.calculateBudget();
        var displayBudget=bdgtctrl.getBudget();
        UIctrl.budget(displayBudget);
    };
    var ctrldeleteItem = function (event) {
        var itemId,type,ID,splitId;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemId){
            splitId=itemId.split('-');
            type=splitId[0];
            ID=parseInt(splitId[1]);

            bdgtctrl.deleteItem(type,ID);
            UIctrl.deleteListItem(itemId);
            updateBudget();
            updatePercentage();

        }
    }

    return {
      init:function () {
         console.log('application working');
          UIctrl.budget({
              budget: 0,
              totalincome: 0,
              totalExpenditure: 0,
              totalPercentage: '---'
          });
          UIctrl.displayDate();
          setEventListener();
      }
    };

})(budgetController,UIController);

controller.init();


