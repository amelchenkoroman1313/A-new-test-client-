'use strict';

class GameEnginePVP extends GameEngine 
{
  constructor(room_id, client)
  {
    super(room_id, client);
  }

  process_snapshot(o)
  {
    var me = this

    console.log("process_snapshot backgammon");

    super.process_snapshot(o)
  }

  process_event(o)
  {
    switch(o.type)
    {
      default : super.process_event(o); return
    }
  }

  handle_action(action) 
  {
    switch(action.type)
    {
      case "place_betting"  :  this.client.send(new Package("action", {"type":"place_betting", "place_id":action.data, "bets":{"game":100}}));  return;
      
      case "user_surrender" :  this.client.send(new Package("action", {"type":"user_surrender"}));                                              return;

      default               :  super.handle_action(action);                                                                                     return
    }
  }
}
