const Swiper = function ({ el, pagination, delay }) {
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
    this._slider.forEach(item => {
        item.style.width = this._width + "px";
        item.style.height = this._height + "px";
    });

    const firstDom = this._slider[0].cloneNode(true);
    const lastDom = this._slider[this._size - 1].cloneNode(true);

    this._wrapper.appendChild(firstDom);
    this._wrapper.insertBefore(lastDom, this._el.querySelector(".slider"));
    this._wrapper.style.left = -this._width + "px";

    if (this._pagination) {
        const pagination = document.createElement("div");
        pagination.className = "pagination";

        this._slider.forEach((item, i) => {
            const span = document.createElement("span");
            if (i === this._index) span.className = "active";

            span.onclick = function () {
                this.index(i);
            }.bind(this)
            pagination.appendChild(span);
        });

        this._el.appendChild(pagination);
    }
};


Swiper.prototype.active = function () {
    this._el.querySelector(`.pagination span.active`).className = "";

    const index = this._index < 0 ? this._size : this._index >= this._size ? 1 : this._index + 1;
    this._el.querySelector(`.pagination span:nth-child(${index})`).className = "active";
};

Swiper.prototype.prev = function () {
    this._index--;
    this.move();
}

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
        this.styleLeft(-(this._size) * this._width);
    }

    this.start((-this._index - 1) * this._width);
    this.active();
    this.auto();
};

Swiper.prototype.start = function (end) {
    const start = parseFloat(this._wrapper.style.left);

    this.animate(start, end);
};

Swiper.prototype.animate = function (start, end) {
    const step = (start - end > 0 ? -1 : 1) * (Math.abs(start - end) / 10);

    if (this._animate) clearInterval(this._animate);

    this._animate = setInterval(() => {
        start += step;

        if (step < 0 && end - start > step || step > 0 && end - start < step) {
            clearInterval(this._animate);
            this.styleLeft(end);
        } else {
            this.styleLeft(start);
        }
    }, 40)
};

Swiper.prototype.auto = function () {
    if (this._timer) clearTimeout(this._timer);

    this._timer = setTimeout(() => {
        if (this._isHover) {
            clearTimeout(this._timer);
            this.auto();
            return;
        }
        this.next();
    }, this._delay)
};

Swiper.prototype.styleLeft = function (left) {
    this._wrapper.style.left = left + "px";
};

Swiper.prototype.mouseEnter = function () {
    this._el.onmouseenter = () => {
        this._isHover = true;
    };

    this._el.onmouseleave = () => {
        this._isHover = false;
    };

    if (this._prev) {
        this._prev.onclick = () => {
            this.prev();
        }
    }

    if (this._next) {
        this._next.onclick = () => {
            this.next();
        }
    }
};

export default Swiper;