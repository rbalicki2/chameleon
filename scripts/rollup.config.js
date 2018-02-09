const babel = require('rollup-plugin-babel');

const config = {
  input: 'src/index.js',
  external: ['react', 'prop-types'],
  output: {
    globals: {
      react: 'React',
    },
    name: 'chameleon',
    file: 'build/chameleon.js',
    format: 'umd',
  },
  plugins: [
    babel({
      exclude: '**/node_modules/**',
    }),
  ],
};

export default config;
