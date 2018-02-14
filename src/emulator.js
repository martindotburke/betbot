var fib = [1,1,2,3,5,8,13,21,34];
function sortByDate (a, b)
{
    if(a.date>b.date)
    {
        return 1;
    }
    if(a.date<b.date)
    {
        return -1;
    }
    if(a.hometeam<b.hometeam)
    {
        return 1;
    }
    if(a.hometeam>b.hometeam)
    {
        return -1;
    }
    return 0;
}

function placeNextBet ()
{
    //TODO - go through all games on the current date and find the most suitable bet
    //if none exist, move on to the next day until one is found. 
    
    var thisDate = this._data [this._currentIndex].date;
    var nextDate = this._data [++this._currentIndex].date;
    var bestBet = null;

    for ( ; this._currentIndex < this._data.length-1 && thisDate === nextDate; this._currentIndex++)
    {
        var fixture = this._data [this._currentIndex];
        var odds = fixture.odds;
        if(odds > this._config.minOdds && odds < this._config.maxOdds )
        {
            if(!bestBet || bestBet.odds > odds)
            {
                bestBet = fixture;
            } 
        }
        
        if(this._data [this._currentIndex + 1])
        {
            nextDate = this._data [this._currentIndex + 1].date;
        }
    }

    if (bestBet)
    {
        this._balance -= this._stake;

        this._lowestBalance = Math.min (this._lowestBalance, this._balance);

        if (bestBet.result === "D") {
            this._balance += bestBet.odds * this._stake;
            this._highestBalance = Math.max (this._lowestBalance, this._balance);
            this._stake = this._config.stakePerBet;
            this._lossCount = 0;
        }
        else{
            this._lossCount ++;

            //console.log ("LOSE!\t\t" + this._balance + " (" + this._stake + ")");

            if(this._lossCount >= this._config.maxConsecutiveLosses)
            {
                this._stake = this._config.stakePerBet;
                this._lossCount = 0;
            }
            else 
            {
                this._stake = Math.min (this._balance, this._config.stakePerBet * fib [this._lossCount]);
            }
        }
    }

    if((this._currentIndex < this._data.length-1) && this._balance >= this._stake)
    {
        return placeNextBet.call (this);
    }
    else{
        //print result
        // console.log ("----------------------------------");
        // console.log ("min   : " + this._lowestBalance);
        // console.log ("max   : " + this._highestBalance);
         var profit = this._balance  - this._config.startingBalance;
        // if(profit > 0){
        //     console.log("p/l   : \x1b[32m%s\x1b[0m", profit);
        // }
        // else {
        //     console.log("p/l   : \x1b[31m%s\x1b[0m", profit);
        // }

        // console.log ("\n\n");

        return profit;
    }
}

function Emulator (config, data)
{
    this._config = config;

    this._data = data;

    //change dates from dd/mm/yy to yy/mm/dd for easier sorting
    this._data = this._data.map (item => {
        var ret = item;
        var date = item.date.split ("/");
        ret.date = date[2] + "/" + date[1] + "/" + date[0];
        return ret;
    })

    this._data = data.sort (sortByDate);
}

Emulator.prototype.run = function () {
    this._balance = this._config.startingBalance;
    this._currentIndex = 0;
    this._stake = this._config.stakePerBet;
    this._lossCount = 0;

    this._lowestBalance = this._balance;
    this._highestBalance = this._balance;
    this._finalBalance = this._balance;

    var profit = placeNextBet.call (this);

    return profit;
}

module.exports = Emulator;