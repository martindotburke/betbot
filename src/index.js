const parse =       require('csv-parse/lib/sync')
const fs =          require ("fs");
const prembot =     require ("../config/prembot");
const Emulator =    require ("./emulator");

const bots = [prembot];

//----------------------------------------------
function DataObject (date, hometeam, result, odds)
{
    this.date = date;
    this.hometeam = hometeam;
    this.result = result;
    this.odds = odds;
}

//----------------------------------------------
function getFileList (path, onComplete)
{
    console.assert (path, "Invalid data source");

    var stats = fs.lstatSync (path);

    if (stats.isDirectory ())
    {
        var that = this;
        fs.readdir ( path,
            function (err, files) {
                if (err) {
                    console.assert (false, "Invalid data sourcevvvv");
                }
                else {
                    onComplete (files.map (filename => path + "/" + filename));
                }
            }
        );
    }
    else if (stats.isFile){
        console.assert (path.indexOf (".csv")>0, "Invalid data source");
        onComplete ([path]);
    }
    else {
        onComplete ();
    }
}

//----------------------------------------------
function parseCSVFile (filepath, bookieIndex)
{
    var normalData = [];

    var data  = fs.readFileSync(filepath, "utf8");

    var parsedData = parse (data);

    //skip first line, this is just header data
    for (var i = 1; i < parsedData.length; i++) {
        //[26] = B365
        var matchData = parsedData [i];
        console.log ("matchData ["+bookieIndex+"] = " + matchData [bookieIndex]);
        normalData.push (new DataObject (matchData [1], matchData [2], matchData [6], matchData [bookieIndex]));
    }

    return normalData;
}

//----------------------------------------------
function start () 
{
    var botConfig = bots[0];

    // "maxConsecutiveLosses": 6,
    // "maxOdds": 99,
    // "minOdds": 2.8,
    // "stakePerBet": 1.00,
    // "startingBalance": 100

    var biggestProfit = {
        amount: 0,
        ml: 8,
        mino: 2.8,
        maxo: 6
    };

    // for (var maxLosses = 4; maxLosses <8; maxLosses++)
    // {
    //     botConfig.maxConsecutiveLosses = maxLosses;
        
    //     for (var minOdds = 2; minOdds<2.9; minOdds += 0.1)
    //     {
    //         for( var maxOdds = 2.9; maxOdds < 6; maxOdds += 0.1)
    //         {
    //             botConfig.maxOdds = maxOdds;

                for (var bookieID =24; bookieID < 50;  bookieID += 3 )

                {
                    //load data
                    var winEverySeason = true;
                    for(var i=0; i < botConfig.dataSources.length; i++)
                    {                
                        var data = parseCSVFile (botConfig.dataSources [i], bookieID);
                        var emulator = new Emulator (botConfig, data);
                        var profit = emulator.run ();

                        if(profit > biggestProfit.amount)
                        {
                            biggestProfit.amount = profit;
                        //     biggestProfit.ml = maxLosses;
                        //     biggestProfit.mino = minOdds;
                        //     biggestProfit.maxo = maxOdds;
                            biggestProfit.bookie = bookieID;
                        }

                        if(profit < 0){
                            winEverySeason = false;
                        }
                    }

                    if(winEverySeason)
                    {
                        console.log ("------------------------------------------------");
                        console.log ("Wins every time! Keep this config");
                        console.log (botConfig);
                        console.log ("------------------------------------------------");
                    }
                }
    //         }
    //     }  
    // }  

    console.log ("Most profitable strategy in all seasons");
    console.log (biggestProfit);
}

start();