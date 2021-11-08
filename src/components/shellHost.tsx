import * as React from 'react';

import { BaseComponent, IShellPage } from './shellInterfaces';

export type ShellHostProps = {
	page: IShellPage;
};
export type ShellHostState = {};

export class ShellHost extends BaseComponent<ShellHostProps, ShellHostState> {

	constructor(props: ShellHostProps) {
		super(props);
	}

	render() {
		const page: IShellPage = this.readProps().page || { id: null, title: null, component: null };
		if (!page.component) {
			return null;
		}

		return React.createElement(page.component, {...page.componentProps} || {})
	}
}
