var MyContract = artifacts.require("HealthereumCore")

contract('HealthereumCore', function(accounts) {

  let owner = accounts[0];
  let account = accounts[0];
  let facility = accounts[1];
  let facility2 = accounts[2];
  let facility3 = accounts[3];
  var status = 0

  it("should add a single facility", function(){

    return MyContract.deployed()

    .then(function(instance){
      console.log(`facility = ${facility}`);
      instance.addNewFacility(facility, status, {from: owner});
      return instance;})

        .then(function(instance) {
          return instance.getCountLabFacilities.call();})

          .then(function(numberOfFacilities){
            assert.equal(numberOfFacilities, 1);
      });
  });

  it("should add two facilities", function(){

    return MyContract.deployed()

    .then(function(instance){
      console.log(`facility2 = ${facility2}`);
       instance.addNewFacility(facility2, status, {from: owner});
       return instance;})

       .then(function(instance){
          console.log(`facility3 = ${facility3}`);
          instance.addNewFacility(facility3, status, {from: owner});
          return instance;})

          .then(function(instance) {
            return instance.getCountLabFacilities.call();})

            .then(function(numberOfFacilities){
              assert.equal(numberOfFacilities, 3);
      });
  });

})
