var gulp    = require('gulp');
var gutil   = require('gulp-util');
var watch   = require('gulp-watch');
var mocha   = require('gulp-mocha');
var todo    = require('gulp-todo');
var args    = require('yargs').argv;
var conf = require('./gulp.conf.js');
var fs = require('fs');
var path = require('path');
require('shelljs/global');





/*
****************
  Task builders
****************
*/


/*
creates a task   to run test
*/

function createTestTask(name, file){

// [@test] these are the test tasks for gulp
gulp.task(name, function(cb) {
  return gulp.src(file, {read: false})
  .pipe(mocha({
    reporter: 'spec',
    globals: {
      should: require('should')
    }
  })).on('error', gutil.log);
});

}


function createTasksFromTestFiles(){

   conf.unitTask.forEach(function(test){
          createTestTask('test:' + test.name , test.path);
   });
  }




gulp.task('default', function () {
  var jsMergeToWatch = conf.filesToWatch.concat(conf.testScriptFiles);
  gulp.watch(jsMergeToWatch,['test:app']);
});

/** 
** ----------------------------------------------- 
** ---------------- START TESTS ------------------
** -----------------------------------------------
**/


// [@test] these are the test tasks for gulp
gulp.task('test:unit', function(cb) {
  return gulp.src(conf.testUnitFiles, {read: false})
  .pipe(mocha({
    reporter: ( process.env.NODE_ENV === 'jenkins' ) ? 'xunit-file' : 'spec',
    timeout: 10000,
    globals: {
      should: require('should')
    }
  }))
  .once('error', function(err){
    console.log(err);
    process.exit(1);
  })
  .once('end', function(res){
    process.exit();
  });
});



createTasksFromTestFiles();



