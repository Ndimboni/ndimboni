/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // distDir: 'dist',
  reactStrictMode: true,
  experimental: {
    esmExternals: 'loose',
  },
  images:{
    unoptimized:true
  },
  transpilePackages: [
    'antd',
    '@ant-design/colors',
    '@ant-design/icons',
    '@ant-design/icons-svg',
    '@ctrl/tinycolor',
    'classnames',
    '@rc-component/util',
    '@rc-component/context',
    '@rc-component/portal',
    'rc-cascader',
    'rc-checkbox',
    'rc-collapse',
    'rc-dialog',
    'rc-drawer',
    'rc-dropdown',
    'rc-field-form',
    'rc-form',
    'rc-image',
    'rc-input',
    'rc-input-number',
    'rc-mentions',
    'rc-menu',
    'rc-motion',
    'rc-notification',
    'rc-pagination',
    'rc-picker',
    'rc-progress',
    'rc-radio',
    'rc-rate',
    'rc-resize-observer',
    'rc-segmented',
    'rc-select',
    'rc-slider',
    'rc-steps',
    'rc-switch',
    'rc-table',
    'rc-tabs',
    'rc-textarea',
    'rc-tooltip',
    'rc-tree',
    'rc-tree-select',
    'rc-upload',
    'rc-util',
    'rc-virtual-list'
  ],
  webpack: (config, { isServer, webpack }) => {
  
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

  
    config.plugins.push(
      new webpack.DefinePlugin({
        'import.meta.webpackHot': 'undefined',
      })
    );


    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
};

module.exports = nextConfig;