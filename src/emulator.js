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
    return 0;
}

function placeNextBet ()
{
    //TODO - go through all games on the current date and find the most suitable bet
    //if none exist, move on to the next day until one is found. 
    
    var thisDate = this._data [this._currentIndex].date;
    var nextDate = this._data [++this._currentIndex].date;
    var bestBet = null;

    for ( ; this._currentIndex < this._data.length-1, thisDate === nextDate; ++this._currentIndex)
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

        if (bestBet.result === "D") {
            this._balance += bestBet.odds * this._stake;
            console.log ("WIN!\t\t" + this._balance);

            this._stake = this._config.stakePerBet;
            this._lossCount = 0;
        }
        else{
            this._lossCount ++;

            console.log ("LOSE!\t\t" + this._balance + " (" + this._stake + ")");

            if(this._lossCount >= this._config.maxConsecutiveLosses)
            {
                this._stake = this._config.stakePerBet;
                this._lossCount = 0;
            }
            else 
            {
                this._stake *= 2;
            }
        }
    }

    if(this._currentIndex < this._data.length-1)
    {
        placeNextBet.call (this);
    }
}

function Emulator (config, data)
{
    this._config = config;


    this._data = data;

    //change dates from dd/mm/yy to yy/mm/dd ofr easier sorting
    this._data = this._data.map (item => {
        var ret = item;
        var date = item.date.split ("/");
        ret.date = date[2] + "/" + date[1] + "/" + date[0];
        return ret;
    })

    this._data = data.sort (sortByDate);

    this._balance = config.startingBalance;
    this._currentDate = data[0].date;
    this._currentIndex = 0;
    this._stake = config.stakePerBet;
    this._lossCount = 0;

    placeNextBet.call (this);

    for (var i=0; i<5; i++)
    {
        var d = data[i];
        for (var k in d)
        {
            //console.log ("d["+k+"] = " + d[k])
        }
    }
}

module.exports = Emulator;