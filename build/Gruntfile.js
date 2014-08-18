module.exports = function(grunt){
	grunt.initConfig({
		concat : {
			js : {
			     	src : '../js/gim/**/*.js',
				dest : './gimmap.js'
			     }
		},
		uglify : {
			js : {
			     	src : './gimmap.js',
				dest : './gimmap.min.js'
			     }
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default',['concat','uglify']);
	grunt.registerTask('con',['concat']);
	grunt.registerTask('ugl',['uglify']);
}
