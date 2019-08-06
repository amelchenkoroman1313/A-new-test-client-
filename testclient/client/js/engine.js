'use strict';

class GameEngine 
{
  constructor(room_id, client)
  {
    this.client             = client

    this.process_snapshot   = this.process_snapshot;
    this.process_event      = this.process_event;
    this.process_status     = this.process_status;
    this.process_reconnect  = this.process_reconnect;
    this.process_error      = this.process_error;

    this.player   = null
    this.game     = null
    this.places   = null
    this.users    = null
    this.timers   = null
    this.bets     = null
  }

  run()
  {
    var me   = this; clearInterval(me.i)
        me.i = setInterval(function()
        {
          me.draw_places()
          me.draw_game()
        },
        500)
  }

  handle_connect(o)
  {
    console.log("handle_connect");

    this.client.send(new Package("connect"))
  }

  handle_disconnect(o)
  {
    console.log("handle_disconnect");
  }

  process_snapshot(o)
  {
    console.log("process_snapshot");

    this.places = o.places.list
    this.users  = o.users .list
    this.game   = o.game

    this.timers = []

    for(var i = 0; i < o.timers.length; i++)
    {
      if( o.timers[i].type == "timer_place")
      {
        this.timers.push(o.timers[i])
      }
    }

    this.draw_actions()
    this.run()
  }

  process_event(o)
  {
    switch(o.type)
    {
      case "user_actions" :  

        if( o.user.id == this.client.user_id)
        {
          for(var i = 0; i < this.users.length; i++)
          {
            if( this.users[i].id == this.client.user_id)
            {
                this.users[i].actions = o.user.actions;
            }
          }
        }

        this.draw_actions()

      break;

      case "place_take" :

        for(var i = 0; i < this.places.length; i++)
        {
          if( this.places[i].id == o.place_id)
          {
              this.places[i].owner = o.user.id;
          }
        }

      break;

      case "place_leave" :

        for(var i = 0; i < this.places.length; i++)
        {
          if( this.places[i].id == o.place_id)
          {
              this.places[i].owner = null;
          }
        }

      break

      default: 

        console.log("Unknown event", o.type);
        
      break
    }
  }

  process_status(o)
  {
    if( this.client.package 
    &&  this.client.package.type == "connect" 
    &&  o.code == "OK")
    {
        this.client.send(new Package("snapshot"))
    }
  }

  process_reconnect(o)
  {
    console.log("process_reconnect");
  }

  process_error(o)
  {
    console.log("process_error");
  }

  handle_action(action) 
  {
    switch(action.type)
    {
      case "place_take"   :  this.client.send(new Package("action", {"type":"place_take",     "place_id":action.data})); return;
      case "place_leave"  :  this.client.send(new Package("action", {"type":"place_leave",    "place_id":action.data})); return;
      
      default             :  console.log("Unknown action", action.type);                                                 return;
    }
  }

  draw_places() 
  {
    var me = this

    var ctag  = document.getElementById("c" + this.client.i);

    var body  = ctag.getElementsByTagName('places')[0];
        body.innerHTML   = ""

    var tbl   = document.createElement('table');
        tbl.style.width = '100%';
        tbl.setAttribute('border', '1');

    var tbdy  = document.createElement('tbody');
    var data  = this.places

    for(var i = 0; i < data.length; i++) 
    {
      var td        = document.createElement('td');
          td.width  = "50%"
      var txt = document.createTextNode(data[i].id + " [ " + (data[i].owner ? data[i].owner : "") +  "] ");
      
      td  .appendChild(txt)
      tbdy.appendChild(td)
    }

    tbl.appendChild(tbdy);
    body.appendChild(tbl)
  }

  draw_game() 
  {
    var me = this
  }

  draw_actions() 
  {
    var me = this

    var ctag  = document.getElementById("c" + this.client.i);

    var body  = ctag.getElementsByTagName('actions')[0];
        body.innerHTML   = ""

    var tbl   = document.createElement('table');
    //  tbl.style.width = '100%';
    //  tbl.setAttribute('border', '1');

    var tbdy  = document.createElement('tbody');
    var data  = this.get_allowed_actions()

    for(var i = 0; i < data.length; i++) 
    {
      var tr  = document.createElement('tr');
      var btn = document.createElement("button");
      var act = data[i];

          btn.action_info = act;
          btn.innerHTML   = act.description
          btn.addEventListener ("click", function(e) 
          {
            me.handle_action(e.target.action_info)
          });

      tr  .appendChild(btn)
      tbdy.appendChild(tr)
    }

    tbl.appendChild(tbdy);
    body.appendChild(tbl)
  }

  get_allowed_actions()
  {
    var result = []

    for(var i = 0; i < this.users.length; i++)
    {
      if( this.users[i].id == this.client.user_id)
      {
        for(var j = 0; j < this.users[i].actions.length; j++)
        {
          var input = this.users[i].actions[j]
          var parse = this.parse_allowed_action(input)

          for(var n = 0; n < parse.length; n++)
          {
            result.push(parse[n])
          }
        }
      }
    }

    return result;
  }

  parse_allowed_action(input)
  {
    var actions = []

    switch(input.type)
    {
      case "place_take"     :  
      case "place_leave"    :  
      
        var action              = {}
            action.type         = input.type
            action.data         = input.place_id
            action.description  = input.type + "[" + JSON.stringify(input.place_id) + "]"

        actions.push(action)
      break;

      case "place_betting"  :  
      
        var action              = {}
            action.type         = input.type
            action.data         = input.place_id
            action.description  = input.type + "[" + JSON.stringify(input.place_id) + "]"

        actions.push(action)
      break;

      default               :  

        var action              = {}
            action.type         = input.type
            action.data         = null;
            action.description  = JSON.stringify(input);

        actions.push(action)
      break;
    }

    return actions;
  }
}
