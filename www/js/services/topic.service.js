'use strict';

/**
 * @ngdoc function
 * @name cnodejs.services:TopicService
 * @description
 * # TopicService
 * Topic Service of the cnodejs app
 */

angular.module('starter.services')
.factory('Topic', function(ENV, $resource, $log, $q, User, Setting) {
  var api = ENV.domain + ENV.api;
  var topic;
  var resource =  $resource(api + '/topic/:id', {
    id: '@id',
  }, {
    reply: {
      method: 'post',
      url: api + '/topic/:topicId/replies'
    },
    upReply: {
      method: 'post',
      url: api + '/reply/:replyId/ups'
    }
  });
  return {
    getById: function(id) {
      if (topic !== undefined && topic.id === id) {
        var topicDefer = $q.defer();
        topicDefer.resolve({
          data: topic
        });
        return {
          $promise: topicDefer.promise
        };
      }
      return this.get(id);
    },
    get: function(id) {
      return resource.get({id: id}, function(response) {
        topic = response.data;
      });
    },
    saveReply: function(topicId, replyData) {
      var reply = angular.extend({}, replyData);
      var currentUser = User.getCurrentUser();
      // add send from
      if (Setting.getSettings().sendFrom) {
        reply.content = replyData.content + '\n 自豪地采用 [CNodeJS ionic](https://github.com/lanceli/cnodejs-ionic)';
      }
      return resource.reply({
        topicId: topicId,
        accesstoken: currentUser.accesstoken
      }, reply
      );
    },
    upReply: function(replyId) {
      var currentUser = User.getCurrentUser();
      return resource.upReply({
        replyId: replyId,
        accesstoken: currentUser.accesstoken
      }, null, function(response) {
        if (response.success) {
          angular.forEach(topic.replies, function(reply, key) {
            if (reply.id === replyId) {
              if (response.action === 'up') {
                reply.ups.push(currentUser.id);
              } else {
                reply.ups.pop();
              }
            }
          });
        }
      }
      );
    }
  };
});
