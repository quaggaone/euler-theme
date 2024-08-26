module.exports = function (eleventyConfig) {
    eleventyConfig.setServerOptions({
        port: 55660,
        showAllHosts: true, // Set this to true to access the server on your local network
    });

    eleventyConfig.addWatchTarget("./assets/");
    
    eleventyConfig.addPassthroughCopy("./assets/.");
    eleventyConfig.addPassthroughCopy({ "./node_modules/bootstrap-icons/font/fonts/.": "assets/fonts/bootstrap-icons" });
    eleventyConfig.addPassthroughCopy({ "./node_modules/bootstrap/dist/js/bootstrap.bundle.min.js": "assets/libs/bootstrap/dist/js/bootstrap.bundle.min.js" });
    eleventyConfig.addPassthroughCopy({ "./node_modules/bootstrap/dist/js/bootstrap.bundle.min.js.map": "assets/libs/bootstrap/dist/js/bootstrap.bundle.min.js.map" })
    
    return {
        dir: {
            input: "src",
        },
    };
};