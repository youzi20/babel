import { Swiper } from './common';
import fileName from './common/1.js';
import {
    name, age
} from './common/1.js';

new Swiper({
    el: document.querySelector(".hcImzB"),
    pagination: true,
    delay: 2000
});

console.log(fileName, name, age);
