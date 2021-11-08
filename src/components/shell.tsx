import * as React from 'react';
import { Header } from './pages/header';
import { Footer } from './pages/footer';

import {
	BrowserRouter as Router,
	Switch,
	Route,
	Redirect
} from 'react-router-dom';

import { ShellHost } from './shellHost';
import { BaseComponent, IShellPage } from './shellInterfaces';
import ShellNav from './shellNav';

import './shell.css';

export type ShellProps = {
	pages: IShellPage[];
};
export type ShellState = {
	currentPage: IShellPage
};

export class Shell extends BaseComponent<ShellProps, ShellState> {

	constructor(props: ShellProps) {
		super(props);
	}

	componentDidMount() {
	}

	render() {
		const pages = this.readProps().pages;
		return <Router>
			<div className="main-wrapper">
				{/*<ShellNav pages={pages} />*/}
				<div className="content-wrapper">
					<div className="part_c">
						<Switch>
							{pages.map(page => (
								<Route key={`${page.id}`} path={'/' + page.id}>
									<ShellHost page={page} />
								</Route>
							))}
							<Route
								exact
								path="/"
								render={() => {
									return (
										<Redirect to="/home" />
									)
								}}
							/>
						</Switch>
					</div>
				    {/*<div className="part_f">
						<Footer />
					</div>*/}
				</div>
			</div>
		</Router>
	}
}
