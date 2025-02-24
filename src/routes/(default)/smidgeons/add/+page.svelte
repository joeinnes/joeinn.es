<script>
	import { run } from 'svelte/legacy';

	import PocketBase from 'pocketbase';
	const pb = new PocketBase('https://api.joeinn.es');

	import InkMde from 'ink-mde/svelte';
	import { marked } from 'marked';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';

	let value = $state('');
	let loggedIn = $state(false);
	let html = $state(value);
	onMount(async () => {
		const authData = await pb.collection('users').authRefresh();
		if (pb.authStore.isValid) loggedIn = true;
	});

	const onSubmit = async () => {
		const data = {
			summary: 'test',
			details: 'test'
		};
	};

	run(() => {
		html = marked(value);
	});
</script>

{#if !loggedIn}
	<form
		method="POST"
		use:enhance={async ({ formData, cancel }) => {
			const userName = formData.get('un');
			const pass = formData.get('p');
			try {
				const authData = await pb.collection('users').authWithPassword(userName, pass);
				loggedIn = true;
			} catch (e) {}
			cancel();
		}}
	>
		<div>
			<label for="un" class="font-semibold">Username</label>
			<input type="text" name="un" class="border rounded-md w-full px-2" required />
		</div>
		<div>
			<label for="p" class="font-semibold">Password</label>
			<input type="password" name="p" class="border rounded-md w-full px-2" required />
		</div>
		<button type="submit">Log In</button>
	</form>
{:else}
	<div class="flex flex-col w-full gap-2">
		<h1 class="font-semibold text-3xl not-prose">Today I learned...</h1>
		<form
			method="POST"
			use:enhance={async ({ formData, cancel }) => {
				const data = {
					summary: formData.get('summary'),
					details: html
				};
				const record = await pb.collection('til').create(data);
				window.location.reload();
				cancel();
			}}
		>
			<div>
				<label for="summary" class="font-semibold">Summary</label>
				<input type="text" name="summary" class="border rounded-md w-full px-2" required />
			</div>

			<div>
				<label for="details" class="font-semibold">Details</label>
				<div class="border rounded-md">
					<InkMde
						bind:value
						options={{
							interface: {
								toolbar: true
							}
						}}
					/>
				</div>
			</div>
			{html}
			<button
				class="flex gap-2 items-center p-2 px-4 no-underline bg-primary-700 text-white rounded self-center hover:bg-primary-900 focus:bg-primary-900 transition-colors"
				type="submit">Submit</button
			>
		</form>
	</div>
{/if}

<style>
	:global(.ink-mde-container) {
		outline: 0px !important;
	}
</style>
