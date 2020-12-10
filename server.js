var express = require("express")
var app = express()
var hbs = require('express-handlebars');
var path = require("path")
const PORT = process.env.PORT || 3000;
const seasons = 2;
var Registry = [{login: "Kasza", password: "12345"}];
var LoggedIn = [];

app.set('views', path.join(__dirname, 'views'));         // ustalamy katalog views
app.engine('hbs', hbs({ defaultLayout: 'main.hbs' }));   // domyślny layout, potem można go zmienić
app.set('view engine', 'hbs');                           // określenie nazwy silnika szablonów

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded());

app.use(express.json());

function checkLogin(login, password)
{
    var isCorrect = false
    for(var i=0; i<Registry.length; i++)
    {
        if(Registry[i].login==login && Registry[i].password==password) isCorrect=true
    }
    //console.log(isCorrect)
    return isCorrect
}

function isLoggedIn(IP)
{
    var isLogged = false
    for(var i=0; i<LoggedIn.length; i++)
    {
        if(LoggedIn[i]==IP) isLogged=true
    }
    return isLogged
}

function scoresTableGenerate(season)
{
    var scoresTable 
    if(season=="season1") 
    {
        scoresTable= [
        [ '5 listopada 2020', 'Kasza', 'Szpila', 'Kozik'],
        [ '6 listopada 2020', 'Kozik', 'Szpila', 'Kasza'],
        [ '7 listopada 2020', 'Szpila', 'Kozik', 'Kasza'],
        [ '8 listopada 2020', 'Kasza', 'Kozik', 'Szpila'],
        [ '9 listopada 2020', 'Kozik', 'Szpila', 'Kasza'],
        [ '10 listopada 2020', 'Szpila', 'Kasza', 'Kozik'],
        [ '11 listopada 2020', 'Kasza', 'Kozik', 'Szpila'],
        [ '12 listopada 2020', 'Szpila', 'Kozik', 'Kasza'],
        [ '13 listopada 2020', 'Kasza', 'Kozik', 'Szpila'],
        [ '14 listopada 2020', 'Szpila', 'Kasza', 'Kozik'],
        [ '15 listopada 2020', 'Szpila', 'Kozik', 'Kasza'],
        [ '18 listopada 2020', 'Kasza', 'Szpila', 'Kozik'],
        [ '19 listopada 2020', 'Kasza', 'Szpila', 'Kozik'],
        [ '20 listopada 2020', 'Kozik', 'Kasza', 'Szpila'],
        [ '21 listopada 2020', 'Szpila', 'Kasza', 'Kozik'],
        [ '22 listopada 2020', 'Szpila', 'Kozik', 'Kasza'],
        [ '23 listopada 2020', 'Szpila', 'Kasza', 'Kozik'],
        [ '24 listopada 2020', 'Kasza', 'Szpila', 'Kozik'],
        [ '25 listopada 2020', 'Kozik', 'Kasza', 'Szpila'],
        [ '26 listopada 2020', 'Kozik', 'Szpila', 'Kasza']
      ]
    }
      if(season=="season2") 
      {
          scoresTable = [
            [ '1 grudnia 2020', 'Kasza', 'Kozik', 'Szpila'],
            [ '2 grudnia 2020', 'Kasza', 'Szpila', 'Kozik'],
            [ '3 grudnia 2020', 'Szpila', 'Kasza', 'Kozik'],
            [ '4 grudnia 2020', 'Kasza', 'Kozik', 'Szpila'],
            [ '5 grudnia 2020', 'Szpila', 'Kasza', 'Kozik'],
            [ '7 grudnia 2020', 'Kozik', 'Szpila', 'Kasza'],
            [ '8 grudnia 2020', 'Kozik', 'Kasza', 'Szpila'],
            [ '9 grudnia 2020', 'Kasza', 'Kozik', 'Szpila'],
            [ '10 grudnia 2020', 'Kasza', 'Szpila', 'Kozik']
          ]
      }
    /*var scoresTable = [];
    var data = fs.readFileSync(fileName, "utf-8")
    data = data.replace(/(?:\r)+/g, "")
    scoresTable = data.split("\n");*/
    for(var i=0; i<scoresTable.length; i++)
    {
      scoresTable[i].id=i%2;
    }
    console.log(scoresTable)
    return scoresTable;
}

function winnersGenerate(scoresTable)
{
    var players = [];
    for(var i=1; i<scoresTable[0].length; i++)
    {
        var playerName = scoresTable[0][i];
        players.push({name: playerName, points: 0});
    }
    for(var i=0; i<scoresTable.length; i++)
    {
        for(var j=1; j<scoresTable[i].length; j++)
        {
            for(var k=0; k<players.length; k++)
            {
                if(players[k].name==scoresTable[i][j]) players[k].points+=120-(j*20)
            }
        }
    }
    players.sort(function(a, b){
        return a.points - b.points;
    })
    players.reverse()
    players[0].place = 1
    for(var i=1; i<players.length; i++)
    {
        if(players[i].points==players[i-1].points) players[i].place=players[i-1].place
        else players[i].place=players[i-1].place+1;
    }
    return players;
}

function handleSeasons(req, res, season)
{
    var scoresTable = scoresTableGenerate(season);
    var ranking = winnersGenerate(scoresTable);
    context = {scores: scoresTable, ranking: ranking}
    res.render("index.hbs", context)
}

app.get("/", function(req, res){
    handleSeasons(req, res, "season1")
})

app.get("/season1", function(req, res){
    handleSeasons(req, res, "season1")
})

app.get("/season2", function(req, res){
    handleSeasons(req, res, "season2")
})

app.get("/admin", function(req, res){
    if(isLoggedIn(req.ip))
    {
        var scoresTable = scoresTableGenerate("season"+seasons+".txt");
        var context = {scores: scoresTable}
        res.render("form.hbs", context)
    }
    else res.sendFile(path.join(__dirname + "/public/html/login.html"))
})

app.post("/admin", function(req, res){
    if(checkLogin(req.body.login, req.body.password))
    {
        var scoresTable = scoresTableGenerate("season"+seasons+".txt");
        var context = {scores: scoresTable}
        res.render("form.hbs", context)
        LoggedIn.push(req.ip)
    }
    else if(isLoggedIn(req.ip)&&req.body.adminOption)
    {
        var scoresTable = scoresTableGenerate("season"+seasons+".txt");
        console.log(req.body.adminOption)
        if(req.body.adminOption=="add")
        {
            var newRecord = [req.body.date, req.body.place1, req.body.place2, req.body.place3]
            scoresTable.push(newRecord)
            console.log(scoresTable)
            var context = {scores: scoresTable}
            res.render("form.hbs", context)
        }
        if(req.body.adminOption=="delete")
        {
            var recordsToDelete = []
            console.log(req.body)
        }
    }
    else if(isLoggedIn(req.ip))
    {
        var scoresTable = scoresTableGenerate("season"+seasons+".txt");
        var context = {scores: scoresTable}
        res.render("form.hbs", context)
    }
    else
    {
        res.sendFile(path.join(__dirname + "/public/html/login.html"))
    }
})

app.listen(PORT, function () { 
    console.log("reading file: start serwera na porcie " + PORT )
})