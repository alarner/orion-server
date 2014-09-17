var sinon 	= require('sinon');
var assert 	= require('chai').assert;
var path	= require('path');
var Master 	= require('../../src/master');


describe('master', function() {
	before(require('../before'));
	beforeEach(require('../beforeEach'));

	describe('when we call master.start()', function() {
		it('should fork some worker processes', function() {
			var cluster = {
				on: sinon.spy(),
				fork: sinon.spy()
			};
			var s1 = new Master(cluster, this.config);
			s1.start();
			assert.equal(cluster.fork.callCount, this.config.webserver.workerCount, 'master reads workerCount from config');

			cluster.on.reset();
			cluster.fork.reset();
			var s2 = new Master(cluster, {webserver:{}});
			s2.start();

			assert.equal(cluster.fork.callCount, require('os').cpus().length, 'master determines default workerCount');
		});
	});

	describe('when we call master.refreshWorkers()', function() {
		it('should kill all of the current workers and create new ones', function(done) {
			var workerOnMethod = sinon.stub().callsArgWith(1, 'orion::ready');
			var cluster = {
				on: sinon.spy(),
				fork: function() {
					return { on: workerOnMethod };
				},
				workers: {
					'1': {
						id: '1',
						kill: sinon.spy()
					},
					'2': {
						id: '2',
						kill: sinon.spy()
					}
				}
			};
			var s = new Master(cluster, this.config);
			s.refreshWorkers(function() {
				assert.equal(cluster.workers['1'].kill.callCount, 1, 'first worker killed once');
				assert.equal(cluster.workers['2'].kill.callCount, 1, 'second worker killed once');
				assert.equal(workerOnMethod.callCount, 2, 'two new workers forked');
				done();
			});
		});
	});
});