(function (modules) {
    var installedModules = {};

    function require(moduleId, key) {

       if (installedModules[moduleId]) {
            return installedModules[moduleId].exports;
        }

        var module = installedModules[moduleId] = {
           i: moduleId,
            l: false,
            exports: {}
        };

        modules[moduleId].call(module.exports, module, module.exports, require);

        module.l = true;

        return key ? module.exports[key] : module.exports;
    }
    require(3);
})({
/***/ 0:
/***/ (function (module, __youzi_exports__, __youzi_require__) {

"use strict";

var Swiper = function Swiper(_ref) {
  var el = _ref.el,
      pagination = _ref.pagination,
      delay = _ref.delay;
  this._el = el;
  this._prev = el.querySelector(".prev");
  this._next = el.querySelector(".next");
  this._slider = el.querySelectorAll(".slider");
  this._wrapper = el.querySelector(".wrapper");
  this._width = el.offsetWidth;
  this._height = el.offsetHeight;
  this._size = this._slider.length;
  this._index = 0;
  this._timer = null;
  this._animate = null;
  this._isHover = false;
  this._pagination = pagination || false;
  this._delay = delay || 3000;
  this.init();
};

Swiper.prototype.init = function () {
  this.style();
  this.auto();
  this.mouseEnter();
};

Swiper.prototype.style = function () {
  var _this = this;

  this._slider.forEach(function (item) {
    item.style.width = _this._width + "px";
    item.style.height = _this._height + "px";
  });

  var firstDom = this._slider[0].cloneNode(true);

  var lastDom = this._slider[this._size - 1].cloneNode(true);

  this._wrapper.appendChild(firstDom);

  this._wrapper.insertBefore(lastDom, this._el.querySelector(".slider"));

  this._wrapper.style.left = -this._width + "px";

  if (this._pagination) {
    var pagination = document.createElement("div");
    pagination.className = "pagination";

    this._slider.forEach(function (item, i) {
      var span = document.createElement("span");
      if (i === _this._index) span.className = "active";

      span.onclick = function () {
        this.index(i);
      }.bind(_this);

      pagination.appendChild(span);
    });

    this._el.appendChild(pagination);
  }
};

Swiper.prototype.active = function () {
  this._el.querySelector(".pagination span.active").className = "";
  var index = this._index < 0 ? this._size : this._index >= this._size ? 1 : this._index + 1;
  this._el.querySelector(".pagination span:nth-child(".concat(index, ")")).className = "active";
};

Swiper.prototype.prev = function () {
  this._index--;
  this.move();
};

Swiper.prototype.next = function () {
  this._index++;
  this.move();
};

Swiper.prototype.index = function (index) {
  this._index = index;
  this.move();
};

Swiper.prototype.move = function () {
  if (this._index > this._size) {
    this._index = 1;
    this.styleLeft(-1 * this._width);
  }

  if (this._index < -1) {
    this._index = this._size - 2;
    this.styleLeft(-this._size * this._width);
  }

  this.start((-this._index - 1) * this._width);
  this.active();
  this.auto();
};

Swiper.prototype.start = function (end) {
  var start = parseFloat(this._wrapper.style.left);
  this.animate(start, end);
};

Swiper.prototype.animate = function (start, end) {
  var _this2 = this;

  var step = (start - end > 0 ? -1 : 1) * (Math.abs(start - end) / 10);
  if (this._animate) clearInterval(this._animate);
  this._animate = setInterval(function () {
    start += step;

    if (step < 0 && end - start > step || step > 0 && end - start < step) {
      clearInterval(_this2._animate);

      _this2.styleLeft(end);
    } else {
      _this2.styleLeft(start);
    }
  }, 40);
};

Swiper.prototype.auto = function () {
  var _this3 = this;

  if (this._timer) clearTimeout(this._timer);
  this._timer = setTimeout(function () {
    if (_this3._isHover) {
      clearTimeout(_this3._timer);

      _this3.auto();

      return;
    }

    _this3.next();
  }, this._delay);
};

Swiper.prototype.styleLeft = function (left) {
  this._wrapper.style.left = left + "px";
};

Swiper.prototype.mouseEnter = function () {
  var _this4 = this;

  this._el.onmouseenter = function () {
    _this4._isHover = true;
  };

  this._el.onmouseleave = function () {
    _this4._isHover = false;
  };

  if (this._prev) {
    this._prev.onclick = function () {
      _this4.prev();
    };
  }

  if (this._next) {
    this._next.onclick = function () {
      _this4.next();
    };
  }
};

__youzi_exports__['Swiper'] = Swiper;
/***/ })
,

/***/ 1:
/***/ (function (module, __youzi_exports__, __youzi_require__) {
var Swiper = __youzi_require__(0,'Swiper');
"use strict";
__youzi_exports__['Swiper'] = Swiper;

/***/ })
,

/***/ 2:
/***/ (function (module, __youzi_exports__, __youzi_require__) {

"use strict";

var fileName = "1.js";
var name = "youzi";
var age = 24;
__youzi_exports__['c'] = name;
__youzi_exports__['d'] = age;
__youzi_exports__['fileName'] = fileName;
/***/ })
,

/***/ 3:
/***/ (function (module, __youzi_exports__, __youzi_require__) {
var Swiper = __youzi_require__(1,'Swiper');
var fileName = __youzi_require__(2,'fileName');
var name = __youzi_require__(2,'name');
var age = __youzi_require__(2,'age');
"use strict";

new Swiper({
  el: document.querySelector(".hcImzB"),
  pagination: true,
  delay: 2000
});
console.log(fileName, name, age);


/***/ })
/******/ })
