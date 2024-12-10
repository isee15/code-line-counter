# Stylus

Stylus is a browser extension developed using WXT (Web Extension Tools) for managing and modifying website styles and functionalities. With simple configurations, you can customize the appearance and behavior of web pages to achieve personalized experiences.

## Key Features

### Style Management
- Create and manage multiple stylesheets
- Support for real-time CSS editing and preview
- Apply styles to specific websites
- Import and export stylesheets
- Built-in common style templates

### Function Management
- Inject custom JavaScript functions
- Support for handling various content types:
  - JavaScript code injection
  - HTML content modification
  - Dynamic CSS style changes
  - JSON data processing
- Provide predefined function templates
- Enable/disable function control

### Rule System
- Flexible URL matching rules
  - Support regular expressions
  - Support wildcard matching
  - Support multiple URL patterns
- Multiple rule types:
  - Block resource loading
  - Modify resource content
  - Inject custom code
- Rule priority management

### Additional Features
- Set page encoding
- Copy text from websites that forbid user copy actions

### Multi-language Support
- Simplified Chinese
- Traditional Chinese
- Japanese
- Korean
- English

## Project Screenshots

### Main Interface
![Main Interface](docs/images/main.png)
*Main interface for managing styles and functions*

### Style Editor
![Style Editor](docs/images/style-editor.png)
*Powerful style editing capabilities*

### Function Editor
![Function Editor](docs/images/function-editor.png)
*JavaScript function editing interface*

## Technology Stack

- WXT (Web Extension Tools)
- React 18
- TypeScript 5
- Stylus
- Chrome Extension Manifest V3

## Development Environment Setup

### System Requirements
- Node.js 16.0 or higher
- npm 7.0 or higher
- Edge browser (for development and testing)

### Development Steps

1. Clone the project
```bash
git clone [project-url]
cd stylus
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Load the extension in Edge browser
- Open Edge browser
- Visit `edge://extensions/`
- Enable "Developer mode"
- Click "Load unpacked extension" and select the project's `dist` directory

### Project Structure
```
stylus/
├── src/                # Source code directory
│   ├── components/     # React components
│   ├── hooks/          # Custom Hooks
│   ├── i18n/           # Internationalization files
│   ├── store/          # State management
│   └── utils/          # Utility functions
├── entrypoints/        # Extension entry points
├── public/             # Static resources
└── docs/               # Documentation and images
```

### Update Extension Icons

1. Prepare icon files
   - Prepare icons in different sizes: 16x16, 32x32, 48x48, 128x128
   - Supported formats: PNG (recommended) or ICO
   - Suggested to use transparent background

2. Replace icon files
   - Place the prepared icon files in the `public/icons/` directory
   - Icon naming convention:
     ```
     icon-16.png
     icon-32.png
     icon-48.png
     icon-128.png
     ```

3. Update configuration file
   - Open `wxt.config.ts` file
   - Modify the icon configuration:
     ```typescript
     export default defineConfig({
       manifest: {
         icons: {
           16: 'icons/icon-16.png',
           32: 'icons/icon-32.png',
           48: 'icons/icon-48.png',
           128: 'icons/icon-128.png'
         }
       }
     })
     ```

4. Rebuild the extension
   ```bash
   npm run build
   ```

### Development Suggestions
- Follow TypeScript type definitions
- Use React Hooks for state management
- Maintain single responsibility for components
- Write unit test cases
- Use ESLint and Prettier to maintain code style

## Compilation and Release

### Development Version
```bash
# Build development version
npm run build:dev
```

### Production Version
```bash
# Build production version
npm run build
```

### Edge Plugin Release Steps

1. Build production version
```bash
npm run build
```

2. Package the extension
- Generated files are located in the `dist` directory
- Compress the `dist` directory into a ZIP file

3. Publish to Edge Store
- Visit [Edge Developer Center](https://partner.microsoft.com/en-us/dashboard/microsoftedge/overview)
- Log in to your developer account
- Click "Submit new extension"
- Upload the ZIP file
- Fill in the extension details
- Submit for review

## Debugging Guide

### Common Issues
1. Extension cannot be loaded
   - Check the format of the manifest.json file
   - Ensure the permissions configuration is correct
   - View the error information in the browser console

2. Styles not applied
   - Check URL matching rules
   - Confirm whether the stylesheet is enabled
   - Check for CSS syntax errors

3. Function injection failed
   - Check JavaScript syntax
   - Confirm whether the injection timing is correct
   - View error logs in the console

### Development Tools
- Chrome DevTools
- React Developer Tools
- WXT Debugging Tools

## License

[MIT License](LICENSE)

## Contribution Guide

Welcome to submit Issues and Pull Requests to help improve the project. Before submitting, please:

1. Review existing Issues and PRs
2. Follow the project's code guidelines
3. Write clear commit messages
4. Update relevant documentation

