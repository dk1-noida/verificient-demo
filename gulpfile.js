var gulp = require('gulp');

var winInstaller = require('electron-windows-installer');

 

gulp.task('create-windows-installer', async function (done) {
    try{
    await winInstaller({

        appDirectory: '/home/dinesh/Documents/front-end/verificient-demo/release/verificient-demo-win32-x64',

        outputDirectory: '/home/dinesh/Documents/front-end/verificient-demo/release',

        arch: 'ia32',

        authors: "Dinesh Kumar",

        version: "1.0.0",

        iconUrl: "favicon.ico",

        setupIcon: "favicon.ico",

        loadingGif: "ele.gif",

        noMsi:true

    });
} catch(e) {
    console.log(e);
}

});