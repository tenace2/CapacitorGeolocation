<template>
	<div class="geolocation-demo">
		<h1>@capacitor/geolocation Demo</h1>

		<!-- Platform Check -->
		<div class="feature-section">
			<div class="feature-card">
				<h3>Platform Check</h3>
				<p>Check which platform the app is running on (Native or Web).</p>
				<button @click="checkPlatform">Check Platform</button>
				<div class="result-box">
					<pre>{{ platformInfo }}</pre>
				</div>
			</div>
		</div>

		<!-- Permissions Section -->
		<div class="feature-section">
			<h2>Permissions</h2>

			<div class="feature-card">
				<h3>Check Permissions</h3>
				<p>Check current location permissions status on the device.</p>
				<button @click="checkPermissions">Check Permissions</button>
				<div class="result-box">
					<pre>{{ permissionsStatus }}</pre>
				</div>
			</div>

			<div class="feature-card">
				<h3>Request Permissions</h3>
				<p>Request location permissions from the user. Not available on web.</p>
				<button @click="requestPermissions">Request Permissions</button>
				<button @click="toggleExplanation" class="explanation-btn">
					{{ showExplanation ? 'Hide Explanation' : 'Show Explanation' }}
				</button>
				<div class="result-box">
					<pre>{{ permissionsRequestResult }}</pre>
				</div>
				<div v-if="requestPermissionsError" class="error-box request-error">
					<p><strong>Code:</strong> {{ requestPermissionsError.code }}</p>
					<p><strong>Message:</strong> {{ requestPermissionsError.message }}</p>
				</div>
				<div v-if="showExplanation" class="explanation-box">
					<h4>Platform Differences in Permission Handling</h4>
					<strong>Android (and iOS):</strong>
					<ul>
						<li>
							On native platforms like Android,
							<code>Geolocation.requestPermissions()</code> is implemented and
							used to explicitly request location permissions from the user at
							runtime.
						</li>
						<li>
							This method interacts with the native permission system to prompt
							the user for access, which is required by Android's security
							model.
						</li>
					</ul>
					<strong>Web:</strong>
					<ul>
						<li>
							On the web, <code>Geolocation.requestPermissions()</code> is
							<strong>not implemented</strong> in the Capacitor Geolocation
							plugin.
						</li>
						<li>
							The official Capacitor documentation explicitly states: <br />
							<em
								>"Request location permissions. Will throw if system location
								services are disabled. Not available on web."</em
							>
						</li>
						<li>
							Instead, the browser's own Geolocation API manages permissions.
							When you call <code>getCurrentPosition()</code> or
							<code>watchPosition()</code>, the browser will automatically
							prompt the user for permission if needed, and there is no separate
							API to pre-request or check permissions in advance.
						</li>
					</ul>
				</div>
			</div>
		</div>

		<!-- Current Position Section -->
		<div class="feature-section">
			<h2>Get Current Position</h2>

			<div class="feature-card">
				<h3>Get Current Position</h3>
				<p>Get the current GPS location of the device.</p>
				<div class="options-form">
					<div class="form-group">
						<label>
							<input
								type="checkbox"
								v-model="currentPosOptions.enableHighAccuracy"
							/>
							Enable High Accuracy
						</label>
						<p class="option-description">
							Uses GPS if available (may consume more battery).
						</p>
					</div>

					<div class="form-group">
						<label
							>Timeout (ms):
							<input
								type="number"
								v-model.number="currentPosOptions.timeout"
								min="0"
							/>
						</label>
						<p class="option-description">
							Maximum wait time for location data.
						</p>
					</div>

					<div class="form-group">
						<label
							>Maximum Age (ms):
							<input
								type="number"
								v-model.number="currentPosOptions.maximumAge"
								min="0"
							/>
						</label>
						<p class="option-description">
							Maximum age of cached position that is acceptable.
						</p>
					</div>
				</div>

				<button @click="getCurrentPosition">Get Current Position</button>
				<div class="result-box">
					<pre>{{ currentPosition }}</pre>
				</div>
			</div>
		</div>

		<!-- Watch Position Section -->
		<div class="feature-section">
			<h2>Watch Position</h2>

			<div class="feature-card">
				<h3>Watch Position</h3>
				<p>
					Set up a watch for location changes. Note that watching for location
					can consume significant energy.
				</p>
				<div class="options-form">
					<div class="form-group">
						<label>
							<input
								type="checkbox"
								v-model="watchPosOptions.enableHighAccuracy"
							/>
							Enable High Accuracy
						</label>
					</div>

					<div class="form-group">
						<label
							>Timeout (ms):
							<input
								type="number"
								v-model.number="watchPosOptions.timeout"
								min="0"
							/>
						</label>
					</div>

					<div class="form-group">
						<label
							>Maximum Age (ms):
							<input
								type="number"
								v-model.number="watchPosOptions.maximumAge"
								min="0"
							/>
						</label>
					</div>

					<div class="form-group">
						<label
							>Minimum Update Interval (ms):
							<input
								type="number"
								v-model.number="watchPosOptions.minimumUpdateInterval"
								min="0"
							/>
						</label>
						<p class="option-description">
							Android only: Minimum time between updates.
						</p>
					</div>
				</div>

				<button @click="startWatchPosition" :disabled="isWatching">
					Start Watching
				</button>
				<button @click="stopWatchPosition" :disabled="!isWatching">
					Stop Watching
				</button>
				<div class="result-box">
					<p>Watch ID: {{ watchId || 'Not watching' }}</p>
					<p>Updates received: {{ watchUpdatesCount }}</p>
					<pre>{{ watchPosition }}</pre>
				</div>
			</div>
		</div>

		<!-- Error Display -->
		<div v-if="error" class="error-section">
			<h3>General Error</h3>
			<div class="error-box">
				<p><strong>Code:</strong> {{ error.code }}</p>
				<p><strong>Message:</strong> {{ error.message }}</p>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { ref, reactive } from 'vue';
	import { Geolocation } from '@capacitor/geolocation';
	import { Capacitor } from '@capacitor/core';

	// Platform info
	const platformInfo = ref('');

	// Permission states
	const permissionsStatus = ref('');
	const permissionsRequestResult = ref('');
	const requestPermissionsError = ref(null);

	// Current position
	const currentPosition = ref('');
	const currentPosOptions = reactive({
		enableHighAccuracy: false,
		timeout: 10000,
		maximumAge: 0,
	});

	// Watch position
	const watchPosition = ref('');
	const watchPosOptions = reactive({
		enableHighAccuracy: false,
		timeout: 10000,
		maximumAge: 0,
		minimumUpdateInterval: 5000,
	});
	const isWatching = ref(false);
	const watchId = ref('');
	const watchUpdatesCount = ref(0);

	// Error handling
	const error = ref(null);

	// Check platform
	const checkPlatform = () => {
		const isNative = Capacitor.isNativePlatform();
		const platformName = Capacitor.getPlatform();

		const platformData = {
			isNativePlatform: isNative,
			platform: platformName,
			description: isNative
				? `Running on native ${platformName} platform`
				: 'Running as a web application',
		};

		platformInfo.value = JSON.stringify(platformData, null, 2);
		console.log('Platform check:', platformData);
	};

	// Helper function to format position data for display
	const formatPosition = (position) => {
		if (!position) return 'No position data available';

		const { coords, timestamp } = position;
		return JSON.stringify(
			{
				timestamp,
				coords: {
					latitude: coords.latitude,
					longitude: coords.longitude,
					accuracy: coords.accuracy,
					altitude: coords.altitude,
					altitudeAccuracy: coords.altitudeAccuracy,
					heading: coords.heading,
					speed: coords.speed,
				},
			},
			null,
			2
		);
	};

	// Check permissions
	const checkPermissions = async () => {
		try {
			error.value = null;
			console.log('Checking permissions...');
			const status = await Geolocation.checkPermissions();
			console.log('Permissions status:', status);
			permissionsStatus.value = JSON.stringify(status, null, 2);
		} catch (err) {
			console.error('Error checking permissions:', err);
			error.value = {
				code: err.code || 'UNKNOWN',
				message: err.message || 'An unknown error occurred',
			};
			permissionsStatus.value = 'Error checking permissions';
		}
	};

	// Request permissions
	const requestPermissions = async () => {
		try {
			error.value = null;
			requestPermissionsError.value = null;
			console.log('Requesting permissions...');
			const status = await Geolocation.requestPermissions({
				permissions: ['location'],
			});
			console.log('Permissions request result:', status);
			permissionsRequestResult.value = JSON.stringify(status, null, 2);
		} catch (err) {
			console.error('Error requesting permissions:', err);
			requestPermissionsError.value = {
				code: err.code || 'UNKNOWN',
				message: err.message || 'An unknown error occurred',
			};
			permissionsRequestResult.value = 'Error requesting permissions';
		}
	};

	// Get current position
	const getCurrentPosition = async () => {
		try {
			error.value = null;
			currentPosition.value = 'Loading...';
			console.log('Getting current position with options:', currentPosOptions);
			const position = await Geolocation.getCurrentPosition(currentPosOptions);
			console.log('Current position result:', position);
			currentPosition.value = formatPosition(position);
		} catch (err) {
			console.error('Error getting current position:', err);
			error.value = {
				code: err.code || 'UNKNOWN',
				message: err.message || 'An unknown error occurred',
			};
			currentPosition.value = 'Error getting current position';
		}
	};

	// Watch position
	const startWatchPosition = async () => {
		try {
			error.value = null;
			if (isWatching.value) return;

			watchPosition.value = 'Waiting for position updates...';
			watchUpdatesCount.value = 0;

			console.log('Starting position watch with options:', watchPosOptions);
			watchId.value = await Geolocation.watchPosition(
				watchPosOptions,
				(position, err) => {
					if (err) {
						console.error('Error in watch callback:', err);
						error.value = {
							code: err.code || 'UNKNOWN',
							message: err.message || 'An unknown error occurred during watch',
						};
						return;
					}

					console.log('Watch update received:', position);
					watchUpdatesCount.value++;
					watchPosition.value = formatPosition(position);
				}
			);

			console.log('Watch started with ID:', watchId.value);
			isWatching.value = true;
		} catch (err) {
			console.error('Error starting position watch:', err);
			error.value = {
				code: err.code || 'UNKNOWN',
				message: err.message || 'An unknown error occurred',
			};
			watchPosition.value = 'Error starting position watch';
			isWatching.value = false;
		}
	};

	// Clear watch
	const stopWatchPosition = async () => {
		try {
			error.value = null;
			if (!isWatching.value || !watchId.value) return;

			console.log('Stopping watch with ID:', watchId.value);
			await Geolocation.clearWatch({
				id: watchId.value,
			});

			console.log('Watch stopped successfully');
			isWatching.value = false;
			watchId.value = '';
			watchPosition.value += '\n\nWatch stopped.';
		} catch (err) {
			console.error('Error stopping watch:', err);
			error.value = {
				code: err.code || 'UNKNOWN',
				message: err.message || 'An unknown error occurred',
			};
		}
	};
	//
	const showExplanation = ref(false);

	function toggleExplanation() {
		showExplanation.value = !showExplanation.value;
	}
</script>

<style scoped>
	.geolocation-demo {
		font-family: Arial, sans-serif;
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
	}

	h1 {
		text-align: center;
		margin-bottom: 30px;
	}

	h2 {
		margin-top: 30px;
		border-bottom: 1px solid #ccc;
		padding-bottom: 10px;
	}

	.feature-section {
		margin-bottom: 30px;
	}

	.feature-card {
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 15px;
		margin-bottom: 20px;
		background-color: #f9f9f9;
	}

	.feature-card h3 {
		margin-top: 0;
	}

	.options-form {
		margin: 15px 0;
		padding: 10px;
		background-color: #f0f0f0;
		border-radius: 5px;
	}

	.form-group {
		margin-bottom: 10px;
	}

	.option-description {
		margin: 0;
		font-size: 0.8em;
		color: #666;
	}

	button {
		background-color: #4caf50;
		color: white;
		border: none;
		padding: 10px 15px;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		font-size: 14px;
		margin: 4px 2px;
		cursor: pointer;
		border-radius: 5px;
	}

	button:disabled {
		background-color: #cccccc;
		cursor: not-allowed;
	}

	.result-box {
		margin-top: 10px;
		padding: 10px;
		background-color: #f5f5f5;
		border: 1px solid #ddd;
		border-radius: 4px;
		min-height: 50px;
		max-height: 300px;
		overflow: auto;
	}

	.result-box pre {
		margin: 0;
		white-space: pre-wrap;
	}

	.error-section {
		margin-top: 30px;
		padding: 15px;
		background-color: #ffebee;
		border: 1px solid #ffcdd2;
		border-radius: 8px;
	}

	.error-box {
		margin-top: 10px;
		background-color: #ffebee;
		border: 1px solid #ffcdd2;
		border-radius: 8px;
		padding: 10px;
	}

	.request-error {
		margin-top: 15px;
	}
</style>
