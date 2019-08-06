'use strict';

var url_api   = "http://localhost:38080/api/" //"http://lff.rs/go-hub1-api/"
var url_ws    = "ws://lff.rs/go-hub1-ws-bot/"

class Package
{
  constructor(type, data)
  {
    this["type"]	= type;
    this["data"]	= data;
  }
}

var Client = function(i, room_id, game_id, user_id) 
{
  this.i        = i
  this.status   = "none" // "connecting" / "connected" / "disconnected"
  this.package  = null

  this.room_id  = room_id;
  this.game_id  = game_id;
  this.user_id  = user_id;

  var me    = this

  setTimeout(function()
  {
    var ctag  = document.getElementById("c" + me.i);

    var body  = ctag.getElementsByTagName('control')[0];
        body.innerHTML   = ""

    var tbl   = document.createElement('table');
    //    tbl.style.width = '100%';
    //    tbl.setAttribute('border', '1');

    var tbdy  = document.createElement('tbody');

    {
      var td  = document.createElement('td');
      var btn = document.createElement("button");
          btn.innerHTML = "connect"
          btn.addEventListener ("click", function(e) 
          {
            me.send(new Package("connect"))
          });

      td  .appendChild(btn)
      tbdy.appendChild(td)
    }
    {
      var td  = document.createElement('td');
      var btn = document.createElement("button");
          btn.innerHTML = "snapshot"
          btn.addEventListener ("click", function(e) 
          {
            me.send(new Package("snapshot"))
          });

      td  .appendChild(btn)
      tbdy.appendChild(td)
    }

    tbl.appendChild(tbdy);
    body.appendChild(tbl)

    {
      var txt  = document.getElementById("o" + me.i);
      var btn  = document.getElementById("s" + me.i);
          btn.addEventListener ("click", function(e) 
          {
            me.sendText(txt.value)
          });
    }
  },
  100)
}

Client.prototype.init_connection = function()
{
  var me   = this;
  var txt  = document.getElementById("i" + me.i);

  this.socket             = new WebSocket(url_ws + '?roomId=' + this.room_id + '&botId=' + this.user_id)
  this.socket.onopen      = function(e) 
                            {
                              me.status = "connected"
                            }
  this.socket.onclose     = function(event)
                            {
                              me.status = "disconnected"
                            };
  this.socket.onerror     = function(error)
                            {
                              console.log("socket_error");
                            };
  this.socket.onmessage   = function(error)
                            {
                              try
                              {
                                this.reader         = new FileReader();
                                this.reader.onload  = function(e) 
                                                      { 
                                                        txt.append(e.currentTarget.result)
                                                        txt.append('\n------------\n')

                                                        var o  = JSON.parse(e.currentTarget.result)
                                                        if( o != null)
                                                        {
                                                          switch(o.type)
                                                          {
                                                            case "snapshot" : me.engine.process_snapshot  (o.data);               break;
                                                            case "event"    : me.engine.process_event     (o.data);               break;
                                                            case "status"   : me.engine.process_status    (o.data); 
                                                                              me.package = null;                                  break;
                                                            case "reconnect": me.engine.process_reconnect (o.data);               break;
                                                            case "error"    : me.engine.process_error     (o.data);               break;
                                                          }
                                                        }
                                                      } 

                                this.reader.readAsText(event.data);
                              }
                              catch(err)
                              {
                                console.log("error:", err);
                              }
                            };

  this.engine = new GameEngineBackgammon(this.room_id, this);
}

Client.prototype.check_status = function()
{
  var me = this;

  switch(this.status)
  {
    case "none":
    {
      this.init_connection()
    }

    case "connected":
    {
      this.engine.handle_connect();
    }

    case "disconnected":
    {

    }
  }

  setTimeout(this.check_status, 3000);
}

Client.prototype.send = function(data)
{
  var me    = this;

  var ctag  = document.getElementById("o" + me.i);
      ctag.value = JSON.stringify(data)

  setTimeout(function()
  {
    if( me.package == null)
    {
        me.package = data
        me.socket.send(JSON.stringify(data))
    }
    else
    {
      console.log("client is busy / wait package status")
    }
  },
  500)
}

Client.prototype.sendText = function(data)
{
  var me    = this;

  setTimeout(function()
  {
      me.socket.send(data)
  },
  500)
}