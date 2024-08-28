
# Script Authentication System with Discord Bot

## Overview

This project is a robust and secure script authentication system designed to manage and validate client scripts. The system is built with TypeScript and integrates seamlessly with Discord, leveraging a Discord bot for administrative tasks such as token management and script validation. The system ensures that only authorized scripts are allowed to run on the server.

## Features

- **Token Management**: Secure generation, updating, and deletion of tokens via Discord bot commands.
- **Script Authentication**: Verification of client scripts using tokens.
- **IP and Port Verification**: Ensures that tokens are used from the correct IP and server port.
- **Modular Architecture**: Clean and maintainable codebase, following clean code principles.
- **Discord Integration**: Full integration with Discord for managing authentication tasks.
- **Logging**: Detailed logging of bot activities for audit purposes.
- **Error Handling**: Robust error handling to ensure continuous operation of the bot.

## Prerequisites

- **Node.js** (version 14.x or higher)
- **TypeScript** (version 5.x or higher)
- **MySQL** (or any other supported SQL database)
- **Discord Bot Token** (You can create one by following the [Discord Developer Portal](https://discord.com/developers/applications))

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/feijonts/feijonts-auth-api.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd feijonts-auth-api
   ```

3. **Install the dependencies:**

   ```bash
   npm install
   ```

4. **Set up environment variables:**

   Create a `.env` file in the root directory and add the following variables:

   ```env
   DISCORD_TOKEN=your_discord_bot_token
   MYSQL_HOST=your_mysql_host
   MYSQL_USER=your_mysql_user
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_DATABASE=your_mysql_database
   ```

5. **Compile the TypeScript files:**

   ```bash
   npm run build
   ```

6. **Start the system:**

   ```bash
   npm start
   ```

   Alternatively, you can run the system in development mode with live reload:

   ```bash
   npm run dev
   ```

### Discord Bot Setup

- **Invite the bot to your Discord server** using the following OAuth2 link (replace `client_id` with your bot's client ID):

  ```
  https://discord.com/oauth2/authorize?client_id=your_client_id&scope=bot&permissions=8
  ```

## Usage

### Running in Development

To run the bot in development mode with automatic restarts on file changes, use:

```bash
npm run dev
```

### Building for Production

To compile TypeScript files into JavaScript and prepare the project for production, use:

```bash
npm run build
```

After building, you can start the bot with:

```bash
npm start
```

### Heroku Deployment

If you are deploying to Heroku, the project includes a `heroku-postbuild` script that automatically compiles TypeScript files after deployment.

## Bot Commands

The Discord bot provides a set of slash commands for managing tokens and authenticating scripts:

- **/init**: Generates a new embed to control your system.

## Configuration

Configuration for the bot is managed through environment variables specified in the `.env` file and the `config.ts` file located in the `src/config/` directory. This includes settings for the bot's behavior, database connections, and more.

## Database Schema

The system uses a MySQL database to store tokens and related data. The necessary tables are created automatically when the system starts. The schema includes:

- **tokens**: Stores all authentication tokens, along with associated metadata (e.g., IP, port, creation date).

## Development

To contribute to this project or customize it for your needs:

1. **Work in a new branch:**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **After making changes, run the tests to ensure everything works:**

   ```bash
   npm test
   ```

3. **Push your changes and create a pull request.**

## Testing

This project includes unit tests to ensure the reliability of the core functionalities. To run the tests:

```bash
npm run test
```

## Deployment

For deploying the system to a production environment, you may use Docker or a similar containerization tool to package the application. Ensure that the environment variables are properly set for the production environment.

## Acknowledgements

- [Node.js](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Discord.js](https://discord.js.org/)
- [MySQL](https://www.mysql.com/)

## Contact

For any questions or suggestions, feel free to open an issue or contact me via Discord.
