/* 
 *	Notes
 *
 *  I hate Babel and Gulp 3.9 does not support es6 to use import. So require rocks here instead of use babel.
 *
 */

let cfgApp  = require('./config.json')
let gulp  = require('gulp') 
let downloadStream = require('gulp-download-stream')
let csv2json = require('gulp-csv2json')
let rename = require('gulp-rename');
let glob = require('glob')
let fstream = require('fs')


let mapSources = (sources) => {

	let myArray = [];

	Object.keys(sources).forEach((key) => {

		myArray.push({
			'file': `${key}.csv`,
  			'url': sources[key]
		})
	});

	return myArray
}

gulp.task('downloadCsv', () => {

	let availableSources = mapSources(cfgApp.sources)

	downloadStream(availableSources)
  	.pipe(gulp.dest('.temp/csv/'))
})

gulp.task('parse2json', (done) => {

	setTimeout(function() {

		gulp.src('.temp/csv/*.csv')
		.pipe(csv2json({}))
		.pipe(rename({extname: '.json'}))
		.pipe(gulp.dest('.temp/json/'))
		done()

		}, 
	4000)

})

gulp.task('join$maps', (done) => {

	glob('.temp/json/*.json', (er, filesList) => {

		let listArray = []

		if (er === null ) {

			filesList.forEach((item) => {

				let jsonMarketList  = require('./' + item)
				let marketName = item.split('/').pop().split('.json').shift()

				for (var i = jsonMarketList.length - 1; i >= 0; i--) {
					listArray.push({
						symbol: jsonMarketList[i].Symbol,
						name: jsonMarketList[i].Name,
						exchange: marketName,
						sector: jsonMarketList[i].Sector,
    					industry: jsonMarketList[i].industry
					})
				}
			})
		}

		fstream.writeFile('./build.json', JSON.stringify(listArray), 'utf8', function() {
		 	console.log('Symbols has been groupped. ',  listArray.length + ' symbols availables.' );
		});
	})

})


gulp.task('all', ['downloadCsv', 'parse2json', 'join$maps'])
gulp.task('build', ['join$maps'])
gulp.task('default',['join$maps'])