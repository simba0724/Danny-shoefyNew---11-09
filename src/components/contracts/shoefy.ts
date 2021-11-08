import {Wallet} from '../wallet';
import {Contract} from 'web3-eth-contract';
// import { ethers } from 'ethers';
import * as web3 from 'web3-utils';
import Web3 from 'web3';
export const ShoeFyAddress = "0xfBA067325d5F679D89f2933f4eA4c0158389455a";
export const StakingAddress = "0xb905C3FAe6EcA3075f88A4E817E6B21E0bE74517";
export const DonationWalletAddress = "0x50dF6f99c75Aeb6739CB69135ABc6dA77C588f93";
// export const Staking2Address = "0x4f4E5ff85C939b502EdC5B57ea0FC99694ebB1B4";
export const Staking2Address = "0x14ff266e92589065b3F6a636D5e65ABDa05bEF8B";

export class Shoefy {
	private readonly _wallet: Wallet;
	private readonly _contract: Contract;
	private readonly _shoeFyContract: Contract;
	private readonly _stakingContract: Contract;

	private _balance: number = 0;
	private _stake: number = 0;
	private _pendingRewards: number = 0;
	private _apr: number = 0;
	private _balance_eth:number =0;
	constructor(wallet: Wallet) {
		this._wallet = wallet;
		this._stakingContract = wallet.connectToContract(StakingAddress, require('./staking.abi.json'));
		this._shoeFyContract =  wallet.connectToContract(ShoeFyAddress, require('./shoefy.abi.json'));
		this._staking2Contract = wallet.connectToContract(Staking2Address, require('./staking2.abi.json'));

		this.stake2 = this.stake2.bind(this);
	}

	get contract(): Contract {
		return this._contract;
	}

	get wallet(): Wallet {
		return this._wallet;
	}
	get balance(): number {
		return this._balance;
	}
	get balance_eth(): number{
		return this._balance_eth;
	}
	get stakedBalance(): number {
		return this._stake;
	}
	get pendingStakeRewards(): number {
		return this._pendingRewards;
	}
	get apr(): number {
		return this._apr;
	}

	async approve(amount: number): Promise<void> {
		if (this._balance >= amount) {
			await this._shoeFyContract.methods.approve(StakingAddress, web3.toWei(String(amount),'ether')).send({'from': this._wallet._address});
		} else {
			throw 'Your shoefy balance is not sufficient to stake this amount';
		}
	}

	async approve2(amount: number): Promise<void> {
		if (this._balance >= amount) {
			let flag = await this._shoeFyContract.methods.approve(Staking2Address, web3.toWei(String(amount),'ether')).send({'from': this._wallet._address});
			return flag
		} else {
			throw 'Your shoefy balance is not sufficient to stake this amount';
		}
	}

	async stake2(amount: number, stakestep: number): Promise<void> {
		if (this._balance >= amount) {
			await this._staking2Contract.methods.stake(amount, stakestep).send({'from': this._wallet._address});
		}
		else {
			throw 'Your shoefy balance is not sufficient to stake this amount';
		}
	}

	async stake(amount: number): Promise<void> {
		await this.refresh();

		if (this._balance >= amount) {
			await this._stakingContract.methods.stakeIn(web3.toWei(String(amount),'ether')).send({'from': this._wallet._address});
		}
		else {
			throw 'Your shoefy balance is not sufficient to stake this amount';
		}
	}
	async unstakeAndClaim(amount: number): Promise<void> {
		await this.refresh();
		if (this._stake >= amount) {
			await this._stakingContract.methods.withdrawStake(web3.toWei(String(amount),'ether')).send({'from': this._wallet._address});
		}
		else {
			throw 'Your staked shoefy balance is not sufficient to unstake this amount';
		}
	}
	async claim(): Promise<void> {
		await this._stakingContract.methods.claimStakingRewards().send({'from': this._wallet._address});
		await this.refresh();
	}

	async refresh(): Promise<void> {
		let web3 = new Web3(window.ethereum);

		let balance_eth = await web3.eth.getBalance(this._wallet._address);
		// console.log((web3.utils.fromWei(balance_eth, "ether")+" ETH"));

		this._balance_eth = parseFloat((web3.utils.fromWei(balance_eth, "ether"))).toFixed(3);
		// console.log(this._balance_eth)
		this._balance = Math.floor(await this._shoeFyContract.methods.balanceOf(this._wallet._address).call() / (10 ** 12)) / (10 ** 6);
		this._stake = await this._stakingContract.methods.stakedBalanceOf(this._wallet._address).call() / (10 ** 18);
		this._pendingRewards = await this._stakingContract.methods.pendingRewards(this._wallet._address).call() / (10 ** 18);
		this._apr = await this._stakingContract.methods.getCurrentAPR().call() / 100;
		// console.log('_apr', this._balance);
	}
}
