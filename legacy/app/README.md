[日本語版 readme はこちら](./README-ja.md)

# PDF to Markdown

This application is a tool for uploading PDF files and analyzing their content using Mistral AI's OCR capabilities.

## Getting Mistral AI API Key

1. Access [Mistral AI](https://mistral.ai/) to create an account or log in
2. Generate an API key from the dashboard
3. Store the generated API key securely

## Vercel Blob Setup

Before deploying the application, you need to set up Vercel Blob storage:

1. **Create a Vercel project**

   - Access [Vercel](https://vercel.com/) to sign up/log in
   - Click "New Project" to create a new project

2. **Create a Vercel Blob store**

   - Select the "Storage" tab in the project dashboard
   - Click the "Connect Database" button
   - Select "Blob" in the "Create New" tab and click the "Continue" button
   - Configure the following settings:
     - Name: Any name (e.g., "PDF Storage")
     - Select "Create a new Blob store"
     - Select the environments where you want to add environment variables (typically all environments)
     - Optionally change the environment variable prefix in "Advanced Options"
   - Click the "Create" button to create the store

3. **Set up environment variables**

   - When the Blob store is created, the following environment variable will be automatically added to your project:
     - `BLOB_READ_WRITE_TOKEN`
   - To use this environment variable in your local development environment, pull the environment variables using Vercel CLI:
     ```bash
     vercel env pull
     ```

Once these settings are complete, you can proceed with deploying the application.

## Deploy on Vercel

Follow these steps to deploy the application on Vercel:

1. **Clone the repository**

   ```bash
   git clone https://github.com/link2004/pdf2md.git
   cd pdf2md
   ```

2. **Copy the .env.example file**

   ```bash
   cp .env.example .env
   ```

3. **Set up the required environment variables in the .env file**

   - Get `BLOB_READ_WRITE_TOKEN` from your Vercel dashboard and set it
   - Get `MISTRAL_API_KEY` from your Mistral AI account and set it

   ```
   MISTRAL_API_KEY=your_mistral_api_key
   BLOB_READ_WRITE_TOKEN=your_blob_read_write_token
   ```

4. **Deploy to Vercel**

   - Log in or create an account on [Vercel](https://vercel.com)
   - Click on "New Project"
   - Import your repository from GitHub
   - Add the same environment variables as in your `.env` file in the "Environment Variables" section
   - Click on the "Deploy" button

5. **Verify the deployment**
   - Once deployment is complete, access the provided URL to confirm that the application is working properly

Note: Environment variables contain sensitive information, so do not commit your `.env` file to public repositories like GitHub. Instead, set the environment variables directly in the Vercel dashboard.

## Features

- PDF file upload
- PDF storage in Vercel Blob
- PDF analysis using Mistral AI's OCR capabilities
- Display and editing of analysis results
- Export functionality in Markdown format

## Environment Setup

Set the following environment variables in your `.env.local` file:

```
# Vercel Blob settings
BLOB_READ_WRITE_TOKEN=your_blob_read_write_token

# Mistral AI settings
MISTRAL_API_KEY=your_mistral_api_key
```

## Using the Application

### Initial Setup

1. Access the application and register/login if required
2. Create a "New Project" from the home page

### Uploading and Analyzing PDFs

1. Click on the "Upload PDF" button to open the file selection dialog
2. Select the PDF file you want to analyze (multiple files are also supported)
   - Note: For server uploads, file size must be 20MB or less
   - Try clearing your browser cache if you encounter issues
3. Click on the "Upload" button to upload the PDF to Vercel Blob storage
4. After the upload is complete, click on the "Analyze with Mistral AI" button
5. Wait a few seconds to minutes for the analysis to complete (depending on the size and complexity of the PDF)

### Reviewing and Editing Analysis Results

1. The analysis results will be automatically displayed in Markdown format
2. You can freely edit the content in the text editor
3. Click on the "Save" button to save your edits
4. Use the "Preview" tab to see how the Markdown will be rendered

### Exporting Markdown

1. Click on the "Export" button and select the export format:
   - Markdown file (.md)
   - HTML (.html)
   - PDF (.pdf)
2. The file will be downloaded in your selected format

### Project Management

1. Access past analysis results from the "Projects" tab
2. Each project is automatically saved, and you can resume editing at any time
3. Share your projects with other users using the "Share" button

## Requirements

- Node.js 18 or higher
- Vercel account (with Blob store set up)
- Mistral AI account and API key

## Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

## Technology Stack

- Next.js
- TypeScript
- Vercel Blob (storage)
- Mistral AI (OCR processing)
- TailwindCSS (styling)
- React Markdown (markdown rendering)

## Troubleshooting

- **Unable to upload PDF**

  - Ensure the file size is 20MB or less (for server uploads)
  - Try clearing your browser cache

- **Analysis fails**

  - Check if the PDF is encrypted
  - For scanned PDFs, check if the image quality is sufficient

- **API errors displayed**
  - Verify that environment variables are correctly set
  - Check the expiration date and usage limits of your Mistral API key
  - Ensure that your Vercel Blob token is valid

## License

This project is released under the MIT License. See the [LICENSE](./LICENSE) file for details.
