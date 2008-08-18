function $add(parent, children){
  if(arguments.length < 2) return "";
  for(var i=1, child; child=arguments[i];i++){
    if(typeof child == "object" && child instanceof Array){
      for(var j=0,l=child.length;j<l;j++){
        $add(parent, child[j]);
      }
    } else {
      if(typeof child == "string"){
        child = document.createTextNode(child);
      }
      parent.appendChild(child);
    }
  }
  return parent;
}

function object2query(obj){
  var q = [];
  for(var a in obj){
    q.push([a,encodeURIComponent(String(obj[a]))].join("="));
  }
  return q.join("&");
}

function $tag(tagName, attrs, styles){
  var tag = document.createElement(tagName);
  if(attrs){
    for(a in attrs){
      if(attrs.hasOwnProperty(a)){
        tag[a] = attrs[a];
      }
    }
  }
  if(styles){
    for(a in styles){
      if(styles.hasOwnProperty(a)){
        tag.style[a] = styles[a];
      }
    }
  }
  return function(){
    var args = Array.prototype.slice.apply(arguments);
    args.unshift(tag);
    $add.apply(null, args);
    return tag;
  };
}


"h1 h2 h3 h4 h5 h6 embed div p span a img table tr th td form input button textarea select option"
  .split(" ")
  .forEach(function(tagName){
             var func = function(attrs, styles){
               return $tag(tagName, attrs, styles);
             };
             eval("$" + tagName + "= func;" );
    });

function $text(text){
  return document.createTextNode(String(text));
}

function $rm(element){
  if(element && element.parentNode){
    element.parentNode.removeChild(element);
  }
}


//
// XPath
//
function getXPath(node) {
  var xpath  = "";
  if (node.nodeType == 9 /*DOCUMENT_NODE*/) {
    return "";
  } else if(node.nodeType == 3 /*TEXT_NODE*/){
    xpath = arguments.callee(node.parentNode) + '/text()';
  } else {
    var tagName = node.tagName.toLowerCase();
    if (node.hasAttribute("id")) {
      xpath = 'id("'+node.getAttribute("id")+'")';
    } else {
      xpath = arguments.callee(node.parentNode) + '/' + tagName;
      if (node.hasAttribute("class")){
        xpath += '[@class="'+node.getAttribute('class')+'"]';
      } else {
        xpath += '['+indexOf(node)+']';
      }
    }
  }
  return xpath;

  function indexOf (node) {
    var result = 1;
    var children = node.parentNode.childNodes;
    for (var i = 0,l = children.length; i < l; i++) {
      var child = children[i];
      if (child.nodeName == node.nodeName &&
          child.nodeType == node.nodeType) {
        if(child == node) return result;
        result++;
      }
    }
    return -1;
  }
}

function $X(exp, context) {
  if (!context) context = document;
  var resolver = function (prefix) {
    var o = document.createNSResolver(context)(prefix);
    return o ? o : (document.contentType == "text/html") ? "" : "http://www.w3.org/1999/xhtml";
  };
  exp = document.createExpression(exp, resolver);
  var result = exp.evaluate(context, XPathResult.ANY_TYPE, null);
  switch (result.resultType) {
  case XPathResult.STRING_TYPE : return result.stringValue;
  case XPathResult.NUMBER_TYPE : return result.numberValue;
  case XPathResult.BOOLEAN_TYPE: return result.booleanValue;
  case XPathResult.UNORDERED_NODE_ITERATOR_TYPE: {
    result = exp.evaluate(context, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    var ret = [];
    for (var i = 0, len = result.snapshotLength; i < len ; i++) {
      ret.push(result.snapshotItem(i));
    }
    return ret;
  }
  }
  return null;
}



//
// Keybind
//
var Keybind = {
  cb_funcs:{},
  add:function(phrase, func){
    if(phrase instanceof Array){
      phrase.forEach(function(p){
                       Keybind.add(p, func);
                     });
      return;
    }
    this.cb_funcs[phrase] ||(this.cb_funcs[phrase] = []);
    var cb_func = function(event){
      var target = event.target;
      var tagName = target.tagName;
      var type = target.type;
      if(phrase == Keybind.code(event) &&
         (phrase == "escape" ||
          !(tagName == "INPUT" &&
            (!type.type || type=="text")) &&
          tagName != "TEXTAREA")){
        event.preventDefault();
        func();
      }
    };
    this.cb_funcs[phrase].push(cb_func);
    document.addEventListener("keydown", cb_func, true);
  },
  free:function(phrase){
    var cb_funcs = this.cb_funcs[phrase];
    if(cb_funcs){
      cb_funcs.forEach(
        function(cb_func){
          document.removeEventListener("keydown", cb_func, true);
        }
      );
    }
  },
  code: function(event){
    var code = [];
    if(event.shiftKey){
      code.push("S");
    } else if(event.ctrlKey){
      code.push("C");
    } else if(event.altKey || event.metaKey){
      code.push("M");
    }
    code.push(Keybind.kc2char(event.keyCode));
    return code.join("-");
  },

  kc2char:function(kc){
    var between = function(a,b){
      return a <= kc && kc <= b;
    };

    var _32_40 = "space pageup pagedown end home left up right down".split(" ");
    var kt = {
      8  : "back",
      9  : "tab"  ,
      13 : "enter",
      16 : "shift",
      17 : "ctrl",
      27 : "escape",
      46 : "delete"
    };

    return (
      between(65,90)  ? String.fromCharCode(kc+32) : // a-z
      between(48,57)  ? String.fromCharCode(kc) :    // 0-9
      between(96,105) ? String.fromCharCode(kc-48) : // num 0-9
      between(32,40)  ? _32_40[kc-32] :
        kt.hasOwnProperty(kc) ? kt[kc] :
        kc
    );
  }

};

//--------------------------------------------------------
// Date/W3CDTF.js -- W3C Date and Time Formats
//--------------------------------------------------------
Date.W3CDTF = function ( dtf ) {
    var dd = new Date();
    dd.setW3CDTF = Date.W3CDTF.prototype.setW3CDTF;
    dd.getW3CDTF = Date.W3CDTF.prototype.getW3CDTF;
    if ( dtf ) this.setW3CDTF( dtf );
    return dd;
};

Date.W3CDTF.VERSION = "0.04";

Date.W3CDTF.prototype.setW3CDTF = function( dtf ) {
  var sp = dtf.split( /[^0-9]/ );

  // invalid format
  if ( sp.length < 6 || sp.length > 8 ) return null;

  // invalid time zone
  if ( sp.length == 7 ) {
    if ( dtf.charAt( dtf.length-1 ) != "Z" ) return null;
  }

  // to numeric
  for( var i=0; i<sp.length; i++ ) sp[i] = sp[i]-0;

  // invalid range
  if ( sp[0] < 1970 ||                // year
       sp[1] < 1 || sp[1] > 12 ||     // month
       sp[2] < 1 || sp[2] > 31 ||     // day
       sp[3] < 0 || sp[3] > 23 ||     // hour
       sp[4] < 0 || sp[4] > 59 ||     // min
       sp[5] < 0 || sp[5] > 60 ) {    // sec
         return null;                         // invalid date
       }

  // get UTC milli-second
  var msec = Date.UTC( sp[0], sp[1]-1, sp[2], sp[3], sp[4], sp[5] );

    // time zene offset
    if ( sp.length == 8 ) {
        if ( dtf.indexOf("+") < 0 ) sp[6] *= -1;
        if ( sp[6] < -12 || sp[6] > 13 ) return null;    // time zone offset hour
        if ( sp[7] < 0 || sp[7] > 59 ) return null;      // time zone offset min
        msec -= (sp[6]*60+sp[7]) * 60000;
    }

    // set by milli-second;
    return this.setTime( msec );
};

Date.W3CDTF.prototype.getW3CDTF = function() {
    var year = this.getFullYear();
    var mon  = this.getMonth()+1;
    var day  = this.getDate();
    var hour = this.getHours();
    var min  = this.getMinutes();
    var sec  = this.getSeconds();

    // time zone
    var tzos = this.getTimezoneOffset();
    var tzpm = ( tzos > 0 ) ? "-" : "+";
    if ( tzos < 0 ) tzos *= -1;
    var tzhour = tzos / 60;
    var tzmin  = tzos % 60;

    // sprintf( "%02d", ... )
    if ( mon  < 10 ) mon  = "0"+mon;
    if ( day  < 10 ) day  = "0"+day;
    if ( hour < 10 ) hour = "0"+hour;
    if ( min  < 10 ) min  = "0"+min;
    if ( sec  < 10 ) sec  = "0"+sec;
    if ( tzhour < 10 ) tzhour = "0"+tzhour;
    if ( tzmin  < 10 ) tzmin  = "0"+tzmin;
    var dtf = year+"-"+mon+"-"+day+"T"+hour+":"+min+":"+sec+tzpm+tzhour+":"+tzmin;
    return dtf;
};
/*

=head1 NAME

Date.W3CDTF - W3C Date and Time Formats

=head1 SYNOPSIS

    var dd = new Date.W3CDTF();         // now
    document.write( "getW3CDTF: "+ dd.getW3CDTF() +"ý_n" );

    dd.setW3CDTF( "2005-04-23T17:20:00+09:00" );
    document.write( "toLocaleString: "+ dd.toLocaleString() +"ý_n" );

=head1 DESCRIPTION

This module understands the W3CDTF date/time format, an ISO 8601 profile,
defined by W3C. This format as the native date format of RSS 1.0.
It can be used to parse these formats in order to create the appropriate objects.

=head1 METHODS

=head2 new()

This constructor method creates a new Date object which has
following methods in addition to Date's all native methods.

=head2 setW3CDTF( "2006-02-15T19:40:00Z" )

This method parse a W3CDTF datetime string and sets it.

=head2 getW3CDTF()

This method returns a W3CDTF datetime string.
Its timezone is always local timezone configured on OS.

=head1 SEE ALSO

http://www.w3.org/TR/NOTE-datetime

=head1 AUTHOR

Yusuke Kawasaki http://www.kawa.net/

=head1 COPYRIGHT AND LICENSE

Copyright (c) 2005-2006 Yusuke Kawasaki. All rights reserved.
This program is free software; you can redistribute it and/or
modify it under the Artistic license. Or whatever license I choose,
which I will do instead of keeping this documentation like it is.

=cut
*/
