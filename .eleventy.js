module.exports = function (eleventyConfig) {
    eleventyConfig.setServerOptions({
        port: 55660,
        showAllHosts: true, // Set this to true to access the server on your local network
        watch: ["_site/**/*.css"], // Watch CSS files for changes
    });
    
    eleventyConfig.addPassthroughCopy("./assets/.");
    eleventyConfig.addPassthroughCopy({ "./node_modules/bootstrap-icons/font/fonts/.": "assets/themes/euler/fonts/bootstrap-icons" });
    eleventyConfig.addPassthroughCopy({ "./node_modules/bootstrap/dist/js/bootstrap.bundle.min.js": "assets/themes/euler/libs/bootstrap/js/bootstrap.bundle.min.js" });
    eleventyConfig.addPassthroughCopy({ "./node_modules/bootstrap/dist/js/bootstrap.bundle.min.js.map": "assets/themes/euler/libs/bootstrap/js/bootstrap.bundle.min.js.map" })
    
    return {
        dir: {
            input: "src",
        },
        pathPrefix: "/euler-theme/",
    };
};