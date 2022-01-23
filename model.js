var sqlite3 = require('sqlite3').verbose()
db = new sqlite3.Database('database')

module.exports = model = {
    createTable: function(){
        db.run("DROP TABLE IF EXISTS corotos");
	    db.run("DROP TABLE IF EXISTS telegram");
        db.run("CREATE TABLE IF NOT EXISTS corotos (id INTEGER PRIMARY KEY AUTOINCREMENT, fecha TEXT, sector TEXT, cantidad_interrupciones INTEGER, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
        db.run("CREATE TABLE IF NOT EXISTS telegram (telegram_id INTEGER PRIMARY KEY UNIQUE , timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
        console.log("La tabla han sido correctamente creada");
    },
    insertTelegramId: function(telegram){
        var stmt = db.prepare("INSERT OR IGNORE INTO telegram VALUES (?,?)");
        stmt.run(telegram.id, this.getTodayDate());
        stmt.finalize();
    },
    getAllTelegramData: function(callback){
        db.all("SELECT * FROM telegram", function(err, rows) {
            if(err)
            {
                throw err;
            }
            else
            {
                callback(null, rows);
            }
        });
    },
    getTodayDate: function(){
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();

        if(dd<10) {
            dd = '0'+dd
        }

        if(mm<10) {
            mm = '0'+mm
        }
        //today = mm + '/' + dd + '/' + yyyy;
        today = yyyy + '-'+ mm + '-' + dd;

        return today;
    }
}