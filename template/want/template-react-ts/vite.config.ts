import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { normalizePath } from 'vite';
const variablePath = normalizePath(path.resolve('./src/styles/variable.scss'));
import autoprefixer from 'autoprefixer';
import windi from 'vite-plugin-windicss';
import StylelintPlugin from 'vite-plugin-stylelint';
//  SVG 组件方式加载
import svgr from 'vite-plugin-svgr';
import viteImagemin from 'vite-plugin-imagemin';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

// 在 Vite 中接入 ESLint, 这样就可以在开发时就能看到 ESLint 的报错信息了
import viteEslint from 'vite-plugin-eslint';
const isProduction = process.env.NODE_ENV === 'production';
const CDN_URL = 'http://xxx.com';

// https://vitejs.dev/config/
export default defineConfig({
  base: isProduction ? CDN_URL : '/',
  // 手动指定项目根目录位置
  // root: path.join(__dirname, 'src'),
  plugins: [
    react(),
    windi(),
    viteEslint(),
    StylelintPlugin(),
    svgr(),
    createSvgIconsPlugin({
      iconDirs: [path.join(__dirname, 'src/assets/icons')]
    }),
    viteImagemin({
      // 无损压缩配置，无损压缩下图片质量不会变差
      optipng: {
        optimizationLevel: 7
      },
      // 有损压缩配置，有损压缩下图片质量可能会变差
      pngquant: {
        quality: [0.8, 0.9]
      },
      // svg 优化
      svgo: {
        plugins: [
          {
            name: 'removeViewBox'
          },
          {
            name: 'removeEmptyAttrs',
            active: false
          }
        ]
      }
    })
  ],
  css: {
    modules: {
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "${variablePath}";`
      }
    },
    postcss: {
      plugins: [
        autoprefixer({
          overrideBrowserslist: ['safari >= 6', 'ff >= 10']
        })
      ]
    }
  },
  resolve: {
    /**
     * 值得注意的是，alias 别名配置不仅在 JavaScript 的 import 语句中生效，
     * 在 CSS 代码的 @import 和 url导入语句中也同样生效。
     */
    alias: {
      '@assets': path.resolve(__dirname, 'src/assets')
    }
  }
});
