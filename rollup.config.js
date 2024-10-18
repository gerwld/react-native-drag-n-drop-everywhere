import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import pkg from './package.json' with { type: "json" };

export default [
  {
    input: 'src/index.tsx',
    external: ['react', 'react-native'], // Treat as external dependencies
    output: [
      {
        file: pkg.main,  // CommonJS build
        format: 'cjs',
        sourcemap: true
      },
      {
        file: pkg.module,  // ES module build
        format: 'es',
        sourcemap: true
      }
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
      json()
    ]
  }
];
