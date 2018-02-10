const babel = require('rollup-plugin-babel');

// TODO find a better way to do this
const { id } = process.env;
const rollupMap = {
  BASE: {
    input: 'src/index.js',
    dest: 'lib/chameleon.js',
  },
  REDUCERS: {
    input: 'src/reducers/index.js',
    dest: 'lib/reducers.js',
  },
};
const idConfig = rollupMap[id];
if (!idConfig) {
  throw new Error('Incorrect id parameter passed');
}

const config = {
  input: idConfig.input,
  external: ['react', 'prop-types'],
  output: {
    globals: {
      react: 'React',
    },
    name: 'chameleon',
    file: idConfig.dest,
    format: 'umd',
  },
  plugins: [
    babel({
      exclude: '**/node_modules/**',
    }),
  ],
};

export default config;
