import {Component, OnInit} from '@angular/core';
import {Web3Service} from '../../../util/web3.service';
import  healthereum_artifacts  from '../../../../build/contracts/HealthereumCore.json';

@Component({
  templateUrl: './healthereum-market.component.html',
  styleUrls: ['./healthereum-market.component.css']
})
export class HealthereumMarketComponent implements OnInit {
  accounts: string[];
  labTests: any[] = [];
  HealthereumCore: any;

  model = {
    amount: 5,
    receiver: '',
    balance: 0,
    account: ''
  };

  status = '';

  constructor(private web3Service: Web3Service) {
    console.log('Constructor: ' + web3Service);
  }

  ngOnInit(): void {
    console.log('OnInit: ' + this.web3Service);
    console.log(this);
    this.watchAccount();
    this.web3Service.artifactsToContract(healthereum_artifacts)
      .then((HealthereumCoreAbstraction) => {
        this.HealthereumCore = HealthereumCoreAbstraction;
        this.getLabTests();
      });
  }

  watchAccount() {
    this.web3Service.accountsObservable.subscribe((accounts) => {
      this.accounts = accounts;
      this.model.account = accounts[0];
      this.refreshBalance();
    });
  }

  setStatus(status) {
    this.status = status;
  }

  async acceptLabTest(labTestId) {
    if (!this.HealthereumCore) {
      this.setStatus('HealthereumCore is not loaded, unable to send transaction');
      return;
    }

    // Acceptance fee is .001 eth (but is required in wei)
    const acceptanceFee = .001 * Math.pow(10,18);
    // Retrieve from view
    // var labTestId = 0;

    console.log(`labTestId = ${labTestId}`);
    // console.log('Accepting test' + amount + ' to ' + receiver);

    this.setStatus('Initiating acceptLabTest(labTestId)... (please wait)');
    try {
      const deployedHealthereumCore = await this.HealthereumCore.deployed();
      const transaction = await deployedHealthereumCore.acceptLabTest(labTestId, {from: this.model.account, value: acceptanceFee});

      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error accepting test; see log.');
    }
  }

  async getLabTests() {
    if (!this.HealthereumCore) {
      this.setStatus('HealthereumCore is not loaded, unable to send transaction');
      return;
    }

    this.setStatus('Getting lab tests... (please wait)');
    try {
      const deployedHealthereumCore = await this.HealthereumCore.deployed();

      var labTest;
      for(var i = 0 ; i<5; i++){
        labTest = await deployedHealthereumCore.getLabTest(i, {from: this.model.account});
        labTest.push(i);
        this.labTests.push(labTest);
        console.log(`labTest = ${labTest}`);
      }
      console.log(`labTests = ${this.labTests}`);

    } catch (e) {
      console.log(e);
      this.setStatus('Error getting test; see log.');
    }
  }

  async refreshBalance() {
    console.log('Refreshing balance');

    // try {
    //   const deployedHealthereumCore = await this.HealthereumCore.deployed();
    //   const HealthereumCoreBalance = await deployedHealthereumCore.getBalance.call(this.model.account);
    //   console.log('Found balance: ' + HealthereumCoreBalance);
    //   this.model.balance = HealthereumCoreBalance;
    // } catch (e) {
    //   console.log(e);
    //   this.setStatus('Error getting balance; see log.');
    // }
  }
}
