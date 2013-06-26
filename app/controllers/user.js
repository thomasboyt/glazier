import 'glazier/utils/ajax' as ajax;

var UserController = Ember.Controller.extend({
  content: null,
  isLoggedIn: Ember.computed.bool('content'),
  username:  Ember.computed.oneWay('content.github_login'),
  accessToken: null,
  avatarUrl: function(){
    return "https://secure.gravatar.com/avatar/" + this.get('content.gravatar_id');
  }.property('content'),
  githubClientId: function(){
    // TODO: Not this here:
    var key = 'github_client_id';
    return Ember.$('meta[name='+ key + ']').attr('content');
  }.property(),
  exchangeGithubOauthCode: function(authCode){
    var self = this;

    ajax(
      "/api/oauth/github/exchange?code=" + authCode, {
      type: 'post',
    }).then(function(accessToken) {
      self.loginWithGithub(accessToken);
    }).then(null, Conductor.error);
  },
  logout: function() {
    document.cookie = "login=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    this.setCurrentUser(null);
  },
  loginWithGithub: function(githubAccessToken) {
    var self = this;
    return ajax('/api/session.json', {
      type: 'POST',
      data: {
        github_access_token: githubAccessToken
      }
    }).then(function(data){
      self.set('content', data.user);
    }).then(null, Conductor.error);
  },
  setCurrentUser: function (user) {
    var accessToken = null;
    if (user) {
      accessToken = user.github_access_token;
      delete user.github_access_token;
    }
    this.set('content', user);
    this.set('accessToken', accessToken);
  }
});
export = UserController;
