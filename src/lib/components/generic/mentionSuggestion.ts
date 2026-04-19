import tippy, { type Instance as TippyInstance } from 'tippy.js';
import MentionList from './MentionList.svelte';
import type { MentionSuggestionConfig } from './tiptapExtensions';

export const mentionSuggestion: MentionSuggestionConfig = {
	// Fetch data from the user search API
	items: async ({ query }) => {
		const response = await fetch(
			`/api/user/search?q=${encodeURIComponent(query)}`,
		);
		if (!response.ok) return [];
		return response.json();
	},

	// Render the Svelte component inside a Tippy popup
	render: () => {
		let component: MentionList;
		let popup: TippyInstance[];
		let wrapper: HTMLDivElement;

		return {
			onStart: (props) => {
				wrapper = document.createElement('div');

				component = new MentionList({
					target: wrapper,
					props: {
						items: props.items,
						command: props.command,
					},
				});

				popup = tippy('body', {
					getReferenceClientRect: props.clientRect as () => DOMRect,
					appendTo: () => document.body,
					content: wrapper,
					showOnCreate: true,
					interactive: true,
					trigger: 'manual',
					placement: 'top-start',
				});
			},

			onUpdate(props) {
				component.$set({
					items: props.items,
					command: props.command,
				});

				popup[0].setProps({
					getReferenceClientRect: props.clientRect as () => DOMRect,
				});
			},

			onKeyDown(props) {
				if (props.event.key === 'Escape') {
					popup[0].hide();
					return true;
				}
				return component.onKeyDown(props);
			},

			onExit() {
				popup[0].destroy();
				component.$destroy();
				wrapper.remove();
			},
		};
	},
};
