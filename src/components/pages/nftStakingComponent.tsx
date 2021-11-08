import * as React from 'react';
import * as numeral from 'numeral';

import { BaseComponent, ShellErrorHandler } from '../shellInterfaces';
import { Wallet } from '../wallet';
import { ShoefyNFTStaking } from '../contracts/nftStaking';
import { WithTranslation, withTranslation, TFunction, Trans } from 'react-i18next';
import { fadeInLeft, fadeInRight, pulse } from 'react-animations';
import styled, { keyframes } from 'styled-components';
import AnimatedNumber from 'animated-number-react';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FoxImg from '../../images/fox.png';
import './nftStakingComponent.css';

import {Header} from './header';
import {Footer} from './footer';

export type StakingProps = {};
export type StakingState = {
	nftStaking?: ShoefyNFTStaking,
	wallet?: Wallet,
	looping?: boolean,

	// actual set values
	address?: string,
	balance?: number,
	balance_eth?: number,
	stakedBalance?: number,
	pendingRewards?: number,
	userNFTs?: Array<any>,
	stakedNFTs?: Array<any>,
	apr?: number,

	// values pending to be set
	ctPercentageStake?: number,
	ctValueStake?: number,
	ctPercentageUnstake?: number,
	ctValueUnstake?: number,
	pending?: boolean
};

const FadeInLeftAnimation = keyframes`${fadeInLeft}`;
const FadeInLeftDiv = styled.div`
  animation: ease-out 0.8s ${FadeInLeftAnimation};
`;
const FadeInRightAnimation = keyframes`${fadeInRight}`;
const FadeInRightDiv = styled.div`
  animation: ease-out 0.8s ${FadeInRightAnimation};
`;
const PulseAnimation = keyframes`${pulse}`;
const PulseDiv = styled.div`
  animation: infinite 5s ${PulseAnimation};
`;

class NFTStakingComponent extends BaseComponent<StakingProps & WithTranslation, StakingState> {

	private _timeout: any = null;

	constructor(props: StakingProps & WithTranslation) {
		super(props);

		this.handleStakeSlider = this.handleStakeSlider.bind(this);
		this.handleInputStake = this.handleInputStake.bind(this);
		this.connectWallet = this.connectWallet.bind(this);
		this.disconnectWallet = this.disconnectWallet.bind(this);
		this.state = {};
	}

	handleStakeSlider(event) {
		this.setStakePercentage(event.target.value);
	}

	handleInputStake(event) {
		this.setStakeValue(event.target.value);
	}

	handleError(error) {
		ShellErrorHandler.handle(error);
	}

	async confirmStake(_id): Promise<void> {
		try {
			const state = this.readState();
			this.updateState({ pending: true });

			if (state.userNFTs.length > 0) {
				await state.nftStaking.stake(_id);
			}
			else {
				NotificationManager.warning("Can't stake a negative id.");
				return;
			}

			this.updateState({ pending: false });
			this.updateOnce(true).then();
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}

	async confirmUnstake(_id): Promise<void> {
		try {
			const state = this.readState();
			this.updateState({ pending: true });

			if (state.stakedNFTs.length > 0) {
				await state.nftStaking.unstakeAndClaim(_id);
			}
			else {
				NotificationManager.warning("Can't unstake a negative id.");
				return;
			}

			this.updateState({ pending: false });
			this.updateOnce(true).then();
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}

	async confirmClaimRewards(): Promise<void> {
		try {
			const state = this.readState();
			this.updateState({ pending: true });

			await state.nftStaking.claim();

			this.updateState({ pending: false });
			this.updateOnce(true).then();
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}

	async componentDidMount() {
		if ((window.ethereum || {}).selectedAddress) {
			this.connectWallet();
		}
	}

	componentWillUnmount() {
		if (!!this._timeout) {
			clearTimeout(this._timeout);
		}
		this.updateState({ nftStaking: null, looping: false });
	}

	private async loop(): Promise<void> {
		const self = this;
		const cont = await self.updateOnce.call(self);

		if (cont) {
			this._timeout = setTimeout(async () => await self.loop.call(self), 1000);
		}
	}
	private async updateOnce(resetCt?: boolean): Promise<boolean> {
		const nftStaking = this.readState().nftStaking;

		if (!!nftStaking) {
			try {
				await nftStaking.refresh();
				if (!this.readState().looping) {
					return false;
				}
				this.updateState({
					address: nftStaking.wallet.currentAddress,
					userNFTs: nftStaking.userNFTs,
					stakedNFTs: nftStaking.stakedNFTs,
					pendingRewards: nftStaking.pendingStakeRewards,
					apr: nftStaking.apr,
					balance_eth: nftStaking.balance_eth,
				});

				if (resetCt) {
					this.updateState({
						ctPercentageStake: 0,
						ctValueStake: 0,
						ctPercentageUnstake: 0,
						ctValueUnstake: 0
					})
				}

			}
			catch (e) {
				console.warn('Unable to update staking status', e);
			}
		}
		else {
			return false;
		}

		return true;
	}

	async connectWallet() {
		try {
			this.updateState({ pending: true });
			const wallet = new Wallet();
			const result = await wallet.connect();

			if (!result) {
				throw 'The wallet connection was cancelled.';
			}

			const nftStaking = new ShoefyNFTStaking(wallet);
			await nftStaking.refresh();

			this.updateState({ nftStaking: nftStaking, wallet: wallet, looping: true, pending: false });
			this.updateOnce(true).then();

			this.loop().then();
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}

	async disconnectWallet() {
		try {
			this.updateState({ pending: true });
			const result = await this.state.wallet.disconnect();
			if (result) {
				throw 'The wallet connection was cancelled.';
			}

			this.updateState({ nftStaking: null, wallet: null, address: null, looping: false, pending: false });
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}

	setStakePercentage(percent) {
		const r = this.readState().nftStaking;
		if (!r) return;

		const p = Math.max(0, Math.min(+(percent || 0), 100));
		const v = Math.min(((r.balance) * (p * 0.01)), (r.balance * 1));

		this.updateState({
			ctPercentageStake: p,
			ctValueStake: v,
		});
	}

	setStakeValue(value) {
		const r = this.readState().nftStaking;
		if (!r) return;

		const t = r.balance;
		const v = Math.max(0, Math.min(+(value || 0), r.balance));
		this.updateState({
			ctPercentageStake: Math.floor(100 * v / t),
			ctValueStake: v,
		});
	}

	render() {
		const state = this.readState();
		const t: TFunction<"translation"> = this.readProps().t;

		return <div className="staking-container">
			{/*<div className="i_header"> 
				<div className="ih_left">
					<SearchIcon sx={{ fontSize: 15 }}/>
					<span className="ih_text">Type of Cryptocurrency</span>
				</div>
				<div className="ih_right">
					<SettingsIcon  sx={{ fontSize: 15 }}/>
					<NotificationsIcon className="ih_alert" sx={{ fontSize: 15 }}/>
					{state.address ?
						<div onClick={this.disconnectWallet} className="wallet-connect">
							{state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" > </span>}
							{state.balance_eth+ " ETH"}
							<img className="ih_img" src={FoxImg} width="30" height="30"></img>
							<span className="ih_rtext">{t('staking.disconnect_wallet')}</span>
						</div>
						:
						<div onClick={this.connectWallet} className="wallet-connect">
							{state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" > </span>}
							<img className="ih_img" src={FoxImg} width="30" height="30"></img>
							<span className="ih_rtext">{t('staking.connect_wallet')}</span>
						</div>
					}
				</div>
			</div>*/}
			
			<div className="container">
				{/* <div className="row text-white staking-header ml-3">
					<div className="col-md-12 ">
						<div className="staking-title">
							<span>NFT</span>
							<span style={{ color: "#abd9ea" }}>Staking</span>
							{state.address ?
								(<a className="shadow btn btn-primary ladda-button btn-md btn-wallet float-right" role="button" onClick={this.disconnectWallet}>
									{state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"> </span>}
									{t('staking.disconnect_wallet')}
								</a>)
								:
								(<a className="shadow btn btn-primary ladda-button btn-md btn-wallet float-right" role="button" onClick={this.connectWallet}>
									{state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"> </span>}
									{t('staking.connect_wallet')}
								</a>)
							}
						</div>
					</div>
				</div> */}

				<div className="col staking-body mt-5">
					<FadeInLeftDiv className="col-md-12 d-flex">
						<div className="shadow d-flex flex-column flex-fill gradient-card primary">
							<h1>{t('staking.your_info.title')}</h1>
							<h2>{t('staking.your_info.wallet_address')}</h2>
							<p>{state.address || t('staking.your_info.connect_wallet')}</p>
							{/* <h2>{t('staking.your_info.tradeable')}</h2>
							<AnimatedNumber
								value={numeral(state.balance || 0).format('0.00')}
								duration="1000"
								formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}`}
								className="staking-info"
							>
								0 ShoeFy
							</AnimatedNumber>
							<h2>{t('staking.your_info.staked')}</h2>
							<AnimatedNumber
								value={numeral(state.stakedBalance || 0).format('0.00')}
								duration="1000"
								formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}`}
								className="staking-info"
							>
								0 ShoeFy
							</AnimatedNumber> */}
							<h2>{t('staking.your_info.pending_rewards')}</h2>
							<AnimatedNumber
								value={numeral(state.pendingRewards || 0).format('0.00')}
								duration="1000"
								formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}`}
								className="staking-info"
							>
								0 Shoefy
							</AnimatedNumber>
							<h2>{t('staking.your_info.apr')}</h2>
							<AnimatedNumber
								value={numeral(state.apr || 0).format('0.00')}
								duration="1000"
								formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}%`}
								className="staking-info"
							>
								0 Shoefy
							</AnimatedNumber>
							<div className="d-flex justify-content-center button-row">
								<button className="btn btn-complementary btn-md link-dark align-self-center stake-claim" disabled={state.pendingRewards <= 0} type="button" onClick={async () => this.confirmClaimRewards()}>{t('staking.stake.claim_rewards')}</button>
							</div>
						</div>
					</FadeInLeftDiv>
					{/* <FadeInRightDiv className="col-md-12 d-flex">
						<div className="shadow d-flex flex-column flex-fill gradient-card dark">
							<div style={{ margin: "-20px" }}>
								<ul role="tablist" className="nav nav-tabs" style={{ padding: "10px", paddingBottom: "0" }}>
									<li role="presentation" className="nav-item"><a role="tab" data-bs-toggle="tab" className="nav-link active" href="#ctl-stake">{t('staking.stake.title')}</a></li>
									<li role="presentation" className="nav-item"><a role="tab" data-bs-toggle="tab" className="nav-link" href="#ctl-unstake">{t('staking.unstake.title')}</a></li>
								</ul>
								<div className="tab-content">
									<div role="tabpanel" className="tab-pane active" id="ctl-stake">
										<form id="staking-form">
											<label className="form-label">{t('staking.stake.percentage')}</label>
											<div className="d-flex flex-row align-items-baseline staking-slider-wrapper">
												<input type="range" className="form-range form-control" min="0" max="100" step="1" disabled={state.pending} value={state.ctPercentageStake || 0} onChange={this.handleStakeSlider} style={{ border: "none", background: "none" }} />
												<label className="form-label align-self-center">{numeral(state.ctPercentageStake || 0).format('0')}%</label>
											</div>
											<div className="d-flex flex-row justify-content-evenly staking-percentages">
												<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setStakePercentage(0)}>0%</button>
												<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setStakePercentage(25)}>25%</button>
												<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setStakePercentage(50)}>50%</button>
												<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setStakePercentage(75)}>75%</button>
												<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setStakePercentage(100)}>100%</button>
											</div>
											<label className="form-label">{t('staking.stake.amount')}</label>
											<input type="number" className="form-control form-control-lg" disabled={state.pending} onChange={this.handleInputStake} value={state.ctValueStake || 0} />
											<div className="d-flex justify-content-center button-row">
												<button className="btn btn-primary btn-md link-dark align-self-center stake-confirm" disabled={state.ctValueStake <= 0 || state.pending} type="button" onClick={async () => this.confirmStake()}>{t('staking.stake.title')}</button>
												<button className="btn btn-complementary btn-md link-dark align-self-center stake-claim" disabled={state.pendingRewards <= 0} type="button" onClick={async () => this.confirmClaimRewards()}>{t('staking.stake.claim_rewards')}</button>
											</div>
										</form>
									</div>
									<div role="tabpanel" className="tab-pane" id="ctl-unstake">
										<form id="unstaking-form">
											<label className="form-label">{t('staking.unstake.percentage')}</label>
											<div className="d-flex flex-row align-items-baseline staking-slider-wrapper">
												<input type="range" className="form-range form-control" min="0" max="100" step="1" disabled={state.pending} value={state.ctPercentageUnstake || 0} onChange={this.handleUnstakeSlider} style={{ border: "none", background: "none" }} />
												<label className="form-label align-self-center">{numeral(state.ctPercentageUnstake || 0).format('0')}%</label>
											</div>
											<div className="d-flex flex-row justify-content-evenly staking-percentages">
												<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setUnstakePercentage(0)}>0%</button>
												<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setUnstakePercentage(25)}>25%</button>
												<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setUnstakePercentage(50)}>50%</button>
												<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setUnstakePercentage(75)}>75%</button>
												<button className="btn btn-dark btn-sm flex-grow-1 flex-shrink-0 flex-fill" type="button" disabled={state.pending} onClick={() => this.setUnstakePercentage(100)}>100%</button>
											</div>
											<label className="form-label">{t('staking.unstake.amount')}</label>
											<input type="number" className="form-control form-control-lg" disabled={state.pending} onChange={this.handleInputUnstake} value={state.ctValueUnstake || 0} />
											<div className="d-flex justify-content-center button-row">
												<button className="btn btn-primary btn-md link-dark align-self-center stake-confirm" disabled={state.ctValueUnstake <= 0 || state.pending} type="button" onClick={async () => this.confirmUnstake()}>{t('staking.unstake.title')}</button>
												<button className="btn btn-complementary btn-md link-dark align-self-center stake-claim" disabled={state.pendingRewards <= 0} type="button" onClick={async () => this.confirmClaimRewards()}>{t('staking.stake.claim_rewards')}</button>
											</div>
										</form>
									</div>
								</div>
							</div>
						</div>
					</FadeInRightDiv> */}
					<FadeInRightDiv className="col-md-12 d-flex mt-5">
						<div className="shadow d-flex flex-column flex-fill gradient-card dark">
							<div style={{ margin: "-20px" }}>
							<ul role="tablist" className="nav nav-tabs" style={{ padding: "10px", paddingBottom: "0" }}>
									<li role="presentation" className="nav-item"><a role="tab" data-bs-toggle="tab" className="nav-link active" href="#ctl-stake">{t('staking.stake.title')}</a></li>
									<li role="presentation" className="nav-item"><a role="tab" data-bs-toggle="tab" className="nav-link" href="#ctl-unstake">{t('staking.unstake.title')}</a></li>
								</ul>
								<div className="tab-content">
									<div role="tabpanel" className="tab-pane active" id="ctl-stake">
										<div className="row row-cols-3 nft-container">
											{
												state.userNFTs && state.userNFTs.map((item) => (
													<div className="col nft-item">
														<div className="d-flex nft-img">
															<img src={item.img} alt="" />
														</div>
														<div className="nft-text">
															<p>{item.title}</p>
															<p>{item.description}</p>
														</div>
														<div className="nft-action">
															<button className="btn btn-primary btn-md link-dark align-self-center stake-confirm" type="button" onClick={async () => this.confirmStake(item.id)}>{t('staking.stake.title')}</button>
														</div>
													</div>
												))
											}
										</div>
									</div>
									<div role="tabpanel" className="tab-pane" id="ctl-unstake">
										<div className="row row-cols-3 nft-container">
											{
												state.stakedNFTs && state.stakedNFTs.map((item) => (
													<div className="col nft-item">
														<div className="d-flex nft-img">
															<img src={item.img} alt="" />
														</div>
														<div className="nft-text">
															<p>{item.title}</p>
															<p>{item.description}</p>
														</div>
														<div className="nft-action">
														<button className="btn btn-primary btn-md link-dark align-self-center stake-confirm" type="button" onClick={async () => this.confirmUnstake(item.id)}>{t('staking.unstake.title')}</button>
														</div>
													</div>
												))
											}
										</div>
									</div>
								</div>
							
							</div>
						</div>
					</FadeInRightDiv>
				</div>
				
			</div>
			
			{/* <div className="part_f">
				<Footer/>
			</div> */}
			
			<NotificationContainer />
		</div>
	}
}

export default withTranslation()(NFTStakingComponent);
