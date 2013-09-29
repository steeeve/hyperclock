var Hyperclocks = new Meteor.Collection( 'hyperclocks' );

var Hyperclock = function( data ) {

  if( data ) {
    this._hypercounts = data.hypercounts;
    this._ticking = data.ticking;
    this._started = data.started;
    this._ended = data.ended;
  } else {
    this._hypercounts = [];
    this._people = 2;
    this._ticking = false;
    this._started = null;
    this._ended = null;
  }

};

Hyperclock.prototype = {

  update: function() {
    Hyperclocks.update({
      _id: this._id
    }, {
      $set: {
        hypercounts: this._hypercounts,
        ticking: this._ticking,
        ended: this._ended
      }
    });
  },

  start: function() {
    var self = this;

    this._hypercounts = [];
    this._ticking = true;
    this._started = new Date().getTime();
    this._ended = null;

    Hyperclocks.insert({
      hypercounts: this._hypercounts,
      ticking: this._ticking,
      started: this._started,
      ended: this._ended
    }, function(err, id) {
      self._id = id;
    });
    this.addCounter();
  },

  stop: function() {
    this._ticking = false;
    this._ended = new Date().getTime();
    this.update();
  },

  toggle: function() {
    if( this._ticking ) {
      this.stop();
    } else {
      this.start();
    }
  },

  addCounter: function() {
    this._hypercounts.push({
      people: this._people,
      time: new Date().getTime()
    });
    this.update();
  },

  ticking: function() {
    return this._ticking ? true : false;
  },

  people: function(people) {
    if(people) {
      this._people = parseInt(people, 10);
      if(this._ticking) {
        this.addCounter();
      }
    }
    return this._people;
  },

  log: function(index) {
    if(index in this._hypercounts) {
      return this._hypercounts[index];
    }
    return null;
  },

  hypertime: function() {
    var hypercounts = this._hypercounts;
    var last = hypercounts[ hypercounts.length - 1 ];
    var ended = this._ended ? this._ended : new Date().getTime();
    var total;

    total = hypercounts.map(function(item, index, arr) {
      var nextItem = arr.length > index + 1 ? arr[index + 1] : null;
      return nextItem ? (nextItem.time - item.time) * item.people : 0;
    }).reduce(function (mem, item) {
      return item + mem;
    }, 0);

    total += (ended - last.time)*last.people;

    return total;
  },

  started: function() {
    return this._hypercounts.length > 0 ? new Date(this._hypercounts[0].time) : null;
  },

  time: function() {
    var hypercounts = this._hypercounts;
    var last = hypercounts[ hypercounts.length - 1 ];
    var ended = this._ended ? this._ended : new Date().getTime();
    var actual;

    actual = hypercounts.map(function(item, index, arr) {
      var nextItem = arr.length > index + 1 ? arr[index + 1] : null;
      return nextItem ? nextItem.time - item.time : 0;
    }).reduce(function (mem, item) {
      return item + mem;
    }, 0);

    actual += ended - last.time;

    return actual;
  },

  averagePeople: function() {
    var hypertime = this.hypertime();
    return hypertime !== 0 ? this.hypertime() / this.time() : 0;
  }

};

window.Hyperclock = Hyperclock;
window.Hyperclocks = Hyperclocks;
