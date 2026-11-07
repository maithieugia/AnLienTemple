import {build} from 'vite';
await build({mode:'public',build:{outDir:'dist-public',emptyOutDir:false,copyPublicDir:false}});
