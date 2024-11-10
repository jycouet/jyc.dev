<script lang="ts">
  import { route } from '$lib/ROUTES'

  let handle = ''
  let appPassword = ''
  let isLoading = false
</script>

<div class="mt-12 flex flex-col items-center justify-center px-4">
  <!-- Stars effect -->
  <div class="stars absolute inset-0"></div>

  <div class="relative z-10 w-full max-w-md">
    <!-- Rocket emoji with animation -->
    <div class="mb-6 text-center">
      <h1 class="mt-4 text-xl font-bold text-white">Welcome to the Next Level</h1>
    </div>

    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <form action={route('login /at/login')} method="post" class="flex flex-col gap-6">
          <!-- Step 1: Handle -->
          <div class="form-control">
            <label for="handle" class="label">
              <span class="label-text text-lg font-medium text-gray-300">1. Enter your Handle</span>
            </label>
            <input
              name="handle"
              type="text"
              bind:value={handle}
              placeholder="@handle.bsky.social"
              class="input input-bordered bg-gray-800 text-white placeholder:text-gray-500"
              required
              disabled={isLoading}
            />
          </div>

          <!-- Step 2: App Password Instructions -->
          <div class="rounded-lg bg-gray-800/50 p-4">
            <h3 class="text-lg font-medium text-gray-300">2. Create an App Password</h3>
            <ul class="mt-2 space-y-2 pl-4 text-sm text-gray-400">
              <li>
                a. Visit <a
                  href="https://bsky.app/settings/app-passwords"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link-hover text-sky-400">bsky.app/settings/app-passwords</a
                >
              </li>
              <li>b. Click on "Create App Password"</li>
              <li>c. Give it a name (e.g., "Atm Stats")</li>
              <li>d. Copy your new app password</li>
            </ul>
          </div>

          <!-- Step 3: App Password Input -->
          <div class="form-control">
            <label for="appPassword" class="label">
              <span class="label-text text-lg font-medium text-gray-300">3. Enter App Password</span
              >
            </label>
            <input
              name="appPassword"
              type="password"
              bind:value={appPassword}
              placeholder="Paste your app password here"
              class="input input-bordered bg-gray-800 text-white placeholder:text-gray-500"
              required
              disabled={isLoading}
            />
          </div>

          <!-- Step 4: Submit Button -->
          <button
            type="submit"
            class="btn btn-primary mt-2 gap-2 border-none bg-sky-500 hover:bg-sky-600"
            disabled={isLoading}
          >
            {#if isLoading}
              <span class="loading loading-spinner"></span>
            {/if}
            4. Log with Blue Sky
          </button>
        </form>
      </div>
    </div>

    <div class="mt-6 text-center">
      <div class="flex items-center justify-center gap-2">
        <div class="animate-pulse text-sm font-medium text-sky-400">Beta Version</div>
        <div class="animate-bounce text-2xl">🚀</div>
      </div>
      <p class="mt-4 text-gray-300">
        Ready to elevate your social experience? Join us as we push the boundaries of decentralized
        social networking. Your journey to the stars begins here! ✨
      </p>
    </div>
  </div>
</div>
