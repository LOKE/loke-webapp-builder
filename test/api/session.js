var authorized = true;

function getSession() {
  return {
    authorize: function() {
      if (!authorized) throw new Error('You shall not pass');
    }
  };
}

module.exports = {
  getSession: getSession,
  setAuthorized: function(isAuthed) {
    authorized = isAuthed;
  }
};
