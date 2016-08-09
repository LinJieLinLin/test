var path = require("path");

function showlog() {
  browser.manage().logs().get('browser').then(function(browserLogs) {
    browserLogs.forEach(function(log) {
      console.log(log.level.name + " " + log.message);
    });
  });
}

function runTest_(func) {
  console.log("running web function test->" + func);
  browser.driver.executeScript("return " + func + "()").then(function(val) {
    expect(val).toBe("OK");
  });
}

function runTest(func) {
  console.log("\n\n-->\nrunning web function wait test->" + func);
  browser.driver.executeScript("return " + func + "()").then(function(val) {
    expect(val).toBe("OK");
  });
  var done = false;
  browser.wait(function() {
    browser.driver.executeScript("return window.testing").then(function(val) {
      done = val === 0;
    });
    return done;
  }, 30000);
  browser.driver.executeScript("return window.resm").then(function(val) {
    expect(val).toBe("");
  });
}
describe('TestARS', function() {
  // //
  it('testEmptyArs...', function() {
    browser.get('http://localhost:7981/test/web/ars_test.html');
    runTest('testEmptyArs');
  });
  it('testHavingArs...', function() {
    browser.get('http://localhost:7981/test/web/ars_test.html?a=1&b=2');
    runTest('testHavingArs');
  });
  it('testHavingHash...', function() {
    browser.get('http://localhost:7981/test/web/ars_test.html?#/s/a');
    runTest('testHavingHash');
  });
  //
  it('testHavingUser...', function() {
    browser.get('http://localhost:7981/test/web/ars_test.html');
    runTest('testHavingUser');
  });
  //
  it('testFocus...', function() {
    browser.get('http://localhost:7981/test/web/ars_test.html?a=1&b=2#/axx');
    runTest('testFocus');
  });
  //
  it('testPush...', function() {
    browser.get('http://localhost:7981/test/web/ars_test.html?a=1&b=2#/axx');
    runTest('testPush');
  });
  //
  it('testPush...', function() {
    browser.get('http://localhost:7981/test/web/ars_test.html?a=1&b=2');
    runTest('testPush');
  });
  //
  it('testPush2...', function() {
    browser.get('http://localhost:7981/test/web/ars_test.html?a=1&b=2#/axx');
    runTest('testPush2');
  });
  //
  it('testPush3...', function() {
    browser.get('http://localhost:7981/test/web/ars_test.html?a=1&b=2#/axx');
    runTest('testPush3');
  });
  //
  it('testPushToken...', function() {
    browser.get('http://localhost:7981/test/web/ars_test.html?a=1&b=2#/axx');
    runTest('testPushToken');
  });
  //
  it('testPushErr...', function() {
    browser.get('http://localhost:7981/test/web/ars_test.html?a=1&b=2#/axx');
    runTest('testPushErr');
  });
  //
  it('testPushErr2...', function() {
    browser.get('http://localhost:7981/test/web/ars_test.html?a=1&b=2#/axx');
    runTest('testPushErr2');
  });
  //
  it('testPushErr3...', function() {
    browser.get('http://localhost:7981/test/web/ars_test.html?a=1&b=2#/axx');
    runTest('testPushErr3');
  });
  //
  it('testSome...', function() {
    browser.get('http://localhost:7981/test/web/ars_test.html?a=1&b=2#/axx');
    runTest('testSome');
  });
  //
  it('All end...', function() {
    browser.get('http://localhost:7981/test/web/ars_test.html');
    console.log("All end");
  });
  afterEach(function() {
    showlog();
  });
});