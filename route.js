var DB = require('./model.js');

module.exports = function(app)
{
    app.get('/createTable', function(request, response) {
        DB.createTable();
        response.send('Tabla creada satisfactoriamente')
    });
    app.get('/', function(request, response) {
        response.send('Testing Routes')
    });
}
