module.exports = {
	// * the sql dialect of the database
	// * - default is 'mysql'
	// * - currently supported: 'mysql', 'sqlite', 'postgres', 'mariadb'
	dialect: 'sqlite',

	// * database to connect to
	database: '',

	// * username to use to connect
	username: '',

	// * password to use to connect
	// password: '',

	// * custom host; default: localhost
	// host: 'my.server.tld',

	// * custom port; default: 3306
	// port: 12345,

	// * custom protocol
	// * - default: 'tcp'
	// * - added in: v1.5.0
	// * - postgres only, useful for heroku
	// protocol: null,

	// * disable logging; default: console.log
	// logging: false,

	// * max concurrent database requests; default: 50
	// maxConcurrentQueries: 100,

	// * you can also pass any dialect options to the underlying dialect library
	// * - default is empty
	// * - currently supported: 'mysql', 'mariadb'
	// dialectOptions: {
	// 	socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
	// 	supportBigNumbers: true,
	// 	bigNumberStrings: true
	// },

	// * the storage engine for sqlite
	// * - default ':memory:'
	storage: 'database.sqlite',

	// * disable inserting undefined values as NULL
	// * - default: false
	// omitNull: true,

	// * a flag for using a native library or not.
	// * in the case of 'pg' -- set this to true will allow SSL support
	// * - default: false
	// native: true,

	// * Specify options, which are used when sequelize.define is called.
	// * The following example:
	// *   define: {timestamps: false}
	// * is basically the same as:
	// *   sequelize.define(name, attributes, { timestamps: false })
	// * so defining the timestamps for each model will be not necessary
	// * Below you can see the possible keys for settings. All of them are explained on this page
	// define: {
	// 	underscored: false
	// 	freezeTableName: false,
	// 	syncOnAssociation: true,
	// 	charset: 'utf8',
	// 	collate: 'utf8_general_ci',
	// 	classMethods: {method1: function() {}},
	// 	instanceMethods: {method2: function() {}},
	// 	timestamps: true
	// },

	// * similiar for sync: you can define this to always force sync for models
	// sync: { force: true },

	// * sync after each association (see below). If set to false, you need to sync manually after setting all associations. Default: true
	// syncOnAssociation: true,

	// * use pooling in order to reduce db connection overload and to increase speed
	// * currently only for mysql and postgresql (since v1.5.0)
	// pool: { maxConnections: 5, maxIdleTime: 30},

	// * language is used to determine how to translate words into singular or plural form based on the [lingo project](https://github.com/visionmedia/lingo)
	// * options are: en [default], es
	// language: 'en'
};