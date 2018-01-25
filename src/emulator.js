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

    for ( ; this._currentIndex < this._data.length-1; this._currentIndex++)
    {
        var d = this._data [this._currentIndex];
       //todo...
    }
}

function Emulator (config, data)
{
    this._config = config;

    //TODO - Need to ensure data is sorted chronologically
    //this._data = data.sort (sortByDate);

    this._data = data;

    this._balance = config.startinBalance;
    this._currentDate = data[0].date;
    this._currentIndex = 0;

    placeNextBet.call (this);

    for (var i=0; i<data.length-1; i++)
    {
        var d = data[i];
        for (var k in d)
        {
            console.log ("d["+k+"] = " + d[k])
        }
    }
}

module.exports = Emulator;