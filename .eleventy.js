module.exports = function (eleventyConfig) {
    eleventyConfig.setServerOptions({
        port: 55660,
        showAllHosts: true, // Set this to true to access the server on your local network
    });

    eleventyConfig.addWatchTarget("./assets/");
    
    eleventyConfig.addPassthroughCopy("./assets/.");
    eleventyConfig.addPassthroughCopy({ "./node_modules/bootstrap-icons/font/fonts/.": "assets/fonts/bootstrap-icons" })

    return {
        dir: {
            input: "src",
        },
    };
};