var config = require('./config');
var io = require('socket.io').listen(config.wsPort);
var async = require('async');
var Mysql = require('mysql');
var htmlsafe = require('escape-html');

var mysqlConfig = {
    host: config.mysqlHost,
    user: config.mysqlUser,
    database: config.mysqlDB,
    password: config.mysqlPass
};
var mysql;


io.on('connection', function (socket) {
    socket.on('init', function (data) {
        var sql = 'SELECT * FROM users WHERE sess = ' + mysql.escape(data.phpssid);
        mysql.query(sql, function (error, result)
        {
           if (error || result.length == 0)
           {
               socket.disconnect();

               return ;
           }

            socket.phpssid = data.phpssid;
            socket.user = result[0];
        });
    });

    socket.on('create item', function (data) {
        data.price = parseFloat(data.price);
        if ( ( ! isFloat(data.price) && ! isInteger(data.price)) || data.price < 0) {
            socket.emit('create item error', {
                message: 'Вы некорректно заполнили поле "Цена"'
            });

            return;
        }

        if ( ! data.title)
        {
            socket.emit('create item error', {
                message: 'Заполните поле "Название"'
            });

            return;
        }

        data.title = htmlsafe(data.title);
        var sql = 'INSERT INTO items SET title=' + mysql.escape(data.title) + ', price = ' + mysql.escape(data.price) + ', creatorId = ' + mysql.escape(socket.user.id);
        mysql.query(sql, function (error, result)
        {
            if (error)
            {
                console.log(error);
                socket.emit('create item error', {
                    message: 'Неизвестная ошибка при добавлении!'
                });

                return ;
            }

            socket.emit('create item success');
            var sockets = Object.keys(io.sockets.connected);
            async.each(sockets, function(socketId, nextSocket)
            {
                nextSocket();
                var sock = io.sockets.connected[socketId];
                sock.emit('create item', {
                    id: result.insertId,
                    price: data.price,
                    title: data.title,
                    phpssid: socket.phpssid
                });
            });
        });
    });

    socket.on('buy item', function(data)
    {
        var sql = 'SELECT * FROM items WHERE id = ' + mysql.escape(data.id);
        mysql.query(sql, function (error, item)
        {
            if (error)
            {
                socket.emit('buy error', {
                    message: 'Неизвестная ошибка'
                });

                console.log(sql, error);

                return ;
            }

            if (item.length == 0)
            {
                socket.emit('buy error', {
                    message: 'Товар не найден'
                });

                return ;
            }

            item = item[0];

            if ( ! item.isPublic)
            {
                socket.emit('buy error', {
                    message: 'Извините, товар уже куплен другим человеком!'
                });

                return ;
            }

            if (item.sess == socket.phpssid)
            {
                socket.emit('buy error', {
                    message: 'Нельзя покупать свои же товары'
                });

                return ;
            }

            if (item.price > socket.user.balance)
            {
                socket.emit('buy error', {
                    message: 'Недостаточно средств на счету для совершения покупки'
                });

                return ;
            }

            var sql = 'SELECT * FROM users WHERE id = ' + item.creatorId;
            mysql.query(sql, function(error, seller)
            {
                if (error)
                {
                    socket.emit('buy error', {
                        message: 'Неизвестная ошибка'
                    });
                    console.log(sql, error);

                    return ;
                }

                if (seller.length == 0)
                {
                    socket.emit('buy error', {
                        message: 'Не найден продавец'
                    });

                    return ;
                }

                seller = seller[0];

                async.waterfall([
                    function (cb)
                    {
                        var sql = 'UPDATE items SET isPublic = 0 WHERE id = ' + mysql.escape(item.id);
                        mysql.query(sql, function (error, result)
                        {
                            if ( ! error)
                            {
                                cb()
                            }
                        })
                    },
                    function (cb)
                    {
                        var sql = 'UPDATE users SET balance = balance - ' + mysql.escape(item.price) + ' WHERE id = ' + mysql.escape(socket.user.id);
                        mysql.query(sql, function (error)
                        {
                            if ( ! error)
                            {
                                cb()
                            }
                        })
                    },
                    function ()
                    {
                        var sql = 'UPDATE users SET balance = balance + ' + mysql.escape(item.price) + ' WHERE id = ' + mysql.escape(seller.id);
                        mysql.query(sql, function ()
                        {
                            socket.user.balance -= item.price;
                            socket.emit('buy success', {
                                balance: socket.user.balance
                            });

                            var sockets = Object.keys(io.sockets.connected);
                            async.each(sockets, function(socketId, nextSocket)
                            {
                                nextSocket();
                                var sock = io.sockets.connected[socketId];
                                sock.emit('delete item', {
                                    id: item.id
                                });

                                if (sock.user.id == seller.id)
                                {
                                    sock.user.balance += item.price;
                                    sock.emit('buy your item', {
                                        balance: sock.user.balance
                                    });
                                }
                            })
                        })
                    }
                ])
            })

        })
    });

    socket.on('disconnect', function () {
        console.log('disconnect');
    });

});

mysqlConnect();


function mysqlConnect() {
    mysql = Mysql.createConnection(mysqlConfig);

    mysql.connect(function (err) {
        if (err) {
            console.log('error connecting to mysql: ' + err.stack);
            setTimeout(mysqlConnect, 1000);
        }

        // try to keep connection up
        setInterval(function () {
            if ((typeof mysql == 'object') && ('ping' in mysql))
                mysql.ping(function () {
                });
        }, 30000);
    });

    mysql.on('error', function (err) {
        if (err.code == 'PROTOCOL_CONNECTION_LOST') {
            mysqlConnect();
        } else {
            throw err;
        }
    });
}

function isFloat(n) {
    return n === +n && n !== (n | 0);
}

function isInteger(n) {
    return n === +n && n === (n | 0);
}
