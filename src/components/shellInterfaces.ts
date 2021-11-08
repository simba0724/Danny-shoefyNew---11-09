import { Component } from 'react';
import { NotificationManager } from 'react-notifications';

export abstract class BaseComponent<TProps, TState> extends Component<TProps, TState> {

	protected constructor(props: TProps) {
		super(props);
	}

	public readProps(): TProps {
		const self: any = this;
		return self.props || {};
	}
	public readState(): TState {
		const self: any = this;
		return self.state || {};
	}
	public updateState(value: TState): TState {
		const self: any = this;
		self.setState(value);
		return this.readState();
	}
}

export interface ComponentRef extends Function { new(...args: any[]): Component; }

export interface IShellPage {
	id: String;
	title: String;

	component: ComponentRef;
	componentProps?: any;
}

export class ShellErrorHandler {
	static handle(error: any) {

		let message;
		console.error(error);

		if (!error) {
			message = "An unknown error occurred. Please let us know about it in our Telegram group."
		}
		else {
			if (!!error.message) {
				message = error.message;
			}
			else if (typeof error === 'string') {
				message = error;
			}
			else {
				message = "An unknown error occurred: " + error;
			}
		}
		NotificationManager.error(message);
	}
}
