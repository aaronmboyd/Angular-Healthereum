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
      instance.addNewFacility("Facility1", facility, status, {from: owner});
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
       instance.addNewFacility("Facility2", facility2, status, {from: owner});
       return instance;})

       .then(function(instance){
          console.log(`facility3 = ${facility3}`);
          instance.addNewFacility("Facility3", facility3, status, {from: owner});
          return instance;})

          .then(function(instance) {
            return instance.getCountLabFacilities.call();})

            .then(function(numberOfFacilities){
              assert.equal(numberOfFacilities, 3);
      });
  });

  it("should suspend a facility", function(){

      return MyContract.deployed()

      .then(function(instance){
        console.log(`facility2 = ${facility2}`);
         instance.suspendFacility(facility2, {from: owner});
         return instance;})

         .then(function(instance){
            return instance.getLabStatusForAddress.call(facility2, {from: owner});})

              .then(function(labStatus){
                console.log(`labStatus ${labStatus}`);
                assert.equal(labStatus, 1);});
  });

  it("should approve a facility", function(){

      return MyContract.deployed()

      .then(function(instance){
        console.log(`facility2 = ${facility2}`);
         instance.approveFacility(facility2, {from: owner});
         return instance;})

         .then(function(instance){
            return instance.getLabFacilityForAddress.call(facility2, {from: owner});})

              .then(function(status){
                console.log(`status ${status}`);
                assert.equal(status[1], 0);});
  });

  it("should post a lab test for tender and successfully retrieve it", function(){

      return MyContract.deployed()

      .then(function(instance){
        var tenderPayment = .0001 * Math.pow(10,18);
        console.log(`tenderPayment = ${tenderPayment}`);
        instance.postLabTender("Description!", "Q_IPFS_HASH", "Blood", 3008, {from: owner, value: tenderPayment});
        return instance;})

         .then(function(instance){
            return instance.getLabTest.call(0);})

              .then(function(labTest){
                console.log(`labTest ${labTest}`);
                assert.equal(labTest[0], "Description!");
                assert.equal(labTest[1], "Q_IPFS_HASH");
                assert.equal(labTest[2], "N/A");
                assert.equal(labTest[3], "Blood");
              });
  });

  it("should accept a lab test for successfully check the status = 'Accepted'", function(){

      return MyContract.deployed()

      .then(function(instance){
        var acceptPayment = .0001 * Math.pow(10,18);
        console.log(`acceptPayment = ${acceptPayment}`);
        instance.acceptLabTest(0, {from: facility, value: acceptPayment});
        return instance;})

         .then(function(instance){
            return instance.getLabTest.call(0);})

              .then(function(labTest){
                console.log(`labTest ${labTest}`);
                assert.equal(labTest[5], 1);
              });
  });

  it("should complete a lab test for successfully check the status = 'Completed' and resultsIPFSHash populated", function(){

      return MyContract.deployed()

      .then(function(instance){
        instance.completeLabTest(0, "DummyIPFSResults", {from: facility});
        return instance;})

         .then(function(instance){
            return instance.getLabTest.call(0);})

              .then(function(labTest){
                console.log(`labTest ${labTest}`);
                assert.equal(labTest[5], 2);
                assert.equal(labTest[2], "DummyIPFSResults");
              });
  });

  it("should post a lab test, accept it, then cancel a lab test and check the status = 'Cancelled'", function(){

      return MyContract.deployed()

      .then(function(instance){
        var tenderPayment = .0001 * Math.pow(10,18);
        instance.postLabTender("CancelMe!", "Q_IPFS_HASH", "X-ray", 3008, {from: owner, value: tenderPayment});
        var acceptPayment = .0001 * Math.pow(10,18);
        instance.acceptLabTest(1, {from: facility, value: acceptPayment});
        instance.cancelLabTest(1, {from: facility});
        return instance;})

         .then(function(instance){
            return instance.getLabTest.call(1);})

              .then(function(labTest){
                console.log(`labTest ${labTest}`);
                assert.equal(labTest[5], 4);
              });
  });
})
