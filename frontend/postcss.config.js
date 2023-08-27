const tailwindcss = require('tailwindcss');
const playground = require('./playground/tailwind.config');
const backoffice = require('./backoffice/tailwind.config');
module.exports = {
  plugins: [
    'postcss-preset-env',
    'tailwindcss/nesting',
    tailwindcss(playground),
    tailwindcss(backoffice),
  ],
};
