import * as React from 'react';
import { compose } from 'recompose';

import { NavLink, useLocation } from 'react-router-dom';
import { BaseComponent, IShellPage, ShellErrorHandler } from './shellInterfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { TFunction, withTranslation, WithTranslation } from 'react-i18next';
import { supportedLanguages, languageCodeOnly } from '../i18n';
import './shellNav.css';
import './shellNav.icons.css';
import { Wallet } from './wallet';
import { withWallet } from './walletContext';
import { ShoefyNFTStaking } from './contracts/nftStaking';

import CachedIcon from '@mui/icons-material/Cached';
import AppsIcon from '@mui/icons-material/Apps';
import InputIcon from '@mui/icons-material/Input';

import mark from '../../src/images/mark.png';
import mark1 from '../../src/images/mark1.png';
import FoxImg from '../images/fox.png';

import { Shoefy } from './contracts/shoefy';

export type ShellNavProps = {
	pages: IShellPage[];
	wallet?: Wallet,
};

export type ShellNavState = {
	currentPage?: IShellPage;
	shoefy?: Shoefy,
	address?: string,
	accountEllipsis?: string
};

class ShellNav extends BaseComponent<ShellNavProps & WithTranslation, ShellNavState> {
	private collapseRef = React.createRef<HTMLButtonElement>();
	constructor(props: ShellNavProps & WithTranslation) {
		super(props);

		this.connectWallet = this.connectWallet.bind(this);
		this.disconnectWallet = this.disconnectWallet.bind(this);
	}

	async componentDidMount() {
		if ((window.ethereum || {}).selectedAddress) {
			this.connectWallet();
		}
	}

	async connectWallet() {
		try {
			this.updateState({ pending: true });
			// const wallet = new Wallet();
			const wallet = this.props.wallet;
			const result = await wallet.connect();

			if (!result) {
				throw 'The wallet connection was cancelled.';
			}

			const shoefy = new Shoefy(wallet);

			this.updateState({ shoefy: shoefy, wallet: wallet, looping: true, pending: false });
			this.updateOnce(true).then();
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}

	async disconnectWallet() {
		try {
			this.updateState({ pending: true });
			const result = await this.props.wallet.disconnect();
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

	private async updateOnce(): Promise<boolean> {
		const shoefy = this.readState().shoefy;

		this.updateState({
			address: this.props.wallet._address,
			accountEllipsis: this.props.wallet._address ? `${this.props.wallet._address.substring(0, 4)}...${this.props.wallet._address.substring(this.props.wallet._address.length - 4)}` : '___'
		});

		return true;
	}

	handleError(error) {
		ShellErrorHandler.handle(error);
	}

	render() {
		const pages: IShellPage[] = (this.readProps().pages || []);
		const t: TFunction<"translation"> = this.readProps().t;
		const i18n = this.readProps().i18n;

		const pages1 = pages.slice(0, 2);
		const pages2 = pages.slice(3, 7);

		const state = this.readState();
		
		return (
			<div className="navigation-wrapper">
				<div className="logo-wrapper">
					<a href="/home">
						<img src={mark} className="img-logo" alt="ShoeFy Finance" />
						<span className="font_logo">ShoeFy</span>
					</a>
					<button className="navbar-toggler" type="button" data-bs-target="#mainNav" data-bs-toggle="collapse"
						aria-controls="navbarSupportedContent" aria-label="Toggle navigation" ref={this.collapseRef}>
						<FontAwesomeIcon icon={faBars} />
					</button>
				</div>
				<nav id="mainNav">
					<ul className="navbar-nav">
						<li className="nav_letter1"><NavLink className="link_letter" to="nftStaking">NFTs Staking</NavLink></li>
						<li className="nav_letter"><NavLink className="link_letter" to="shoefyStaking">Shoe Staking</NavLink></li>
						<li className="nav_letter"><NavLink className="link_letter" to="nftFarming">Farm</NavLink></li>
						<li className="nav_letter"><NavLink className="link_letter" to="shoefyStaking2">Booster NFTs</NavLink></li>
						<li className="nav_letter">
							{this.props.wallet._address ?
								<div onClick={this.disconnectWallet} className="wallet-connect">
									{state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" > </span>}
									<span className="ih_rtext">{this.state.accountEllipsis}</span>
								</div>
								:
								<div onClick={this.connectWallet} className="wallet-connect">
									{state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" > </span>}
									<span className="ih_rtext">{t('staking.connect_wallet')}</span>
								</div>
							}
						</li>
					</ul>
				</nav>
			</div>
		)
	}
}

// export default withTranslation()(ShellNav);
const ShellNavWithTranlation = withTranslation()(ShellNav);

const ShellNavMain = compose(
  withWallet,
)(ShellNavWithTranlation);

export default ShellNavMain