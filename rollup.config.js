import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import pkg from './package.json' with { type: "json" };

function fixAnimatedDefault() {
  return {
    name: 'fix-animated-default',
    renderChunk(code) {
      // replaces 'Animated.View' with 'Animated.default.View' where necessary
      return code.replace(/Animated\.View/g, 'Animated.View ? Animated.View : Animated.default.View');
    }
  };
}

export default [
  {
    input: 'src/index.tsx',
    external: ['react', 'react-native', 'react-native-gesture-handler', 'react-native-reanimated'], // Treat as external dependencies
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
      json(),
      fixAnimatedDefault()
    ]
  }
];
