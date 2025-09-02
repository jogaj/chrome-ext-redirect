# Chrome IP Redirect Extension

A simple Chrome extension that redirects you to a specified URL if your public IP address matches a configured IP. This is useful for scenarios where you want to access a specific site or version of a site only when connected from a certain network (e.g., home or office).

## Features

-   **Automatic Redirection**: Redirects to a pre-configured URL when your public IP matches a specific address.
-   **Simple Configuration**: An easy-to-use options page to set the IP to match and the destination URL.
-   **First-Time Setup**: Automatically prompts you to configure the extension if settings are not found.
-   **Loop Prevention**: Uses session storage to prevent multiple redirects within the same browser session.
-   **Allow only one instance** You can configure the extension to allow only one instance of the pre-configured URL.

## How It Works

The extension runs a script on every page you visit. This script performs the following actions:

1.  It checks if you have configured an "IP to Match", a "Redirect URL", and the "Allow only one instance" settings in the extension's options.
    -   If not, it redirects you to the options page to set them up.
2.  If the settings are configured, it checks if the "Allow only one instance" option is enabled.
    -   If it is, then checks if there is another tab opened with the "Redirect URL" to open a new empty tab.
3.  Otherwise, it fetches your current public IP address from the `ip-api.com` service.
3.  It compares your current IP with the "IP to Match".
4.  If they match, it redirects your browser to the "Redirect URL".

## How to Use

1.  **Install the Extension**: Follow the installation steps below.
2.  **Configure Settings**:
    -   After installation, you will be automatically taken to the options page. If not, right-click the extension icon in your Chrome toolbar and select "Options".
    -   In the "IP to Match" field, enter the public IP address that should trigger the redirect (e.g., `8.8.8.8`).
    -   In the "Redirect URL" field, enter the full URL where you want to be redirected (e.g., `https://example.com`).
    -   In the "Allow only one instance" check if you want only one instance of the redirect URL to be opened.
    -   Click "Save". A confirmation message will appear.
3.  **Browse**: Now, whenever you are connected to the internet via the specified IP address, the extension will automatically redirect you upon visiting any website.

## Installation for Development

Since this extension is not on the Chrome Web Store, you can load it locally in developer mode.

1.  Clone or download this repository to your local machine.
2.  Open Google Chrome and navigate to `chrome://extensions`.
3.  Enable "Developer mode" using the toggle switch in the top-right corner.
4.  Click the "Load unpacked" button.
5.  Select the root directory of this project (`/chrome-ext-redirect/`).
6.  The extension will be installed and ready to use.

## Project Structure

```
chrome-ext-redirect/
├── pages/
│   ├── options/
│   │   ├── options.html
│   │   ├── options.css
│   │   └── options.js   # Logic for the settings page
│   └── redirect/
│       ├── redirect.css # Styles for a "Redirecting..." message
│       └── redirect.js  # Content script for checking IP and redirecting
├── shared.css           # Shared styles
├── shared.js            # Shared constants
└── manifest.json        # Extension manifest file
```

-   **`manifest.json`**: Defines the extension's properties, permissions (`storage`), options page, and content scripts.
-   **`pages/options/`**: Contains the files for the user-facing settings page.
-   **`pages/redirect/redirect.js`**: The core logic. This content script runs on web pages, checks the user's IP, and performs the redirect if necessary.
-   **`shared.js`**: Contains constants used across different parts of the extension to avoid magic strings.
