var buster = require('referee');
var assert = buster.assert;
var refute = buster.refute;
var runner = require('gardr-validator/lib/index.js');

var lib = require('../lib/index.js');

describe('Utility functions', function(){

    describe('_apply', function(){
        it('should partial apply', function(done){
            (function(){
                lib._apply(function(){
                    assert.equals(arguments[0], 1);
                    assert.equals(arguments.length, 4);
                    done();
                }, 1, arguments);
            })(2, 3, 4);
        });
    });

    describe('_getDiff()', function(){
        it('should return diff from 2 array with 2 values, and always return positive numbers', function(){
            var diff = lib._getDiff;

            assert.equals(
                diff(
                    [10, 10],
                    [20, 30]),
                [10, 20],
            'Diff example 1');

            assert.equals(
                diff(
                    [10, 10],
                    [0, 30]),
                [-10, 20],
            'Diff example 2');

            assert.equals(
                diff(
                    [100, 0],
                    [0, 30]),
                [-100, 30],
            'Diff example 3');

            assert.equals(
                diff(
                    [100, 20],
                    [0, 0]),
                [-100, -20],
            'Diff example 4');

            assert.equals(
                diff(
                    [100, 20],
                    [50, 30]),
                [-50, 10],
            'Diff example 5')

            assert.equals(
                diff(
                    [100, 20],
                    [0, -10]),
                [-100, -30],
            'dont expect this to happen');

            var diff4 = diff(
                [0, 0.20],
                [0, 0.30]);
            var roundedY = Math.round(diff4[1]*100) / 100;
            assert.equals(roundedY, 0.10, 'diff5');
        });
    });

    describe('_getXandYFrame()', function(){

        describe('should work with positive numbers and negative numbers', function(){
            var frames    = 10;
            var fromXandY = [100, 20];
            var toXandY   = [50, 30];
            var diff      = lib._getDiff(fromXandY, toXandY);

            function assertStep(step, exp1, exp2){
                var result = lib._getXandYFrame(fromXandY, diff, step/frames);
                assert.equals(exp1, result[0], 'X');
                assert.equals(exp2, result[1], 'Y');
            }

            it('should return step 1', function(){
                assertStep(1, 95, 21);
            });

            it('should return step 2', function(){
                assertStep(2, 90, 22);
            });

            it('should return last -1 step', function(){
                assertStep(frames-1, 55, 29);
            });

            it('shoud return last step', function(){
                assertStep(frames, fromXandY[0] + diff[0], fromXandY[1] + diff[1]);
            });
        });

    });

});

describe('Touch Hook', function () {
    it('should run with touch hook', function (done) {
        this.timeout(3000);
        var options = {
            instrument: [
                {
                    name: 'touchHook',
                    path: __dirname +'/fixtures/touchHook.js'
                },
                'log'
            ],
            preprocess: [],
            validate: [],
            outputDirectory: __dirname,
            scriptUrl: __dirname +'/fixtures/script.js',
            pageRunTime: 500,
            width: 100,
            height: 100
        };
        runner.run(options, function (err, result) {
            if (err) {
                console.log(err);
            }
            refute(err);
            var data = result.touchHook.testData.tests;

            // console.log('HARVESTED LOGS:\n'+ result.log.logs.map(function(a){return 'log: '+a.message;}).join('\n'));

            function filterById(key){
                return function(entry){
                    return entry.id === key;
                };
            }

            ['TEST_ELEM_ID_1', 'TEST_ELEM_ID_2'].forEach(function(id){
                assert.equals(data.touchend.filter(filterById(id)).length, 1);
                assert.equals(data.touchstart.filter(filterById(id)).length, 1);
                assert.equals(data.touchmove.filter(filterById(id)).length, 9);
            });


            refute(data.touchmove[0].defaultPrevented);


            assert(result.log);
            done();
        });
    });
});
