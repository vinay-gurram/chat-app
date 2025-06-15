export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://chat-app-1-ci2r.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
};
