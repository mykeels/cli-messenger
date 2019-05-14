# CLI Messenger (In-Development)

A tool that provides an interface for owning your own chats.

## Development Guide

- Clone this repository
- Run `npm install` in this directory
- Run `npm run link`

## Usage Guide

- To start a chat server on localhost, run `cli-messenger`
- To start a chat server with port forwarding to ngrok, run `NGROK=true cli-messenger`. Inspect the terminal for the ngrok address
- To connect with the chat server, run `cli-messenger connect` in a separate terminal.
- To specify a custom server address such as an ngrok address, run `cli-messenger connect <server-address>`