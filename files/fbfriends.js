// Generated by CoffeeScript 1.4.0
(function() {

  (function(jQuery) {
    var $, FbFriends, defaults, fields;
    $ = jQuery;
    fields = ['name', 'id', 'picture', 'first_name', 'last_name'];
    defaults = {
      multiple: false,
      whenDone: function(friends) {
        return console.log(friends);
      },
      friendChecked: null,
      friendUnchecked: null,
      shower: function(element) {},
      hider: function(element) {},
      immediate: true,
      initialize: false,
      login: true,
      fb: {
        appId: null,
        channelUrl: null,
        status: true,
        cookie: true,
        xfbml: false
      },
      afterLogin: null
    };
    FbFriends = (function() {

      function FbFriends(element, options) {
        var _this = this;
        this.options = options;
        this.element = $(element);
        this.afterLogin = this.options.afterLogin;
        this.element.data('fbFriends', this);
        this.element.addClass('fbFriends');
        this.element.on('click', '.fbFriends-friend', function(event) {
          return _this.handleClick(event.target);
        });
      }

      FbFriends.prototype.show = function() {
        var _this = this;
        return this.initialize(function(err) {
          _this.selected = {};
          return _this.login(function(err) {
            var ajaxLoader, header, processResponse;
            _this.options.shower(_this.element);
            _this.element.empty();
            header = $('<div>').addClass('fbFriends-header').appendTo(_this.element);
            $('<input>').attr('type', 'text').attr('placeholder', 'Search').addClass('fbFriends-search').keyup(function(event) {
              var friends, matched, text;
              friends = $('.fbFriends-friend', _this.element);
              text = $(event.target).val().toLowerCase();
              if (text === '') {
                return friends.show();
              } else {
                matched = friends.filter("[data-first-name^='" + text + "'], [data-last-name^='" + text + "']");
                matched.show();
                return friends.not(matched).hide();
              }
            }).appendTo(header);
            ajaxLoader = $('<div>').addClass('fbFriends-spinner').appendTo(_this.element);
            if (err) {
              return $('<div>').addClass('fbFriends-error').text("There's been an error processing your login. Please make sure you're logged into Facebook and try again.").appendTo(_this.element);
            } else {
              processResponse = function(response) {
                ajaxLoader.hide();
                if (response.error) {
                  return $('<div>').addClass('fbFriends-error').text("There's been an error retrieving your friends. Please reload the page and try again.").appendTo(_this.element);
                } else {
                  _this.element.toggleClass('single', _this.options.single);
                  _this.element.toggleClass('multiple', !_this.options.single);
                  response.data.forEach(function(friend) {
                    var friendDiv;
                    friendDiv = $('<div>').addClass('fbFriends-friend');
                    if (_this.options.multiple) {
                      $('<input>').attr('type', 'checkbox').appendTo(friendDiv);
                    }
                    $('<img>').attr('src', friend.picture.data.url).appendTo(friendDiv);
                    $('<span>').addClass('fbFriends-name').text(friend.name).appendTo(friendDiv);
                    friendDiv.data('id', friend.id).data('name', friend.name).data('picture', friend.picture.data.url).attr('data-first-name', friend.first_name.toLowerCase()).attr('data-last-name', friend.last_name.toLowerCase());
                    return _this.element.append(friendDiv);
                  });
                  if (response.paging && response.paging.next) {
                    return FB.api(response.paging.next, processResponse);
                  }
                }
              };
              return FB.api("/me/friends?fields=" + (fields.join(',')), processResponse);
            }
          });
        });
      };

      FbFriends.prototype.cancel = function() {
        return this.options.hider(this.element);
      };

      FbFriends.prototype.submit = function() {
        var key, val;
        if (this.options.multiple) {
          this.options.whenDone((function() {
            var _ref, _results;
            _ref = this.selected;
            _results = [];
            for (key in _ref) {
              val = _ref[key];
              _results.push(val);
            }
            return _results;
          }).call(this));
          return this.options.hider(this.element);
        }
      };

      FbFriends.prototype.handleClick = function(item) {
        var $item, data;
        $item = $(item);
        window.lastItem = $(item);
        if (!$item.hasClass('fbFriends-friend')) {
          $item = $item.parents('.fbFriends-friend');
        }
        data = {
          id: $item.data('id'),
          name: $item.data('name'),
          picture: $item.data('picture')
        };
        if (this.options.multiple) {
          if (this.selected[data.id]) {
            delete this.selected[data.id];
            $(item).find("input[type=checkbox]").attr('checked', false);
            if (this.options.friendUnchecked) {
              return this.options.friendUnchecked(data);
            }
          } else {
            this.selected[data.id] = data;
            $(item).find("input[type=checkbox]").attr('checked', true);
            if (this.options.friendChecked) {
              return this.options.friendChecked(data);
            }
          }
        } else {
          this.options.whenDone([data]);
          return this.options.hider(this.element);
        }
      };

      FbFriends.prototype.initialize = function(after) {
        var _this = this;
        if (this.options.initialize && !this.initialized) {
          this.initialized = true;
          FB.Event.subscribe('auth.statusChange', function(response) {
            var err;
            _this.loggedIn = response.status === 'connected';
            err = _this.loggedIn ? null : 'Login failure';
            if (_this.afterLogin) {
              return _this.afterLogin(err, response.authResponse);
            }
          });
          FB.init(this.options.fb);
          if (this.options.fb.status) {
            return FB.getLoginStatus(function(response) {
              return after();
            });
          } else {
            return after();
          }
        } else {
          return after();
        }
      };

      FbFriends.prototype.login = function(after) {
        var _this = this;
        if ((this.options.login || this.options.initialize) && !this.loggedIn) {
          return FB.login(function(response) {
            var err;
            if (response.authResponse && response.status === 'connected') {
              _this.loggedIn = true;
              return after();
            } else {
              err = "User didn't log in.";
              if (_this.afterLogin) {
                _this.afterLogin(err);
              }
              return after(err);
            }
          });
        } else {
          this.loggedIn = true;
          return after();
        }
      };

      FbFriends.prototype.logout = function() {
        if (this.loggedIn) {
          this.loggedIn = false;
          return FB.logout();
        }
      };

      return FbFriends;

    })();
    return $.fn.fbFriends = function(input) {
      return this.each(function() {
        var $this, fbFriends, options;
        $this = $(this);
        fbFriends = $this.data('fbFriends');
        if (!fbFriends) {
          options = typeof input === 'object' ? $.extend(true, {}, defaults, input) : defaults;
          fbFriends = new FbFriends($this, options);
        }
        if (typeof input === 'string') {
          return fbFriends[input]();
        } else {
          if (fbFriends.options.immediate) {
            return fbFriends.show();
          }
        }
      });
    };
  })(jQuery);

}).call(this);
