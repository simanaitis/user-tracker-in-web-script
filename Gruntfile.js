module.exports = function(grunt) {
    'use strict';
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                //banner: '/*! <%= pkg.name %>' +
                //'<%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/*.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        jasmine: {
            pivotal: {
                src: 'build/<%= pkg.name %>.nologs.js',
                options: {
                    vendor: ['vendor/jasmine-jquery.js',
                    ],
                    helpers: ['spec/*Helper.js'],
                    specs: 'spec/*Spec.js',
                    keepRunner: true
                }
            }
        },
        jshint: {
            beforeConcat: {
                options: {
                    node: true,
                    jquery: true,
                    // Force all variable names to use either camelCase style
                    // or UPPER_CASE with underscores.
                    camelcase: true,
                    curly: true,
                    // Prohibit use of == and != in favor of === and !==.
                    eqeqeq: true,
                    // Suppress warnings about == null comparisons.
                    eqnull: true,
                    // Enforce tab width of 4 spaces.
                    indent: 4,
                    immed: true,
                    // Require capitalized names for constructor functions.
                    newcap: true,
                    // Enforce use of single quotation marks for strings.
                    quotmark: 'single',
                    // Prohibit trailing whitespace.
                    trailing: true,
                    noarg: true,
                    sub: true,
                    // Enforce line length to 80 characters
                    maxlen: 80,
                    // Enforce placing 'use strict' at the top function scope
                    strict: true,
                    browser: true,
                    globals: {
                        _: true,
                        $: true,
                        jQuery: true,
                        require: true,
                        define: true,
                        requirejs: true,
                        describe: true,
                        expect: true,
                        it: true
                    }
                },
                src: ['Gruntfile.js', 'src/*.js'] //, 'spec/*.js']
            },
            // This runs after concating source files
            // it checks all options that require files to see each other
            afterConcat: {
                options: {
                    node: true,
                    jquery: true,
                    // Prohibit use of a variable before it is defined.
                    latedef: true,
                    // Prohibit use of explicitly undeclared variables.
                    undef: true,
                    // Warn when variables are defined but never used.
                    unused: true,
                    evil: true,
                    browser: true,
                    globals: {
                        _: true,
                        $: true,
                        jQuery: true,
                        require: true,
                        define: true,
                        requirejs: true,
                        describe: true,
                        expect: true,
                        it: true
                    }
                },
                src: ['build/<%= pkg.name %>.source.js']
            }
        },
        watch: {
            full: {
                files: ['**/*.js', '!**/node_modules/**', '!**/build/**',
                    '!**/vendor/**'
                ],
                tasks: ['jshint:beforeConcat', 'concat:sourceFiles',
                    'jshint:afterConcat', 'concat:vendorFiles',
                    'removelogging', 'jasmine'
                ],
                options: {
                    //livereload: true,
                    spawn: false,
                },
            },
            forTesting: {
                files: ['**/*.js', '!**/node_modules/**', '!**/build/**',
                    '!**/vendor/**'
                ],
                tasks: ['concat:sourceFiles', 'removelogging', 'jasmine'],
                options: {
                    //livereload: true,
                    spawn: false,
                },
            },
            withJSHintAndConcats: {
                files: ['**/*.js', '!**/node_modules/**', '!**/build/**',
                    '!**/vendor/**'
                ],
                tasks: ['jshint:beforeConcat', 'concat:sourceFiles',
                    'jshint:afterConcat', 'concat:vendorFiles'
                ],
                options: {
                    //livereload: true,
                    spawn: false,
                },
            },
        },
        concat: {
            sourceFiles: {
                options: {
                    separator: '\n', //add a new line after each file
                    banner: '', //added before everything
                    footer: '' //added after everything
                },
                // the files to concatenate
                src: [
                    // //global variables
                    // 'src/global/*.js',
                    // //modules
                    // 'src/!(app).js',
                    // //then main app file
                    // 'src/app.js'
                    'build/<%= pkg.name %>.js'
                ],
                // the location of the resulting JS file
                dest: 'build/<%= pkg.name %>.source.js'
            },
            vendorFiles: {
                options: {
                    separator: '\n', //add a new line after each file
                    banner: '', //added before everything
                    footer: '' //added after everything
                },
                // the files to concatenate
                src: [
                    //own classes and files
                    'build/<%= pkg.name %>.source.js'
                ],
                // the location of the resulting JS file
                dest: 'build/<%= pkg.name %>.js'
            }
        },
        removelogging: {
            testing: {
                src: 'build/<%= pkg.name %>.source.js',
                dest: 'build/<%= pkg.name %>.nologs.js',
                options: {}
            }
        },
        browserify: {
          dist: {
            files: {
              'build/<%= pkg.name %>.js': ['src/app.js']
            }
          }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-remove-logging');
    grunt.loadNpmTasks('grunt-release');
    grunt.loadNpmTasks('grunt-browserify');

    // Default task(s).
    grunt.registerTask('default', function() {
        var tasks = ['jshint:beforeConcat', 'browserify', 'concat:sourceFiles',
            'jshint:afterConcat', 'concat:vendorFiles',
            'removelogging', 'jasmine', 'watch:full'
        ];
        // always use force when watching
        grunt.option('force', true);
        grunt.task.run(tasks);
    });

    grunt.registerTask('test', function() {
        var tasks = ['concat:sourceFiles', 'concat:vendorFiles',
            'removelogging', 'jasmine'
        ];
        grunt.task.run(tasks);
    });

    grunt.registerTask('lint', function() {
        var tasks = ['concat:sourceFiles', 'jshint:afterConcat',
            'concat:vendorFiles', 'removelogging', 'watch:full'
        ];
        grunt.task.run(tasks);
    });

    grunt.registerTask('releaseMe', function() {
        var tasks = ['concat:sourceFiles', 'concat:vendorFiles',
            'removelogging', 'uglify', 'release'
        ];
        grunt.task.run(tasks);
    });

};

// // on watch events configure jshint:all to only run on changed file
// grunt.event.on('watch', function(action, filepath) {
//   grunt.config('jshint.all.src', filepath);
// });