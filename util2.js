

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
    add.apply(tag, arguments);
  };


  function add(children){
    if(arguments.length < 1) return "";
    for(var i=0, child; child=arguments[i];i++){
      if(typeof child == "string"){
        child = document.createTextNode(child);
      }
      this.appendChild(child);
    }
    return this;
}

}

"h1 h2 h3 h4 h5 h6 div p span a img table tr th td form input textarea"
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

var Keybind = {
  cb_funcs:{},
  add:function(phrase, func){
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
    } else if(event.altKey){
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
