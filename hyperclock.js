var Hyperclock = function() {
  this.id = new Date().getTime();
  Session.set(this.id, {});
  this.reset();
};

Hyperclock.prototype = {

  set: function( property, value ) {
    var _ = Session.get(this.id);
    _[property] = value;
    Session.set(this.id, _);
  },

  get: function( property ) {
    return Session.get(this.id)[property];
  },

  start: function() {
    this.set('d0', new Date().getTime());
    var hypercounts = this.get('hypercounts');
    hypercounts.push({
      people: this.get('people'),
      duration: 0
    });
    this.set('hypercounts', hypercounts);
    this.set('ticking', setInterval(this.tick.bind(this), 100));
  },

  stop: function() {
    clearInterval(this.get('ticking'));
    this.set('ticking', null);
    this.tick();
  },

  restart: function() {
    this.stop();
    this.start();
  },

  toggle: function() {
    if(this.get('ticking')) {
      this.stop();
    } else {
      this.start();
    }
  },

  reset: function() {
    this.set('hypercounts', []);
    this.set('people', 1);
    clearInterval(this.get('ticking'));
    this.set('ticking', null);
  },

  ticking: function() {
    return this.get('ticking') ? true : false;
  },

  people: function( people ) {
    if( people ) {
      this.set('people', people);
      if( this.get('ticking') ) {
        this.restart();
      }
    }
    return this.get('people');
  },

  time: function() {
    return this.get("hypercounts").reduce(function (mem, count) {
      return (count.people * count.duration) + mem;
    }, 0) / (60 * 60 * 1000);
  },

  tick: function() {
    var hypercounts = this.get("hypercounts");

    hypercounts[ hypercounts.length - 1 ].duration = new Date().getTime() - this.get("d0");

    this.set('hypercounts', hypercounts);
  }
};

if (Meteor.isClient) {
  var hyperclock = new Hyperclock( Template.hyperclock );
  var people = Session.get("people") || 1;

  Template.hyperclock.events = {
    'change [data-element="people"]' : function (thing) {
      hyperclock.people( thing.target.value );
      Session.set("people", people);
    }
  };

  Template.people.people = function() {
    return people;
  };

  Template.startStop.events = {
    'click [data-element="start_stop"]' : function () {
      hyperclock.toggle();
    }
  };

  Template.startStop.antiState = function () {
    return hyperclock.ticking() ? 'Stop' : 'Start';
  };

  Template.time.hyperclock = function () {
    var time = hyperclock.time();

    return time > 0 ? time.toFixed(2) : "";
  };

  Template.time.units = function () {
    var time = hyperclock.time();

    return time > 0 ? "hrs" : "";
  };

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
