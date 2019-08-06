'use strict';

class GameEngineBackgammon extends GameEnginePVP 
{
  constructor(room_id, client)
  {
    super(room_id, client);

    this.cells          = 
    [
      "p01",	"p02",	"p03",	"p04",	"p05",	"p06",
      "p07",	"p08",	"p09",	"p10",	"p11",	"p12",
      "p13",	"p14",	"p15",	"p16",	"p17",	"p18",
      "p19",	"p20",	"p21",	"p22",	"p23",	"p24",
    ]

    this.moves_tmp      = 
    [

    ]
  }

  process_snapshot(o)
  {
    var me                = this

    super.process_snapshot(o)

    if( me.game           == null)
        me.game           = {}

    if( me.game.turn_info == null)
        me.game.turn_info = {}
  }

  process_event(o)
  {
    switch(o.type)
    {
      case "game_setup"    :

        this.game.turn_info.board = o.game.board

      break;

      case "game_roll_dices"    :

        this.game.turn_info.dices = o.dices
        this.moves_tmp            = []

      break;

      case "game_move"          :

        var steps = o.steps.split(",")

                  if( this.game.turn_info.board[steps[0]])
        var value =   this.game.turn_info.board[steps[0]]     .pop() 

        if(!this.game.turn_info.board[steps[steps.length - 1]])
            this.game.turn_info.board[steps[steps.length - 1]] = []

            this.game.turn_info.board[steps[steps.length - 1]].push(value)

        this.moves_tmp.push(o.steps)

      break;

      case "game_move_undo"     :

        while(this.moves_tmp.length > 0)
        {
          var undo = this.moves_tmp.pop().split(",")

                    if( this.game.turn_info.board[undo[undo.length - 1]])
          var value =   this.game.turn_info.board[undo[undo.length - 1]]     .pop() 
  
          if(!this.game.turn_info.board[undo[0]])
              this.game.turn_info.board[undo[0]] = []
  
              this.game.turn_info.board[undo[0]].push(value)
        }

      break;

      default                   : super.process_event(o); return
    }
  }

  handle_action(action) 
  {
    switch(action.type)
    {
      case "game_move"          : this.client.send(new Package("action", {"type":"game_move",         "steps":action.data.steps})); return;
      case "game_move_confirm"  : this.client.send(new Package("action", {"type":"game_move_confirm"}));                            return;
      case "game_move_undo"     : this.client.send(new Package("action", {"type":"game_move_undo"}));                               return;
      default                   : super.handle_action(action);                                                                      return;
    }
  }

  draw_game() 
  {
    var me = this

    var ctag  = document.getElementById("c" + this.client.i);

    var body  = ctag.getElementsByTagName('game')[0];
        body.innerHTML   = ""

    var tbl   = document.createElement('table');
        tbl.style.width = '100%';
        tbl.setAttribute('border', '1');

    var tr1    = document.createElement('tr');
    var tr2    = document.createElement('tr');

    for(var i = 11; i >= 0; i--)
		{
      var data        = "";
      var color_back  = "gray"
      var color_text  = "white"

      if( this.game
      &&  this.game.turn_info
      &&  this.game.turn_info.board
      &&  this.game.turn_info.board[me.cells[i]]
      &&  this.game.turn_info.board[me.cells[i]].length > 0)
      {
          data  =  this.game.turn_info.board[me.cells[i]].length
               if( this.game.turn_info.board[me.cells[i]].length > 0)
               {
                  if( this.game.turn_info.board[me.cells[i]][0] == "Black")
                  {
                    color_back = "black"
                    color_text = "white" 
                  }

                  if( this.game.turn_info.board[me.cells[i]][0] == "White")
                  {
                    color_back = "white"
                    color_text = "black" 
                  }
               }
      }

      var td  = document.createElement('td');
          td.style.backgroundColor  = color_back;
          td.style.color            = color_text;
          td.innerHTML = `<p>` + me.cells[i] + `</p>` + data

      tr1.appendChild(td)
    }

    for(var i = 12; i < 24; i++)
		{
      var data        = "";
      var color_back  = "gray"
      var color_text  = "white"

      if( this.game
      &&  this.game.turn_info
      &&  this.game.turn_info.board
      &&  this.game.turn_info.board[me.cells[i]])
      {
          data  =  this.game.turn_info.board[me.cells[i]].length
               if( this.game.turn_info.board[me.cells[i]].length > 0)
               {
                  if( this.game.turn_info.board[me.cells[i]][0] == "Black")
                  {
                    color_back = "black"
                    color_text = "white" 
                  }

                  if( this.game.turn_info.board[me.cells[i]][0] == "White")
                  {
                    color_back = "white"
                    color_text = "black" 
                  }
               }
      }

      var td  = document.createElement('td');
          td.style.backgroundColor  = color_back;
          td.style.color            = color_text;
          td.innerHTML = `<p>` + me.cells[i] + `</p>` + data

      tr2.appendChild(td)
    }

    tbl.appendChild(tr1);
    tbl.appendChild(tr2);

    if( this.game
      &&  this.game.turn_info
      &&  this.game.turn_info.dices)
      {
        var dices = document.createTextNode(JSON.stringify(this.game.turn_info.dices))
        body.appendChild(dices)
      }

    body.appendChild(tbl)
  }

  parse_allowed_action(input)
  {
    var actions = []

    switch(input.type)
    {
      case "game_move"            :  
      
        for(var steps in input.info) 
        {
          var action              = {}
              action.type         = input.type
              action.data         = {"place_id":input.place_id, "steps":steps}
              action.description  = input.type + "[" + steps + "]"

          actions.push(action)
        }
       
      break;

      case "game_move_confirm"    :  
      
          var action              = {}
              action.type         = input.type
              action.data         = {"place_id":input.place_id}
              action.description  = input.type

          actions.push(action)
       
      break;

      case "game_move_undo"       :  
      
          var action              = {}
              action.type         = input.type
              action.data         = {"place_id":input.place_id}
              action.description  = input.type

          actions.push(action)
       
      break;

      default                     :  

        actions = super.parse_allowed_action(input)

      break;
    }

    return actions;
  }
}