import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import pkg from './package.json' with { type: "json" };

export default [
  // CommonJS (for Node) and ES module (for bundlers) build.
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,  // CommonJS build
        format: 'cjs',   // CommonJS format
        sourcemap: true
      },
      {
        file: pkg.module,  // ES Module build
        format: 'es',      // ES module format
        sourcemap: true
      }
    ],
    plugins: [
      resolve(),        // Resolve modules
      commonjs(),       // Convert CommonJS modules to ES6
      typescript({      // Compile TypeScript
        tsconfig: "./tsconfig.json"
      }),
      json()
    ]
  },
  // Modern JS build for modern browsers
  {
    input: 'src/index.ts',
    output: {
      file: pkg.modern,  // Modern JavaScript build
      format: 'es',      // ES module format
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json"
      })
    ]
  }
];
