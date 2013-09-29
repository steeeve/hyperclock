var Hyperclocks = new Meteor.Collection( 'hyperclocks' );

Hyperclocks.allow({
  insert: function (userId, doc) {
    doc.owner = userId;
    return !!userId;
  },
  update: function (userId, doc, fields, modifier) {
    // can only change your own documents
    return doc.owner === userId;
  },
  remove: function (userId, doc) {
    // can only remove your own documents
    return false;
  }
});
