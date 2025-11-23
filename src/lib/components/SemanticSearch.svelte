<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { getExtensions } from '$lib/util/file';
	import { PublicationCard } from '$lib';

	// Props
	export let title = 'Chat Assistant';
	export let placeholder = 'Type your message...';
	export let apiEndpoint = '/api/semanticsearch'; // The endpoint to send messages to

	// State
	let messages: Array<{text: string; isUser: boolean; index: number; timestamp: Date}> = [];
	let botIndex = 0;
	let inputMessage = '';
	let isOpen = false;
	let isLoading = false;
	let chatContainer: HTMLElement;
	let data: any[] = [];

	// Handle sending a message
	async function sendMessage() {
		if (!inputMessage.trim()) return;

		// Add user message to chat
		const userMessage = {
			text: inputMessage,
			isUser: true,
			index: -1,
			timestamp: new Date()
		};
		messages = [...messages, userMessage];

		// Clear input and set loading
		const messageToSend = inputMessage;
		inputMessage = '';
		isLoading = true;

		try {
			// Send to backend
			const response = await fetch(apiEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ message: messageToSend })
			});

			if (!response.ok) {
				throw new Error('Failed to get response');
			}

			const rJson = await response.json();

			// Ensure results exist
			if (!rJson.results || !Array.isArray(rJson.results) || rJson.results.length === 0) {
				throw new Error('No results returned');
			}

			// Store the starting index for this batch of results
			const startIndex = data.length;

			// Add new results to the data array
			data = [...data, ...rJson.results];

			// Add bot response to chat
			rJson.results.forEach((r:any, i:number) => {
				const currentIndex = startIndex + i; // Calculate the correct index in data array
				messages = [...messages, {
					text: r.content || 'Sorry, I couldn\'t process that request.',
					isUser: false,
					index: currentIndex,
					timestamp: new Date()
				}];
			});
		} catch (error) {
			console.error('Error sending message:', error);

			// Add error message
			messages = [...messages, {
				text: 'Sorry, there was an error processing your request.',
				isUser: false,
				index: -1,
				timestamp: new Date()
			}];
		} finally {
			isLoading = false;
		}
	}

	// Toggle chat visibility
	function toggleChat() {
		isOpen = !isOpen;
	}

	// Auto-scroll to bottom of chat when messages change
	afterUpdate(() => {
		if (chatContainer && isOpen) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	});

	// Format time
	function formatTime(date: Date): string {
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	// Handle keyboard shortcuts
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}
</script>

<div class="chatbot-container">
	<!-- Chat toggle button -->
	<button
		class="chat-toggle-button"
		on:click={toggleChat}
		aria-label={isOpen ? 'Close chat' : 'Open chat'}
	>
		{#if isOpen}
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="18" y1="6" x2="6" y2="18"></line>
				<line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		{:else}
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
			</svg>
		{/if}
	</button>

	<!-- Chat window -->
	{#if isOpen}
		<div class="chat-window" transition:slide={{ duration: 300 }}>
			<!-- Chat header -->
			<div class="chat-header">
				<h3>{title}</h3>
				<button class="close-button" on:click={toggleChat} aria-label="Close chat">
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>

			<!-- Chat messages -->
			<div class="chat-messages" bind:this={chatContainer}>
				{#if messages.length === 0}
					<div class="empty-state">
						<p>How can I help you today?</p>
					</div>
				{:else}
					{#each messages as message, i (i)}
						<div
							class="message-container {message.isUser ? 'user-message' : 'bot-message'}"
							transition:fade={{ duration: 150 }}
						>
							<div class="message">
								{#if !message.isUser}
									<!-- Check if this is a bot message with valid index -->
									{#if message.index >= 0 && message.index < data.length}
										<p>"...{message.text}..."</p>
										<p>Name of file: <b>{data[message.index].fileTitle}</b></p>
										<p><i>You can find this file in:</i></p>
										<PublicationCard
											extensions="{getExtensions(data[message.index])}"
											imgSrc={data[message.index].coverPicData}
											publication={data[message.index].publication}
											liked={false}
											saved={false}
											materialType={data[message.index].encapsulatingType}
											publisher={data[message.index].publisher}
										/>
									{:else}
										<!-- For error messages or other cases with invalid index -->
										<p>{message.text}</p>
									{/if}
								{:else}
									<p>{message.text}</p>
								{/if}
								<span class="timestamp">{formatTime(message.timestamp)}</span>
							</div>
						</div>
					{/each}

					{#if isLoading}
						<div class="message-container bot-message" transition:fade={{ duration: 150 }}>
							<div class="message loading">
								<span class="dot"></span>
								<span class="dot"></span>
								<span class="dot"></span>
							</div>
						</div>
					{/if}
				{/if}
			</div>

			<!-- Chat input -->
			<div class="chat-input">
				<textarea
					bind:value={inputMessage}
					on:keydown={handleKeydown}
					placeholder={placeholder}
					rows="1"
					aria-label="Message input"
				></textarea>
				<button
					class="send-button"
					on:click={sendMessage}
					disabled={!inputMessage.trim() || isLoading}
					aria-label="Send message"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="22" y1="2" x2="11" y2="13"></line>
						<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
					</svg>
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
    .chatbot-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
        Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }

    .chat-toggle-button {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: #4f46e5;
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: background-color 0.2s, transform 0.2s;
    }

    .chat-toggle-button:hover {
        background-color: #4338ca;
        transform: scale(1.05);
    }

    .chat-window {
        position: absolute;
        bottom: 70px;
        right: 0;
        width: 450px;
        height: 500px;
        background-color: white;
        border-radius: 12px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    .chat-header {
        padding: 15px;
        background-color: #4f46e5;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .chat-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
    }

    .close-button {
        background: transparent;
        border: none;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
    }

    .chat-messages {
        flex-grow: 1;
        padding: 15px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .empty-state {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #6b7280;
        text-align: center;
        padding: 0 20px;
    }

    .message-container {
        display: flex;
        margin-bottom: 10px;
    }

    .user-message {
        justify-content: flex-end;
    }

    .bot-message {
        justify-content: flex-start;
    }

    .message {
        max-width: 100%;
        padding: 10px 15px;
        border-radius: 18px;
        position: relative;
        word-break: break-word;
    }

    .user-message .message {
        background-color: #4f46e5;
        color: white;
        border-bottom-right-radius: 4px;
    }

    .bot-message .message {
        background-color: #f3f4f6;
        color: #1f2937;
        border-bottom-left-radius: 4px;
    }

    .message p {
        margin: 0 0 15px 0;
        line-height: 1.4;
    }

    .timestamp {
        position: absolute;
        bottom: 5px;
        right: 10px;
        font-size: 10px;
        opacity: 0.7;
    }

    .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 30px;
        width: 60px;
    }

    .dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        margin: 0 2px;
        background-color: #6b7280;
        border-radius: 50%;
        animation: dot-pulse 1.5s infinite ease-in-out;
    }

    .dot:nth-child(2) {
        animation-delay: 0.2s;
    }

    .dot:nth-child(3) {
        animation-delay: 0.4s;
    }

    @keyframes dot-pulse {
        0%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
        }
        50% {
            transform: scale(1.2);
            opacity: 1;
        }
    }

    .chat-input {
        padding: 10px 15px;
        display: flex;
        align-items: center;
        border-top: 1px solid #e5e7eb;
    }

    .chat-input textarea {
        flex-grow: 1;
        border: 1px solid #e5e7eb;
        border-radius: 20px;
        padding: 8px 15px;
        resize: none;
        outline: none;
        max-height: 100px;
        font-family: inherit;
        margin-right: 10px;
    }

    .chat-input textarea:focus {
        border-color: #4f46e5;
    }

    .send-button {
        background-color: #4f46e5;
        color: white;
        border: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .send-button:hover:not(:disabled) {
        background-color: #4338ca;
    }

    .send-button:disabled {
        background-color: #a5b4fc;
        cursor: not-allowed;
    }

    /* Responsive adjustments */
    @media (max-width: 600px) {
        .chat-window {
            width: calc(100vw - 40px);
            height: 60vh;
            bottom: 75px;
        }
    }
</style>