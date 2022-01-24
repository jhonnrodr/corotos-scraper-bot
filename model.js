var sqlite3 = require('sqlite3').verbose()
db = new sqlite3.Database('database.sqlite')

module.exports = model = {
    createTable: function(){
        ("DROP TABLE IF EXISTS corotos");
	    db.run("DROP TABLE IF EXISTS telegram");
        db.run("CREATE TABLE IF NOT EXISTS corotos (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT, last_listing TEXT NULL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
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
    getAllCorotos: function(callback){
        db.all("SELECT * FROM corotos", function(err, rows) {
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
    insertRecord: function(data){
        var stmt = db.prepare("INSERT INTO corotos VALUES (?,?,?,?)");
        stmt.run(
            null,
            data.url,
            null, 
            this.getTodayDate()
            );
	    stmt.finalize();
        console.log("Se ha insertado un nuevo registro");
    },
    saveLastRecord: function(id, data){
        var inputData = [data, id];
        db.run( "UPDATE corotos SET last_listing = ? WHERE id = ?", inputData, function(err,rows) {
            console.log("Se ha actualizado un registro");
        })
    },
    getLastListing: function(id, callback){
        return new Promise((resolve, reject) => {
            var query = "SELECT * FROM corotos WHERE id = " + id ;
            db.get(query, function(err, rows) {
                if (err) reject(err);
                resolve(rows.last_listing);
            });
        })
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