if (Meteor.isClient) {
  var oneUseUsername = Math.round( new Date().getTime() * Math.random() * 1000 ) + '';
  var oneUsePassword = Math.round( new Date().getTime() * Math.random() * 1000 ) + '';
  var updateTimer = null;

  Session.set( 'ticking', false );
  Session.set( 'hyperclock', 0 );

  Accounts.createUser({
    username: oneUseUsername,
    password: oneUsePassword
  });

  var hyperclock = new Hyperclock();
  var msph = 60*60*1000;

  Template.hyperclocks.helpers({
    hyperclock: function() {
      return Hyperclocks.find({hypercounts: {$not: {$size: 0}}},{ limit: 5, sort: { started: -1 }});
    }
  });

  Template.hyperclock.helpers({
    ago: function() {
      var started = new Hyperclock( this ).started();
      return moment(started).fromNow();
    },
    hypertime: function() {
      var hypertime = new Hyperclock( this ).hypertime();
      return moment(0).from(hypertime, true);
    },
    people: function() {
      var people = Math.ceil(new Hyperclock( this ).averagePeople()),
        suffix = people > 1 ? "people" : "person";

      return people + " " + suffix;
    }
  });

  Template.hyperclockControl.events = {
    'change [data-element="people"]': function (e) {
      hyperclock.people( e.target.value );
    }
  };

  Template.peopleControl.people = function() {
    return hyperclock.people();
  };

  Template.startStopControl.events = {
    'click [data-element="start_stop"]': function () {
      hyperclock.people($('[data-element="people"]').val());
      hyperclock.toggle();
      if( !hyperclock.ticking() ) {
        hyperclock = new Hyperclock();
        Session.set( 'ticking', false );
        clearInterval( updateTimer );
      } else {
        Session.set( 'ticking', true );
        updateTimer = setInterval( updateHyperclock, 500 );
      }
    }
  };

  function updateHyperclock() {
    Session.set( 'hyperclock', hyperclock.hypertime() );
  }

  Template.startStopControl.helpers({
    antiState: function () {
      return Session.get( 'ticking' ) ? 'Stop' : 'Start';
    }
  });

  Template.timeControl.helpers({
    hyperclock: function () {
      var hyperclock = Session.get( 'hyperclock' );
      return hyperclock ? (hyperclock / msph).toFixed( 2 ) : "";
    },
    units: function () {
      var hyperclock = Session.get( 'hyperclock' );
      return hyperclock ? "hrs" : "";
    }
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
