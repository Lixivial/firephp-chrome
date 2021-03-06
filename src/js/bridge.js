(function(){
  
  var dirObject = function(o) {
    for (key in o) {
      if (o.hasOwnProperty(key)) {
        console.log(key + ':', o[key]);
      }
    }
  };
  
  var dirStacktrace = function(stacktrace) {
    console.group('Stack trace');
    stacktrace.forEach(function (trace, idx) {
      console.groupCollapsed(idx + '. ' + shortPath(trace.file) + '(' + trace.line + '): ' + trace.class + trace.type + trace.function + '(' + joinArguments(trace.args) + ')');
      dirObject(trace);
      console.groupEnd();
    });
    console.groupEnd();
  };
  
  var shortPath = function (path) {
    return path.split('/').splice(-3).join('/');
  };
  
  var joinArguments = function (args) {
    var result = [];
    args.forEach(function (arg) {
      if (typeof arg === 'object') {
        result.push(arg.__className);
      } else {
        result.push(arg);
      }
    });
    return result.join(', ');
  };

  /*
    Map action types to specific outputs
  */
  var actionsToOutputMap = {
    'exception' : function (type, body) {
      console.error("Exception '" + body.Class + "' with message '" + body.Message + "' in " + shortPath(body.File) + ':' + body.Line);
      dirStacktrace(body.Trace);
    },
    'default'  : function (type, body) {
      if (console[type]) { console[type]( body ); }
    }
  }

  var outputForAction = function (action, body) {
    if (actionsToOutputMap[action]) {
      actionsToOutputMap[action]( action, body );
    } else {
      actionsToOutputMap['default']( action, body );
    }
  };

  chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
      request.forEach(
        function ( item ) {
          outputForAction( item.action, item.body );
        }
      );
    }
  );
  
})();