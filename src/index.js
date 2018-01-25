const parse =       require('csv-parse')
const fs =          require ("fs");
const prembot =     require ("../config/prembot");
const Emulator =    require ("./emulator");

const bots = [prembot];

//----------------------------------------------
function DataObject (date, result, odds)
{
    this.date = date;
    this.result = result;
    this.odds = odds;
}

//----------------------------------------------
function getFileList (path, onComplete)
{
    console.assert (path, "Invalid data source");

    var stats = fs.lstatSync (path);

    if (stats.isDirectory)
    {
        var that = this;
        fs.readdir ( path,
            function (err, files) {
                if (err) {
                    console.assert (false, "Invalid data source");
                }
                else {
                    onComplete (files.map (filename => path + "/" + filename));
                }
            }
        );
    }
    else if (stats.isFile){
        console.assert (dataSource.indexOf (".csv")>0, "Invalid data source");
        onCoplete ([path]);
    }
    else {
        onComplete ();
    }
}

//----------------------------------------------
function parseCSVFiles (fileList, onComplete)
{
    var allData = [];
    var loadStack = [];
    for (var f = 0; f < fileList.length; f++)
    {
        var filepath = fileList[f];

        loadStack.push (filepath);

        fs.readFile(filepath, "utf8", function (err, data) {
            if (err) {
                throw err; 
            }
            loadStack.pop ();
            parse (data, function (e, items) {
                //skip first line, this is just header data
                for (var i = 1; i < items.length; i++) {
                    //25 = B365
                    var matchData = items [i];

                    allData.push (new DataObject (matchData [1], matchData [6], matchData [25]));
                }

                if (loadStack.length <= 0){
                    onComplete (allData);
                }
            });
        });
    }
}

//----------------------------------------------
function start () 
{
    //parse each bot config
    for (var i=0; i<bots.length; i++)
    {
        var botConfig = bots[i];

        //load data
        var dataSource = botConfig.dataSource;

        var csvFileList = [];
        
        getFileList (dataSource, function (fileList) {
            if(!fileList){
                console.assert (false, "Invalid data source");
            }

            parseCSVFiles (fileList, function (finalDataObjs)
            {
                var emulator = new Emulator (botConfig, finalDataObjs);
            });
        });
    }
}

start();