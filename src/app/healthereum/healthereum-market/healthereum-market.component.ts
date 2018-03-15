import {Component, OnInit} from '@angular/core';
import {Web3Service} from '../../../util/web3.service';
import  healthereum_artifacts  from '../../../../build/contracts/HealthereumCore.json';

@Component({
  selector: 'app-healthereum-market',
  templateUrl: './healthereum-market.component.html',
  styleUrls: ['./healthereum-market.component.css']
})
export class HealthereumMarketComponent implements OnInit {
  accounts: string[];
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

  async acceptLabTest() {
    if (!this.HealthereumCore) {
      this.setStatus('HealthereumCore is not loaded, unable to send transaction');
      return;
    }

    const amount = this.model.amount;
    const receiver = this.model.receiver;

    console.log('Accepting test' + amount + ' to ' + receiver);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedHealthereumCore = await this.HealthereumCore.deployed();
      const transaction = await deployedHealthereumCore.acceptLabTest.sendTransaction(receiver, amount, {from: this.model.account});

      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error sending coin; see log.');
    }
  }

  async refreshBalance() {
    console.log('Refreshing balance');

    try {
      const deployedHealthereumCore = await this.HealthereumCore.deployed();
      const HealthereumCoreBalance = await deployedHealthereumCore.getBalance.call(this.model.account);
      console.log('Found balance: ' + HealthereumCoreBalance);
      this.model.balance = HealthereumCoreBalance;
    } catch (e) {
      console.log(e);
      this.setStatus('Error getting balance; see log.');
    }
  }

  clickAddress(e) {
    this.model.account = e.target.value;
    this.refreshBalance();
  }

  setAmount(e) {
    console.log('Setting amount: ' + e.target.value);
    this.model.amount = e.target.value;
  }

  setReceiver(e) {
    console.log('Setting receiver: ' + e.target.value);
    this.model.receiver = e.target.value;
  }

}
