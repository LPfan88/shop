$(document).ready(function () {
    socket = io.connect('localhost:2020');
    socket.on('connect', function () {
        //enable buttons on WS connect
        $('.btn').prop('disabled', false);
        socket.emit('init', {
            phpssid: phpssid
        })
    });

    socket.on('disconnect', function () {
        //disable buttons on disconnect
        $('.btn').prop('disabled', true);
    });

    socket.on('create item error', function (data) {
        alert(data.message);
    });

    socket.on('create item success', function () {
        $('#modal-create-item').modal('hide');
        alert('Товар успешно добавлен!');
    });

    socket.on('create item', function(data)
    {
        var html = '<div class="item col-xs-4 text-center" data-id="' + data.id + '">' + data.title +
            '<br/>' +
            '<span class="price">' + data.price.toFixed(2) + ' руб.</span><br/>';
        if (data.phpssid != phpssid)
        {
            html += '<button class="btn btn-default buy" type="button">Купить</button>';
        }

        html += '</div>';
        html = $(html);
        if ($('.item').get().length == 0)
        {
            $('#items').empty();
        }

        $('#items').append(html);

        //Bind new buttons
        bindBuy(html.find('.buy'))
    });

    socket.on('buy success', function(data)
    {
        alert('Покупка совершена!');
        $('#balance').text(data.balance.toFixed(2));
    });

    socket.on('buy your item', function(data)
    {
        alert('Купили Ваш товар!');
        $('#balance').text(data.balance.toFixed(2));
    });

    socket.on('buy error', function(data)
    {
        alert(data.message);
    });

    socket.on('delete item', function(data)
    {
        $('.item[data-id="' + data.id + '"]').remove();
        if ($('#items').html() == '')
        {
            $('#items').html('<div class="col-xs-12"><h3>Товаров не добавлено. Будьте первым!</h3></div>');
        }
    });

    $('#modal-create-item').on('show.bs.modal', function()
    {
        $('#price').val('');
        $('#title').val('');
    });

    $('#create-item').click(function () {
        $('#modal-create-item').modal('show');
    });

    $('#create-item-save').click(function () {
        socket.emit('create item', {
            price: $('#price').val(),
            title: $('#title').val()
        })
    });

    $.each($('.buy'), function () {
        bindBuy(this);
    });
});

function bindBuy(obj)
{
    $(obj).click(function()
    {
        if (confirm('Вы действительно хотите купить этот товар?'))
        {
            socket.emit('buy item', {
                id: $(obj).parent().data('id')
            });
        }
    })
}