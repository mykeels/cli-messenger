# CLI Messenger

A tool that provides an interface for owning your own chats.

![Cli Messenger Demo](https://repository-images.githubusercontent.com/186613581/bc52ed00-7660-11e9-8412-5ad53b31051a)

## Installation

- Run `npm i -g cli-messenger` or `yarn add global cli-messenger`

## Development

- Clone this repository
- Run `npm install` in this directory
- Run `npm run link`

## Usage

- To start a chat server on localhost, run `cli-messenger`
- To start a chat server with port forwarding to ngrok, run `NGROK=true cli-messenger`. Inspect the terminal for the ngrok address
- To connect with the chat server, run `cli-messenger connect` in a separate terminal.
- To specify a custom server address such as an ngrok address, run `cli-messenger connect <server-address>`

## Environment Variables

- PORT (server): `PORT=4000 cli-messenger` will run the chat server on port `4000`
- NGROK (server): `NGROK=true cli-messenger` will port forward the chat server to [ngrok.io](https://ngrok.io)
- DISPLAY_NAME (client): `DISPLAY_NAME=Mykeels cli-messenger connect` will set my chat display name to `Mykeels`

## Chat Commands

In the chat client, there are commands to control the user's experience. Every command is prefixed with dot (.), so

- `.help` will show all available commands and their usage information
- `.list` will list all users available in the chat
- `.name <name>` will change your chat display name
- `.file` will open a file dialog window, so you can select a file to send