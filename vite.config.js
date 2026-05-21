import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.js',
            ssr: 'resources/js/ssr.js',
            refresh: true,
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
    ],
    server: {
        host: '0.0.0.0', 
        hmr: {
            host: 'localhost',  
        },
        cors: true,
    },
    define: {
        'process.env.VITE_REVERB_PORT': JSON.stringify(process.env.VITE_REVERB_PORT || '8081'),
    },
    optimizeDeps: {
        include: ['pusher-js', 'laravel-echo']
    },
});