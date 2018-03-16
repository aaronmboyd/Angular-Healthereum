pragma solidity ^0.4.19;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './SafeMath.sol';

/// @title A contract that manages sending LabTests to a laboratory marketplace
/// @author Aaron Boyd
/// @dev Using Truffle and OpenZeppelin
contract HealthereumCore is Ownable {

  using SafeMath for uint256;
  using SafeMath32 for uint32;
  using SafeMath16 for uint16;

  // ENUMs
  enum SmartContractState {
    Enabled,
    Disabled
  }
  enum LabTestState{
    New,
    Accepted,
    Completed,
    Expired,
    Cancelled
  }
  enum LabFacilityStatus {
    Approved,
    Suspended,
    Revoked
  }

  // Structs
  struct LabTest {
    string description;
    string testIPFSHash;
    string resultsIPFSHash;
    string testType;
    uint8 postcode;
    uint8 labTestState;
    uint postedTime;
    uint expiryTime;
  }

  struct LabFacility {
    string facilityName;
    uint8 status;
    uint acceptedCount;
    uint completedCount;
    uint cancelledCount;
  }

  // Events
  event NewLabFacility(uint id, address labAddress, uint8 status);
  event SuspendedLabFacility(address labAddress);
  event RevokedLabFacility(address labAddress);
  event ApproveLabFacility(address labAddress);
  event LabTestPosted(uint labTestId);
  event LabTestAccepted(address acceptedBy, uint labTestId);
  event LabTestCompleted(address acceptedBy, uint labTestId);
  event LabTestCancelled(address acceptedBy, uint labTestId);
  event LabTestExpired(uint labTestId);

  // Attributes
  uint8 contractState = uint8(SmartContractState.Enabled);
  uint postLabTenderFee = .0001 ether;
  uint acceptTenderFee = .0001 ether;
  uint labTestExpiryTime = 2 hours;

  // Arrays
  LabFacility[] public labFacilities;
  LabTest[] public labTests;

  // Maps
  mapping (uint => address) public labTestToFacility;
  mapping (address => uint) public addressToLabFacility;

  // Killswitch
  function setSmartContractState(uint8 state) external onlyOwner {
    require(state != contractState);
    contractState = state;
  }

  // Modifiers
  modifier smartContractEnabled () {
    require(contractState == uint8(SmartContractState.Enabled));
    _;
  }

  modifier labTestNew (uint id) {
    require(labTests[id].labTestState == uint8(LabTestState.New));
    _;
  }

  modifier labTestNotExpired (uint id) {
    require(labTests[id].expiryTime > now);
    require(labTests[id].labTestState != uint8(LabTestState.Expired));
    _;
  }
  modifier labTestNotCompleted (uint id) {
    require(labTests[id].labTestState != uint8(LabTestState.Completed));
    _;
  }

  modifier acceptTenderFeePaid () {
    require(msg.value==acceptTenderFee);
    _;
  }

  modifier labFacilityIsValid () {
    require(labFacilities[addressToLabFacility[msg.sender]].status == uint8(LabFacilityStatus.Approved));
    _;
  }

  modifier onlyOwnerOf(uint labTestId) {
    require(labTestToFacility[labTestId] == msg.sender);
    _;
  }

  // LabFacility Functions

  function getCountLabFacilities() external view returns (uint){
    return labFacilities.length;
  }

  function getFacilityIdForAddress(address labAddress) external view returns(uint){
    return addressToLabFacility[labAddress];
  }

  function addNewFacility(string facilityName, address labAddress, uint8 status) external onlyOwner smartContractEnabled {
    require(addressToLabFacility[labAddress] == 0);
    uint facilityId = labFacilities.push(LabFacility(facilityName, status, 0, 0, 0));
    addressToLabFacility[labAddress] = facilityId;
    NewLabFacility(facilityId, labAddress, status);
  }

  function approveFacility(address labAddress) external onlyOwner smartContractEnabled {
    labFacilities[addressToLabFacility[labAddress]].status = uint8(LabFacilityStatus.Approved);
    ApproveLabFacility(labAddress);
  }

  function suspendFacility(address labAddress) external onlyOwner smartContractEnabled {
    labFacilities[addressToLabFacility[labAddress]].status = uint8(LabFacilityStatus.Suspended);
    SuspendedLabFacility(labAddress);
  }

  function revokeFacility(address labAddress) external onlyOwner smartContractEnabled {
    labFacilities[addressToLabFacility[labAddress]].status = uint8(LabFacilityStatus.Revoked);
    RevokedLabFacility(labAddress);
  }

  function getLabFacilityForAddress(address labAddress) external view smartContractEnabled returns (string, uint8, uint, uint, uint) {
    return (labFacilities[addressToLabFacility[labAddress]].facilityName,
            labFacilities[addressToLabFacility[labAddress]].status,
            labFacilities[addressToLabFacility[labAddress]].acceptedCount,
            labFacilities[addressToLabFacility[labAddress]].completedCount,
            labFacilities[addressToLabFacility[labAddress]].cancelledCount);
  }

  function getLabStatusForAddress(address labAddress) external view smartContractEnabled returns (uint8){
    return labFacilities[addressToLabFacility[labAddress]].status;
  }

  // Constructor
  function HealthereumCore(){

    uint facilityId = labFacilities.push(LabFacility("Laboratory A", 0, 0, 0, 0));
    addressToLabFacility[0xd05Ce7d4b8B9EF7B9428184a70fEE7A96F5E133a] = facilityId;
    NewLabFacility(facilityId, 0xd05Ce7d4b8B9EF7B9428184a70fEE7A96F5E133a, 0);

    facilityId = labFacilities.push(LabFacility("Laboratory B", 0, 0, 0, 0));
    addressToLabFacility[0xD86B7232Fdaac6d6b276f503db6FA0e7D6a1370c] = facilityId;
    NewLabFacility(facilityId, 0xD86B7232Fdaac6d6b276f503db6FA0e7D6a1370c, 0);

    // Setup creation and expiry time for lab test tender
    uint creationTime = block.timestamp;
    uint expiryTime = creationTime + labTestExpiryTime;

    uint id = labTests.push(LabTest("Blood Test", "QmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t", "N/A", "BLD", uint8(3008), uint8(LabTestState.New), creationTime, expiryTime));
    labTestToFacility[id] = owner;

    id = labTests.push(LabTest("Urine Test", "QmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t", "N/A", "URN", uint8(3008), uint8(LabTestState.New), creationTime, expiryTime));
    labTestToFacility[id] = owner;

    id = labTests.push(LabTest("Cholestrol Test", "QmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t", "N/A", "LHLHDL", uint8(3008), uint8(LabTestState.New), creationTime, expiryTime));
    labTestToFacility[id] = owner;

    id = labTests.push(LabTest("Allergy Blood Test", "QmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t", "N/A", "ALLERGY", uint8(3008), uint8(LabTestState.New), creationTime, expiryTime));
    labTestToFacility[id] = owner;

    id = labTests.push(LabTest("Antibody Test", "QmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t", "N/A", "ABD", uint8(3008), uint8(LabTestState.New), creationTime, expiryTime));
    labTestToFacility[id] = owner;
  }

  // LabTest functions
  function getCountLabTests() external view returns (uint){
    return labTests.length;
  }

  function postLabTender(string description, string testIPFSHash, string testType, uint8 postcode)
  external payable onlyOwner smartContractEnabled {
    // Owner must pay fee to post a lab test for tender
    require(msg.value == postLabTenderFee);

    // Setup creation and expiry time for lab test tender
    uint creationTime = block.timestamp;
    uint expiryTime = creationTime + labTestExpiryTime;

    // Push test to the labTest array
    uint id = labTests.push(LabTest(description, testIPFSHash, "N/A", testType, postcode, uint8(LabTestState.New), creationTime, expiryTime));

    // Finally set the owner of this test as the Insurer (onlyOwner) while it is "New"
    labTestToFacility[id] = msg.sender; // not necessary
    LabTestPosted(id);
  }

  function processExpiredTests() external onlyOwner smartContractEnabled {
    // Find any expired lab tests that have not been picked up
    uint expiredCount;
    for(uint i = 0; i < labTests.length; i++){
      if(labTests[i].expiryTime > now){
        // Update test status
        labTests[i].labTestState = uint8(LabTestState.Expired);
        LabTestExpired(i);
        expiredCount.add(1);
      }
    }
    // .. and retrieve the tender fees we posted for them
    owner.transfer(expiredCount * postLabTenderFee);
  }

  function getLabTest(uint id) external view smartContractEnabled
  returns (   string, //description;
              string, // testIPFSHash;
              string, // resultsIPFSHash;
              string, // testType;
              uint8, // postcode;
              uint8, // labTestState;
              uint, // postedTime;
              uint // expiryTime;
          )
  {
    require(id < labTests.length);
    LabTest memory lt = labTests[id];

    return (
      lt.description,
      lt.testIPFSHash,
      lt.resultsIPFSHash,
      lt.testType,
      lt.postcode,
      lt.labTestState,
      lt.postedTime,
      lt.expiryTime
      );
  }

  function acceptCompletedLabTest (uint id) external onlyOwner smartContractEnabled {
    require(labTests[id].labTestState == uint8(LabTestState.Completed));

    // Reward successful practitioner by sending your tender fee and their acceptance fee back to them
    uint rewardForLabFacility = postLabTenderFee.add(acceptTenderFee);
    labTestToFacility[id].transfer(rewardForLabFacility);

    // Reset the facility of this test back to owner
    labTestToFacility[id] = owner;
  }

  function acceptLabTest (uint id)
  external payable
  /*acceptTenderFeePaid labTestNew(id) labTestNotExpired(id) labFacilityIsValid smartContractEnabled*/
  {

    labTests[id].labTestState = uint8(LabTestState.Accepted);
    labTestToFacility[id] = msg.sender;
    labFacilities[addressToLabFacility[msg.sender]].acceptedCount = labFacilities[addressToLabFacility[msg.sender]].acceptedCount.add(1);
    LabTestAccepted(msg.sender, id);
  }

  function completeLabTest (uint id, string resultsIPFSHash)
  external labTestNotExpired(id) labFacilityIsValid() onlyOwnerOf(id) smartContractEnabled {

    labTests[id].labTestState = uint8(LabTestState.Completed);
    labTests[id].resultsIPFSHash = resultsIPFSHash;
    labTestToFacility[id] = owner;
    labFacilities[addressToLabFacility[msg.sender]].completedCount = labFacilities[addressToLabFacility[msg.sender]].completedCount.add(1);
    LabTestCompleted(msg.sender, id);
  }

  function cancelLabTest (uint id)
  external labTestNotExpired(id) labTestNotCompleted(id) labFacilityIsValid() onlyOwnerOf(id) smartContractEnabled {

    labTests[id].labTestState = uint8(LabTestState.Cancelled);
    labTestToFacility[id] = owner;
    labFacilities[addressToLabFacility[msg.sender]].cancelledCount = labFacilities[addressToLabFacility[msg.sender]].cancelledCount.add(1);
    LabTestCancelled(msg.sender, id);
  }

  function retreiveLabTestResults(uint id) external view onlyOwner returns(string) {
    return labTests[id].resultsIPFSHash;
  }

  function retreiveLabTestRequest(uint id) external view onlyOwnerOf(id) returns(string) {
    return labTests[id].testIPFSHash;
  }
}
